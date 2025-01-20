/**
 * projet controller
 */

import Stripe from 'stripe';
import { factories } from '@strapi/strapi';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import getRawBody from 'raw-body';
import koaBody from 'koa-body';

const webhookMiddleware = koaBody({
    includeUnparsed: true,
    jsonLimit: '10mb'
});


// Créez une instance de Stripe avec votre clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

// Configuration Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.eu.mailgun.net'
});

// Configuration pour le développement
const isDev = process.env.NODE_ENV === 'development';
const webhookSecret = isDev
    ? process.env.STRIPE_WEBHOOK_SECRET_LOCAL
    : process.env.STRIPE_WEBHOOK_SECRET;

export default factories.createCoreController('api::projet.projet', ({ strapi }) => ({
    async createCheckoutSession(ctx) {
        console.log('🚀 Début createCheckoutSession');
        console.log('📦 Body reçu:', ctx.request.body);

        try {
            const { priceId, projetId } = ctx.request.body;

            // Validation des données
            if (!priceId) {
                console.error('❌ PriceId manquant');
                return ctx.badRequest('PriceId requis');
            }

            if (!projetId) {
                console.error('❌ ProjetId manquant');
                return ctx.badRequest('ProjetId requis');
            }

            // Vérifier que le projet existe et est vendable
            const projet = await strapi.db.query('api::projet.projet').findOne({
                where: { id: projetId }
            });

            if (!projet) {
                console.error('❌ Projet non trouvé');
                return ctx.badRequest('Projet non trouvé');
            }

            if (!projet.vendable) {
                console.error('❌ Projet non vendable');
                return ctx.badRequest('Projet non disponible à la vente');
            }

            console.log('✅ Projet trouvé:', projet);

            // Créer la session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
                metadata: {
                    projetId: projetId
                },
                customer_email: ctx.request.body.email,
            });

            console.log('✅ Session créée:', {
                sessionId: session.id,
                url: session.url
            });

            return ctx.send({ url: session.url });
        } catch (error) {
            console.error('❌ Erreur complète:', error);
            return ctx.internalServerError('Erreur lors de la création de la session');
        }
    },

    // Ajout du handler webhook pour le développement
    async handleWebhook(ctx) {
        try {
            console.log('🎯 Début du traitement webhook');
            const signature = ctx.request.headers['stripe-signature'];
            const rawBody = ctx.request.body?.[Symbol.for('unparsedBody')];

            if (!rawBody) {
                console.error('❌ Le corps brut de la requête est manquant');
                ctx.status = 400;
                return (ctx.body = 'Webhook Error: Le corps brut est requis.');
            }

            // Valider l'événement Stripe
            const event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                webhookSecret
            );
            console.log('✅ Webhook validé avec succès, type:', event.type);

            // Répondre immédiatement pour éviter les timeouts
            ctx.status = 200;
            ctx.body = { received: true };

            // Déléguer le traitement en arrière-plan
            setTimeout(async () => {
                try {
                    switch (event.type) {
                        case 'checkout.session.completed': {
                            console.log('💰 Traitement du checkout complété');
                            const session = event.data.object;

                            console.log('🔍 Session complète:', {
                                id: session.id,
                                customerId: session.customer,
                                amount: session.amount_total,
                                projetId: session.metadata.projetId
                            });

                            if (!session.payment_intent || typeof session.payment_intent !== 'string') {
                                console.error('❌ Payment intent invalide');
                                return;
                            }

                            // Récupération des détails de l'acheteur depuis la session Stripe
                            const buyerEmail = session.customer_email || session.customer_details?.email;
                            const buyerName = session.customer_details?.name;

                            const projet = await strapi.db.query('api::projet.projet').findOne({
                                where: { id: session.metadata.projetId }
                            });

                            console.log('📂 Projet trouvé:', {
                                id: projet.id,
                                titre: projet.titre,
                                vendable: projet.vendable
                            });

                            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                            console.log('PaymentIntent récupéré:', {
                                id: paymentIntent.id,
                                status: paymentIntent.status,
                                latest_charge: paymentIntent.latest_charge
                            });

                            if (!paymentIntent.latest_charge) {
                                console.error('❌ Pas de charge associée au paiement');
                                return;
                            }

                            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
                            const receipt_url = charge.receipt_url;

                            // Mise à jour du projet en base de données
                            await strapi.db.query('api::projet.projet').update({
                                where: { id: session.metadata.projetId },
                                data: {
                                    sold: true,
                                    receiptUrl: receipt_url,
                                    dateSold: new Date(),
                                    buyer_email: buyerEmail,
                                    buyer_name: buyerName,
                                    payment_status: 'completed',
                                    transaction_id: session.payment_intent,
                                    purchase_metadata: {
                                        stripe_session_id: session.id,
                                        customer_locale: session.locale,
                                        payment_method_types: session.payment_method_types,
                                        amount_total: session.amount_total,
                                        currency: session.currency
                                    }
                                }
                            });

                            console.log('📝 Mise à jour du projet avec les données:', {
                                sold: true,
                                buyerEmail,
                                buyerName,
                                dateSold: new Date()
                            });

                            // Envoi de l'email avec Mailgun
                            try {
                                console.log('📧 Préparation de l\'email');
                                await mg.messages.create(process.env.MAILGUN_DOMAIN, {
                                    from: `VGOM Creation <postmaster@${process.env.MAILGUN_DOMAIN}>`,
                                    to: buyerEmail, // Utilisation de l'email de l'acheteur
                                    subject: `Confirmation de votre achat - ${projet.titre}`,
                                    template: "confirmation_achat",
                                    'h:X-Mailgun-Variables': JSON.stringify({
                                        customer_name: buyerName || 'Client', // Utilisation du nom de l'acheteur
                                        projet_title: projet.titre,
                                        amount: (session.amount_total / 100).toFixed(2),
                                        currency: session.currency.toUpperCase(),
                                        receipt_url: receipt_url,
                                        transaction_id: session.payment_intent,
                                        purchase_date: new Date().toLocaleDateString('fr-FR')
                                    })
                                });
                                console.log('✉️ Email de confirmation envoyé');
                            } catch (emailError) {
                                console.error('❌ Erreur email détaillée:', emailError);
                            }

                            break;
                        }

                        case 'payment_intent.payment_failed': {
                            const paymentIntent = event.data.object;
                            console.log('❌ Paiement échoué:', {
                                intentId: paymentIntent.id,
                                error: paymentIntent.last_payment_error?.message
                            });
                            break;
                        }
                        case 'invoice.payment_succeeded':
                            // Paiement réussi
                            const invoice = event.data.object;
                            console.log('✅ Facture payée:', invoice);
                            // Mettre à jour l'abonnement comme actif
                            break;

                        case 'invoice.payment_failed':
                            // Paiement échoué
                            const failedInvoice = event.data.object;
                            console.log('❌ Paiement de la facture échoué:', failedInvoice);
                            break;

                        case 'customer.subscription.updated':
                            // Abonnement mis à jour
                            const updatedSubscription = event.data.object;
                            console.log('🔄 Abonnement mis à jour:', updatedSubscription);
                            break;

                        case 'customer.subscription.deleted':
                            // Abonnement annulé
                            const deletedSubscription = event.data.object;
                            console.log('🗑️ Abonnement annulé:', deletedSubscription);
                            break;

                        default:
                            console.log(`❓ Événement non pris en charge : ${event.type}`);
                    }
                } catch (error) {
                    console.error('❌ Erreur lors du traitement en arrière-plan:', error);
                }
            }, 0);
        } catch (err) {
            console.error('❌ Erreur webhook détaillée:', {
                message: err.message,
                name: err.name,
                type: err.type,
                stack: err.stack
            });
            ctx.status = 400;
            ctx.body = `Webhook Error: ${err.message}`;
        }
    },

    // Méthode pour récupérer les détails de la session Stripe
    async retrieveSession(ctx) {
        console.log('🔍 Récupération de la session Stripe');
        const { sessionId } = ctx.params;

        if (!sessionId) {
            console.error('❌ SessionId manquant');
            return ctx.badRequest('SessionId requis');
        }

        try {
            // Récupérer les détails de la session Stripe
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            console.log('✅ Détails de la session récupérés:', session);

            // Retourner les détails pertinents au frontend
            return ctx.send({
                customer_name: session.customer_details.name,
                amount_total: session.amount_total,
                currency: session.currency,
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de la session:', error);
            return ctx.internalServerError('Impossible de récupérer les détails de la session');
        }
    },

    async create(ctx) {
        const { vendable, price, priceId } = ctx.request.body.data;

        if (vendable && (!price || !priceId)) {
            return ctx.badRequest('Les champs "price" et "priceId" sont obligatoires lorsque le projet est vendable.');
        }

        return await super.create(ctx);
    },

    async update(ctx) {
        const { vendable, price, priceId } = ctx.request.body.data;

        if (vendable && (!price || !priceId)) {
            return ctx.badRequest('Les champs "price" et "priceId" sont obligatoires lorsque le projet est vendable.');
        }

        return await super.update(ctx);
    }
}));
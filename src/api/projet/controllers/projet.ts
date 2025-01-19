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
                }
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
            console.log('📝 Headers reçus:', ctx.request.headers);
            console.log('📝 Signature:', signature);

            // Désactiver le parsing automatique
            ctx.request.body = null;

            // Promesse qui attend que toutes les données soient reçues
            const rawBody = await new Promise<string>((resolve, reject) => {
                let data = '';

                ctx.req.on('data', (chunk: Buffer) => {
                    data += chunk.toString('utf8');
                });

                ctx.req.on('end', () => {
                    if (!data) {
                        console.log('⚠️ Aucune donnée reçue');
                        reject(new Error('Aucune donnée reçue'));
                        return;
                    }
                    console.log('📦 Données reçues, taille:', data.length);
                    resolve(data);
                });

                ctx.req.on('error', (err) => {
                    console.error('❌ Erreur de lecture:', err);
                    reject(err);
                });
            });

            if (typeof rawBody === 'string') {
                console.log('📝 Début du corps brut:', rawBody.substring(0, 50));
            }

            console.log('📦 RawBody complet reçu, taille:', rawBody.length);
            console.log('📝 Début du corps brut:', rawBody.substring(0, 100));
            console.log('🔑 Vérification webhook secret:', !!process.env.STRIPE_WEBHOOK_SECRET_LOCAL);

            const event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                webhookSecret
            );

            console.log('✅ Événement Stripe construit avec succès');
            console.log('📋 Type d\'événement:', event.type);

            // Le reste de votre code reste identique
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
                        break;
                    }

                    // Récupération des détails de l'acheteur depuis la session Stripe
                    const buyerEmail = session.customer_email;
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
                        break;
                    }

                    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
                    const receipt_url = charge.receipt_url;

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

                    try {
                        console.log('📧 Préparation de l\'email');
                        console.log('📧 Variables email:', {
                            from: `VGOM Creation <postmaster@${process.env.MAILGUN_DOMAIN}>`,
                            to: buyerEmail,
                            template: "confirmation_achat"
                        });
                        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
                            from: `VGOM Creation <postmaster@${process.env.MAILGUN_DOMAIN}>`,
                            to: buyerEmail,  // Utilisation de l'email de l'acheteur
                            subject: `Confirmation de votre achat - ${projet.titre}`,
                            template: "confirmation_achat",
                            'h:X-Mailgun-Variables': JSON.stringify({
                                customer_name: buyerName,  // Utilisation du nom de l'acheteur
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
                        console.error('❌ Erreur email détaillée:', {
                            message: emailError.message,
                            code: emailError.code,
                            details: emailError.details,
                            stack: emailError.stack,
                            mailgunDomain: process.env.MAILGUN_DOMAIN,
                            hasMailgunKey: !!process.env.MAILGUN_API_KEY
                        });
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
            }
            console.log('✅ Traitement webhook terminé avec succès');
            return ctx.send({ received: true });
        } catch (err) {
            console.error('❌ Erreur webhook détaillée:', {
                message: err.message,
                name: err.name,
                type: err.type,
                stack: err.stack,
                hasSignature: !!ctx.request.headers['stripe-signature'],
                hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET_LOCAL
            });
            return ctx.badRequest(`Webhook Error: ${err.message}`);
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
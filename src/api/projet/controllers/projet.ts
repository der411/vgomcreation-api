/**
 * projet controller
 */

import Stripe from 'stripe';
import { factories } from '@strapi/strapi';

// Créez une instance de Stripe avec votre clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
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
            const projet = await strapi.entityService.findOne('api::projet.projet', projetId);

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
        const signature = ctx.request.headers['stripe-signature'];
        console.log('🎯 Webhook reçu');

        try {
            const event = stripe.webhooks.constructEvent(
                ctx.request.body,
                signature,
                webhookSecret
            );

            console.log('📦 Type d\'événement:', event.type);

            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    console.log(`Email du client : ${session.customer_email}`);
                    console.log(`ID du projet : ${session.metadata.projetId}`);
                    console.log('💰 Paiement réussi:', {
                        sessionId: session.id,
                        amount: session.amount_total / 100
                    });
                    // Mettez à jour votre base de données ici
                    await strapi.entityService.update('api::projet.projet', session.metadata.projetId, {
                        data: { sold: true },
                    });
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

            return ctx.send({ received: true });
        } catch (err) {
            console.error('❌ Erreur webhook:', err);
            return ctx.badRequest('Webhook Error');
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
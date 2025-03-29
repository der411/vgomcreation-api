// src/api/projet/routes/01-custom-routes.ts
export default {
    routes: [
        {
            method: 'POST',
            path: '/projets/create-checkout-session',
            handler: 'api::projet.projet.createCheckoutSession',
            config: {
                auth: false,
            }
        },
        {
            method: 'POST',
            path: '/projets/webhook',
            handler: 'api::projet.projet.handleWebhook',
            config: {
                auth: false,
                middlewares: []
            }
        },
        {
            method: 'GET',
            path: '/projets/retrieve-session/:sessionId',
            handler: 'api::projet.projet.retrieveSession',
            config: {
                auth: false,
            }
        },
        {
            method: 'GET',
            path: '/api/projets/payment-status/:sessionId',
            handler: 'projet.getPaymentStatus',
            config: {
                auth: false // Permet la vérification sans être connecté
            },
        }
    ]
};
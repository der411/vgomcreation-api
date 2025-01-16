export default {
    routes: [
        {
            method: 'POST',
            path: '/projets/create-checkout-session',
            handler: 'projet.createCheckoutSession',
            config: {
                auth: false, // Modifiez selon vos besoins d'authentification
            },
        },
        {
            method: 'POST',
            path: '/webhook',
            handler: 'projet.handleWebhook',
            config: {
                auth: false,
                // Désactiver le body parser par défaut car Stripe nécessite le body brut
                middlewares: []
            }
        },
        {
            method: 'GET',
            path: '/projets/retrieve-session/:sessionId',
            handler: 'projet.retrieveSession',
            config: {
                auth: false, // Modifiez selon vos besoins d'authentification
            },
        },
    ],
};

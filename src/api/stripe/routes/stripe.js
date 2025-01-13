export default {
    routes: [
        {
            method: 'POST',
            path: '/create-checkout-session',
            handler: 'stripe.createCheckoutSession',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/webhook',
            handler: 'stripe.handleWebhook',
            config: {
                policies: [],
                middlewares: [],
            },
        },

    ],
};

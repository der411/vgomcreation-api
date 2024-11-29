export default {
    routes: [
        {
            method: 'POST',
            path: '/payment-intent',
            handler: 'payment.createPaymentIntent',
            config: {
                policies: [], // Vous pouvez ajouter des politiques de sécurité ici
                middlewares: [], // Ajoutez des middlewares si nécessaire
            },
        },
    ],
};

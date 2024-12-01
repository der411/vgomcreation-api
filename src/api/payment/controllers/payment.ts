const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    async createPaymentIntent(ctx) {
        const { amount, currency } = ctx.request.body;

        if (!amount || !currency) {
            ctx.badRequest('Le montant ou la devise est manquant.');
            return;
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount, // Le montant doit être en centimes
                currency,
                payment_method_types: ['card'], // Méthodes de paiement autorisées
            });

            ctx.send({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            console.error('Erreur Stripe :', error.message);
            ctx.badRequest('Erreur lors de la création du Payment Intent.', { error: error.message });
        }
    },
};



const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    async createPaymentIntent(ctx) {
        const { amount, currency } = ctx.request.body;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Convertir en centimes
                currency,
                payment_method_types: ['card'],
            });

            ctx.send({ clientSecret: paymentIntent.client_secret });
        } catch (err) {
            ctx.badRequest('Erreur lors de la création du Payment Intent', { error: err.message });
        }
    },
};

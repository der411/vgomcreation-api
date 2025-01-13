import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2022-11-15',
});

export default {
    async createCheckoutSession(items: { priceId: string; quantity: number }[], successUrl: string, cancelUrl: string) {
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item) => ({
                price: item.priceId,
                quantity: item.quantity,
            })),
            mode: 'subscription', // Pour abonnement
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
    },
};

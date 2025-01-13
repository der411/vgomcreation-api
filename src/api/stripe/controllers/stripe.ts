import Stripe from 'stripe';
import { factories } from '@strapi/strapi';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2022-11-15',
});

// Interface pour le modèle de commande
interface Order {
    id: number;
    status: string;
    total: number;
    stripeSessionId: string;
    products: any[];
    customer: any;
}

export default factories.createCoreController('api::stripe.stripe', ({ strapi }) => ({
    async createCheckoutSession(ctx) {
        const { items, customerId } = ctx.request.body;

        if (!items || items.length === 0) {
            return ctx.badRequest('No items provided for checkout.');
        }

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: items.map((item: any) => ({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: item.price * 100,
                    },
                    quantity: item.quantity,
                })),
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`,
                metadata: {
                    customerId: customerId
                }
            });

            // Créer une commande en statut "pending"
            await strapi.entityService.create('api::order.order', {
                data: {
                    status: 'pending',
                    stripeSessionId: session.id,
                    total: items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
                    products: items,
                    customer: customerId,
                }
            });

            ctx.send({ url: session.url });
        } catch (error) {
            console.error('Stripe error:', error);
            ctx.internalServerError('Failed to create checkout session');
        }
    },

    async handleWebhook(ctx) {
        const sig = ctx.request.headers['stripe-signature'];
        const rawBody = ctx.request.rawBody;

        if (!rawBody) {
            console.error('Missing rawBody in request.');
            return ctx.badRequest('Invalid webhook payload');
        }

        try {
            const event = stripe.webhooks.constructEvent(
                rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET as string
            );

            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    await handlePaymentSuccess(session);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const session = event.data.object as Stripe.PaymentIntent;
                    await handlePaymentFailure(session);
                    break;
                }
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            ctx.send({ received: true });
        } catch (err) {
            console.error('Webhook error:', err.message);
            ctx.status = 400;
            ctx.body = 'Webhook error';
        }
    },
}));

// Fonction pour gérer un paiement réussi
async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
    try {
        // Trouver la commande correspondante
        const orders = await strapi.entityService.findMany('api::order.order', {
            filters: { stripeSessionId: session.id }
        });

        if (!orders || orders.length === 0) {
            throw new Error(`No order found for session ${session.id}`);
        }

        const order = orders[0];

        // Mettre à jour le statut de la commande
        await strapi.entityService.update('api::order.order', order.id, {
            data: {
                status: 'completed',
                paymentDate: new Date(),
                paymentId: session.payment_intent as string
            }
        });

        // Mettre à jour le stock des produits
        if (order.products) {
            for (const item of order.products) {
                const product = await strapi.entityService.findOne('api::product.product', item.id);
                if (product) {
                    await strapi.entityService.update('api::product.product', item.id, {
                        data: {
                            stock: product.stock - item.quantity
                        }
                    });
                }
            }
        }

        // Envoyer un email de confirmation au client
        await sendOrderConfirmationEmail(order);

    } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
    }
}

// Fonction pour gérer un paiement échoué
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    try {
        // Trouver la commande correspondante
        const orders = await strapi.entityService.findMany('api::order.order', {
            filters: { paymentId: paymentIntent.id }
        });

        if (orders && orders.length > 0) {
            const order = orders[0];
            // Mettre à jour le statut de la commande
            await strapi.entityService.update('api::order.order', order.id, {
                data: {
                    status: 'failed',
                    failureReason: paymentIntent.last_payment_error?.message
                }
            });
        }
    } catch (error) {
        console.error('Error handling payment failure:', error);
        throw error;
    }
}

// Fonction pour envoyer un email de confirmation
async function sendOrderConfirmationEmail(order: Order) {
    try {
        await strapi.plugins['email'].services.email.send({
            to: order.customer.email,
            subject: 'Confirmation de votre commande',
            html: `
                <h1>Merci pour votre commande !</h1>
                <p>Votre commande #${order.id} a été confirmée.</p>
                <p>Montant total : ${order.total}€</p>
                <p>Nous vous tiendrons informé du suivi de votre commande.</p>
            `
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}
import express from 'express';
import Stripe from 'stripe';
import supabase from '../utils/supabase.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// Config
const CREDIT_PACKAGES = {
    'micro': 60,
    'starter': 500,
    'creator': 1200,
    'agency': 3500
};

const SUBSCRIPTION_PLANS = {
    'sub_lite': { credits: 500, months: 1 },
    'sub_pro': { credits: 2500, months: 1 },
    'sub_agency': { credits: 6000, months: 1 }
};

// Helper: Grant Credits
async function grantCredits(userId, planId, credits, isSubscription, chargeId) {
    try {
        const { data: userData } = await supabase.from('users').select('credits').eq('id', userId).single();
        const currentCredits = userData?.credits || 0;

        const updates = {
            credits: currentCredits + credits,
            updated_at: new Date().toISOString()
        };

        if (isSubscription) {
            updates.plan = planId;
            updates.status = 'active';
        }

        await supabase.from('users').update(updates).eq('id', userId);
        await supabase.from('transactions').insert({
            user_id: userId, plan_id: planId, credits, charge_id: chargeId,
            provider: 'stripe', type: isSubscription ? 'subscription' : 'topup',
            status: 'completed', created_at: new Date().toISOString()
        });
        console.log(`✅ Granted ${credits} credits to ${userId}`);
    } catch (err) {
        console.error('Grant Credits Error:', err);
    }
}

// POST /api/stripe-charge
router.post('/stripe-charge', async (req, res) => {
    try {
        const { email, amount, userId, planId, paymentMethodId, currency } = req.body;

        if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Server Stripe Key Missing' });
        if (!amount || !userId || !planId) return res.status(400).json({ error: 'Missing required parameters' });

        const isSubscription = planId.startsWith('sub_');
        const creditsToAdd = isSubscription ? SUBSCRIPTION_PLANS[planId]?.credits : CREDIT_PACKAGES[planId];

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency || 'usd',
            payment_method: paymentMethodId,
            confirm: !!paymentMethodId,
            automatic_payment_methods: paymentMethodId ? undefined : { enabled: true },
            metadata: {
                userId, planId, credits: String(creditsToAdd || 0), type: isSubscription ? 'subscription' : 'topup'
            },
            receipt_email: email,
        });

        if (paymentIntent.status === 'succeeded') {
            await grantCredits(userId, planId, creditsToAdd || 0, isSubscription, paymentIntent.id);
            return res.status(200).json({ status: 'successful', chargeId: paymentIntent.id, credits: creditsToAdd });
        }

        return res.status(200).json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });

    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/stripe-webhook
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            event = req.body; // Dev mode fallback
        } else {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const { userId, planId, credits, type } = event.data.object.metadata;
        if (userId) await grantCredits(userId, planId, parseInt(credits), type === 'subscription', event.data.object.id);
    }

    res.json({ received: true });
});

export default router;

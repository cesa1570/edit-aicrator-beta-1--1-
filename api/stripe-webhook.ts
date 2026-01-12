import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

// Webhook secret from Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Credit mappings (Synced)
const CREDIT_PACKAGES: Record<string, number> = {
    'micro': 60,
    'starter': 500,
    'creator': 1200,
    'agency': 3500
};

const SUBSCRIPTION_PLANS: Record<string, { credits: number, months: number }> = {
    'sub_lite': { credits: 500, months: 1 },
    'sub_pro': { credits: 2500, months: 1 },
    'sub_agency': { credits: 6000, months: 1 }
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
        const rawBody = await getRawBody(req);
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } else {
            event = JSON.parse(rawBody.toString());
            console.warn('⚠️ Webhook secret not configured - skipping signature verification');
        }
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
            break;
        case 'checkout.session.completed':
            await handleCheckoutSession(event.data.object as Stripe.Checkout.Session);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
}

const mapAmountToPlan = (amount: number, mode?: string): string | null => {
    if (amount === 39900 || amount === 999) return 'sub_lite';
    if (amount === 99900 || amount === 2499) return 'sub_pro';
    if (amount === 249000 || amount === 6999) return 'sub_agency';
    // Credits
    if (amount === 6900 || amount === 199) return 'micro';
    if (amount === 49900 || amount === 1299) return 'starter';
    if (amount === 99900 || amount === 2499) return 'creator';
    if (amount === 249900 || amount === 6499) return 'agency';

    if (amount === 99900 && mode === 'payment') return 'creator';
    if (amount === 99900 && mode === 'subscription') return 'sub_pro';
    return null;
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;
    const amount = session.amount_total;

    if (!userId || !amount) return;

    const planId = mapAmountToPlan(amount, session.mode);
    if (!planId) return;

    const isSubscription = planId.startsWith('sub_');
    const credits = isSubscription ? SUBSCRIPTION_PLANS[planId].credits : CREDIT_PACKAGES[planId];

    await processGrantCredits(userId, planId, credits, isSubscription, session.payment_intent as string || session.id, amount / 100, session.currency || 'usd');
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { userId, planId, credits } = paymentIntent.metadata;
    if (!userId || !planId) return;

    const creditsToAdd = parseInt(credits) || 0;
    const isSubscription = planId.startsWith('sub_');

    await processGrantCredits(userId, planId, creditsToAdd, isSubscription, paymentIntent.id, paymentIntent.amount / 100, paymentIntent.currency);
}

// Common function for granting credits via Supabase
async function processGrantCredits(userId: string, planId: string, credits: number, isSubscription: boolean, chargeId: string, amount: number, currency: string) {
    try {
        // 1. Fetch
        const { data: userData } = await supabaseAdmin.from('users').select('credits').eq('id', userId).single();
        const currentCredits = userData?.credits || 0;

        // 2. Prepare Updates
        const updates: any = {
            credits: currentCredits + credits,
            updated_at: new Date().toISOString()
        };

        if (isSubscription) {
            //  const planDetails = SUBSCRIPTION_PLANS[planId];
            //  const now = new Date();
            //  const nextMonth = new Date(now.setMonth(now.getMonth() + (planDetails?.months || 1)));
            updates.plan = planId;
            //  updates.current_period_end = nextMonth.toISOString();
        }

        // 3. Update User
        await supabaseAdmin.from('users').update(updates).eq('id', userId);

        // 4. Log Transaction
        await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            plan_id: planId,
            credits,
            charge_id: chargeId,
            provider: 'stripe',
            type: isSubscription ? 'subscription' : 'topup',
            status: 'completed',
            amount,
            currency,
            created_at: new Date().toISOString(),
            date: new Date().toISOString()
        });

        console.log(`✅ Granted ${credits} credits to ${userId}`);
    } catch (error) {
        console.error('Failed to grant credits:', error);
    }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { userId, planId } = paymentIntent.metadata;
    if (!userId) return;

    // Log failed
    await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        plan_id: planId,
        charge_id: paymentIntent.id,
        provider: 'stripe',
        status: 'failed',
        error: paymentIntent.last_payment_error?.message || 'Payment failed',
        created_at: new Date().toISOString()
    });
}

async function getRawBody(req: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk: any) => { data += chunk; });
        req.on('end', () => { resolve(Buffer.from(data)); });
        req.on('error', reject);
    });
}

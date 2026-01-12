import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// Initialize Stripe lazily inside handler to prevent build/init crashes
let stripeInstance: Stripe | null = null;

const getStripeInstance = () => {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is missing');
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16'
        });
    }
    return stripeInstance;
};

// Pricing Configurations (Synced with Frontend)
const CREDIT_PACKAGES: Record<string, number> = {
    'micro': 60,
    'starter': 500,
    'creator': 1200,
    'agency': 3500
};

const SUBSCRIPTION_PLANS: Record<string, { credits: number, months: number }> = {
    'sub_starter': { credits: 100, months: 1 },
    'sub_growth': { credits: 350, months: 1 },
    'sub_influencer': { credits: 800, months: 1 },
    'sub_ultra': { credits: 2000, months: 1 }
};

export default async function handler(req: any, res: any) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, amount, userId, planId, paymentMethodId, currency } = req.body;

        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: 'Stripe Secret Key not configured in server.' });
        }

        if (!amount || !userId || !planId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Determine credits
        const isSubscription = planId.startsWith('sub_');
        const creditsToAdd = isSubscription ? SUBSCRIPTION_PLANS[planId]?.credits : CREDIT_PACKAGES[planId];

        if (!creditsToAdd && creditsToAdd !== 0) {
            console.warn(`Unknown planId: ${planId}`);
        }

        // Create Payment Intent
        const stripe = getStripeInstance();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount is already in smallest unit from frontend
            currency: currency || 'usd', // Default to USD if not specified
            payment_method: paymentMethodId,
            confirm: paymentMethodId ? true : false,
            automatic_payment_methods: paymentMethodId ? undefined : {
                enabled: true,
            },
            metadata: {
                userId,
                planId,
                credits: String(creditsToAdd || 0),
                type: isSubscription ? 'subscription' : 'topup'
            },
            receipt_email: email,
            return_url: 'https://lazyautocreator.xyz/billing?status=complete'
        });

        // If payment is already successful (auto-confirmed)
        if (paymentIntent.status === 'succeeded') {
            await grantCredits(userId, planId, creditsToAdd || 0, isSubscription, paymentIntent.id);
            return res.status(200).json({
                status: 'successful',
                chargeId: paymentIntent.id,
                credits: creditsToAdd
            });
        }

        // Return client secret for frontend to complete payment
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            nextAction: paymentIntent.next_action
        });

    } catch (error: any) {
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// Helper function to grant credits
async function grantCredits(userId: string, planId: string, credits: number, isSubscription: boolean, chargeId: string) {
    // 1. Get current user data
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

    // Default to 0 if not found
    const currentCredits = userData?.credits || 0;

    // Prepare updates
    const updates: any = {
        credits: currentCredits + credits,
        updated_at: new Date().toISOString()
    };

    if (isSubscription) {
        // const planDetails = SUBSCRIPTION_PLANS[planId];
        // const now = new Date();
        // const nextMonth = new Date(now.setMonth(now.getMonth() + (planDetails?.months || 1)));
        updates.plan = planId;
        // updates.current_period_end = nextMonth.toISOString();
    }

    // 2. Update User
    await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', userId);

    // 3. Record transaction
    await supabaseAdmin
        .from('transactions')
        .insert({
            user_id: userId,
            plan_id: planId,
            credits,
            charge_id: chargeId,
            provider: 'stripe',
            type: isSubscription ? 'subscription' : 'topup',
            status: 'completed',
            created_at: new Date().toISOString(),
            date: new Date().toISOString()
        });
}

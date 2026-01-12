import Omise from 'omise';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// Initialize Omise with Secret Key
const omise = Omise({
    'publicKey': process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
    'secretKey': process.env.OMISE_SECRET_KEY,
});

// Pricing Configurations (Synced with Frontend)
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
        const { email, name, amount, token, source, userId, planId } = req.body;

        if (!amount || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Determine if Top-up or Subscription
        const isSubscription = planId.startsWith('sub_');
        const creditsToAdd = isSubscription ? SUBSCRIPTION_PLANS[planId]?.credits : CREDIT_PACKAGES[planId];

        if (!creditsToAdd && creditsToAdd !== 0) {
            console.warn(`Unknown planId: ${planId}, proceeding without credit lookup logic check if needed.`);
        }

        let charge;

        // Create Charge
        const chargePayload: any = {
            amount: Math.round(amount * 100), // Convert THB to Satang
            currency: 'thb',
            return_uri: 'https://lazyautocreator.xyz/billing?status=complete',
            description: `Charge for user ${email} (Plan: ${planId})`,
            metadata: {
                userId,
                planId,
                credits: creditsToAdd || 0,
                type: isSubscription ? 'subscription' : 'topup'
            }
        };

        if (token) {
            chargePayload.card = token; // Credit Card
        } else if (source) {
            chargePayload.source = source; // PromptPay / TrueMoney
        } else {
            return res.status(400).json({ error: 'Missing token or source' });
        }

        try {
            charge = await omise.charges.create(chargePayload);
        } catch (omiseError: any) {
            console.error('Omise Charge Creation Failed:', omiseError);
            return res.status(400).json({ error: omiseError.message || 'Payment refused' });
        }

        // Handle PromptPay (Pending status)
        if (charge.status === 'pending' && source) {
            return res.status(200).json({
                status: 'pending',
                chargeId: charge.id,
                authorizeUri: charge.authorize_uri
            });
        }

        // Handle Credit Card (Successful status)
        if (charge.status === 'successful') {
            await processGrantCredits(userId, planId, creditsToAdd, isSubscription, charge.id, 'omise');
            return res.status(200).json({ status: 'successful', chargeId: charge.id, credits: creditsToAdd });
        } else {
            return res.status(400).json({ error: 'Charge failed or pending', status: charge.status });
        }

    } catch (error: any) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function processGrantCredits(userId: string, planId: string, credits: number, isSubscription: boolean, chargeId: string, provider: string) {
    // 1. Get current user data
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

    const currentCredits = userData?.credits || 0;

    // 2. Prepare Updates
    const updates: any = {
        credits: currentCredits + credits,
        updated_at: new Date().toISOString(),
        last_charge_id: chargeId,
        payment_provider: provider
    };

    if (isSubscription) {
        // const planDetails = SUBSCRIPTION_PLANS[planId];
        // const now = new Date();
        // const nextMonth = new Date(now.setMonth(now.getMonth() + (planDetails?.months || 1)));
        updates.plan = planId;
        updates.status = 'active';
        // updates.current_period_end = nextMonth.toISOString();
    }

    // 3. Update User
    await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', userId);

    // 4. Record transaction (optional if you want to log it)
}

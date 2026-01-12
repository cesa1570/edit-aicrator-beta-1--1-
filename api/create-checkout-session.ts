import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use latest or matching version
});

// Inline types for Vercel
interface VercelRequest {
    method?: string;
    body: any;
}

interface VercelResponse {
    setHeader(name: string, value: string): VercelResponse;
    status(code: number): VercelResponse;
    json(data: any): void;
    end(): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
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
        const { priceId, userId, email, returnUrl } = req.body;

        if (!priceId || !userId || !email) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            customer_email: email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${returnUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}/billing?canceled=true`,
            metadata: {
                userId: userId, // Pass userId to webhook
            },
        });

        return res.status(200).json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Session Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

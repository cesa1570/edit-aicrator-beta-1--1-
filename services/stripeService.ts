// Stripe Payment Service
// This service handles Stripe.js integration for payment processing

const STRIPE_PUBLIC_KEY = typeof window !== 'undefined'
    ? localStorage.getItem('stripe_public_key') || import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51Sg6hjChLIAUz0sESgP9HfMSMtIMtklqkMMoWSI0Lm5gcjH8bDPZv2DZ0AQ35Z5ecmPZA3KYXu5jYh54iWwnjVOr00N8RT0ZYD'
    : import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51Sg6hjChLIAUz0sESgP9HfMSMtIMtklqkMMoWSI0Lm5gcjH8bDPZv2DZ0AQ35Z5ecmPZA3KYXu5jYh54iWwnjVOr00N8RT0ZYD';

let stripePromise: Promise<any> | null = null;

// Load Stripe.js script
export const loadStripeScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Window not available'));
            return;
        }

        // Check if already loaded
        if ((window as any).Stripe) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Stripe.js'));
        document.head.appendChild(script);
    });
};

// Get Stripe instance
export const getStripe = async () => {
    if (!stripePromise) {
        await loadStripeScript();
        const publicKey = getStripePublicKey();
        if (!publicKey) {
            throw new Error('Stripe Public Key not configured');
        }
        stripePromise = Promise.resolve((window as any).Stripe(publicKey));
    }
    return stripePromise;
};

// Set Stripe public key
export const setStripePublicKey = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('stripe_public_key', key);
        stripePromise = null; // Reset to reload with new key
    }
};

// Get Stripe public key
export const getStripePublicKey = (): string => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('stripe_public_key') || import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51Sg6hjChLIAUz0sESgP9HfMSMtIMtklqkMMoWSI0Lm5gcjH8bDPZv2DZ0AQ35Z5ecmPZA3KYXu5jYh54iWwnjVOr00N8RT0ZYD';
    }
    return 'pk_live_51Sg6hjChLIAUz0sESgP9HfMSMtIMtklqkMMoWSI0Lm5gcjH8bDPZv2DZ0AQ35Z5ecmPZA3KYXu5jYh54iWwnjVOr00N8RT0ZYD';
};

// Credit packages (same pricing structure)
export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number; // in cents (USD)
    priceThb: number; // in satang (THB)
    displayPrice: string; // Default display price (USD)
    displayPriceThb: string; // THB display price
    stripePriceId?: string; // Optional Stripe Price ID for subscriptions
    paymentLink?: string; // Optional direct Payment Link (buy.stripe.com)
}

// Subscription Plans (Monthly) - Psychological Pricing
export const SUBSCRIPTION_PLANS = [
    {
        id: 'sub_starter',
        name: 'Starter',
        price: 900, // $9.00
        priceThb: 32900, // ~329 THB
        displayPrice: '$9',
        displayPriceThb: '฿329',
        tokens: 100,
        paymentLink: 'https://buy.stripe.com/bJe3cuau57qw5aU4Vc5Rm08', // Starter $9 Link
        features: [
            '100 Credits / Month',
            'Create ~10 Shorts',
            'Shorts Only (No Long Form)',
            'No Watermark',
            'Standard AI Voices',
            '720p HD Export'
        ],
        recommend: false
    },
    {
        id: 'sub_growth',
        name: 'Pro',
        price: 2500, // $25.00
        priceThb: 89900, // ~899 THB
        displayPrice: '$25',
        displayPriceThb: '฿899',
        tokens: 350,
        paymentLink: 'https://buy.stripe.com/8x214m45HeSY7j2evM5Rm09', // Pro $25 Link
        features: [
            '350 Credits / Month',
            'Create ~35 Shorts',
            'Unlock Long Form Video',
            'No Watermark',
            'Ultra-Realistic AI Voices',
            '1080p Full HD Export'
        ],
        recommend: true
    },
    {
        id: 'sub_influencer',
        name: 'Pro Max',
        price: 4900, // $49.00
        priceThb: 179000, // ~1,790 THB
        displayPrice: '$49',
        displayPriceThb: '฿1,790',
        tokens: 800,
        paymentLink: 'https://buy.stripe.com/8x25kCby9fX28n6gDU5Rm0a', // Pro Max $49 Link
        features: [
            '800 Credits / Month',
            'Create ~80 Shorts',
            'Unlock Long Form Video',
            'No Watermark',
            'Premium AI Voices + Clones',
            '4K Ultra HD Export'
        ],
        recommend: false
    },
    {
        id: 'sub_ultra',
        name: 'Ultra',
        price: 9900, // $99.00
        priceThb: 359000, // ~3,590 THB
        displayPrice: '$99',
        displayPriceThb: '฿3,590',
        tokens: 2000,
        paymentLink: 'https://buy.stripe.com/fZu6oGau54ek32MdrI5Rm0b', // Ultra $99 Link
        features: [
            '2,000 Credits / Month',
            'Create ~200 Shorts',
            'Unlock Long Form Video',
            'Long-form & UGC Video',
            'Dedicated Account Manager'
        ],
        recommend: false
    }
];

// Credit Packages (One-time purchase)
export const CREDIT_PACKAGES: CreditPackage[] = [
    { id: 'micro', name: 'Micro (Trial)', credits: 60, price: 199, priceThb: 6900, displayPrice: '$1.99', displayPriceThb: '฿69' },
    { id: 'starter', name: 'Starter', credits: 500, price: 1299, priceThb: 49900, displayPrice: '$12.99', displayPriceThb: '฿499' },
    { id: 'creator', name: 'Creator', credits: 1200, price: 2499, priceThb: 99900, displayPrice: '$24.99', displayPriceThb: '฿999' },
    { id: 'agency', name: 'Agency', credits: 3500, price: 6499, priceThb: 249900, displayPrice: '$64.99', displayPriceThb: '฿2,499' },
];

// Helper to get price details based on currency
export const getPriceDetails = (item: any, currency: 'USD' | 'THB') => {
    if (currency === 'THB') {
        return {
            price: item.priceThb, // Already in smallest unit (satang)
            display: item.displayPriceThb
        };
    }
    return {
        price: item.price, // Already in smallest unit (cents)
        display: item.displayPrice
    };
};

export const CREDIT_COSTS = {
    SHORTS: 10,
    LONG_VIDEO: 30,
    TEXT_TO_VIDEO: 50,
    VIDEO_GENERATION: 10,
};

// Create Payment Intent (calls backend)
export const createPaymentIntent = async (packageId: string, amount: number, currency: string = 'usd'): Promise<{ clientSecret: string; error?: string }> => {
    try {
        const { supabase } = await import('./supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) throw new Error('User must be logged in');

        const response = await fetch('/api/stripe-charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                planId: packageId,
                amount,
                currency, // Pass currency to backend
                userId: session.user.id,
                email: session.user.email
            })
        });

        let data;
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse response:', text);
            throw new Error(`Server Error: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create payment intent');
        }

        return { clientSecret: data.clientSecret };
    } catch (err: any) {
        console.error('Payment intent error:', err);
        return { clientSecret: '', error: err.message };
    }
};

// Confirm card payment
export const confirmCardPayment = async (clientSecret: string, cardElement: any): Promise<{ success: boolean; error?: string }> => {
    try {
        const stripe = await getStripe();
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (paymentIntent.status === 'succeeded') {
            return { success: true };
        }

        return { success: false, error: 'Payment not completed' };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

// Confirm PromptPay payment
export const confirmPromptPayPayment = async (clientSecret: string, billingDetails: any): Promise<{ success: boolean; error?: string }> => {
    try {
        const stripe = await getStripe();
        const { error, paymentIntent } = await stripe.confirmPromptPayPayment(clientSecret, {
            payment_method: {
                billing_details: billingDetails
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // PromptPay usually stays in 'processing' or requires redirect, but if successful immediately:
        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
            return { success: true };
        }

        return { success: false, error: 'Payment not completed: ' + paymentIntent.status };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

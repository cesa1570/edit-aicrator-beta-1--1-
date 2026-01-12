import { supabase } from './supabase';

export const chargeOmise = async (payload: {
    amount: number,
    token?: string,
    source?: string,
    planId: string
}) => {
    // payload: { amount, token/source, planId }
    // Token = credit card token from Omise.js
    // Source = promptpay source from Omise.js

    // We get auth token from Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("User must be logged in");

    const response = await fetch('/api/omise-charge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
            ...payload,
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
    }
    return data;
};

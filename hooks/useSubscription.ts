import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from './useAdmin';

export interface SubscriptionData {
    plan: 'free' | 'pro' | 'early_bird' | 'lifetime' | 'admin';
    status: 'active' | 'expired' | 'cancelled';
    currentPeriodEnd?: Date | null;
    currentPeriodStart?: Date | null;
}

export const useSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAdmin(); // Use the admin hook

    useEffect(() => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        // Initial Fetch
        const fetchSub = async () => {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.uid)
                .single();

            if (data) {
                setSubscription({
                    plan: data.plan || 'free',
                    status: data.status || 'active',
                    currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
                    currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : null,
                    // Map other fields if needed
                });
            } else {
                // Determine if we should create a record or just default?
                // For now default.
                setSubscription({
                    plan: 'free',
                    status: 'active',
                    currentPeriodEnd: null,
                    currentPeriodStart: new Date(),
                });
            }
            setLoading(false);
        };

        fetchSub();

        // Realtime Subscription
        const channel = supabase
            .channel('public:users:' + user.uid)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${user.uid}`
                },
                (payload) => {
                    const data = payload.new;
                    setSubscription({
                        plan: data.plan || 'free',
                        status: data.status || 'active',
                        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
                        currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : null,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Grant Pro access if the plan is correct OR if the user is an Admin
    let effectiveSubscription = subscription;

    // Override for Admin
    if (isAdmin) {
        effectiveSubscription = {
            plan: 'admin',
            status: 'active',
            currentPeriodStart: subscription?.currentPeriodStart || new Date(), // Use existing or now
            currentPeriodEnd: null // Lifetime
        };
    }

    const isPro = isAdmin || (subscription?.plan !== 'free' && subscription?.status === 'active');
    const isFree = !isPro;

    return {
        subscription: effectiveSubscription,
        loading,
        isPro,
        isFree,
    };
};

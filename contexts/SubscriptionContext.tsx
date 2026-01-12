import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

export interface SubscriptionData {
    plan: 'free' | 'pro' | 'early_bird' | 'lifetime' | 'admin' | 'sub_starter' | 'sub_growth' | 'sub_influencer' | 'sub_ultra';
    status: 'active' | 'expired' | 'cancelled' | 'banned';
    currentPeriodEnd?: Date | null;
    currentPeriodStart?: Date | null;
    stripeCustomerId?: string | null;
    credits: number;
}

interface SubscriptionContextType {
    subscription: SubscriptionData | null;
    loading: boolean;
    isPro: boolean;
    isFree: boolean;
    isBanned: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Admin Emails List
const ADMIN_EMAILS = [
    'leeduck15@gmail.com',
    'admin@autocreator.com',
    'tanaponlomrit47110@gmail.com'
];

interface SubscriptionProviderProps {
    children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;

    useEffect(() => {
        let mounted = true;

        const loadSubscription = async () => {
            if (!user) {
                if (mounted) {
                    setSubscription(null);
                    setLoading(false);
                }
                return;
            }

            // 1. Initial Fetch
            const fetchProfile = async () => {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('plan, credits, status, current_period_end, current_period_start, stripe_customer_id')
                        .eq('id', user.uid)
                        .maybeSingle(); // Use maybeSingle instead of single to handle missing rows

                    if (error) {
                        // Handle different error types
                        if (error.code === 'PGRST116') {
                            // Row not found - use defaults
                            console.debug('User profile not found, using defaults');
                        } else if (error.code === '42P01') {
                            // Table doesn't exist
                            console.warn('Users table not found. Please create the users table in Supabase.');
                        } else if (error.code === '42703') {
                            // Column doesn't exist
                            console.warn('Users table schema mismatch. Please check table columns.');
                        } else {
                            // Other errors - log but continue with defaults
                            console.debug('Subscription fetch warning:', error.message);
                        }
                    }

                    if (mounted) {
                        // Always set subscription with defaults, even if query failed
                        setSubscription({
                            plan: (data?.plan as any) || 'free',
                            status: (data?.status as any) || 'active',
                            credits: data?.credits ?? 0,
                            currentPeriodStart: data?.current_period_start ? new Date(data.current_period_start) : null,
                            currentPeriodEnd: data?.current_period_end ? new Date(data.current_period_end) : null,
                            stripeCustomerId: data?.stripe_customer_id || null
                        });
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Loader failed:', err);
                    // Set defaults on error
                    if (mounted) {
                        setSubscription({
                            plan: 'free',
                            status: 'active',
                            credits: 0,
                            currentPeriodStart: null,
                            currentPeriodEnd: null,
                            stripeCustomerId: null
                        });
                        setLoading(false);
                    }
                }
            };

            await fetchProfile();

            // 2. Realtime Subscription (Listen for Credit Updates)
            // Only subscribe if user exists and table is accessible
            let channel: any = null;
            try {
                channel = supabase
                    .channel(`users:${user.uid}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'users',
                            filter: `id=eq.${user.uid}`
                        },
                        (payload) => {
                            console.log('⚡ User Data Updated:', payload.new);
                            if (mounted && payload.new) {
                                const newData = payload.new;
                                setSubscription(prev => ({
                                    ...prev!,
                                    plan: (newData.plan as any) || 'free',
                                    status: (newData.status as any) || 'active',
                                    credits: newData.credits || 0,
                                    currentPeriodStart: newData.current_period_start ? new Date(newData.current_period_start) : prev?.currentPeriodStart,
                                    currentPeriodEnd: newData.current_period_end ? new Date(newData.current_period_end) : prev?.currentPeriodEnd
                                }));
                            }
                        }
                    )
                    .subscribe((status: string) => {
                        if (status === 'SUBSCRIBED') {
                            console.debug('✅ Realtime subscription active');
                        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                            console.debug('⚠️ Realtime subscription failed (non-fatal):', status);
                        }
                    });

                // Cleanup function
                return () => {
                    if (channel) {
                        supabase.removeChannel(channel).catch(() => {
                            // Ignore cleanup errors
                        });
                    }
                };
            } catch (realtimeError) {
                // Realtime subscription failed - app will still work with polling
                console.debug('Realtime subscription skipped (non-fatal):', realtimeError);
                return () => {
                    // No cleanup needed
                };
            }
        };

        const cleanupPromise = loadSubscription();

        return () => {
            mounted = false;
            // Best effort cleanup if promise resolves
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [user]);

    // Calculate derived values
    let effectiveSubscription = subscription;
    if (isAdmin && subscription) {
        effectiveSubscription = {
            ...subscription,
            plan: 'admin',
        };
    }

    const isPro = isAdmin || (subscription?.plan !== 'free' && subscription?.status === 'active');
    const isFree = !isPro;
    const isBanned = subscription?.status === 'banned';

    return (
        <SubscriptionContext.Provider value={{ subscription: effectiveSubscription, loading, isPro, isFree, isBanned }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = (): SubscriptionContextType => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

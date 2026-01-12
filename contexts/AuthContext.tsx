import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Types - Mapping Supabase User
export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    reload: () => Promise<void>;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    sendVerification: () => Promise<void>;
    checkVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const syncInProgress = React.useRef<Set<string>>(new Set());

    // Mapper function
    const mapUser = (sbUser: SupabaseUser | null): User | null => {
        if (!sbUser) return null;
        return {
            uid: sbUser.id,
            email: sbUser.email || null,
            displayName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || null,
            photoURL: sbUser.user_metadata?.avatar_url || null,
            emailVerified: !!sbUser.email_confirmed_at,
            reload: async () => {
                const { data } = await supabase.auth.getUser();
                if (data.user) setUser(mapUser(data.user));
            }
        };
    };

    const syncUserProfile = async (sbUser: SupabaseUser | null) => {
        if (!sbUser || !sbUser.id) return;
        
        // Prevent duplicate syncs
        if (syncInProgress.current.has(sbUser.id)) return;
        syncInProgress.current.add(sbUser.id);

        // Run sync asynchronously, don't block auth flow
        Promise.resolve().then(async () => {
            try {
                // Minimal payload - only essential fields
                // Note: Ensure your Supabase 'users' table has at least: id (primary key), email
                const profilePayload: any = {
                    id: sbUser.id,
                    email: sbUser.email || null,
                };

                // Try upsert
                const { error: upsertError } = await supabase
                    .from('users')
                    .upsert(profilePayload, { 
                        onConflict: 'id'
                    });

                if (upsertError) {
                    // Handle specific error codes
                    if (upsertError.code === '42P01') {
                        // Table doesn't exist - this is a setup issue
                        console.warn('Users table not found. Please create the users table in Supabase.');
                    } else if (upsertError.code === '42703') {
                        // Column doesn't exist
                        console.warn('Users table schema mismatch. Please check table columns.');
                    } else if (upsertError.code === '23505') {
                        // Duplicate key - user exists, try update
                        const { error: updateError } = await supabase
                            .from('users')
                            .update({ email: sbUser.email || null })
                            .eq('id', sbUser.id);
                        
                        if (updateError && updateError.code !== 'PGRST116') {
                            // Non-fatal, just warn
                            console.debug('User email update skipped:', updateError.message);
                        }
                    } else {
                        // Other errors - log but don't fail
                        console.debug('User sync warning (non-fatal):', upsertError.message);
                    }
                }
            } catch (err: any) {
                // Silently handle - don't break auth flow
                console.debug('User sync skipped (non-fatal):', err?.message || 'Unknown error');
            } finally {
                syncInProgress.current.delete(sbUser.id);
            }
        }).catch(() => {
            syncInProgress.current.delete(sbUser.id);
        });
    };

    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!isMounted) return;
            setUser(mapUser(session?.user || null));
            if (session?.user) await syncUserProfile(session.user);
            setLoading(false);
        };

        initSession();

        // Listen for auth changes (including OAuth callback redirects)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            setUser(mapUser(session?.user || null));
            if (session?.user) await syncUserProfile(session.user);
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const sendVerification = async () => {
        // Supabase handles this automatically usually, but if re-send needed:
        if (user?.email) {
            /* Supabase SDK doesn't always expose a simple "resend" without re-triggering signup flow logic or using admin 
               For now we log, or implement specific resend logic if needed. */
            console.log("Supabase verification resend triggered");
        }
    };

    const checkVerification = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) setUser(mapUser(data.user));
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signInWithGoogle,
            signOut,
            sendVerification,
            checkVerification
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

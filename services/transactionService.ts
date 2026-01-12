import { supabase } from './supabase';

export interface Transaction {
    id: string;
    date: any;
    description: string;
    amount: number;
    tokens: number;
    status: 'success' | 'failed' | 'pending';
    method: 'Credit Card' | 'PromptPay';
    userId: string;
    email?: string;
}

const STORAGE_KEY = 'user_transactions';

export const getTransactions = async (userId?: string): Promise<Transaction[]> => {
    try {
        let query = supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            // Admin (limit 100)
            query = query.limit(100);
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data || []).map((t: any) => ({
            ...t,
            id: t.id,
            date: t.date, // Supabase returns ISO string usually
            userId: t.user_id, // Map back if needed or use camelCase in DB
        }));

    } catch (error) {
        console.error("Error fetching transactions:", error);
        // Fallback to local storage
        const localData = localStorage.getItem(STORAGE_KEY);
        return localData ? JSON.parse(localData) : [];
    }
};

export const saveTransaction = async (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const txData = {
            ...transaction,
            user_id: user.id, // Supabase convention
            email: user.email,
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert(txData)
            .select()
            .single();

        if (error) throw error;

        // Also save to local storage for offline/fast access fallback
        const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        history.unshift({ ...txData, id: data.id, userId: user.id }); // local model uses userId
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

        return { id: data.id, ...txData, userId: user.id };
    } catch (error) {
        console.error("Error saving transaction:", error);
        throw error;
    }
};

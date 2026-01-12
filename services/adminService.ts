import { supabase } from './supabase';

export interface AdminUserStats {
    id: string;
    email: string;
    credits: number;
    plan: 'free' | 'pro' | 'agency';
    createdAt: any;
    lastLogin?: any;
    status: 'active' | 'banned';
    totalVideos?: number;
}

export const fetchAllUsers = async (): Promise<AdminUserStats[]> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, credits, plan, created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        return data.map((u: any) => ({
            id: u.id,
            email: u.email,
            credits: u.credits,
            plan: u.plan,
            createdAt: u.created_at,
            status: 'active', // Default or fetch from DB
            // ...
        })) as AdminUserStats[];
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        throw error;
    }
};

export const fetchSystemStats = async () => {
    const users = await fetchAllUsers();

    const totalCredits = users.reduce((acc, user) => acc + (user.credits || 0), 0);
    const activePro = users.filter(u => (u.plan === 'pro' || u.plan === 'agency')).length;

    const estimatedRevenue = (activePro * 999) + (users.filter(u => u.plan === 'agency').length * 2490);

    return {
        totalUsers: users.length,
        activePro,
        totalCredits,
        estimatedRevenue,
        systemHealth: '99.9%'
    };
};

export const fetchProjectStats = async () => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('data, created_at') // created_at might be in JSON or column
            .order('updated_at', { ascending: false }) // projects usually have updated_at
            .limit(500);

        if (error) throw error;

        const dailyData: Record<string, { videos: number, credits: number }> = {};

        data.forEach((row: any) => {
            const dateStr = row.created_at || row.updated_at;
            if (dateStr) {
                const date = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
                if (!dailyData[date]) dailyData[date] = { videos: 0, credits: 0 };
                dailyData[date].videos += 1;
                dailyData[date].credits += (row.data?.type === 'long' ? 50 : 10);
            }
        });

        return Object.keys(dailyData).map(key => ({
            name: key,
            ...dailyData[key]
        })).reverse();
    } catch (e) {
        console.error("Failed to fetch project stats", e);
        return [];
    }
};

export const fetchRevenueStats = async () => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('amount, date, status')
            .order('date', { ascending: false })
            .limit(500);

        if (error) throw error;

        const dailyData: Record<string, number> = {};

        data.forEach((tx: any) => {
            if (tx.status === 'completed' || tx.status === 'success') {
                const dateObj = new Date(tx.date);
                const dateStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                if (!dailyData[dateStr]) dailyData[dateStr] = 0;
                dailyData[dateStr] += tx.amount;
            }
        });

        return Object.keys(dailyData).map(key => ({
            name: key,
            revenue: dailyData[key]
        })).reverse();
    } catch (e) {
        console.error("Failed to fetch revenue stats", e);
        return [];
    }
};


export const updateUser = async (userId: string, data: Partial<AdminUserStats>) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                plan: data.plan,
                credits: data.credits
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Admin Update Error:", error);
        throw error;
    }
};

export const adjustUserCredits = async (userId: string, amount: number) => {
    try {
        // Since Supabase doesn't support 'increment' in client SDK easily without RPC,
        // we'll fetch then update, or assume we have RPC 'increment_credits'.
        // For now, fetch-update (optimistic)
        const { data } = await supabase.from('users').select('credits').eq('id', userId).single();
        const current = data?.credits || 0;

        const { error } = await supabase
            .from('users')
            .update({ credits: current + amount })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Credit Adjustment Error:", error);
        throw error;
    }
};

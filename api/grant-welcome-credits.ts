import { supabaseAdmin } from '../lib/supabaseAdmin';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authorization.split('Bearer ')[1];

    try {
        // Verify User using Supabase Auth
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Check email verification if enforced? Supabase handles this usually.
        // if (!user.email_confirmed_at) ...

        const userId = user.id;

        // Fetch User Data
        const { data: userData, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('User fetch error:', fetchError);
            return res.status(500).json({ error: 'User not found' });
        }

        // Check if already granted
        // Note: You should ensure 'welcome_bonus_granted' column exists in your `users` table schema! 
        // If not, add it: `alter table users add column welcome_bonus_granted boolean default false;`
        if (userData?.welcome_bonus_granted) {
            return res.status(200).json({ success: true, message: 'Already granted.' });
        }

        const currentCredits = userData?.credits || 0;

        // Update User
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                credits: currentCredits + 50,
                welcome_bonus_granted: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return res.status(200).json({ success: true, message: 'Welcome credits granted.' });

    } catch (error: any) {
        console.error('Error granting welcome credits:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
// Note: Vercel loads env vars automatically, but for local dev we might need dotenv if running ts-node directly
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Supabase Admin keys missing. Check .env');
    }
}

// Create a single instance of the Supabase admin client
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

import { createClient } from '@supabase/supabase-js';

// Centralized Supabase client for the frontend app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const resolvedSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const resolvedSupabaseKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Standard client for client-side and general server-side usage.
 * Respects RLS.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

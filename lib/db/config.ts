import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if Supabase credentials are placeholder or missing (e.g. in dev/demo mode)
const HAS_PLACEHOLDER_URL = supabaseUrl.includes('your-project-id') || supabaseUrl.includes('placeholder');
const HAS_PLACEHOLDER_KEY = supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder');
const HAS_NO_CREDENTIALS = !supabaseUrl || !supabaseAnonKey;

export const isSupabaseConfigured = !HAS_NO_CREDENTIALS && !HAS_PLACEHOLDER_URL && !HAS_PLACEHOLDER_KEY;

const DB_TIMEOUT = parseInt(process.env.SUPABASE_DB_TIMEOUT || '3000', 10);

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    fetch: (url: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DB_TIMEOUT);
      return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
    },
  },
});

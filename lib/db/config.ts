import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if Supabase credentials are placeholder or missing (e.g. in dev/demo mode)
const HAS_PLACEHOLDER_URL = supabaseUrl.includes('your-project-id') || supabaseUrl.includes('placeholder');
const HAS_PLACEHOLDER_KEY = supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder');
const HAS_NO_CREDENTIALS = !supabaseUrl || !supabaseAnonKey;

export const isSupabaseConfigured = !HAS_NO_CREDENTIALS && !HAS_PLACEHOLDER_URL && !HAS_PLACEHOLDER_KEY;

const DB_TIMEOUT = parseInt(process.env.SUPABASE_DB_TIMEOUT || '3000', 10);

function createTimeoutFetch() {
  return (url: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DB_TIMEOUT);
    return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
  };
}

/**
 * Browser client — for 'use client' components only.
 * Uses cookies via the browser (localStorage/document.cookie).
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: { fetch: createTimeoutFetch() },
});

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: createTimeoutFetch() },
    })
  : null;

/**
 * Factory for read-only data access on the server side.
 * Uses @supabase/supabase-js directly (no cookie handling) — suitable for
 * server components, route handlers, and server actions that only read public data.
 */
export function createServerDataClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: createTimeoutFetch() },
  });
}

/**
 * Full server client factory with cookie-based auth — use when you need
 * to read the user's session on the server (e.g. in auth callbacks).
 * Must be called per-request with cookies() from next/headers.
 */
export async function createServerSupabaseClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: createTimeoutFetch() },
  });
}

import { createClient } from '@supabase/supabase-js';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10);

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

// Fallback in-memory rate limiter for development or when Supabase is unavailable
const fallbackMap = new Map<string, { count: number; resetAt: number }>();

function checkFallback(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = fallbackMap.get(key);

  if (!entry || now >= entry.resetAt) {
    fallbackMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const supabase = getSupabase();

  if (!supabase) {
    return checkFallback(key);
  }

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);

    // Get current count for this IP in the current window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseFrom = supabase.from('rate_limits') as any;
    const { data } = await supabaseFrom
      .select('request_count, window_start')
      .eq('ip_address', key)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      // No existing entry — create one
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('rate_limits') as any).insert({
        ip_address: key,
        request_count: 1,
        window_start: now.toISOString(),
      });
      return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now.getTime() + WINDOW_MS };
    }

    if (data.request_count >= MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(data.window_start).getTime() + WINDOW_MS,
      };
    }

    // Increment counter
    const updateData = { request_count: data.request_count + 1 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rateQuery = supabase.from('rate_limits') as any;
    await rateQuery
      .update(updateData)
      .eq('ip_address', key)
      .gte('window_start', windowStart.toISOString());

    return {
      allowed: true,
      remaining: MAX_REQUESTS - (data.request_count + 1),
      resetAt: new Date(data.window_start).getTime() + WINDOW_MS,
    };
  } catch {
    // Fallback to in-memory if Supabase is unavailable
    return checkFallback(key);
  }
}

export function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1';
  // Validate basic IPv4/IPv6 format
  const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
    return ip;
  }
  return '127.0.0.1';
}

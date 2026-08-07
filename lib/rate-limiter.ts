import { createClient } from '@supabase/supabase-js';

interface RateLimitRow {
  ip_address: string;
  request_count: number;
  window_start: string;
}

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

// Periodically purge expired entries to prevent unbounded growth
const FALLBACK_CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function pruneFallbackMap() {
  const now = Date.now();
  if (now - lastCleanup < FALLBACK_CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of fallbackMap) {
    if (now >= entry.resetAt) fallbackMap.delete(key);
  }
}

function checkFallback(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  pruneFallbackMap();
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
    const { data } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('ip_address', key)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle() as unknown as { data: RateLimitRow | null }; // Typed access for untyped table

    if (!data) {
      // No existing entry — create one
      await supabase
        .from('rate_limits')
        .insert({
          ip_address: key,
          request_count: 1,
          window_start: now.toISOString(),
        } as never);
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
    await supabase
      .from('rate_limits')
      .update({ request_count: data.request_count + 1 } as never)
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
  // In production behind a reverse proxy, trust x-forwarded-for from the proxy.
  // Prefer x-real-ip if set by the proxy (less prone to spoofing).
  const realIp = req.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp)) return realIp;

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the last IP in the chain (the client's true IP, not intermediate proxies)
    // when behind a trusted proxy. For direct connections, take the first.
    const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    const candidate = process.env.TRUSTED_PROXY === 'true' ? ips[ips.length - 1] : ips[0];
    if (candidate && isValidIp(candidate)) return candidate;
  }

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp)) return cfIp;

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) return false;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every(p => p >= 0 && p <= 255);
  }
  return true;
}

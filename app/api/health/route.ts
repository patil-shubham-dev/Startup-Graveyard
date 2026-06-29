import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
      },
    });
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      ai: {
        status: 'operational',
      },
      supabase: {
        status: 'operational',
      },
    },
  });
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (process.env.NODE_ENV === 'development') return true;
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Refresh Supabase auth session on every request
  const response = NextResponse.next();
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.getSession();
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
      if (isOriginAllowed(origin)) {
        return new NextResponse(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': origin!,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
      return new NextResponse(null, { status: 204 });
    }

    if (isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin!);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/ask', '/pre-mortem'],
};

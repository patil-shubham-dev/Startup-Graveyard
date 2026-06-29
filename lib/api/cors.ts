import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (process.env.NODE_ENV === 'development') return true;
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

export function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  return response;
}

export function handleCors(req: Request): NextResponse | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    if (isOriginAllowed(origin)) {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', origin!);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }
    return new NextResponse(null, { status: 204 });
  }
  return null;
}

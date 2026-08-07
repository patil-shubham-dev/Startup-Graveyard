import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.nextUrl.searchParams.get('secret') || '';
    const expected = process.env.REVALIDATION_SECRET || '';

    if (!expected || !timingSafeEqual(secret, expected)) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const tags: string[] = body.tags || ['case-studies', 'stats', 'insights'];
    const slugs: string[] = body.slugs || [];

    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      slugs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret') || '';
  const expected = process.env.REVALIDATION_SECRET || '';

  if (!expected || !timingSafeEqual(secret, expected)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  revalidateTag('case-studies');
  revalidateTag('stats');
  revalidateTag('insights');

  return NextResponse.json({
    revalidated: true,
    tags: ['case-studies', 'stats', 'insights'],
    timestamp: new Date().toISOString(),
  });
}

import { NextResponse } from 'next/server';
import { ai, hasValidKey } from '@/lib/ai';

export async function GET() {
  const embedCacheSize = ai.getEmbeddingCache().size;
  const responseCacheSize = ai.getResponseCache().size;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      ai: {
        configured: hasValidKey,
        model: process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct',
        embeddingCacheSize: embedCacheSize,
        responseCacheSize: responseCacheSize,
      },
      supabase: {
        configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    },
  });
}

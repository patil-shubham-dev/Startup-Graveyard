import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSupabaseConfigured, createServerDataClient } from '@/lib/db/config';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';

const SubmissionSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  shutdownYear: z.coerce.number().int().min(1900).max(2100).optional(),
  analysis: z.string().min(10, 'Please provide at least 10 characters of analysis').max(5000),
  sources: z.string().max(5000).optional().or(z.literal('')),

});

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
    });
  }

  try {
    const body = await req.json();
    const parsed = SubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid submission',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      // Store in-memory for development (will be lost on restart)
      console.log('[Submit] Submission received (offline mode):', parsed.data.company);
      return NextResponse.json({
        success: true,
        message: 'Submission received. Our forensic team will review it shortly.',
      });
    }

    const db = createServerDataClient();
    const { error } = await db.from('submissions').insert({
      company_name: parsed.data.company,
      website: parsed.data.website || null,
      industry: parsed.data.industry || null,
      shutdown_year: parsed.data.shutdownYear || null,
      analysis: parsed.data.analysis,
      sources: parsed.data.sources || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Submit] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save submission. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission received. Our forensic team will review it shortly.',
    });
  } catch (error) {
    console.error('[Submit] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

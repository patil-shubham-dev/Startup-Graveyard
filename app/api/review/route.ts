import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/db/config';
import { createClient } from '@/lib/auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ReviewActionSchema = z.object({
  caseId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_changes']),
  notes: z.string().max(2000).optional(),
});

const DraftUpdateSchema = z.object({
  caseId: z.string().uuid(),
  content: z.string().optional(),
  company_name: z.string().optional(),
  summary: z.string().max(600).optional(),
});

async function verifyAdmin(request: NextRequest): Promise<{ authorized: true } | { authorized: false; response: NextResponse }> {
  // Check service role key (for script access)
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader === `Bearer ${SERVICE_KEY}` && SERVICE_KEY.length > 10) {
    return { authorized: true };
  }

  // Check authenticated user with admin email
  const supabaseAuth = await createClient(request);
  const { data: { user }, error } = await supabaseAuth.auth.getUser();

  if (error || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  const userEmail = user.email?.toLowerCase();
  if (!userEmail || (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail))) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { authorized: true };
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const supabase = await createClient(request);

    const body = await request.json();
    const parsed = ReviewActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { caseId, action, notes } = parsed.data;

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    let review_status: string;
    let published: boolean;

    switch (action) {
      case 'approve':
        review_status = 'published';
        published = true;
        break;
      case 'reject':
        review_status = 'rejected';
        published = false;
        break;
      case 'request_changes':
        review_status = 'in_review';
        published = false;
        break;
    }

    const updateData: Record<string, unknown> = {
      review_status,
      published,
      reviewed_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.published_at = new Date().toISOString();
    }

    if (notes) {
      updateData.review_notes = notes;
    }

    const { error } = await supabase
      .from('case_studies')
      .update(updateData)
      .eq('id', caseId);

    if (error) {
      console.error('[Review] Update error:', error);
      return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Case study published'
        : action === 'reject'
          ? 'Case study rejected'
          : 'Changes requested',
    });
  } catch (error) {
    console.error('[Review] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // For editing draft content before approval
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const supabase = await createClient(request);

    const body = await request.json();
    const parsed = DraftUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { caseId, ...updates } = parsed.data;

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Only allow updates on draft cases
    const { data: existing } = await supabase
      .from('case_studies')
      .select('review_status')
      .eq('id', caseId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    if (existing.review_status === 'published') {
      return NextResponse.json(
        { error: 'Published cases cannot be edited via this endpoint. Use the CMS.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('case_studies')
      .update(updates)
      .eq('id', caseId);

    if (error) {
      console.error('[Review] Update error:', error);
      return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Draft updated' });
  } catch (error) {
    console.error('[Review] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // List all drafts and cases pending review
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return auth.response;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = await createClient(request);

  const { data, error } = await supabase
    .from('case_studies')
    .select('id, slug, company_name, industry, review_status, published, created_at, reviewed_at, fact_check_score')
    .in('review_status', ['draft', 'in_review'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Review] List error:', error);
    return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 });
  }

  return NextResponse.json({ cases: data || [] });
}

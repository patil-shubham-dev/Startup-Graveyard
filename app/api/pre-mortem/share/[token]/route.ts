import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, createServerDataClient } from '@/lib/db/config';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  if (!token || token.length < 6) {
    return NextResponse.json({ error: 'Invalid share token' }, { status: 400 });
  }

  try {
    const sanitizedToken = token.replace(/[^a-zA-Z0-9_-]/g, '');
    const db = createServerDataClient();
    const { data, error } = await db
      .from('premortem_sessions')
      .select('pitch, report, risk_score, created_at, share_token')
      .eq('share_token', sanitizedToken)
      .not('report', 'is', null)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 });
    }

    return NextResponse.json({
      pitch: data.pitch,
      report: data.report,
      riskScore: data.risk_score,
      createdAt: data.created_at,
      shareToken: data.share_token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

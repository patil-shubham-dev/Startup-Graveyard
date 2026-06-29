import { supabase } from '@/lib/db/config';
import { notFound } from 'next/navigation';
import { PremortemReportPreview } from './ReportPreview';
import type { Metadata } from 'next';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  if (!token || token.length < 6) return {};

  return {
    title: 'Shared Pre-Mortem Report | Startup Graveyard',
    description: 'A forensic pre-mortem diagnostic report shared from the Startup Graveyard.',
    openGraph: {
      title: 'Pre-Mortem Diagnostic Report',
      description: 'Failure risk assessment for a startup idea, powered by the Startup Graveyard.',
      type: 'article',
    },
  };
}

async function getReport(token: string) {
  const sanitizedToken = token.replace(/[^a-zA-Z0-9_-]/g, '');
  const { data, error } = await supabase
    .from('premortem_sessions')
    .select('pitch, report, risk_score, created_at')
    .eq('share_token', sanitizedToken)
    .not('report', 'is', null)
    .single();

  if (error || !data || !data.report) return null;
  return data;
}

export default async function SharedPremortemPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 6) return notFound();

  const data = await getReport(token);
  if (!data) return notFound();

  return (
    <PremortemReportPreview
      pitch={data.pitch}
      report={data.report as Record<string, unknown>}
      riskScore={data.risk_score}
      createdAt={data.created_at}
    />
  );
}

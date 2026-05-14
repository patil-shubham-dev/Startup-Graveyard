import { getCaseStudy, getSimilarCases } from '@/lib/db/case-studies';
import { notFound } from 'next/navigation';
import { DossierHero } from '@/components/case-study/DossierHero';
import { VerdictBox } from '@/components/case-study/VerdictBox';
import { Timeline } from '@/components/case-study/Timeline';
import { FailureDNA } from '@/components/case-study/FailureDNA';
import { DossierCard } from '@/components/ui/DossierCard';
import { DossierContent } from '@/components/case-study/DossierContent';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { ScanButton } from '@/components/ui/ScanButton';
import { serialize } from 'next-mdx-remote/serialize';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'warning' | 'crisis';
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

/*
export async function generateStaticParams() {
  const { data: cases } = await (await import('@/lib/db/config')).supabase
    .from('case_studies')
    .select('slug')
    .eq('published', true);

  return (cases || []).map((c) => ({
    slug: c.slug,
  }));
}
*/

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  
  if (!study) return notFound();

  const similarCases = await getSimilarCases(study.id);
  const mdxSource = await serialize(study.content || '# Dossier Content Pending\n\nFull investigation is currently being finalized by the forensic team.');

  // Mock events if not in DB, but pull some data from study
  const mockEvents = [
    { date: `JAN ${study.founded_year || 2018}`, title: 'Project Initiation', description: `${study.company_name} enters the market with significant backing.`, type: 'milestone' },
    { date: 'MID CYCLE', title: 'Market Saturation', description: 'User acquisition costs begin to exceed lifetime value projections.', type: 'warning' },
    { date: `${study.shutdown_year || 'END'}`, title: 'Final Liquidation', description: 'Board of directors votes to cease operations and liquidate assets.', type: 'crisis' },
  ];

  return (
    <main className="min-h-screen bg-bg-page pt-20">
      <DossierHero study={study} />
      
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-20 py-24 relative">
        {/* Article Section */}
        <article className="overflow-visible">
          <div className="mb-20">
            <IntelKicker label="FORENSIC_SUMMARY" figure="PT. 01" />
            <DossierContent source={mdxSource} />
          </div>

          <div className="mb-20">
            <IntelKicker label="FORENSIC_TIMELINE" figure="PT. 02" />
            <Timeline events={mockEvents as TimelineEvent[]} />
          </div>

          <VerdictBox reasons={study.failure_reasons || []} />

          <div className="mt-20">
            <IntelKicker label="LESSONS_LEARNED" figure="PT. 03" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {(study.lessons || []).map((lesson, i) => (
                <div key={i} className="flex gap-6 group p-6 glass-dossier border-border-subtle rounded-[2px] hover:border-green-500/40 transition-colors">
                  <span className="font-mono text-green-500 font-bold text-lg">0{i + 1}</span>
                  <p className="text-text-muted leading-relaxed text-[15px]">{lesson}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-12 lg:sticky lg:top-32 lg:h-fit">
          <FailureDNA scores={study.risk_scores as Record<string, number>} />
          
          <div className="glass-dossier border-border-strong p-8 rounded-[4px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-red-500/40" />
            <h3 className="font-mono text-[10px] text-text-ghost tracking-[0.2em] uppercase mb-8">REDACTED_EVIDENCE</h3>
            <p className="text-[14px] leading-relaxed text-text-muted italic">
              Investigation reveals <span className="redacted" title="Hover to reveal">internal warnings about PMF were ignored</span> by the executive team 
              months before the final <span className="redacted" title="Hover to reveal">liquidity crisis</span> forced a shutdown.
            </p>
          </div>

          <div className="glass-dossier border-border-strong p-8 rounded-[4px] bg-violet-600/[0.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-violet-600/40" />
            <h3 className="font-header text-2xl font-bold mb-4 text-text-primary italic">Run a Pre-Mortem</h3>
            <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
              Stress-test your idea against the failure patterns of companies like {study.company_name}.
            </p>
            <ScanButton href="/pre-mortem" label="ANALYZE MY IDEA" fullWidth />
          </div>
        </aside>
      </div>

      {/* Similar Failures */}
      {similarCases.length > 0 && (
        <section className="border-t border-border-subtle py-32 bg-white/[0.01]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="mb-16">
              <IntelKicker label="SIMILAR_INVESTIGATIONS" figure="FIG. 04" />
              <h2 className="section-header">Cross-Reference Data</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarCases.map((s) => (
                <DossierCard 
                  key={s.id} 
                  id={s.case_number}
                  name={s.company_name}
                  category={s.industry || 'N/A'}
                  status="CLOSED"
                  description={s.summary}
                  burnedAmount={`$${s.funding_raised}M`}
                  eolYear={s.shutdown_year?.toString() || 'N/A'}
                  primaryCause={s.failure_reasons?.[0] || 'UNSPECIFIED'}
                  slug={s.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

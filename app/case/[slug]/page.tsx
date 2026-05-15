import { getCaseStudy, getSimilarCases } from '@/lib/db/case-studies';
import { notFound } from 'next/navigation';
import { DossierHero } from '@/components/case-study/DossierHero';
import { VerdictBox } from '@/components/case-study/VerdictBox';
import { Timeline } from '@/components/case-study/Timeline';
import { DossierCard } from '@/components/ui/DossierCard';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { ScanButton } from '@/components/ui/ScanButton';
import { ForensicRadar } from '@/components/case-study/ForensicRadar';
import { EvidenceFolder } from '@/components/case-study/EvidenceFolder';
import { Marginalia } from '@/components/case-study/Marginalia';
import { ForensicControls } from '@/components/case-study/ForensicControls';
import { ReadingProgressBar } from '@/components/case-study/ReadingProgressBar';
import { SectorBenchmarking } from '@/components/case-study/SectorBenchmarking';
import { FailureDNA } from '@/components/case-study/FailureDNA';
import { BurnChart } from '@/components/case-study/BurnChart';
import { FounderInterview } from '@/components/case-study/FounderInterview';
import { TableOfContents } from '@/components/case-study/TableOfContents';
import { MetricsDashboard } from '@/components/case-study/MetricsDashboard';
import { FundingChart, HeadcountChart } from '@/components/case-study/EditorialCharts';
import { CompetitorMatrix } from '@/components/case-study/CompetitorMatrix';
import { RootCauseVerdict } from '@/components/case-study/RootCauseVerdict';
import { FounderInterrogation } from '@/components/case-study/FounderInterrogation';
import { SourcesList } from '@/components/case-study/SourcesList';
import { QuotesSection } from '@/components/case-study/QuotesSection';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { TimelineEvent } from '@/components/case-study/Timeline';
import { CaseCard } from '@/components/case-study/CaseCard';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { supabase } = await import('@/lib/db/config');
  const { data: cases } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('published', true);

  return (cases || []).map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};

  return {
    title: `${study.company_name} Forensic Autopsy | Startup Graveyard`,
    description: study.summary,
    openGraph: {
      title: `${study.company_name} Case Study`,
      description: study.summary,
      type: 'article',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(study.company_name)}&type=CASE_STUDY`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  
  if (!study) return notFound();

  const similarCases = await getSimilarCases(study.id);
  const { content } = await compileMDX({
    source: study.content || '# Dossier Content Pending\n\nFull investigation is currently being finalized.',
    components: {
      Timeline,
      VerdictBox,
      MetricsDashboard,
      EvidenceFolder,
      SectorBenchmarking,
      FailureDNA,
      FundingChart,
      HeadcountChart,
      BurnChart,
      ForensicRadar,
      FounderInterview,
      FounderInterrogation,
      RootCauseVerdict,
      CompetitorMatrix,
      CaseCard,
      ReadingProgressBar,
    }
  });

  const sections = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'story', label: 'The Story' },
    { id: 'metrics', label: 'Key Metrics' },
    { id: 'charts', label: 'Data Visualization' },
    { id: 'analysis', label: 'Failure Analysis' },
    { id: 'verdict', label: 'Root Cause Verdict' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'competitors', label: 'Market Context' },
    { id: 'lessons', label: 'Lessons Learned' },
    { id: 'interrogation', label: 'AI Interrogation' },
    { id: 'sources', label: 'Sources' },
  ];

  const timelineEvents = (study.timeline_events as TimelineEvent[]) || [];

  return (
    <main className="min-h-screen bg-bg-page relative">
      <ReadingProgressBar />
      
      <DossierHero study={study} />
      
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_360px] gap-12 py-24 relative">
        
        {/* Left Sidebar - TOC */}
        <div className="hidden lg:block">
          <TableOfContents sections={sections} />
        </div>

        {/* Central Article Content */}
        <article className="overflow-visible paper-dossier p-8 md:p-16 lg:p-24 shadow-2xl bg-paper-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-ink-black opacity-10" />
          
          <ForensicControls audioUrl={study.audio_briefing_url || undefined} />

          <section id="summary" className="scroll-mt-32 mb-32">
            <IntelKicker label="CASE_SUMMARY" figure="PT. 01" />
            <div className="mt-12">
              <h2 className="t-h1 mb-12 border-b border-cream-dark/30 pb-8">Executive Autopsy</h2>
              <div className="t-body text-xl leading-relaxed text-ink-soft italic opacity-80 mb-12">
                {study.summary}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="t-label text-[10px] mb-4">Initial Success</h4>
                  <p className="t-body-sm opacity-70">
                    Founded in {study.founded_year}, {study.company_name} initially gained traction through innovative disruption in the {study.industry} sector.
                  </p>
                </div>
                <div>
                  <h4 className="t-label text-[10px] mb-4">Critical Collapse</h4>
                  <p className="t-body-sm opacity-70">
                    The shutdown in {study.shutdown_year} was the culmination of strategic failures and market pressures.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="story" className="scroll-mt-32 mb-32">
            <IntelKicker label="FORENSIC_NARRATIVE" figure="PT. 02" />
            <div className="prose-editorial mt-12">
              {content}
            </div>
          </section>

          <section id="metrics" className="scroll-mt-32 mb-32">
            <IntelKicker label="CORE_METRICS" figure="PT. 03" />
            <h2 className="t-h2 mt-12 mb-12">By The Numbers</h2>
            <MetricsDashboard metrics={study.metrics} />
          </section>

          <section id="charts" className="scroll-mt-32 mb-32 space-y-12">
            <IntelKicker label="DATA_VISUALIZATION" figure="PT. 04" />
            <h2 className="t-h2 mt-12 mb-12">Economic Fingerprints</h2>
            <div className="grid grid-cols-1 gap-8">
              {study.financial_data?.rounds && <FundingChart data={study.financial_data.rounds} />}
              {study.financial_data?.headcount && <HeadcountChart data={study.financial_data.headcount} />}
            </div>
          </section>

          <section id="analysis" className="scroll-mt-32 mb-32">
            <IntelKicker label="FAILURE_ANALYSIS" figure="PT. 05" />
            <h2 className="t-h2 mt-12 mb-12">Anatomy of Failure</h2>
            <VerdictBox reasons={study.failure_reasons || []} />
          </section>

          <section id="verdict" className="scroll-mt-32 mb-32">
            <RootCauseVerdict verdict={study.verdict} companyName={study.company_name} />
          </section>

          <QuotesSection quotes={study.quotes || []} />

          <section id="timeline" className="scroll-mt-32 mb-32">
            <IntelKicker label="CHRONOLOGY" figure="PT. 06" />
            <h2 className="t-h2 mt-12 mb-12">Timeline of Decline</h2>
            <Timeline events={timelineEvents} />
          </section>

          <section id="competitors" className="scroll-mt-32 mb-32">
            <IntelKicker label="MARKET_CONTEXT" figure="PT. 07" />
            <h2 className="t-h2 mt-12 mb-12">The Competition Factor</h2>
            <CompetitorMatrix competitors={study.competitors || []} companyName={study.company_name} />
          </section>

          <section id="lessons" className="scroll-mt-32 mb-32">
            <IntelKicker label="LESSONS_LEARNED" figure="PT. 08" />
            <h2 className="t-h2 mt-12 mb-12">Lessons for Founders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {(study.lessons || []).map((lesson, i) => (
                <div key={i} className="flex gap-6 group p-8 bg-cream-base/10 border border-cream-dark/20 rounded-[2px] hover:border-rust-accent/40 transition-colors relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 font-mono text-4xl">0{i+1}</div>
                  <p className="text-text-muted leading-relaxed text-[15px] z-10">{lesson}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="interrogation" className="scroll-mt-32 mb-32">
            <FounderInterrogation companyName={study.company_name} />
          </section>

          <EvidenceFolder images={study.evidence_images || []} />

          <section id="sources" className="scroll-mt-32">
            <SourcesList sources={study.sources || []} />
          </section>

          <div className="mt-20 pt-20 border-t border-cream-dark/20 flex justify-between items-center">
            <div className="t-label text-[10px] opacity-40">Investigation_ID: {study.id}</div>
            <div className="t-label text-[10px] opacity-40">Archived_At: {study.published_at ? new Date(study.published_at).toLocaleDateString() : 'Pending'}</div>
          </div>
        </article>

        {/* Right Sidebar - Marginalia & CTA */}
        <aside className="space-y-12 lg:sticky lg:top-32 lg:h-fit">
          <ForensicRadar scores={study.risk_scores as Record<string, number>} />
          
          <Marginalia notes={study.marginalia || []} />

          <div className="paper-dossier border border-ink-black/10 p-8 rounded-[4px] bg-paper-white relative overflow-hidden shadow-lg group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-failed-red" />
            <h3 className="t-hero text-2xl mb-4 italic">Post-Mortem Analysis</h3>
            <p className="t-body-sm text-ink-muted mb-8 leading-relaxed">
              Every failure is a data point. Use our AI analyzer to stress-test your own startup idea against the patterns that killed {study.company_name}.
            </p>
            <ScanButton href="/pre-mortem" label="RUN PRE-MORTEM" fullWidth />
          </div>
        </aside>
      </div>

      {/* Similar Failures */}
      {similarCases.length > 0 && (
        <section className="border-t border-cream-dark/20 py-32 bg-cream-deep/10">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="mb-16">
              <IntelKicker label="SIMILAR_INVESTIGATIONS" figure="FIG. 04" />
              <h2 className="t-h1">Cross-Reference Data</h2>
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
                  burnedAmount={s.funding_raised || 0}
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

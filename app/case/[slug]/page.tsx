import { getCaseStudy, getSimilarCases } from '@/lib/db/case-studies';
import { notFound } from 'next/navigation';
import { DossierHero } from '@/components/case-study/DossierHero';
import { VerdictBox } from '@/components/case-study/VerdictBox';
import { Timeline } from '@/components/case-study/Timeline';
import { FailureDNA } from '@/components/case-study/FailureDNA';
import { CaseCard } from '@/components/case-study/CaseCard';
import { DossierContent } from '@/components/case-study/DossierContent';
import { serialize } from 'next-mdx-remote/serialize';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const { data: cases } = await (await import('@/lib/db/config')).supabase
    .from('case_studies')
    .select('slug')
    .eq('published', true);

  return (cases || []).map((c) => ({
    slug: c.slug,
  }));
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  
  if (!study) return notFound();

  const mdxSource = await serialize(study.content || '# Dossier Content Pending\n\nFull investigation is currently being finalized by the forensic team.');

  const mockEvents = [
    { date: 'JAN 2018', title: 'The Launch', description: `${study.company_name} enters the market with significant backing.`, type: 'milestone' },
    { date: 'MAR 2019', title: 'The Plateau', description: 'User acquisition costs begin to exceed lifetime value.', type: 'warning' },
    { date: 'OCT 2020', title: 'The Collapse', description: 'Board of directors votes to cease operations.', type: 'crisis' },
  ];

  return (
    <main className="min-h-screen bg-bg-page">
      <DossierHero study={study as any} />
      
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 pb-24 relative">
        {/* Article Section */}
        <article className="overflow-visible space-y-16">
          <div className="prose-investigation">
            <div className="border-t border-border-subtle pt-8 mb-4">
              <span className="font-body text-[11px] uppercase tracking-[3px] text-text-muted block mb-4">INVESTIGATION SUMMARY</span>
            </div>
            <DossierContent source={mdxSource} />
          </div>

          <div className="border-t border-border-subtle pt-8">
            <span className="font-body text-[11px] uppercase tracking-[3px] text-text-muted block mb-8">FORENSIC TIMELINE</span>
            <Timeline events={mockEvents as any} />
          </div>

          <VerdictBox reasons={study.failure_reasons} />

          <div className="border-t border-border-subtle pt-8">
            <span className="font-body text-[11px] uppercase tracking-[3px] text-text-muted block mb-8">LESSONS LEARNED</span>
            <ul className="space-y-6">
              {(study.lessons || []).map((lesson, i) => (
                <li key={i} className="flex gap-4 group">
                  <span className="font-mono text-green-lesson font-bold shrink-0">{i + 1}.</span>
                  <p className="text-text-primary leading-relaxed text-base">{lesson}</p>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-10 lg:sticky lg:top-20 lg:h-fit">
          <FailureDNA scores={study.risk_scores as any} />
          
          <div className="bg-bg-surface-1 border border-border-subtle p-6 rounded-md">
            <h3 className="font-mono text-[10px] text-amber-signal tracking-[3px] uppercase mb-6">REDACTED EVIDENCE</h3>
            <p className="text-sm leading-relaxed text-text-secondary italic">
              Investigation reveals <span className="redacted" title="Hover to reveal">internal warnings about PMF were ignored</span> by the executive team 
              months before the final <span className="redacted" title="Hover to reveal">liquidity crisis</span> forced a shutdown.
            </p>
          </div>

          <div className="bg-violet-surface border border-violet-primary/20 p-6 rounded-md">
            <h3 className="font-display text-xl font-bold mb-4 text-text-primary">Run a Pre-Mortem</h3>
            <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
              Stress-test your idea against the failure patterns of companies like {study.company_name}.
            </p>
            <Link 
              href="/pre-mortem" 
              className="block w-full py-3 bg-violet-primary text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-violet-hover transition-colors rounded-sm shadow-violet-glow"
            >
              Analyze My Idea →
            </Link>
          </div>
        </aside>
      </div>

      {/* Similar Failures */}
      <section className="bg-bg-surface-1/50 py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-mono text-[11px] tracking-[3px] text-text-muted uppercase block mb-12">SIMILAR INVESTIGATIONS</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <CaseCard key={i} study={{...study, id: `sim-${i}`, company_name: `Similar Case ${i}`, slug: `sim-${i}`, case_number: `CASE #00${40+i}`} as any} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

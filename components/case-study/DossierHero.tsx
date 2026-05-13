'use client';

import { CaseStudy } from '@/lib/db/case-studies';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { DataBadge } from '@/components/ui/DataBadge';
import { StatBlock } from '@/components/ui/StatBlock';

export function DossierHero({ study }: { study: CaseStudy }) {
  const formatFunding = (raised: number | null) => {
    if (!raised) return 'N/A';
    if (raised >= 1000000000) return `$${(raised / 1000000000).toFixed(1)}B`;
    return `$${(raised / 1000000).toFixed(0)}M`;
  };

  return (
    <section className="pt-32 pb-24 px-6 relative overflow-hidden border-b border-border-subtle">
      {/* Background Watermark */}
      <div className="absolute top-10 right-10 font-mono text-[140px] text-white/[0.02] select-none pointer-events-none font-bold rotate-12">
        DEEP_DIVE
      </div>
      <div className="absolute inset-0 bg-grid-fine opacity-10 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <nav className="flex items-center gap-4 mb-16">
          <IntelKicker label="CASE_FILE" figure={study.case_number || 'N/A'} />
          <DataBadge label="STATUS: CLOSED" variant="red" />
          <DataBadge label={`YEAR: ${study.shutdown_year}`} variant="amber" />
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20 items-end">
          <div>
            <h1 className="hero-title mb-8">
              {study.company_name}
            </h1>
            <p className="text-text-muted text-xl italic font-serif leading-relaxed max-w-2xl border-l-2 border-amber-500/30 pl-8 py-2">
              "{study.summary}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 glass-dossier p-10 rounded-[4px] border-border-strong relative">
            <StatBlock label="FOUNDED" value={study.founded_year?.toString() || 'N/A'} />
            <StatBlock label="SHUTDOWN" value={study.shutdown_year?.toString() || 'N/A'} />
            <StatBlock label="TOTAL_FUNDING" value={formatFunding(study.funding_raised)} accent />
            <StatBlock label="PEAK_HEADCOUNT" value={study.employees_peak ? `${study.employees_peak}+` : 'N/A'} />
            
            {/* Corner Decor */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-amber-500/40" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-amber-500/40" />
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <span className="font-mono text-[10px] text-text-ghost uppercase tracking-[0.2em] mr-4 self-center">CLASSIFICATIONS:</span>
          <DataBadge label={study.industry || 'TECH'} variant="violet" />
          {(study.failure_reasons || []).slice(0, 3).map((reason) => (
            <DataBadge key={reason} label={reason.replace('_', ' ')} variant="amber" />
          ))}
        </div>
      </div>
    </section>
  );
}

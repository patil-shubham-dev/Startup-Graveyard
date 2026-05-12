import { CaseStudy } from '@/lib/db/case-studies';

export function DossierHero({ study }: { study: CaseStudy }) {
  const formatFunding = (raised: number | null) => {
    if (!raised) return 'N/A';
    if (raised >= 1000000000) return `$${(raised / 1000000000).toFixed(1)}B`;
    return `$${(raised / 1000000).toFixed(0)}M`;
  };

  return (
    <section className="pt-32 pb-16 px-6 relative overflow-hidden">
      {/* Background forensic watermark */}
      <div className="absolute top-0 right-0 p-10 font-mono text-[120px] text-border-subtle opacity-5 pointer-events-none select-none font-bold rotate-12">
        DEEP-DIVE
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <nav className="flex items-center gap-2 font-mono text-[10px] text-text-muted uppercase tracking-[3px] mb-12">
          <span className="hover:text-text-primary cursor-pointer transition-colors">ARCHIVE</span>
          <span>/</span>
          <span className="hover:text-text-primary cursor-pointer transition-colors">CASE FILES</span>
          <span>/</span>
          <span className="text-amber-signal">{study.case_number}</span>
          <span>/</span>
          <span className="text-red-critical font-bold">[CLOSED — SHUTDOWN {study.shutdown_year}]</span>
        </nav>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-16">
          <div className="flex-1">
            <h1 className="font-display text-5xl md:text-8xl font-bold mb-8 text-text-primary tracking-tight">
              {study.company_name}
            </h1>
            <p className="text-amber-signal text-xl md:text-2xl font-body italic leading-relaxed max-w-2xl border-l-2 border-amber-signal/30 pl-6 py-2">
              "{study.summary}"
            </p>
          </div>
          
          <div className="w-full lg:w-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 lg:gap-10 bg-bg-surface-1 p-8 border border-border-subtle rounded-xl shadow-2xl min-w-[320px]">
            {[
              { label: 'FOUNDED', value: study.founded_year },
              { label: 'SHUTDOWN', value: study.shutdown_year },
              { label: 'TOTAL FUNDING', value: formatFunding(study.funding_raised) },
              { label: 'PEAK SIZE', value: study.employees_peak ? `${study.employees_peak}+` : 'N/A' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-[2px]">{stat.label}</div>
                <div className="font-mono text-xl font-bold text-text-primary">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="bg-violet-primary/10 text-violet-primary border border-violet-primary/20 px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-[2px] font-bold">
            {study.industry}
          </span>
          {(study.failure_reasons || []).map((reason) => (
            <span key={reason} className="bg-amber-signal/10 text-amber-signal border border-amber-signal/20 px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-[2px] font-bold">
              {reason}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

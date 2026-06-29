'use client';

import type { CaseStudy } from '@/lib/db/case-studies';
import { formatCurrencyCompact } from '@/lib/utils/format';
import { getLifespan, extractLocation, extractBusinessModel } from '@/lib/case-study-utils';
import { LogoImage } from '@/components/ui/LogoImage';

export function EditorialHero({ study }: { study: CaseStudy }) {
  const lifespan = getLifespan(study);
  const location = extractLocation(study);

  const metadataRows = [
    { label: 'Status', value: 'Closed / Defunct', accent: true },
    { label: 'Industry', value: study.industry || '—' },
    { label: 'Founded', value: study.founded_year?.toString() || '—' },
    { label: 'Closed', value: study.shutdown_year?.toString() || '—' },
    { label: 'Lifespan', value: lifespan },
    { label: 'Headquarters', value: location || '—' },
    { label: 'Business Model', value: extractBusinessModel(study) || '—' },
    { label: 'Total Funding', value: formatCurrencyCompact(study.funding_raised || 0), accent: true },
  ];

  return (
    <header className="relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%231A1714' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-32">
        {/* Case number + Industry */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--rust-accent)] font-medium">
            {study.case_number}
          </span>
          <span className="w-px h-3 bg-[var(--cream-dark)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            {study.industry || 'Archive'}
          </span>
          <span className="w-px h-3 bg-[var(--cream-dark)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--failed-red)] font-medium">
            Case Closed
          </span>
        </div>

        {/* Main hero: Logo + Name + Tagline */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
          <div className="flex-1 max-w-[800px]">
            <div className="flex items-center gap-6 mb-6">
              <LogoImage
                src={study.logo_url}
                name={study.company_name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-sm shrink-0"
              />
              <h1 className="font-display text-[clamp(48px,6vw,96px)] leading-[0.88] font-medium tracking-[-0.04em] text-[var(--ink-black)]">
                {study.company_name}
              </h1>
            </div>

            {study.summary && (
              <p className="font-sans text-[clamp(16px,1.2vw,20px)] leading-relaxed text-[var(--ink-soft)] max-w-[680px]">
                {study.summary}
              </p>
            )}

            {/* Tags */}
            {study.tags && study.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {study.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] uppercase tracking-[0.08em] px-3 py-1.5 border border-[var(--cream-dark)] text-[var(--ink-muted)] rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--cream-dark)]/40 rounded-sm overflow-hidden border border-[var(--cream-dark)]/40">
          {metadataRows.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--paper-white)] p-5 md:p-6"
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">
                {stat.label}
              </div>
              <div
                className="font-mono text-lg md:text-xl font-semibold leading-none"
                style={{ color: stat.accent ? 'var(--rust-accent)' : 'var(--ink-black)' }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--cream-base)] to-transparent pointer-events-none" />
    </header>
  );
}

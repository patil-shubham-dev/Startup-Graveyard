'use client';

import { CaseStudy } from '@/lib/db/case-studies';
import { formatCurrencyCompact } from '@/lib/utils/format';
import { LogoImage } from '@/components/ui/LogoImage';

export function DossierHero({ study }: { study: CaseStudy }) {
  return (
    <section
      style={{
        backgroundColor: 'var(--cream-deep)',
        borderBottom: '1.5px dashed var(--cream-dark)',
        padding: '80px 0 64px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Paper grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
        }}
      />

      <div className="sg-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb / Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--rust-accent)',
            }}
          >
            <span className="t-num">{study.case_number}</span>
          </span>
          <div
            style={{
              width: '1px',
              height: '10px',
              backgroundColor: 'var(--cream-dark)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
            }}
          >
            {study.industry || 'ARCHIVE'} {'//'} STATUS: CLOSED
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-8 mb-8">
          <h1
            className="t-hero"
            style={{
              marginBottom: '0',
              maxWidth: '15ch',
            }}
          >
            {study.company_name}
          </h1>
          <LogoImage src={study.logo_url} name={study.company_name} className="h-16 w-16 md:h-20 md:w-20 mb-2" />
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px',
            borderTop: '1.5px dashed var(--cream-dark)',
            paddingTop: '32px',
          }}
        >
          {[
            { label: 'CAPITAL_BURNED', value: formatCurrencyCompact(study.funding_raised || 0) },
            { label: 'LIFESPAN', value: `${(study.shutdown_year || 0) - (study.founded_year || 0)} YRS` },
            { label: 'LOCATION', value: study.location || 'REMOTE' },
            { label: 'EXIT_YEAR', value: String(study.shutdown_year || '—') },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--ink-muted)',
                  marginBottom: '8px',
                }}
              >
                {stat.label}
              </div>
                <div
                  className="t-num"
                  style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: stat.label === 'CAPITAL_BURNED' ? 'var(--rust-accent)' : 'var(--ink-black)',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

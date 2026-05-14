'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';
import { formatCurrency } from '@/lib/utils/format';

export function FeaturedCases() {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCaseStudies({ limit: 3 })
      .then(setCases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ backgroundColor: 'var(--cream-base)' }}>
      <div className="sg-container section-pad">
        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--rust-accent)',
            }}
          >
            ARCHIVE CURATION / 001
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
        </div>

        {/* Heading */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2 className="t-h2" style={{ maxWidth: '18ch' }}>
            Case studies designed for serious reading.
          </h2>
          <Link
            href="/explore"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--rust-accent)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'gap 0.2s ease',
              flexShrink: 0,
            }}
            className="archive-link"
          >
            VIEW FULL ARCHIVE <span style={{ transition: 'transform 0.2s ease' }}>→</span>
          </Link>
        </div>

        {/* Cards — asymmetric 3-column grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton-cream"
                style={{
                  height: i === 1 ? '420px' : '320px',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {cases.map((study, i) => (
              <Link
                key={study.id}
                href={`/case/${study.slug}`}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  gridRow: i === 1 ? 'span 1' : 'span 1',
                }}
              >
                <div
                  className="sg-card"
                  style={{
                    padding: '28px',
                    minHeight: i === 1 ? '420px' : '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top meta row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {study.industry || 'GENERAL'} / {study.case_number}
                    </span>
                    <span className="stamp-closed">CLOSED</span>
                  </div>

                  {/* Company name */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      fontSize: 'clamp(22px, 3vw, 28px)',
                      fontWeight: '700',
                      lineHeight: 1.05,
                      letterSpacing: '-0.02em',
                      color: 'var(--ink-black)',
                      marginBottom: '12px',
                    }}
                  >
                    {study.company_name}
                  </h3>

                  {/* Description */}
                  <p
                    className="line-clamp-2"
                    style={{
                      fontFamily: 'var(--font-source-serif), Georgia, serif',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--ink-soft)',
                      marginBottom: 'auto',
                    }}
                  >
                    {study.summary}
                  </p>

                  {/* Dashed divider */}
                  <div
                    style={{
                      borderTop: '1.5px dashed var(--cream-dark)',
                      margin: '20px 0',
                    }}
                  />

                  {/* Data row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: 'var(--ink-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        CAPITAL LOST
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '22px',
                          fontWeight: '700',
                          color: 'var(--rust-accent)',
                          lineHeight: 1,
                        }}
                      >
                        {formatCurrency(study.funding_raised || 0)}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: 'var(--ink-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        YEAR CLOSED
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '22px',
                          fontWeight: '700',
                          color: 'var(--ink-black)',
                          lineHeight: 1,
                        }}
                      >
                        {study.shutdown_year || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Primary failure tag */}
                  {study.failure_reasons?.[0] && (
                    <span className="stamp-tag">
                      {study.failure_reasons[0]}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

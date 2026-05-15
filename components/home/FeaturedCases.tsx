'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { listCaseStudies, CaseStudy } from '@/lib/db/case-studies';
import { formatCurrencyCompact } from '@/lib/utils/format';

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function FeaturedCases({ initialCases = [] }: { initialCases?: CaseStudy[] }) {
  const [cases, setCases] = useState<CaseStudy[]>(initialCases);
  const [loading, setLoading] = useState(initialCases.length === 0);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    if (initialCases.length === 0) {
      listCaseStudies({ limit: 3 })
        .then(setCases)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [initialCases.length]);

  return (
    <section
      style={{ backgroundColor: 'var(--cream-base)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle section texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.025,
          backgroundImage: `
            linear-gradient(to right, var(--ink-black) 1px, transparent 1px),
            linear-gradient(to bottom, var(--ink-black) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="sg-container section-pad" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--rust-accent)',
            }}
          >
            ARCHIVE CURATION / <span className="t-num">001</span>
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
        </div>

        {/* Heading row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2 className="t-h2" style={{ maxWidth: '18ch', lineHeight: 1.02 }}>
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
              transition: 'gap 0.25s ease',
              flexShrink: 0,
            }}
            className="archive-link"
          >
            VIEW FULL ARCHIVE <span style={{ transition: 'transform 0.25s ease' }}>→</span>
          </Link>
        </div>

        {/* Cards */}
        <div ref={ref}>
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton-cream"
                  style={{ height: '380px', borderRadius: '2px' }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                alignItems: 'stretch',
              }}
            >
              {cases.map((study, i) => (
                <Link
                  key={study.id}
                  href={`/case/${study.slug}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(28px)',
                    transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
                  }}
                >
                  <div
                    className="sg-card featured-case-card"
                    style={{
                      padding: '32px',
                      height: '100%',
                      minHeight: '380px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Top meta row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {study.industry || 'GENERAL'} / <span className="t-num">{study.case_number}</span>
                      </span>
                      <span className="stamp-closed">CLOSED</span>
                    </div>

                    {/* Company name */}
                    <h3
                      style={{
                        fontFamily: 'var(--font-cormorant), Georgia, serif',
                        fontSize: 'clamp(24px, 2.8vw, 30px)',
                        fontWeight: '700',
                        lineHeight: 1.02,
                        letterSpacing: '-0.025em',
                        color: 'var(--ink-black)',
                        marginBottom: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {study.company_name}
                    </h3>

                    {/* Description — grows to fill */}
                    <p
                      className="line-clamp-3"
                      style={{
                        fontFamily: 'var(--font-body), Georgia, serif',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        color: 'var(--ink-soft)',
                        flex: 1,
                      }}
                    >
                      {study.summary}
                    </p>

                    {/* Dashed divider — pinned before footer */}
                    <div
                      style={{
                        borderTop: '1.5px dashed var(--cream-dark)',
                        margin: '24px 0 20px',
                        flexShrink: 0,
                      }}
                    />

                    {/* Data row — pinned footer */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px',
                        flexShrink: 0,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-dm-mono), monospace',
                            fontSize: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: 'var(--ink-muted)',
                            marginBottom: '5px',
                          }}
                        >
                          CAPITAL LOST
                        </div>
                        <div
                          className="t-num"
                          style={{
                            fontSize: '22px',
                            fontWeight: '600',
                            color: 'var(--rust-accent)',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {formatCurrencyCompact(study.funding_raised || 0)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-dm-mono), monospace',
                            fontSize: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: 'var(--ink-muted)',
                            marginBottom: '5px',
                          }}
                        >
                          YEAR CLOSED
                        </div>
                        <div
                          className="t-num"
                          style={{
                            fontSize: '22px',
                            fontWeight: '600',
                            color: 'var(--ink-black)',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {study.shutdown_year || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Pattern tag — pinned absolute bottom */}
                    {study.failure_reasons?.[0] && (
                      <span className="stamp-tag" style={{ alignSelf: 'flex-start', flexShrink: 0 }}>
                        {study.failure_reasons[0]}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

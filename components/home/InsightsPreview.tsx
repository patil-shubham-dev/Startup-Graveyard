'use client';

import { useEffect, useRef } from 'react';

interface FailureItem {
  name: string;
  value: number;
}

interface LiquidationItem {
  name: string;
  amount: number;
  reason: string;
}

interface InsightsPreviewProps {
  failureData?: FailureItem[];
  topLiquidations?: LiquidationItem[];
}

function formatBig(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function HorizontalBars({ data, title }: { data: FailureItem[]; title: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && barRef.current) {
          const bars = barRef.current.querySelectorAll<HTMLElement>('.bar-fill');
          bars.forEach((bar) => {
            bar.style.width = bar.dataset.width || '0%';
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={barRef}>
      <div
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-muted)',
          marginBottom: '20px',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.slice(0, 5).map((item) => {
          const pct = Math.round((item.value / max) * 100);
          return (
            <div key={item.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '5px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--ink-soft)',
                    maxWidth: '28ch',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    color: 'var(--ink-muted)',
                    flexShrink: 0,
                  }}
                >
                  {item.value}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--cream-dark)',
                  borderRadius: '1px',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="bar-fill"
                  data-width={`${pct}%`}
                  style={{
                    width: '0%',
                    height: '100%',
                    backgroundColor: 'var(--ochre-signal)',
                    borderRadius: '1px',
                    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InsightsPreview({ failureData = [], topLiquidations = [] }: InsightsPreviewProps) {
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
            SIGNALS AT A GLANCE / 003
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
        </div>

        <h2 className="t-h2" style={{ marginBottom: '48px', maxWidth: '20ch' }}>
          Failure, quantified.
        </h2>

        {/* 60/40 split */}
        <div
          style={{
            display: 'grid',
            gap: '32px',
            alignItems: 'start',
          }}
          className="lg:grid-cols-[60fr_40fr]"
        >
          {/* LEFT: Two bar charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Chart 1: Failure distribution */}
            <div
              className="chart-card"
              style={{ padding: '28px' }}
            >
              <HorizontalBars
                data={failureData.length ? failureData : [
                  { name: 'No Market Need', value: 42 },
                  { name: 'Cash Exhaustion', value: 29 },
                  { name: 'Team Fracture', value: 23 },
                  { name: 'Competition', value: 19 },
                  { name: 'Pricing Failure', value: 18 },
                ]}
                title="PRIMARY CAUSE DISTRIBUTION"
              />
            </div>
          </div>

          {/* RIGHT: Largest capital losses */}
          <div
            className="chart-card"
            style={{ padding: '28px' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--ink-muted)',
                marginBottom: '20px',
              }}
            >
              LARGEST CAPITAL LOSSES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {(topLiquidations.length
                ? topLiquidations
                : [
                    { name: 'Theranos', amount: 945_000_000, reason: 'Fraud' },
                    { name: 'Quibi', amount: 1_750_000_000, reason: 'No PMF' },
                    { name: 'Jawbone', amount: 930_000_000, reason: 'Hardware' },
                    { name: 'WeWork', amount: 11_000_000_000, reason: 'Governance' },
                  ]
              ).map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '1.5px dashed var(--cream-dark)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '9px',
                        color: 'var(--rust-accent)',
                        minWidth: '16px',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: 'var(--ink-black)',
                          lineHeight: 1,
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: 'var(--ink-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {item.reason}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: 'var(--rust-accent)',
                    }}
                  >
                    {formatBig(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

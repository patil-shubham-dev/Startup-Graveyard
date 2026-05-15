'use client';

import { useEffect, useRef } from 'react';
import { formatCurrencyCompact } from '@/lib/utils/format';

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
          letterSpacing: '0.16em',
          color: 'var(--ink-muted)',
          marginBottom: '24px',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.slice(0, 5).map((item) => {
          const pct = Math.round((item.value / max) * 100);
          return (
            <div key={item.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '7px',
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
                  className="t-num"
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
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
                  height: '5px',
                  backgroundColor: 'var(--cream-dark)',
                  borderRadius: '2px',
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
                    borderRadius: '2px',
                    transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
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
    <section
      style={{
        backgroundColor: 'var(--cream-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle warm radial highlight */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '60%',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(200,146,42,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
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
            SIGNALS AT A GLANCE / <span className="t-num">003</span>
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
        </div>

        <h2 className="t-h2" style={{ marginBottom: '40px', maxWidth: '16ch', lineHeight: 1.02 }}>
          Failure, quantified.
        </h2>

        {/* 60/40 split */}
        <div
          style={{
            display: 'grid',
            gap: '24px',
            alignItems: 'stretch',
          }}
          className="lg:grid-cols-[60fr_40fr]"
        >
          {/* LEFT: Bar chart */}
          <div
            className="chart-card"
            style={{ padding: '36px' }}
          >
            <HorizontalBars
              data={
                failureData.length
                  ? failureData
                  : [
                      { name: 'No Market Need', value: 42 },
                      { name: 'Cash Exhaustion', value: 29 },
                      { name: 'Team Fracture', value: 23 },
                      { name: 'Competition', value: 19 },
                      { name: 'Pricing Failure', value: 18 },
                    ]
              }
              title="PRIMARY CAUSE DISTRIBUTION"
            />
          </div>

          {/* RIGHT: Largest capital losses */}
          <div
            className="chart-card"
            style={{ padding: '36px' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'var(--ink-muted)',
                marginBottom: '24px',
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
                    padding: '16px 0',
                    borderBottom: '1.5px dashed var(--cream-dark)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      className="t-num"
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--rust-accent)',
                        minWidth: '18px',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '19px',
                          fontWeight: '700',
                          color: 'var(--ink-black)',
                          lineHeight: 1,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: 'var(--ink-muted)',
                          marginTop: '3px',
                        }}
                      >
                        {item.reason}
                      </div>
                    </div>
                  </div>
                  <span
                    className="t-num"
                    style={{
                      fontSize: '21px',
                      fontWeight: '600',
                      color: 'var(--rust-accent)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrencyCompact(item.amount)}
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HistoricalPeriod } from '@/lib/db/insights-data';

interface Props {
  periods: HistoricalPeriod[];
  hasData: boolean;
}

const eraColors: Record<string, string> = {
  'Early Industrial': 'var(--ink-muted)',
  'The PC Revolution': 'var(--sage-neutral)',
  'The Dot-Com Aftermath': 'var(--ochre-signal)',
  'The Unicorn Era': 'var(--rust-accent)',
  'The Correction': '#980002',
};

export default function HistoryOfFailure({ periods, hasData }: Props) {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);

  if (!hasData || !periods.length) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        backgroundColor: 'var(--cream-deep)',
        border: '1.5px dashed var(--cream-dark)',
        borderRadius: '2px',
      }}>
        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', marginBottom: '8px' }}>
          INSUFFICIENT ARCHIVE DATA
        </div>
        <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '13px', color: 'var(--ink-muted)' }}>
          Add case studies spanning different decades to build the historical timeline.
        </p>
      </div>
    );
  }

  const sortedPeriods = [...periods].reverse();

  return (
    <div>
      {/* Era navigation */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '36px',
        overflowX: 'auto',
        borderBottom: '1.5px dashed var(--cream-dark)',
      }}>
        {sortedPeriods.map((period) => (
          <button
            key={period.era}
            onClick={() => setActivePeriod(activePeriod === period.era ? null : period.era)}
            style={{
              flex: '0 0 auto',
              padding: '14px 22px',
              background: activePeriod === period.era ? eraColors[period.era] || 'var(--rust-accent)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: activePeriod === period.era ? 'white' : 'var(--ink-muted)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              position: 'relative',
            }}
            onMouseEnter={e => { if (activePeriod !== period.era) e.currentTarget.style.backgroundColor = 'var(--cream-deep)'; }}
            onMouseLeave={e => { if (activePeriod !== period.era) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {period.era}
            <span style={{ display: 'block', fontSize: '7px', opacity: 0.7, marginTop: '2px' }}>
              {period.yearRange}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline narrative */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '14px',
          top: '0',
          bottom: '0',
          width: '1.5px',
          backgroundColor: 'var(--cream-dark)',
        }} />

        {sortedPeriods.map((period) => {
          const isExpanded = activePeriod === null || activePeriod === period.era;
          const color = eraColors[period.era] || 'var(--ink-muted)';

          if (!isExpanded) return null;

          return (
            <div key={period.era} style={{ position: 'relative', paddingLeft: '44px', paddingBottom: '40px' }}>
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '8px',
                top: '4px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: color,
                border: '2px solid var(--cream-base)',
                zIndex: 1,
              }} />

              <div style={{
                padding: '20px 24px',
                backgroundColor: 'var(--paper-white)',
                border: '1.5px dashed var(--cream-dark)',
                borderLeft: `3px solid ${color}`,
                borderRadius: '2px',
              }}>
                {/* Era header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: color,
                      marginBottom: '4px',
                    }}>
                      {period.yearRange}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      fontSize: 'clamp(20px, 1.8vw, 26px)',
                      fontWeight: '600',
                      color: 'var(--ink-black)',
                      lineHeight: 1.1,
                    }}>
                      {period.era}: {period.theme}
                    </h3>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    color: 'var(--ink-muted)',
                    padding: '2px 8px',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '1px',
                    flexShrink: 0,
                  }}>
                    {period.events.length} collapses
                  </span>
                </div>

                {/* Lesson */}
                <p style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: 'var(--ink-soft)',
                  marginBottom: '16px',
                  fontStyle: 'italic',
                  paddingLeft: '0',
                }}>
                  &ldquo;{period.lesson}&rdquo;
                </p>

                {/* Events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {period.events.slice(0, 8).map((event, i) => (
                    <Link key={i} href={`/case/${event.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1fr',
                        gap: '12px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--cream-deep)',
                        border: '1px solid var(--cream-dark)',
                        borderRadius: '1px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}>
                        <div className="t-num" style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: color,
                          lineHeight: 1.3,
                        }}>
                          {event.year}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-inter), system-ui, sans-serif',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--ink-black)',
                            lineHeight: 1.3,
                          }}>
                            {event.event}
                          </div>
                          {event.significance && (
                            <div style={{
                              fontFamily: 'var(--font-dm-mono), monospace',
                              fontSize: '8px',
                              color: 'var(--ink-muted)',
                              marginTop: '2px',
                            }}>
                              {event.significance}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {period.events.length > 8 && (
                  <div style={{
                    marginTop: '10px',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    color: 'var(--ink-muted)',
                    textAlign: 'center',
                  }}>
                    +{period.events.length - 8} more events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global economic events annotation */}
      {sortedPeriods.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: 'var(--cream-deep)',
          border: '1.5px dashed var(--cream-dark)',
          borderRadius: '2px',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '11px',
          lineHeight: 1.6,
          color: 'var(--ink-muted)',
          textAlign: 'center',
        }}>
          This timeline tracks the evolution of business failure across economic cycles, technology transitions, and market corrections. Each era reflects shifting patterns of how and why companies collapse.
        </div>
      )}
    </div>
  );
}

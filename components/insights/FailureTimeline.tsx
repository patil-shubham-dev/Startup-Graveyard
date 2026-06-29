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

export default function FailureTimeline({ periods, hasData }: Props) {
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
        marginBottom: '40px',
        borderBottom: '1.5px dashed var(--cream-dark)',
        overflowX: 'auto',
      }}>
        {sortedPeriods.map((period) => (
          <button
            key={period.era}
            onClick={() => setActivePeriod(activePeriod === period.era ? null : period.era)}
            style={{
              flex: '0 0 auto',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activePeriod === period.era ? '2px solid var(--rust-accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: activePeriod === period.era ? 'var(--rust-accent)' : 'var(--ink-muted)',
              transition: 'color 0.2s, border-color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {period.era}
            <span style={{ display: 'block', fontSize: '8px', opacity: 0.6, marginTop: '2px' }}>
              {period.yearRange}
            </span>
          </button>
        ))}
      </div>

      {/* Visible periods */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {sortedPeriods.map((period) => {
          const isExpanded = activePeriod === null || activePeriod === period.era;
          if (!isExpanded) return null;

          return (
            <div key={period.era} style={{
              padding: '24px',
              backgroundColor: 'var(--cream-deep)',
              border: '1.5px dashed var(--cream-dark)',
              borderRadius: '2px',
              borderLeft: `3px solid ${eraColors[period.era] || 'var(--cream-dark)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: eraColors[period.era] || 'var(--ink-muted)',
                    marginBottom: '4px',
                  }}>
                    {period.yearRange}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: '22px',
                    fontWeight: '600',
                    color: 'var(--ink-black)',
                    lineHeight: 1.1,
                  }}>
                    {period.era}: {period.theme}
                  </h3>
                </div>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  color: 'var(--ink-muted)',
                }}>
                  {period.events.length} event{period.events.length !== 1 ? 's' : ''}
                </span>
              </div>

              <p style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'var(--ink-muted)',
                marginBottom: '16px',
                fontStyle: 'italic',
              }}>
                {period.lesson}
              </p>

              {/* Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {period.events.map((event, i) => (
                  <Link key={i} href={`/case/${event.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr',
                      gap: '12px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--paper-white)',
                      border: '1px solid var(--cream-dark)',
                      borderRadius: '1px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--rust-accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}
                    >
                      <div className="t-num" style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--rust-accent)',
                        lineHeight: 1.2,
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
                        <div style={{
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '9px',
                          color: 'var(--ink-muted)',
                          marginTop: '2px',
                        }}>
                          {event.significance}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

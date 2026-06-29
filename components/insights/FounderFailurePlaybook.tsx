'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FounderMistake } from '@/lib/db/insights-data';

interface Props {
  mistakes: FounderMistake[];
  hasData: boolean;
}

const severityColors: Record<number, string> = {
  1: 'var(--failed-red)',
  2: 'var(--rust-accent)',
  3: 'var(--ochre-signal)',
};

export default function FounderFailurePlaybook({ mistakes, hasData }: Props) {
  const [expandedMistake, setExpandedMistake] = useState<string | null>(null);

  if (!hasData || !mistakes.length) {
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
          Add more case studies to identify founder mistake patterns.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {mistakes.map((mistake) => {
        const isExpanded = expandedMistake === mistake.mistake;
        const severityColor = severityColors[mistake.rank as keyof typeof severityColors] || 'var(--ink-muted)';

        return (
          <div
            key={mistake.mistake}
            onClick={() => setExpandedMistake(isExpanded ? null : mistake.mistake)}
            style={{
              backgroundColor: 'var(--paper-white)',
              border: '1.5px dashed var(--cream-dark)',
              borderLeft: `4px solid ${severityColor}`,
              borderRadius: '2px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = severityColor; }}
            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--cream-dark)'; }}
          >
            <div style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="t-num" style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '24px',
                    fontWeight: '600',
                    color: severityColor,
                    lineHeight: 1,
                  }}>
                    {String(mistake.rank).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: severityColor,
                      marginBottom: '2px',
                    }}>
                      WARNING LEVEL {mistake.rank <= 2 ? 'CRITICAL' : mistake.rank <= 4 ? 'HIGH' : 'MEDIUM'}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      fontSize: '19px',
                      fontWeight: '600',
                      color: 'var(--ink-black)',
                      lineHeight: 1.2,
                    }}>
                      {mistake.mistake}
                    </h3>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className="t-num" style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: severityColor,
                  }}>
                    {mistake.count}
                  </span>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                    cases · {mistake.percentage}%
                  </div>
                </div>
              </div>

              <p style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'var(--ink-soft)',
                marginTop: '8px',
                paddingLeft: '40px',
              }}>
                {mistake.description}
              </p>

              {isExpanded && mistake.supportingCases.length > 0 && (
                <div style={{
                  marginTop: '14px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--cream-dark)',
                  paddingLeft: '40px',
                }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                    Historical Examples
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {mistake.supportingCases.slice(0, 8).map(c => (
                      <Link key={c.slug} href={`/case/${c.slug}`} style={{ textDecoration: 'none' }}>
                        <span className="stamp-tag" style={{ fontSize: '8px', cursor: 'pointer' }}>
                          {c.company}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '12px',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    color: 'var(--ink-muted)',
                  }}>
                    Most affected industries: {mistake.supportingCases.slice(0, 3).map(c => c.company).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

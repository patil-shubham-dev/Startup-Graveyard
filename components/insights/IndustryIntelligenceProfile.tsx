'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { IndustryData } from '@/lib/db/insights-data';

interface Props {
  industries: IndustryData[];
  hasData: boolean;
}

function fmt(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num}`;
}

export default function IndustryIntelligenceProfile({ industries, hasData }: Props) {
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);

  if (!hasData || !industries.length) {
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
          Add more case studies to analyze industry distribution.
        </p>
      </div>
    );
  }

  const maxCases = Math.max(...industries.map(i => i.caseCount));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {industries.map((ind) => {
        const isExpanded = expandedIndustry === ind.industry;
        const barWidth = (ind.caseCount / maxCases) * 100;

        return (
          <div
            key={ind.industry}
            onClick={() => setExpandedIndustry(isExpanded ? null : ind.industry)}
            style={{
              backgroundColor: 'var(--paper-white)',
              border: '1.5px dashed var(--cream-dark)',
              borderRadius: '2px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rust-accent)'; }}
            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--cream-dark)'; }}
          >
            <div style={{
              padding: '16px 20px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${barWidth}%`,
                backgroundColor: 'var(--cream-deep)',
                opacity: 0.4,
                transition: 'width 0.3s ease',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: '19px',
                    fontWeight: '600',
                    color: 'var(--ink-black)',
                    lineHeight: 1.1,
                  }}>
                    {ind.industry}
                  </h3>
                  <span className="t-num" style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '22px',
                    fontWeight: '600',
                    color: 'var(--rust-accent)',
                    lineHeight: 1,
                  }}>
                    {ind.caseCount}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-black)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                      {ind.failureRate}%
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                      Of Archive
                    </div>
                  </div>
                  <div>
                    <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-black)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                      {ind.totalFundingDisplay}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                      Total Destroyed
                    </div>
                  </div>
                  <div>
                    <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-black)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                      {ind.avgLifespan > 0 ? `${ind.avgLifespan} yrs` : '—'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                      Avg Lifespan
                    </div>
                  </div>
                  {ind.mostNotableFailure && (
                    <div>
                      <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--failed-red)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                        {fmt(ind.mostNotableFailure.funding)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
                        Costliest Failure
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div style={{
                borderTop: '1.5px dashed var(--cream-dark)',
                padding: '16px 20px',
                backgroundColor: 'var(--cream-deep)',
              }}>
                {ind.commonCauses.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}>
                      Most Common Causes
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {ind.commonCauses.map(c => (
                        <span key={c.name} className="stamp-tag" style={{ fontSize: '8px' }}>
                          {c.name} ({c.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ind.mostNotableFailure && (
                  <Link href={`/case/${ind.mostNotableFailure.slug}`} style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--rust-accent)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    View Industry Deep-Dive →
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

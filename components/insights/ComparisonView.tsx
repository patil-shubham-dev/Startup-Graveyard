'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ComparisonPair } from '@/lib/db/insights-data';

interface Props {
  comparisons: ComparisonPair[];
  hasData: boolean;
}

export default function ComparisonView({ comparisons, hasData }: Props) {
  const [activeComparison, setActiveComparison] = useState<string | null>(
    comparisons.length > 0 ? comparisons[0].id : null
  );

  if (!hasData || !comparisons.length) {
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
          Add more case studies to enable failure comparisons.
        </p>
      </div>
    );
  }

  const current = comparisons.find(c => c.id === activeComparison) || comparisons[0];

  return (
    <div>
      {/* Comparison selector */}
      {comparisons.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {comparisons.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setActiveComparison(comp.id)}
              style={{
                padding: '8px 16px',
                background: activeComparison === comp.id ? 'var(--rust-accent)' : 'transparent',
                border: `1px solid ${activeComparison === comp.id ? 'var(--rust-accent)' : 'var(--cream-dark)'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: activeComparison === comp.id ? 'white' : 'var(--ink-muted)',
                transition: 'all 0.15s',
              }}
            >
              {comp.companyA.name} vs {comp.companyB.name}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div style={{
          backgroundColor: 'var(--cream-deep)',
          border: '1.5px dashed var(--cream-dark)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          {/* Comparison grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 1fr',
            borderBottom: '1.5px dashed var(--cream-dark)',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              borderRight: '1.5px dashed var(--cream-dark)',
              backgroundColor: 'var(--cream-base)',
            }}>
              Metric
            </div>
            <div style={{
              padding: '16px 20px',
              textAlign: 'center',
              borderRight: '1.5px dashed var(--cream-dark)',
              backgroundColor: 'var(--cream-base)',
            }}>
              <Link href={`/case/${current.companyA.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--rust-accent)',
                }}>
                  {current.companyA.name}
                </span>
              </Link>
            </div>
            <div style={{
              padding: '16px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--cream-base)',
            }}>
              <Link href={`/case/${current.companyB.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--rust-accent)',
                }}>
                  {current.companyB.name}
                </span>
              </Link>
            </div>
          </div>

          {/* Rows */}
          {[
            { label: 'Funding', a: current.companyA.fundingDisplay, b: current.companyB.fundingDisplay },
            { label: 'Lifespan', a: `${current.companyA.lifespan} years`, b: `${current.companyB.lifespan} years` },
            { label: 'Industry', a: current.companyA.industry, b: current.companyB.industry },
            { label: 'Failure Reason', a: current.companyA.failureReason, b: current.companyB.failureReason },
            { label: 'Key Mistakes', a: current.companyA.mistakes.join(', '), b: current.companyB.mistakes.join(', ') },
            { label: 'Outcome', a: current.companyA.outcome, b: current.companyB.outcome },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 1fr',
                borderBottom: i < 5 ? '1.5px dashed var(--cream-dark)' : 'none',
              }}
            >
              <div style={{
                padding: '12px 20px',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--ink-muted)',
                borderRight: '1.5px dashed var(--cream-dark)',
                backgroundColor: 'var(--cream-base)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {row.label}
              </div>
              <div style={{
                padding: '12px 20px',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '13px',
                color: 'var(--ink-black)',
                lineHeight: 1.4,
                borderRight: '1.5px dashed var(--cream-dark)',
              }}>
                {row.a}
              </div>
              <div style={{
                padding: '12px 20px',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '13px',
                color: 'var(--ink-black)',
                lineHeight: 1.4,
              }}>
                {row.b}
              </div>
            </div>
          ))}

          {/* Lessons */}
          {current.lessons.length > 0 && (
            <div style={{
              padding: '20px',
              borderTop: '1.5px dashed var(--cream-dark)',
              backgroundColor: 'var(--cream-base)',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--rust-accent)',
                marginBottom: '10px',
              }}>
                Lessons
              </div>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
              }}>
                {current.lessons.map((lesson, i) => (
                  <li key={i} style={{
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--ink-muted)',
                    padding: '6px 0',
                    borderBottom: i < current.lessons.length - 1 ? '1px solid var(--cream-dark)' : 'none',
                    paddingLeft: '16px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      top: '10px',
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--rust-accent)',
                      borderRadius: '50%',
                    }} />
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

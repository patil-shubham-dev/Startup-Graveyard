'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ComparisonPair } from '@/lib/db/insights-data';

interface Props {
  comparisons: ComparisonPair[];
  hasData: boolean;
}

export default function CompareFailures({ comparisons, hasData }: Props) {
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
      {comparisons.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '6px',
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
                fontSize: '9px',
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
          backgroundColor: 'var(--paper-white)',
          border: '1.5px dashed var(--cream-dark)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          {/* Story header */}
          <div style={{
            padding: '24px',
            borderBottom: '1.5px dashed var(--cream-dark)',
            backgroundColor: 'var(--cream-deep)',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--rust-accent)',
              marginBottom: '8px',
            }}>
              SIDE-BY-SIDE FAILURE ANALYSIS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '16px',
              alignItems: 'center',
            }}>
              <Link href={`/case/${current.companyA.slug}`} style={{ textDecoration: 'none', textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(22px, 2vw, 28px)',
                  fontWeight: '600',
                  color: 'var(--rust-accent)',
                  lineHeight: 1.1,
                }}>
                  {current.companyA.name}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  {current.companyA.industry}
                </div>
              </Link>
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--ink-muted)',
                padding: '0 8px',
              }}>
                VS
              </div>
              <Link href={`/case/${current.companyB.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(22px, 2vw, 28px)',
                  fontWeight: '600',
                  color: 'var(--rust-accent)',
                  lineHeight: 1.1,
                }}>
                  {current.companyB.name}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                  {current.companyB.industry}
                </div>
              </Link>
            </div>
          </div>

          {/* Visual metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
          }}>
            {[
              {
                label: 'Funding',
                aVal: current.companyA.funding,
                bVal: current.companyB.funding,
                aDisplay: current.companyA.fundingDisplay,
                bDisplay: current.companyB.fundingDisplay,
              },
              {
                label: 'Lifespan',
                aVal: current.companyA.lifespan,
                bVal: current.companyB.lifespan,
                aDisplay: `${current.companyA.lifespan} years`,
                bDisplay: `${current.companyB.lifespan} years`,
              },
            ].map((metric) => {
              const maxVal = Math.max(metric.aVal, metric.bVal, 1);
              return (
                <div key={metric.label} style={{
                  padding: '20px',
                  borderRight: '1.5px dashed var(--cream-dark)',
                  borderBottom: '1.5px dashed var(--cream-dark)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--ink-muted)',
                    marginBottom: '12px',
                    textAlign: 'center',
                  }}>
                    {metric.label}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div className="t-num" style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--rust-accent)',
                      }}>
                        {metric.aDisplay}
                      </div>
                      <div style={{
                        height: '4px',
                        backgroundColor: 'var(--cream-dark)',
                        borderRadius: '2px',
                        marginTop: '6px',
                        overflow: 'hidden',
                        maxWidth: '120px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(metric.aVal / maxVal) * 100}%`,
                          backgroundColor: 'var(--rust-accent)',
                          borderRadius: '2px',
                        }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div className="t-num" style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--ochre-signal)',
                      }}>
                        {metric.bDisplay}
                      </div>
                      <div style={{
                        height: '4px',
                        backgroundColor: 'var(--cream-dark)',
                        borderRadius: '2px',
                        marginTop: '6px',
                        overflow: 'hidden',
                        maxWidth: '120px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(metric.bVal / maxVal) * 100}%`,
                          backgroundColor: 'var(--ochre-signal)',
                          borderRadius: '2px',
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mistakes comparison */}
          <div style={{
            padding: '20px',
            borderBottom: '1.5px dashed var(--cream-dark)',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
              marginBottom: '10px',
            }}>
              Key Mistakes
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                {current.companyA.mistakes.map((m, i) => (
                  <div key={i} style={{
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: 'var(--ink-soft)',
                    padding: '3px 0',
                    paddingLeft: '12px',
                    borderLeft: '2px solid var(--rust-accent)',
                    marginBottom: '4px',
                  }}>
                    {m}
                  </div>
                ))}
              </div>
              <div>
                {current.companyB.mistakes.map((m, i) => (
                  <div key={i} style={{
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: 'var(--ink-soft)',
                    padding: '3px 0',
                    paddingLeft: '12px',
                    borderLeft: '2px solid var(--ochre-signal)',
                    marginBottom: '4px',
                  }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lessons */}
          {current.lessons.length > 0 && (
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--cream-deep)',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--rust-accent)',
                marginBottom: '10px',
              }}>
                Shared Lessons
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {current.lessons.map((lesson, i) => (
                  <li key={i} style={{
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--ink-soft)',
                    padding: '6px 0',
                    paddingLeft: '16px',
                    position: 'relative',
                    borderBottom: i < current.lessons.length - 1 ? '1px solid var(--cream-dark)' : 'none',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      top: '12px',
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

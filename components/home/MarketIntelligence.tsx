'use client';

import { formatCurrencyCompact } from '@/lib/utils/format';

interface FailureDatum {
  name: string;
  value: number;
  color?: string;
}

interface LiquidationItem {
  name: string;
  amount: number;
  reason: string;
}

interface MarketIntelligenceProps {
  failureData?: FailureDatum[];
  topLiquidations?: LiquidationItem[];
}

export function MarketIntelligence({ failureData = [], topLiquidations = [] }: MarketIntelligenceProps) {
  const bars = failureData.slice(0, 5);
  const maxValue = Math.max(...bars.map((item) => item.value), 1);

  return (
    <section className="sg-container" style={{ padding: '80px 0' }}>
      <div style={{ marginBottom: '40px' }}>
        <span style={{ 
          display: 'block', 
          fontFamily: 'var(--font-dm-mono), monospace', 
          fontSize: '10px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em', 
          color: 'var(--rust-accent)',
          marginBottom: '12px'
        }}>
          INTEL ANALYTICS / 003
        </span>
        <h2 style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: '700',
          color: 'var(--ink-black)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '16px'
        }}>
          Signals that read cleanly at a glance.
        </h2>
        <p style={{
          fontFamily: 'var(--font-source-serif), serif',
          fontSize: '15px',
          color: 'var(--ink-soft)',
          lineHeight: 1.6,
          maxWidth: '660px'
        }}>
          These summaries are tied to the archive data, but presented with more restraint so the numbers feel useful instead of ornamental.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px' 
      }}>
        {/* Cause Distribution */}
        <div style={{ 
          backgroundColor: 'var(--cream-deep)', 
          border: '1px solid var(--cream-dark)', 
          borderRadius: '2px',
          padding: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-dm-mono), monospace', 
              fontSize: '9px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.12em', 
              color: 'var(--ink-muted)' 
            }}>
              Failure distribution
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bars.map((item, index) => {
              const width = `${Math.max(12, Math.round((item.value / maxValue) * 100))}%`;

              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <div>
                      <span className="t-num" style={{ 
                        fontFamily: 'var(--font-crimson), serif',
                        fontSize: '10px', 
                        color: 'var(--ink-muted)',
                        display: 'block',
                        marginBottom: '2px'
                      }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h4 style={{ 
                        fontFamily: 'var(--font-source-serif), serif', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: 'var(--ink-black)' 
                      }}>
                        {item.name}
                      </h4>
                    </div>
                    <span className="t-num" style={{ 
                      fontFamily: 'var(--font-crimson), serif',
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: 'var(--rust-accent)' 
                    }}>
                      {item.value}
                    </span>
                  </div>

                  <div style={{ height: '2px', backgroundColor: 'var(--cream-dark)', width: '100%' }}>
                    <div
                      style={{ 
                        height: '100%', 
                        backgroundColor: 'var(--rust-accent)', 
                        width: '100%',
                        transform: `scaleX(${Math.max(0.12, (item.value / maxValue))})`,
                        transformOrigin: 'left',
                        transition: 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capital Loss */}
        <div style={{ 
          backgroundColor: 'var(--cream-deep)', 
          border: '1px solid var(--cream-dark)', 
          borderRadius: '2px',
          padding: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-dm-mono), monospace', 
              fontSize: '9px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.12em', 
              color: 'var(--ink-muted)' 
            }}>
              Largest capital losses
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topLiquidations.map((item, index) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  borderBottom: '1px dashed var(--cream-dark)'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ 
                    fontFamily: 'var(--font-source-serif), serif', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: 'var(--ink-black)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </h4>
                  <p style={{ 
                    fontFamily: 'var(--font-dm-mono), monospace', 
                    fontSize: '8px', 
                    textTransform: 'uppercase', 
                    color: 'var(--ink-muted)',
                    marginTop: '2px'
                  }}>
                    {item.reason}
                  </p>
                </div>
                <span className="t-num" style={{ 
                  fontFamily: 'var(--font-crimson), serif',
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'var(--ink-black)',
                  marginLeft: '12px'
                }}>
                  {formatCurrencyCompact(item.amount)}
                </span>
              </div>
            ))}

            {topLiquidations.length === 0 && (
              <div style={{ 
                fontFamily: 'var(--font-dm-mono), monospace', 
                fontSize: '10px', 
                textTransform: 'uppercase', 
                color: 'var(--ink-muted)',
                textAlign: 'center',
                padding: '24px'
              }}>
                Data sync pending
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

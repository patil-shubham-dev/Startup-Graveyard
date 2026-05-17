'use client';

import { formatCurrencyCompact } from '@/lib/utils/format';
import { usePathname } from 'next/navigation';

interface FooterProps {
  stats?: {
    totalCases: number;
    totalBurned: number;
  };
}


export function Footer({ stats }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === '/ask') return null;

  return (
    <footer
      style={{
        backgroundColor: 'var(--cream-deep)',
        borderTop: '1.5px dashed var(--cream-dark)',
      }}
    >
      <div
        className="sg-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'flex-start',
          }}
          className="lg:flex-row lg:justify-between lg:items-center"
        >
          {/* Left: Logo + tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: 'var(--cream-base)',
                border: '1px solid var(--cream-dark)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 2px rgba(26,23,20,0.12)',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--ink-black)',
                }}
              >
                SG
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-black)',
                }}
              >
                Startup Graveyard
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  fontWeight: '300',
                  color: 'var(--ink-muted)',
                  marginTop: '2px',
                  letterSpacing: '0.04em',
                }}
              >
                Forensic intelligence for failed companies
              </div>
            </div>
          </div>

          {/* Right: Live stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
            }}
          >
            {[
              { label: 'CASES_ARCHIVED', value: String(stats?.totalCases || 0) },
              { label: 'CAPITAL_DESTROYED', value: formatCurrencyCompact(stats?.totalBurned || 0) },
              { label: 'STATUS', value: 'OPERATIONAL' },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: '12px 20px',
                  borderLeft: i > 0 ? '1.5px dashed var(--cream-dark)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--ink-muted)',
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="t-num"
                  style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: item.label === 'STATUS' ? 'var(--sage-neutral)' : 'var(--ink-black)',
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: copyright */}
        <div
          style={{
            borderTop: '1.5px dashed var(--cream-dark)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
            }}
          >
            © <span className="t-num">{currentYear}</span> Startup Graveyard. All rights reserved.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
            }}
          >
            Built as a research archive for startup failure intelligence.
          </span>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState } from 'react';
import { formatCurrencyCompact } from '@/lib/utils/format';
import type { IntelligenceBriefing } from '@/lib/db/insights-data';

interface Props {
  briefing: IntelligenceBriefing;
  totalCases: number;
  totalBurned: number;
  avgLifespan: number;
  hasData: boolean;
}

export default function FailureIntelligenceReport({ briefing, totalCases, totalBurned, avgLifespan, hasData }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const intelItems = [
    {
      id: 'discovery',
      label: 'Most Important Discovery',
      value: briefing.newDiscovery.finding,
      stat: `${briefing.newDiscovery.evidenceCount} supporting cases`,
      color: 'var(--failed-red)',
      detail: briefing.newDiscovery.description,
    },
    {
      id: 'pattern',
      label: 'Most Common Failure Pattern',
      value: briefing.mostCommonFailureCause.name,
      stat: `${briefing.mostCommonFailureCause.count} cases (${briefing.mostCommonFailureCause.percentage}%)`,
      color: 'var(--rust-accent)',
      detail: `The most frequently observed failure cause across the archive.`,
    },
    {
      id: 'mistake',
      label: 'Emerging Founder Mistake',
      value: briefing.mostDangerousFounderMistake.mistake,
      stat: `${briefing.mostDangerousFounderMistake.count} cases (${briefing.mostDangerousFounderMistake.percentage}%)`,
      color: 'var(--ochre-signal)',
      detail: `Founder mistake appearing with increasing frequency in recent failures.`,
    },
    {
      id: 'trend',
      label: 'Most Dangerous Market Trend',
      value: briefing.emergingPattern.pattern,
      stat: briefing.emergingPattern.evidence.length > 0 ? `Observed in recent failures` : 'Monitor',
      color: 'var(--sage-neutral)',
      detail: briefing.emergingPattern.description,
    },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--ink-black)',
      color: 'var(--paper-white)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `radial-gradient(var(--paper-white) 0.5px, transparent 0.5px)`,
        backgroundSize: '3px 3px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(181,74,42,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="sg-container" style={{ paddingTop: '64px', paddingBottom: '64px', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--rust-accent)',
          marginBottom: '8px',
          opacity: 0.9,
        }}>
          INTELLIGENCE REPORT // V.03 // {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '64px',
          alignItems: 'start',
        }} className="lg:grid-cols-1">
          <div>
            <h1 style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(42px, 4.5vw, 72px)',
              fontWeight: '500',
              lineHeight: 0.93,
              color: 'var(--paper-white)',
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}>
              Failure Intelligence<br />Report.
            </h1>
            <p style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: 'clamp(14px, 1vw, 16px)',
              lineHeight: 1.7,
              color: 'rgba(253,250,245,0.65)',
              marginBottom: '40px',
              maxWidth: '48ch',
            }}>
              Systematic analysis of {hasData ? `${totalCases} archived` : 'thousands of'} business failures. Each case is decomposed into patterns, causes, and lessons to build the world&apos;s largest intelligence database of why startups die.
            </p>

            <div style={{
              display: 'flex',
              gap: '32px',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(253,250,245,0.1)',
              paddingTop: '28px',
            }}>
              <div>
                <div className="t-num" style={{ fontSize: 'clamp(32px, 2.5vw, 44px)', fontWeight: '500', lineHeight: 1, color: 'var(--paper-white)', letterSpacing: '-0.02em', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                  {hasData ? totalCases : '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(253,250,245,0.5)', marginTop: '6px' }}>
                  Archived Cases
                </div>
              </div>
              <div>
                <div className="t-num" style={{ fontSize: 'clamp(32px, 2.5vw, 44px)', fontWeight: '500', lineHeight: 1, color: 'var(--rust-accent)', letterSpacing: '-0.02em', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                  {hasData ? formatCurrencyCompact(totalBurned * 100) : '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(253,250,245,0.5)', marginTop: '6px' }}>
                  Capital Destroyed
                </div>
              </div>
              <div>
                <div className="t-num" style={{ fontSize: 'clamp(32px, 2.5vw, 44px)', fontWeight: '500', lineHeight: 1, color: 'var(--paper-white)', letterSpacing: '-0.02em', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                  {hasData ? `${avgLifespan} YRS` : '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(253,250,245,0.5)', marginTop: '6px' }}>
                  Avg Lifespan
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {intelItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveSection(activeSection === item.id ? null : item.id)}
                style={{
                  backgroundColor: activeSection === item.id ? 'rgba(253,250,245,0.08)' : 'rgba(253,250,245,0.04)',
                  border: `1px solid ${activeSection === item.id ? item.color : 'rgba(253,250,245,0.08)'}`,
                  borderRadius: '2px',
                  padding: '18px 22px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(253,250,245,0.08)'; e.currentTarget.style.borderColor = item.color; }}
                onMouseLeave={e => { if (activeSection !== item.id) { e.currentTarget.style.backgroundColor = 'rgba(253,250,245,0.04)'; e.currentTarget.style.borderColor = 'rgba(253,250,245,0.08)'; } }}
              >
                <div style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: item.color,
                  marginBottom: '6px',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'var(--paper-white)',
                  lineHeight: 1.3,
                  marginBottom: '4px',
                }}>
                  {item.value}
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  color: item.color,
                  letterSpacing: '0.06em',
                }}>
                  <span className="t-num">{item.stat}</span>
                </div>
                {activeSection === item.id && item.detail && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(253,250,245,0.08)',
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: 'rgba(253,250,245,0.6)',
                  }}>
                    {item.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

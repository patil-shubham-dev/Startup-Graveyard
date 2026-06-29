'use client';

import { useState } from 'react';
import type { ArchiveDiscovery } from '@/lib/db/insights-data';

interface Props {
  discoveries: ArchiveDiscovery[];
  hasData: boolean;
}

const categoryColors: Record<string, string> = {
  funding: 'var(--rust-accent)',
  timing: 'var(--ochre-signal)',
  strategy: 'var(--sage-neutral)',
  team: '#7C3AED',
  market: 'var(--ink-muted)',
};

export default function IntelligenceFeed({ discoveries, hasData }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!hasData || !discoveries.length) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        backgroundColor: 'var(--cream-deep)',
        border: '1.5px dashed var(--cream-dark)',
        borderRadius: '2px',
      }}>
        <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', marginBottom: '8px' }}>
          NO DISCOVERIES YET
        </div>
        <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '13px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          New discoveries will appear here as the archive grows and patterns emerge.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: '9px',
        color: 'var(--ink-muted)',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>{discoveries.length} discoveries</span>
        <span>Last updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {discoveries.map((discovery, i) => {
        const color = categoryColors[discovery.category] || 'var(--cream-dark)';
        const isExpanded = expandedIndex === i;

        return (
          <div
            key={i}
            onClick={() => setExpandedIndex(isExpanded ? null : i)}
            style={{
              backgroundColor: 'var(--paper-white)',
              border: '1.5px dashed var(--cream-dark)',
              borderLeft: `3px solid ${color}`,
              borderRadius: '2px',
              padding: '18px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--cream-dark)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: color,
                  flexShrink: 0,
                }}>
                  {discovery.category}
                </span>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  color: 'var(--ink-muted)',
                }}>
                  {discovery.dateIdentified}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  color: discovery.confidence >= 90 ? 'var(--sage-neutral)' : 'var(--ochre-signal)',
                }}>
                  {discovery.confidence}% confidence
                </span>
                <span className="t-num" style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'var(--ink-muted)',
                }}>
                  {discovery.evidenceCount} cases
                </span>
              </div>
            </div>

            <h3 style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: '500',
              lineHeight: 1.4,
              color: 'var(--ink-black)',
              marginBottom: '6px',
              paddingLeft: '18px',
            }}>
              {discovery.finding}
            </h3>

            {isExpanded && (
              <>
                <p style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: 'var(--ink-soft)',
                  marginBottom: '12px',
                  paddingLeft: '18px',
                }}>
                  {discovery.description}
                </p>

                {discovery.relatedCompanies.length > 0 && (
                  <div style={{ paddingLeft: '18px' }}>
                    <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}>
                      Related Companies
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {discovery.relatedCompanies.map(c => (
                        <span key={c.name} className="stamp-tag" style={{ fontSize: '8px' }}>{c.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FailurePattern } from '@/lib/db/insights-data';

interface Props {
  pattern: FailurePattern;
  rank: number;
}

const severityColors: Record<string, string> = {
  critical: 'var(--failed-red)',
  high: 'var(--rust-accent)',
  medium: 'var(--ochre-signal)',
  low: 'var(--sage-neutral)',
};

function fmt(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num}`;
}

export default function ResearchCard({ pattern, rank }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severity = pattern.severity || 'medium';
  const color = severityColors[severity] || 'var(--cream-dark)';

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        backgroundColor: 'var(--paper-white)',
        border: '1.5px dashed var(--cream-dark)',
        borderLeft: `4px solid ${color}`,
        borderRadius: '2px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,23,20,0.08)'; }}
      onMouseLeave={e => { if (!isExpanded) { e.currentTarget.style.borderColor = 'var(--cream-dark)'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="t-num" style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--ink-muted)',
            opacity: 0.5,
          }}>
            #{String(rank).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: color,
            padding: '2px 8px',
            border: `1px solid ${color}`,
            borderRadius: '1px',
          }}>
            {severity.toUpperCase()} RISK
          </span>
        </div>
        <span className="t-num" style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '20px',
          fontWeight: '600',
          color: color,
          lineHeight: 1,
        }}>
          {pattern.casesObserved}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontSize: '20px',
        fontWeight: '600',
        lineHeight: 1.1,
        color: 'var(--ink-black)',
        marginBottom: '8px',
      }}>
        {pattern.name}
      </h3>

      <p style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: '13px',
        lineHeight: 1.6,
        color: 'var(--ink-soft)',
        marginBottom: '16px',
      }}>
        {pattern.description}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '14px',
        backgroundColor: 'var(--cream-deep)',
        borderRadius: '2px',
        marginBottom: '12px',
      }}>
        <div>
          <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-black)', fontFamily: 'var(--font-dm-mono), monospace' }}>
            {pattern.averageFunding > 0 ? fmt(pattern.averageFunding) : '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
            Avg Capital Destroyed
          </div>
        </div>
        <div>
          <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-black)', fontFamily: 'var(--font-dm-mono), monospace' }}>
            {pattern.averageLifespan > 0 ? `${pattern.averageLifespan} yrs` : '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
            Avg Lifespan
          </div>
        </div>
        <div>
          <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-black)', fontFamily: 'var(--font-dm-mono), monospace' }}>
            {pattern.failureRate}%
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
            Of Archive
          </div>
        </div>
        <div>
          <div className="t-num" style={{ fontSize: '13px', fontWeight: '600', color: pattern.confidence >= 90 ? 'var(--sage-neutral)' : 'var(--ochre-signal)', fontFamily: 'var(--font-dm-mono), monospace' }}>
            {pattern.confidence}%
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)' }}>
            Confidence
          </div>
        </div>
      </div>

      {pattern.historicalExamples && pattern.historicalExamples.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}>
            Historical Examples
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {pattern.historicalExamples.map(ex => (
              <Link key={ex.company} href={`/case/${ex.slug}`} style={{ textDecoration: 'none' }}>
                <span className="stamp-tag" style={{ fontSize: '8px', cursor: 'pointer' }}>
                  {ex.company} &apos;{String(ex.year).slice(2)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div style={{
          borderTop: '1px solid var(--cream-dark)',
          paddingTop: '14px',
          marginTop: '4px',
        }}>
          <Link
            href={`/explore?pattern=${encodeURIComponent(pattern.shortName)}`}
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--rust-accent)',
              textDecoration: 'none',
            }}
          >
            Read Pattern →
          </Link>
        </div>
      )}
    </div>
  );
}

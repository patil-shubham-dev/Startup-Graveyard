'use client';

import Link from 'next/link';
import type { FeaturedDiscovery as FeaturedDiscoveryType } from '@/lib/db/insights-data';

interface Props {
  discovery: FeaturedDiscoveryType | null;
  hasData: boolean;
}

const categoryColors: Record<string, string> = {
  funding: 'var(--rust-accent)',
  timing: 'var(--ochre-signal)',
  strategy: 'var(--sage-neutral)',
  team: '#7C3AED',
  market: 'var(--ink-muted)',
};

export default function FeaturedDiscovery({ discovery, hasData }: Props) {
  if (!hasData || !discovery) {
    return (
      <div style={{
        backgroundColor: 'var(--cream-deep)',
        borderTop: '1.5px dashed var(--cream-dark)',
        borderBottom: '1.5px dashed var(--cream-dark)',
        padding: '48px 0',
      }}>
        <div className="sg-container">
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', marginBottom: '8px' }}>
              FEATURED DISCOVERY
            </div>
            <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '14px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              As more cases are added, the most significant discovery will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--cream-deep)',
      borderTop: '1.5px dashed var(--cream-dark)',
      borderBottom: '1.5px dashed var(--cream-dark)',
    }}>
      <div className="sg-container" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: categoryColors[discovery.category] || 'var(--rust-accent)',
            marginBottom: '16px',
          }}>
            FEATURED DISCOVERY // {discovery.id}
          </div>

          <blockquote style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(24px, 2.2vw, 36px)',
            fontWeight: '500',
            lineHeight: 1.2,
            color: 'var(--ink-black)',
            letterSpacing: '-0.02em',
            margin: '0 0 24px 0',
            padding: '0',
            border: 'none',
            quotes: 'none',
          }}>
            &ldquo;{discovery.title}&rdquo;
          </blockquote>

          <p style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: 'clamp(14px, 1vw, 16px)',
            lineHeight: 1.7,
            color: 'var(--ink-soft)',
            marginBottom: '28px',
            maxWidth: '65ch',
          }}>
            {discovery.description}
          </p>

          <div style={{
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
            marginBottom: '28px',
            padding: '20px 24px',
            backgroundColor: 'var(--cream-base)',
            border: '1.5px dashed var(--cream-dark)',
            borderRadius: '2px',
          }}>
            <div>
              <div className="t-num" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--rust-accent)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                {discovery.supportingCases}
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Archived Cases
              </div>
            </div>
            <div>
              <div className="t-num" style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ochre-signal)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                {discovery.evidenceCount}
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Evidence Points
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: discovery.confidence >= 90 ? 'var(--sage-neutral)' : 'var(--ochre-signal)',
                fontFamily: 'var(--font-dm-mono), monospace',
              }}>
                {discovery.confidence}%
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Confidence
              </div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ink-soft)', fontFamily: 'var(--font-dm-mono), monospace' }}>
                {discovery.category.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Category
              </div>
            </div>
          </div>

          <Link
            href={discovery.slug ? `/case/${discovery.slug}` : '/explore'}
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--rust-accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--rust-accent)',
              paddingBottom: '2px',
              transition: 'gap 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.gap = '12px'}
            onMouseLeave={e => e.currentTarget.style.gap = '8px'}
          >
            Read Full Analysis →
          </Link>
        </div>
      </div>
    </div>
  );
}

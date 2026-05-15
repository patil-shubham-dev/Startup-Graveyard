import Link from 'next/link';
import { formatCurrencyCompact } from '@/lib/utils/format';

interface DossierCardProps {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  burnedAmount: number | string;
  eolYear: string;
  primaryCause: string;
  slug: string;
  className?: string;
  variant?: 'compact' | 'standard';
}

export function DossierCard({
  id,
  name,
  category,
  status,
  description,
  burnedAmount,
  eolYear,
  primaryCause,
  slug,
}: DossierCardProps) {
  const displayBurned =
    typeof burnedAmount === 'number' ? formatCurrencyCompact(burnedAmount) : burnedAmount;

  return (
    <Link
      href={`/case/${slug}`}
      style={{
        textDecoration: 'none',
        display: 'block',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--cream-deep)',
          border: '1px solid var(--cream-dark)',
          borderRadius: '2px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          cursor: 'crosshair',
          willChange: 'transform, box-shadow',
        }}
        className="dossier-hover-card"
      >
        {/* Paper grain texture — simplified for performance */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.03,
            backgroundImage: 'radial-gradient(var(--ink-black) 0.5px, transparent 0.5px)',
            backgroundSize: '4px 4px',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Top meta row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '14px',
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
              {category} / <span className="t-num">{id}</span>
            </span>
            <span className="stamp-closed">{status}</span>
          </div>

          {/* Company name */}
          <h3
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(22px, 2.5vw, 30px)',
              fontWeight: '700',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: 'var(--ink-black)',
              marginBottom: '10px',
            }}
          >
            {name}
          </h3>

          {/* Description */}
          <p
            className="line-clamp-2"
            style={{
              fontFamily: 'var(--font-source-serif), Georgia, serif',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--ink-soft)',
              marginBottom: '18px',
            }}
          >
            {description}
          </p>

          {/* Dashed divider */}
          <div
            style={{
              borderTop: '1.5px dashed var(--cream-dark)',
              marginBottom: '16px',
            }}
          />

          {/* Data row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-muted)',
                  marginBottom: '4px',
                }}
              >
                CAPITAL LOST
              </div>
              <div
                className="t-num"
                style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: 'var(--rust-accent)',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {displayBurned}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-muted)',
                  marginBottom: '4px',
                }}
              >
                YEAR CLOSED
              </div>
              <div
                className="t-num"
                style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: 'var(--ink-black)',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                {eolYear}
              </div>
            </div>
          </div>

          {/* Primary failure tag */}
          <span className="stamp-tag">
            {primaryCause}
          </span>
        </div>

        {/* Hover styles via global CSS: handled by .dossier-hover-card class */}
      </div>
    </Link>
  );
}

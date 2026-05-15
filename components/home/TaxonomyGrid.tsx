'use client';

import { useEffect, useRef, useState } from 'react';

const PATTERNS = [
  {
    name: 'No Market Need',
    desc: "Building solutions for problems that don't exist at scale. The cardinal failure.",
    stat: '42% OF FAILURES',
    id: 'PAT-001',
  },
  {
    name: 'Cash Exhaustion',
    desc: 'Runway miscalculated. Burn rate outpaced growth. The most preventable collapse.',
    stat: '29% OF FAILURES',
    id: 'PAT-002',
  },
  {
    name: 'Team Fracture',
    desc: 'Co-founder conflict, talent exodus, and cultural breakdown compound over time.',
    stat: '23% OF FAILURES',
    id: 'PAT-003',
  },
  {
    name: 'Competition Crush',
    desc: 'Underestimating incumbent response and failing to establish defensible moats.',
    stat: '19% OF FAILURES',
    id: 'PAT-004',
  },
  {
    name: 'Pricing Failure',
    desc: 'Monetization models that repel customers or capture insufficient value.',
    stat: '18% OF FAILURES',
    id: 'PAT-005',
  },
  {
    name: 'Regulatory Blindness',
    desc: 'Ignoring compliance requirements until enforcement action forces shutdown.',
    stat: '16% OF FAILURES',
    id: 'PAT-006',
  },
  {
    name: 'Premature Scaling',
    desc: 'Blitzscaling before product-market fit is confirmed. Capital burn without foundation.',
    stat: '14% OF FAILURES',
    id: 'PAT-007',
  },
  {
    name: 'Pivot Paralysis',
    desc: 'More than 3 pivots without $1M ARR predicts failure by year four.',
    stat: '12% OF FAILURES',
    id: 'PAT-008',
  },
];

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function TaxonomyGrid({ failureData }: { failureData?: Array<{ name: string; value: number }> }) {
  const enrichedPatterns = PATTERNS.map((p) => {
    const match = failureData?.find((f) =>
      f.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
    );
    return { ...p, realStat: match ? `${match.value} CASES` : null };
  });

  const { ref, visible } = useScrollReveal();

  return (
    <section
      style={{
        backgroundColor: 'var(--cream-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background pattern — simplified for performance */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.015,
          backgroundImage: 'radial-gradient(var(--ink-black) 0.5px, transparent 0.5px)',
          backgroundSize: '4px 4px',
        }}
      />

      <div className="sg-container section-pad" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--rust-accent)',
            }}
          >
            SYSTEMIC TAXONOMY / <span className="t-num">002</span>
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
        </div>

        <h2 className="t-h2" style={{ maxWidth: '18ch', marginBottom: '40px', lineHeight: 1.02 }}>
          The patterns that keep repeating.
        </h2>

        {/* 4×2 grid */}
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
          className="pattern-grid"
        >
          {enrichedPatterns.map((pattern, i) => (
            <div
              key={pattern.id}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.45s ease ${i * 0.06}s, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`,
              }}
            >
              <PatternCard {...pattern} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PatternCard({
  name,
  desc,
  stat,
  realStat,
  id,
}: {
  name: string;
  desc: string;
  stat: string;
  realStat: string | null;
  id: string;
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--cream-base)',
        border: '1px solid var(--cream-dark)',
        borderRadius: '2px',
        padding: '24px 22px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '180px',
        cursor: 'default',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="taxonomy-card-hover"
    >
      {/* Paper grain — simplified for performance */}
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

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ID */}
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--rust-accent)',
            marginBottom: '10px',
          }}
        >
          <span className="t-num">{id}</span>
        </div>

        {/* Pattern name */}
        <h3
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '20px',
            fontWeight: '700',
            lineHeight: 1.08,
            color: 'var(--ink-black)',
            marginBottom: '10px',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </h3>

        {/* Description — grows to fill */}
        <p
          style={{
            fontFamily: 'var(--font-body), Georgia, serif',
            fontSize: '12.5px',
            lineHeight: 1.6,
            color: 'var(--ink-muted)',
            flex: 1,
            marginBottom: '0',
          }}
        >
          {desc}
        </p>

        {/* Stat — pinned footer */}
        <div
          style={{
            borderTop: '1.5px dashed var(--cream-dark)',
            paddingTop: '12px',
            marginTop: '16px',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '8.5px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--ochre-signal)',
          }}
        >
          <span className="t-num">{realStat || stat}</span>
        </div>
      </div>
    </div>
  );
}

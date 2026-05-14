'use client';

const PATTERNS = [
  {
    name: 'No Market Need',
    desc: 'Building solutions for problems that don\'t exist at scale. The cardinal failure.',
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

export function TaxonomyGrid({ failureData }: { failureData?: Array<{ name: string; value: number }> }) {
  // Merge real data percentages into pattern cards where names match
  const enrichedPatterns = PATTERNS.map((p) => {
    const match = failureData?.find((f) =>
      f.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
    );
    return { ...p, realStat: match ? `${match.value} CASES` : null };
  });

  return (
    <section style={{ backgroundColor: 'var(--cream-deep)' }}>
      <div className="sg-container section-pad">
        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--rust-accent)',
            }}
          >
            SYSTEMIC TAXONOMY / 002
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
        </div>

        <h2 className="t-h2" style={{ maxWidth: '20ch', marginBottom: '48px' }}>
          The patterns that keep repeating.
        </h2>

        {/* 4×2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
          className="sm:grid-cols-4"
        >
          {enrichedPatterns.map((pattern) => (
            <PatternCard key={pattern.id} {...pattern} />
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
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="taxonomy-card-hover"
    >
      {/* Paper grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ID */}
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--rust-accent)',
            marginBottom: '8px',
          }}
        >
          {id}
        </div>

        {/* Pattern name */}
        <h3
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '20px',
            fontWeight: '700',
            lineHeight: 1.1,
            color: 'var(--ink-black)',
            marginBottom: '8px',
          }}
        >
          {name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-source-serif), Georgia, serif',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'var(--ink-muted)',
            marginBottom: '12px',
          }}
        >
          {desc}
        </p>

        {/* Stat */}
        <div
          style={{
            borderTop: '1.5px dashed var(--cream-dark)',
            paddingTop: '10px',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--ochre-signal)',
          }}
        >
          {realStat || stat}
        </div>
      </div>
    </div>
  );
}

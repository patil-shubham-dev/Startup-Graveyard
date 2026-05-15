'use client';

interface FailureDNAProps {
  scores: Record<string, number>;
}

export function FailureDNA({ scores }: FailureDNAProps) {
  const vectors = Object.entries(scores || {
    'MARKET_FIT': 0.8,
    'BURN_RATE': 0.6,
    'TEAM_DYNAMICS': 0.4,
    'COMPETITION': 0.7,
    'REGULATORY': 0.2
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--cream-deep)',
        border: '1px solid var(--cream-dark)',
        padding: '28px',
        borderRadius: '2px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-muted)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>FAILURE_DNA_SCAN</span>
        <span style={{ color: 'var(--rust-accent)' }} className="t-num">0% — 100%</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {vectors.map(([key, value]) => (
          <div key={key}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  color: 'var(--ink-soft)',
                  letterSpacing: '0.05em',
                }}
              >
                {key}
              </span>
              <span
                className="t-num"
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--ink-muted)',
                }}
              >
                {Math.round(value * 100)}%
              </span>
            </div>
            <div
              style={{
                height: '4px',
                backgroundColor: 'var(--cream-dark)',
                borderRadius: '1px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${value * 100}%`,
                  height: '100%',
                  backgroundColor: value > 0.6 ? 'var(--rust-accent)' : 'var(--ochre-signal)',
                  borderRadius: '1px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

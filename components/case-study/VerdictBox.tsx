'use client';

export function VerdictBox({ reasons }: { reasons: string[] }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--ink-black)',
        padding: '48px 40px',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative vertical line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: 'var(--rust-accent)',
        }}
      />

      <div
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--rust-accent)',
          marginBottom: '24px',
        }}
      >
        FORENSIC_VERDICT
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {reasons.map((reason, i) => (
          <div key={i} style={{ display: 'flex', gap: '24px' }}>
            <span
              className="t-num"
              style={{
                fontSize: '32px',
                fontWeight: '600',
                color: 'var(--rust-accent)',
                lineHeight: 1,
                opacity: 0.8,
              }}
            >
              0{i + 1}
            </span>
            <p
              style={{
                fontFamily: 'var(--font-source-serif), Georgia, serif',
                fontSize: '18px',
                lineHeight: 1.6,
                color: 'var(--cream-base)',
                maxWidth: '32ch',
                fontStyle: 'italic',
              }}
            >
              {reason}
            </p>
          </div>
        ))}
      </div>

      {/* Rubber stamp effect */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '40px',
          transform: 'rotate(-12deg)',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            border: '2px solid var(--rust-accent)',
            padding: '8px 16px',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--rust-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          FINAL_JUDGMENT
        </div>
      </div>
    </div>
  );
}

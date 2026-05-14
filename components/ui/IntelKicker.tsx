'use client';

interface IntelKickerProps {
  label: string;
  figure?: string;
}

export function IntelKicker({ label, figure }: IntelKickerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
          {label}
        </span>
        {figure && (
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              color: 'var(--ink-muted)',
              opacity: 0.6,
            }}
          >
            {'//'} {figure}
          </span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: 'var(--cream-dark)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

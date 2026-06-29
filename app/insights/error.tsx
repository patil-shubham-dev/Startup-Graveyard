'use client';

export default function InsightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--cream-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '48px' }}>
        <div style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--rust-accent)',
          marginBottom: '12px',
        }}>
          INTELLIGENCE_SYSTEM // ERROR
        </div>
        <h1 style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '600',
          lineHeight: 1.05,
          color: 'var(--ink-black)',
          marginBottom: '16px',
        }}>
          Intelligence unavailable.
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '14px',
          lineHeight: 1.7,
          color: 'var(--ink-muted)',
          marginBottom: '32px',
        }}>
          {error.message || 'Failed to load intelligence data from the archive.'}
        </p>
        <button onClick={reset} className="btn-rust">REINITIALIZE SYSTEM</button>
      </div>
    </main>
  );
}

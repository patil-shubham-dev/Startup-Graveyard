'use client';

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="sg-container section-pad" style={{ textAlign: 'center' }}>
      <h1 className="t-h1" style={{ marginBottom: '12px' }}>Archive Error</h1>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {error.message || 'Failed to load archive.'}
      </p>
      <button onClick={reset} className="btn-rust">RETRY</button>
    </div>
  );
}

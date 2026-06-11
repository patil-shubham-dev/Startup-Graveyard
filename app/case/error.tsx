'use client';

export default function CaseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="sg-container section-pad" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '64px', fontWeight: '300', color: 'var(--ink-muted)', marginBottom: '16px' }}>☠</div>
      <h1 className="t-h1" style={{ marginBottom: '12px' }}>Dossier Corrupted</h1>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {error.message || 'Failed to load case study.'}
      </p>
      <button onClick={reset} className="btn-rust">RELOAD DOSSIER</button>
    </div>
  );
}

import Link from 'next/link';

export default function CaseNotFound() {
  return (
    <div className="sg-container section-pad" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '80px', fontWeight: '300', color: 'var(--ink-muted)', marginBottom: '16px' }}>404</div>
      <h1 className="t-h1" style={{ marginBottom: '12px' }}>Case File Missing</h1>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        This autopsy record could not be located in the archive.
      </p>
      <Link href="/explore" className="btn-rust">BROWSE ARCHIVE</Link>
    </div>
  );
}

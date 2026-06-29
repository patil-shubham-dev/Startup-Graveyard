import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Startup Graveyard',
  description: 'About the Startup Graveyard forensic intelligence archive.',
};

export default function AboutPage() {
  return (
    <main className="sg-container section-pad" style={{ minHeight: '80vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--rust-accent)',
            marginBottom: '12px',
          }}
        >
          FORENSIC ARCHIVE
        </div>
        <h1 className="t-h1" style={{ marginBottom: '24px' }}>About the Archive</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <h2 className="t-h3" style={{ marginBottom: '8px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>What This Is</h2>
            <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
              Startup Graveyard is a forensic intelligence archive documenting startup failures. We analyze why companies die — the strategy errors, market misfires, cash mismanagement, and team fractures — so founders can learn from the dead.
            </p>
          </section>

          <section>
            <h2 className="t-h3" style={{ marginBottom: '8px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>The Forensics Approach</h2>
            <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
              Each case study is assembled from publicly available sources: news reports, investor notes, employee accounts, and financial disclosures. We do not speculate — we assemble evidence and identify failure patterns. Our AI-powered analysis engine cross-references every case against historical data to surface common failure archetypes.
            </p>
          </section>

          <section>
            <h2 className="t-h3" style={{ marginBottom: '8px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>Why It Exists</h2>
            <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
              90% of startups fail. Most of those failures follow recognizable patterns that have been documented for decades. We believe that by making this data accessible and searchable, we can help founders identify death spirals before they happen — and build companies that last.
            </p>
          </section>

          <section>
            <h2 className="t-h3" style={{ marginBottom: '8px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>The Data</h2>
            <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
              Cases include funding history, founder backgrounds, market conditions at time of failure, product timelines, and documented failure reasons. All data points link back to original sources. The archive is updated regularly as new shutdowns are confirmed.
            </p>
          </section>

          <section>
            <h2 className="t-h3" style={{ marginBottom: '8px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>The Graveyard Keeper AI</h2>
            <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
              The Graveyard Keeper is a forensic AI that analyzes startup failure patterns. It draws on vector-searchable case embeddings to provide context-aware analysis. Available under the Forensic Chat tab, it can answer questions about specific cases, failure patterns, and comparative risk analysis.
            </p>
          </section>

          <section>
            <h2 className="t-h3" style={{ marginBottom: '8px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>Colophon</h2>
            <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
              Built with Next.js and Supabase. Fonts: Cormorant Garamond, Space Grotesk, IBM Plex Mono. Vector embeddings powered by NVIDIA NIM. Themed after historical autopsy reports and forensic case files.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

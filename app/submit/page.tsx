import type { Metadata } from 'next';
import { SubmissionForm } from '@/components/submit/SubmissionForm';

export const metadata: Metadata = {
  title: 'Submit a Case | Startup Graveyard',
  description: 'Submit a failed startup for forensic analysis.',
};

export default function SubmitPage() {
  return (
    <main className="sg-container section-pad" style={{ minHeight: '80vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
          CASE SUBMISSION
        </div>
        <h1 className="t-h1" style={{ marginBottom: '16px' }}>Submit a Case</h1>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            color: 'var(--ink-muted)',
            lineHeight: '1.7',
            marginBottom: '32px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Know a startup that has shut down? Submit it for forensic analysis. Our team reviews every submission for inclusion in the archive.
        </p>

        <SubmissionForm />

        <div
          style={{
            marginTop: '48px',
            padding: '16px',
            border: '1px dashed var(--cream-dark)',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            color: 'var(--ink-muted)',
            lineHeight: '1.6',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Submissions are reviewed by our forensic team. We prioritize companies with verifiable shutdown data and clear failure narratives. Allow 2-4 weeks for review.
        </div>
      </div>
    </main>
  );
}

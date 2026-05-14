import Link from 'next/link';

export function PreMortemCTA() {
  return (
    <section
      style={{
        backgroundColor: 'var(--ink-black)',
        width: '100%',
      }}
    >
      <div
        className="sg-container"
        style={{
          paddingTop: '100px',
          paddingBottom: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0',
        }}
      >
        {/* Kicker */}
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--rust-accent)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              backgroundColor: 'var(--rust-accent)',
            }}
          />
          FORENSIC DIAGNOSTIC ENGINE
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              height: '1px',
              backgroundColor: 'var(--rust-accent)',
            }}
          />
        </div>

        {/* Headline */}
        <h2
          className="t-pullquote"
          style={{
            color: 'var(--cream-base)',
            maxWidth: '18ch',
            marginBottom: '20px',
          }}
        >
          &quot;Test the idea while it is still cheap to change.&quot;
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: 'var(--font-source-serif), Georgia, serif',
            fontSize: '16px',
            lineHeight: 1.75,
            color: 'var(--cream-dark)',
            maxWidth: '44ch',
            marginBottom: '48px',
          }}
        >
          Most startups commit avoidable mistakes. Our AI diagnostic surfaces the failure
          vectors in your venture before you scale into them.
        </p>

        {/* Pulse CTA */}
        <Link
          href="/pre-mortem"
          className="pulse-border"
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--cream-base)',
            backgroundColor: 'var(--rust-accent)',
            border: '1px solid var(--rust-accent)',
            padding: '16px 36px',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'background-color 0.2s ease',
          }}
        >
          INITIATE DIAGNOSTIC →
        </Link>

        {/* Archive note */}
        <div
          style={{
            marginTop: '40px',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--ink-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--sage-neutral)',
            }}
          />
          AI-POWERED / PATTERN-MATCHED AGAINST THE ARCHIVE / NO SIGNUP REQUIRED
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

export function PreMortemCTA() {
  return (
    <section
      style={{
        backgroundColor: 'var(--ink-black)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Rich gradient — black to charcoal */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(58,44,36,0.5) 0%, rgba(26,23,20,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Faint rust glow at center */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '300px',
          background:
            'radial-gradient(ellipse, rgba(181,74,42,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Fine grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(to right, rgba(245,240,232,0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245,240,232,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />

      {/* Soft paper grain */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Hairline top border */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(to right, transparent, rgba(181,74,42,0.3) 30%, rgba(181,74,42,0.3) 70%, transparent)',
        }}
      />

      <div
        className="sg-container"
        style={{
          paddingTop: '120px',
          paddingBottom: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Kicker */}
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--rust-accent)',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '28px',
              height: '1px',
              backgroundColor: 'var(--rust-accent)',
              opacity: 0.6,
            }}
          />
          FORENSIC DIAGNOSTIC ENGINE
          <span
            style={{
              display: 'inline-block',
              width: '28px',
              height: '1px',
              backgroundColor: 'var(--rust-accent)',
              opacity: 0.6,
            }}
          />
        </div>

        {/* Pull quote headline */}
        <h2
          className="t-pullquote"
          style={{
            color: 'var(--cream-base)',
            maxWidth: '18ch',
            marginBottom: '24px',
            lineHeight: 1.08,
          }}
        >
          &quot;Test the idea while it is still cheap to change.&quot;
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: 'var(--font-body), Georgia, serif',
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'rgba(217,207,192,0.65)',
            maxWidth: '44ch',
            marginBottom: '52px',
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
            fontSize: '11px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--cream-base)',
            backgroundColor: 'var(--rust-accent)',
            border: '1px solid var(--rust-accent)',
            padding: '16px 40px',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
            boxShadow: '0 4px 24px rgba(181,74,42,0.25)',
          }}
        >
          INITIATE DIAGNOSTIC →
        </Link>

        {/* Archive note */}
        <div
          style={{
            marginTop: '44px',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'rgba(122,111,101,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--sage-neutral)',
              opacity: 0.6,
            }}
          />
          AI-POWERED / PATTERN-MATCHED AGAINST THE ARCHIVE / NO SIGNUP REQUIRED
        </div>
      </div>
    </section>
  );
}

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
          paddingTop: '136px',
          paddingBottom: '136px',
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
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
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
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: '400',
            fontSize: 'clamp(38px, 6vw, 60px)',
            color: 'var(--cream-base)',
            maxWidth: '24ch',
            marginBottom: '28px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textRendering: 'optimizeLegibility',
          }}
        >
          &quot;Test the idea while it is still cheap to change.&quot;
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            fontSize: 'clamp(15px, 2.5vw, 17px)',
            lineHeight: 1.75,
            color: 'rgba(217, 207, 192, 0.7)',
            maxWidth: '48ch',
            marginBottom: '48px',
            letterSpacing: '-0.01em',
          }}
        >
          Most startups commit avoidable mistakes. Our AI diagnostic surfaces the failure
          vectors in your venture before you scale into them.
        </p>

        {/* Pulse CTA */}
        <Link
          href="/pre-mortem"
          className="pulse-border hover:scale-[1.03] active:scale-[0.98]"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--cream-base)',
            backgroundColor: 'var(--rust-accent)',
            border: '1px solid var(--rust-accent)',
            padding: '18px 48px',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            boxShadow: '0 4px 24px rgba(181,74,42,0.3)',
          }}
        >
          INITIATE DIAGNOSTIC →
        </Link>

        {/* Archive note */}
        <div
          style={{
            marginTop: '48px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'rgba(122,111,101,0.65)',
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
              opacity: 0.8,
            }}
          />
          AI-POWERED / PATTERN-MATCHED AGAINST THE ARCHIVE / NO SIGNUP REQUIRED
        </div>
      </div>
    </section>
  );
}

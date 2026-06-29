export default function ExploreLoading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--cream-base)',
      }}
    >
      {/* Filter header */}
      <div
        style={{
          backgroundColor: 'var(--cream-deep)',
          borderBottom: '1.5px dashed var(--cream-dark)',
          padding: '40px 0 32px',
        }}
      >
        <div className="sg-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--rust-accent)',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sage-neutral)',
                    display: 'inline-block',
                  }}
                />
                LIVE ARCHIVE
              </div>
              <div
                className="skeleton-cream"
                style={{
                  width: '160px',
                  height: '42px',
                  borderRadius: '2px',
                }}
              />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--ink-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>SYNCING...</span>
              <span
                className="skeleton-cream"
                style={{
                  width: '48px',
                  height: '10px',
                  borderRadius: '1px',
                  display: 'inline-block',
                }}
              />
            </div>
          </div>

          {/* Filter skeleton */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            {/* Search */}
            <div
              className="skeleton-cream"
              style={{
                flex: '1',
                minWidth: '200px',
                maxWidth: '360px',
                height: '34px',
                borderRadius: '1px',
              }}
            />
            {/* Industry */}
            <div
              className="skeleton-cream"
              style={{
                width: '140px',
                height: '30px',
                borderRadius: '1px',
              }}
            />
            {/* Fail Type */}
            <div
              className="skeleton-cream"
              style={{
                width: '140px',
                height: '30px',
                borderRadius: '1px',
              }}
            />
            {/* Country */}
            <div
              className="skeleton-cream"
              style={{
                width: '120px',
                height: '30px',
                borderRadius: '1px',
              }}
            />
            {/* Funding */}
            <div
              className="skeleton-cream"
              style={{
                width: '120px',
                height: '30px',
                borderRadius: '1px',
              }}
            />
            {/* Year */}
            <div
              className="skeleton-cream"
              style={{
                width: '160px',
                height: '30px',
                borderRadius: '1px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="sg-container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonDossierCard key={i} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

function SkeletonDossierCard({ index }: { index: number }) {
  const staggerDelay = 0.05 * index;
  return (
    <div
      style={{
        backgroundColor: 'var(--cream-deep)',
        border: '1px solid var(--cream-dark)',
        borderRadius: '2px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        animation: `fade-up 0.4s ease ${staggerDelay}s both`,
      }}
    >
      {/* Paper grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.03,
          backgroundImage: 'radial-gradient(var(--ink-black) 0.5px, transparent 0.5px)',
          backgroundSize: '4px 4px',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top meta row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '14px',
          }}
        >
          <div
            className="skeleton-cream"
            style={{
              width: '80px',
              height: '10px',
              borderRadius: '1px',
            }}
          />
          <div
            className="skeleton-cream"
            style={{
              width: '52px',
              height: '18px',
              borderRadius: '1px',
            }}
          />
        </div>

        {/* Company name */}
        <div
          className="skeleton-cream"
          style={{
            width: `${60 + (index % 3) * 20}%`,
            height: '28px',
            borderRadius: '1px',
            marginBottom: '12px',
          }}
        />

        {/* Description lines */}
        <div
          className="skeleton-cream"
          style={{
            width: '100%',
            height: '12px',
            borderRadius: '1px',
            marginBottom: '8px',
          }}
        />
        <div
          className="skeleton-cream"
          style={{
            width: '70%',
            height: '12px',
            borderRadius: '1px',
            marginBottom: '18px',
          }}
        />

        {/* Dashed divider skeleton */}
        <div style={{ borderTop: '1.5px dashed var(--cream-dark)', marginBottom: '16px' }} />

        {/* Data row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <div>
            <div
              className="skeleton-cream"
              style={{
                width: '60%',
                height: '8px',
                borderRadius: '1px',
                marginBottom: '6px',
              }}
            />
            <div
              className="skeleton-cream"
              style={{
                width: '75%',
                height: '22px',
                borderRadius: '1px',
              }}
            />
          </div>
          <div>
            <div
              className="skeleton-cream"
              style={{
                width: '55%',
                height: '8px',
                borderRadius: '1px',
                marginBottom: '6px',
              }}
            />
            <div
              className="skeleton-cream"
              style={{
                width: '40%',
                height: '22px',
                borderRadius: '1px',
              }}
            />
          </div>
        </div>

        {/* Primary cause tag */}
        <div
          className="skeleton-cream"
          style={{
            width: '90px',
            height: '18px',
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  );
}

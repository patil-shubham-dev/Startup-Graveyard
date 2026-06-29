export default function CaseLoading() {
  return (
    <main className="min-h-screen bg-[var(--cream-base)]">
      {/* Hero skeleton */}
      <div
        style={{
          backgroundColor: 'var(--cream-deep)',
          borderBottom: '1.5px dashed var(--cream-dark)',
          padding: '80px 0 64px',
        }}
      >
        <div className="sg-container">
          {/* Breadcrumb */}
          <div
            className="skeleton-cream"
            style={{ width: '140px', height: '10px', borderRadius: '1px', marginBottom: '24px' }}
          />
          {/* Title */}
          <div
            className="skeleton-cream"
            style={{ width: '280px', height: '48px', borderRadius: '2px', marginBottom: '32px' }}
          />
          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '32px',
              borderTop: '1.5px dashed var(--cream-dark)',
              paddingTop: '32px',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div
                  className="skeleton-cream"
                  style={{ width: '60%', height: '8px', borderRadius: '1px', marginBottom: '8px' }}
                />
                <div
                  className="skeleton-cream"
                  style={{ width: '80%', height: '28px', borderRadius: '2px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton — max-w-[900px] single column */}
      <div className="mx-auto px-6 py-24 max-w-[900px]">
        <div
          style={{
            backgroundColor: 'var(--paper-white)',
            padding: '64px',
          }}
        >
          <div className="space-y-12">
            {/* Controls bar */}
            <div className="flex gap-4">
              <div className="skeleton-cream" style={{ width: '180px', height: '38px', borderRadius: '2px' }} />
              <div className="skeleton-cream" style={{ width: '160px', height: '38px', borderRadius: '2px' }} />
            </div>

            {/* Summary section */}
            <div className="space-y-4">
              <div className="skeleton-cream" style={{ width: '80px', height: '10px', borderRadius: '1px' }} />
              <div className="skeleton-cream" style={{ width: '100%', height: '60px', borderRadius: '2px' }} />
              <div className="grid grid-cols-2 gap-6">
                <div className="skeleton-cream" style={{ height: '100px', borderRadius: '2px' }} />
                <div className="skeleton-cream" style={{ height: '100px', borderRadius: '2px' }} />
              </div>
            </div>

            {/* Risk Profile section */}
            <div className="space-y-4">
              <div className="skeleton-cream" style={{ width: '100px', height: '10px', borderRadius: '1px' }} />
              <div className="grid grid-cols-2 gap-6">
                <div className="skeleton-cream" style={{ height: '200px', borderRadius: '2px' }} />
                <div className="skeleton-cream" style={{ height: '200px', borderRadius: '2px' }} />
              </div>
            </div>

            {/* Narrative section */}
            <div className="space-y-3">
              <div className="skeleton-cream" style={{ width: '90px', height: '10px', borderRadius: '1px' }} />
              <div className="skeleton-cream" style={{ width: '100%', height: '16px', borderRadius: '1px' }} />
              <div className="skeleton-cream" style={{ width: '100%', height: '16px', borderRadius: '1px' }} />
              <div className="skeleton-cream" style={{ width: '75%', height: '16px', borderRadius: '1px' }} />
              <div className="skeleton-cream" style={{ width: '100%', height: '16px', borderRadius: '1px' }} />
              <div className="skeleton-cream" style={{ width: '60%', height: '16px', borderRadius: '1px' }} />
            </div>

            {/* Timeline skeleton */}
            <div className="space-y-6">
              <div className="skeleton-cream" style={{ width: '90px', height: '10px', borderRadius: '1px', marginBottom: '24px' }} />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-8">
                  <div className="skeleton-cream" style={{ width: '80px', height: '40px', borderRadius: '1px' }} />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-cream" style={{ width: '60%', height: '20px', borderRadius: '1px' }} />
                    <div className="skeleton-cream" style={{ width: '90%', height: '14px', borderRadius: '1px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA skeleton */}
            <div className="skeleton-cream" style={{ width: '100%', height: '160px', borderRadius: '2px' }} />
          </div>
        </div>
      </div>
    </main>
  );
}

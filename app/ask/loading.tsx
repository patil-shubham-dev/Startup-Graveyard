export default function AskLoading() {
  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cream-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton-cream" style={{ width: '56px', height: '56px', borderRadius: '2px', margin: '0 auto 24px' }} />
        <div className="skeleton-cream" style={{ width: '240px', height: '24px', borderRadius: '2px', margin: '0 auto 12px' }} />
        <div className="skeleton-cream" style={{ width: '320px', height: '16px', borderRadius: '2px', margin: '0 auto' }} />
      </div>
    </div>
  );
}

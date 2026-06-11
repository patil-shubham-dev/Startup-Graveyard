export default function PreMortemLoading() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F4EE' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton-cream" style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 24px' }} />
        <div className="skeleton-cream" style={{ width: '280px', height: '28px', borderRadius: '2px', margin: '0 auto 12px' }} />
        <div className="skeleton-cream" style={{ width: '200px', height: '16px', borderRadius: '2px', margin: '0 auto' }} />
      </div>
    </div>
  );
}

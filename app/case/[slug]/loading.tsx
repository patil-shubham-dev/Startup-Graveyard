export default function CaseLoading() {
  return (
    <main className="min-h-screen bg-bg-page">
      <div className="h-[400px] w-full bg-bg-surface-1 animate-pulse" />
      
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 py-24">
        <div className="space-y-12">
          <div className="h-4 w-32 bg-bg-surface-1 animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-full bg-bg-surface-1 animate-pulse" />
            <div className="h-6 w-full bg-bg-surface-1 animate-pulse" />
            <div className="h-6 w-2/3 bg-bg-surface-1 animate-pulse" />
          </div>
          <div className="h-64 w-full bg-bg-surface-1 animate-pulse border border-border-subtle" />
        </div>

        <aside className="space-y-10">
          <div className="h-80 w-full bg-bg-surface-1 animate-pulse rounded-md" />
          <div className="h-40 w-full bg-bg-surface-1 animate-pulse rounded-md" />
        </aside>
      </div>
    </main>
  );
}

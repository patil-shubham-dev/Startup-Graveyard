export default function ExploreLoading() {
  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <header className="mb-16">
        <div className="h-12 w-64 bg-bg-surface-2 animate-pulse rounded-md mb-4" />
        <div className="h-4 w-96 bg-bg-surface-2 animate-pulse rounded-md" />
      </header>

      <div className="bg-bg-surface-1 border border-border-subtle p-5 mb-16 h-20 animate-pulse rounded-lg" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-bg-surface-1 border border-border-subtle animate-pulse rounded-lg" />
        ))}
      </div>
    </main>
  );
}

export const CaseStudySkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-[60vh] bg-cream-deep/50 w-full" />
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_360px] gap-12 py-24">
        <div className="hidden lg:block space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-cream-deep/50 w-3/4" />
          ))}
        </div>
        <div className="space-y-12">
          <div className="h-24 bg-cream-deep/50 w-full" />
          <div className="h-[400px] bg-cream-deep/50 w-full" />
          <div className="h-64 bg-cream-deep/50 w-full" />
        </div>
        <div className="space-y-8">
          <div className="h-[300px] bg-cream-deep/50 w-full" />
          <div className="h-[200px] bg-cream-deep/50 w-full" />
        </div>
      </div>
    </div>
  );
};

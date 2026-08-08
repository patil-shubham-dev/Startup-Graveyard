interface PageSkeletonProps {
  label?: string
}

export function PageSkeleton({ label = "Opening the archive" }: PageSkeletonProps) {
  return (
    <div
      className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 animate-pulse bg-accent-deep" />
        <span className="label-catalog animate-pulse">{label}</span>
      </div>
      <div className="mt-6 space-y-4">
        <div className="h-4 w-3/4 animate-pulse rounded-[2px] bg-line" />
        <div className="h-10 w-full animate-pulse rounded-[2px] bg-line" />
        <div className="h-10 w-5/6 animate-pulse rounded-[2px] bg-line" />
        <div className="h-4 w-2/3 animate-pulse rounded-[2px] bg-line" />
        <div className="h-4 w-1/2 animate-pulse rounded-[2px] bg-line" />
      </div>
      <div className="mt-12 border-t border-line pt-8">
        <div className="h-4 w-1/3 animate-pulse rounded-[2px] bg-line" />
        <div className="mt-6 h-4 w-full animate-pulse rounded-[2px] bg-line" />
        <div className="mt-3 h-4 w-5/6 animate-pulse rounded-[2px] bg-line" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded-[2px] bg-line" />
      </div>
    </div>
  )
}

export default function ExploreLoading() {
  return (
    <section className="texture-paper">
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-6 md:pb-16 md:pt-20">
        <p className="label-catalog flex items-center gap-2 text-accent-deep">
          <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
          The archive
        </p>
        <div className="mt-4 h-11 max-w-3xl animate-pulse bg-line" />
        <div className="mt-6 h-5 max-w-2xl animate-pulse bg-line" />
        <div className="mt-10 border-t border-line pt-8">
          <div className="h-11 max-w-3xl animate-pulse bg-line" />
        </div>
      </div>
    </section>
  )
}

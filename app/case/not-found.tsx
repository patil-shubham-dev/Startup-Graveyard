import Link from "next/link"

export default function CaseNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Register · No such file
      </p>
      <h1 className="mt-4 font-serif text-3xl italic leading-snug text-ink sm:text-4xl">
        No case file by that name.
      </h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
        This record is not in the archive — it may never have been filed, or
        the reference you followed is wrong.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/explore" className="btn btn-primary">
          Browse all cases
        </Link>
        <Link href="/" className="btn btn-outline">
          Return to the Graveyard
        </Link>
      </div>
    </main>
  )
}

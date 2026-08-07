"use client"

import Link from "next/link"

export default function ExploreError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="texture-paper">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 text-center sm:px-6 md:pt-24">
        <div aria-hidden className="mx-auto w-12 border-t border-line" />
        <p className="mt-8 font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
          The register could not be opened.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-mute">
          The archive service did not respond. Try again, or return to the
          reading room.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={reset} className="btn btn-primary">
            Retry
          </button>
          <Link href="/" className="btn btn-outline">
            Return home
          </Link>
        </div>
      </div>
    </section>
  )
}

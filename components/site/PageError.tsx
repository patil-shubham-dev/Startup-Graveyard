"use client"

import Link from "next/link"

interface PageErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  copy?: string
  backHref?: string
  backLabel?: string
}

export function PageError({
  error,
  reset,
  title = "The archive is out of order.",
  copy = "Something went wrong while preparing this page. The records are unharmed — try again, or return to the register.",
  backHref = "/",
  backLabel = "Return to the home page",
}: PageErrorProps) {
  void error
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Error · Reading room
      </p>
      <h1 className="mt-4 font-serif text-3xl italic leading-snug text-ink sm:text-4xl">{title}</h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">{copy}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href={backHref} className="btn btn-outline">
          {backLabel}
        </Link>
      </div>
    </main>
  )
}

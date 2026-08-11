import type { Metadata } from "next"
import Link from "next/link"
import { getLedgerStats } from "@/lib/db/case-studies"
import { readAllCases, ledgerFromCases } from "@/lib/archive-ledger"

export const metadata: Metadata = {
  title: "About",
  description: "About the Start-up Graveyard — a forensic research archive of startup failures.",
}

export default async function AboutPage() {
  const cases = readAllCases()
  const ledger = (await getLedgerStats()) || ledgerFromCases(cases)
  const documented = ledger?.documented ?? cases.length
  const published = ledger?.published ?? 0
  const industries = ledger?.industries ?? 0
  const inReview = ledger?.inReview ?? 0

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        About the archive · Volume I
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        About the Graveyard
      </h1>

      <div className="mt-10 space-y-6 text-[16px] leading-relaxed text-ink-mute">
        <p>
          Start-up Graveyard is a forensic intelligence archive documenting
          why startups fail. Every case is researched, structured, and
          analyzed to extract actionable lessons for founders, investors, and
          students.
        </p>

        <div className="border-t border-line pt-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Our mission</h2>
          <p className="mt-4">
            Failure is the best teacher, but only if you study it. We
            document startup failures forensically so the next generation of
            founders can learn from the dead.
          </p>
        </div>

        <p>
          The archive currently contains {documented} documented case studies
          across {industries} industries, spanning from food tech to fintech,
          hardware to healthcare. Each case study follows a consistent format:
          founding story, rise, fall, failure analysis, and key lessons.
        </p>

        <dl className="grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <dt className="label-catalog">Cases documented</dt>
            <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">{documented}</dd>
          </div>
          <div>
            <dt className="label-catalog">Cases published</dt>
            <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">{published}</dd>
          </div>
          <div>
            <dt className="label-catalog">Industries covered</dt>
            <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">{industries}</dd>
          </div>
          <div>
            <dt className="label-catalog">Awaiting review</dt>
            <dd className="mt-2 font-mono text-2xl tabular-nums text-ink">{inReview}</dd>
          </div>
        </dl>

        <p className="border-t border-line pt-8">
          Beyond the archive, we offer AI-powered research tools — Graveyard
          Intelligence for querying the data, and a Pre-mortem diagnostic tool
          for evaluating new ideas against known failure patterns.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link href="/explore" className="btn btn-primary">
          Browse the archive
        </Link>
        <Link href="/submit" className="btn btn-outline">
          Submit a case
        </Link>
      </div>
    </div>
  )
}

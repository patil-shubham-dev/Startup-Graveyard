import type { Metadata } from "next"
import { getLedgerStats } from "@/lib/db/case-studies"
import { readAllCases, ledgerFromCases } from "@/lib/archive-ledger"

export const metadata: Metadata = {
  title: "About",
  description: "About the Start-up Graveyard project.",
}

export default async function AboutPage() {
  const cases = readAllCases()
  const ledger = (await getLedgerStats()) || ledgerFromCases(cases)
  const documented = ledger?.documented ?? cases.length
  const industries = ledger?.industries ?? 0

  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog">About the archive</p>
      <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        About the Graveyard
      </h1>

      <div className="mt-10 space-y-6 text-[16px] leading-relaxed text-ink-mute">
        <p>
          Start-up Graveyard is a forensic intelligence archive documenting
          why startups fail. Every case is researched, structured, and
          analyzed to extract actionable lessons for founders, investors, and
          students.
        </p>

        <div className="border-t border-line pt-6">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Our mission
          </h2>
          <p className="mt-3">
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

        <p>
          Beyond the archive, we offer AI-powered research tools — Graveyard
          Intelligence for querying the data, and a Pre-mortem diagnostic tool
          for evaluating new ideas against known failure patterns.
        </p>
      </div>
    </main>
  )
}
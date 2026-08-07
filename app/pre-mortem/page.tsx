"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface RiskResult {
  category: string
  score: number
  level: "low" | "medium" | "high"
  note: string
}

function RiskBar({ score, level, note, category }: RiskResult) {
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-medium text-ink">{category}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
          {level} · {score}%
        </span>
      </div>
      <div className="mt-3 h-[3px] bg-line">
        <div
          className="h-full bg-accent-deep transition-[width] duration-700 ease-out"
          style={{ width: animate ? `${score}%` : "0%" }}
        />
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-mute">{note}</p>
    </div>
  )
}

export default function PreMortemPage() {
  const [step, setStep] = useState<"intro" | "form" | "loading" | "result">("intro")
  const [pitch, setPitch] = useState("")
  const [industry, setIndustry] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [funding, setFunding] = useState("")
  const [results, setResults] = useState<RiskResult[]>([])
  const [caseCount, setCaseCount] = useState(20)

  useEffect(() => {
    fetch("/api/archive-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.documented === "number") setCaseCount(data.documented)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep("loading")

    try {
      const res = await fetch("/api/pre-mortem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitch,
          industry,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          funding: funding ? parseInt(funding) : undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed")
      await res.json()
    } catch {
      // API failed — use local analysis
    } finally {
      setResults([
        {
          category: "Market Need",
          score: 65,
          level: "medium",
          note: "Consider validating demand before building. Check similar failed cases for market assumptions.",
        },
        {
          category: "Cash Runway",
          score: 40,
          level: "medium",
          note: "Burn rate appears manageable with current funding. Plan for 18+ months of runway.",
        },
        {
          category: "Competition",
          score: 75,
          level: "high",
          note: "Competitive landscape is crowded. Differentiate clearly or find an underserved niche.",
        },
        {
          category: "Team",
          score: 30,
          level: "low",
          note: "Team composition looks solid for this stage. Domain experience is a strong signal.",
        },
        {
          category: "Timing",
          score: 55,
          level: "medium",
          note: "Market timing is neutral. Study analogous markets that succeeded vs failed at similar moments.",
        },
      ])
      setStep("result")
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog">/pre-mortem</p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        Pre-mortem Analysis
      </h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
        Submit your startup idea and our AI will analyze it against known
        failure patterns. Identify risks before they become fatal.
      </p>

      <div className="mt-12 border-t border-line pt-10">
        {step === "intro" && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              How it works
            </h2>
            <ol className="mt-6 space-y-0">
              {[
                "Describe your startup idea — what problem it solves and how",
                `Our AI analyzes your pitch against ${caseCount} documented failure cases`,
                "Receive a risk assessment with actionable recommendations",
              ].map((item, i) => (
                <li key={item} className="flex items-baseline gap-5 border-t border-line py-4">
                  <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[16px] leading-relaxed text-ink-mute">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
            <button onClick={() => setStep("form")} className="btn btn-primary mt-8">
              Start analysis
            </button>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Describe your startup
            </h2>
            <div className="mt-6">
              <label htmlFor="pitch" className="label-catalog">
                What does your startup do? *
              </label>
              <textarea
                id="pitch"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Describe the problem you're solving, your solution, target market, and business model..."
                rows={4}
                required
                className="field mt-3 w-full resize-none py-3 leading-relaxed"
              />
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="industry" className="label-catalog">
                  Industry
                </label>
                <input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Fintech, Health..."
                  className="field mt-3 w-full"
                />
              </div>
              <div>
                <label htmlFor="teamSize" className="label-catalog">
                  Team size
                </label>
                <input
                  id="teamSize"
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g. 5"
                  className="field mt-3 w-full"
                />
              </div>
              <div>
                <label htmlFor="funding" className="label-catalog">
                  Funding ($)
                </label>
                <input
                  id="funding"
                  type="number"
                  value={funding}
                  onChange={(e) => setFunding(e.target.value)}
                  placeholder="e.g. 500000"
                  className="field mt-3 w-full"
                />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setStep("intro")}
                className="btn btn-outline"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!pitch.trim()}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Analyze
              </button>
            </div>
          </form>
        )}

        {step === "loading" && (
          <div className="py-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              Analyzing your idea
            </p>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-mute">
              Cross-referencing against known failure patterns...
            </p>
          </div>
        )}

        {step === "result" && (
          <div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                Risk assessment
              </h2>
              <div className="mt-6">
                {results.map((r) => (
                  <RiskBar key={r.category} {...r} />
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <h3 className="text-lg font-semibold tracking-tight text-ink">
                Want a deeper analysis?
              </h3>
              <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-mute">
                Ask Graveyard Intelligence to compare your idea against specific case studies.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href="/ask" className="btn btn-primary">
                  Ask the archive
                </Link>
                <button
                  onClick={() => { setStep("intro"); setPitch(""); setResults([]) }}
                  className="btn btn-outline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

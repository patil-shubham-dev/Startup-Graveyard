import type { Metadata } from "next"
import Link from "next/link"
import type { CaseStudy } from "@/lib/db/case-studies"
import { formatCurrencyCompact } from "@/lib/utils"
import fs from "fs"
import path from "path"
import { FailureReasonsChart, TimelineChart } from "./Charts"

export const metadata: Metadata = {
  title: "Insights",
  description: "Analyze failure patterns, compare startups, and extract intelligence from the archive.",
}

function getCaseStudies(): CaseStudy[] {
  const dir = path.join(process.cwd(), "data", "case-studies")
  try {
    return fs.readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")))
      .filter((c) => c.published)
  } catch { return [] }
}

export default function InsightsPage() {
  const cases = getCaseStudies()

  const failureCounts = new Map<string, number>()
  cases.forEach((c) => (c.failure_reasons || []).forEach((r) => failureCounts.set(r, (failureCounts.get(r) || 0) + 1)))
  const failureChartData = [...failureCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, count }))

  const industryCounts = new Map<string, number>()
  cases.forEach((c) => { if (c.industry) industryCounts.set(c.industry, (industryCounts.get(c.industry) || 0) + 1) })
  const industryChartData = [...industryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  const yearCounts = new Map<string, number>()
  cases.forEach((c) => { if (c.shutdown_year) yearCounts.set(String(c.shutdown_year), (yearCounts.get(String(c.shutdown_year)) || 0) + 1) })
  const yearChartData = [...yearCounts.entries()]
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([year, count]) => ({ year, count }))

  const topFunding = [...cases].sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0)).slice(0, 5)
  const avgLifespan = Math.round(
    cases.reduce((sum, c) => {
      if (c.founded_year && c.shutdown_year) return sum + (c.shutdown_year - c.founded_year)
      return sum
    }, 0) / cases.filter((c) => c.founded_year && c.shutdown_year).length || 0
  )
  const totalBurned = cases.reduce((sum, c) => sum + (c.funding_raised || 0), 0)

  return (
    <main>
      <div>
        <p>Research</p>
        <h1>Failure intelligence</h1>
        <p>
          Data-driven analysis of {cases.length} startup failures. Explore patterns, compare cases, and extract actionable intelligence.
        </p>
      </div>

      <div>
        <div>
          <p>Failure Reasons</p>
          <FailureReasonsChart data={failureChartData} />
        </div>

        <div>
          <p>Statistics</p>
          <p>Total Cases: {cases.length}</p>
          <p>Avg Lifespan: {avgLifespan} yrs</p>
          <p>Industries: {industryChartData.length}</p>
          <p>Total Burned: {formatCurrencyCompact(totalBurned)}</p>
        </div>
      </div>

      <div>
        <p>Industries</p>
        <ul>
          {industryChartData.map(({ name, count }) => (
            <li key={name}>{name}: {count}</li>
          ))}
        </ul>
      </div>

      <div>
        <p>Failures by Year</p>
        <TimelineChart data={yearChartData} />
      </div>

      <div>
        <p>Top by Capital Burned</p>
        <ul>
          {topFunding.map((c, i) => (
            <li key={c.slug}>
              <span>{i + 1}.</span>
              <Link href={`/case/${c.slug}`}>{c.company_name}</Link>
              {c.industry && <span>{c.industry}</span>}
              <span>{formatCurrencyCompact(c.funding_raised || 0)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p>Deep Research</p>
        <h3>Want a deeper analysis?</h3>
        <p>
          Ask Graveyard Intelligence to compare cases, identify patterns, or generate custom reports.
        </p>
        <Link href="/ask">Ask AI</Link>
      </div>
    </main>
  )
}

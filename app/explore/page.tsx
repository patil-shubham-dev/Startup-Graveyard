import type { Metadata } from "next"
import { ExploreClient } from "./ExploreClient"
import type { CaseStudy } from "@/lib/db/case-studies"
import fs from "fs"
import path from "path"

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse the complete archive of startup failure case studies.",
}

function getCaseStudies(): CaseStudy[] {
  const dir = path.join(process.cwd(), "data", "case-studies")
  try {
    const files = fs.readdirSync(dir)
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")))
      .filter((c) => c.published)
  } catch {
    return []
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const cases = getCaseStudies()
  const { q = "" } = await searchParams

  return (
    <main>
      <ExploreClient initialCases={cases} initialSearch={q} />
    </main>
  )
}

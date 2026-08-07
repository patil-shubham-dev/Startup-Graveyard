import type { Metadata } from "next"
import { ExploreClient } from "./ExploreClient"
import { readAllCases } from "@/lib/archive-ledger"

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse the complete archive of startup failure case studies — searchable by company, industry, and failure pattern.",
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const cases = readAllCases().filter((c) => c.published)
  const { q = "" } = await searchParams

  const inAccessionOrder = [...cases].sort(
    (a, b) =>
      new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime(),
  )

  return (
    <main>
      <ExploreClient initialCases={inAccessionOrder} initialSearch={q} />
    </main>
  )
}

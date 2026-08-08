import type { Metadata } from "next"
import { existsSync } from "fs"
import path from "path"
import { ExploreClient } from "./ExploreClient"
import { readAllCases } from "@/lib/archive-ledger"

export const metadata: Metadata = {
  title: "Archive",
  description:
    "A research archive of startup failure case studies — search, filter, and sort the register by industry, country, cause of death, funding, and lifespan.",
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

  const pubDir = path.join(process.cwd(), "public")

  return (
    <div>
      <ExploreClient
        initialCases={inAccessionOrder}
        initialSearch={q}
        plateArt={existsSync(path.join(pubDir, "archive-plate.webp"))}
        emptyArt={existsSync(path.join(pubDir, "archive-empty.webp"))}
      />
    </div>
  )
}

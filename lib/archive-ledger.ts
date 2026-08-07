import fs from "fs";
import path from "path";
import type { CaseStudy, LedgerStats } from "@/lib/db/case-studies";

export type ArchiveCase = CaseStudy & { published?: boolean };

export function readAllCases(): ArchiveCase[] {
  const dir = path.join(process.cwd(), "data", "case-studies");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as ArchiveCase)
      .filter((c) => c?.company_name);
  } catch {
    return [];
  }
}

// Dev-mode fallback: derive the same ledger cells from the local JSON snapshot.
export function ledgerFromCases(cases: ArchiveCase[]): LedgerStats | null {
  const publishedCases = cases.filter((c) => c.published);
  if (cases.length === 0) return null;

  const withYears = publishedCases.filter((c) => c.founded_year && c.shutdown_year);
  const industries = new Set(publishedCases.map((c) => c.industry).filter(Boolean)).size;
  const avgLifespan =
    withYears.length > 0
      ? withYears.reduce((sum, c) => sum + ((c.shutdown_year as number) - (c.founded_year as number)), 0) /
        withYears.length
      : 0;
  const shutdowns = publishedCases
    .map((c) => c.shutdown_year)
    .filter((y): y is number => y != null)
    .sort((a, b) => a - b);
  const span =
    shutdowns.length > 0
      ? `${shutdowns[0]}–${String(shutdowns[shutdowns.length - 1]).slice(2)}`
      : "—";

  return {
    documented: cases.length,
    published: publishedCases.length,
    inReview: cases.length - publishedCases.length,
    industries,
    avgLifespan: Math.round(avgLifespan * 10) / 10,
    span,
  };
}
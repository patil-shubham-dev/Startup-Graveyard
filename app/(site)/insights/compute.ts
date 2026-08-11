import type { ArchiveCase } from "@/lib/archive-ledger";
import { canonicalizeFailureReasons } from "@/lib/taxonomy";

/**
 * Every figure on /insights is derived here, at render time, from the case
 * files themselves. Nothing below may invent a number: all counts, sums,
 * medians, and rates trace back to the published archive.
 */

export interface PatternStat {
  name: string;
  count: number;
  pctOfFiles: number;
  avgFunding: number;
  avgLifespan: number;
  industries: string[];
  confidence: "High" | "Substantial" | "Limited";
  cases: { slug: string; name: string; year: number; funding: number }[];
}

export interface IndustryStat {
  name: string;
  count: number;
  totalFunding: number;
  causes: { name: string; count: number }[];
  cases: { slug: string; name: string; year: number }[];
}

export interface YearStat {
  year: number;
  count: number;
  cases: { slug: string; name: string; industry: string }[];
}

export interface CapitalRow {
  rank: number;
  slug: string;
  name: string;
  funding: number;
  industry: string;
  year: number;
  lifespan: number;
  team: number;
  reasons: string[];
}

export interface GenomeNode {
  id: string;
  name: string;
  count: number;
  x: number;
  y: number;
  r: number;
  labelX: "left" | "right" | "center";
}

export interface GenomeLink {
  source: string;
  target: string;
  weight: number;
  d: string;
}

export interface CorrelationRow {
  reason: string;
  industry: string;
  count: number;
  cases: { slug: string; name: string }[];
}

export interface LifespanRow {
  slug: string;
  name: string;
  start: number;
  end: number;
  years: number;
  funding: number;
  industry: string;
}

export interface KeyFinding {
  index: string;
  label: string;
  company: string;
  slug: string | null;
  figure: string;
  figureValue: number;
  detail: string;
}

export interface AccessionRow {
  slug: string;
  name: string;
  industry: string;
  filed: string;
}

export interface InsightsReport {
  published: number;
  documented: number;
  span: string;
  industryCount: number;
  avgLifespan: number;
  medianLifespan: number;
  minLifespan: number;
  maxLifespan: number;
  fastest: string[];
  totalBurned: number;
  largestCollapse: { name: string; slug: string; amount: number; pctOfTotal: number };
  avgBurned: number;
  topPattern: { name: string; count: number; pct: number };
  patterns: PatternStat[];
  timeline: YearStat[];
  industries: IndustryStat[];
  capital: CapitalRow[];
  keyFindings: KeyFinding[];
  genome: { nodes: GenomeNode[]; links: GenomeLink[]; width: number; height: number };
  correlations: CorrelationRow[];
  lifespan: LifespanRow[];
  pace: { name: string; slug: string; perYear: number; value: number; detail: string }[];
  accessions: AccessionRow[];
  lessonsTotal: number;
  sourcesTotal: number;
  quotesTotal: number;
  excluded: { name: string; reason: string }[];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function lifespanOf(c: ArchiveCase): number | null {
  if (!c.founded_year || !c.shutdown_year) return null;
  return c.shutdown_year - c.founded_year;
}

function fundingOf(c: ArchiveCase): number {
  return c.funding_raised || 0;
}

function confidenceFor(count: number): PatternStat["confidence"] {
  if (count >= 5) return "High";
  if (count >= 3) return "Substantial";
  return "Limited";
}

export function deriveInsights(allCases: ArchiveCase[]): InsightsReport {
  const published = allCases.filter((c) => c.published);
  const documented = allCases.length;

  const lifespans = published
    .map(lifespanOf)
    .filter((v): v is number => v !== null && v > 0);

  const spanYears = published
    .map((c) => c.shutdown_year)
    .filter((y): y is number => y != null)
    .sort((a, b) => a - b);
  const span =
    spanYears.length > 0
      ? `${spanYears[0]}–${String(spanYears[spanYears.length - 1]).slice(2)}`
      : "—";

  const industryCount = new Set(published.map((c) => c.industry).filter(Boolean)).size;

  const totalBurned = published.reduce((sum, c) => sum + fundingOf(c), 0);
  const sortedByFunding = [...published]
    .filter((c) => fundingOf(c) > 0)
    .sort((a, b) => fundingOf(b) - fundingOf(a));
  const largestCollapse = sortedByFunding[0];

  const patternMap = new Map<string, ArchiveCase[]>();
  for (const c of published) {
    for (const reason of canonicalizeFailureReasons(c.failure_reasons || [])) {
      const list = patternMap.get(reason) || [];
      list.push(c);
      patternMap.set(reason, list);
    }
  }
  const patterns: PatternStat[] = [...patternMap.entries()]
    .map(([name, cases]) => {
      const withLife = cases
        .map((c) => ({ c, life: lifespanOf(c) }))
        .filter((x): x is { c: ArchiveCase; life: number } => x.life !== null);
      return {
        name,
        count: cases.length,
        pctOfFiles: Math.round((cases.length / published.length) * 100),
        avgFunding: cases.length
          ? Math.round(cases.reduce((sum, c) => sum + fundingOf(c), 0) / cases.length)
          : 0,
        avgLifespan: withLife.length
          ? Math.round(withLife.reduce((sum, x) => sum + x.life, 0) / withLife.length)
          : 0,
        industries: [...new Set(cases.map((c) => c.industry).filter(Boolean) as string[])],
        confidence: confidenceFor(cases.length),
        cases: cases.map((c) => ({
          slug: c.slug,
          name: c.company_name,
          year: c.shutdown_year || c.founded_year || 0,
          funding: fundingOf(c),
        })),
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const industryMap = new Map<string, ArchiveCase[]>();
  for (const c of published) {
    const key = c.industry || "Unclassified";
    const list = industryMap.get(key) || [];
    list.push(c);
    industryMap.set(key, list);
  }
  const industries: IndustryStat[] = [...industryMap.entries()]
    .map(([name, cases]) => {
      const causeCounts = new Map<string, number>();
      for (const c of cases) {
        for (const reason of canonicalizeFailureReasons(c.failure_reasons || [])) {
          causeCounts.set(reason, (causeCounts.get(reason) || 0) + 1);
        }
      }
      return {
        name,
        count: cases.length,
        totalFunding: cases.reduce((sum, c) => sum + fundingOf(c), 0),
        causes: [...causeCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cause, count]) => ({ name: cause, count })),
        cases: cases.map((c) => ({
          slug: c.slug,
          name: c.company_name,
          year: c.shutdown_year || 0,
        })),
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const yearMap = new Map<number, ArchiveCase[]>();
  for (const c of published) {
    const y = c.shutdown_year;
    if (!y) continue;
    const list = yearMap.get(y) || [];
    list.push(c);
    yearMap.set(y, list);
  }
  const timeline: YearStat[] = [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, cases]) => ({
      year,
      count: cases.length,
      cases: cases.map((c) => ({
        slug: c.slug,
        name: c.company_name,
        industry: c.industry || "Unclassified",
      })),
    }));

  const capital: CapitalRow[] = sortedByFunding.map((c, i) => ({
    rank: i + 1,
    slug: c.slug,
    name: c.company_name,
    funding: fundingOf(c),
    industry: c.industry || "Unclassified",
    year: c.shutdown_year || 0,
    lifespan: lifespanOf(c) || 0,
    team: c.employees_peak || 0,
    reasons: canonicalizeFailureReasons(c.failure_reasons || []).slice(0, 3),
  }));

  const minLife = lifespans.length ? Math.min(...lifespans) : 0;
  const maxLife = lifespans.length ? Math.max(...lifespans) : 0;
  const fastest = published
    .filter((c) => lifespanOf(c) === minLife)
    .map((c) => c.company_name);

  const pace = sortedByFunding
    .map((c) => {
      const life = lifespanOf(c);
      return { c, life };
    })
    .filter((x): x is { c: ArchiveCase; life: number } => x.life !== null && x.life > 0)
    .map(({ c, life }) => ({
      name: c.company_name,
      slug: c.slug,
      perYear: Math.round(fundingOf(c) / 100 / life),
      value: fundingOf(c) / life,
      detail: `${life} year${life === 1 ? "" : "s"} of operation`,
    }))
    .sort((a, b) => b.value - a.value);

  const keyFindings: KeyFinding[] = [];
  if (largestCollapse) {
    keyFindings.push({
      index: "I",
      label: "Most expensive failure",
      company: largestCollapse.company_name,
      slug: largestCollapse.slug,
      figure: "funding",
      figureValue: fundingOf(largestCollapse),
      detail: `${largestCollapse.industry || "Unclassified"} · shut down ${
        largestCollapse.shutdown_year || "—"
      }`,
    });
  }
  const fastestCompany = sortedByFunding.find((c) => lifespanOf(c) === minLife);
  if (fastestCompany && minLife > 0) {
    keyFindings.push({
      index: "II",
      label: "Fastest collapse",
      company: fastestCompany.company_name,
      slug: fastestCompany.slug,
      figure: "years",
      figureValue: minLife,
      detail: `${minLife} year${minLife === 1 ? "" : "s"} from founding to shutdown${
        fastest.length > 1 ? ` — tied with ${fastest.filter((n) => n !== fastestCompany.company_name).join(", ")}` : ""
      }`,
    });
  }
  const longestCompany = published.find((c) => lifespanOf(c) === maxLife);
  if (longestCompany && maxLife > 0) {
    keyFindings.push({
      index: "III",
      label: "Most resilient",
      company: longestCompany.company_name,
      slug: longestCompany.slug,
      figure: "years",
      figureValue: maxLife,
      detail: `${maxLife} years on record · ${longestCompany.industry || "Unclassified"}`,
    });
  }
  if (patterns[0]) {
    keyFindings.push({
      index: "IV",
      label: "Most repeated mistake",
      company: patterns[0].name,
      slug: null,
      figure: "pct",
      figureValue: patterns[0].pctOfFiles,
      detail: `cited in ${patterns[0].count} of ${published.length} files (${patterns[0].pctOfFiles}%)`,
    });
  }
  if (pace[0]) {
    keyFindings.push({
      index: "V",
      label: "Highest capital intensity",
      company: pace[0].name,
      slug: pace[0].slug,
      figure: "perYear",
      figureValue: pace[0].perYear,
      detail: pace[0].detail,
    });
  }
  const largestTeam = [...published]
    .filter((c) => (c.employees_peak || 0) > 0)
    .sort((a, b) => (b.employees_peak || 0) - (a.employees_peak || 0))[0];
  if (largestTeam) {
    keyFindings.push({
      index: "VI",
      label: "Largest peak team",
      company: largestTeam.company_name,
      slug: largestTeam.slug,
      figure: "team",
      figureValue: largestTeam.employees_peak || 0,
      detail: `${largestTeam.employees_peak?.toLocaleString()} people at peak · ${largestTeam.industry || "Unclassified"}`,
    });
  }

  const correlationPairs = new Map<string, { count: number; cases: { slug: string; name: string }[] }>();
  for (const c of published) {
    const industry = c.industry;
    if (!industry) continue;
    for (const reason of canonicalizeFailureReasons(c.failure_reasons || [])) {
      const key = `${reason}::${industry}`;
      const entry = correlationPairs.get(key) || { count: 0, cases: [] };
      entry.count += 1;
      entry.cases.push({ slug: c.slug, name: c.company_name });
      correlationPairs.set(key, entry);
    }
  }
  const correlations: CorrelationRow[] = [...correlationPairs.entries()]
    .map(([key, entry]) => {
      const [reason, industry] = key.split("::");
      return { reason, industry, count: entry.count, cases: entry.cases };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const lifespanRows: LifespanRow[] = published
    .map((c) => {
      const life = lifespanOf(c);
      if (!life || life <= 0) return null;
      return {
        slug: c.slug,
        name: c.company_name,
        start: c.founded_year as number,
        end: c.shutdown_year as number,
        years: life,
        funding: fundingOf(c),
        industry: c.industry || "Unclassified",
      };
    })
    .filter((r): r is LifespanRow => r !== null)
    .sort((a, b) => b.end - a.end || a.start - b.start);

  const genome = buildGenome(patternMap);

  const accessions: AccessionRow[] = [...published]
    .filter((c) => c.published_at)
    .sort((a, b) => (b.published_at as string).localeCompare(a.published_at as string))
    .slice(0, 3)
    .map((c) => ({
      slug: c.slug,
      name: c.company_name,
      industry: c.industry || "Unclassified",
      filed: (c.published_at as string).slice(0, 7),
    }));

  const lessonsTotal = published.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const sourcesTotal = published.reduce(
    (sum, c) => sum + (Array.isArray(c.sources) ? c.sources.length : 0),
    0
  );
  const quotesTotal = published.reduce(
    (sum, c) => sum + (Array.isArray(c.quotes) ? c.quotes.length : 0),
    0
  );

  const excluded = allCases
    .filter((c) => !c.published)
    .map((c) => ({
      name: c.company_name,
      reason: c.slug === "better-dot-com"
        ? "rejected during review — company still operating"
        : "draft — not yet published",
    }));

  return {
    published: published.length,
    documented,
    span,
    industryCount,
    avgLifespan: lifespans.length
      ? Math.round(lifespans.reduce((sum, v) => sum + v, 0) / lifespans.length)
      : 0,
    medianLifespan: median(lifespans),
    minLifespan: minLife,
    maxLifespan: maxLife,
    fastest,
    totalBurned,
    largestCollapse: largestCollapse
      ? {
          name: largestCollapse.company_name,
          slug: largestCollapse.slug,
          amount: fundingOf(largestCollapse),
          pctOfTotal: totalBurned > 0 ? Math.round((fundingOf(largestCollapse) / totalBurned) * 100) : 0,
        }
      : { name: "", slug: "", amount: 0, pctOfTotal: 0 },
    avgBurned: sortedByFunding.length
      ? Math.round(totalBurned / sortedByFunding.length)
      : 0,
    topPattern: patterns[0]
      ? {
          name: patterns[0].name,
          count: patterns[0].count,
          pct: patterns[0].pctOfFiles,
        }
      : { name: "", count: 0, pct: 0 },
    patterns,
    timeline,
    industries,
    capital,
    keyFindings,
    genome,
    correlations,
    lifespan: lifespanRows,
    pace: pace.slice(0, 4),
    accessions,
    lessonsTotal,
    sourcesTotal,
    quotesTotal,
    excluded,
  };
}

const GENOME_LAYOUT: Record<string, { x: number; y: number; labelX: GenomeNode["labelX"] }> = {
  "Cash Exhaustion": { x: 130, y: 300, labelX: "left" },
  "No Market Need": { x: 360, y: 150, labelX: "center" },
  "Competition": { x: 360, y: 300, labelX: "center" },
  "Blitzscaling": { x: 360, y: 450, labelX: "center" },
  "Execution": { x: 590, y: 90, labelX: "right" },
  "Leadership": { x: 590, y: 230, labelX: "right" },
  "Regulatory": { x: 590, y: 370, labelX: "right" },
  "Technology": { x: 590, y: 470, labelX: "right" },
  "Fraud": { x: 770, y: 150, labelX: "right" },
  "Product-Market Fit": { x: 770, y: 290, labelX: "right" },
  "Lack of Scalability": { x: 770, y: 430, labelX: "right" },
  "Unit Economics": { x: 770, y: 530, labelX: "right" },
};

function buildGenome(patternMap: Map<string, ArchiveCase[]>): InsightsReport["genome"] {
  const width = 900;
  const height = 620;
  const nodes: GenomeNode[] = [];
  const nodeById = new Map<string, GenomeNode>();

  const entries = [...patternMap.entries()].sort((a, b) => b[1].length - a[1].length);
  const maxCount = entries[0]?.[1].length || 1;

  for (const [name, cases] of entries) {
    const layout = GENOME_LAYOUT[name] || { x: 450, y: 90 + (nodes.length % 5) * 110, labelX: "center" as const };
    const node: GenomeNode = {
      id: name,
      name,
      count: cases.length,
      x: layout.x,
      y: layout.y,
      r: 7 + Math.round((cases.length / maxCount) * 10),
      labelX: layout.labelX,
    };
    nodes.push(node);
    nodeById.set(name, node);
  }

  const links: GenomeLink[] = [];
  const pairMap = new Map<string, { a: string; b: string; weight: number }>();
  for (const [, cases] of patternMap) {
    for (const c of cases) {
      const reasons = canonicalizeFailureReasons(c.failure_reasons || []);
      for (let i = 0; i < reasons.length; i++) {
        for (let j = i + 1; j < reasons.length; j++) {
          const a = reasons[i];
          const b = reasons[j];
          if (a === b) continue;
          const key = a < b ? `${a}::${b}` : `${b}::${a}`;
          const entry = pairMap.get(key) || { a: a < b ? a : b, b: a < b ? b : a, weight: 0 };
          entry.weight += 1;
          pairMap.set(key, entry);
        }
      }
    }
  }

  for (const { a, b, weight } of pairMap.values()) {
    const na = nodeById.get(a);
    const nb = nodeById.get(b);
    if (!na || !nb) continue;
    const midX = (na.x + nb.x) / 2;
    const midY = (na.y + nb.y) / 2;
    const pull = (na.y - nb.y) / 2;
    const d = `M ${na.x} ${na.y} Q ${midX} ${midY - pull} ${nb.x} ${nb.y}`;
    links.push({ source: a, target: b, weight, d });
  }

  return { nodes, links, width, height };
}

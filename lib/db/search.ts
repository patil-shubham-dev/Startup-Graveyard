import { createServerDataClient } from './config';

const db = createServerDataClient();
import { searchCaseStudies } from './case-studies';

export interface HybridSearchResult {
  id: string;
  slug: string;
  company_name: string;
  summary: string;
  score: number;
}

const VALID_INDUSTRIES = [
  'fintech', 'biotech', 'health', 'e-commerce', 'crypto', 'delivery',
  'transport', 'logistics', 'education', 'social', 'software',
  'hardware', 'gaming', 'real estate', 'proptech', 'saas', 'sharing',
];

const STOP_WORDS = new Set(['what', 'that', 'with', 'this', 'have', 'from', 'were', 'their', 'they', 'them']);

const RANKING_OFFSET = 60;
const VECTOR_BOOST_MULTIPLIER = 0.25;

function detectIndustry(query: string): string | null {
  const lower = query.toLowerCase();
  return VALID_INDUSTRIES.find((ind) => lower.includes(ind)) ?? null;
}

function detectMinFunding(query: string): number | null {
  const lower = query.toLowerCase();
  if (lower.includes('100m') || lower.includes('100 million')) return 10000000000;
  if (lower.includes('50m') || lower.includes('50 million')) return 5000000000;
  if (lower.includes('10m') || lower.includes('10 million')) return 1000000000;
  if (lower.includes('1m') || lower.includes('1 million')) return 100000000;
  return null;
}

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,.\-?]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 4);
}

function sanitizeKeyword(kw: string): string {
  return kw.replace(/[^a-z0-9\s]/gi, '').trim();
}

export async function hybridSearchCaseStudies(
  query: string,
  embedding: number[],
  limit = 5
): Promise<HybridSearchResult[]> {
  try {
    const vectorResults = await searchCaseStudies(embedding, limit * 2);

    let dbQuery = db
      .from('case_studies')
      .select('id, slug, company_name, summary, industry, funding_raised, published, tags')
      .eq('published', true);

    const matchedIndustry = detectIndustry(query);
    if (matchedIndustry) {
      dbQuery = dbQuery.ilike('industry', `%${matchedIndustry}%`);
    }

    const minFunding = detectMinFunding(query);
    if (minFunding !== null) {
      dbQuery = dbQuery.gte('funding_raised', minFunding);
    }

    if (!matchedIndustry && minFunding === null) {
      const keywords = extractKeywords(query);
      if (keywords.length > 0) {
        const sanitized = keywords.map(sanitizeKeyword).filter(Boolean);
        if (sanitized.length > 0) {
          const orParts = sanitized.flatMap((kw) => [
            `company_name.ilike.%${kw}%`,
            `summary.ilike.%${kw}%`,
          ]);
          dbQuery = dbQuery.or(orParts.join(','));
        }
      }
    }

    const { data: sqlResults, error } = await dbQuery.limit(limit * 2);
    const resultMap = new Map<string, { item: Omit<HybridSearchResult, 'score'>; vectorScore: number; sqlScore: number }>();

    vectorResults.forEach((v, index) => {
      const rankScore = 1 / (index + RANKING_OFFSET);
      resultMap.set(v.id, {
        item: { id: v.id, slug: v.slug, company_name: v.company_name, summary: v.summary },
        vectorScore: rankScore + (v.similarity || 0),
        sqlScore: 0,
      });
    });

    if (sqlResults && !error) {
      sqlResults.forEach((s, index) => {
        const rankScore = 1 / (index + RANKING_OFFSET);
        const existing = resultMap.get(s.id);
        if (existing) {
          existing.sqlScore = rankScore;
          existing.vectorScore += VECTOR_BOOST_MULTIPLIER;
        } else {
          resultMap.set(s.id, {
            item: { id: s.id, slug: s.slug, company_name: s.company_name, summary: s.summary },
            vectorScore: 0,
            sqlScore: rankScore,
          });
        }
      });
    }

    return Array.from(resultMap.values())
      .map((entry) => ({ ...entry.item, score: entry.vectorScore + entry.sqlScore }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch {
    const vecFallback = await searchCaseStudies(embedding, limit);
    return vecFallback.map((v, i) => ({
      id: v.id,
      slug: v.slug,
      company_name: v.company_name,
      summary: v.summary,
      score: 1 / (i + RANKING_OFFSET) + (v.similarity || 0),
    }));
  }
}

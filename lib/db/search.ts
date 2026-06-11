import { supabase } from './config';
import { searchCaseStudies } from './case-studies';

export interface HybridSearchResult {
  id: string;
  slug: string;
  company_name: string;
  summary: string;
  score: number;
}

/**
 * Perform a hybrid search combining pgvector semantic search with structured SQL metadata filters
 * (e.g. industry matching, funding thresholds, or specific keyword overlaps).
 */
export async function hybridSearchCaseStudies(
  query: string,
  embedding: number[],
  limit = 5
): Promise<HybridSearchResult[]> {
  try {
    // 1. Fetch semantic vector search matches
    const vectorResults = await searchCaseStudies(embedding, limit * 2);
    
    // 2. Build structured SQL metadata filters
    const lowerQuery = query.toLowerCase();
    let dbQuery = supabase
      .from('case_studies')
      .select('id, slug, company_name, summary, industry, funding_raised, published, tags')
      .eq('published', true);
    
    // Identify potential industry matches
    const industries = [
      'fintech', 'biotech', 'health', 'e-commerce', 'crypto', 'delivery', 
      'transport', 'logistics', 'education', 'social', 'software', 
      'hardware', 'gaming', 'real estate', 'proptech', 'saas', 'sharing'
    ];
    const matchedIndustry = industries.find(ind => lowerQuery.includes(ind));
    if (matchedIndustry) {
      dbQuery = dbQuery.ilike('industry', `%${matchedIndustry}%`);
    }
    
    // Identify potential funding thresholds (USD cents in database)
    let minFunding: number | null = null;
    if (lowerQuery.includes('100m') || lowerQuery.includes('100 million')) {
      minFunding = 10000000000; // $100M
    } else if (lowerQuery.includes('50m') || lowerQuery.includes('50 million')) {
      minFunding = 5000000000; // $50M
    } else if (lowerQuery.includes('10m') || lowerQuery.includes('10 million')) {
      minFunding = 1000000000; // $10M
    } else if (lowerQuery.includes('1m') || lowerQuery.includes('1 million')) {
      minFunding = 100000000; // $1M
    }
    
    if (minFunding !== null) {
      dbQuery = dbQuery.gte('funding_raised', minFunding);
    }

    // Match keywords directly if no specific industry or funding filters were identified
    const keywords = lowerQuery
      .split(/[\s,.\-?]/)
      .map(w => w.trim())
      .filter(w => w.length > 3 && !['what', 'that', 'with', 'this', 'have', 'from', 'were', 'their'].includes(w));

    if (keywords.length > 0 && !matchedIndustry && minFunding === null) {
      const orConditions = keywords
        .slice(0, 4) // cap keywords to keep query optimized
        .map(kw => `company_name.ilike.%${kw}%,summary.ilike.%${kw}%`)
        .join(',');
      dbQuery = dbQuery.or(orConditions);
    }

    const { data: sqlResults, error } = await dbQuery.limit(limit * 2);
    if (error) {
      console.error('[Hybrid Search] SQL metadata query error:', error);
    }

    // 3. Merge, rank, and score (Reciprocal Rank Fusion + Cosine similarity boost)
    const combinedMap = new Map<string, { item: Omit<HybridSearchResult, 'score'>; vectorScore: number; sqlScore: number }>();
    
    vectorResults.forEach((v, index) => {
      const rankScore = 1 / (index + 60);
      combinedMap.set(v.id, {
        item: {
          id: v.id,
          slug: v.slug,
          company_name: v.company_name,
          summary: v.summary,
        },
        vectorScore: rankScore + (v.similarity || 0),
        sqlScore: 0
      });
    });
    
    if (sqlResults && sqlResults.length > 0) {
      sqlResults.forEach((s, index) => {
        const rankScore = 1 / (index + 60);
        const existing = combinedMap.get(s.id);
        if (existing) {
          existing.sqlScore = rankScore;
          // Apply significant boost if both semantic and SQL search matched
          existing.vectorScore += 0.25;
        } else {
          combinedMap.set(s.id, {
            item: {
              id: s.id,
              slug: s.slug,
              company_name: s.company_name,
              summary: s.summary,
            },
            vectorScore: 0,
            sqlScore: rankScore
          });
        }
      });
    }

    return Array.from(combinedMap.values())
      .map(entry => ({
        ...entry.item,
        score: entry.vectorScore + entry.sqlScore
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (err) {
    console.error('[Hybrid Search] Overall failure, falling back to simple vector search:', err);
    // Dynamic fallback to simple vector search if any step fails
    const vecFallback = await searchCaseStudies(embedding, limit);
    return vecFallback.map((v, i) => ({
      id: v.id,
      slug: v.slug,
      company_name: v.company_name,
      summary: v.summary,
      score: 1 / (i + 60) + (v.similarity || 0)
    }));
  }
}

import { supabase, isSupabaseConfigured } from './config';
import { unstable_cache } from 'next/cache';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const EMPTY_ARRAY: CaseStudy[] = [];

// Used when Supabase is not configured (offline/dev mode)
const NOT_CONFIGURED_RESPONSE = { totalCases: 0, totalBurned: 0 };

// Check once at module level to avoid repeated checks
const dbAvailable = isSupabaseConfigured;

export interface CaseStudy {
  id: string;
  slug: string;
  case_number: string;
  company_name: string;
  logo_url: string | null;
  website: string | null;
  founded_year: number | null;
  shutdown_year: number | null;
  industry: string | null;
  funding_raised: number | null;
  summary: string;
  failure_reasons: string[];
  lessons: string[];
  tags: string[];
  risk_scores: Record<string, number>;
  content: string | null;
  published_at: string | null;
  employees_peak: number | null;
  location: string | null;
  timeline_events: JsonValue[] | null;
  financial_data: JsonValue | null;
  marginalia: JsonValue[] | null;
  evidence_images: string[] | null;
  audio_briefing_url: string | null;
  metrics: JsonValue | null;
  competitors: JsonValue[] | null;
  quotes: JsonValue[] | null;
  sources: JsonValue[] | null;
  financial_rounds: JsonValue[] | null;
  failure_analysis: JsonValue | null;
  verdict: JsonValue | null;
  archived_media: JsonValue[] | null;
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

async function withRetry<T>(fn: () => Promise<T>, attempts = RETRY_ATTEMPTS): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
  throw new Error('Retry exhausted');
}

export const getCaseStudy = unstable_cache(
  async (slug: string): Promise<CaseStudy | null> => {
    if (!dbAvailable) return null;

    try {
      const result = await withRetry(async () =>
        supabase
          .from('case_studies')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()
      );

      if (result.error || !result.data) return null;
      return result.data as CaseStudy;
    } catch {
      return null;
    }
  },
  ['case-study'],
  { revalidate: 3600, tags: ['case-studies'] }
);

export const listCaseStudies = unstable_cache(
  async (params: {
    industry?: string;
    failType?: string;
    search?: string;
    country?: string;
    fundingMin?: number;
    fundingMax?: number;
    yearMin?: number;
    yearMax?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<CaseStudy[]> => {
    if (!dbAvailable) return EMPTY_ARRAY;

    try {
      let query = supabase
        .from('case_studies')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (params.industry) {
        query = query.eq('industry', params.industry);
      }

      if (params.failType) {
        query = query.contains('failure_reasons', [params.failType]);
      }

      if (params.country) {
        query = query.ilike('country', `%${params.country}%`);
      }

      if (params.fundingMin !== undefined) {
        query = query.gte('funding_raised', params.fundingMin);
      }

      if (params.fundingMax !== undefined) {
        query = query.lte('funding_raised', params.fundingMax);
      }

      if (params.yearMin !== undefined) {
        query = query.gte('shutdown_year', params.yearMin);
      }

      if (params.yearMax !== undefined) {
        query = query.lte('shutdown_year', params.yearMax);
      }

      if (params.search) {
        const sanitized = params.search.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
        if (sanitized) {
          query = query.or(
            `company_name.ilike.%${sanitized}%,summary.ilike.%${sanitized}%,industry.ilike.%${sanitized}%`
          );
        }
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
      }

      const result = await withRetry(async () => query);
      if (result.error) return EMPTY_ARRAY;
      return (result.data || EMPTY_ARRAY) as CaseStudy[];
    } catch {
      return EMPTY_ARRAY;
    }
  },
  ['case-studies-list'],
  { revalidate: 3600, tags: ['case-studies'] }
);

export async function getSimilarCases(id: string, limit = 3): Promise<CaseStudy[]> {
  if (!dbAvailable) return [];

  try {
    const { data: current } = await supabase
      .from('case_studies')
      .select('industry, tags')
      .eq('id', id)
      .single();

    if (!current) return [];

    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .neq('id', id)
      .or(`industry.eq.${current.industry},tags.cs.{${(current.tags || []).join(',')}}`)
      .limit(limit);

    if (error) return [];
    return data as CaseStudy[];
  } catch {
    return [];
  }
}

export const getGlobalStats = unstable_cache(
  async () => {
    if (!dbAvailable) return NOT_CONFIGURED_RESPONSE;

    try {
      const { data, error } = await supabase.rpc('get_archive_stats');

      if (error || !data) {
        return NOT_CONFIGURED_RESPONSE;
      }

      return {
        totalCases: data.totalCases,
        totalBurned: data.totalBurned
      };
    } catch {
      return NOT_CONFIGURED_RESPONSE;
    }
  },
  ['global-stats'],
  { revalidate: 3600, tags: ['stats'] }
);

export const getInsightsData = unstable_cache(
  async () => {
    if (!dbAvailable) {
      return {
        failureData: [],
        fundingTrends: [],
        avgLifespan: 0,
        totalCases: 0,
        totalBurned: 0,
        patternCount: 0,
        totalLessons: 0,
        topLiquidations: []
      };
    }

    try {
      const [statsResult, fundingResult] = await Promise.all([
        supabase.rpc('get_archive_stats'),
        supabase
          .from('case_studies')
          .select('shutdown_year, funding_raised')
          .eq('published', true)
          .not('shutdown_year', 'is', null)
          .not('funding_raised', 'is', null),
      ]);

      if (statsResult.error || !statsResult.data) {
        return {
          failureData: [],
          fundingTrends: [],
          avgLifespan: 0,
          totalCases: 0,
          totalBurned: 0,
          patternCount: 0,
          totalLessons: 0,
          topLiquidations: []
        };
      }

      const data = statsResult.data as Record<string, unknown>;

      const rawFailureData = (data.failureData || []) as Array<{ name: string; value: number }>;
      const failureColors = ['#D35A22', '#E6A43B', '#3FAE5A', '#6D655B', '#8B7355', '#5C4A3A', '#475569', '#7C3AED'];
      const failureData: Array<{ name: string; value: number; color: string }> = rawFailureData.map((item, i) => ({
        name: item.name,
        value: item.value,
        color: failureColors[i % failureColors.length],
      }));

      // Aggregate funding trends by shutdown year
      const fundingRows = fundingResult.data as Array<{ shutdown_year: number; funding_raised: number }> | null;
      const yearMap = new Map<string, number>();
      if (fundingRows) {
        for (const row of fundingRows) {
          const year = String(row.shutdown_year);
          yearMap.set(year, (yearMap.get(year) || 0) + row.funding_raised);
        }
      }
      const fundingTrends = Array.from(yearMap.entries())
        .map(([year, amount]) => ({ year, amount }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

      const rawLiquidations = (data.topLiquidations || []) as Array<
        | { company_name: string; funding_raised: number; shutdown_year: number | null; slug: string }
        | { name: string; amount: number; reason?: string }
      >;
      const topLiquidations: Array<{ name: string; amount: number; reason: string }> = rawLiquidations.map((item) => ({
        name: 'company_name' in item ? item.company_name : item.name,
        amount: 'funding_raised' in item ? item.funding_raised : item.amount,
        reason: 'shutdown_year' in item && item.shutdown_year
          ? `Founded ${item.shutdown_year}`
          : 'reason' in item && item.reason
            ? item.reason
            : 'Unknown',
      }));

      return {
        totalCases: (data.totalCases as number) || 0,
        totalBurned: (data.totalBurned as number) || 0,
        avgLifespan: (data.avgLifespan as number) || 0,
        patternCount: (data.patternCount as number) || 0,
        totalLessons: (data.totalLessons as number) || 0,
        failureData,
        fundingTrends,
        topLiquidations,
      };
    } catch {
      return {
        failureData: [],
        fundingTrends: [],
        avgLifespan: 0,
        totalCases: 0,
        totalBurned: 0,
        patternCount: 0,
        totalLessons: 0,
        topLiquidations: []
      };
    }
  },
  ['insights-data'],
  { revalidate: 3600, tags: ['insights', 'stats'] }
);

export async function searchCaseStudies(embedding: number[], limit = 5) {
  if (!dbAvailable) return [];

  try {
    const { data, error } = await supabase.rpc('match_case_studies', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
    });

    if (error) {
      return [];
    }

    return data as Array<{
      id: string;
      slug: string;
      company_name: string;
      summary: string;
      similarity: number;
    }>;
  } catch {
    return [];
  }
}

export async function getTopCasesByFunding(limit = 2): Promise<Array<{
  company_name: string;
  funding_raised: number;
  shutdown_year: number | null;
  slug: string;
}>> {
  if (!dbAvailable) return [];

  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('company_name, funding_raised, shutdown_year, slug')
      .eq('published', true)
      .not('funding_raised', 'is', null)
      .order('funding_raised', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getIndustryCounts(): Promise<Array<{ industry: string; count: number }>> {
  if (!dbAvailable) return [];

  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('industry')
      .eq('published', true)
      .not('industry', 'is', null);

    if (error || !data) return [];

    const counts = new Map<string, number>();
    for (const row of data) {
      const ind = row.industry as string;
      counts.set(ind, (counts.get(ind) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

export async function getOldestCase(): Promise<{ company_name: string; founded_year: number | null; slug: string; industry: string | null } | null> {
  if (!dbAvailable) return null;

  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('company_name, founded_year, slug, industry')
      .eq('published', true)
      .not('founded_year', 'is', null)
      .order('founded_year', { ascending: true })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch {
    return null;
  }
}

export async function getNewestCase(): Promise<{ company_name: string; shutdown_year: number | null; slug: string; industry: string | null } | null> {
  if (!dbAvailable) return null;

  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('company_name, shutdown_year, slug, industry')
      .eq('published', true)
      .not('shutdown_year', 'is', null)
      .order('shutdown_year', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch {
    return null;
  }
}

export async function getCaseByCompanyName(name: string): Promise<CaseStudy | null> {
  if (!dbAvailable) return null;

  try {
    const sanitized = name.replace(/[^a-zA-Z0-9\s'-]/g, '').trim();
    if (!sanitized) return null;

    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .or(`company_name.ilike.%${sanitized}%,slug.ilike.%${sanitized}%`)
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0] as CaseStudy;
  } catch {
    return null;
  }
}

export async function getTotalFundingByIndustry(): Promise<Array<{ industry: string; totalFunding: number }>> {
  if (!dbAvailable) return [];

  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('industry, funding_raised')
      .eq('published', true)
      .not('industry', 'is', null)
      .not('funding_raised', 'is', null);

    if (error || !data) return [];

    const totals = new Map<string, number>();
    for (const row of data) {
      const ind = row.industry as string;
      totals.set(ind, (totals.get(ind) || 0) + (row.funding_raised as number || 0));
    }

    return Array.from(totals.entries())
      .map(([industry, totalFunding]) => ({ industry, totalFunding }))
      .sort((a, b) => b.totalFunding - a.totalFunding);
  } catch {
    return [];
  }
}

export async function getCaseListForSidebar(): Promise<Array<{
  id: string;
  slug: string;
  case_number: string;
  company_name: string;
  shutdown_year: number | null;
}>> {
  if (!dbAvailable) return [];

  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('id, slug, case_number, company_name, shutdown_year')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

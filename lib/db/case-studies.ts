/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './config';
import { unstable_cache } from 'next/cache';

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
  timeline_events: any[] | null;
  financial_data: any | null;
  marginalia: any[] | null;
  evidence_images: string[] | null;
  audio_briefing_url: string | null;
  metrics: any | null;
  competitors: any[] | null;
  quotes: any[] | null;
  sources: any[] | null;
  financial_rounds: any[] | null;
  failure_analysis: any | null;
  verdict: any | null;
  archived_media: any[] | null;
}

export const getCaseStudy = unstable_cache(
  async (slug: string): Promise<CaseStudy | null> => {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) return null;
    return data as CaseStudy;
  },
  ['case-study'],
  { revalidate: 3600, tags: ['case-studies'] }
);

export const listCaseStudies = unstable_cache(
  async (params: {
    industry?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<CaseStudy[]> => {
    let query = supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (params.industry) {
      query = query.eq('industry', params.industry);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as CaseStudy[];
  },
  ['case-studies-list'],
  { revalidate: 3600, tags: ['case-studies'] }
);

export async function getSimilarCases(id: string, limit = 3): Promise<CaseStudy[]> {
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
}

export const getGlobalStats = unstable_cache(
  async () => {
    const { data, error } = await supabase.rpc('get_archive_stats');

    if (error || !data) {
      return {
        totalCases: 0,
        totalBurned: 0
      };
    }

    return {
      totalCases: data.totalCases,
      totalBurned: data.totalBurned
    };
  },
  ['global-stats'],
  { revalidate: 3600, tags: ['stats'] }
);

export const getInsightsData = unstable_cache(
  async () => {
    const { data, error } = await supabase.rpc('get_archive_stats');

    if (error || !data) {
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

    // Add colors to failure data as in original implementation
    const failureData = (data.failureData || []).map((item: any, i: number) => ({
      ...item,
      color: ['#F59E0B', '#7C3AED', '#EF4444', '#10B981', '#3B82F6', '#475569'][i] || '#475569'
    }));

    return {
      ...data,
      failureData,
      fundingTrends: [], // Trends can stay empty or be added later if needed
    };
  },
  ['insights-data'],
  { revalidate: 3600, tags: ['insights', 'stats'] }
);

export async function searchCaseStudies(embedding: number[], limit = 5) {
  const { data, error } = await supabase.rpc('match_case_studies', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return data as Array<{
    id: string;
    slug: string;
    company_name: string;
    summary: string;
    similarity: number;
  }>;
}

export async function getTopCasesByFunding(limit = 2): Promise<Array<{
  company_name: string;
  funding_raised: number;
  shutdown_year: number | null;
  slug: string;
}>> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('company_name, funding_raised, shutdown_year, slug')
    .eq('published', true)
    .not('funding_raised', 'is', null)
    .order('funding_raised', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function getCaseListForSidebar(): Promise<Array<{
  id: string;
  slug: string;
  case_number: string;
  company_name: string;
  shutdown_year: number | null;
}>> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('id, slug, case_number, company_name, shutdown_year')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

import { supabase } from './config';

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
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) return null;
  return data as CaseStudy;
}

export async function listCaseStudies(params: {
  industry?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<CaseStudy[]> {
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
}

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
    .or(`industry.eq.${current.industry},tags.cs.{${current.tags.join(',')}}`)
    .limit(limit);

  if (error) return [];
  return data as CaseStudy[];
}

export async function getGlobalStats() {
  const { count, error: countError } = await supabase
    .from('case_studies')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  const { data: sumData, error: sumError } = await supabase
    .from('case_studies')
    .select('funding_raised')
    .eq('published', true);

  if (countError || sumError) {
    return {
      totalCases: 0,
      totalBurned: 0
    };
  }

  const totalBurned = (sumData || []).reduce((acc, curr) => acc + (curr.funding_raised || 0), 0);

  return {
    totalCases: count || 0,
    totalBurned
  };
}

export async function getInsightsData() {
  const { data: cases, error } = await supabase
    .from('case_studies')
    .select('failure_reasons, funding_raised, founded_year, shutdown_year')
    .eq('published', true);

  if (error || !cases) {
    return {
      failureData: [],
      fundingTrends: [],
      avgLifespan: 0,
      totalCases: 0,
      totalBurned: 0
    };
  }

  // 1. Failure Reasons
  const reasonsMap: Record<string, number> = {};
  cases.forEach(c => {
    (c.failure_reasons || []).forEach(reason => {
      reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
    });
  });

  const failureData = Object.entries(reasonsMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((item, i) => ({
      ...item,
      color: ['#F59E0B', '#7C3AED', '#EF4444', '#10B981', '#3B82F6', '#475569'][i] || '#475569'
    }));

  // 2. Funding Trends
  const trendsMap: Record<string, number> = {};
  cases.forEach(c => {
    const year = c.shutdown_year?.toString() || 'Unknown';
    if (year !== 'Unknown') {
      trendsMap[year] = (trendsMap[year] || 0) + (c.funding_raised || 0);
    }
  });

  const fundingTrends = Object.entries(trendsMap)
    .map(([year, amount]) => ({ year, amount }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // 3. Metrics
  let totalYears = 0;
  let countWithYears = 0;
  let totalBurned = 0;

  cases.forEach(c => {
    if (c.founded_year && c.shutdown_year) {
      totalYears += (c.shutdown_year - c.founded_year);
      countWithYears++;
    }
    totalBurned += (c.funding_raised || 0);
  });

  return {
    failureData,
    fundingTrends,
    avgLifespan: countWithYears > 0 ? (totalYears / countWithYears).toFixed(1) : 0,
    totalCases: cases.length,
    totalBurned
  };
}

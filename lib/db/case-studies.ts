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
  // In a real implementation, we would use pgvector for semantic similarity.
  // For now, we'll fetch cases by shared industry or tags as a fallback.
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

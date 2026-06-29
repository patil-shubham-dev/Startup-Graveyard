import { listCaseStudies } from '@/lib/db/case-studies';
import { supabase, isSupabaseConfigured } from '@/lib/db/config';
import { ExploreClient } from './ExploreClient';

export const revalidate = 3600;

async function getFilterOptions(): Promise<{ industries: string[]; failTypes: string[]; countries: string[] }> {
  if (!isSupabaseConfigured) {
    return {
      industries: ['Fintech', 'SaaS', 'Hardware', 'Healthtech', 'E-commerce', 'Social', 'Logistics'],
      failTypes: ['No Market Need', 'Cash Exhaustion', 'Team Fracture', 'Competition', 'Pricing Failure', 'Regulatory'],
      countries: ['US', 'UK', 'Canada', 'Germany', 'France', 'India', 'China', 'Australia'],
    };
  }

  try {
    const [industryResult, failTypeResult, countryResult] = await Promise.all([
      supabase.from('case_studies').select('industry').eq('published', true).not('industry', 'is', null),
      supabase.from('case_studies').select('failure_reasons').eq('published', true),
      supabase.from('case_studies').select('country').eq('published', true).not('country', 'is', null),
    ]);

    const industries = [...new Set((industryResult.data || []).map((r: { industry: string }) => r.industry).filter(Boolean))] as string[];
    const failTypes = [...new Set(
      (failTypeResult.data || []).flatMap((r: { failure_reasons: string[] }) => r.failure_reasons || [])
    )] as string[];
    const countries = [...new Set((countryResult.data || []).map((r: { country: string }) => r.country).filter(Boolean))] as string[];

    return {
      industries: industries.length > 0 ? industries.sort() : ['Fintech', 'SaaS', 'Hardware', 'Healthtech', 'E-commerce', 'Social', 'Logistics'],
      failTypes: failTypes.length > 0 ? failTypes.sort() : ['No Market Need', 'Cash Exhaustion', 'Team Fracture', 'Competition', 'Pricing Failure', 'Regulatory'],
      countries: countries.length > 0 ? countries.sort() : ['US', 'UK', 'Canada', 'Germany', 'France', 'India', 'China', 'Australia'],
    };
  } catch {
    return {
      industries: ['Fintech', 'SaaS', 'Hardware', 'Healthtech', 'E-commerce', 'Social', 'Logistics'],
      failTypes: ['No Market Need', 'Cash Exhaustion', 'Team Fracture', 'Competition', 'Pricing Failure', 'Regulatory'],
      countries: ['US', 'UK', 'Canada', 'Germany', 'France', 'India', 'China', 'Australia'],
    };
  }
}

export default async function ExplorePage() {
  const [initialCases, filterOptions] = await Promise.all([
    listCaseStudies(),
    getFilterOptions(),
  ]);

  return (
    <ExploreClient
      initialCases={initialCases}
      industries={filterOptions.industries}
      failTypes={filterOptions.failTypes}
      countries={filterOptions.countries}
    />
  );
}

import { MetadataRoute } from 'next';
import { supabase, isSupabaseConfigured } from '@/lib/db/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://startupgraveyard.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/pre-mortem`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/ask`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic case study pages
  let caseStudyPages: MetadataRoute.Sitemap = [];

  if (isSupabaseConfigured) {
    try {
      const { data: cases } = await supabase
        .from('case_studies')
        .select('slug, published_at')
        .eq('published', true);

      if (cases && cases.length > 0) {
        caseStudyPages = cases.map((c) => ({
          url: `${baseUrl}/case/${c.slug}`,
          lastModified: new Date(c.published_at || Date.now()),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }));
      }
    } catch {
      // If database query fails, return static pages only
    }
  }

  return [...staticPages, ...caseStudyPages];
}

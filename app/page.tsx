import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { TaxonomyGrid } from '@/components/home/TaxonomyGrid';
import { PreMortemCTA } from '@/components/home/PreMortemCTA';
import { getGlobalStats, getInsightsData, getTopCasesByFunding, listCaseStudies } from '@/lib/db/case-studies';

const FeaturedCases = dynamic(() => import('@/components/home/FeaturedCases').then(mod => mod.FeaturedCases), {
  ssr: true, // Keep SSR for SEO but allow splitting
});

const InsightsPreview = dynamic(() => import('@/components/home/InsightsPreview').then(mod => mod.InsightsPreview), {
  loading: () => <div className="skeleton-cream" style={{ height: '400px', width: '100%' }} />
});

export const revalidate = 3600;

export default async function Home() {
  const [stats, insights, liveCases, featuredCases] = await Promise.all([
    getGlobalStats(),
    getInsightsData(),
    getTopCasesByFunding(2),
    listCaseStudies({ limit: 3 }),
  ]);

  return (
    <main>
      {/* 1. Hero — Split screen */}
      <HeroSection
        stats={{
          totalCases: stats.totalCases,
          totalBurned: stats.totalBurned,
          avgLifespan: String(insights.avgLifespan),
          patternCount: insights.patternCount,
          totalLessons: insights.totalLessons,
        }}
        liveCases={liveCases}
      />

      {/* 2. Stats bar — count-up animation */}
      <StatsBar
        totalCases={stats.totalCases}
        totalBurned={stats.totalBurned}
        avgLifespan={insights.avgLifespan}
        patternCount={insights.patternCount}
      />

      {/* 3. Featured cases archive */}
      <FeaturedCases initialCases={featuredCases} />

      {/* 4. Failure pattern taxonomy */}
      <TaxonomyGrid failureData={insights.failureData} />

      {/* 5. Insights preview — charts + liquidations */}
      <InsightsPreview
        failureData={insights.failureData}
        topLiquidations={insights.topLiquidations}
      />

      {/* 6. Pre-mortem CTA — only dark section */}
      <PreMortemCTA />
    </main>
  );
}

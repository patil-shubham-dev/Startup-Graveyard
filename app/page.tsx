export const dynamic = 'force-dynamic';

import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { FeaturedCases } from '@/components/home/FeaturedCases';
import { TaxonomyGrid } from '@/components/home/TaxonomyGrid';
import { InsightsPreview } from '@/components/home/InsightsPreview';
import { PreMortemCTA } from '@/components/home/PreMortemCTA';
import { getGlobalStats, getInsightsData, getTopCasesByFunding } from '@/lib/db/case-studies';

export default async function Home() {
  const [stats, insights, liveCases] = await Promise.all([
    getGlobalStats(),
    getInsightsData(),
    getTopCasesByFunding(2),
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
      <FeaturedCases />

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

import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCases } from '@/components/home/FeaturedCases';
import { TaxonomyGrid } from '@/components/home/TaxonomyGrid';
import { PreMortemCTA } from '@/components/home/PreMortemCTA';
import { MarketIntelligence } from '@/components/home/MarketIntelligence';
import { getGlobalStats, getInsightsData } from '@/lib/db/case-studies';

export default async function Home() {
  const stats = await getGlobalStats();
  const insights = await getInsightsData();

  return (
    <main className="flex flex-col h-full overflow-y-auto snap-y snap-mandatory scrollbar-thin">
      {/* Section 1: Hero (55/45 Split) */}
      <div className="snap-start min-h-[calc(100vh-88px)] flex flex-col justify-center">
        <HeroSection stats={stats} />
      </div>
      
      {/* Section 2: Featured Cases */}
      <div className="snap-start min-h-[calc(100vh-88px)] flex flex-col justify-center bg-bg-base border-t border-border-subtle">
        <FeaturedCases />
      </div>

      {/* Section 3: Taxonomy Grid */}
      <div className="snap-start min-h-[calc(100vh-88px)] flex flex-col justify-center bg-bg-base border-t border-border-subtle">
        <TaxonomyGrid failureData={insights.failureData} />
      </div>
      
      {/* Section 4: Market Intelligence */}
      <div className="snap-start min-h-[calc(100vh-88px)] flex flex-col justify-center bg-bg-base border-t border-border-subtle">
        <MarketIntelligence />
      </div>

      {/* Section 5: Pre-Mortem CTA */}
      <div className="snap-start min-h-[calc(100vh-88px)] flex flex-col justify-center bg-bg-base border-t border-border-subtle pb-10">
        <PreMortemCTA />
      </div>
    </main>
  );
}

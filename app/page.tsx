import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { FeaturedCases } from '@/components/home/FeaturedCases';
import { TaxonomyGrid } from '@/components/home/TaxonomyGrid';
import { PreMortemCTA } from '@/components/home/PreMortemCTA';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <StatsBar />
      <FeaturedCases />
      <TaxonomyGrid />
      
      {/* Quick Insights Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-surface/50 border border-border p-8 rounded-sm">
          <h3 className="font-display text-2xl font-bold mb-6">Failure Distribution</h3>
          <div className="h-64 flex items-center justify-center text-text-dim border border-dashed border-border/50">
            {/* Placeholder for Recharts Donut */}
            <p className="font-mono text-xs uppercase tracking-widest">Charts initializing...</p>
          </div>
        </div>
        <div className="bg-surface/50 border border-border p-8 rounded-sm">
          <h3 className="font-display text-2xl font-bold mb-6">Most Expensive Failures</h3>
          <div className="space-y-4">
            {[
              { name: 'Quibi', amount: '$1.75B', reason: 'Product-Market Fit' },
              { name: 'Theranos', amount: '$945M', reason: 'Fraud' },
              { name: 'Better Place', amount: '$850M', reason: 'Timing' },
              { name: 'Katerra', amount: '$800M', reason: 'Execution' },
              { name: 'Jawbone', amount: '$590M', reason: 'Competition' },
            ].map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-text-dim text-xs">0{i+1}</span>
                  <span className="font-bold">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-amber-500 text-sm font-bold">{item.amount}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider">{item.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PreMortemCTA />
    </main>
  );
}

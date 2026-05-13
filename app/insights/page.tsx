import { InsightsCharts } from '@/components/insights/InsightsCharts';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { StatBlock } from '@/components/ui/StatBlock';
import { getInsightsData } from '@/lib/db/case-studies';

export const revalidate = 86400; // Revalidate every day

export default async function InsightsPage() {
  const data = await getInsightsData();

  const formattedBurned = data.totalBurned >= 1000 
    ? `$${(data.totalBurned / 1000).toFixed(1)}B` 
    : `$${data.totalBurned}M`;

  return (
    <main className="pt-12 px-6 max-w-[1400px] mx-auto h-full overflow-y-auto scrollbar-thin">
      <header className="mb-8 py-6 border-b border-border-subtle">
        <div className="flex items-center gap-4 mb-2">
          <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase">SYSTEMIC_ANALYSIS // V.02</span>
          <div className="w-[1px] h-3 bg-border-subtle" />
          <span className="font-mono text-[10px] text-text-muted">FILES_ANALYZED: {data.totalCases.toLocaleString()}</span>
        </div>
        <h1 className="section-header">Failure Insights</h1>
      </header>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 py-4 border-b border-border-subtle">
        <StatBlock label="LIQUIDATIONS" value={data.totalCases.toLocaleString()} />
        <StatBlock label="CAPITAL_BURNED" value={formattedBurned} />
        <StatBlock label="AVG_LIFESPAN" value={`${data.avgLifespan} YRS`} />
        <StatBlock label="SURVIVAL_P5" value="8.2%" />
      </div>

      <InsightsCharts failureData={data.failureData} fundingTrends={data.fundingTrends} />

      {/* Heuristics Section */}
      <section className="mt-12 mb-20">
        <div className="mb-6">
          <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase block mb-1">SURVIVAL_HEURISTICS</span>
          <h2 className="section-header">Forensic Patterns</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'The "Blitzscaling" Trap',
              desc: 'Series B within 12 months of Series A increases failure risk 4x.',
              stat: '42% Higher Risk',
              code: 'VEC-882'
            },
            {
              title: 'Solo Founder Fragility',
              desc: 'Solo ventures are 30% more likely to cite "Burnout" as a root cause.',
              stat: '31% More Burnout',
              code: 'VEC-914'
            },
            {
              title: 'The Pivot Deadline',
              desc: 'More than 3 pivots without $1M ARR predicts failure by year 4.',
              stat: 'Avg. 3.2 Pivots',
              code: 'VEC-441'
            }
          ].map((insight) => (
            <div key={insight.title} className="bg-bg-surface p-6 border border-border-subtle rounded-[2px] relative group transition-colors hover:border-violet-500/30">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-text-muted text-[9px] tracking-widest uppercase">{insight.code}</span>
                <div className="w-1.5 h-1.5 bg-violet-600/20 rounded-full group-hover:bg-violet-600 transition-colors" />
              </div>
              <h4 className="font-header text-[14px] font-bold mb-2 text-text-primary italic">{insight.title}</h4>
              <p className="text-text-muted text-[11px] leading-relaxed mb-4">{insight.desc}</p>
              <div className="pt-3 border-t border-border-subtle font-mono text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                {insight.stat}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

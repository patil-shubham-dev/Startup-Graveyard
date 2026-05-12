import { InsightsCharts } from '@/components/insights/InsightsCharts';

export const revalidate = 86400; // Revalidate every day

export default function InsightsPage() {
  const failureData = [
    { name: 'Product-Market Fit', value: 38, color: '#7C3AED' },
    { name: 'Burn Rate', value: 24, color: '#F59E0B' },
    { name: 'Team Conflict', value: 15, color: '#EF4444' },
    { name: 'Competition', value: 12, color: '#10B981' },
    { name: 'Regulatory', value: 6, color: '#3B82F6' },
    { name: 'Other', value: 5, color: '#64748B' },
  ];

  const fundingTrends = [
    { year: '2018', amount: 12.4 },
    { year: '2019', amount: 15.8 },
    { year: '2020', amount: 8.2 },
    { year: '2021', amount: 24.5 },
    { year: '2022', amount: 18.9 },
    { year: '2023', amount: 32.1 },
  ];

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="font-display text-5xl font-bold mb-4">Failure Insights</h1>
        <p className="text-text-muted max-w-2xl">
          Aggregated data from 1,024 startup autopsies. Identifying the systemic 
          risks that plague the ecosystem.
        </p>
      </header>

      <InsightsCharts failureData={failureData} fundingTrends={fundingTrends} />

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: 'The "Blitzscaling" Trap',
            desc: 'Startups that raised Series B within 12 months of Series A have a 4x higher failure rate due to premature scaling.',
            stat: '42% Higher Risk'
          },
          {
            title: 'Solo Founder Fragility',
            desc: 'Solo-founded ventures in the graveyard are 30% more likely to cite "Burnout" as a root cause compared to teams.',
            stat: '31% More Burnout'
          },
          {
            title: 'The Pivot Deadline',
            desc: 'Companies that pivot more than 3 times without achieving $1M ARR rarely survive the 4th year.',
            stat: 'Avg. 3.2 Pivots'
          }
        ].map((insight) => (
          <div key={insight.title} className="forensic-card p-8">
            <span className="font-mono text-amber-500 text-[10px] tracking-widest uppercase mb-4 block">SURVIVAL HEURISTIC</span>
            <h4 className="text-2xl font-bold mb-4">{insight.title}</h4>
            <p className="text-text-muted text-sm leading-relaxed mb-6">{insight.desc}</p>
            <div className="pt-4 border-t border-border/50 font-mono text-xs font-bold text-primary">
              {insight.stat}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

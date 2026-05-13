'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface InsightsChartsProps {
  failureData: any[];
  fundingTrends: any[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-surface p-3 border border-violet-500/30 rounded-[1px] shadow-2xl">
        <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-1">
          {payload[0].name || 'DATA_POINT'}
        </p>
        <p className="font-mono text-[12px] text-violet-500 font-bold">
          {payload[0].value}{payload[0].unit || ''}
        </p>
      </div>
    );
  }
  return null;
};

export function InsightsCharts({ failureData, fundingTrends }: InsightsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-10">
      {/* Primary Cause Distribution */}
      <div className="bg-bg-surface p-6 border border-border-subtle rounded-[2px] relative overflow-hidden">
        <h3 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-6">PRIMARY_CAUSE_DISTRIBUTION</h3>
        <div className="h-48 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={failureData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {failureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-border-subtle">
          {failureData.map((item) => (
            <div key={item.name} className="flex items-center gap-3 group">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">{item.name}</span>
                <span className="text-[11px] text-text-primary font-mono font-bold">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capital Burn Trend */}
      <div className="bg-bg-surface p-6 border border-border-subtle rounded-[2px] relative overflow-hidden">
        <h3 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-6">CAPITAL_LOST_PER_YEAR_($B)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundingTrends} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="year" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                fontFamily="var(--font-mono)" 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                fontFamily="var(--font-mono)" 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip unit="B" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar 
                dataKey="amount" 
                fill="#7C3AED" 
                radius={[1, 1, 0, 0]} 
                fillOpacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

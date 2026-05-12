'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface InsightsChartsProps {
  failureData: any[];
  fundingTrends: any[];
}

export function InsightsCharts({ failureData, fundingTrends }: InsightsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-24">
      {/* Primary Cause Distribution */}
      <div className="bg-bg-surface-1 border border-border-subtle p-10 rounded-lg">
        <h3 className="font-mono text-[10px] text-amber-signal tracking-[3px] uppercase mb-10">PRIMARY CAUSE DISTRIBUTION</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={failureData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationDuration={800}
              >
                {failureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111118', border: '1px solid #1F1F2E', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                itemStyle={{ color: '#F1F5F9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4">
          {failureData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-text-secondary font-mono uppercase tracking-tighter">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capital Burn Trend */}
      <div className="bg-bg-surface-1 border border-border-subtle p-10 rounded-lg">
        <h3 className="font-mono text-[10px] text-amber-signal tracking-[3px] uppercase mb-10">CAPITAL LOST PER YEAR ($B)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundingTrends}>
              <XAxis 
                dataKey="year" 
                stroke="#475569" 
                fontSize={10} 
                fontFamily="var(--font-mono)" 
                axisLine={{ stroke: '#1F1F2E' }}
                tickLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                fontFamily="var(--font-mono)" 
                axisLine={{ stroke: '#1F1F2E' }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111118', border: '1px solid #1F1F2E', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#7C3AED" 
                radius={[4, 4, 0, 0]} 
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

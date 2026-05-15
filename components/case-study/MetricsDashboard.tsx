import { cn } from '@/lib/utils/index';
import { TrendingDown, Users, DollarSign, Calendar, Target, Activity } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  icon?: any;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export const MetricsDashboard = ({ metrics }: { metrics: any }) => {
  if (!metrics) return null;

  const data: Metric[] = [
    { 
      label: 'Capital Raised', 
      value: metrics.capital_raised || 'N/A', 
      icon: DollarSign,
      description: 'Total venture funding secured'
    },
    { 
      label: 'Peak Valuation', 
      value: metrics.peak_valuation || 'N/A', 
      icon: Target,
      description: 'Highest estimated market value'
    },
    { 
      label: 'Years Active', 
      value: metrics.years_active || 'N/A', 
      icon: Calendar,
      description: 'Founding to shutdown duration'
    },
    { 
      label: 'Peak Employees', 
      value: metrics.peak_employees || 'N/A', 
      icon: Users,
      description: 'Max headcount at growth stage'
    },
    { 
      label: 'Estimated Burn', 
      value: metrics.burn_rate || 'N/A', 
      icon: Activity,
      description: 'Monthly operational expenses'
    },
    { 
      label: 'Exit Value', 
      value: metrics.exit_value || 'N/A', 
      icon: TrendingDown,
      description: 'Final liquidation or acquisition price'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-cream-dark/30 border border-cream-dark/50 rounded-sm overflow-hidden">
      {data.map((metric, i) => (
        <div key={i} className="bg-paper-white p-6 md:p-8 flex flex-col gap-4 relative group hover:bg-cream-base/20 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-cream-deep/50 flex items-center justify-center text-ink-muted group-hover:text-rust-accent transition-colors">
              {metric.icon && <metric.icon size={16} />}
            </div>
            <span className="t-label-sm opacity-50">FIG. 0{i+1}</span>
          </div>
          
          <div>
            <span className="t-label text-[10px] block mb-1">{metric.label}</span>
            <span className="t-h3 block text-ink-black tabular-nums">{metric.value}</span>
          </div>

          <p className="t-body-sm text-[12px] opacity-60 leading-tight">
            {metric.description}
          </p>
          
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cream-dark/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      ))}
    </div>
  );
};

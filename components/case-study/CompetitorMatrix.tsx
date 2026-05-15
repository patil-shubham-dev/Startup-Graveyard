import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/index';

interface Competitor {
  name: string;
  status: 'active' | 'closed' | 'acquired';
  moat: string;
  advantage_over_failed: string;
}

export const CompetitorMatrix = ({ competitors, companyName }: { competitors: Competitor[], companyName: string }) => {
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-cream-dark/50 rounded-sm">
      <table className="w-full border-collapse text-left bg-paper-white">
        <thead>
          <tr className="bg-cream-deep/30 border-b border-cream-dark/50">
            <th className="p-6 t-label text-ink-black min-w-[200px]">Entity</th>
            <th className="p-6 t-label text-ink-black text-center">Market Status</th>
            <th className="p-6 t-label text-ink-black">Defensibility (Moat)</th>
            <th className="p-6 t-label text-ink-black">Strategic Edge vs. {companyName}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-dark/20">
          {competitors.map((comp, i) => (
            <tr key={i} className="hover:bg-cream-base/10 transition-colors group">
              <td className="p-6">
                <span className="t-h3 text-lg block">{comp.name}</span>
              </td>
              <td className="p-6 text-center">
                <span className={cn(
                  "t-label-sm px-3 py-1 rounded-full inline-block",
                  comp.status === 'active' ? "bg-sage-neutral/10 text-sage-neutral" : 
                  comp.status === 'acquired' ? "bg-ochre-signal/10 text-ochre-signal" :
                  "bg-failed-red/10 text-failed-red"
                )}>
                  {comp.status}
                </span>
              </td>
              <td className="p-6 t-body-sm text-ink-muted">
                {comp.moat}
              </td>
              <td className="p-6 t-body-sm text-ink-soft italic">
                "{comp.advantage_over_failed}"
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

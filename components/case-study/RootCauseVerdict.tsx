'use client';
import { motion } from 'framer-motion';
import { ShieldAlert, Fingerprint, AlertCircle } from 'lucide-react';

export const RootCauseVerdict = ({ verdict, companyName }: { verdict: any, companyName: string }) => {
  if (!verdict) return null;

  const { top_reasons = [], final_word = "" } = verdict;

  return (
    <div className="relative mt-32 mb-32">
      <div className="absolute inset-0 bg-ink-black -rotate-1 transform translate-x-1 translate-y-1 opacity-10" />
      <div className="relative bg-paper-white border-[3px] border-ink-black p-12 md:p-20 paper-dossier">
        <div className="absolute top-8 right-8 text-failed-red opacity-20 transform rotate-12">
          <Fingerprint size={120} />
        </div>
        
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-[1px] bg-failed-red" />
            <h2 className="t-label text-failed-red font-bold">Final Verdict: Forensic Conclusion</h2>
          </div>

          <h3 className="t-hero text-4xl md:text-5xl mb-12">
            Why {companyName} <span className="italic">actually</span> failed.
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {top_reasons.map((reason: any, i: number) => (
              <div key={i} className="flex gap-6">
                <span className="t-hero text-4xl text-cream-dark opacity-40">0{i+1}</span>
                <div>
                  <h4 className="t-h3 text-xl mb-2">{reason.title}</h4>
                  <p className="t-body-sm text-ink-muted leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cream-base/30 border-l-4 border-ink-black p-8 relative overflow-hidden">
            <div className="absolute top-2 right-4 t-label-sm opacity-20">Summary_Memo</div>
            <p className="t-pullquote text-2xl md:text-3xl text-ink-soft leading-tight">
              "{final_word}"
            </p>
          </div>
        </div>

        {/* Forensic Stamp Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.5, rotate: -20 }}
          whileInView={{ opacity: 0.8, scale: 1, rotate: -15 }}
          viewport={{ once: true }}
          className="absolute bottom-12 right-12 border-4 border-failed-red text-failed-red px-8 py-4 t-hero text-4xl opacity-80 pointer-events-none"
        >
          CASE_CLOSED
        </motion.div>
      </div>
    </div>
  );
};

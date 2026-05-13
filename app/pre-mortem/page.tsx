'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiskGauge } from '@/components/pre-mortem/RiskGauge';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { ScanButton } from '@/components/ui/ScanButton';
import { StatBlock } from '@/components/ui/StatBlock';

type Step = 'PITCH' | 'QUESTIONS' | 'ANALYSIS' | 'REPORT';

export default function PreMortemPage() {
  const [step, setStep] = useState<Step>('PITCH');
  const [pitch, setPitch] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 'PITCH', label: 'THE_PITCH' },
    { id: 'QUESTIONS', label: 'INTERROGATION' },
    { id: 'ANALYSIS', label: 'AUTOPSY' },
    { id: 'REPORT', label: 'VERDICT' }
  ];

  const handleStartInterrogation = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/pre-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_QUESTIONS', pitch }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setStep('QUESTIONS');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalize = async () => {
    setStep('ANALYSIS');
    try {
      const res = await fetch('/api/pre-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_REPORT', pitch, answers }),
      });
      const data = await res.json();
      setReport(data);
      setStep('REPORT');
    } catch (error) {
      console.error(error);
      setStep('QUESTIONS');
    }
  };

  return (
    <main className="pt-12 px-6 max-w-[640px] mx-auto h-full overflow-y-auto scrollbar-thin relative">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-12 py-6 border-b border-border-subtle">
        {steps.map((s, i) => {
          const currentIndex = steps.findIndex(st => st.id === step);
          const isActive = s.id === step;
          const isCompleted = i < currentIndex;
          
          return (
            <div key={s.id} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-[1px] transition-colors duration-500 ${
                isActive ? 'bg-violet-600' : isCompleted ? 'bg-violet-600/40' : 'bg-bg-surface border border-border-subtle'
              }`} />
              {isActive && (
                <span className="font-mono text-[9px] text-violet-500 tracking-widest ml-1">{s.label}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 pb-20">
        <AnimatePresence mode="wait">
          {step === 'PITCH' && (
            <motion.div 
              key="pitch" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase block mb-2">FORENSIC_ENGINE // V.4.2</span>
                <h1 className="font-header text-[32px] font-bold leading-tight">AI PRE-MORTEM</h1>
                <p className="text-text-muted text-[13px] mt-4 italic">"Most startups commit suicide. We help you identify the weapon before you use it."</p>
              </div>

              <div className="bg-bg-surface p-6 border border-border-subtle relative rounded-[2px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">PROJECT_DOSSIER_INPUT</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-600 animate-pulse rounded-full" />
                    <span className="font-mono text-[8px] text-violet-500 uppercase">AWAITING_DATA</span>
                  </div>
                </div>

                <textarea 
                  className="w-full bg-bg-base border border-border-subtle p-6 text-[14px] min-h-[200px] focus:outline-none focus:border-violet-600/30 transition-all resize-none text-text-primary rounded-[1px] leading-relaxed"
                  placeholder="Describe your venture's core value, target market, and execution strategy..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
                
                <button 
                  onClick={handleStartInterrogation}
                  disabled={pitch.length < 20 || isGenerating}
                  className="w-full py-4 mt-6 bg-text-primary text-bg-base font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-colors disabled:opacity-20"
                >
                  {isGenerating ? 'ANALYZING...' : 'INITIATE_INTERROGATION'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'QUESTIONS' && (
            <motion.div 
              key="questions" 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }} 
              className="space-y-12"
            >
              <div className="space-y-10">
                {questions.map((q, i) => (
                  <div key={q.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-violet-500 text-[10px]">VEC_0{i + 1}</span>
                      <div className="h-[1px] flex-1 bg-border-subtle" />
                    </div>
                    
                    <h3 className="font-header text-[20px] font-bold text-text-primary leading-tight">
                      {q.text}
                    </h3>
                    
                    <textarea 
                      className="w-full bg-bg-surface border border-border-subtle p-4 focus:outline-none focus:border-violet-600/30 transition-all min-h-[100px] text-[13px] text-text-primary rounded-[1px] leading-relaxed"
                      placeholder="Input forensic detail..."
                      onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={handleFinalize} 
                className="w-full py-5 bg-violet-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-violet-700 transition-colors mt-8"
              >
                EXECUTE_FINAL_AUTOPSY
              </button>
            </motion.div>
          )}

          {step === 'ANALYSIS' && (
            <motion.div 
              key="analysis" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-24 space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full border border-violet-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-violet-500/5 animate-pulse rounded-full" />
                  <span className="text-xl">☠</span>
                </div>
                <div className="absolute -inset-2 border border-dashed border-violet-500/10 rounded-full animate-spin-slow" />
              </div>
              
              <div className="space-y-4">
                <h2 className="font-header text-[24px] font-bold text-text-primary italic">Compiling Verdict</h2>
                <div className="font-mono text-[9px] text-text-muted space-y-2 uppercase tracking-widest">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-ping" />
                    SCANNING_VECTORS
                  </div>
                  <p className="opacity-50">MAPPING_RISK_COEFFICIENTS</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'REPORT' && report && (
            <motion.div 
              key="report" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-10"
            >
              <div className="bg-bg-surface p-8 border border-border-subtle border-l-4 border-l-violet-600 relative rounded-[2px]">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase">VERDICT_REPORT // CONFIDENTIAL</span>
                  <span className="font-mono text-[9px] text-text-muted opacity-40">#PRM-{Math.floor(Math.random()*9000)+1000}</span>
                </div>
                
                <h2 className="font-header text-[32px] font-bold mb-8">Forensic Verdict</h2>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border-subtle">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">RISK_SCORE</span>
                    <div className="text-xl font-bold text-red-500">{report.risk_score}%</div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">PROBABILITY</span>
                    <div className="text-xl font-bold text-violet-500 uppercase">HIGH</div>
                  </div>
                  <div className="space-y-1">
                    <div className="mt-4"><RiskGauge score={report.risk_score} /></div>
                  </div>
                </div>
              </div>

              <div className="bg-bg-surface p-8 border border-border-subtle relative rounded-[2px]">
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-4 block">EXECUTIVE_SUMMARY</span>
                <p className="text-[18px] text-text-primary font-serif italic leading-relaxed">
                  "{report.verdict}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {report.primary_risks.map((risk: any, i: number) => (
                  <div key={i} className="bg-bg-surface p-6 border border-border-subtle border-l-2 border-l-violet-600 rounded-[2px]">
                    <span className="font-mono text-violet-500 uppercase text-[9px] tracking-widest mb-2 block">VECTOR_0{i+1} // {risk.category}</span>
                    <h3 className="font-header font-bold text-text-primary mb-4 text-[16px] italic">{risk.description}</h3>
                    <div className="pt-4 border-t border-border-subtle">
                      <span className="font-mono text-[8px] text-text-muted block mb-2 uppercase tracking-widest">MITIGATION</span>
                      <p className="text-[12px] text-text-muted leading-relaxed">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 pt-10">
                <button 
                  onClick={() => setStep('PITCH')}
                  className="px-8 py-3 bg-text-primary text-bg-base font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-colors"
                >
                  NEW_SCAN
                </button>
                <button className="px-8 py-3 border border-border-subtle font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors">
                  EXPORT_PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

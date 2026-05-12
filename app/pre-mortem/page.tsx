'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiskGauge } from '@/components/pre-mortem/RiskGauge';

type Step = 'PITCH' | 'QUESTIONS' | 'ANALYSIS' | 'REPORT';

export default function PreMortemPage() {
  const [step, setStep] = useState<Step>('PITCH');
  const [pitch, setPitch] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 'PITCH', label: 'THE PITCH' },
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
    <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-20">
        {steps.map((s, i) => {
          const currentIndex = steps.findIndex(st => st.id === step);
          const isActive = s.id === step;
          const isCompleted = i < currentIndex;
          
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: isActive ? '#7C3AED' : isCompleted ? '#10B98122' : 'transparent',
                    borderColor: isActive ? '#7C3AED' : isCompleted ? '#10B981' : '#1F1F2E',
                    color: isActive ? '#FFFFFF' : isCompleted ? '#10B981' : '#475569'
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all duration-500`}
                >
                  {isCompleted ? '✓' : i + 1}
                </motion.div>
                <span className={`mt-2 text-[10px] font-mono tracking-[3px] uppercase transition-colors duration-500 ${
                  isActive ? 'text-text-primary' : 'text-text-muted'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-12 h-[1px] bg-border-subtle mb-6" />
              )}
            </div>
          );
        })}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {step === 'PITCH' && (
            <motion.div 
              key="pitch" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-8"
            >
              <div className="text-center mb-16">
                <h1 className="font-display text-5xl font-bold mb-6 text-text-primary">AI Pre-Mortem Engine</h1>
                <p className="text-text-secondary text-lg max-w-xl mx-auto leading-relaxed">
                  Stress-test your startup idea against historical failure patterns. 
                  Get a forensic risk report in seconds.
                </p>
              </div>

              <div className="bg-bg-surface-1 border border-border-subtle p-10 rounded-xl shadow-2xl relative overflow-hidden group">
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-violet-primary/20 animate-scan pointer-events-none" />
                
                <label className="font-mono text-[11px] text-amber-signal uppercase tracking-[4px] block mb-6">
                  DESCRIBE THE VENTURE IN DETAIL
                </label>
                <textarea 
                  className="w-full bg-bg-surface-2 border border-border-subtle p-8 text-lg min-h-[280px] focus:outline-none focus:border-violet-primary transition-all resize-none text-text-primary placeholder:text-text-muted rounded-lg shadow-inner"
                  placeholder="What are you building? Who is it for? How does it survive the valley of death?"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
                <button 
                  onClick={handleStartInterrogation}
                  disabled={pitch.length < 20 || isGenerating}
                  className="w-full mt-10 py-5 bg-violet-primary hover:bg-violet-hover active:bg-violet-dim text-white font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-3 rounded-lg shadow-violet-glow uppercase tracking-widest text-sm"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      PREPARING STRESS TEST...
                    </>
                  ) : (
                    'INITIATE INTERROGATION →'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'QUESTIONS' && (
            <motion.div 
              key="questions" 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.02 }} 
              className="space-y-12 max-w-[680px] mx-auto"
            >
              <div className="space-y-16">
                {questions.map((q, i) => (
                  <div key={q.id} className="relative group">
                    <span className="font-mono text-[11px] text-text-muted uppercase tracking-[3px] block mb-4 group-hover:text-amber-signal transition-colors">
                      INTERROGATION POINT {i + 1}
                    </span>
                    <h3 className="font-display text-3xl text-text-primary mb-8 leading-tight">
                      {q.text}
                    </h3>
                    <textarea 
                      className="w-full bg-bg-surface-1 border border-border-subtle p-6 focus:outline-none focus:border-violet-primary transition-all min-h-[140px] text-lg text-text-primary placeholder:text-text-muted rounded-xl shadow-lg"
                      placeholder="Be precise. The Graveyard Keeper values truth over optimism."
                      onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={handleFinalize} 
                className="w-full py-5 bg-violet-primary hover:bg-violet-hover active:bg-violet-dim text-white font-bold transition-all rounded-lg shadow-violet-glow uppercase tracking-[4px] text-sm mt-12"
              >
                EXECUTE FINAL AUTOPSY →
              </button>
            </motion.div>
          )}

          {step === 'ANALYSIS' && (
            <motion.div 
              key="analysis" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-32 space-y-12"
            >
              <div className="relative inline-block">
                <div className="p-10 rounded-full bg-violet-primary/5 border border-violet-primary/20 relative z-10">
                  <svg className="w-16 h-16 text-violet-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 6.247a11 11 0 001.09 17.132l.02.011a12 12 0 0015.78 0l.02-.011a11 11 0 001.09-17.132l-.618-.118z" />
                  </svg>
                </div>
                {/* Rotating scanner ring */}
                <div className="absolute inset-0 border-2 border-dashed border-violet-primary/30 rounded-full animate-spin-slow" />
              </div>
              
              <div className="space-y-6">
                <h2 className="font-display text-4xl font-bold text-text-primary tracking-tight">Compiling Verdict...</h2>
                <div className="font-mono text-[11px] text-text-muted space-y-3 uppercase tracking-[4px]">
                  <p className="animate-pulse">SCANNING HISTORICAL VECTORS</p>
                  <p className="opacity-70">MATCHING PMF PATTERNS</p>
                  <p className="opacity-40">MAPPING CAPITAL DECAY</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'REPORT' && report && (
            <motion.div 
              key="report" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-12"
            >
              {/* Professional Report Header */}
              <div className="bg-bg-surface-1 border border-border-subtle p-10 rounded-xl flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-signal rounded-l-xl" />
                <div className="text-center md:text-left">
                  <span className="font-mono text-amber-signal tracking-[5px] text-[10px] uppercase block mb-4">FORENSIC INTELLIGENCE DOSSIER</span>
                  <h2 className="font-display text-5xl font-bold text-text-primary mb-4 tracking-tight">Autopsy Report</h2>
                  <div className="font-mono text-[12px] text-text-muted flex items-center justify-center md:justify-start gap-4">
                    <span>ID: PM-{Math.floor(Math.random()*9000)+1000}</span>
                    <span className="w-1 h-1 bg-border-strong rounded-full" />
                    <span>ISSUED: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 border border-border-subtle hover:bg-bg-surface-2 rounded-lg text-text-secondary flex items-center gap-2 transition-all group font-mono text-[10px] uppercase tracking-widest">
                    <svg className="w-4 h-4 group-hover:text-violet-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 110-2.684 3 3 0 010 2.684z" /></svg>
                    Share
                  </button>
                  <button className="px-6 py-3 bg-bg-surface-2 border border-border-subtle hover:border-violet-primary rounded-lg text-text-primary flex items-center gap-2 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Archive
                  </button>
                </div>
              </div>

              {/* Main Metric Section */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                <div className="bg-bg-surface-1 border border-border-subtle p-10 rounded-xl shadow-xl flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-[4px] mb-8">EXECUTIVE SUMMARY</span>
                  <p className="text-2xl text-text-primary font-body italic leading-relaxed">
                    "{report.verdict}"
                  </p>
                </div>
                <div className="bg-bg-surface-1 border border-border-subtle p-8 rounded-xl shadow-xl flex items-center justify-center">
                  <RiskGauge score={report.risk_score} />
                </div>
              </div>

              {/* Risk Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {report.primary_risks.map((risk: any, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-bg-surface-1 border border-border-subtle p-8 rounded-xl border-l-[4px] border-l-amber-signal shadow-lg group hover:bg-bg-surface-2 transition-all"
                  >
                    <h3 className="font-mono text-amber-signal uppercase text-[10px] tracking-[4px] mb-6">{risk.category}</h3>
                    <p className="font-bold text-text-primary mb-6 text-xl leading-tight group-hover:text-violet-primary transition-colors">{risk.description}</p>
                    <div className="text-sm text-text-secondary border-t border-border-subtle pt-6 mt-6">
                      <span className="font-mono text-[9px] text-green-lesson block mb-3 uppercase tracking-[3px] font-bold">RECOVERY PROTOCOL</span>
                      <p className="leading-relaxed font-body">{risk.mitigation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Correlation Map */}
              <div className="bg-bg-surface-1 border border-border-subtle p-10 rounded-xl shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <span className="font-mono text-[11px] text-text-muted uppercase tracking-[5px]">HISTORICAL CORRELATION MAP</span>
                  <div className="px-3 py-1 bg-amber-signal/10 border border-amber-signal/30 rounded text-[10px] font-mono text-amber-signal uppercase">HIGH CONFIDENCE MATCH</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {report.similar_cases.map((caseItem: any, i: number) => (
                    <div key={i} className="bg-bg-surface-2 border border-border-subtle p-6 rounded-lg hover:border-violet-primary/50 transition-all cursor-pointer group">
                      <div className="w-10 h-10 bg-bg-surface-1 rounded border border-border-subtle flex items-center justify-center mb-6 group-hover:bg-violet-primary/10 transition-colors">
                        <span className="text-lg">⚖️</span>
                      </div>
                      <h4 className="font-bold text-text-primary text-lg mb-2">{caseItem.name}</h4>
                      <p className="text-xs text-text-muted italic leading-relaxed group-hover:text-text-secondary transition-colors">{caseItem.correlation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 pt-12">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="font-mono text-[10px] text-text-muted hover:text-violet-primary uppercase tracking-[4px] transition-colors"
                >
                  ↑ Return to Analysis
                </button>
                <button 
                  onClick={() => setStep('PITCH')}
                  className="px-12 py-5 bg-bg-surface-1 border border-border-subtle hover:border-violet-primary hover:bg-bg-surface-2 transition-all font-mono text-xs tracking-[5px] uppercase rounded-lg text-text-secondary shadow-2xl"
                >
                  INITIATE NEW SCAN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

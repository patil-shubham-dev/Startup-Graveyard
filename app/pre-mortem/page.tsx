'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, Zap, Cpu, FileText, AlertTriangle, TrendingUp, Users,
  Package, DollarSign, Search, Clipboard, Check, Download, Lightbulb,
  HelpCircle, Database, Sparkles, Layers, Eye, RefreshCw, ChevronRight,
  ArrowRight, ArrowLeft, Share2, Copy, BookOpen, Clock, Lock, Menu, X
} from 'lucide-react';

const cleanOptionText = (text: string) => {
  if (!text) return '';
  return text.replace(/^(Option\s+\d+:\s+)?(Optimistic|Realistic|Pessimistic)\s*—\s*/i, '');
};

type Step = 'PITCH' | 'QUESTIONS' | 'ANALYSIS' | 'REPORT';

interface Question {
  id: string;
  text: string;
  options: string[];
}

const SAMPLE_PITCHES = [
  {
    title: "DispatchAI — Decentralized Courier Logistics",
    pitch: "DispatchAI is a real-time, AI-driven dispatching platform for independent regional courier networks. By utilizing reinforcement learning, we dynamically cluster, schedule, and route local shipments. We bypass traditional central hub sorting, cutting delivery overhead by 35% and transit times by 4 hours. However, we face intensive local competition and complex scaling economics across fragmented freight brokerage markets."
  },
  {
    title: "TheraPulse — Biosensor Diagnostic Wearable",
    pitch: "TheraPulse develops a micro-fluidic biosensor patch that monitors vascular inflammation biomarkers in real-time. By coupling continuous biochemical sensing with machine learning algorithms, we predict hyper-acute cardiac events up to 6 hours before symptoms occur. We target clinical cardiology clinics as our primary channel, but face steep FDA regulatory pathways, hardware manufacturing capital constraints, and institutional insurance reimbursement headwinds."
  },
  {
    title: "ScribeVault — Legal Document Synthesizer",
    pitch: "ScribeVault is a privacy-first generative AI agent that ingests thousands of pages of unstructured discovery documentation to construct courtroom-ready diagnostic chronologies and deposition transcripts. Powered by local LLMs, it ensures zero data leaks for high-profile defense firms. Our primary challenges are high custom pipeline implementation costs, long corporate sales cycles, and conservative legal tech adoption rates."
  }
];

export default function PreMortemPage() {
  const [step, setStep] = useState<Step>('PITCH');
  const [pitch, setPitch] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<any | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // UI states
  const [exampleIndex, setExampleIndex] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeReportSection, setActiveReportSection] = useState('executive-summary');

  const reportRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Overflow Lock for Desktop Viewport
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlHeight = document.documentElement.style.height;
    const origBodyHeight = document.body.style.height;

    // Enforce strict one-screen height allocation on desktop
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.height = origHtmlHeight;
      document.body.style.height = origBodyHeight;
    };
  }, []);

  // Autopopulate example pitch
  const handleSeeExample = () => {
    const sample = SAMPLE_PITCHES[exampleIndex];
    setPitch(sample.pitch);
    setExampleIndex((prev) => (prev + 1) % SAMPLE_PITCHES.length);
  };

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
      setSessionId(data.sessionId);
      setStep('QUESTIONS');
      setCurrentStep(2);
      setCurrentQuestionIndex(0);
      setSelectedOptions({});
      setCustomAnswers({});
      setAnswers({});
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalize = async () => {
    setStep('ANALYSIS');
    setCurrentStep(3);
    try {
      const res = await fetch('/api/pre-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_REPORT', pitch, answers, sessionId }),
      });
      const data = await res.json();
      setReport(data);
      setStep('REPORT');
    } catch (error) {
      console.error(error);
      setStep('QUESTIONS');
      setCurrentStep(2);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: string, optionText: string) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionIndex }));
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleCustomTextChange = (questionId: string, text: string) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: text }));
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSelectOther = (questionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: 'other' }));
    const customText = customAnswers[questionId] || '';
    setAnswers((prev) => ({ ...prev, [questionId]: customText }));
  };

  const handleReset = () => {
    setStep('PITCH');
    setCurrentStep(1);
    setPitch('');
    setAnswers({});
    setSelectedOptions({});
    setCustomAnswers({});
    setReport(null);
    setCurrentQuestionIndex(0);
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = document.getElementById('report-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F7F4EE',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`pre-mortem-verdict-${report.diagnosticId || reportId}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getCurrentVectorInfo = () => {
    if (step === 'PITCH') {
      return { code: 'VEC_INIT', label: 'Awaiting Venture Input', desc: 'Venture pitch parsing inactive. Input model parameters.' };
    }
    if (step === 'QUESTIONS') {
      const idx = currentQuestionIndex;
      const vectors = ['VEC_PRODUCT', 'VEC_MARKET', 'VEC_EXECUTION', 'VEC_FINANCIAL', 'VEC_PRODUCT', 'VEC_MARKET', 'VEC_EXECUTION', 'VEC_FINANCIAL'];
      const currentVector = vectors[idx % vectors.length];
      
      const labels: Record<string, string> = {
        'VEC_PRODUCT': 'Product-Market Fit Interrogation',
        'VEC_MARKET': 'Market Timing & Category Integrity',
        'VEC_EXECUTION': 'Operational Scalability Analysis',
        'VEC_FINANCIAL': 'Capital Durability Stress Test',
      };
      
      return { 
        code: currentVector, 
        label: labels[currentVector] || 'Interrogation Active', 
        desc: `Vector scan active. Diagnostic query 0${idx + 1} of 08 in progress.` 
      };
    }
    if (step === 'ANALYSIS') {
      return { code: 'VEC_COMPILING', label: 'Consulting-Grade Synthesis', desc: 'Semantic correlation mapping against historical startup autopsies.' };
    }
    return { code: 'VEC_COMPLETE', label: 'Verdict Compiled', desc: 'Forensic risk report compiled successfully.' };
  };

  const activeVector = getCurrentVectorInfo();
  const isReportStep = step === 'REPORT';
  const isAnalysisStep = step === 'ANALYSIS';

  // Intersection observer logic to highlight active section in report
  useEffect(() => {
    if (!isReportStep) return;

    const sections = ['executive-summary', 'primary-risks', 'failure-scenarios', 'historical-parallels', 'competitive-threats', 'survival-probability'];
    const observers = sections.map((secId) => {
      const el = document.getElementById(secId);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveReportSection(secId);
          }
        },
        { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [isReportStep, report]);

  // Sidebar Layout Component (Strictly vertically compressed to ensure zero page scrolls)
  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-5 xl:p-6 overflow-hidden select-none bg-[#090B0F]">
      
      {/* Header and Branding block */}
      <div className="flex flex-col gap-4 xl:gap-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F7F4EE] text-[#090B0F] rounded-md flex items-center justify-center font-display-serif font-bold text-[15px]">
            SG
          </div>
          <div className="flex flex-col">
            <span className="font-monospace text-[9px] tracking-[0.2em] font-semibold text-[#F7F4EE] leading-none">STARTUP GRAVEYARD</span>
            <span className="font-monospace text-[8px] tracking-wider text-[#9A9187] uppercase mt-0.5 leading-none">
              Autopsy-backed risk diagnostic
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-white/10" />

        {/* Brand Title Description */}
        <div className="flex flex-col gap-2.5">
          <span className="font-monospace text-[9.5px] tracking-[0.25em] text-[#D35A22] uppercase font-bold leading-none">— FORENSIC ENGINE</span>
          <h2 className="sidebar-title-styles text-[#F7F4EE] tracking-tight">Pre-Mortem Engine</h2>
          <p className="sidebar-description-styles text-white/60 leading-relaxed font-sans">
            Stress-test your business model against historical failure patterns to uncover lethal blind spots before it's too late.
          </p>
        </div>

        {/* Engine Status Card */}
        <div className="p-3.5 border border-white/10 bg-[#0F141B] rounded-xl flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="font-monospace text-[8.5px] tracking-wider uppercase font-bold text-white/50 leading-none">ENGINE STATUS</span>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FAE5A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3FAE5A]"></span>
              </span>
              <span className="font-monospace text-[8.5px] tracking-wider text-[#3FAE5A] font-bold">ACTIVE</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-0.5 border-t border-white/5 pt-2">
            <span className="font-monospace text-[10.5px] font-bold tracking-widest text-[#D35A22] leading-none">
              {activeVector.code}
            </span>
            <span className="font-display-serif text-[13.5px] italic mt-0.5 text-[#F7F4EE] leading-snug">
              {activeVector.label}
            </span>
            <span className="text-[11px] font-sans text-white/50 mt-1 leading-normal line-clamp-2">
              {activeVector.desc}
            </span>
          </div>
        </div>

        {/* Capabilities List */}
        <div className="flex flex-col gap-2.5">
          <span className="font-monospace text-[8.5px] tracking-[0.2em] text-[#9A9187] uppercase font-bold block mb-0.5">ENGINE CAPABILITIES</span>
          <ul className="flex flex-col gap-1.5">
            {[
              { text: "Data-driven autopsies", active: activeVector.code === 'VEC_PRODUCT' },
              { text: "Multi-vector vulnerability scans", active: activeVector.code === 'VEC_MARKET' },
              { text: "Evidence-backed insights", active: activeVector.code === 'VEC_EXECUTION' },
              { text: "Structured Consulting diagnostics", active: activeVector.code === 'VEC_COMPILING' },
              { text: "Actionable recommendations", active: activeVector.code === 'VEC_COMPLETE' }
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[12.5px] leading-none py-0.5">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                  item.active ? 'bg-[#D35A22] border-[#D35A22] text-[#F7F4EE]' : 'border-white/20 text-[#9A9187]'
                }`}>
                  <Check className="w-2 h-2" />
                </div>
                <span className={`font-sans transition-colors leading-none ${item.active ? 'font-semibold text-[#D35A22]' : 'text-white/60'}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Confidential Note Card */}
      <div className="p-3.5 border border-white/5 bg-[#0F141B] text-[11.5px] leading-relaxed rounded-xl text-white/50 shrink-0">
        <span className="font-monospace font-bold block mb-0.5 uppercase tracking-wider text-[#D35A22] text-[9.5px] leading-none">CONFIDENTIAL INTEL NOTE</span>
        Analysis utilizes semantic indexing across 3,000+ failed venture autopsies. All data is isolated, processed securely, and fully confidential.
      </div>
    </div>
  );

  return (
    <main className="preMortemPage w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-[#F7F4EE] text-[#111111]">
      
      {/* MOBILE TRIGGER BANNER */}
      {!isReportStep && (
        <div className="lg:hidden w-full bg-[#090B0F] text-[#F7F4EE] border-b border-white/10 px-5 py-2.5 flex justify-between items-center sticky top-0 z-30 shrink-0 h-[48px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FAE5A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3FAE5A]"></span>
            </span>
            <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold">
              {activeVector.code}
            </span>
          </div>
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-1.5 border border-white/20 px-2.5 py-1 rounded-lg font-monospace text-[9px] tracking-widest uppercase hover:bg-white/5 transition-all leading-none"
          >
            <Menu className="w-3 h-3" />
            CONSOLE
          </button>
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER (Sliding Panel) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black"
            />
            {/* Drawer Container */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-[300px] max-w-[85vw] h-full bg-[#090B0F] text-[#F7F4EE] z-10 flex flex-col justify-between"
            >
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR (Fixed/Sticky Dark forensic panel on Desktop - 380px width) */}
      {!isReportStep && (
        <aside className="hidden lg:flex w-[380px] border-r border-white/10 shrink-0 h-full flex-col justify-between overflow-hidden bg-[#090B0F]">
          <SidebarContent />
        </aside>
      )}

      {/* RIGHT WORKSPACE PANEL (100% Height viewport allocation - Scroll-free parent) */}
      {!isReportStep && (
        <div className="rightPanel flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F7F4EE]">
          
          {/* Step Progress Tracker (Static - 76px Height Pinned) */}
          {!isAnalysisStep && (
            <header className="h-[76px] border-b border-[#DDD3C5] px-6 md:px-12 flex items-center justify-center shrink-0">
              <div className="max-w-[760px] mx-auto w-full flex items-center justify-between">
                {[
                  { label: 'Diagnose', id: 1, tag: '01' },
                  { label: 'Interrogation', id: 2, tag: '02' },
                  { label: 'Predict', id: 3, tag: '03' }
                ].map((s, idx) => {
                  const isCompleted = currentStep > s.id;
                  const isActive = currentStep === s.id;
                  
                  return (
                    <div key={s.id} className="flex items-center gap-2 group leading-none">
                      <div className="flex items-center gap-2">
                        
                        {/* Stepper Node Circle */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-monospace text-[10px] font-bold transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-[#D35A22] border-[#D35A22] text-[#F7F4EE]' 
                            : isActive 
                            ? 'border-[#D35A22] text-[#D35A22] bg-transparent' 
                            : 'border-[#DDD3C5] text-[#9A9187] bg-transparent'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3" /> : s.tag}
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                          <span className="font-monospace text-[8px] text-[#9A9187] tracking-[0.15em] uppercase font-bold leading-none">
                            STEP {s.tag}
                          </span>
                          <span className={`text-[12px] font-sans transition-colors leading-none mt-0.5 ${
                            isActive 
                              ? 'text-[#D35A22] font-semibold' 
                              : isCompleted 
                              ? 'text-[#111111] font-medium' 
                              : 'text-[#9A9187]'
                          }`}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                      
                      {idx < 2 && (
                        <div className={`w-6 sm:w-16 h-[1.5px] mx-2 hidden sm:block ${
                          isCompleted ? 'bg-[#D35A22]' : 'bg-[#DDD3C5]'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </header>
          )}

          {/* STEP CONTENT AREA (Fills space, scroll-free workspace wrapper) */}
          <div className="stepContent flex-1 min-h-0 overflow-hidden relative flex flex-col justify-center px-6 md:px-10 lg:px-12 py-4">
            <AnimatePresence mode="wait">
              
              {/* STEP 01 — DIAGNOSE */}
              {step === 'PITCH' && (
                <motion.div
                  key="step-pitch"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="max-w-[760px] mx-auto w-full h-full flex flex-col justify-between py-2 overflow-hidden"
                >
                  {/* Header and Title */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <span className="font-monospace text-[10px] tracking-[0.2em] text-[#9A9187] uppercase font-bold leading-none">
                      — FORENSIC DIAGNOSTIC ENGINE
                    </span>
                    <h1 className="hero-title-styles text-[#111111]">
                      Diagnose your startup <span className="italic font-medium text-[#D35A22]">before it's too late.</span>
                    </h1>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-monospace text-[10px] tracking-wider text-[#6D655B] uppercase mt-1 leading-none">
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-[#D35A22]" /> 8 Vectors</span>
                      <span className="text-[#DDD3C5]">•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#D35A22]" /> &lt; 5 Min</span>
                      <span className="text-[#DDD3C5]">•</span>
                      <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-[#D35A22]" /> 3K Autopsies</span>
                      <span className="text-[#DDD3C5]">•</span>
                      <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-[#D35A22]" /> Secure</span>
                    </div>
                  </div>

                  {/* Multiline Textarea Input (Strictly 170px Height Container) */}
                  <div className="flex flex-col gap-1.5 p-3.5 border border-[#DDD3C5] rounded-[16px] bg-[#FCFAF6] shadow-sm h-[170px] max-h-[170px] shrink-0 mt-2">
                    <div className="flex justify-between items-center border-b border-[#DDD3C5]/60 pb-1.5 shrink-0">
                      <label className="font-monospace text-[9.5px] tracking-[0.18em] text-[#D35A22] uppercase font-bold leading-none">
                        VENTURE DESCRIPTION PITCH
                      </label>
                      <span className="font-monospace text-[9.5px] text-[#9A9187] leading-none">
                        {pitch.length} / 1000 char
                      </span>
                    </div>

                    <textarea
                      className="w-full flex-1 bg-transparent font-sans text-[16px] text-[#111111] leading-relaxed outline-none resize-none pt-1 overflow-y-auto"
                      placeholder="Describe your startup's core premise, target user base, business model, and competitive challenges. (Minimum 20 characters required to initiate diagnostics)..."
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value.slice(0, 1000))}
                    />
                  </div>

                  {/* Guidance Tip Card (Exactly 64px Height) */}
                  <div className="flex gap-4 justify-between items-center bg-[#FCFAF6] border border-[#DDD3C5] p-3 rounded-[16px] h-[64px] shrink-0 mt-2 shadow-sm">
                    <div className="flex gap-3 items-center min-w-0">
                      <Lightbulb className="w-5 h-5 text-[#E6A43B] shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-monospace text-[9px] tracking-wider uppercase font-bold text-[#111111] leading-none">diagnostic guidance</span>
                        <p className="text-[12px] text-[#6D655B] leading-none font-sans mt-1 truncate">
                          Need structure? Populate a consulting-grade test case using the auto-injector.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSeeExample}
                      className="font-monospace text-[9px] tracking-widest uppercase border border-[#D35A22] text-[#D35A22] px-3.5 py-1.5 rounded-lg bg-[#FCFAF6] hover:bg-[#D35A22]/5 transition-all shrink-0 font-bold leading-none"
                    >
                      EXAMPLE
                    </button>
                  </div>

                  {/* Primary CTA (Exactly 52px Height) */}
                  <button
                    onClick={handleStartInterrogation}
                    disabled={pitch.length < 20 || isGenerating}
                    className={`w-full h-[52px] flex items-center justify-center gap-2 rounded-[16px] font-monospace text-[10.5px] font-bold tracking-[0.18em] uppercase transition-all duration-200 shrink-0 mt-2 ${
                      pitch.length < 20 || isGenerating
                        ? 'bg-[#DDD3C5] text-[#9A9187] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D35A22] to-[#BF4F1E] hover:from-[#BF4F1E] hover:to-[#D35A22] text-[#FCFAF6] shadow-sm hover:scale-[1.002]'
                    }`}
                  >
                    {isGenerating ? 'ANALYZING INTENT...' : 'INITIATE DIAGNOSTIC →'}
                  </button>
                </motion.div>
              )}

              {/* STEP 02 — INTERROGATION (Scroll-free workspace with 2x2 Answer Grid layout) */}
              {step === 'QUESTIONS' && questions.length > 0 && (
                (() => {
                  const q = questions[currentQuestionIndex];
                  const selected = selectedOptions[q.id];
                  const isCurrentQuestionAnswered = selected !== undefined && selected !== null && (selected !== 'other' || (customAnswers[q.id] || '').trim().length > 0);
                  const isLastQuestion = currentQuestionIndex === questions.length - 1;

                  return (
                    <motion.div
                      key="step-questions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="max-w-[1000px] mx-auto w-full h-full flex flex-col justify-between py-2 overflow-hidden"
                    >
                      {/* Question progress header (Static - Pinned) */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between items-center leading-none">
                          <span className="font-monospace text-[9.5px] tracking-[0.2em] text-[#D35A22] uppercase font-bold leading-none">
                            INTERROGATION
                          </span>
                          <span className="font-monospace text-[9.5px] text-[#9A9187] tracking-wider uppercase font-bold leading-none">
                            QUESTION_0{currentQuestionIndex + 1} / 0{questions.length}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-[#DDD3C5] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#D35A22] to-[#BF4F1E] transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Main Question Text (Clipped to max 3 lines) */}
                      <div className="flex flex-col gap-1 shrink-0 mt-2">
                        <span className="font-monospace text-[9px] text-[#9A9187] uppercase tracking-wider font-bold leading-none">
                          FAILURE VECTOR DIAGNOSTIC
                        </span>
                        <h3 className="question-title-styles text-[#111111] line-clamp-3 mt-1 leading-tight">
                          {q.text}
                        </h3>
                      </div>

                      {/* 2x2 ANSWER GRID (Flexible Area - Zero outer scrolling) */}
                      <div className="flex-1 min-h-0 py-2 my-3 grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                        
                        {/* 3 Predefined answer options */}
                        {q.options && q.options.slice(0, 3).map((option, idx) => {
                          const isSelected = selectedOptions[q.id] === String(idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(q.id, String(idx), option)}
                              className={`p-5 text-left rounded-[16px] border flex flex-col justify-center items-start gap-1 transition-all duration-150 w-full relative min-h-[72px] h-full ${
                                isSelected
                                  ? 'bg-[#FCFAF6] border-[#D35A22] shadow-sm'
                                  : 'bg-[#FCFAF6] border-[#DDD3C5] hover:bg-[#FCFAF6]/60 hover:border-[#6D655B]'
                              }`}
                            >
                              <span className="font-sans text-[14.5px] leading-snug text-[#111111] pr-6 line-clamp-3">
                                {cleanOptionText(option)}
                              </span>
                              
                              {isSelected && (
                                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#D35A22] flex items-center justify-center text-[#FCFAF6]">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          );
                        })}

                        {/* OTHER/CUSTOM ANSWER (Cell #4 of 2x2 Grid with Inline Input Field) */}
                        {(() => {
                          const isSelected = selected === 'other';
                          return (
                            <button
                              onClick={() => handleSelectOther(q.id)}
                              className={`p-5 text-left rounded-[16px] border flex flex-col justify-center items-start gap-1.5 transition-all duration-150 w-full relative min-h-[72px] h-full ${
                                isSelected
                                  ? 'bg-[#FCFAF6] border-[#D35A22] shadow-sm'
                                  : 'bg-[#FCFAF6] border-[#DDD3C5] hover:bg-[#FCFAF6]/60 hover:border-[#6D655B]'
                              }`}
                            >
                              <div className="flex gap-2.5 items-center w-full min-w-0">
                                <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#D35A22]' : 'text-[#9A9187]'}`} />
                                <span className={`font-sans text-[14.5px] font-medium ${isSelected ? 'text-[#111111]' : 'text-[#6D655B]'} truncate`}>
                                  Other / Custom Scenario
                                </span>
                              </div>
                              
                              {/* Inline Input Field for Custom answers */}
                              {isSelected ? (
                                <input
                                  type="text"
                                  placeholder="Type custom failure vector..."
                                  value={customAnswers[q.id] || ''}
                                  onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()} // Prevent card deselect
                                  autoFocus
                                  className="w-full bg-transparent border-b border-[#D35A22] outline-none text-[#111111] font-sans text-[13.5px] py-0.5 mt-0.5 focus:ring-0 focus:border-b"
                                />
                              ) : (
                                <span className="text-[11px] font-monospace text-[#9A9187] uppercase leading-none mt-1">
                                  SPECIFY VULNERABILITY
                                </span>
                              )}

                              {isSelected && (
                                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#D35A22] flex items-center justify-center text-[#FCFAF6]">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          );
                        })()}

                      </div>

                      {/* Paginated actions footer (Static - Pinned to bottom) */}
                      <div className="stepFooter flex justify-between items-center pt-3 border-t border-[#DDD3C5] shrink-0">
                        {currentQuestionIndex > 0 ? (
                          <button
                            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                            className="flex items-center gap-2 font-monospace text-[9.5px] tracking-widest font-bold text-[#6D655B] uppercase hover:text-[#111111] transition-colors leading-none"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> BACK
                          </button>
                        ) : (
                          <div />
                        )}

                        <button
                          onClick={isLastQuestion ? handleFinalize : () => setCurrentQuestionIndex((prev) => prev + 1)}
                          disabled={!isCurrentQuestionAnswered}
                          className={`h-11 px-5 rounded-lg font-monospace text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-150 leading-none ${
                            isCurrentQuestionAnswered
                              ? 'bg-[#D35A22] text-[#FCFAF6] hover:scale-[1.01] cursor-pointer'
                              : 'bg-[#DDD3C5] text-[#9A9187] cursor-not-allowed'
                          }`}
                        >
                          {isLastQuestion ? 'COMPILE VERDICT →' : 'NEXT VECTOR →'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })()
              )}

              {/* STEP 02b — TRANSITIONAL ANALYSIS LOADING */}
              {step === 'ANALYSIS' && (
                <motion.div
                  key="step-analysis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-[480px] mx-auto w-full flex flex-col items-center justify-center text-center gap-5 min-h-[280px] overflow-hidden"
                >
                  {/* Spinning Forensic Ring */}
                  <div className="relative w-16 h-16 shrink-0">
                    <div className="absolute inset-0 border-[3px] border-dashed border-[#DDD3C5] rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-[6px] border-2 border-[#D35A22]/40 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center font-display-serif font-bold text-[16px] text-[#111111]">
                      SG
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <h2 className="font-display-serif text-[25px] font-bold italic text-[#111111] leading-none">
                      Compiling Forensic Verdict
                    </h2>
                    <p className="text-[13px] text-[#6D655B] leading-relaxed max-w-[320px] font-sans">
                      Graveyard Keeper AI is processing responses against historical startup death spirals...
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full bg-[#FCFAF6] border border-[#DDD3C5] p-3.5 rounded-[16px] shadow-sm shrink-0">
                    {[
                      { label: 'SCANNING VECTORS', time: '120ms' },
                      { label: 'MAPPING RISK COEFFICIENTS', time: '230ms' },
                      { label: 'COMPARING HISTORICAL AUTOPSIES', time: 'ACTIVE' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9.5px] font-monospace tracking-wider border-b border-[#DDD3C5]/20 last:border-0 pb-1.5 last:pb-0 leading-none">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D35A22] animate-pulse" />
                          <span className="text-[#111111] font-bold">{item.label}</span>
                        </div>
                        <span className={item.time === 'ACTIVE' ? 'text-[#D35A22] font-bold animate-pulse' : 'text-[#9A9187]'}>
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* STEP 03 — PREDICT (FINAL DOSSIER - TWO COLUMN SPLIT VIEWPORT OVERALL HEIGHT) */}
      {isReportStep && report && (
        <div className="w-full flex h-full overflow-hidden bg-[#F7F4EE]">
          
          {/* REPORT NAVIGATION COLUMN (Left Panel - 280px Width Fixed) */}
          <aside className="w-[280px] bg-[#FCFAF6] border-r border-[#DDD3C5] p-5 flex flex-col justify-between shrink-0 h-full overflow-hidden z-10 select-none">
            <div className="flex flex-col gap-4 overflow-hidden">
              
              {/* Report Header Metadata */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="font-monospace text-[8.5px] tracking-[0.2em] text-[#D35A22] uppercase font-bold leading-none">
                  DIAGNOSTIC ARCHIVE
                </span>
                <div className="flex justify-between items-center mt-1 leading-none">
                  <span className="font-monospace text-[11.5px] font-bold text-[#111111]">
                    REPORT #PRM-{report.diagnosticId || reportId}
                  </span>
                  <span className="font-monospace text-[8px] bg-[#D84C2A]/10 border border-[#D84C2A]/20 text-[#D84C2A] px-1.5 py-0.5 rounded font-bold uppercase">
                    CONFIDENTIAL
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9.5px] font-monospace text-[#6D655B] border-t border-b border-[#DDD3C5] py-2 mt-2 leading-none">
                  <span>GENERATED:</span>
                  <span>{new Date().toISOString().slice(0, 10)}</span>
                </div>
              </div>

              {/* Survival Probability & Overall Risk */}
              <div className="bg-[#F7F4EE] border border-[#DDD3C5] p-3.5 rounded-[16px] flex flex-col items-center text-center gap-2.5 shrink-0">
                <span className="font-monospace text-[8.5px] tracking-widest text-[#9A9187] uppercase font-bold leading-none">
                  OVERALL RISK FACTOR
                </span>
                
                {/* Circular progress bar SVG (Compact 90px) */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="33"
                      stroke="#DDD3C5"
                      strokeWidth="4"
                      fill="transparent"
                      opacity="0.3"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="33"
                      stroke={report.risk_score > 70 ? "#D84C2A" : report.risk_score > 40 ? "#E6A43B" : "#3FAE5A"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 33}
                      strokeDashoffset={(2 * Math.PI * 33) - (report.risk_score / 100) * (2 * Math.PI * 33)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="font-display-serif text-[20px] font-bold leading-none text-[#111111]">
                      {report.risk_score}%
                    </span>
                    <span className="text-[7.5px] font-monospace text-[#6D655B] mt-0.5 font-bold leading-none uppercase">
                      RISK
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-display-serif italic text-[12.5px] font-bold text-[#111111] leading-none">
                    {report.risk_score > 70 ? 'High Venture Headwinds' : report.risk_score > 40 ? 'Moderate Autopsy Risk' : 'Low Autopsy Risk'}
                  </span>
                  <span className="font-monospace text-[8.5px] text-[#6D655B] uppercase font-semibold mt-1 leading-none">
                    VERDICT: {report.risk_score > 70 ? 'CRITICAL' : report.risk_score > 40 ? 'CAUTION' : 'NOMINAL'}
                  </span>
                </div>
              </div>

              {/* Scrollspy Navigation Menu */}
              <div className="flex flex-col gap-1 overflow-hidden select-none">
                <span className="font-monospace text-[8.5px] tracking-widest text-[#9A9187] uppercase font-bold block mb-0.5 leading-none">
                  REPORT NAVIGATION
                </span>
                {[
                  { id: 'executive-summary', label: 'Executive Summary', icon: BookOpen },
                  { id: 'primary-risks', label: 'Primary Risk Vectors', icon: Layers },
                  { id: 'failure-scenarios', label: 'Where This Fails', icon: AlertTriangle },
                  { id: 'historical-parallels', label: 'Cemetery Parallels', icon: Database },
                  { id: 'competitive-threats', label: 'Competitive Threats', icon: TrendingUp },
                  { id: 'survival-probability', label: 'Risk Breakdown', icon: Cpu }
                ].map((sec) => {
                  const isActive = activeReportSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        const el = document.getElementById(sec.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[12px] font-sans transition-all leading-none shrink-0 ${
                        isActive
                          ? 'bg-[#D35A22]/10 text-[#D35A22] font-bold border-l-2 border-[#D35A22]'
                          : 'text-[#6D655B] hover:bg-[#F7F4EE] hover:text-[#111111]'
                      }`}
                    >
                      <sec.icon className={`w-3 h-3 ${isActive ? 'text-[#D35A22]' : 'text-[#9A9187]'}`} />
                      <span className="truncate">{sec.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Sticky Navigation actions at footer */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#DDD3C5] shrink-0 mt-3">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full h-9 bg-[#D35A22] hover:bg-[#BF4F1E] text-[#FCFAF6] rounded-lg font-monospace text-[9.5px] tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all leading-none shrink-0"
              >
                <Download className="w-3 h-3" />
                {exporting ? 'EXPORTING...' : 'EXPORT REPORT PDF'}
              </button>

              <button
                onClick={() => copyToClipboard(window.location.href, 'global-share')}
                className="w-full h-9 border border-[#DDD3C5] bg-transparent hover:bg-[#F7F4EE] text-[#111111] rounded-lg font-monospace text-[9.5px] tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 transition-all leading-none shrink-0"
              >
                {copiedSection === 'global-share' ? (
                  <>
                    <Check className="w-3 h-3 text-[#3FAE5A]" />
                    <span className="text-[#3FAE5A]">COPIED LINK</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#6D655B]" />
                    <span>SHARE REPORT</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="w-full text-center font-monospace text-[9.5px] font-bold text-[#9A9187] hover:text-[#D35A22] tracking-widest uppercase mt-0.5 transition-colors leading-none"
              >
                ← NEW SCAN
              </button>
            </div>
          </aside>

          {/* REPORT CONTENT PANEL (Flexible Area - ISOLATED INTERNAL SCROLL ONLY) */}
          <div className="flex-1 h-full overflow-hidden flex flex-col p-6 xl:p-8">
            
            {/* Report Header Title Block (Static) */}
            <header className="flex justify-between items-end border-b border-[#DDD3C5] pb-3 shrink-0 h-[56px]">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-monospace text-[8.5px] tracking-[0.2em] text-[#D35A22] uppercase font-bold leading-none">
                  STEP 03 // PREDICTIVE AUTOPSY
                </span>
                <h1 className="report-title-styles text-[#111111] leading-none mt-1">
                  Pre-Mortem Verdict Dossier
                </h1>
              </div>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="hidden sm:flex items-center gap-1.5 border border-[#DDD3C5] px-2.5 py-1.5 rounded-lg bg-[#FCFAF6] font-monospace text-[9px] tracking-widest font-bold text-[#D35A22] uppercase hover:bg-[#D35A22]/5 transition-all leading-none"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
            </header>

            {/* Scrollable Report Content Area (.reportContent - The only scroll section!) */}
            <div 
              ref={reportRef} 
              id="report-content" 
              className="reportContent flex-1 overflow-y-auto max-h-full py-5 pr-4 flex flex-col gap-8 bg-[#F7F4EE]"
            >
              
              {/* Executive Summary Quote */}
              <section id="executive-summary" className="scroll-mt-4">
                <div className="bg-[#FCFAF6] border border-[#DDD3C5] p-5 sm:p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-[#DDD3C5]/45 pb-2">
                    <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                      // EXECUTIVE VERDICT SUMMARY
                    </span>
                    <span className="font-monospace text-[8px] bg-[#D84C2A]/10 border border-[#D84C2A]/20 text-[#D84C2A] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 leading-none">
                      {report.risk_score > 70 ? 'CRITICAL RISK VECTORS' : 'MODERATE RISK'}
                    </span>
                  </div>
                  
                  <blockquote className="font-display-serif italic text-[16px] sm:text-[18px] font-semibold leading-relaxed text-[#111111] pr-4 mt-1">
                    &ldquo;{report.verdict}&rdquo;
                  </blockquote>

                  <div className="flex justify-between items-center pt-2.5 border-t border-[#DDD3C5]/60 mt-1 leading-none">
                    <span className="font-monospace text-[8.5px] text-[#9A9187] tracking-wider uppercase leading-none">
                      SYSTEM AUTOPSY LOG
                    </span>
                    <button
                      onClick={() => copyToClipboard(report.verdict, 'verdict')}
                      className="text-[#6D655B] hover:text-[#D35A22] transition-colors p-0.5"
                      title="Copy Verdict summary to clipboard"
                    >
                      {copiedSection === 'verdict' ? <Check className="w-3.5 h-3.5 text-[#3FAE5A]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </section>

              {/* Primary Risk Vectors (3-column layout) */}
              <section id="primary-risks" className="scroll-mt-4 flex flex-col gap-3.5">
                <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
                  <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                    // LETHAL RISK VECTORS
                  </span>
                  <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">
                    3 Factors Mapped
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.primary_risks.map((risk: any, i: number) => {
                    return (
                      <div
                        key={i}
                        className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="flex flex-col gap-2.5">
                          <div className="w-7.5 h-7.5 rounded-lg bg-[#D35A22]/5 border border-[#D35A22]/10 flex items-center justify-center text-[#D35A22] shrink-0 font-monospace font-bold text-[12px] leading-none">
                            0{i + 1}
                          </div>
                          <div className="flex flex-col gap-1 mt-0.5 leading-tight">
                            <span className="font-monospace text-[8.5px] tracking-widest text-[#9A9187] uppercase font-bold leading-none">
                              {risk.category}
                            </span>
                            <h3 className="font-display-serif italic font-semibold text-[15.5px] text-[#111111] leading-snug">
                              {risk.description}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 pt-2.5 border-t border-[#DDD3C5]/60 mt-1">
                          <span className="font-monospace text-[8.5px] text-[#D35A22] tracking-widest uppercase font-bold leading-none">
                            MITIGATION STRATEGY:
                          </span>
                          <p className="text-[12px] font-sans text-[#6D655B] leading-relaxed">
                            {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Where This Fails Scenario Cards */}
              <section id="failure-scenarios" className="scroll-mt-4 flex flex-col gap-3.5">
                <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
                  <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                    // WHERE THIS FAILS: HYPOTHETICAL DEATH SCENARIOS
                  </span>
                  <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">
                    Chronological Failure Pathways
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(report.failure_scenarios || []).map((scenario: any, i: number) => {
                    const probClass = 
                      scenario.probability === 'LIKELY' 
                        ? 'bg-[#D84C2A]/10 border-[#D84C2A]/20 text-[#D84C2A]' 
                        : scenario.probability === 'POSSIBLE' 
                        ? 'bg-[#E6A43B]/10 border-[#E6A43B]/20 text-[#E6A43B]' 
                        : 'bg-[#3FAE5A]/10 border-[#3FAE5A]/20 text-[#3FAE5A]';

                    return (
                      <div
                        key={i}
                        className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col justify-between gap-2.5 shadow-sm"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center leading-none">
                            <span className="font-monospace text-[8.5px] text-[#9A9187] uppercase tracking-wider font-bold leading-none">
                              DEATH PATHWAY 0{i + 1}
                            </span>
                            <span className={`font-monospace text-[8px] px-2 py-0.5 rounded border font-bold uppercase shrink-0 leading-none ${probClass}`}>
                              {scenario.probability}
                            </span>
                          </div>
                          <h4 className="font-display-serif italic font-bold text-[15.5px] text-[#111111] leading-tight">
                            {scenario.title}
                          </h4>
                          <p className="text-[12px] text-[#6D655B] leading-relaxed font-sans mt-0.5">
                            {scenario.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Historical Parallels */}
              <section id="historical-parallels" className="scroll-mt-4 flex flex-col gap-3.5">
                <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
                  <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                    // CEMETERY PARALLELS: REAL AUTOPSY CORRELATIONS
                  </span>
                  <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">
                    Real Autopsy Matches
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {(report.historical_cases || []).map((company: any, i: number) => (
                    <div
                      key={i}
                      className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col md:flex-row gap-3.5 justify-between items-start md:items-center shadow-sm"
                    >
                      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 leading-none">
                          <h4 className="font-display-serif font-bold text-[16.5px] text-[#111111] leading-none">
                            {company.name}
                          </h4>
                          <span className="text-[#DDD3C5] hidden sm:inline leading-none">|</span>
                          <span className="font-monospace text-[8.5px] text-[#9A9187] tracking-wider uppercase font-semibold leading-none mt-0.5">
                            FOUNDED: {company.founded} — DIED: {company.died}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#6D655B] leading-relaxed font-sans">
                          {company.correlation}
                        </p>
                      </div>

                      <div className="shrink-0 flex md:flex-col items-end gap-1 self-stretch justify-between md:justify-center border-t md:border-t-0 md:border-l border-[#DDD3C5] pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0 leading-none">
                        <span className="font-monospace text-[7.5px] text-[#9A9187] uppercase font-semibold leading-none">
                          MATCH VECTOR:
                        </span>
                        <span className="font-monospace text-[8.5px] bg-[#D84C2A]/10 border border-[#D84C2A]/20 text-[#D84C2A] px-2 py-0.5 rounded font-bold uppercase leading-none">
                          {company.cause_category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Competitive Threats */}
              <section id="competitive-threats" className="scroll-mt-4 flex flex-col gap-3.5">
                <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
                  <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                    // COMPETITIVE MOAT TIMING ANALYSIS
                  </span>
                  <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">
                    Threat Scan Ratings
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {(report.competitors || []).map((comp: any, i: number) => {
                    const levelClass = 
                      comp.threat_level === 'HIGH' 
                        ? 'text-[#D84C2A] border-[#D84C2A]/20 bg-[#D84C2A]/10' 
                        : comp.threat_level === 'MEDIUM'
                        ? 'text-[#E6A43B] border-[#E6A43B]/20 bg-[#E6A43B]/10' 
                        : 'text-[#3FAE5A] border-[#3FAE5A]/20 bg-[#3FAE5A]/10';
                    return (
                      <div
                        key={i}
                        className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm"
                      >
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <span className="font-monospace text-[9.5px] tracking-wider uppercase font-bold text-[#111111] leading-none">
                            {comp.name}
                          </span>
                          <p className="text-[12px] text-[#6D655B] leading-relaxed font-sans mt-1">
                            {comp.threat_reason}
                          </p>
                        </div>
                        <span className={`font-monospace text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 leading-none ${levelClass}`}>
                          {comp.threat_level} THREAT
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Survival Probability Breakdown (Terminal characters & bars) */}
              <section id="survival-probability" className="scroll-mt-4 flex flex-col gap-3.5">
                <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
                  <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                    // FORENSIC DIAGNOSTIC RISK INDEX Breakdown
                  </span>
                  <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">
                    Coefficients Mapped
                  </span>
                </div>

                <div className="bg-[#FCFAF6] border border-[#DDD3C5] p-5 rounded-[16px] flex flex-col gap-3 shadow-sm select-none">
                  {report.risk_breakdown && [
                    { label: 'Product & PMF Risk', value: report.risk_breakdown.product, desc: 'Failure to lock-in customer loops and scalable utility.' },
                    { label: 'Market & Category Risk', value: report.risk_breakdown.market, desc: 'Premature timing spikes and market growth contraction.' },
                    { label: 'Team Fit & Operational Risk', value: report.risk_breakdown.team, desc: 'Execution friction, keyman lockups, and culture decay.' },
                    { label: 'Financial & Capital Risk', value: report.risk_breakdown.financial, desc: 'Burn spikes, cash shortages, and toxic margin models.' }
                  ].map((item, i) => {
                    const filledBlocks = Math.round(item.value / 10);
                    const emptyBlocks = 10 - filledBlocks;
                    
                    return (
                      <div key={i} className="flex flex-col gap-1.5 border-b border-[#DDD3C5]/20 last:border-0 pb-2.5 last:pb-0">
                        <div className="flex justify-between items-end font-monospace leading-none">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10.5px] font-bold text-[#111111] uppercase tracking-wide leading-none">
                              {item.label}
                            </span>
                            <span className="text-[9px] text-[#9A9187] normal-case tracking-normal mt-0.5 leading-none">
                              {item.desc}
                            </span>
                          </div>
                          <span className="text-[12px] font-bold text-[#D35A22] shrink-0 leading-none">{item.value}% RISK</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-0.5 leading-none">
                          {/* Monospace terminal blocks */}
                          <div className="font-monospace text-[12px] text-[#D35A22] tracking-[0.2em] select-none shrink-0 leading-none">
                            {"█".repeat(filledBlocks)}
                            <span className="opacity-15">
                              {"░".repeat(emptyBlocks)}
                            </span>
                          </div>
                          
                          {/* Progress bar fill */}
                          <div className="flex-1 h-1.5 bg-[#F7F4EE] border border-[#DDD3C5] rounded-full overflow-hidden leading-none">
                            <div 
                              className="h-full bg-gradient-to-r from-[#D35A22] to-[#BF4F1E] rounded-full transition-all duration-1000" 
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Recommendations/Mitigations Summary */}
              <section className="scroll-mt-4 border-t border-[#DDD3C5] pt-5 flex flex-col gap-2.5 mb-4">
                <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                  // VERDICT LOG ACTION SUMMARY
                </span>
                <p className="text-[12.5px] text-[#6D655B] leading-relaxed font-sans">
                  The diagnostics compiled above show a survival index heavily constrained by operational and timing risks. Ensure you mitigate venture vulnerability vectors in chronological order. For further consulting-grade strategy and scenario support, utilize the semantic RAG database in the <span className="font-monospace text-[#D35A22] font-bold">[INTEL]</span> tab.
                </p>
              </section>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

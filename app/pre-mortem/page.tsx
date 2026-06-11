'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Menu, X } from 'lucide-react';
import { type Step, type Question, SAMPLE_PITCHES } from '@/components/pre-mortem/types';
import { SidebarContent } from '@/components/pre-mortem/SidebarContent';
import { PitchStep } from '@/components/pre-mortem/PitchStep';
import { QuestionsStep } from '@/components/pre-mortem/QuestionsStep';
import { AnalysisStep } from '@/components/pre-mortem/AnalysisStep';
import { ReportStep } from '@/components/pre-mortem/ReportStep';

export default function PreMortemPage() {
  const [step, setStep] = useState<Step>('PITCH');
  const [pitch, setPitch] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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
      pdf.save(`pre-mortem-verdict-${(report?.diagnosticId) || reportId}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const isReportStep = step === 'REPORT';
  const isAnalysisStep = step === 'ANALYSIS';

  return (
    <main className="preMortemPage w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-[#F7F4EE] text-[#111111]">
      {!isReportStep && (
        <div className="lg:hidden w-full bg-[#090B0F] text-[#F7F4EE] border-b border-white/10 px-5 py-2.5 flex justify-between items-center sticky top-0 z-30 shrink-0 h-[48px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FAE5A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3FAE5A]"></span>
            </span>
            <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold">
              VEC_INIT
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

      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black"
            />
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
              <SidebarContent step={step} currentQuestionIndex={currentQuestionIndex} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isReportStep && (
        <aside className="hidden lg:flex w-[380px] border-r border-white/10 shrink-0 h-full flex-col justify-between overflow-hidden bg-[#090B0F]">
          <SidebarContent step={step} currentQuestionIndex={currentQuestionIndex} />
        </aside>
      )}

      {!isReportStep && (
        <div className="rightPanel flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F7F4EE]">
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
                          <span className="font-monospace text-[8px] text-[#9A9187] tracking-[0.15em] uppercase font-bold leading-none">STEP {s.tag}</span>
                          <span className={`text-[12px] font-sans transition-colors leading-none mt-0.5 ${
                            isActive ? 'text-[#D35A22] font-semibold' : isCompleted ? 'text-[#111111] font-medium' : 'text-[#9A9187]'
                          }`}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                      {idx < 2 && (
                        <div className={`w-6 sm:w-16 h-[1.5px] mx-2 hidden sm:block ${isCompleted ? 'bg-[#D35A22]' : 'bg-[#DDD3C5]'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </header>
          )}

          <div className="stepContent flex-1 min-h-0 overflow-hidden relative flex flex-col justify-center px-6 md:px-10 lg:px-12 py-4">
            <AnimatePresence mode="wait">
              {step === 'PITCH' && (
                <PitchStep
                  pitch={pitch}
                  isGenerating={isGenerating}
                  onPitchChange={(v) => setPitch(v)}
                  onSeeExample={handleSeeExample}
                  onStartInterrogation={handleStartInterrogation}
                />
              )}

              {step === 'QUESTIONS' && questions.length > 0 && (
                <QuestionsStep
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  selectedOptions={selectedOptions}
                  customAnswers={customAnswers}
                  onSelectOption={handleSelectOption}
                  onSelectOther={handleSelectOther}
                  onCustomTextChange={handleCustomTextChange}
                  onNext={currentQuestionIndex === questions.length - 1 ? handleFinalize : () => setCurrentQuestionIndex((prev) => prev + 1)}
                  onBack={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  isLastQuestion={currentQuestionIndex === questions.length - 1}
                />
              )}

              {step === 'ANALYSIS' && <AnalysisStep />}
            </AnimatePresence>
          </div>
        </div>
      )}

      {isReportStep && report && (
        <ReportStep
          report={report}
          reportId={reportId}
          exporting={exporting}
          copiedSection={copiedSection}
          onExportPDF={handleExportPDF}
          onCopyToClipboard={copyToClipboard}
          onReset={handleReset}
        />
      )}
    </main>
  );
}

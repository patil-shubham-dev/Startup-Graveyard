'use client';

// Pre-mortem wizard is client-side only

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Animated SVG: failure vectors radiating from a central node
function FailureVectorDiagram() {
  const vectors = [
    { angle: 0, label: 'PMF' },
    { angle: 45, label: 'CASH' },
    { angle: 90, label: 'TEAM' },
    { angle: 135, label: 'MARKET' },
    { angle: 180, label: 'SCALE' },
    { angle: 225, label: 'LEGAL' },
    { angle: 270, label: 'PIVOT' },
    { angle: 315, label: 'TRUST' },
  ];

  return (
    <svg
      viewBox="0 0 300 300"
      style={{ width: '100%', maxWidth: '240px', opacity: 0.6 }}
      aria-hidden="true"
    >
      {/* Dashed circles */}
      {[60, 100, 140].map((r) => (
        <circle
          key={r}
          cx="150"
          cy="150"
          r={r}
          fill="none"
          stroke="rgba(253,250,245,0.12)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}

      {/* Radiating vectors */}
      {vectors.map((v, i) => {
        const rad = (v.angle * Math.PI) / 180;
        const x2 = 150 + Math.cos(rad) * 130;
        const y2 = 150 + Math.sin(rad) * 130;
        const lx = 150 + Math.cos(rad) * 148;
        const ly = 150 + Math.sin(rad) * 148;

        return (
          <g key={v.label}>
            <line
              x1="150"
              y1="150"
              x2={x2}
              y2={y2}
              stroke="rgba(181,74,42,0.35)"
              strokeWidth="1"
              strokeDasharray="3 3"
              style={{
                animation: `pulse-opacity 3s ease-in-out infinite`,
                animationDelay: `${i * 0.375}s`,
              }}
            />
            <circle cx={x2} cy={y2} r="3" fill="var(--rust-accent)" opacity="0.5" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '7px',
                fill: 'rgba(253,250,245,0.4)',
                letterSpacing: '0.1em',
              }}
            >
              {v.label}
            </text>
          </g>
        );
      })}

      {/* Center node */}
      <circle cx="150" cy="150" r="18" fill="var(--ink-black)" stroke="var(--rust-accent)" strokeWidth="1.5" />
      <text
        x="150"
        y="150"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: '700',
          fill: 'var(--cream-base)',
        }}
      >
        SG
      </text>

      <style>{`
        @keyframes pulse-opacity {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}

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

  const reportRef = useRef<HTMLDivElement>(null);
  const TOTAL_STEPS = 3;

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

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f0e8',
        logging: false,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page if content is long
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      const dynamicReportId = report?.diagnosticId || `PRM-${reportId}`;
      pdf.save(`startup-graveyard-${dynamicReportId}.pdf`);
      
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const isReportStep = step === 'REPORT';
  const isAnalysisStep = step === 'ANALYSIS';

  return (
    <main
      style={{
        height: isReportStep ? 'auto' : 'calc(100vh - 56px)',
        minHeight: isReportStep ? 'calc(100vh - 56px)' : undefined,
        overflow: isReportStep ? 'auto' : 'hidden',
        display: isReportStep ? 'block' : 'flex',
        backgroundColor: 'var(--cream-base)',
      }}
    >
      {/* Sidebar Hint for Steps 1 and 2 */}
      {!isReportStep && !isAnalysisStep && (
        <div className="premortem-left-panel hidden lg:flex shrink-0 select-none">
          <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#b5541c',
                  marginBottom: '16px',
                }}
              >
                — FORENSIC ENGINE
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#9a9080',
                  lineHeight: '1.7',
                }}
              >
                Stress-test your business model against historical failure database patterns.
              </p>
            </div>

            {/* 1px rust divider */}
            <div style={{ height: '1px', backgroundColor: '#b5541c', width: '100%' }} />

            {/* SVG Diagram - scaled to fit left panel, centered, 280px max */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FailureVectorDiagram />
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: '#b5541c',
              textTransform: 'uppercase',
            }}
          >
            ENGINE // ACTIVE
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!isReportStep && (
        <div className="premortem-right-panel">
          {/* Form Container (Full Width, Centered, Max-Width: 720px) */}
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '80%',
            }}
          >
            {/* Step progress bar */}
            {step !== 'ANALYSIS' && (
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  marginBottom: '40px',
                  borderBottom: '1px solid #d4c9b8',
                  paddingBottom: '8px',
                  width: '100%',
                }}
              >
                {['STEP_01', 'STEP_02', 'STEP_03'].map((label, i) => {
                  const stepNum = i + 1;
                  const isActive = stepNum === currentStep;
                  return (
                    <div
                      key={label}
                      style={{
                        fontFamily: 'var(--font-subhead)',
                        fontSize: '11px',
                        fontWeight: isActive ? 500 : 400,
                        letterSpacing: '0.12em',
                        color: isActive ? '#b5541c' : '#8a8070',
                        paddingBottom: '8px',
                        position: 'relative',
                        marginBottom: '-10px',
                        borderBottom: isActive ? '2px solid #b5541c' : '2px solid transparent',
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Steps Content */}
            <div style={{ width: '100%' }}>
              <AnimatePresence mode="wait">
                {step === 'PITCH' && (
                  <motion.div
                    key="pitch"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
                  >
                    <div>
                      {/* FORENSIC DIAGNOSTIC ENGINE small mono label */}
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: '#8a8070',
                          marginBottom: '12px',
                        }}
                      >
                        — FORENSIC DIAGNOSTIC ENGINE
                      </div>

                      {/* H1 Playfair Display italic */}
                      <h1
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontSize: '56px',
                          lineHeight: '1.15',
                          fontWeight: '400',
                          color: '#1a1a18',
                          margin: '0',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Diagnose your startup before it&apos;s too late.
                      </h1>

                      {/* Stats Row right below H1 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: '#8a8070',
                          marginTop: '16px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        <span>[8 VECTORS]</span>
                        <span style={{ color: '#b5541c' }}>•</span>
                        <span>[&lt; 5 MIN]</span>
                        <span style={{ color: '#b5541c' }}>•</span>
                        <span>[11 CASES]</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div>
                        {/* VENTURE DESCRIPTION Space Mono Label */}
                        <label
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: '#b5541c',
                            display: 'block',
                            marginBottom: '12px',
                          }}
                        >
                          VENTURE DESCRIPTION
                        </label>

                        {/* Textarea */}
                        <textarea
                          className="textarea-step1 sg-textarea"
                          placeholder="Most startups commit suicide. We help you identify the weapon before you use it."
                          value={pitch}
                          onChange={(e) => setPitch(e.target.value)}
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '15px',
                            color: '#1a1a18',
                            minHeight: '140px',
                            backgroundColor: '#fdfaf5',
                            border: '1px solid #d4c9b8',
                            padding: '16px',
                            borderRadius: '0',
                            width: '100%',
                            resize: 'none',
                            outline: 'none',
                            lineHeight: '1.6',
                            transition: 'border-color 0.2s ease',
                          }}
                        />
                      </div>

                      {/* Initiate diagnostic button */}
                      <button
                        onClick={handleStartInterrogation}
                        disabled={pitch.length < 20 || isGenerating}
                        className="btn-rust"
                        style={{
                          opacity: pitch.length < 20 || isGenerating ? 0.4 : 1,
                          cursor: pitch.length < 20 || isGenerating ? 'not-allowed' : 'pointer',
                          width: '100%',
                          height: '52px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 24px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          fontWeight: '500',
                          letterSpacing: '0.12em',
                          backgroundColor: '#b5541c',
                          color: '#fdfaf5',
                          borderRadius: '0',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isGenerating ? 'ANALYZING...' : 'INITIATE DIAGNOSTIC →'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'QUESTIONS' && questions.length > 0 && (
                  (() => {
                    const q = questions[currentQuestionIndex];
                    const selected = selectedOptions[q.id];
                    const isCurrentQuestionAnswered = selected !== undefined && selected !== null && (selected !== 'other' || (customAnswers[q.id] || '').trim().length > 0);
                    const isLastQuestion = currentQuestionIndex === questions.length - 1;

                    return (
                      <motion.div
                        key="questions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '32px',
                        }}
                      >
                        {/* Step header */}
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '16px',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-subhead)',
                                fontWeight: 500,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                color: '#b5541c',
                              }}
                            >
                              INTERROGATION
                            </span>
                            <div>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '11px',
                                  letterSpacing: '0.1em',
                                  color: '#8a8070',
                                }}
                              >
                                QUESTION_0{currentQuestionIndex + 1} / 03 {Array.from({ length: 3 }, (_, i) => i <= currentQuestionIndex ? '●' : '○').join('')}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              height: '1px',
                              width: '100%',
                              backgroundColor: '#d4c9b8',
                              marginBottom: '20px',
                            }}
                          />
                        </div>

                        {/* Paginated Animated Container */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentQuestionIndex}
                              initial={{ opacity: 0, x: 40 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -40 }}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                            >
                              <div>
                                {/* Option Header */}
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-subhead)',
                                      fontSize: '11px',
                                      letterSpacing: '0.12em',
                                      color: '#b5541c',
                                      fontWeight: 500,
                                    }}
                                  >
                                    VEC_0{currentQuestionIndex + 1}
                                  </span>
                                </div>

                                {/* Question text */}
                                <h3
                                  style={{
                                    fontFamily: 'var(--font-display)',
                                    fontStyle: 'italic',
                                    fontSize: '28px',
                                    lineHeight: '1.3',
                                    color: '#1a1a18',
                                    marginBottom: '24px',
                                  }}
                                >
                                  {q.text}
                                </h3>

                                {/* 2x2 Option Grid */}
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                    marginBottom: '24px',
                                  }}
                                >
                                  {q.options && q.options.map((option, idx) => {
                                    const isSelected = selectedOptions[q.id] === String(idx);
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => handleSelectOption(q.id, String(idx), option)}
                                        style={{
                                          padding: '16px',
                                          fontSize: '14px',
                                          fontFamily: 'var(--font-body)',
                                          fontWeight: '400',
                                          textAlign: 'left',
                                          backgroundColor: '#fdfaf5',
                                          border: isSelected ? '2px solid #b5541c' : '1px solid #d4c9b8',
                                          color: '#1a1a18',
                                          borderRadius: '0',
                                          cursor: 'pointer',
                                          transition: 'all 150ms ease',
                                          minHeight: '100px',
                                          lineHeight: '1.45',
                                          position: 'relative',
                                        }}
                                        className="mcq-option-btn hover:scale-[1.01] hover:border-[#b5541c]"
                                      >
                                        {cleanOptionText(option)}
                                        
                                        {/* Selection corner dot */}
                                        {isSelected && (
                                          <span
                                            style={{
                                              position: 'absolute',
                                              top: '12px',
                                              right: '12px',
                                              color: '#b5541c',
                                              fontSize: '14px',
                                              lineHeight: '1',
                                            }}
                                          >
                                            ●
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}

                                  {/* Other Button */}
                                  {selected === 'other' ? (
                                    <div
                                      style={{
                                        minHeight: '100px',
                                        border: '2px solid #b5541c',
                                        backgroundColor: '#fdfaf5',
                                        borderRadius: '0',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      {/* Corner Dot for selection */}
                                      <span
                                        style={{
                                          position: 'absolute',
                                          top: '12px',
                                          right: '12px',
                                          color: '#b5541c',
                                          fontSize: '14px',
                                          lineHeight: '1',
                                        }}
                                      >
                                        ●
                                      </span>
                                      
                                      <textarea
                                        placeholder="Describe alternative failure vectors..."
                                        value={customAnswers[q.id] || ''}
                                        onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                                        autoFocus
                                        style={{
                                          width: '100%',
                                          backgroundColor: 'transparent',
                                          border: 'none',
                                          outline: 'none',
                                          color: '#1a1a18',
                                          fontFamily: 'var(--font-body)',
                                          fontSize: '14px',
                                          resize: 'none',
                                          minHeight: '50px',
                                          lineHeight: '1.5',
                                          padding: '0',
                                        }}
                                      />
                                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOptions((prev) => {
                                              const u = { ...prev };
                                              delete u[q.id];
                                              return u;
                                            });
                                            setAnswers((prev) => {
                                              const u = { ...prev };
                                              delete u[q.id];
                                              return u;
                                            });
                                          }}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#b5541c',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-mono)',
                                            letterSpacing: '0.05em',
                                            padding: '0',
                                          }}
                                        >
                                          RESET
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleSelectOther(q.id)}
                                      style={{
                                        padding: '16px',
                                        fontSize: '14px',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: '400',
                                        textAlign: 'left',
                                        backgroundColor: '#fdfaf5',
                                        border: '1px solid #d4c9b8',
                                        color: '#1a1a18',
                                        borderRadius: '0',
                                        cursor: 'pointer',
                                        transition: 'all 150ms ease',
                                        minHeight: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        position: 'relative',
                                      }}
                                      className="mcq-option-btn hover:scale-[1.01] hover:border-[#b5541c]"
                                    >
                                      <span style={{ fontSize: '16px' }}>✏️</span>
                                      <span style={{ fontWeight: '500' }}>Other</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Pagination controls */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  paddingTop: '20px',
                                  borderTop: '1px solid #d4c9b8',
                                }}
                              >
                                {currentQuestionIndex > 0 ? (
                                  <button
                                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#8a8070',
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      letterSpacing: '0.08em',
                                    }}
                                  >
                                    ← BACK
                                  </button>
                                ) : (
                                  <div />
                                )}

                                <button
                                  onClick={isLastQuestion ? handleFinalize : () => setCurrentQuestionIndex((prev) => prev + 1)}
                                  disabled={!isCurrentQuestionAnswered}
                                  className="btn-rust"
                                  style={{
                                    height: '52px',
                                    padding: '0 28px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    letterSpacing: '0.12em',
                                    backgroundColor: '#b5541c',
                                    color: '#fdfaf5',
                                    borderRadius: '0',
                                    opacity: isCurrentQuestionAnswered ? 1 : 0.4,
                                    cursor: isCurrentQuestionAnswered ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {isLastQuestion ? 'GENERATE REPORT →' : 'NEXT →'}
                                </button>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })()
                )}

                {step === 'ANALYSIS' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '400px',
                      gap: '32px',
                      textAlign: 'center',
                    }}
                  >
                    {/* Spinning ring */}
                    <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          border: '2px dashed var(--cream-dark)',
                          borderRadius: '50%',
                          animation: 'spin-slow 8s linear infinite',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: '12px',
                          border: '1px solid var(--rust-accent)',
                          borderRadius: '50%',
                          opacity: 0.4,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: 'var(--ink-black)',
                          }}
                        >
                          SG
                        </span>
                      </div>
                    </div>

                    <div>
                      <h2
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '28px',
                          fontWeight: '700',
                          fontStyle: 'italic',
                          color: 'var(--ink-black)',
                          marginBottom: '12px',
                        }}
                      >
                        Compiling Verdict
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['SCANNING_VECTORS', 'MAPPING_RISK_COEFFICIENTS'].map((t) => (
                          <div
                            key={t}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                            }}
                          >
                            <span
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--rust-accent)',
                                display: 'inline-block',
                                animation: 'pulse 1s ease-in-out infinite',
                              }}
                            />
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--ink-muted)',
                              }}
                            >
                              {t}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 COMPLETE REDESIGN — FULL WIDTH REPORT */}
      {isReportStep && report && (
        <div style={{ backgroundColor: 'var(--cream-base)', width: '100%', minHeight: '100vh' }}>
          
          {/* SECTION 1 — REPORT HEADER (sticky top bar) */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 50,
              backgroundColor: '#1a1a1a',
              color: 'var(--cream-base)',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(253,250,245,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '860px',
                margin: '0 auto',
                width: '100%',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em' }}>
                VERDICT_REPORT // CONFIDENTIAL 
                <span style={{ color: 'var(--ink-muted)', marginLeft: '12px' }}>
                  #PRM-{report.diagnosticId || reportId}
                </span>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cream-base)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: '700',
                  opacity: 0.8,
                }}
                title="New Scan"
              >
                [X]
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '12px',
                maxWidth: '860px',
                margin: '12px auto 0 auto',
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              <span style={{ color: 'var(--rust-accent)', fontWeight: 'bold' }}>
                Risk: {report.risk_score}%
              </span>
              
              {/* Visual progress bar */}
              <div style={{ display: 'flex', gap: '2px', color: 'var(--rust-accent)', fontSize: '14px' }}>
                {"█".repeat(Math.round(report.risk_score / 10))}
                <span style={{ opacity: 0.2 }}>
                  {"░".repeat(10 - Math.round(report.risk_score / 10))}
                </span>
              </div>

              <span style={{ color: 'var(--cream-base)', opacity: 0.6, marginLeft: 'auto' }}>
                PROBABILITY: {report.risk_score > 70 ? 'HIGH' : report.risk_score > 40 ? 'MEDIUM' : 'LOW'}
              </span>
            </div>
          </div>

          {/* SECTION 2 — FORENSIC VERDICT (full width, cream bg) */}
          <div
            ref={reportRef}
            id="report-content"
            style={{
              backgroundColor: '#f5f0e8',
              padding: '48px 24px',
              width: '100%',
            }}
          >
            <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Card 1 — EXECUTIVE SUMMARY */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  padding: '32px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 12px rgba(26,23,20,0.03)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-subhead)',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    color: 'var(--rust-accent)',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                  }}
                >
                  // EXECUTIVE SUMMARY
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: '22px',
                    lineHeight: '1.4',
                    color: 'var(--ink-black)',
                    margin: 0,
                  }}
                >
                  &quot;{report.verdict}&quot;
                </p>
              </div>

              {/* Card 2 — PRIMARY RISK VECTORS */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  padding: '32px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 12px rgba(26,23,20,0.03)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-subhead)',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    color: 'var(--rust-accent)',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                  }}
                >
                  // PRIMARY RISK VECTORS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {report.primary_risks.map((risk: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        borderBottom: i < report.primary_risks.length - 1 ? '1px solid var(--cream-dark)' : 'none',
                        paddingBottom: i < report.primary_risks.length - 1 ? '24px' : '0',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-subhead)',
                          fontWeight: 500,
                          fontSize: '10px',
                          letterSpacing: '0.15em',
                          color: 'var(--rust-accent)',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        VECTOR_0{i + 1} // {risk.category}
                      </div>
                      <h4
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '20px',
                          fontWeight: '700',
                          fontStyle: 'italic',
                          color: 'var(--ink-black)',
                          marginBottom: '8px',
                        }}
                      >
                        {risk.description}
                      </h4>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: 'var(--ink-muted)',
                          margin: 0,
                        }}
                      >
                        <span style={{ fontWeight: '600', color: 'var(--ink-soft)', display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                          MITIGATION:
                        </span>
                        {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3 — FAILURE SCENARIOS */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  padding: '32px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 12px rgba(26,23,20,0.03)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-subhead)',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    color: 'var(--rust-accent)',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                  }}
                >
                  // WHERE THIS FAILS
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {(report.failure_scenarios || []).map((scenario: any, i: number) => {
                    const probColor = 
                      scenario.probability === 'LIKELY' ? 'var(--rust-accent)' : 
                      scenario.probability === 'POSSIBLE' ? 'var(--ochre-signal)' : 
                      'var(--sage-neutral)';
                    
                    return (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--cream-base)',
                          border: '1px solid var(--cream-dark)',
                          borderRadius: '4px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-subhead)',
                              fontWeight: 500,
                              fontSize: '10px',
                              letterSpacing: '0.1em',
                              color: 'var(--rust-accent)',
                              marginBottom: '6px',
                            }}
                          >
                            SCENARIO_0{i + 1}
                          </div>
                          <h5
                            style={{
                              fontFamily: 'var(--font-subhead)',
                              fontWeight: 500,
                              fontSize: '15px',
                              color: 'var(--ink-black)',
                              marginBottom: '8px',
                              lineHeight: '1.4',
                            }}
                          >
                            {scenario.title}
                          </h5>
                          <p
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              lineHeight: '1.5',
                              color: 'var(--ink-muted)',
                              margin: 0,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {scenario.description}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              fontWeight: '600',
                              letterSpacing: '0.05em',
                              color: probColor,
                              border: `1px solid ${probColor}`,
                              padding: '2px 8px',
                              borderRadius: '2px',
                              backgroundColor: `${probColor}08`,
                            }}
                          >
                            {scenario.probability}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4 — HISTORICAL PARALLELS */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  padding: '32px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 12px rgba(26,23,20,0.03)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-subhead)',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    color: 'var(--rust-accent)',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                  }}
                >
                  // COMPANIES THAT DIED THE SAME WAY
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {(report.historical_cases || []).map((company: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: 'var(--cream-base)',
                        border: '1px solid var(--cream-dark)',
                        borderRadius: '2px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <h5
                          style={{
                            fontFamily: 'var(--font-subhead)',
                            fontWeight: 500,
                            fontSize: '16px',
                            color: 'var(--ink-black)',
                            marginBottom: '4px',
                          }}
                        >
                          {company.name}
                        </h5>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: 'var(--ink-muted)',
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '12px',
                          }}
                        >
                          <span>Founded: {company.founded}</span>
                          <span>•</span>
                          <span>Died: {company.died}</span>
                        </div>
                        <div
                          style={{
                            borderTop: '1px dashed var(--cream-dark)',
                            paddingTop: '12px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            color: 'var(--ink-soft)',
                          }}
                        >
                          {company.correlation}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            textTransform: 'uppercase',
                            color: 'var(--rust-accent)',
                            backgroundColor: 'rgba(181, 74, 42, 0.08)',
                            border: '1px solid rgba(181, 74, 42, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '1px',
                          }}
                        >
                          CAUSE: {company.cause_category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5 — COMPETITOR LANDSCAPE */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  padding: '32px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 12px rgba(26,23,20,0.03)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-subhead)',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    color: 'var(--rust-accent)',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                  }}
                >
                  // COMPETITIVE THREATS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(report.competitors || []).map((comp: any, i: number) => {
                    const levelColor = 
                      comp.threat_level === 'HIGH' ? 'var(--rust-accent)' : 
                      comp.threat_level === 'MEDIUM' ? 'var(--ochre-signal)' : 
                      'var(--sage-neutral)';
                    
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '24px',
                          padding: '16px',
                          backgroundColor: 'var(--cream-base)',
                          border: '1px solid var(--cream-dark)',
                          borderRadius: '2px',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-subhead)',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--ink-black)',
                              display: 'block',
                              marginBottom: '2px',
                            }}
                          >
                            {comp.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              color: 'var(--ink-muted)',
                              lineHeight: '1.4',
                            }}
                          >
                            {comp.threat_reason}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            fontWeight: '600',
                            letterSpacing: '0.05em',
                            color: levelColor,
                            border: `1px solid ${levelColor}`,
                            padding: '2px 8px',
                            borderRadius: '2px',
                            backgroundColor: `${levelColor}08`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {comp.threat_level} THREAT
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 6 — SURVIVAL PROBABILITY BREAKDOWN */}
              <div
                style={{
                  backgroundColor: 'var(--paper-white)',
                  border: '1px solid var(--cream-dark)',
                  padding: '32px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 12px rgba(26,23,20,0.03)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-subhead)',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    color: 'var(--rust-accent)',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                  }}
                >
                  // SURVIVAL PROBABILITY BREAKDOWN
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {report.risk_breakdown && [
                    { label: 'Product Risk', value: report.risk_breakdown.product },
                    { label: 'Market Risk', value: report.risk_breakdown.market },
                    { label: 'Team Risk', value: report.risk_breakdown.team },
                    { label: 'Financial Risk', value: report.risk_breakdown.financial },
                  ].map((item, i) => {
                    const filledBlocks = Math.round(item.value / 10);
                    const emptyBlocks = 10 - filledBlocks;
                    
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontFamily: 'var(--font-subhead)',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: 'var(--ink-black)',
                          }}
                        >
                          <span>{item.label}</span>
                          <span style={{ fontWeight: '600' }}>{item.value}%</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Text-based blocks */}
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--rust-accent)', letterSpacing: '2px' }}>
                            {"█".repeat(filledBlocks)}
                            <span style={{ opacity: 0.15 }}>
                              {"░".repeat(emptyBlocks)}
                            </span>
                          </div>
                          
                          {/* Smooth micro fill bar */}
                          <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--cream-base)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.value}%`, backgroundColor: 'var(--rust-accent)' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3 — ACTION BAR (sticky bottom) */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 50,
              backgroundColor: '#1a1a1a',
              color: 'var(--cream-base)',
              padding: '16px 24px',
              borderTop: '1px solid rgba(253,250,245,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '860px',
                margin: '0 auto',
                width: '100%',
              }}
            >
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: '1px solid rgba(253,250,245,0.3)',
                  color: 'var(--cream-base)',
                  padding: '10px 20px',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                }}
              >
                ← NEW SCAN
              </button>
              
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                style={{
                  backgroundColor: 'var(--rust-accent)',
                  color: 'var(--cream-base)',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  opacity: exporting ? 0.6 : 1,
                }}
              >
                {exporting ? 'GENERATING...' : '⬇ EXPORT PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

// Pre-mortem wizard is client-side only

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremortemReport } from '@/lib/db/premortem';

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
      style={{ width: '100%', maxWidth: '280px', opacity: 0.6 }}
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
                fontFamily: "'Space Mono', monospace",
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
          fontFamily: "'Cormorant Garamond', serif",
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
  const [report, setReport] = useState<PremortemReport | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

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

  return (
    <main
      style={{
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
        display: 'grid',
      }}
      className="lg:grid-cols-2"
    >
      {/* LEFT PANEL — Dark / Decorative */}
      <div
        style={{
          backgroundColor: 'var(--ink-black)',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '24px',
          height: '100%',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        <div>
          {/* Kicker */}
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--rust-accent)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '1px',
                backgroundColor: 'var(--rust-accent)',
                display: 'inline-block',
              }}
            />
            FORENSIC DIAGNOSTIC ENGINE
          </div>

          {/* Headline */}
          <h1
            className="t-pullquote"
            style={{
              color: 'var(--cream-base)',
              maxWidth: '16ch',
              marginBottom: '12px',
              fontSize: '24px',
              lineHeight: 1.2,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
            }}
          >
            Diagnose your startup before it&apos;s too late.
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: '400',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--ink-muted)',
              maxWidth: '36ch',
            }}
          >
            Most ventures fail for predictable reasons. Our AI engine maps your venture
            against the archive of known failure vectors and surfaces the risks before
            they become fatal.
          </p>
        </div>

        {/* SVG diagram */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <FailureVectorDiagram />
        </div>

        {/* Bottom stats */}
        <div
          style={{
            borderTop: '1px solid rgba(217,207,192,0.12)',
            paddingTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          {[
            { value: '8 VECTORS', label: 'FAILURE CATEGORIES' },
            { value: '< 5 MIN', label: 'TO COMPLETE' },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--cream-base)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                <span className="t-num">{s.value}</span>
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-muted)',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Form wizard */}
      <div
        style={{
          backgroundColor: 'var(--cream-base)',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Step indicators */}
        {step !== 'ANALYSIS' && step !== 'REPORT' && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                marginBottom: '8px',
              }}
            >
              {['STEP_01', 'STEP_02', 'STEP_03'].map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === currentStep;
                const isDone = stepNum < currentStep;
                return (
                  <div
                    key={label}
                    style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  >
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: isActive
                          ? 'var(--rust-accent)'
                          : isDone
                          ? 'var(--sage-neutral)'
                          : 'var(--ink-muted)',
                        fontWeight: isActive ? '500' : '400',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label.split('_')[0]}_<span className="t-num">{label.split('_')[1]}</span>
                    </span>
                    {i < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: '1px',
                          margin: '0 8px',
                          borderTop: '1.5px dashed var(--cream-dark)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {step === 'PITCH' && (
              <motion.div
                key="pitch"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      color: 'var(--rust-accent)',
                      marginBottom: '8px',
                    }}
                  >
                    THE_PITCH
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: '28px',
                      margin: '0 0 6px 0',
                      color: 'var(--ink-black)',
                    }}
                  >
                    Describe your venture.
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: '400',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'var(--ink-muted)',
                      fontStyle: 'italic',
                      margin: 0,
                    }}
                  >
                    &quot;Most startups commit suicide. We help you identify the weapon before you use it.&quot;
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                  <div>
                    <label
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: 'var(--ink-muted)',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      VENTURE DESCRIPTION
                    </label>
                    <textarea
                      className="sg-textarea"
                      placeholder="Describe your venture's core value proposition, target market, and execution strategy..."
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        height: '140px',
                        resize: 'none',
                      }}
                    />
                  </div>

                  <button
                    onClick={handleStartInterrogation}
                    disabled={pitch.length < 20 || isGenerating}
                    className="btn-rust"
                    style={{
                      opacity: pitch.length < 20 || isGenerating ? 0.4 : 1,
                      justifyContent: 'center',
                      padding: '12px 24px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '13px',
                      fontWeight: '500',
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
                    }}
                  >
                    {/* Step header / progress dot tracker */}
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
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 500,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            color: 'var(--rust-accent)',
                          }}
                        >
                          INTERROGATION
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '11px',
                              letterSpacing: '0.1em',
                              color: 'var(--ink-muted)',
                            }}
                          >
                            QUESTION_0{currentQuestionIndex + 1} / 03
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[0, 1, 2].map((idx) => (
                              <span
                                key={idx}
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: idx === currentQuestionIndex ? 'var(--rust-accent)' : 'var(--cream-dark)',
                                  transition: 'background-color 0.2s ease',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          height: '1px',
                          width: '100%',
                          backgroundColor: 'var(--cream-dark)',
                          marginBottom: '20px',
                        }}
                      />
                    </div>

                    {/* Paginated Animated Container */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
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
                                  fontFamily: "'Space Mono', monospace",
                                  fontSize: '11px',
                                  letterSpacing: '0.15em',
                                  color: 'var(--rust-accent)',
                                }}
                              >
                                VEC_0{currentQuestionIndex + 1}
                              </span>
                              <span
                                style={{
                                  fontFamily: "'Space Mono', monospace",
                                  fontSize: '11px',
                                  color: 'var(--ink-muted)',
                                }}
                              >
                                Q {currentQuestionIndex + 1} of 3
                              </span>
                            </div>

                            {/* Question text clamped */}
                            <h3
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontStyle: 'italic',
                                fontSize: '20px',
                                lineHeight: '1.35',
                                color: 'var(--ink-black)',
                                marginBottom: '20px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '54px',
                              }}
                            >
                              {q.text}
                            </h3>

                            {/* 2x2 Option Grid */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '20px',
                              }}
                            >
                              {q.options && q.options.map((option, idx) => {
                                const isSelected = selectedOptions[q.id] === String(idx);
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleSelectOption(q.id, String(idx), option)}
                                    style={{
                                      padding: '12px 16px',
                                      fontSize: '13px',
                                      fontFamily: "'Inter', sans-serif",
                                      fontWeight: '400',
                                      textAlign: 'left',
                                      backgroundColor: isSelected ? 'rgba(181, 74, 42, 0.08)' : 'var(--paper-white)',
                                      border: isSelected ? '1.5px solid var(--rust-accent)' : '1px solid var(--cream-dark)',
                                      color: 'var(--ink-black)',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      transition: 'all 150ms ease',
                                      height: '80px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                    className="mcq-option-btn"
                                  >
                                    {option}
                                  </button>
                                );
                              })}

                              {/* Other Button - replacing inline */}
                              {selected === 'other' ? (
                                <div
                                  style={{
                                    height: '80px',
                                    border: '1.5px solid var(--rust-accent)',
                                    backgroundColor: 'rgba(181, 74, 42, 0.08)',
                                    borderRadius: '4px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <input
                                    type="text"
                                    placeholder="Type custom answer..."
                                    value={customAnswers[q.id] || ''}
                                    onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                                    autoFocus
                                    style={{
                                      width: '100%',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      borderBottom: '1px solid var(--rust-accent)',
                                      color: 'var(--ink-black)',
                                      fontFamily: "'Inter', sans-serif",
                                      fontSize: '13px',
                                      outline: 'none',
                                      padding: '4px 0',
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
                                        color: 'var(--rust-accent)',
                                        fontSize: '9px',
                                        cursor: 'pointer',
                                        fontFamily: "'Space Mono', monospace",
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
                                    padding: '12px 16px',
                                    fontSize: '13px',
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: '400',
                                    textAlign: 'left',
                                    backgroundColor: 'var(--paper-white)',
                                    border: '1px solid var(--cream-dark)',
                                    color: 'var(--ink-black)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 150ms ease',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                  }}
                                  className="mcq-option-btn"
                                >
                                  <span>✏️</span>
                                  <span style={{ fontWeight: '500' }}>Other</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Pagination controls inside */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: 'auto',
                              paddingTop: '16px',
                            }}
                          >
                            {currentQuestionIndex > 0 ? (
                              <button
                                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--ink-muted)',
                                  fontFamily: "'Space Mono', monospace",
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
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
                                padding: '12px 24px',
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '13px',
                                fontWeight: '500',
                                opacity: isCurrentQuestionAnswered ? 1 : 0.4,
                                cursor: isCurrentQuestionAnswered ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {isLastQuestion ? 'GENERATE REPORT →' : 'NEXT →'}
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <style>{`
                      .mcq-option-btn:hover {
                        transform: scale(1.02) !important;
                        border-color: var(--rust-accent) !important;
                      }
                    `}</style>
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
                  gap: '24px',
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
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--ink-black)',
                      }}
                    >
                      SG
                    </span>
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '28px',
                    fontWeight: '700',
                    fontStyle: 'italic',
                    color: 'var(--ink-black)',
                  }}
                >
                  Compiling Verdict
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                          fontFamily: "'Space Mono', monospace",
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
              </motion.div>
            )}

            {step === 'REPORT' && report && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Header (fixed) */}
                <div
                  style={{
                    borderLeft: '3px solid var(--rust-accent)',
                    paddingLeft: '16px',
                    marginBottom: '2px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--rust-accent)',
                      marginBottom: '2px',
                    }}
                  >
                    VERDICT_REPORT {'//'} CONFIDENTIAL
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--ink-muted)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    #PRM-<span className="t-num">{reportId}</span>
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: '24px',
                    margin: '0 0 4px 0',
                    color: 'var(--ink-black)',
                  }}
                >
                  Forensic Verdict
                </h2>

                {/* Risk Score Card (fixed) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--cream-deep)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '2px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        color: 'var(--ink-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      RISK_SCORE
                    </div>
                    <div className="t-num" style={{ fontSize: '32px', fontWeight: '600', color: 'var(--rust-accent)', lineHeight: 1 }}>
                      {report.risk_score}%
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        color: 'var(--ink-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      PROBABILITY
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: '22px',
                        fontWeight: '700',
                        color: 'var(--ochre-signal)',
                        lineHeight: 1.2,
                      }}
                    >
                      {report.risk_score > 70 ? 'HIGH' : report.risk_score > 40 ? 'MEDIUM' : 'LOW'}
                    </div>
                  </div>
                </div>

                {/* Executive Summary Card (fixed) */}
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--paper-white)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '2px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      color: 'var(--ink-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    EXECUTIVE_SUMMARY
                  </div>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: '400',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: 'var(--ink-black)',
                      fontStyle: 'italic',
                      margin: 0,
                      display: isSummaryExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isSummaryExpanded ? undefined : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    &quot;{report.verdict}&quot;
                  </p>
                  {report.verdict.length > 120 && (
                    <button
                      onClick={() => setIsSummaryExpanded((prev) => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--rust-accent)',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '4px',
                        display: 'block',
                      }}
                    >
                      {isSummaryExpanded ? 'READ LESS' : 'READ MORE'}
                    </button>
                  )}
                </div>

                {/* Scrollable Risk Vectors Box */}
                <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      maxHeight: 'calc(100vh - 380px)',
                      paddingRight: '6px',
                    }}
                    className="custom-scrollbar"
                  >
                    {report.primary_risks.map((risk: { category: string; description: string; mitigation: string }, i: number) => (
                      <div
                        key={i}
                        style={{
                          padding: '12px 16px',
                          backgroundColor: 'var(--cream-deep)',
                          border: '1px solid var(--cream-dark)',
                          borderLeft: '3px solid var(--rust-accent)',
                          borderRadius: '2px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            color: 'var(--rust-accent)',
                            marginBottom: '4px',
                          }}
                        >
                          VECTOR_0{i + 1} {'//'} {risk.category}
                        </div>
                        <h4
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--ink-black)',
                            marginBottom: '8px',
                          }}
                        >
                          {risk.description}
                        </h4>
                        <div style={{ borderTop: '1px dashed var(--cream-dark)', paddingTop: '8px' }}>
                          <div
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '9px',
                              letterSpacing: '0.1em',
                              color: 'var(--ink-muted)',
                              marginBottom: '4px',
                            }}
                          >
                            MITIGATION
                          </div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: '400',
                              fontSize: '12px',
                              lineHeight: 1.5,
                              color: 'var(--ink-muted)',
                              margin: 0,
                            }}
                          >
                            {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Gradient Fade Overlay at bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '24px',
                      background: 'linear-gradient(to top, var(--cream-base), transparent)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Fixed Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--cream-dark)',
                    backgroundColor: 'var(--cream-base)',
                  }}
                >
                  <button
                    onClick={() => {
                      setStep('PITCH');
                      setCurrentStep(1);
                      setPitch('');
                      setAnswers({});
                      setSelectedOptions({});
                      setCustomAnswers({});
                      setReport(null);
                      setCurrentQuestionIndex(0);
                    }}
                    className="btn-rust"
                    style={{
                      padding: '12px 24px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    NEW SCAN →
                  </button>
                  <button
                    className="btn-outline-ink"
                    style={{
                      padding: '12px 24px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    EXPORT PDF
                  </button>
                </div>

                <style>{`
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(26,23,20,0.05);
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--rust-accent);
                    border-radius: 1px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9f3d22;
                  }
                `}</style>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

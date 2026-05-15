'use client';

// Pre-mortem wizard is client-side only

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremortemReport } from '@/lib/db/premortem';

type Step = 'PITCH' | 'QUESTIONS' | 'ANALYSIS' | 'REPORT';

interface Question {
  id: string;
  text: string;
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
      style={{ width: '100%', maxWidth: '320px', opacity: 0.6 }}
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
                fontFamily: 'var(--font-dm-mono), monospace',
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
          fontFamily: 'var(--font-cormorant), Georgia, serif',
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
  const [report, setReport] = useState<PremortemReport | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId] = useState(() => Math.floor(Math.random() * 9000) + 1000);

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

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'grid',
      }}
      className="lg:grid-cols-2"
    >
      {/* LEFT PANEL — Dark / Decorative */}
      <div
        style={{
          backgroundColor: 'var(--ink-black)',
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '48px',
          minHeight: '400px',
        }}
        className="hidden lg:flex"
      >
        <div>
          {/* Kicker */}
          <div
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--rust-accent)',
              marginBottom: '24px',
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
              marginBottom: '20px',
            }}
          >
            Diagnose your startup before it&apos;s too late.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-source-serif), Georgia, serif',
              fontSize: '15px',
              lineHeight: 1.75,
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FailureVectorDiagram />
        </div>

        {/* Bottom stats */}
        <div
          style={{
            borderTop: '1px solid rgba(217,207,192,0.12)',
            paddingTop: '24px',
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
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '24px',
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
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
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
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Step indicators */}
        {step !== 'ANALYSIS' && step !== 'REPORT' && (
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                marginBottom: '16px',
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
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
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
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {step === 'PITCH' && (
              <motion.div
                key="pitch"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--rust-accent)',
                    marginBottom: '12px',
                  }}
                >
                  THE_PITCH
                </div>
                <h2
                  className="t-h2"
                  style={{ marginBottom: '8px' }}
                >
                  Describe your venture.
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-source-serif), Georgia, serif',
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'var(--ink-muted)',
                    fontStyle: 'italic',
                    marginBottom: '32px',
                  }}
                >
                  &quot;Most startups commit suicide. We help you identify the weapon before you use it.&quot;
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
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
                      rows={7}
                    />
                  </div>

                  <button
                    onClick={handleStartInterrogation}
                    disabled={pitch.length < 20 || isGenerating}
                    className="btn-rust"
                    style={{
                      opacity: pitch.length < 20 || isGenerating ? 0.4 : 1,
                      justifyContent: 'center',
                      padding: '16px 32px',
                    }}
                  >
                    {isGenerating ? 'ANALYZING...' : 'INITIATE DIAGNOSTIC →'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'QUESTIONS' && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28 }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--rust-accent)',
                    marginBottom: '12px',
                  }}
                >
                  INTERROGATION
                </div>
                <h2 className="t-h2" style={{ marginBottom: '36px' }}>
                  Forensic questions.
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                  {questions.map((q, i) => (
                    <div key={q.id}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '12px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-dm-mono), monospace',
                            fontSize: '9px',
                            color: 'var(--rust-accent)',
                            flexShrink: 0,
                          }}
                        >
                          VEC_<span className="t-num">0{i + 1}</span>
                        </span>
                        <div style={{ flex: 1, height: '1px', borderTop: '1px dashed var(--cream-dark)' }} />
                      </div>
                      <label
                        style={{
                          fontFamily: 'var(--font-cormorant), Georgia, serif',
                          fontSize: '20px',
                          fontWeight: '600',
                          color: 'var(--ink-black)',
                          lineHeight: 1.2,
                          display: 'block',
                          marginBottom: '12px',
                        }}
                      >
                        {q.text}
                      </label>
                      <textarea
                        className="sg-textarea"
                        placeholder="Input forensic detail..."
                        rows={3}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFinalize}
                  className="btn-rust"
                  style={{ marginTop: '40px', justifyContent: 'center', padding: '16px 32px', width: '100%' }}
                >
                  GENERATE REPORT →
                </button>
              </motion.div>
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
                        fontFamily: 'var(--font-cormorant), Georgia, serif',
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
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
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
                          fontFamily: 'var(--font-dm-mono), monospace',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
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
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                {/* Header */}
                <div
                  style={{
                    borderLeft: '3px solid var(--rust-accent)',
                    paddingLeft: '16px',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: 'var(--rust-accent)',
                      marginBottom: '4px',
                    }}
                  >
                    VERDICT_REPORT {'//'} CONFIDENTIAL
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '9px',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    #PRM-<span className="t-num">{reportId}</span>
                  </div>
                </div>

                <h2 className="t-h2">Forensic Verdict</h2>

                {/* Risk score */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    padding: '20px',
                    backgroundColor: 'var(--cream-deep)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '2px',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-muted)', marginBottom: '6px' }}>
                      RISK_SCORE
                    </div>
                    <div className="t-num" style={{ fontSize: '40px', fontWeight: '600', color: 'var(--rust-accent)', lineHeight: 1 }}>
                      {report.risk_score}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-muted)', marginBottom: '6px' }}>
                      PROBABILITY
                    </div>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', fontWeight: '700', color: 'var(--ochre-signal)', lineHeight: 1 }}>
                      {report.risk_score > 70 ? 'HIGH' : report.risk_score > 40 ? 'MEDIUM' : 'LOW'}
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div
                  style={{
                    padding: '24px',
                    backgroundColor: 'var(--paper-white)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '2px',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                    EXECUTIVE_SUMMARY
                  </div>
                  <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '16px', lineHeight: 1.75, color: 'var(--ink-black)', fontStyle: 'italic' }}>
                    &quot;{report.verdict}&quot;
                  </p>
                </div>

                {/* Risk vectors */}
                {report.primary_risks.map((risk: { category: string; description: string; mitigation: string }, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '20px',
                      backgroundColor: 'var(--cream-deep)',
                      border: '1px solid var(--cream-dark)',
                      borderLeft: '3px solid var(--rust-accent)',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--rust-accent)', marginBottom: '8px' }}>
                      VECTOR_<span className="t-num">0{i + 1}</span> {'//'} {risk.category}
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', fontWeight: '600', color: 'var(--ink-black)', marginBottom: '12px', fontStyle: 'italic' }}>
                      {risk.description}
                    </h4>
                    <div style={{ borderTop: '1.5px dashed var(--cream-dark)', paddingTop: '12px' }}>
                      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-muted)', marginBottom: '6px' }}>
                        MITIGATION
                      </div>
                      <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '13px', lineHeight: 1.65, color: 'var(--ink-muted)' }}>
                        {risk.mitigation}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setStep('PITCH'); setCurrentStep(1); setPitch(''); setAnswers({}); setReport(null); }}
                    className="btn-rust"
                  >
                    NEW SCAN →
                  </button>
                  <button className="btn-outline-ink">
                    EXPORT PDF
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

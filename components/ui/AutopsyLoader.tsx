'use client';

import { useState, useEffect } from 'react';

interface AutopsyLoaderProps {
  customContext?: string;
}

export const AutopsyLoader = ({ customContext }: AutopsyLoaderProps) => {
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0.0);

  useEffect(() => {
    // 100ms interval for elapsed timer
    const timer = setInterval(() => {
      setElapsed((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);

    // Sequence through the 4 autopsy steps
    const stepTimers = [
      setTimeout(() => setStep(1), 1200), // Step 0 -> 1 after 1.2s
      setTimeout(() => setStep(2), 2600), // Step 1 -> 2 after 2.6s
      setTimeout(() => setStep(3), 4200), // Step 2 -> 3 after 4.2s
    ];

    return () => {
      clearInterval(timer);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  const steps = [
    { label: 'SCANNING VECTOR ARCHIVES & CROSS-CORRELATION GRAPH', detail: 'Locating high-density liquidation nodes...' },
    { label: 'RETRIEVING HISTORICAL RECORDS & SHUTDOWN CHRONOLOGY', detail: 'Parsing founder post-mortems and balance sheets...' },
    { label: 'PERFORMING DIGITAL FAILURE AUTOPSY & RISK SCORING', detail: 'Diagnosing primary and secondary failure vectors...' },
    { label: 'COMPILING AUTOPSY DIAGNOSTIC REPORT & FINAL VERDICT', detail: 'Formatting forensic insights and core lessons...' },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', margin: '12px 0' }}>
      <div style={{ maxWidth: '680px', width: '100%' }}>
        {/* Header label */}
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--rust-accent)',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="animate-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--rust-accent)', borderRadius: '50%' }} />
          GRAVEYARD_AI // AUTOPSY_PROCESSOR // ONLINE
        </div>

        {/* Console Container */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--cream-deep)',
            border: '1.5px dashed var(--cream-dark)',
            borderRadius: '2px',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            color: 'var(--ink-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(26, 23, 20, 0.04)',
          }}
        >
          {/* Diagnostic Metadata Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--cream-dark)',
              paddingBottom: '8px',
              fontSize: '9px',
              color: 'var(--ink-muted)',
              letterSpacing: '0.05em',
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>DOCKET: SG-{new Date().getFullYear()}-INTEL</span>
              {customContext && <span style={{ textTransform: 'uppercase' }}>TARGET: CONTEXTUAL_INTERROGATION</span>}
            </div>
            <span>ELAPSED: {elapsed.toFixed(1)}s</span>
          </div>

          {/* Progressive Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((s, idx) => {
              const isActive = idx === step;
              const isCompleted = idx < step;
              const isPending = idx > step;

              let icon = '[ ]';
              let color = 'var(--ink-muted)';
              let statusText = 'PENDING';

              if (isCompleted) {
                icon = '[✔]';
                color = 'var(--sage-neutral)';
                statusText = 'COMPLETE';
              } else if (isActive) {
                icon = '[▶]';
                color = 'var(--rust-accent)';
                statusText = 'RUNNING';
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    color: color,
                    opacity: isPending ? 0.45 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{icon}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: isActive ? '600' : 'normal',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <span
                      className={isActive ? 'animate-pulse' : ''}
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                        paddingLeft: '12px',
                      }}
                    >
                      {statusText}
                    </span>
                  </div>

                  {/* Subtext description showing active progress */}
                  {(isActive || isCompleted) && (
                    <div
                      style={{
                        paddingLeft: '28px',
                        fontSize: '9px',
                        color: isCompleted ? 'var(--ink-muted)' : 'var(--ink-black)',
                        fontStyle: 'italic',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isActive ? `↳ ${s.detail}` : `↳ Analysis successfully compiled.`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sleek Progress Bar Indicator */}
          <div
            style={{
              height: '3px',
              backgroundColor: 'var(--cream-dark)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '1px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min((step / 3) * 100 + (step < 3 ? 15 : 0), 100)}%`,
                backgroundColor: 'var(--rust-accent)',
                transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

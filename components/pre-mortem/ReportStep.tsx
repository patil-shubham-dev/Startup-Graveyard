'use client';

import { useRef, useEffect, useState } from 'react';
import {
  BookOpen, Layers, AlertTriangle, Database, TrendingUp, Cpu,
  Download, Share2, Check, Copy
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ReportStepProps {
  report: Record<string, any>;
  reportId: number;
  exporting: boolean;
  copiedSection: string | null;
  onExportPDF: () => void;
  onCopyToClipboard: (text: string, section: string) => void;
  onReset: () => void;
}

const NAV_SECTIONS = [
  { id: 'executive-summary', label: 'Executive Summary', icon: BookOpen },
  { id: 'primary-risks', label: 'Primary Risk Vectors', icon: Layers },
  { id: 'failure-scenarios', label: 'Where This Fails', icon: AlertTriangle },
  { id: 'historical-parallels', label: 'Cemetery Parallels', icon: Database },
  { id: 'competitive-threats', label: 'Competitive Threats', icon: TrendingUp },
  { id: 'survival-probability', label: 'Risk Breakdown', icon: Cpu }
];

export function ReportStep({ report, reportId, exporting, copiedSection, onExportPDF, onCopyToClipboard, onReset }: ReportStepProps) {
  const [activeReportSection, setActiveReportSection] = useState('executive-summary');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = NAV_SECTIONS.map(s => s.id);
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
  }, [report]);

  return (
    <div className="w-full flex h-full overflow-hidden bg-[#F7F4EE]">
      <aside className="w-[280px] bg-[#FCFAF6] border-r border-[#DDD3C5] p-5 flex flex-col justify-between shrink-0 h-full overflow-hidden z-10 select-none">
        <div className="flex flex-col gap-4 overflow-hidden">
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

          <div className="bg-[#F7F4EE] border border-[#DDD3C5] p-3.5 rounded-[16px] flex flex-col items-center text-center gap-2.5 shrink-0">
            <span className="font-monospace text-[8.5px] tracking-widest text-[#9A9187] uppercase font-bold leading-none">
              OVERALL RISK FACTOR
            </span>
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="33" stroke="#DDD3C5" strokeWidth="4" fill="transparent" opacity="0.3" />
                <circle
                  cx="40" cy="40" r="33"
                  stroke={report.risk_score > 70 ? "#D84C2A" : report.risk_score > 40 ? "#E6A43B" : "#3FAE5A"}
                  strokeWidth="6" fill="transparent"
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
                <span className="text-[7.5px] font-monospace text-[#6D655B] mt-0.5 font-bold leading-none uppercase">RISK</span>
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

          <div className="flex flex-col gap-1 overflow-hidden select-none">
            <span className="font-monospace text-[8.5px] tracking-widest text-[#9A9187] uppercase font-bold block mb-0.5 leading-none">
              REPORT NAVIGATION
            </span>
            {NAV_SECTIONS.map((sec) => {
              const isActive = activeReportSection === sec.id;
              const Icon = sec.icon;
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
                  <Icon className={`w-3 h-3 ${isActive ? 'text-[#D35A22]' : 'text-[#9A9187]'}`} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-[#DDD3C5] shrink-0 mt-3">
          <button
            onClick={onExportPDF}
            disabled={exporting}
            className="w-full h-9 bg-[#D35A22] hover:bg-[#BF4F1E] text-[#FCFAF6] rounded-lg font-monospace text-[9.5px] tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all leading-none shrink-0"
          >
            <Download className="w-3 h-3" />
            {exporting ? 'EXPORTING...' : 'EXPORT REPORT PDF'}
          </button>

          <button
            onClick={() => onCopyToClipboard(window.location.href, 'global-share')}
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
            onClick={onReset}
            className="w-full text-center font-monospace text-[9.5px] font-bold text-[#9A9187] hover:text-[#D35A22] tracking-widest uppercase mt-0.5 transition-colors leading-none"
          >
            ← NEW SCAN
          </button>
        </div>
      </aside>

      <div className="flex-1 h-full overflow-hidden flex flex-col p-6 xl:p-8">
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
            onClick={onExportPDF}
            disabled={exporting}
            className="hidden sm:flex items-center gap-1.5 border border-[#DDD3C5] px-2.5 py-1.5 rounded-lg bg-[#FCFAF6] font-monospace text-[9px] tracking-widest font-bold text-[#D35A22] uppercase hover:bg-[#D35A22]/5 transition-all leading-none"
          >
            <Download className="w-3 h-3" /> PDF
          </button>
        </header>

        <div ref={reportRef} id="report-content" className="reportContent flex-1 overflow-y-auto max-h-full py-5 pr-4 flex flex-col gap-8 bg-[#F7F4EE]">
          <section id="executive-summary" className="scroll-mt-4">
            <div className="bg-[#FCFAF6] border border-[#DDD3C5] p-5 sm:p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-[#DDD3C5]/45 pb-2">
                <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
                  EXECUTIVE VERDICT SUMMARY
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
                  onClick={() => onCopyToClipboard(report.verdict, 'verdict')}
                  className="text-[#6D655B] hover:text-[#D35A22] transition-colors p-0.5"
                  title="Copy Verdict summary to clipboard"
                >
                  {copiedSection === 'verdict' ? <Check className="w-3.5 h-3.5 text-[#3FAE5A]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </section>

          <section id="primary-risks" className="scroll-mt-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
              <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">LETHAL RISK VECTORS</span>
              <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">3 Factors Mapped</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.primary_risks.map((risk: any, i: number) => (
                <div key={i} className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col justify-between gap-3 shadow-sm">
                  <div className="flex flex-col gap-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-[#D35A22]/5 border border-[#D35A22]/10 flex items-center justify-center text-[#D35A22] shrink-0 font-monospace font-bold text-[12px] leading-none">
                      0{i + 1}
                    </div>
                    <div className="flex flex-col gap-1 mt-0.5 leading-tight">
                      <span className="font-monospace text-[8.5px] tracking-widest text-[#9A9187] uppercase font-bold leading-none">{risk.category}</span>
                      <h3 className="font-display-serif italic font-semibold text-[15.5px] text-[#111111] leading-snug">{risk.description}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pt-2.5 border-t border-[#DDD3C5]/60 mt-1">
                    <span className="font-monospace text-[8.5px] text-[#D35A22] tracking-widest uppercase font-bold leading-none">MITIGATION STRATEGY:</span>
                    <p className="text-[12px] font-sans text-[#6D655B] leading-relaxed">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="failure-scenarios" className="scroll-mt-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
              <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">WHERE THIS FAILS: HYPOTHETICAL DEATH SCENARIOS</span>
              <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">Chronological Failure Pathways</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(report.failure_scenarios || []).map((scenario: any, i: number) => {
                const probClass = scenario.probability === 'LIKELY'
                  ? 'bg-[#D84C2A]/10 border-[#D84C2A]/20 text-[#D84C2A]'
                  : scenario.probability === 'POSSIBLE'
                  ? 'bg-[#E6A43B]/10 border-[#E6A43B]/20 text-[#E6A43B]'
                  : 'bg-[#3FAE5A]/10 border-[#3FAE5A]/20 text-[#3FAE5A]';
                return (
                  <div key={i} className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col justify-between gap-2.5 shadow-sm">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center leading-none">
                        <span className="font-monospace text-[8.5px] text-[#9A9187] uppercase tracking-wider font-bold leading-none">DEATH PATHWAY 0{i + 1}</span>
                        <span className={`font-monospace text-[8px] px-2 py-0.5 rounded border font-bold uppercase shrink-0 leading-none ${probClass}`}>{scenario.probability}</span>
                      </div>
                      <h4 className="font-display-serif italic font-bold text-[15.5px] text-[#111111] leading-tight">{scenario.title}</h4>
                      <p className="text-[12px] text-[#6D655B] leading-relaxed font-sans mt-0.5">{scenario.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="historical-parallels" className="scroll-mt-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
              <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">CEMETERY PARALLELS: REAL AUTOPSY CORRELATIONS</span>
              <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">Real Autopsy Matches</span>
            </div>
            <div className="flex flex-col gap-3.5">
              {(report.historical_cases || []).map((company: any, i: number) => (
                <div key={i} className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col md:flex-row gap-3.5 justify-between items-start md:items-center shadow-sm">
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 leading-none">
                      <h4 className="font-display-serif font-bold text-[16.5px] text-[#111111] leading-none">{company.name}</h4>
                      <span className="text-[#DDD3C5] hidden sm:inline leading-none">|</span>
                      <span className="font-monospace text-[8.5px] text-[#9A9187] tracking-wider uppercase font-semibold leading-none mt-0.5">
                        FOUNDED: {company.founded} — DIED: {company.died}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6D655B] leading-relaxed font-sans">{company.correlation}</p>
                  </div>
                  <div className="shrink-0 flex md:flex-col items-end gap-1 self-stretch justify-between md:justify-center border-t md:border-t-0 md:border-l border-[#DDD3C5] pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0 leading-none">
                    <span className="font-monospace text-[7.5px] text-[#9A9187] uppercase font-semibold leading-none">MATCH VECTOR:</span>
                    <span className="font-monospace text-[8.5px] bg-[#D84C2A]/10 border border-[#D84C2A]/20 text-[#D84C2A] px-2 py-0.5 rounded font-bold uppercase leading-none">{company.cause_category}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="competitive-threats" className="scroll-mt-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
              <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">COMPETITIVE MOAT TIMING ANALYSIS</span>
              <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">Threat Scan Ratings</span>
            </div>
            <div className="flex flex-col gap-3">
              {(report.competitors || []).map((comp: any, i: number) => {
                const levelClass = comp.threat_level === 'HIGH'
                  ? 'text-[#D84C2A] border-[#D84C2A]/20 bg-[#D84C2A]/10'
                  : comp.threat_level === 'MEDIUM'
                  ? 'text-[#E6A43B] border-[#E6A43B]/20 bg-[#E6A43B]/10'
                  : 'text-[#3FAE5A] border-[#3FAE5A]/20 bg-[#3FAE5A]/10';
                return (
                  <div key={i} className="bg-[#FCFAF6] border border-[#DDD3C5] p-4.5 rounded-[16px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <span className="font-monospace text-[9.5px] tracking-wider uppercase font-bold text-[#111111] leading-none">{comp.name}</span>
                      <p className="text-[12px] text-[#6D655B] leading-relaxed font-sans mt-1">{comp.threat_reason}</p>
                    </div>
                    <span className={`font-monospace text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 leading-none ${levelClass}`}>
                      {comp.threat_level} THREAT
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="survival-probability" className="scroll-mt-4 flex flex-col gap-3.5">
            <div className="flex justify-between items-center border-b border-[#DDD3C5] pb-1.5 leading-none">
              <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">FORENSIC DIAGNOSTIC RISK INDEX Breakdown</span>
              <span className="font-monospace text-[8.5px] text-[#9A9187] font-bold uppercase leading-none">Coefficients Mapped</span>
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
                        <span className="text-[10.5px] font-bold text-[#111111] uppercase tracking-wide leading-none">{item.label}</span>
                        <span className="text-[9px] text-[#9A9187] normal-case tracking-normal mt-0.5 leading-none">{item.desc}</span>
                      </div>
                      <span className="text-[12px] font-bold text-[#D35A22] shrink-0 leading-none">{item.value}% RISK</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 leading-none">
                      <div className="font-monospace text-[12px] text-[#D35A22] tracking-[0.2em] select-none shrink-0 leading-none">
                        {"█".repeat(filledBlocks)}
                        <span className="opacity-15">{"░".repeat(emptyBlocks)}</span>
                      </div>
                      <div className="flex-1 h-1.5 bg-[#F7F4EE] border border-[#DDD3C5] rounded-full overflow-hidden leading-none">
                        <div className="h-full bg-gradient-to-r from-[#D35A22] to-[#BF4F1E] rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="scroll-mt-4 border-t border-[#DDD3C5] pt-5 flex flex-col gap-2.5 mb-4">
            <span className="font-monospace text-[9px] tracking-widest text-[#D35A22] uppercase font-bold leading-none">
              VERDICT LOG ACTION SUMMARY
            </span>
            <p className="text-[12.5px] text-[#6D655B] leading-relaxed font-sans">
              The diagnostics compiled above show a survival index heavily constrained by operational and timing risks. Ensure you mitigate venture vulnerability vectors in chronological order. For further consulting-grade strategy and scenario support, utilize the semantic RAG database in the <span className="font-monospace text-[#D35A22] font-bold">[INTEL]</span> tab.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

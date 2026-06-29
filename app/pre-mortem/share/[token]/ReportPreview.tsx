'use client';

import {
  BookOpen,
  Layers,
  AlertTriangle,
  Database,
  TrendingUp,
  Cpu,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface PremortemReportPreviewProps {
  pitch: string;
  report: Record<string, unknown>;
  riskScore: number | null;
  createdAt: string;
}

function RiskGauge({ score }: { score: number }) {
  const color = score > 70 ? '#D84C2A' : score > 40 ? '#E6A43B' : '#3FAE5A';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r="40" stroke="#DDD3C5" strokeWidth="5" fill="transparent" opacity="0.3" />
        <circle
          cx="48" cy="48" r="40"
          stroke={color}
          strokeWidth="7" fill="transparent"
          strokeDasharray={2 * Math.PI * 40}
          strokeDashoffset={(2 * Math.PI * 40) - (score / 100) * (2 * Math.PI * 40)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[28px] font-bold leading-none" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: '#111111' }}>
          {score}%
        </span>
        <span className="text-[8px] mt-0.5 font-bold leading-none uppercase" style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#6D655B' }}>RISK</span>
      </div>
    </div>
  );
}

export function PremortemReportPreview({ pitch, report, riskScore, createdAt }: PremortemReportPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const risk = riskScore ?? (report.risk_score as number) ?? 50;
  const verdict = report.verdict as string;
  const primaryRisks = (report.primary_risks || []) as Array<{
    category: string;
    description: string;
    mitigation: string;
  }>;
  const failureScenarios = (report.failure_scenarios || []) as Array<{
    title: string;
    description: string;
    probability: string;
  }>;
  const historicalCases = (report.historical_cases || []) as Array<{
    name: string;
    founded: string;
    died: string;
    correlation: string;
    cause_category: string;
  }>;
  const competitors = (report.competitors || []) as Array<{
    name: string;
    threat_reason: string;
    threat_level: string;
  }>;
  const riskBreakdown = report.risk_breakdown as Record<string, number> | undefined;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F7F4EE' }}>
      {/* Banner */}
      <div style={{ backgroundColor: '#090B0F', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="sg-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, paddingBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22' }}>
            SHARED PRE-MORTEM REPORT
          </span>
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: copied ? '#3FAE5A' : '#9A9187',
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
            }}
          >
            {copied ? <><Check className="w-3 h-3" /> LINK COPIED</> : <><Copy className="w-3 h-3" /> COPY LINK</>}
          </button>
        </div>
      </div>

      {/* Pitch */}
      <div className="sg-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9A9187' }}>
            ORIGINAL PITCH
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187' }}>
            {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
          </span>
        </div>
        <blockquote style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 22, fontStyle: 'italic',
          color: '#111111', lineHeight: 1.5,
          borderLeft: '3px solid #D35A22',
          paddingLeft: 24, margin: 0,
        }}>
          &ldquo;{pitch}&rdquo;
        </blockquote>
      </div>

      {/* Report Content */}
      <div className="sg-container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Executive Summary */}
          <div className="chart-card" style={{ gridColumn: '1 / -1', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22' }}>
                <BookOpen className="w-3 h-3 inline mr-1" /> EXECUTIVE VERDICT
              </span>
              <span style={{
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8,
                background: risk > 70 ? '#D84C2A10' : risk > 40 ? '#E6A43B10' : '#3FAE5A10',
                border: `1px solid ${risk > 70 ? '#D84C2A20' : risk > 40 ? '#E6A43B20' : '#3FAE5A20'}`,
                color: risk > 70 ? '#D84C2A' : risk > 40 ? '#E6A43B' : '#3FAE5A',
                padding: '2px 8px', borderRadius: 100, fontWeight: 700, textTransform: 'uppercase',
              }}>
                {risk > 70 ? 'CRITICAL RISK' : risk > 40 ? 'MODERATE RISK' : 'LOW RISK'}
              </span>
            </div>
            <blockquote style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 20, fontStyle: 'italic', fontWeight: 600,
              color: '#111111', lineHeight: 1.6, margin: 0,
            }}>
              &ldquo;{verdict}&rdquo;
            </blockquote>
          </div>

          {/* Risk Score */}
          <div className="chart-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9A9187' }}>
              OVERALL RISK FACTOR
            </span>
            <RiskGauge score={risk} />
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#6D655B' }}>
              {risk > 70 ? 'HIGH VENTURE HEADWINDS' : risk > 40 ? 'MODERATE AUTOPSY RISK' : 'LOW AUTOPSY RISK'}
            </span>
          </div>

          {/* Pitch Summary */}
          <div className="chart-card" style={{ padding: 28 }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9A9187', display: 'block', marginBottom: 12 }}>
              REPORT SUMMARY
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187' }}>RISK SCORE</span>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, fontWeight: 700, color: '#D35A22' }}>{risk}/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187' }}>PRIMARY RISKS</span>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, fontWeight: 700, color: '#111111' }}>{primaryRisks.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187' }}>FAILURE SCENARIOS</span>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, fontWeight: 700, color: '#111111' }}>{failureScenarios.length}</span>
              </div>
            </div>
          </div>

          {/* Primary Risks */}
          <div className="chart-card" style={{ gridColumn: '1 / -1', padding: 28 }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22', display: 'block', marginBottom: 20 }}>
              <Layers className="w-3 h-3 inline mr-1" /> PRIMARY RISK VECTORS
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {primaryRisks.map((risk, i) => (
                <div key={i} style={{ background: '#FCFAF6', border: '1px solid #DDD3C5', borderRadius: 16, padding: 20 }}>
                  <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9A9187', display: 'block', marginBottom: 8 }}>
                    {risk.category}
                  </span>
                  <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 16, fontStyle: 'italic', fontWeight: 600, color: '#111111', margin: '0 0 12px', lineHeight: 1.4 }}>
                    {risk.description}
                  </p>
                  <div style={{ borderTop: '1px solid #DDD3C5', paddingTop: 12 }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D35A22', display: 'block', marginBottom: 4 }}>
                      MITIGATION:
                    </span>
                    <p style={{ fontFamily: 'var(--font-source-serif), Georgia, serif', fontSize: 12, color: '#6D655B', margin: 0, lineHeight: 1.5 }}>
                      {risk.mitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Failure Scenarios */}
          <div className="chart-card" style={{ gridColumn: '1 / -1', padding: 28 }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22', display: 'block', marginBottom: 20 }}>
              <AlertTriangle className="w-3 h-3 inline mr-1" /> WHERE THIS FAILS
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {failureScenarios.map((scenario, i) => {
                const probColor = scenario.probability === 'LIKELY' ? '#D84C2A' : scenario.probability === 'POSSIBLE' ? '#E6A43B' : '#3FAE5A';
                return (
                  <div key={i} style={{ background: '#FCFAF6', border: '1px solid #DDD3C5', borderRadius: 16, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187', textTransform: 'uppercase' }}>
                        PATHWAY 0{i + 1}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8,
                        background: `${probColor}10`, border: `1px solid ${probColor}20`,
                        color: probColor, padding: '2px 6px', borderRadius: 100, fontWeight: 700,
                      }}>
                        {scenario.probability}
                      </span>
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 16, fontWeight: 700, color: '#111111', margin: '0 0 8px', lineHeight: 1.3 }}>
                      {scenario.title}
                    </h4>
                    <p style={{ fontFamily: 'var(--font-source-serif), Georgia, serif', fontSize: 12, color: '#6D655B', margin: 0, lineHeight: 1.5 }}>
                      {scenario.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Cases */}
          {historicalCases.length > 0 && (
            <div className="chart-card" style={{ gridColumn: '1 / -1', padding: 28 }}>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22', display: 'block', marginBottom: 20 }}>
                <Database className="w-3 h-3 inline mr-1" /> CEMETERY PARALLELS
              </span>
              {historicalCases.map((company, i) => (
                <div key={i} style={{ background: '#FCFAF6', border: '1px solid #DDD3C5', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 18, fontWeight: 700, color: '#111111', margin: '0 0 4px' }}>
                      {company.name}
                    </h4>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187' }}>
                      {company.founded} — {company.died}
                    </span>
                    <p style={{ fontFamily: 'var(--font-source-serif), Georgia, serif', fontSize: 12, color: '#6D655B', margin: '8px 0 0', lineHeight: 1.5 }}>
                      {company.correlation}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8,
                    background: '#D84C2A10', border: '1px solid #D84C2A20',
                    color: '#D84C2A', padding: '2px 8px', borderRadius: 100, fontWeight: 700,
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {company.cause_category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Competitors */}
          {competitors.length > 0 && (
            <div className="chart-card" style={{ gridColumn: '1 / -1', padding: 28 }}>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22', display: 'block', marginBottom: 20 }}>
                <TrendingUp className="w-3 h-3 inline mr-1" /> COMPETITIVE THREATS
              </span>
              {competitors.map((comp, i) => {
                const levelColor = comp.threat_level === 'HIGH' ? '#D84C2A' : comp.threat_level === 'MEDIUM' ? '#E6A43B' : '#3FAE5A';
                return (
                  <div key={i} style={{ background: '#FCFAF6', border: '1px solid #DDD3C5', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, fontWeight: 700, color: '#111111', margin: '0 0 4px', textTransform: 'uppercase' }}>
                        {comp.name}
                      </h4>
                      <p style={{ fontFamily: 'var(--font-source-serif), Georgia, serif', fontSize: 12, color: '#6D655B', margin: 0, lineHeight: 1.5 }}>
                        {comp.threat_reason}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8,
                      background: `${levelColor}10`, border: `1px solid ${levelColor}20`,
                      color: levelColor, padding: '2px 8px', borderRadius: 100, fontWeight: 700,
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>
                      {comp.threat_level} THREAT
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Risk Breakdown */}
          {riskBreakdown && (
            <div className="chart-card" style={{ gridColumn: '1 / -1', padding: 28 }}>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#D35A22', display: 'block', marginBottom: 20 }}>
                <Cpu className="w-3 h-3 inline mr-1" /> RISK BREAKDOWN
              </span>
              {[
                { label: 'Product & PMF Risk', value: riskBreakdown.product },
                { label: 'Market & Category Risk', value: riskBreakdown.market },
                { label: 'Team Fit & Operational Risk', value: riskBreakdown.team },
                { label: 'Financial & Capital Risk', value: riskBreakdown.financial },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, fontWeight: 700, color: '#111111', textTransform: 'uppercase' }}>
                      {item.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, fontWeight: 700, color: '#D35A22' }}>
                      {item.value}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: '#F7F4EE', border: '1px solid #DDD3C5', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(to right, #D35A22, #BF4F1E)`,
                      borderRadius: 100,
                      width: `${item.value}%`,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #DDD3C5', paddingTop: 24, marginTop: 12, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 8, color: '#9A9187', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Generated by Startup Graveyard Pre-Mortem Engine
            </p>
            <a
              href="/pre-mortem"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9,
                color: '#D35A22', textTransform: 'uppercase',
                textDecoration: 'none', marginTop: 8,
              }}
            >
              <ExternalLink className="w-3 h-3" /> RUN YOUR OWN PRE-MORTEM
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

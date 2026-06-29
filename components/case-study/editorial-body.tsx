'use client';

import type { ReactNode } from 'react';
import type { CaseStudy } from '@/lib/db/case-studies';
import { formatCurrencyCompact } from '@/lib/utils/format';
import {
  extractFounders, extractInvestors, extractRootCauses,
  extractValuationPeak, extractFundingRounds, getLifespan,
  getMetricValue, getSeverityColor, getSeverityLabel,
  extractForensicData, extractCounterfactuals,
  extractHistoricalSignificance, extractCouldItWorkToday,
  extractEvidenceImages, extractBusinessModel,
  extractLocation, extractCompetitors,
  extractQuotes, extractTimelineEvents,
  extractFinalWord, extractTopReasons,
} from '@/lib/case-study-utils';
import { StartupAutopsy } from './StartupAutopsy';
import { CounterfactualAnalysis } from './CounterfactualAnalysis';
import { VisualEvidence } from './VisualEvidence';

interface EditorialBodyProps {
  study: CaseStudy;
  narrativeContent: ReactNode;
  similarCases: CaseStudy[];
}

export function EditorialBody({ study, narrativeContent, similarCases }: EditorialBodyProps) {
  const founders = extractFounders(study);
  const investors = extractInvestors(study);
  const rootCauses = extractRootCauses(study);
  const valuation = extractValuationPeak(study);
  const fundingRounds = extractFundingRounds(study);
  const lifespan = getLifespan(study);
  const employees = getMetricValue(study, 'peak_employees') || study.employees_peak;

  const forensic = extractForensicData(study);
  const counterfactuals = extractCounterfactuals(study);
  const historicalSignificance = extractHistoricalSignificance(study);
  const couldItWorkToday = extractCouldItWorkToday(study);
  const evidenceImages = extractEvidenceImages(study);
  const businessModel = extractBusinessModel(study);
  const location = extractLocation(study);

  const timelineEvents = extractTimelineEvents(study);
  const failureReasons = study.failure_reasons || [];
  const riskScores = study.risk_scores || {};
  const quotes = extractQuotes(study);
  const competitors = extractCompetitors(study);
  const finalWord = extractFinalWord(study);
  const topReasons = extractTopReasons(study);

  return (
    <>
      {/* ═══════════════════════════════════════════════════
         01. EXECUTIVE BRIEF
         ═══════════════════════════════════════════════════ */}
      <section id="executive-brief" className="scroll-mt-20 mb-28">
        <SectionLabel>01 &mdash; Executive Brief</SectionLabel>
        <div className="mt-6 space-y-6">
          <blockquote className="font-display text-xl md:text-2xl leading-relaxed text-[var(--ink-soft)] italic border-l-2 border-[var(--rust-accent)] pl-6">
            {study.summary}
          </blockquote>
          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="What was it?" value={`${study.company_name} was a company in the ${study.industry || 'technology'} sector.`} />
            <MiniStat label="What happened?" value={`Founded in ${study.founded_year || 'unknown'}, shut down in ${study.shutdown_year || 'unknown'} after ${lifespan}.`} />
            <MiniStat label="Why did it fail?" value={failureReasons.slice(0, 2).join(', ') || 'Multiple factors'} />
            <MiniStat label="Biggest lesson" value={study.lessons?.[0] || '—'} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         02. STARTUP AUTOPSY
         ═══════════════════════════════════════════════════ */}
      <section id="autopsy" className="scroll-mt-20 mb-28">
        <SectionLabel>02 &mdash; Startup Autopsy</SectionLabel>
        <div className="mt-6">
          <StartupAutopsy
            data={forensic}
            failureReasons={failureReasons}
            riskScores={riskScores}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         03. AT A GLANCE
         ═══════════════════════════════════════════════════ */}
      <section id="at-a-glance" className="scroll-mt-20 mb-28">
        <SectionLabel>03 &mdash; At a Glance</SectionLabel>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Industry" value={study.industry || '—'} />
          <StatCard label="Business Model" value={businessModel || '—'} />
          <StatCard label="Founded" value={study.founded_year?.toString() || '—'} />
          <StatCard label="Closed" value={study.shutdown_year?.toString() || '—'} />
          <StatCard label="Headquarters" value={location || '—'} />
          <StatCard label="Lifespan" value={lifespan} />
          <StatCard label="Total Funding" value={formatCurrencyCompact(study.funding_raised || 0)} accent />
          <StatCard label="Peak Valuation" value={valuation ? formatCurrencyCompact(valuation) : '—'} />
          <StatCard label="Peak Employees" value={employees ? `${employees}` : '—'} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         04. TIMELINE OF COLLAPSE
         ═══════════════════════════════════════════════════ */}
      {timelineEvents.length > 0 && (
        <section id="timeline" className="scroll-mt-20 mb-28">
          <SectionLabel>04 &mdash; Timeline of Collapse</SectionLabel>
          <div className="mt-6 relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-[var(--cream-dark)]/50" />
            <div className="space-y-8">
              {timelineEvents.map((event, i) => (
                <div key={i} className="relative pl-12">
                  <div
                    className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2"
                    style={{
                      borderColor: event.type === 'crisis' ? 'var(--failed-red)' : event.type === 'warning' ? 'var(--ochre-signal)' : 'var(--sage-neutral)',
                      backgroundColor: 'var(--paper-white)',
                    }}
                  />
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-muted)] mb-1">
                    {event.date}
                  </div>
                  <h4 className="font-display text-lg font-medium text-[var(--ink-black)] mb-1">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         05. THE STORY
         ═══════════════════════════════════════════════════ */}
      {narrativeContent && (
        <section id="story" className="scroll-mt-20 mb-28">
          <SectionLabel>05 &mdash; The Story</SectionLabel>
          <div className="mt-6 editorial-story">
            {narrativeContent}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         06. VISUAL EVIDENCE
         ═══════════════════════════════════════════════════ */}
      {evidenceImages.length > 0 && (
        <section id="evidence" className="scroll-mt-20 mb-28">
          <SectionLabel>06 &mdash; Visual Evidence</SectionLabel>
          <div className="mt-6">
            <VisualEvidence images={evidenceImages} companyName={study.company_name} />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         07. BUSINESS MODEL ANALYSIS
         ═══════════════════════════════════════════════════ */}
      <section id="business-model" className="scroll-mt-20 mb-28">
        <SectionLabel>07 &mdash; Business Model Analysis</SectionLabel>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AnalysisCard title="Revenue Model" body={businessModel || 'Subscription / Transaction-based (inferred)'} />
          <AnalysisCard title="Target Market" body={study.industry || 'Technology sector'} />
          <AnalysisCard title="Funding Efficiency" body={`Raised ${formatCurrencyCompact(study.funding_raised || 0)} over ${fundingRounds.length || 'multiple'} round(s).`} />
          <AnalysisCard title="Operational Lifespan" body={lifespan} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         08. FUNDING ANALYSIS
         ═══════════════════════════════════════════════════ */}
      {(investors.length > 0 || fundingRounds.length > 0 || study.funding_raised) && (
        <section id="funding" className="scroll-mt-20 mb-28">
          <SectionLabel>08 &mdash; Funding Analysis</SectionLabel>
          <div className="mt-6 space-y-6">
            {study.funding_raised && (
              <div className="bg-[var(--cream-deep)]/50 border border-[var(--cream-dark)]/50 p-6 rounded-sm">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">
                  Total Capital Raised
                </div>
                <div className="font-display text-3xl md:text-4xl font-medium text-[var(--ink-black)]">
                  {formatCurrencyCompact(study.funding_raised)}
                </div>
              </div>
            )}
            {fundingRounds.length > 0 && (
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">
                  Funding Rounds
                </div>
                <div className="space-y-2">
                  {fundingRounds.map((round, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 border border-[var(--cream-dark)]/30 bg-[var(--paper-white)] rounded-sm">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-[var(--ink-soft)]">
                          {round.name || `Round ${i + 1}`}
                        </div>
                        <div className="font-mono text-[9px] text-[var(--ink-muted)]">{round.date}</div>
                      </div>
                      <div className="font-mono text-sm font-semibold text-[var(--ink-black)]">
                        {formatCurrencyCompact(round.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {investors.length > 0 && (
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">
                  Key Investors
                </div>
                <div className="flex flex-wrap gap-2">
                  {investors.map((investor, i) => (
                    <span key={i} className="font-mono text-[10px] px-3 py-1.5 border border-[var(--cream-dark)] text-[var(--ink-soft)] rounded-sm">
                      {investor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         09. MARKET ANALYSIS
         ═══════════════════════════════════════════════════ */}
      <section id="market" className="scroll-mt-20 mb-28">
        <SectionLabel>09 &mdash; Market Analysis</SectionLabel>
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <AnalysisCard title="Industry" body={study.industry || '—'} />
            <AnalysisCard title="Market Timing" body={`Founded ${study.founded_year || '—'}, shut down ${study.shutdown_year || '—'}.`} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         10. COMPETITOR COMPARISON
         ═══════════════════════════════════════════════════ */}
      {competitors.length > 0 && (
        <section id="competitors" className="scroll-mt-20 mb-28">
          <SectionLabel>10 &mdash; Competitor Comparison</SectionLabel>
          <div className="mt-6 space-y-3">
            {competitors.map((comp, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-5 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display text-lg font-medium text-[var(--ink-black)]">{comp.name}</span>
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: comp.status === 'active' ? 'var(--sage-neutral)' : 'var(--cream-dark)',
                        color: comp.status === 'active' ? 'var(--paper-white)' : 'var(--ink-muted)',
                      }}
                    >
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)]">{comp.moat}</p>
                </div>
                <div className="md:text-right">
                  <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--ink-muted)] mb-1">Why They Survived</div>
                  <p className="text-xs text-[var(--ink-soft)] max-w-[240px]">{comp.advantage_over_failed}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         11. WHY IT FAILED
         ═══════════════════════════════════════════════════ */}
      {failureReasons.length > 0 && (
        <section id="why-it-failed" className="scroll-mt-20 mb-28">
          <SectionLabel>11 &mdash; Why It Failed</SectionLabel>
          <div className="mt-6 grid gap-4">
            {failureReasons.map((reason, i) => {
              const score = riskScores[reason.toLowerCase().replace(/\s+/g, '_')] ?? null;
              const pct = score !== null ? (typeof score === 'number' && score > 1 ? score : (score ?? 0) * 100) : null;
              return (
                <div key={i} className="flex gap-4 p-5 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm">
                  <span className="font-mono text-[10px] text-[var(--ink-muted)] opacity-30 shrink-0 w-5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display text-lg font-medium text-[var(--ink-black)]">{reason}</span>
                      {pct !== null && (
                        <span
                          className="font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: `${getSeverityColor(pct / 100)}15`,
                            color: getSeverityColor(pct / 100),
                          }}
                        >
                          {getSeverityLabel(pct / 100)}
                        </span>
                      )}
                    </div>
                    {pct !== null && (
                      <div className="mt-2 h-1.5 bg-[var(--cream-dark)]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: getSeverityColor(pct / 100),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Root Cause Analysis */}
          {rootCauses.length > 0 && (
            <div className="mt-8 bg-[var(--cream-deep)]/50 border border-[var(--cream-dark)]/50 p-6 md:p-8 rounded-sm">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-4">Root Cause Analysis</div>
              <div className="grid gap-6 md:grid-cols-3">
                {rootCauses.slice(0, 3).map((cause, i) => (
                  <div key={i}>
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">
                      {i === 0 ? 'Primary Cause' : i === 1 ? 'Secondary Cause' : 'Contributing Factor'}
                    </div>
                    <div className="font-display text-lg font-medium text-[var(--ink-black)]">
                      {cause}
                    </div>
                  </div>
                ))}
              </div>
              {rootCauses.length > 3 && (
                <div className="mt-6 pt-6 border-t border-[var(--cream-dark)]/30">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">
                    Additional Factors
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rootCauses.slice(3).map((cause, i) => (
                      <span key={i} className="font-mono text-[10px] px-3 py-1.5 border border-[var(--cream-dark)] text-[var(--ink-soft)] rounded-sm">
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         12. COUNTERFACTUAL ANALYSIS
         ═══════════════════════════════════════════════════ */}
      {counterfactuals.length > 0 && (
        <section id="counterfactual" className="scroll-mt-20 mb-28">
          <SectionLabel>12 &mdash; Counterfactual Analysis</SectionLabel>
          <div className="mt-6">
            <CounterfactualAnalysis counterfactuals={counterfactuals} />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         13. LESSONS FOR FOUNDERS
         ═══════════════════════════════════════════════════ */}
      {study.lessons && study.lessons.length > 0 && (
        <section id="lessons" className="scroll-mt-20 mb-28">
          <SectionLabel>13 &mdash; Lessons for Founders</SectionLabel>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {study.lessons.map((lesson, i) => (
              <LessonCard key={i} title={`Lesson ${i + 1}`} body={lesson} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         14. KEY PEOPLE
         ═══════════════════════════════════════════════════ */}
      {founders.length > 0 && (
        <section id="people" className="scroll-mt-20 mb-28">
          <SectionLabel>14 &mdash; Key People</SectionLabel>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {founders.map((name, i) => (
              <PersonCard key={i} name={name} role={i === 0 ? 'Founder' : 'Co-Founder'} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         15. NOTABLE QUOTES
         ═══════════════════════════════════════════════════ */}
      {quotes.length > 0 && (
        <section id="quotes" className="scroll-mt-20 mb-28">
          <SectionLabel>15 &mdash; Notable Quotes</SectionLabel>
          <div className="mt-6 space-y-10">
            {quotes.map((q, i) => (
              <blockquote key={i}>
                <div className="font-display text-2xl md:text-3xl leading-tight text-[var(--ink-black)] mb-4">
                  &ldquo;{q.text}&rdquo;
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[var(--cream-dark)]" />
                  <div>
                    <span className="font-mono text-[11px] font-medium text-[var(--ink-soft)]">{q.author}</span>
                    {q.role && <span className="font-mono text-[9px] text-[var(--ink-muted)] ml-2">{q.role}</span>}
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
         16. LEGACY
         ═══════════════════════════════════════════════════ */}
      <section id="legacy" className="scroll-mt-20 mb-28">
        <SectionLabel>16 &mdash; Legacy</SectionLabel>
        <div className="mt-6 p-6 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm">
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
            {study.company_name} raised {formatCurrencyCompact(study.funding_raised || 0)} and operated for {lifespan} in the {study.industry || 'technology'} sector.
            {failureReasons.length > 0 ? ` The company's failure was primarily attributed to ${failureReasons[0]}${failureReasons.length > 1 ? ` and ${failureReasons[1]}` : ''}.` : ''}
            {' '}Its story serves as a case study for founders, investors, and operators studying startup failure patterns.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         17. FINAL VERDICT
         ═══════════════════════════════════════════════════ */}
      <section id="verdict" className="scroll-mt-20 mb-28">
        <SectionLabel>17 &mdash; Final Verdict</SectionLabel>
        <div className="mt-6 bg-[var(--ink-black)] text-[var(--cream-base)] p-8 md:p-10 rounded-sm">
          <p className="font-display text-2xl md:text-3xl leading-tight mb-8">
            {finalWord || `${study.company_name} failed due to a combination of ${(failureReasons.slice(0, 2).join(' and ')) || 'multiple factors'}.`}
          </p>

          <div className="grid gap-6 md:grid-cols-3 pt-8 border-t border-[var(--ink-muted)]/30">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Biggest Mistake</div>
              <p className="text-sm text-[var(--cream-base)]/80">{failureReasons[0] || '—'}</p>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Biggest Lesson</div>
              <p className="text-sm text-[var(--cream-base)]/80">{study.lessons?.[0] || '—'}</p>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Historical Significance</div>
              <p className="text-sm text-[var(--cream-base)]/80">{historicalSignificance || failureReasons[0] || 'Undetermined'}</p>
            </div>
          </div>

          {/* Verdict scores */}
          <div className="grid gap-4 md:grid-cols-3 pt-6 mt-6 border-t border-[var(--ink-muted)]/30">
            <VerdictScore label="Failure Score" value={forensic.failureScore} max={100} />
            <VerdictScore label="Survival Probability" value={forensic.survivalProbability} max={100} />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">Could It Work Today?</div>
              <div className="text-sm" style={{ color: couldItWorkToday === null ? 'var(--cream-base)/60' : couldItWorkToday ? 'var(--sage-neutral)' : 'var(--rust-accent)' }}>
                {couldItWorkToday === null ? 'Inconclusive' : couldItWorkToday ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Top Reasons */}
          {topReasons.length > 0 && (
            <div className="pt-6 mt-6 border-t border-[var(--ink-muted)]/30">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-3">Verdict Breakdown</div>
              <div className="space-y-3">
                {topReasons.map((reason, i) => (
                  <div key={i}>
                    <div className="font-mono text-[10px] font-medium text-[var(--cream-base)]/90 mb-1">{reason.title}</div>
                    <p className="text-xs text-[var(--cream-base)]/60">{reason.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
         RELATED CASE STUDIES
         ═══════════════════════════════════════════════════ */}
      {similarCases.length > 0 && (
        <section className="mt-20 pt-16 border-t border-[var(--cream-dark)]/30">
          <SectionLabel>Related Case Studies</SectionLabel>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {similarCases.map((s) => (
              <a
                key={s.id}
                href={`/case/${s.slug}`}
                className="group block p-5 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm hover:border-[var(--rust-accent)]/40 transition-colors"
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-muted)] mb-2">
                  {s.industry || 'Archive'}
                </div>
                <div className="font-display text-xl font-medium text-[var(--ink-black)] mb-2">
                  {s.company_name}
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-2">{s.summary}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ─── Sub-components ─── */

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--rust-accent)] font-medium">
        {children}
      </span>
      <div className="flex-1 h-px bg-[var(--cream-dark)]/40" />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] p-4 rounded-sm">
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-muted)] mb-1">{label}</div>
      <div className="font-mono text-lg font-semibold leading-none" style={{ color: accent ? 'var(--rust-accent)' : 'var(--ink-black)' }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-[var(--cream-deep)]/40 border border-[var(--cream-dark)]/30 rounded-sm">
      <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-1">{label}</div>
      <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{value}</p>
    </div>
  );
}

function AnalysisCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm">
      <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--rust-accent)] mb-2">{title}</div>
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}

function LessonCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm hover:border-[var(--rust-accent)]/30 transition-colors">
      <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--rust-accent)] mb-2">{title}</div>
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}

function PersonCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-[var(--cream-dark)]/40 bg-[var(--paper-white)] rounded-sm">
      <div className="w-10 h-10 rounded-full bg-[var(--cream-deep)] border border-[var(--cream-dark)] flex items-center justify-center shrink-0">
        <span className="font-mono text-xs font-bold text-[var(--ink-muted)]">
          {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div>
        <div className="font-display text-base font-medium text-[var(--ink-black)]">{name}</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-muted)]">{role}</div>
      </div>
    </div>
  );
}

function VerdictScore({ label, value, max }: { label: string; value: number | null; max: number }) {
  const pct = value !== null ? Math.min(value, max) : null;
  const scoreColor = pct !== null
    ? (pct >= 70 ? 'var(--failed-red)' : pct >= 40 ? 'var(--rust-accent)' : pct >= 20 ? 'var(--ochre-signal)' : 'var(--sage-neutral)')
    : 'var(--ink-muted)';

  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-muted)] mb-2">{label}</div>
      <div className="flex items-end gap-2 mb-2">
        <span className="font-display text-2xl font-medium" style={{ color: scoreColor }}>
          {pct !== null ? pct : '—'}
        </span>
        {pct !== null && <span className="font-mono text-[9px] text-[var(--cream-base)]/40 mb-1">/{max}</span>}
      </div>
      {pct !== null && (
        <div className="h-1.5 bg-[var(--ink-muted)]/30 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor }} />
        </div>
      )}
    </div>
  );
}

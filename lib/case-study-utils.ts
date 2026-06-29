import type { CaseStudy } from '@/lib/db/case-studies';

export function extractFounders(study: CaseStudy): string[] {
  const raw = (study as unknown as Record<string, unknown>).founders;
  if (Array.isArray(raw)) return raw as string[];
  const metrics = study.metrics;
  if (metrics && typeof metrics === 'object') {
    const m = metrics as Record<string, unknown>;
    if (Array.isArray(m.founders)) return m.founders as string[];
  }
  return [];
}

export function extractInvestors(study: CaseStudy): string[] {
  const raw = (study as unknown as Record<string, unknown>).investors;
  if (Array.isArray(raw)) return raw as string[];
  const metrics = study.metrics;
  if (metrics && typeof metrics === 'object') {
    const m = metrics as Record<string, unknown>;
    if (Array.isArray(m.investors)) return m.investors as string[];
  }
  if (study.financial_rounds && Array.isArray(study.financial_rounds)) {
    const investors = new Set<string>();
    for (const round of study.financial_rounds) {
      if (round && typeof round === 'object') {
        const inv = (round as Record<string, unknown>).investors;
        if (Array.isArray(inv)) inv.forEach((i: string) => investors.add(i));
      }
    }
    return Array.from(investors);
  }
  return [];
}

export function extractRootCauses(study: CaseStudy): string[] {
  const raw = (study as unknown as Record<string, unknown>).root_causes;
  if (Array.isArray(raw)) return raw as string[];
  if (study.failure_analysis && typeof study.failure_analysis === 'object') {
    const fa = study.failure_analysis as Record<string, unknown>;
    if (Array.isArray(fa.root_causes)) return fa.root_causes as string[];
    if (Array.isArray(fa.causes)) return fa.causes as string[];
  }
  return study.failure_reasons || [];
}

export function extractWarningSigns(study: CaseStudy): string[] {
  const raw = (study as unknown as Record<string, unknown>).warning_signs;
  if (Array.isArray(raw)) return raw as string[];
  return [];
}

export function extractValuationPeak(study: CaseStudy): number | null {
  const raw = (study as unknown as Record<string, unknown>).valuation_peak;
  if (typeof raw === 'number') return raw;
  if (study.metrics && typeof study.metrics === 'object') {
    const m = study.metrics as Record<string, unknown>;
    const val = m.peak_valuation;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
  }
  return null;
}

export function extractFundingRounds(study: CaseStudy): Array<{ date: string; amount: number; name?: string }> {
  if (study.financial_rounds && Array.isArray(study.financial_rounds)) {
    return study.financial_rounds.map((r) => {
      const round = r as Record<string, unknown>;
      return {
        date: String(round.date || round.round_date || ''),
        amount: Number(round.amount || round.raised || 0),
        name: round.name ? String(round.name) : round.round ? String(round.round) : undefined,
      };
    }).filter((r) => r.date && r.amount > 0);
  }
  const finData = study.financial_data;
  if (finData && typeof finData === 'object') {
    const fd = finData as Record<string, unknown>;
    if (Array.isArray(fd.rounds)) {
      return (fd.rounds as Array<Record<string, unknown>>).map((r) => ({
        date: String(r.date || ''),
        amount: Number(r.amount || 0),
        name: r.name ? String(r.name) : undefined,
      })).filter((r) => r.date && r.amount > 0);
    }
  }
  return [];
}

export function getLifespan(study: CaseStudy): string {
  if (!study.founded_year || !study.shutdown_year) return '—';
  const years = study.shutdown_year - study.founded_year;
  if (years < 1) return '<1 year';
  return `${years} years`;
}

export function getMetricValue(study: CaseStudy, key: string): string | number | null {
  if (!study.metrics || typeof study.metrics !== 'object') return null;
  const m = study.metrics as Record<string, unknown>;
  const val = m[key];
  return val !== undefined ? (val as string | number) : null;
}

export interface LessonData {
  title: string;
  explanation: string;
  founderTakeaway?: string;
  relevance?: string;
}

export function extractLessons(study: CaseStudy): LessonData[] {
  const raw = (study as unknown as Record<string, unknown>).lessons_data;
  if (Array.isArray(raw)) return raw as LessonData[];
  return (study.lessons || []).map((l) => ({
    title: l,
    explanation: l,
  }));
}

export function formatDuration(years: number): string {
  if (years < 1) return '<1 year';
  return `${years} years`;
}

export function getSeverityColor(score: number): string {
  if (score >= 0.7) return 'var(--failed-red)';
  if (score >= 0.4) return 'var(--rust-accent)';
  if (score >= 0.2) return 'var(--ochre-signal)';
  return 'var(--sage-neutral)';
}

export function getSeverityLabel(score: number): string {
  if (score >= 0.7) return 'Critical';
  if (score >= 0.4) return 'High';
  if (score >= 0.2) return 'Moderate';
  return 'Low';
}

/* ─── Forensic Extractors (V2) ─── */

export interface ForensicData {
  causeOfDeath: string | null;
  fatalEvent: string | null;
  failureScore: number | null;
  survivalProbability: number | null;
  couldItSurviveToday: boolean | null;
  secondaryCauses: string[];
  contributingFactors: string[];
}

export function extractForensicData(study: CaseStudy): ForensicData {
  const fa = study.failure_analysis as Record<string, unknown> | null;
  if (!fa) {
    return {
      causeOfDeath: null,
      fatalEvent: null,
      failureScore: null,
      survivalProbability: null,
      couldItSurviveToday: null,
      secondaryCauses: [],
      contributingFactors: [],
    };
  }
  return {
    causeOfDeath: (fa.cause_of_death as string) || null,
    fatalEvent: (fa.fatal_event as string) || null,
    failureScore: (fa.failure_score as number) ?? null,
    survivalProbability: (fa.survival_probability as number) ?? null,
    couldItSurviveToday: (fa.could_it_survive_today as boolean) ?? null,
    secondaryCauses: (fa.secondary_causes as string[]) || [],
    contributingFactors: (fa.contributing_factors as string[]) || [],
  };
}

export interface Counterfactual {
  scenario: string;
  whatWouldHaveHappened: string;
  probability: string;
}

export function extractCounterfactuals(study: CaseStudy): Counterfactual[] {
  const fa = study.failure_analysis as Record<string, unknown> | null;
  if (fa && Array.isArray(fa.counterfactuals)) {
    return fa.counterfactuals as Counterfactual[];
  }
  return [];
}

export function extractHistoricalSignificance(study: CaseStudy): string | null {
  const v = study.verdict as Record<string, unknown> | null;
  if (v && v.historical_significance) return v.historical_significance as string;
  return null;
}

export function extractCouldItWorkToday(study: CaseStudy): boolean | null {
  const v = study.verdict as Record<string, unknown> | null;
  if (v && typeof v.could_it_work_today === 'boolean') return v.could_it_work_today as boolean;
  const fa = study.failure_analysis as Record<string, unknown> | null;
  if (fa && typeof fa.could_it_survive_today === 'boolean') return fa.could_it_survive_today as boolean;
  return null;
}

export function extractEvidenceImages(study: CaseStudy): string[] {
  if (study.evidence_images && Array.isArray(study.evidence_images)) {
    return study.evidence_images.filter(Boolean) as string[];
  }
  if (study.archived_media && Array.isArray(study.archived_media)) {
    return study.archived_media
      .map((m) => (m as Record<string, unknown>).url as string)
      .filter(Boolean) as string[];
  }
  return [];
}

export function extractBusinessModel(study: CaseStudy): string | null {
  const raw = (study as unknown as Record<string, unknown>).business_model;
  if (typeof raw === 'string') return raw;
  if (study.metrics && typeof study.metrics === 'object') {
    const m = study.metrics as Record<string, unknown>;
    if (m.business_model) return m.business_model as string;
  }
  return null;
}

export function extractLocation(study: CaseStudy): string | null {
  const raw = (study as unknown as Record<string, unknown>).location;
  if (typeof raw === 'string') return raw;
  const country = (study as unknown as Record<string, unknown>).country;
  if (typeof country === 'string') return country;
  return study.location || null;
}

export function extractCompetitors(study: CaseStudy): Array<{
  name: string; status: string; moat: string; advantage_over_failed: string;
}> {
  if (study.competitors && Array.isArray(study.competitors)) {
    return study.competitors.map((c) => ({
      name: (c as Record<string, unknown>).name as string || '',
      status: (c as Record<string, unknown>).status as string || '',
      moat: (c as Record<string, unknown>).moat as string || '',
      advantage_over_failed: (c as Record<string, unknown>).advantage_over_failed as string || '',
    })).filter((c) => c.name);
  }
  return [];
}

export function extractQuotes(study: CaseStudy): Array<{ text: string; author: string; role: string }> {
  if (study.quotes && Array.isArray(study.quotes)) {
    return study.quotes.map((q) => ({
      text: (q as Record<string, unknown>).text as string || '',
      author: (q as Record<string, unknown>).author as string || '',
      role: (q as Record<string, unknown>).role as string || '',
    })).filter((q) => q.text);
  }
  return [];
}

export function extractTimelineEvents(study: CaseStudy): Array<{
  date: string; title: string; description: string; type: string;
}> {
  if (study.timeline_events && Array.isArray(study.timeline_events)) {
    return study.timeline_events.map((e) => ({
      date: (e as Record<string, unknown>).date as string || '',
      title: (e as Record<string, unknown>).title as string || '',
      description: (e as Record<string, unknown>).description as string || '',
      type: (e as Record<string, unknown>).type as string || 'milestone',
    })).filter((e) => e.date);
  }
  return [];
}

export function extractFinalWord(study: CaseStudy): string | null {
  const v = study.verdict as Record<string, unknown> | null;
  if (v && v.final_word) return v.final_word as string;
  return null;
}

export function extractTopReasons(study: CaseStudy): Array<{ title: string; description: string }> {
  const v = study.verdict as Record<string, unknown> | null;
  if (v && Array.isArray(v.top_reasons)) {
    return v.top_reasons.map((r: unknown) => ({
      title: (r as Record<string, unknown>).title as string || '',
      description: (r as Record<string, unknown>).description as string || '',
    }));
  }
  return [];
}

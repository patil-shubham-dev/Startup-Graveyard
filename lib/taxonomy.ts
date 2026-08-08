export const CANONICAL_FAILURE_REASONS = [
  'No Market Need',
  'Cash Exhaustion',
  'Competition',
  'Blitzscaling',
  'Regulatory',
  'Fraud',
  'Product-Market Fit',
  'Execution',
  'Pricing',
  'Leadership',
  'Timing',
  'Technology',
  'Business Model',
  'Strategy',
  'Operations',
  'Culture',
  'User Acquisition Cost',
  'Unit Economics',
  'Marketing',
] as const;

export type CanonicalFailureReason = (typeof CANONICAL_FAILURE_REASONS)[number];

/**
 * Maps legacy/near-duplicate labels to their canonical failure-reason form.
 * Every generation and every data audit returns canonical labels, so
 * facets, insights counts, and the sortable chips never diverge.
 */
const REASON_ALIASES: Record<string, CanonicalFailureReason> = {
  'Poor Execution': 'Execution',
  'Poor Team Dynamics': 'Execution',
  'Bad Execution': 'Execution',
  'Poor Management': 'Leadership',
  'Poor Leadership': 'Leadership',
  'Founder Conflict': 'Leadership',
  'Management Turmoil': 'Leadership',
  'Lack of Competitive Advantage': 'Competition',
  'Competitive Pressure': 'Competition',
  'No Moat': 'Competition',
  'Lack of Traction': 'No Market Need',
  'No Demand': 'No Market Need',
  'Insufficient Demand': 'No Market Need',
  'High Operational Costs': 'Unit Economics',
  'Bad Unit Economics': 'Unit Economics',
  'Inadequate Technology': 'Technology',
  'Technical Debt': 'Technology',
  'Regulatory Issues': 'Regulatory',
  'Regulatory Pressure': 'Regulatory',
  'Lack of Clear Business Model': 'Business Model',
  'No Business Model': 'Business Model',
  'Ineffective Marketing': 'Marketing',
  'Timing Market': 'Timing',
  'Wrong Timing': 'Timing',
  'Scaled Too Fast': 'Blitzscaling',
  'Overexpansion': 'Blitzscaling',
  'Ran Out of Money': 'Cash Exhaustion',
  'Burn Rate': 'Cash Exhaustion',
};

export function canonicalizeFailureReason(reason: string): string {
  const trimmed = reason.trim();
  if (!trimmed) return trimmed;
  return REASON_ALIASES[trimmed] ?? trimmed;
}

export function canonicalizeFailureReasons(reasons: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of reasons) {
    const canonical = canonicalizeFailureReason(r);
    if (canonical && !seen.has(canonical)) {
      seen.add(canonical);
      out.push(canonical);
    }
  }
  return out;
}

export function failureReasonOptionList(): string {
  return CANONICAL_FAILURE_REASONS.map((r) => `"${r}"`).join(', ');
}
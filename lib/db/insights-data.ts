import { unstable_cache } from 'next/cache';
import { isSupabaseConfigured, createServerDataClient } from './config';
import type { CaseStudy } from './case-studies';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

let db: ReturnType<typeof createServerDataClient> | null = null;

function getDb(): ReturnType<typeof createServerDataClient> {
  if (!db) db = createServerDataClient();
  return db;
}

export interface IntelligenceBriefing {
  mostCommonFailureCause: { name: string; count: number; percentage: number };
  highestCapitalDestruction: { company: string; slug: string; amount: number; industry: string };
  mostDangerousFounderMistake: { mistake: string; count: number; percentage: number };
  emergingPattern: { pattern: string; description: string; evidence: string[] };
  newDiscovery: { finding: string; description: string; evidenceCount: number };
}

export interface FailurePattern {
  name: string;
  shortName: string;
  description: string;
  casesObserved: number;
  averageFunding: number;
  averageCapitalDestroyed: number;
  averageLifespan: number;
  failureRate: number;
  companies: string[];
  relatedPatterns: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  historicalExamples: { company: string; slug: string; year: number }[];
}

export interface ArchiveDiscovery {
  finding: string;
  description: string;
  supportingCases: string[];
  evidenceCount: number;
  category: 'funding' | 'timing' | 'strategy' | 'team' | 'market';
  confidence: number;
  dateIdentified: string;
  relatedCompanies: { name: string; slug: string }[];
}

export interface FeaturedDiscovery {
  id: string;
  title: string;
  description: string;
  supportingCases: number;
  evidenceCount: number;
  category: string;
  confidence: number;
  dateIdentified: string;
  slug: string;
}

export interface LeaderboardItem {
  rank: number;
  company: string;
  slug: string;
  value: number;
  displayValue: string;
  industry: string;
  metric: string;
}

export interface IndustryData {
  industry: string;
  caseCount: number;
  archivedCases: number;
  failureRate: number;
  totalFunding: number;
  totalFundingDisplay: string;
  commonCauses: { name: string; count: number }[];
  mostNotableFailure: { company: string; slug: string; funding: number } | null;
  avgLifespan: number;
}

export interface FounderMistake {
  mistake: string;
  rank: number;
  count: number;
  percentage: number;
  description: string;
  supportingCases: { company: string; slug: string }[];
}

export interface HistoricalPeriod {
  era: string;
  yearRange: string;
  events: { year: number; company: string; event: string; significance: string; slug: string }[];
  theme: string;
  lesson: string;
}

export interface ComparisonPair {
  id: string;
  companyA: ComparisonCompany;
  companyB: ComparisonCompany;
  lessons: string[];
}

export interface ComparisonCompany {
  name: string;
  slug: string;
  funding: number;
  fundingDisplay: string;
  lifespan: number;
  industry: string;
  mistakes: string[];
  outcome: string;
  failureReason: string;
}

export interface PatternNode {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
}

export interface PatternLink {
  source: string;
  target: string;
  strength: number;
  label: string;
}

export type GraphNodeType = 'failure_cause' | 'founder_mistake' | 'industry' | 'business_model' | 'economic_event' | 'company' | 'outcome';

export interface IntelligenceGraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  severity?: string;
  count: number;
  description: string;
  relatedCount: number;
  slug?: string;
}

export interface IntelligenceGraphLink {
  source: string;
  target: string;
  strength: 'strong' | 'medium' | 'weak';
  label: string;
}

export interface InsightsIntelligenceData {
  briefing: IntelligenceBriefing;
  featuredDiscovery: FeaturedDiscovery | null;
  patterns: FailurePattern[];
  discoveries: ArchiveDiscovery[];
  leaderboards: LeaderboardItem[];
  industries: IndustryData[];
  mistakes: FounderMistake[];
  timeline: HistoricalPeriod[];
  comparisons: ComparisonPair[];
  patternNetwork: { nodes: PatternNode[]; links: PatternLink[] };
  intelligenceGraph: { nodes: IntelligenceGraphNode[]; links: IntelligenceGraphLink[] };
  totalCases: number;
  totalBurned: number;
  avgLifespan: number;
}

const EMPTY_INTELLIGENCE: InsightsIntelligenceData = {
  briefing: {
    mostCommonFailureCause: { name: 'Insufficient archive data', count: 0, percentage: 0 },
    highestCapitalDestruction: { company: 'Insufficient archive data', slug: '', amount: 0, industry: '' },
    mostDangerousFounderMistake: { mistake: 'Insufficient archive data', count: 0, percentage: 0 },
    emergingPattern: { pattern: 'Insufficient archive data', description: 'Insufficient data to identify emerging patterns.', evidence: [] },
    newDiscovery: { finding: 'Insufficient archive data', description: 'Insufficient data to surface new discoveries.', evidenceCount: 0 },
  },
  featuredDiscovery: null,
  patterns: [],
  discoveries: [],
  leaderboards: [],
  industries: [],
  mistakes: [],
  timeline: [],
  comparisons: [],
  patternNetwork: { nodes: [], links: [] },
  intelligenceGraph: { nodes: [], links: [] },
  totalCases: 0,
  totalBurned: 0,
  avgLifespan: 0,
};

function getLifespan(study: CaseStudy): number {
  if (study.founded_year && study.shutdown_year) {
    return study.shutdown_year - study.founded_year;
  }
  return 0;
}

function getFundingInDollars(study: CaseStudy): number {
  return (study.funding_raised || 0) / 100;
}

function fmtCurrency(amount: number): string {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
  return `$${amount}`;
}

const FAILURE_PATTERN_DEFINITIONS: Array<{
  id: string;
  name: string;
  shortName: string;
  description: string;
  matchTags: string[];
  related: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}> = [
  {
    id: 'blitzscaling-trap',
    name: 'The Blitzscaling Trap',
    shortName: 'Blitzscaling Trap',
    description: 'Rapid scaling without product-market fit or sustainable unit economics. Companies raise massive rounds and burn through capital chasing growth before validating their core business model.',
    matchTags: ['blitzscaling', 'Blitzscaling', 'Premature Scaling', 'premature scaling'],
    related: ['cash-burn-addiction', 'premature-expansion'],
    severity: 'critical',
  },
  {
    id: 'solo-founder-fragility',
    name: 'Solo Founder Fragility',
    shortName: 'Solo Founder Fragility',
    description: 'Single-founder startups lack the resilience, diverse perspectives, and shared accountability of multi-founder teams. Decision-making bottlenecks and burnout compound under pressure.',
    matchTags: ['solo founder', 'Solo Founder', 'single founder'],
    related: ['founder-conflict'],
    severity: 'high',
  },
  {
    id: 'pivot-deadline',
    name: 'The Pivot Deadline',
    shortName: 'Pivot Deadline',
    description: 'Multiple pivots without achieving product-market fit signal strategic drift. Each pivot resets progress while burning time, capital, and team morale.',
    matchTags: ['pivot', 'Pivot', 'multiple pivots'],
    related: ['no-product-market-fit', 'weak-distribution'],
    severity: 'high',
  },
  {
    id: 'cash-burn-addiction',
    name: 'Capital Burn Addiction',
    shortName: 'Cash Burn Addiction',
    description: 'Dependence on continuous fundraising to sustain operations. Companies prioritize raising capital over building sustainable revenue, creating a cycle of dependency.',
    matchTags: ['Cash Exhaustion', 'cash exhaustion', 'burn rate', 'Burn Rate', 'Cash Flow'],
    related: ['blitzscaling-trap', 'premature-expansion'],
    severity: 'critical',
  },
  {
    id: 'premature-expansion',
    name: 'Premature Expansion',
    shortName: 'Premature Expansion',
    description: 'Geographic or product line expansion before core business is proven. Diversification becomes dilution of focus and resources.',
    matchTags: ['premature expansion', 'over-expansion', 'scaling issues', 'Scaling Issues', 'scaling'],
    related: ['blitzscaling-trap', 'no-product-market-fit'],
    severity: 'high',
  },
  {
    id: 'no-product-market-fit',
    name: 'Weak Product-Market Fit',
    shortName: 'Weak PMF',
    description: 'Building a product that the market does not need or want. The most fundamental and fatal mistake — without PMF, no amount of funding or effort can sustain a company.',
    matchTags: ['No Market Need', 'no market need', 'Product-Market Fit', 'PMF', 'product-market fit'],
    related: ['pivot-deadline', 'weak-distribution'],
    severity: 'critical',
  },
  {
    id: 'weak-distribution',
    name: 'Weak Distribution',
    shortName: 'Weak Distribution',
    description: 'Failure to acquire customers efficiently. Even great products die without a viable go-to-market strategy and cost-effective customer acquisition.',
    matchTags: ['distribution', 'marketing', 'Ineffective Marketing', 'marketing', 'Customer Acquisition'],
    related: ['no-product-market-fit'],
    severity: 'high',
  },
  {
    id: 'founder-conflict',
    name: 'Founder Conflict',
    shortName: 'Founder Conflict',
    description: 'Leadership disputes, misaligned visions, and power struggles that paralyze decision-making and destroy company culture from within.',
    matchTags: ['founder conflict', 'team fracture', 'Team Fracture', 'Poor Team Dynamics', 'team dynamics'],
    related: ['solo-founder-fragility'],
    severity: 'medium',
  },
  {
    id: 'feature-creep',
    name: 'Feature Creep Syndrome',
    shortName: 'Feature Creep',
    description: 'Continuously adding features without solving a core problem. Product bloat increases complexity, dilutes value proposition, and wastes engineering resources.',
    matchTags: ['feature creep', 'Feature Creep', 'scope creep'],
    related: ['no-product-market-fit', 'pivot-deadline'],
    severity: 'medium',
  },
  {
    id: 'poor-unit-economics',
    name: 'Poor Unit Economics',
    shortName: 'Poor Unit Econ',
    description: 'Negative unit economics disguised as growth. Customer acquisition costs exceed lifetime value, making each sale a net loss that scales with volume.',
    matchTags: ['unit economics', 'pricing', 'Pricing Failure', 'pricing failure'],
    related: ['cash-burn-addiction', 'blitzscaling-trap'],
    severity: 'critical',
  },
  {
    id: 'regulatory-blindness',
    name: 'Regulatory Blindness',
    shortName: 'Regulatory Blindness',
    description: 'Ignoring or underestimating regulatory and compliance requirements. Operating in gray areas until regulators force shutdown.',
    matchTags: ['regulatory', 'Regulatory', 'Fraud', 'fraud'],
    related: [],
    severity: 'high',
  },
  {
    id: 'lack-of-focus',
    name: 'Lack of Focus',
    shortName: 'Lack of Focus',
    description: 'Attempting to serve too many markets, segments, or use cases simultaneously. Spreading thin across multiple fronts without winning anywhere.',
    matchTags: ['focus', 'Lack of Focus'],
    related: ['feature-creep', 'premature-expansion'],
    severity: 'medium',
  },
  {
    id: 'competition-underestimate',
    name: 'Competition Underestimation',
    shortName: 'Competition Trap',
    description: 'Underestimating existing competitors or entering hyper-competitive markets without a durable moat.',
    matchTags: ['Competition', 'competition', 'Competitive Advantage', 'competitive advantage'],
    related: ['no-product-market-fit', 'weak-distribution'],
    severity: 'high',
  },
];

function deriveInsightsFromCase(study: CaseStudy): { patterns: string[]; mistakes: string[] } {
  const patterns: string[] = [];
  const mistakes: string[] = [];
  const reasons = (study.failure_reasons || []).map(r => r.toLowerCase());
  const tags = (study.tags || []).map(t => t.toLowerCase());
  const lessons = (study.lessons || []).map(l => l.toLowerCase());
  const allText = [...reasons, ...tags, ...lessons].join(' ');

  for (const def of FAILURE_PATTERN_DEFINITIONS) {
    const matched = def.matchTags.some(tag => allText.includes(tag.toLowerCase()));
    if (matched) {
      patterns.push(def.id);
    }
  }

  if (reasons.some(r => r.includes('cash') || r.includes('burn'))) {
    mistakes.push('Burn Rate Addiction');
  }
  if (reasons.some(r => r.includes('market') || r.includes('pmf'))) {
    mistakes.push('Weak Product-Market Fit');
  }
  if (reasons.some(r => r.includes('scaling') || r.includes('blitz'))) {
    mistakes.push('Premature Scaling');
  }
  if (reasons.some(r => r.includes('distribution') || r.includes('marketing'))) {
    mistakes.push('Weak Distribution');
  }
  if (reasons.some(r => r.includes('pricing') || r.includes('unit'))) {
    mistakes.push('Poor Unit Economics');
  }
  if (reasons.some(r => r.includes('team') || r.includes('founder'))) {
    mistakes.push('Founder Conflict');
  }
  if (reasons.some(r => r.includes('focus'))) {
    mistakes.push('Lack of Focus');
  }
  if (reasons.some(r => r.includes('competition'))) {
    mistakes.push('Weak Competitive Moat');
  }

  return { patterns, mistakes };
}

function buildBriefing(studies: CaseStudy[]): IntelligenceBriefing {
  if (!studies.length) {
    return {
      mostCommonFailureCause: { name: 'Insufficient archive data', count: 0, percentage: 0 },
      highestCapitalDestruction: { company: 'Insufficient archive data', slug: '', amount: 0, industry: '' },
      mostDangerousFounderMistake: { mistake: 'Insufficient archive data', count: 0, percentage: 0 },
      emergingPattern: { pattern: 'Insufficient archive data', description: 'Insufficient data to identify emerging patterns.', evidence: [] },
      newDiscovery: { finding: 'Insufficient archive data', description: 'Insufficient data to surface new discoveries.', evidenceCount: 0 },
    };
  }

  const causeCounts = new Map<string, number>();
  for (const s of studies) {
    for (const r of s.failure_reasons || []) {
      causeCounts.set(r, (causeCounts.get(r) || 0) + 1);
    }
  }
  const mostCommon = [...causeCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const sortedByFunding = [...studies]
    .filter(s => (s.funding_raised || 0) > 0)
    .sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0));
  const topDestruction = sortedByFunding[0];

  const mistakeCounts = new Map<string, number>();
  for (const s of studies) {
    const { mistakes } = deriveInsightsFromCase(s);
    for (const m of mistakes) {
      mistakeCounts.set(m, (mistakeCounts.get(m) || 0) + 1);
    }
  }
  const topMistake = [...mistakeCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const recent = [...studies].filter(s => s.shutdown_year && s.shutdown_year >= 2020).sort((a, b) => (b.shutdown_year || 0) - (a.shutdown_year || 0));

  const patternCounts = new Map<string, number>();
  for (const s of studies) {
    const { patterns } = deriveInsightsFromCase(s);
    for (const p of patterns) {
      if (p !== 'cash-burn-addiction' && p !== 'no-product-market-fit') {
        patternCounts.set(p, (patternCounts.get(p) || 0) + 1);
      }
    }
  }
  const emergingPatternId = [...patternCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const emergingDef = FAILURE_PATTERN_DEFINITIONS.find(d => d.id === emergingPatternId);

  return {
    mostCommonFailureCause: {
      name: mostCommon?.[0] || 'Insufficient archive data',
      count: mostCommon?.[1] || 0,
      percentage: studies.length ? Math.round((mostCommon?.[1] || 0) / studies.length * 100) : 0,
    },
    highestCapitalDestruction: {
      company: topDestruction?.company_name || 'Insufficient archive data',
      slug: topDestruction?.slug || '',
      amount: getFundingInDollars(topDestruction || {} as CaseStudy),
      industry: topDestruction?.industry || '',
    },
    mostDangerousFounderMistake: {
      mistake: topMistake?.[0] || 'Insufficient archive data',
      count: topMistake?.[1] || 0,
      percentage: studies.length ? Math.round((topMistake?.[1] || 0) / studies.length * 100) : 0,
    },
    emergingPattern: {
      pattern: emergingDef?.name || 'Insufficient archive data',
      description: emergingDef?.description || 'Insufficient data to identify emerging patterns.',
      evidence: recent.slice(0, 3).map(s => s.company_name).filter(Boolean),
    },
    newDiscovery: {
      finding: `Companies in "${mostCommon?.[0] || 'unknown'}" category raise ${studies.length > 0 ? (sortedByFunding.length > 0 ? fmtCurrency(getFundingInDollars(sortedByFunding[Math.min(2, sortedByFunding.length - 1)])) : 'significant') : 'significant'} funding before failure`,
      description: `Analysis of ${studies.length} archived cases reveals that ${mostCommon?.[0]?.toLowerCase() || 'failure'} is the most cited cause, affecting ${Math.round((mostCommon?.[1] || 0) / studies.length * 100)}% of documented failures.`,
      evidenceCount: mostCommon?.[1] || 0,
    },
  };
}

function buildPatterns(studies: CaseStudy[]): FailurePattern[] {
  if (!studies.length) return [];

  return FAILURE_PATTERN_DEFINITIONS.map(def => {
    const matchedCases = studies.filter(s => {
      const { patterns } = deriveInsightsFromCase(s);
      return patterns.includes(def.id);
    });

    const avgFunding = matchedCases.length
      ? matchedCases.reduce((sum, s) => sum + getFundingInDollars(s), 0) / matchedCases.length
      : 0;
    const avgLife = matchedCases.length
      ? Math.round(matchedCases.reduce((sum, s) => sum + getLifespan(s), 0) / matchedCases.length)
      : 0;
    const totalDestroyed = matchedCases.reduce((sum, s) => sum + getFundingInDollars(s), 0);
    const confidence = matchedCases.length >= 5 ? 95 : matchedCases.length >= 3 ? 80 : matchedCases.length >= 1 ? 60 : 0;
    const historicalExamples = matchedCases
      .filter(s => s.shutdown_year)
      .slice(0, 4)
      .map(s => ({
        company: s.company_name,
        slug: s.slug,
        year: s.shutdown_year || s.founded_year || 0,
      }));

    return {
      name: def.name,
      shortName: def.shortName,
      description: def.description,
      casesObserved: matchedCases.length,
      averageFunding: avgFunding,
      averageCapitalDestroyed: totalDestroyed,
      averageLifespan: avgLife,
      failureRate: studies.length ? Math.round(matchedCases.length / studies.length * 100) : 0,
      companies: matchedCases.map(s => s.company_name).filter(Boolean),
      relatedPatterns: def.related,
      severity: def.severity,
      confidence,
      historicalExamples,
    };
  }).filter(p => p.casesObserved > 0);
}

function buildDiscoveries(studies: CaseStudy[]): ArchiveDiscovery[] {
  if (!studies.length) return [];
  const discoveries: ArchiveDiscovery[] = [];

  const highFundingBeforePmf = studies.filter(s => {
    const funding = getFundingInDollars(s);
    const reasons = (s.failure_reasons || []).map(r => r.toLowerCase());
    return funding > 100_000_000 && reasons.some(r => r.includes('market') || r.includes('pmf'));
  });
  if (highFundingBeforePmf.length >= 2) {
    discoveries.push({
      finding: 'Founders who raise over $100M before product-market fit fail significantly more often.',
      description: `Analysis of ${highFundingBeforePmf.length} cases shows that raising substantial capital before achieving PMF creates a dangerous safety net that masks underlying market problems.`,
      supportingCases: highFundingBeforePmf.slice(0, 5).map(s => s.company_name),
      evidenceCount: highFundingBeforePmf.length,
      category: 'funding',
      confidence: highFundingBeforePmf.length >= 5 ? 92 : 75,
      dateIdentified: '2024-01',
      relatedCompanies: highFundingBeforePmf.slice(0, 5).map(s => ({ name: s.company_name, slug: s.slug })),
    });
  }

  const consumerViral = studies.filter(s => {
    const text = [...(s.failure_reasons || []), ...(s.tags || []), s.industry || ''].map(t => t.toLowerCase()).join(' ');
    return text.includes('consumer') || text.includes('social') || text.includes('viral');
  });
  const consumerWithFastCollapse = consumerViral.filter(s => getLifespan(s) > 0 && getLifespan(s) <= 4);
  if (consumerWithFastCollapse.length >= 2) {
    discoveries.push({
      finding: 'Consumer startups dependent on viral growth collapse faster.',
      description: `${consumerWithFastCollapse.length} consumer-focused startups failed within ${consumerWithFastCollapse.length > 0 ? Math.round(consumerWithFastCollapse.reduce((a, s) => a + getLifespan(s), 0) / consumerWithFastCollapse.length) : 0} years on average. Viral growth strategies create fragile, non-replicable customer acquisition.`,
      supportingCases: consumerWithFastCollapse.slice(0, 5).map(s => s.company_name),
      evidenceCount: consumerWithFastCollapse.length,
      category: 'timing',
      confidence: consumerWithFastCollapse.length >= 5 ? 87 : 70,
      dateIdentified: '2024-02',
      relatedCompanies: consumerWithFastCollapse.slice(0, 5).map(s => ({ name: s.company_name, slug: s.slug })),
    });
  }

  const multiplePivots = studies.filter(s => {
    const content = s.summary?.toLowerCase() || '';
    const lessons = (s.lessons || []).map(l => l.toLowerCase());
    return content.includes('pivot') || lessons.some(l => l.includes('pivot'));
  });
  if (multiplePivots.length >= 2) {
    discoveries.push({
      finding: 'Multiple pivots before profitability strongly correlate with failure.',
      description: `${multiplePivots.length} cases document repeated strategic pivots. Each pivot resets progress, consumes resources, and signals lack of core strategic clarity.`,
      supportingCases: multiplePivots.slice(0, 5).map(s => s.company_name),
      evidenceCount: multiplePivots.length,
      category: 'strategy',
      confidence: multiplePivots.length >= 5 ? 90 : 72,
      dateIdentified: '2024-01',
      relatedCompanies: multiplePivots.slice(0, 5).map(s => ({ name: s.company_name, slug: s.slug })),
    });
  }

  const burnRateCases = studies.filter(s => {
    const reasons = (s.failure_reasons || []).map(r => r.toLowerCase());
    return reasons.some(r => r.includes('cash') || r.includes('burn'));
  });
  if (burnRateCases.length >= 2) {
    const avgFunding = burnRateCases.reduce((a, s) => a + getFundingInDollars(s), 0) / burnRateCases.length;
    discoveries.push({
      finding: `Companies that fail from cash exhaustion raise ${fmtCurrency(avgFunding)} on average — yet still run out.`,
      description: `${burnRateCases.length} cases (${Math.round(burnRateCases.length / studies.length * 100)}% of archive) cite cash issues as a primary failure cause. High burn rates consume capital faster than revenue generation.`,
      supportingCases: burnRateCases.slice(0, 5).map(s => s.company_name),
      evidenceCount: burnRateCases.length,
      category: 'funding',
      confidence: burnRateCases.length >= 5 ? 95 : 78,
      dateIdentified: '2024-03',
      relatedCompanies: burnRateCases.slice(0, 5).map(s => ({ name: s.company_name, slug: s.slug })),
    });
  }

  const founderLedFailures = studies.filter(s => {
    const text = (s.summary || '').toLowerCase() + (s.verdict ? JSON.stringify(s.verdict).toLowerCase() : '');
    return text.includes('founder') && (text.includes('hubris') || text.includes('mismanage') || text.includes('conflict'));
  });
  if (founderLedFailures.length >= 2) {
    discoveries.push({
      finding: 'Founder-related issues contribute to a significant percentage of documented failures.',
      description: `${founderLedFailures.length} cases (${Math.round(founderLedFailures.length / studies.length * 100)}% of archive) feature founder hubris, mismanagement, or conflict as contributing factors.`,
      supportingCases: founderLedFailures.slice(0, 5).map(s => s.company_name),
      evidenceCount: founderLedFailures.length,
      category: 'team',
      confidence: founderLedFailures.length >= 5 ? 85 : 65,
      dateIdentified: '2024-02',
      relatedCompanies: founderLedFailures.slice(0, 5).map(s => ({ name: s.company_name, slug: s.slug })),
    });
  }

  const industryClusters = new Map<string, number>();
  for (const s of studies) {
    if (s.industry) {
      industryClusters.set(s.industry, (industryClusters.get(s.industry) || 0) + 1);
    }
  }
  const topIndustry = [...industryClusters.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topIndustry) {
    discoveries.push({
      finding: `${topIndustry[0]} leads archive with ${topIndustry[1]} documented failures.`,
      description: `${topIndustry[0]} accounts for ${topIndustry[1]} of ${studies.length} archived failures. Analysis of this cluster reveals recurring patterns in market timing, funding strategy, and operational challenges.`,
      supportingCases: studies.filter(s => s.industry === topIndustry[0]).slice(0, 5).map(s => s.company_name),
      evidenceCount: topIndustry[1],
      category: 'market',
      confidence: topIndustry[1] >= 5 ? 94 : 80,
      dateIdentified: '2024-01',
      relatedCompanies: studies.filter(s => s.industry === topIndustry[0]).slice(0, 5).map(s => ({ name: s.company_name, slug: s.slug })),
    });
  }

  return discoveries;
}

function buildFeaturedDiscovery(studies: CaseStudy[], discoveries: ArchiveDiscovery[]): FeaturedDiscovery | null {
  if (!studies.length) return null;
  if (discoveries.length > 0) {
    const top = discoveries.reduce((a, b) => a.evidenceCount >= b.evidenceCount ? a : b);
    return {
      id: `DISC-${String(discoveries.indexOf(top) + 1).padStart(3, '0')}`,
      title: top.finding,
      description: top.description,
      supportingCases: top.evidenceCount,
      evidenceCount: top.evidenceCount,
      category: top.category,
      confidence: top.confidence,
      dateIdentified: top.dateIdentified,
      slug: '',
    };
  }
  return null;
}

function buildLeaderboards(studies: CaseStudy[]): LeaderboardItem[] {
  if (!studies.length) return [];
  const items: LeaderboardItem[] = [];

  const byFunding = [...studies]
    .filter(s => (s.funding_raised || 0) > 0)
    .sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0))
    .slice(0, 10);
  byFunding.forEach((s, i) => {
    items.push({
      rank: i + 1,
      company: s.company_name,
      slug: s.slug,
      value: getFundingInDollars(s),
      displayValue: fmtCurrency(getFundingInDollars(s)),
      industry: s.industry || 'Unknown',
      metric: 'Capital Destruction',
    });
  });

  const byLifespan = [...studies]
    .filter(s => getLifespan(s) > 0)
    .sort((a, b) => getLifespan(a) - getLifespan(b))
    .slice(0, 10);
  byLifespan.forEach((s, i) => {
    items.push({
      rank: i + 1,
      company: s.company_name,
      slug: s.slug,
      value: getLifespan(s),
      displayValue: `${getLifespan(s)} yrs`,
      industry: s.industry || 'Unknown',
      metric: 'Fastest Collapses',
    });
  });

  const byLongestDeath = [...studies]
    .filter(s => getLifespan(s) > 0)
    .sort((a, b) => getLifespan(b) - getLifespan(a))
    .slice(0, 10);
  byLongestDeath.forEach((s, i) => {
    items.push({
      rank: i + 1,
      company: s.company_name,
      slug: s.slug,
      value: getLifespan(s),
      displayValue: `${getLifespan(s)} yrs`,
      industry: s.industry || 'Unknown',
      metric: 'Longest Slow Deaths',
    });
  });

  const byEmployees = [...studies]
    .filter(s => (s.employees_peak || 0) > 0)
    .sort((a, b) => (b.employees_peak || 0) - (a.employees_peak || 0))
    .slice(0, 10);
  byEmployees.forEach((s, i) => {
    items.push({
      rank: i + 1,
      company: s.company_name,
      slug: s.slug,
      value: s.employees_peak || 0,
      displayValue: `${s.employees_peak?.toLocaleString() || 0}`,
      industry: s.industry || 'Unknown',
      metric: 'Largest Layoffs',
    });
  });

  const mistakeFrequency = new Map<string, number>();
  for (const s of studies) {
    const { mistakes } = deriveInsightsFromCase(s);
    for (const m of mistakes) {
      mistakeFrequency.set(m, (mistakeFrequency.get(m) || 0) + 1);
    }
  }
  const sortedMistakes = [...mistakeFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([mistake, count], i) => ({
      rank: i + 1,
      company: mistake,
      slug: '',
      value: count,
      displayValue: `${count} cases`,
      industry: '',
      metric: 'Most Repeated Mistakes',
    }));
  items.push(...sortedMistakes);

  const byMostPivots = studies
    .filter(s => {
      const text = (s.summary || '').toLowerCase();
      const matches = text.match(/pivot/g);
      return matches && matches.length >= 2;
    })
    .sort((a, b) => {
      const aCount = ((a.summary || '').toLowerCase().match(/pivot/g) || []).length;
      const bCount = ((b.summary || '').toLowerCase().match(/pivot/g) || []).length;
      return bCount - aCount;
    })
    .slice(0, 10);
  byMostPivots.forEach((s, i) => {
    items.push({
      rank: i + 1,
      company: s.company_name,
      slug: s.slug,
      value: ((s.summary || '').toLowerCase().match(/pivot/g) || []).length,
      displayValue: `${((s.summary || '').toLowerCase().match(/pivot/g) || []).length} pivots`,
      industry: s.industry || 'Unknown',
      metric: 'Most Expensive Pivots',
    });
  });

  const byOvervalued = [...studies]
    .filter(s => {
      const funding = getFundingInDollars(s);
      const lifespan = getLifespan(s);
      return funding > 500_000_000 && lifespan > 0 && lifespan < 8;
    })
    .sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0))
    .slice(0, 10);
  byOvervalued.forEach((s, i) => {
    const funding = getFundingInDollars(s);
    items.push({
      rank: i + 1,
      company: s.company_name,
      slug: s.slug,
      value: funding,
      displayValue: fmtCurrency(funding),
      industry: s.industry || 'Unknown',
      metric: 'Most Overvalued Failures',
    });
  });

  return items;
}

function buildIndustries(studies: CaseStudy[]): IndustryData[] {
  if (!studies.length) return [];

  const industryMap = new Map<string, CaseStudy[]>();
  for (const s of studies) {
    if (s.industry) {
      const list = industryMap.get(s.industry) || [];
      list.push(s);
      industryMap.set(s.industry, list);
    }
  }

  return [...industryMap.entries()]
    .map(([industry, cases]) => {
      const causeCounts = new Map<string, number>();
      for (const c of cases) {
        for (const r of c.failure_reasons || []) {
          causeCounts.set(r, (causeCounts.get(r) || 0) + 1);
        }
      }
      const sortedCauses = [...causeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

      const sortedByFunding = [...cases].sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0));
      const mostNotable = sortedByFunding[0];

      const avgLife = cases.length
        ? Math.round(cases.reduce((sum, c) => sum + getLifespan(c), 0) / cases.filter(c => getLifespan(c) > 0).length)
        : 0;

      const totalFunding = cases.reduce((sum, c) => sum + getFundingInDollars(c), 0);

      return {
        industry,
        caseCount: cases.length,
        archivedCases: cases.length,
        failureRate: studies.length ? Math.round(cases.length / studies.length * 100) : 0,
        totalFunding,
        totalFundingDisplay: fmtCurrency(totalFunding),
        commonCauses: sortedCauses.map(([name, count]) => ({ name, count })),
        mostNotableFailure: mostNotable
          ? { company: mostNotable.company_name, slug: mostNotable.slug, funding: getFundingInDollars(mostNotable) }
          : null,
        avgLifespan: avgLife,
      };
    })
    .sort((a, b) => b.caseCount - a.caseCount);
}

function buildMistakes(studies: CaseStudy[]): FounderMistake[] {
  if (!studies.length) return [];

  const mistakeMap = new Map<string, { count: number; cases: { company: string; slug: string }[] }>();

  for (const s of studies) {
    const { mistakes } = deriveInsightsFromCase(s);
    for (const m of mistakes) {
      const entry = mistakeMap.get(m) || { count: 0, cases: [] };
      entry.count++;
      entry.cases.push({ company: s.company_name, slug: s.slug });
      mistakeMap.set(m, entry);
    }
  }

  const mistakeDescriptions: Record<string, string> = {
    'Burn Rate Addiction': 'Companies that burn cash faster than they generate revenue inevitably face collapse. The addiction to growth at any cost masks underlying unit economics problems.',
    'Weak Product-Market Fit': 'The most fundamental founder mistake — building something nobody needs. Without PMF, no amount of marketing, funding, or pivoting can save the company.',
    'Premature Scaling': 'Scaling teams, marketing, and operations before validating the core business model. Growth amplifies problems rather than solving them.',
    'Weak Distribution': 'Failing to build a viable customer acquisition channel. Even exceptional products die without an efficient path to market.',
    'Poor Unit Economics': 'Negative unit economics disguised as growth. Each sale loses money, making success impossible at any scale.',
    'Founder Conflict': 'Leadership disputes that paralyze decision-making. Misaligned visions between founders create strategic drift and cultural toxicity.',
    'Lack of Focus': 'Attempting to serve too many markets or build too many features. Resources are diluted across fronts instead of concentrated on a single winning strategy.',
    'Weak Competitive Moat': 'Entering competitive markets without sustainable differentiation. Without a moat, incumbents and fast followers erode any temporary advantage.',
  };

  const sorted = [...mistakeMap.entries()]
    .map(([mistake, data]) => ({
      mistake,
      rank: 0,
      count: data.count,
      percentage: Math.round(data.count / studies.length * 100),
      description: mistakeDescriptions[mistake] || `Recurring founder mistake observed in ${data.count} cases.`,
      supportingCases: data.cases.slice(0, 8),
    }))
    .sort((a, b) => b.count - a.count)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  return sorted;
}

function buildTimeline(studies: CaseStudy[]): HistoricalPeriod[] {
  if (!studies.length) return [];

  const byDecade = new Map<string, CaseStudy[]>();
  for (const s of studies) {
    const year = s.shutdown_year || s.founded_year;
    if (!year) continue;
    const decade = year >= 2020 ? '2020s' : year >= 2000 ? '2000s' : year >= 1980 ? '1980s' : '1900s';
    const list = byDecade.get(decade) || [];
    list.push(s);
    byDecade.set(decade, list);
  }

  const periodInfo: Record<string, { era: string; yearRange: string; theme: string; lesson: string }> = {
    '1900s': {
      era: 'Early Industrial',
      yearRange: '1900 — 1979',
      theme: 'Industrial Age Disruption',
      lesson: 'Technological shifts create new markets but early movers often fail to capitalize.',
    },
    '1980s': {
      era: 'The PC Revolution',
      yearRange: '1980 — 1999',
      theme: 'Personal Computing & Dot-Com',
      lesson: 'Hype cycles inflate valuations beyond fundamentals. Timing matters as much as vision.',
    },
    '2000s': {
      era: 'The Dot-Com Aftermath',
      yearRange: '2000 — 2009',
      theme: 'Bubble Burst & Recovery',
      lesson: 'Unsustainable business models collapse when capital markets tighten. Unit economics ultimately determine survival.',
    },
    '2010s': {
      era: 'The Unicorn Era',
      yearRange: '2010 — 2019',
      theme: 'Growth-at-All-Costs',
      lesson: 'Venture capital abundance created a generation of companies dependent on continuous fundraising rather than sustainable revenue.',
    },
    '2020s': {
      era: 'The Correction',
      yearRange: '2020 — Present',
      theme: 'ZEra & Market Correction',
      lesson: 'When the cost of capital rises, over-leveraged companies collapse. The market corrects for fundamentals.',
    },
  };

  return Object.entries(periodInfo)
    .map(([decade, info]) => {
      const cases = byDecade.get(decade) || [];
      const events = cases.slice(0, 8).map(s => ({
        year: s.shutdown_year || s.founded_year || 0,
        company: s.company_name,
        event: `${s.company_name} — ${(s.failure_reasons || []).slice(0, 2).join(', ') || 'Failed'}`,
        significance: s.industry ? `${s.company_name} (${s.industry}) — ${getFundingInDollars(s) > 0 ? fmtCurrency(getFundingInDollars(s)) + ' raised' : 'venture-backed'}` : s.company_name,
        slug: s.slug,
      })).filter(e => e.year > 0);

      return {
        era: info.era,
        yearRange: info.yearRange,
        events,
        theme: info.theme,
        lesson: info.lesson,
      };
    })
    .filter(p => p.events.length > 0);
}

function buildComparisons(studies: CaseStudy[]): ComparisonPair[] {
  if (!studies.length) return [];

  const pairs: ComparisonPair[] = [];

  const comparisons: Array<{
    id: string;
    matchA: (s: CaseStudy) => boolean;
    matchB: (s: CaseStudy) => boolean;
    lessons: string[];
  }> = [
    {
      id: 'wework-vs-theranos',
      matchA: s => s.tags?.some(t => t.toLowerCase().includes('wework')) || s.company_name.toLowerCase() === 'wework',
      matchB: s => s.slug === 'theranos',
      lessons: ['Founder hubris and lack of oversight enabled massive fraud.', 'Valuation without verification is dangerous.', 'Culture of secrecy precedes catastrophic failure.'],
    },
    {
      id: 'fast-scaling-failures',
      matchA: s => s.slug === 'fast' || s.slug === 'quibi',
      matchB: s => s.slug === 'convoy' || s.slug === 'katerra',
      lessons: ['Raising massive funding does not guarantee success.', 'Burn rate accelerates collapse when growth stalls.', 'Market timing is as important as execution.'],
    },
    {
      id: 'fintech-cluster',
      matchA: s => s.slug === 'fast',
      matchB: s => s.slug === 'varo-money',
      lessons: ['Fintech requires deep regulatory understanding.', 'Consumer trust is hard to earn and easy to lose.', 'Partnerships matter more than technology alone.'],
    },
  ];

  for (const comp of comparisons) {
    const a = studies.find(comp.matchA);
    const b = studies.find(comp.matchB);
    if (a && b) {
      pairs.push({
        id: comp.id,
        companyA: {
          name: a.company_name,
          slug: a.slug,
          funding: getFundingInDollars(a),
          fundingDisplay: fmtCurrency(getFundingInDollars(a)),
          lifespan: getLifespan(a),
          industry: a.industry || 'Unknown',
          mistakes: (a.failure_reasons || []).slice(0, 3),
          outcome: (a.verdict && typeof a.verdict === 'object' && !Array.isArray(a.verdict)
            ? (a.verdict as Record<string, JsonValue>).final_word as string || 'Failed'
            : 'Failed'),
          failureReason: (a.failure_reasons || []).slice(0, 2).join(', ') || 'Unknown',
        },
        companyB: {
          name: b.company_name,
          slug: b.slug,
          funding: getFundingInDollars(b),
          fundingDisplay: fmtCurrency(getFundingInDollars(b)),
          lifespan: getLifespan(b),
          industry: b.industry || 'Unknown',
          mistakes: (b.failure_reasons || []).slice(0, 3),
          outcome: (b.verdict && typeof b.verdict === 'object' && !Array.isArray(b.verdict)
            ? (b.verdict as Record<string, JsonValue>).final_word as string || 'Failed'
            : 'Failed'),
          failureReason: (b.failure_reasons || []).slice(0, 2).join(', ') || 'Unknown',
        },
        lessons: comp.lessons,
      });
    }
  }

  const allByFunding = [...studies]
    .filter(s => (s.funding_raised || 0) > 0)
    .sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0));

  if (allByFunding.length >= 2) {
    const high = allByFunding[0];
    const low = allByFunding[allByFunding.length - 1];
    if (high.slug !== low.slug) {
      pairs.push({
        id: `funding-extremes-${high.slug}-${low.slug}`,
        companyA: {
          name: high.company_name,
          slug: high.slug,
          funding: getFundingInDollars(high),
          fundingDisplay: fmtCurrency(getFundingInDollars(high)),
          lifespan: getLifespan(high),
          industry: high.industry || 'Unknown',
          mistakes: (high.failure_reasons || []).slice(0, 3),
          outcome: (high.verdict && typeof high.verdict === 'object' && !Array.isArray(high.verdict)
            ? (high.verdict as Record<string, JsonValue>).final_word as string || 'Failed'
            : 'Failed'),
          failureReason: (high.failure_reasons || []).slice(0, 2).join(', ') || 'Unknown',
        },
        companyB: {
          name: low.company_name,
          slug: low.slug,
          funding: getFundingInDollars(low),
          fundingDisplay: fmtCurrency(getFundingInDollars(low)),
          lifespan: getLifespan(low),
          industry: low.industry || 'Unknown',
          mistakes: (low.failure_reasons || []).slice(0, 3),
          outcome: (low.verdict && typeof low.verdict === 'object' && !Array.isArray(low.verdict)
            ? (low.verdict as Record<string, JsonValue>).final_word as string || 'Failed'
            : 'Failed'),
          failureReason: (low.failure_reasons || []).slice(0, 2).join(', ') || 'Unknown',
        },
        lessons: [
          'Funding amount does not determine success or failure.',
          'Both well-funded and bootstrapped companies face distinct failure risks.',
          'Execution and market fit matter more than capital raised.',
        ],
      });
    }
  }

  return pairs;
}

function buildPatternNetwork(studies: CaseStudy[]): { nodes: PatternNode[]; links: PatternLink[] } {
  if (!studies.length) return { nodes: [], links: [] };

  const patternCaseMap = new Map<string, CaseStudy[]>();
  for (const s of studies) {
    const { patterns } = deriveInsightsFromCase(s);
    for (const p of patterns) {
      const list = patternCaseMap.get(p) || [];
      list.push(s);
      patternCaseMap.set(p, list);
    }
  }

  const nodes: PatternNode[] = [];
  const links: PatternLink[] = [];

  for (const def of FAILURE_PATTERN_DEFINITIONS) {
    const cases = patternCaseMap.get(def.id) || [];
    if (cases.length > 0) {
      nodes.push({
        id: def.id,
        name: def.shortName,
        category: def.severity === 'critical' ? 'Fatal' : def.severity === 'high' ? 'Severe' : 'Contributing',
        severity: def.severity,
        count: cases.length,
      });
    }
  }

  const nodeIds = new Set(nodes.map(n => n.id));
  for (const def of FAILURE_PATTERN_DEFINITIONS) {
    for (const related of def.related) {
      if (nodeIds.has(def.id) && nodeIds.has(related)) {
        const shared = studies.filter(s => {
          const { patterns } = deriveInsightsFromCase(s);
          return patterns.includes(def.id) && patterns.includes(related);
        });
        if (shared.length > 0) {
          links.push({
            source: def.id,
            target: related,
            strength: shared.length / studies.length,
            label: `${shared.length} cases`,
          });
        }
      }
    }
  }

  return { nodes, links };
}

function buildIntelligenceGraph(
  studies: CaseStudy[],
  patterns: FailurePattern[],
  mistakes: FounderMistake[],
  industries: IndustryData[]
): { nodes: IntelligenceGraphNode[]; links: IntelligenceGraphLink[] } {
  const nodes: IntelligenceGraphNode[] = [];
  const links: IntelligenceGraphLink[] = [];
  const nodeMap = new Map<string, Set<string>>();
  const total = studies.length || 1;

  const addNode = (id: string, label: string, type: GraphNodeType, count: number, description: string, severity?: string, slug?: string) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, new Set());
      nodes.push({ id, label, type, count, description, severity, slug, relatedCount: 0 });
    }
    return id;
  };

  const addLink = (source: string, target: string, label: string, strength: 'strong' | 'medium' | 'weak') => {
    if (source === target) return;
    const key = [source, target].sort().join('::');
    if (links.some(l => [l.source, l.target].sort().join('::') === key)) return;
    links.push({ source, target, strength, label });
    if (nodeMap.has(source)) nodeMap.get(source)!.add(target);
    if (nodeMap.has(target)) nodeMap.get(target)!.add(source);
  };

  const severityStrength = (s: string): 'strong' | 'medium' | 'weak' => {
    if (s === 'critical') return 'strong';
    if (s === 'high') return 'medium';
    return 'weak';
  };

  const ratioStrength = (r: number): 'strong' | 'medium' | 'weak' => {
    if (r >= 0.3) return 'strong';
    if (r >= 0.15) return 'medium';
    return 'weak';
  };

  for (const p of patterns) {
    addNode(`pattern:${p.shortName}`, p.shortName, 'failure_cause', p.casesObserved, p.description, p.severity);
  }

  for (const m of mistakes) {
    addNode(`mistake:${m.mistake}`, m.mistake, 'founder_mistake', m.count, m.description, m.rank <= 2 ? 'critical' : m.rank <= 4 ? 'high' : 'medium');
  }

  for (const ind of industries) {
    addNode(`industry:${ind.industry}`, ind.industry, 'industry', ind.caseCount, `${ind.industry} — ${ind.caseCount} archived failures.`, undefined, ind.mostNotableFailure?.slug || undefined);
  }

  const companyNodes = [...studies]
    .filter(s => (s.funding_raised || 0) > 0)
    .sort((a, b) => (b.funding_raised || 0) - (a.funding_raised || 0))
    .slice(0, 20);
  for (const s of companyNodes) {
    addNode(`company:${s.slug}`, s.company_name, 'company', 1, s.summary?.slice(0, 120) || 'Archived failure case.', undefined, s.slug);
  }

  const businessModels = new Map<string, { count: number; studies: CaseStudy[] }>();
  for (const s of studies) {
    const tags = (s.tags || []).filter(t => ['marketplace', 'saas', 'hardware', 'subscription', 'on-demand', 'fintech', 'healthtech', 'e-commerce', 'social', 'enterprise'].includes(t.toLowerCase()));
    for (const tag of tags) {
      const entry = businessModels.get(tag) || { count: 0, studies: [] };
      entry.count++;
      entry.studies.push(s);
      businessModels.set(tag, entry);
    }
  }
  for (const [model, data] of businessModels) {
    addNode(`model:${model}`, model, 'business_model', data.count, `${model} business model — ${data.count} cases.`);
  }

  const eraMap: Record<string, string> = {
    'Early Industrial': 'Industrial Revolution',
    'The PC Revolution': 'PC Revolution',
    'The Dot-Com Aftermath': 'Dot-Com Crash',
    'The Unicorn Era': 'Zero Interest Era',
    'The Correction': 'Rate Hike Correction',
  };
  for (const [era, shortLabel] of Object.entries(eraMap)) {
    addNode(`era:${era}`, shortLabel, 'economic_event', studies.filter(s => s.shutdown_year && s.shutdown_year >= 2020).length, `${era} economic period.`, undefined);
  }

  addNode('outcome:collapse', 'Company Collapse', 'outcome', total, 'Complete business failure and shutdown.', undefined);
  addNode('outcome:acquisition', 'Fire Sale Acquisition', 'outcome', Math.round(total * 0.15), 'Acquired at a fraction of peak valuation.', undefined);
  addNode('outcome:bankruptcy', 'Bankruptcy', 'outcome', Math.round(total * 0.2), 'Formal bankruptcy proceedings.', undefined);

  for (const p of patterns) {
    for (const rp of p.relatedPatterns) {
      const target = patterns.find(x => x.shortName === rp || x.name === rp);
      if (target) {
        addLink(`pattern:${p.shortName}`, `pattern:${target.shortName}`, 'Cascading failure', severityStrength(p.severity));
      }
    }
  }

  for (const p of patterns) {
    const def = FAILURE_PATTERN_DEFINITIONS.find(d => d.shortName === p.shortName || d.name === p.name);
    if (!def) continue;
    const matched = companyNodes.filter(c => {
      const { patterns: sp } = deriveInsightsFromCase(c as unknown as CaseStudy);
      return sp.includes(def.id);
    });
    const str = ratioStrength(matched.length / Math.max(total, 1));
    for (const c of matched) {
      addLink(`pattern:${p.shortName}`, `company:${c.slug}`, `${p.shortName}`, str);
    }
  }

  for (const m of mistakes) {
    for (const c of m.supportingCases.slice(0, 5)) {
      addLink(`mistake:${m.mistake}`, `company:${c.slug}`, `${m.mistake}`, 'medium');
    }
  }

  for (const ind of industries) {
    const industryStudies = studies.filter(s => s.industry === ind.industry);
    for (const s of industryStudies.slice(0, 5)) {
      addLink(`industry:${ind.industry}`, `company:${s.slug}`, `${ind.industry}`, ratioStrength(ind.caseCount / Math.max(total, 1)));
    }
  }

  for (const c of companyNodes) {
    addLink(`company:${c.slug}`, 'outcome:collapse', 'Failed', 'strong');
  }

  for (const p of patterns) {
    const def = FAILURE_PATTERN_DEFINITIONS.find(d => d.shortName === p.shortName || d.name === p.name);
    if (!def) continue;
    for (const ind of industries) {
      const industryStudies = studies.filter(s => s.industry === ind.industry);
      if (industryStudies.length === 0) continue;
      const matchCount = industryStudies.filter(s => {
        const { patterns: isp } = deriveInsightsFromCase(s);
        return isp.includes(def.id);
      }).length;
      if (matchCount > 0) {
        addLink(`pattern:${p.shortName}`, `industry:${ind.industry}`, `${matchCount} cases`, ratioStrength(matchCount / ind.caseCount));
      }
    }
  }

  const topMistakes = mistakes.slice(0, 3);
  for (const m of topMistakes) {
    for (const p of patterns.slice(0, 5)) {
      addLink(`mistake:${m.mistake}`, `pattern:${p.shortName}`, 'Related pattern', 'medium');
    }
  }

  for (const model of businessModels.keys()) {
    const modelStudies = studies.filter(s => (s.tags || []).some(t => t.toLowerCase() === model.toLowerCase()));
    for (const s of modelStudies.slice(0, 3)) {
      addLink(`model:${model}`, `company:${s.slug}`, `${model}`, 'weak');
    }
  }

  nodes.forEach(n => {
    n.relatedCount = nodeMap.get(n.id)?.size || 0;
  });

  return { nodes, links };
}

export const getInsightsIntelligenceData = unstable_cache(
  async (): Promise<InsightsIntelligenceData> => {
    if (!isSupabaseConfigured) {
      return deriveFromStaticFiles();
    }

    try {
      const result = await getDb()
        .from('case_studies')
        .select('*')
        .eq('published', true);

      if (result.error || !result.data) {
        return EMPTY_INTELLIGENCE;
      }

      const studies = result.data as CaseStudy[];
      return deriveAllIntelligence(studies);
    } catch {
      return deriveFromStaticFiles();
    }
  },
  ['insights-intelligence'],
  { revalidate: 86400, tags: ['insights', 'stats', 'case-studies'] }
);

function deriveFromStaticFiles(): InsightsIntelligenceData {
  return EMPTY_INTELLIGENCE;
}

function deriveAllIntelligence(studies: CaseStudy[]): InsightsIntelligenceData {
  const discoveries = buildDiscoveries(studies);
  const patterns = buildPatterns(studies);
  const mistakes = buildMistakes(studies);
  const industries = buildIndustries(studies);
  return {
    totalCases: studies.length,
    totalBurned: studies.reduce((sum, s) => sum + getFundingInDollars(s), 0),
    avgLifespan: studies.filter(s => getLifespan(s) > 0).length
      ? Math.round(studies.filter(s => getLifespan(s) > 0).reduce((sum, s) => sum + getLifespan(s), 0) / studies.filter(s => getLifespan(s) > 0).length)
      : 0,
    briefing: buildBriefing(studies),
    featuredDiscovery: buildFeaturedDiscovery(studies, discoveries),
    patterns,
    discoveries,
    leaderboards: buildLeaderboards(studies),
    industries,
    mistakes,
    timeline: buildTimeline(studies),
    comparisons: buildComparisons(studies),
    patternNetwork: buildPatternNetwork(studies),
    intelligenceGraph: buildIntelligenceGraph(studies, patterns, mistakes, industries),
  };
}

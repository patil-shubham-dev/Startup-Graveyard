export type Step = 'PITCH' | 'QUESTIONS' | 'ANALYSIS' | 'REPORT';

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export const SAMPLE_PITCHES = [
  {
    title: "DispatchAI — Decentralized Courier Logistics",
    pitch: "DispatchAI is a real-time, AI-driven dispatching platform for independent regional courier networks. By utilizing reinforcement learning, we dynamically cluster, schedule, and route local shipments. We bypass traditional central hub sorting, cutting delivery overhead by 35% and transit times by 4 hours. However, we face intensive local competition and complex scaling economics across fragmented freight brokerage markets."
  },
  {
    title: "TheraPulse — Biosensor Diagnostic Wearable",
    pitch: "TheraPulse develops a micro-fluidic biosensor patch that monitors vascular inflammation biomarkers in real-time. By coupling continuous biochemical sensing with machine learning algorithms, we predict hyper-acute cardiac events up to 6 hours before symptoms occur. We target clinical cardiology clinics as our primary channel, but face steep FDA regulatory pathways, hardware manufacturing capital constraints, and institutional insurance reimbursement headwinds."
  },
  {
    title: "ScribeVault — Legal Document Synthesizer",
    pitch: "ScribeVault is a privacy-first generative AI agent that ingests thousands of pages of unstructured discovery documentation to construct courtroom-ready diagnostic chronologies and deposition transcripts. Powered by local LLMs, it ensures zero data leaks for high-profile defense firms. Our primary challenges are high custom pipeline implementation costs, long corporate sales cycles, and conservative legal tech adoption rates."
  }
];

export const REPORT_SECTIONS = [
  { id: 'executive-summary', label: 'Executive Summary', icon: 'BookOpen' },
  { id: 'primary-risks', label: 'Primary Risk Vectors', icon: 'Layers' },
  { id: 'failure-scenarios', label: 'Where This Fails', icon: 'AlertTriangle' },
  { id: 'historical-parallels', label: 'Cemetery Parallels', icon: 'Database' },
  { id: 'competitive-threats', label: 'Competitive Threats', icon: 'TrendingUp' },
  { id: 'survival-probability', label: 'Risk Breakdown', icon: 'Cpu' }
];

export const STEP_INFO = [
  { label: 'Diagnose', id: 1, tag: '01' },
  { label: 'Interrogation', id: 2, tag: '02' },
  { label: 'Predict', id: 3, tag: '03' }
];

export function cleanOptionText(text: string) {
  if (!text) return '';
  return text.replace(/^(Option\s+\d+:\s+)?(Optimistic|Realistic|Pessimistic)\s*—\s*/i, '');
}

export function getCurrentVectorInfo(step: Step, currentQuestionIndex: number) {
  if (step === 'PITCH') {
    return { code: 'VEC_INIT', label: 'Awaiting Venture Input', desc: 'Venture pitch parsing inactive. Input model parameters.' };
  }
  if (step === 'QUESTIONS') {
    const vectors = ['VEC_PRODUCT', 'VEC_MARKET', 'VEC_EXECUTION', 'VEC_FINANCIAL', 'VEC_PRODUCT', 'VEC_MARKET', 'VEC_EXECUTION', 'VEC_FINANCIAL'];
    const currentVector = vectors[currentQuestionIndex % vectors.length];
    const labels: Record<string, string> = {
      'VEC_PRODUCT': 'Product-Market Fit Interrogation',
      'VEC_MARKET': 'Market Timing & Category Integrity',
      'VEC_EXECUTION': 'Operational Scalability Analysis',
      'VEC_FINANCIAL': 'Capital Durability Stress Test',
    };
    return {
      code: currentVector,
      label: labels[currentVector] || 'Interrogation Active',
      desc: `Vector scan active. Diagnostic query 0${currentQuestionIndex + 1} of 08 in progress.`
    };
  }
  if (step === 'ANALYSIS') {
    return { code: 'VEC_COMPILING', label: 'Consulting-Grade Synthesis', desc: 'Semantic correlation mapping against historical startup autopsies.' };
  }
  return { code: 'VEC_COMPLETE', label: 'Verdict Compiled', desc: 'Forensic risk report compiled successfully.' };
}

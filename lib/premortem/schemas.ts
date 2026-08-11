import { z } from 'zod';

/**
 * Shared Pre-mortem contracts — used by the API route (zod-validated AI
 * output) and by the client (types). Keeping them in one module guarantees
 * the two sides can never drift apart.
 */

export const QUESTION_CATEGORIES = [
  'Problem',
  'Customer',
  'Market',
  'Competition',
  'Distribution',
  'Monetization',
  'Product',
  'Technology',
  'Team',
  'Timing',
  'Regulation',
  'Capital',
  'Retention',
  'Defensibility',
  'Operational complexity',
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

/**
 * Answer options must be real, distinct choices. Rejects the template
 * leakage LLMs sometimes emit ("allow_custom: true", "Other (please
 * specify)") and empty strings, which would otherwise render as blank
 * radio rows in the interview.
 */
export const BAD_OPTION_PATTERN = /allow_custom|please specify|none of the above|n\/a\b/i;

export const PremortemOptionSchema = z
  .string()
  .trim()
  .min(2, 'Option is too short')
  .max(120, 'Option is too long')
  .refine((s) => !BAD_OPTION_PATTERN.test(s), 'Option contains template text');

export const PremortemQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.enum(QUESTION_CATEGORIES),
  type: z.enum(['single_choice', 'custom']),
  options: z
    .array(PremortemOptionSchema)
    .min(2)
    .max(6)
    .refine((opts) => new Set(opts.map((o) => o.toLowerCase())).size === opts.length, {
      message: 'Duplicate options',
    }),
  allow_custom: z.boolean(),
  /** Internal: the failure pattern this question probes. Never rendered. */
  rationale: z.string(),
});

export type PremortemQuestion = z.infer<typeof PremortemQuestionSchema>;

export const QuestionsResultSchema = z.object({
  questions: z.array(PremortemQuestionSchema).min(4).max(8),
});

export type QuestionsResult = z.infer<typeof QuestionsResultSchema>;

export const RelatedCaseSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  relevance: z.string(),
});

export const ReportRiskSchema = z.object({
  title: z.string(),
  score: z.number().min(0).max(100),
  rationale: z.string(),
  evidence: z.string(),
  related_cases: z.array(RelatedCaseSchema).max(3),
});

export const PremortemReportSchema = z.object({
  startup: z.string(),
  risk_score: z.number().min(0).max(100),
  executive_verdict: z.string(),
  risks: z.array(ReportRiskSchema).min(2).max(6),
  why_this_could_fail: z.array(z.string()).min(2).max(6),
  what_to_test: z.array(z.string()).min(3).max(6),
  early_warning_signals: z.array(z.string()).min(3).max(6),
  verdict: z.string(),
});

export type PremortemReport = z.infer<typeof PremortemReportSchema>;
export type PremortemRisk = z.infer<typeof ReportRiskSchema>;

export const AnswersPayloadSchema = z.record(z.string(), z.string());

export interface QuestionAsked {
  id: string;
  question: string;
  category: QuestionCategory;
}

export const MIN_PITCH_LENGTH = 10;
export const MAX_PITCH_LENGTH = 3000;

/**
 * Request contracts for the /api/pre-mortem endpoint — the single source
 * of truth for what the client may send. The frontend payload is validated
 * against exactly these shapes; drift between client and server is a
 * regression, not a versioning option.
 */
export const GetQuestionsRequestSchema = z
  .object({
    action: z.literal('GET_QUESTIONS'),
    pitch: z
      .string()
      .min(MIN_PITCH_LENGTH, `Pitch must be at least ${MIN_PITCH_LENGTH} characters`)
      .max(MAX_PITCH_LENGTH, 'Pitch is too long'),
    /**
     * Optional answers from earlier rounds. Reserved for adaptive
     * questioning: when present, the remaining questions are regenerated
     * in light of what the founder already said.
     */
    answers: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const GetReportRequestSchema = z
  .object({
    action: z.literal('GET_REPORT'),
    pitch: z.string().min(MIN_PITCH_LENGTH).max(MAX_PITCH_LENGTH),
    questions: z
      .array(PremortemQuestionSchema.pick({ id: true, question: true, category: true }).strict())
      .min(1)
      .max(12),
    answers: z.record(z.string(), z.string()),
    sessionId: z.string().uuid().optional(),
  })
  .strict();

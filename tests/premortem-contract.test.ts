import { describe, it, expect } from 'vitest';
import {
  GetQuestionsRequestSchema,
  GetReportRequestSchema,
  PremortemQuestionSchema,
  MIN_PITCH_LENGTH,
} from '../lib/premortem/schemas';
import { assessIdea } from '../lib/premortem/vague';

/**
 * Regression: the pre-mortem question-generation contract. A valid idea
 * typed into the one-field form must pass every gate between the client
 * payload and the API route. This pins the exact request shape the
 * frontend sends — if the client and server ever drift apart again, this
 * file fails instead of the user seeing a bare error.
 */

const VALID_IDEAS = [
  "I'm building an AI tutor for NEET students that watches their study behavior and creates personalized revision plans.",
  'An AI tutor for NEET students that creates personalized revision plans.',
  'A marketplace connecting independent electricians with homeowners.',
  'A B2B SaaS platform that helps restaurants reduce food waste.',
];

describe('GET_QUESTIONS request contract (the reported bug)', () => {
  it('accepts the exact payload the frontend sends', () => {
    const payload = {
      action: 'GET_QUESTIONS',
      pitch: VALID_IDEAS[0],
    };
    expect(GetQuestionsRequestSchema.safeParse(payload).success).toBe(true);
  });

  it('accepts all three QA startup ideas', () => {
    for (const pitch of VALID_IDEAS) {
      const parsed = GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONS', pitch });
      expect(parsed.success, `idea rejected: ${pitch.slice(0, 50)}`).toBe(true);
    }
  });

  it('accepts an idea with newlines, punctuation and quotes', () => {
    const pitch = 'An AI tutor:\n"it watches" study behavior — creates\npersonalized plans!';
    expect(GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONS', pitch }).success).toBe(true);
  });

  it('rejects a stale payload that sends a different field name', () => {
    // Old/renamed contract — must never be silently accepted.
    const stale = { action: 'GET_QUESTIONS', startupIdea: VALID_IDEAS[0] };
    expect(GetQuestionsRequestSchema.safeParse(stale).success).toBe(false);
  });

  it('rejects unknown actions', () => {
    expect(GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONNAIRE', pitch: VALID_IDEAS[0] }).success).toBe(false);
  });

  it('rejects a missing or too-short pitch', () => {
    expect(GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONS' }).success).toBe(false);
    expect(
      GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONS', pitch: 'x'.repeat(MIN_PITCH_LENGTH - 1) }).success
    ).toBe(false);
  });

  it('rejects a non-string pitch', () => {
    expect(GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONS', pitch: 42 }).success).toBe(false);
    expect(GetQuestionsRequestSchema.safeParse({ action: 'GET_QUESTIONS', pitch: null }).success).toBe(false);
  });
});

describe('GET_REPORT request contract', () => {
  it('accepts the payload the questionnaire sends', () => {
    const payload = {
      action: 'GET_REPORT',
      pitch: VALID_IDEAS[0],
      questions: [
        { id: 'q1', question: 'How will you retain students?', category: 'Retention' },
        { id: 'q2', question: 'How do you reach parents?', category: 'Distribution' },
      ],
      answers: { q1: 'Monthly subscription', q2: 'School partnerships' },
    };
    expect(GetReportRequestSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects a report payload with unknown question fields', () => {
    const bad = {
      action: 'GET_REPORT',
      pitch: VALID_IDEAS[0],
      questions: [{ id: 'q1', question: 'x?', category: 'Retention', options: ['a', 'b'] }],
      answers: {},
    };
    expect(GetReportRequestSchema.safeParse(bad).success).toBe(false);
  });
});

describe('idea validator (assessIdea)', () => {
  it('accepts the user-reported example', () => {
    expect(assessIdea(VALID_IDEAS[0]).tooVague).toBe(false);
  });

  it('accepts all three QA ideas', () => {
    for (const pitch of VALID_IDEAS) {
      expect(assessIdea(pitch).tooVague, `vague: ${pitch.slice(0, 50)}`).toBe(false);
    }
  });
});

describe('question output contract (server → client)', () => {
  const VALID_QUESTION = {
    id: 'q1',
    question: 'How will you reach NEET students who have never heard of your tutor?',
    category: 'Distribution',
    type: 'single_choice',
    options: ['School partnerships', 'Parent referrals', 'Online ads'],
    allow_custom: true,
    rationale: 'Cold-start distribution is the leading cause of failure in this space.',
  };

  it('accepts the documented structured-output shape', () => {
    expect(PremortemQuestionSchema.safeParse(VALID_QUESTION).success).toBe(true);
  });

  it('rejects duplicate options', () => {
    const dupes = { ...VALID_QUESTION, options: ['School partnerships', 'School partnerships', 'Online ads'] };
    expect(PremortemQuestionSchema.safeParse(dupes).success).toBe(false);
  });

  it('rejects template-leak options', () => {
    const junk = { ...VALID_QUESTION, options: ['Real option', 'allow_custom: true', 'Please specify'] };
    expect(PremortemQuestionSchema.safeParse(junk).success).toBe(false);
  });
});

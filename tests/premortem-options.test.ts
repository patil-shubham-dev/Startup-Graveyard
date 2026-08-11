import { describe, it, expect } from 'vitest';
import { normalizeQuestionOptions, cleanOption, REQUIRED_OPTIONS } from '../lib/premortem/options';
import { PremortemQuestionSchema, type PremortemQuestion } from '../lib/premortem/schemas';
import { questionsPrompt } from '../lib/premortem/prompts';

function makeQuestion(overrides: Partial<PremortemQuestion> = {}): PremortemQuestion {
  return {
    id: 'q1',
    question: 'How will you reach your first users?',
    category: 'Distribution',
    type: 'single_choice',
    options: ['School partnerships', 'Parent referrals', 'Online ads'],
    allow_custom: true,
    rationale: 'Probes cold-start distribution.',
    ...overrides,
  } as PremortemQuestion;
}

describe('normalizeQuestionOptions — user-facing option contract', () => {
  it('keeps exactly 3 valid options untouched', () => {
    const q = makeQuestion();
    const { questions, needsRegen } = normalizeQuestionOptions([q]);
    expect(needsRegen).toBe(false);
    expect(questions[0].options).toHaveLength(REQUIRED_OPTIONS);
  });

  it('trims 5 AI options down to exactly 3', () => {
    const q = makeQuestion({
      options: ['A1', 'B2', 'C3', 'D4', 'E5'],
    });
    const { questions, needsRegen } = normalizeQuestionOptions([q]);
    expect(needsRegen).toBe(false);
    expect(questions[0].options).toEqual(['A1', 'B2', 'C3']);
  });

  it('flags needsRegen when fewer than 3 usable options survive', () => {
    const q = makeQuestion({ options: ['Only good option', 'allow_custom: true junk'] });
    const { questions, needsRegen } = normalizeQuestionOptions([q]);
    expect(needsRegen).toBe(true);
    expect(questions[0].options).toEqual(['Only good option']);
  });

  it('drops duplicates case-insensitively', () => {
    const q = makeQuestion({ options: ['School partnerships', 'SCHOOL PARTNERSHIPS', 'Parent referrals'] });
    const { questions, needsRegen } = normalizeQuestionOptions([q]);
    expect(needsRegen).toBe(true); // 2 unique < 3
    expect(questions[0].options).toEqual(['School partnerships', 'Parent referrals']);
  });

  it('forces allow_custom true even when the AI set false', () => {
    const q = makeQuestion({ allow_custom: false });
    const { questions } = normalizeQuestionOptions([q]);
    expect(questions[0].allow_custom).toBe(true);
  });

  it('forces type single_choice even when the AI emitted custom', () => {
    const q = makeQuestion({ type: 'custom' });
    const { questions } = normalizeQuestionOptions([q]);
    expect(questions[0].type).toBe('single_choice');
  });

  it('every normalized question still satisfies the output schema', () => {
    const questions = [
      makeQuestion({ options: ['Partnerships', 'Referrals', 'Ads', 'Campus events', 'Social media'] }),
      makeQuestion({ id: 'q2', options: ['X1', 'Y2', 'Z3'] }),
    ];
    const { questions: out } = normalizeQuestionOptions(questions);
    for (const q of out) {
      expect(PremortemQuestionSchema.safeParse(q).success).toBe(true);
    }
  });
});

describe('cleanOption', () => {
  it('rejects generic advice options the user explicitly forbids', () => {
    for (const bad of ['Conduct research', 'Ask users', 'Improve the product', 'Do market analysis', 'Get feedback']) {
      expect(cleanOption(bad), bad).toBe(null);
    }
  });

  it('rejects template-leak and placeholder options', () => {
    for (const bad of ['allow_custom: true', 'Other (please specify)', 'None of the above', '$X placeholders', '/ / / /']) {
      expect(cleanOption(bad), bad).toBe(null);
    }
  });

  it('accepts concrete, specific options', () => {
    expect(cleanOption('Run controlled trials — compare tutor users against a control group')).not.toBe(null);
  });
});

describe('questionsPrompt — generation inputs', () => {
  it('passes previous answers into subsequent question generation', () => {
    const prompt = questionsPrompt('An AI tutor for NEET students.', '', {
      q1: 'Families pay a monthly subscription after a free trial',
    });
    expect(prompt).toContain('already answered these questions');
    expect(prompt).toContain('q1: Families pay a monthly subscription after a free trial');
  });

  it('contains the original idea verbatim', () => {
    const idea = 'An AI tutor for NEET students that creates personalized revision plans.';
    const prompt = questionsPrompt(idea, '');
    expect(prompt).toContain(`STARTUP IDEA: "${idea}"`);
  });

  it('forbids generic options in the prompt itself', () => {
    const prompt = questionsPrompt('An idea', '');
    expect(prompt).toMatch(/never generic advice/);
    expect(prompt).toContain('Conduct research');
    expect(prompt).toContain('Ask users');
  });

  it('demands exactly 3 options and allow_custom true', () => {
    const prompt = questionsPrompt('An idea', '');
    expect(prompt).toContain('EXACTLY 3 per question');
    expect(prompt).toMatch(/allow_custom.*ALWAYS true/i);
  });
});

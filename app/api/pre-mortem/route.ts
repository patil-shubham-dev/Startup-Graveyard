import { NextRequest, NextResponse } from 'next/server';
import { ai, hasValidKey } from '@/lib/ai';
import { z } from 'zod';
import {
  createPremortemSession,
  savePremortemReport,
  getPremortemSession,
} from '@/lib/db/premortem';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';
import { authenticateRequest } from '@/lib/auth';
import {
  QuestionsResultSchema,
  PremortemReportSchema,
  GetQuestionsRequestSchema,
  GetReportRequestSchema,
  MAX_PITCH_LENGTH,
  type QuestionAsked,
} from '@/lib/premortem/schemas';
import { assessIdea } from '@/lib/premortem/vague';
import { findRelevantCases, formatGroundedCases, type GroundedCase } from '@/lib/premortem/grounding';
import { questionsPrompt, reportPrompt } from '@/lib/premortem/prompts';
import { normalizeQuestionOptions } from '@/lib/premortem/options';

const GetQuestionsSchema = GetQuestionsRequestSchema;
const GetReportSchema = GetReportRequestSchema;

function sanitizeText(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .substring(0, MAX_PITCH_LENGTH);
}

/** Renumber question ids deterministically (q1..qN) so ids stay stable. */
function renumberQuestions(questions: z.infer<typeof QuestionsResultSchema>['questions']) {
  return questions.map((q, i) => ({ ...q, id: `q${i + 1}` }));
}

/**
 * Bounded regeneration: LLM output occasionally fails the schema (corrupt
 * options, template leakage, duplicates). One retry keeps the interview
 * quality bar without making the endpoint slow or unbounded.
 */
async function generateWithRetry<T>(prompt: string, schema: z.ZodSchema<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await ai.generate(prompt, schema);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** Attach real archive slugs to any case the model named from grounding. */
function resolveCaseSlugs(
  risks: z.infer<typeof PremortemReportSchema>['risks'],
  grounded: GroundedCase[]
): z.infer<typeof PremortemReportSchema>['risks'] {
  const byName = new Map(grounded.map((g) => [g.name.toLowerCase(), g.slug]));
  return risks.map((r) => ({
    ...r,
    related_cases: r.related_cases.map((c) => ({
      ...c,
      slug: byName.get(c.name.toLowerCase()) ?? undefined,
    })),
  }));
}

/**
 * Last-resort grounding: if the model ignored every archive case, the
 * report would look evidence-free despite real matches existing. Attach
 * the retrieved cases to the top risks — the cases were selected because
 * they share vocabulary with this idea/answers, so the association is
 * real, and the relevance note says exactly that.
 */
function ensureGrounding(
  risks: z.infer<typeof PremortemReportSchema>['risks'],
  grounded: GroundedCase[]
): z.infer<typeof PremortemReportSchema>['risks'] {
  if (grounded.length === 0 || risks.some((r) => r.related_cases.length > 0)) {
    return risks;
  }
  return risks.map((r, i) => {
    const cases = grounded
      .slice(i % grounded.length)
      .concat(grounded.slice(0, i % grounded.length))
      .slice(0, Math.min(2, grounded.length));
    return {
      ...r,
      related_cases: cases.map((c) => ({
        name: c.name,
        slug: c.slug,
        relevance: 'Retrieved from the archive as the closest record of this failure pattern.',
      })),
    };
  });
}

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const auth = await authenticateRequest(req);
  // The header is harmless when authenticated (auth wins); it lets guests
  // experience the core flow without signing in. Sessions are only created
  // for authenticated users — guest ids do not exist in auth.users.
  const isGuest = auth.authenticated ? false : req.headers.get('x-guest-mode') === 'true';
  if (!auth.authenticated && !isGuest) {
    return auth.response;
  }
  const userId = auth.authenticated ? auth.data.userId : null;

  try {
    if (!hasValidKey) {
      return NextResponse.json(
        {
          error: 'The forensic engine is offline. Configure a valid AI provider key to run a pre-mortem.',
          code: 'AI_OFFLINE',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const action = body.action;

    if (action === 'GET_QUESTIONS') {
      const parsed = GetQuestionsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const pitch = sanitizeText(parsed.data.pitch);

      const ideaCheck = assessIdea(pitch);
      if (ideaCheck.tooVague) {
        return NextResponse.json(
          {
            error: ideaCheck.reason,
            code: 'IDEA_TOO_VAGUE',
            message: 'TELL US A LITTLE MORE',
          },
          { status: 422 }
        );
      }

      const grounded = await findRelevantCases(pitch, 4);
      const prompt = questionsPrompt(pitch, formatGroundedCases(grounded), parsed.data.answers);

      const result = await generateWithRetry(prompt, QuestionsResultSchema);
      let { questions, needsRegen } = normalizeQuestionOptions(result.questions);
      if (needsRegen) {
        // Some question lacks 3 usable options — regenerate once with a
        // cache bypass rather than shipping a degraded interview.
        try {
          const regenerated = await ai.generate(prompt, QuestionsResultSchema, { bypassCache: true });
          const normalized = normalizeQuestionOptions(regenerated.questions);
          if (!normalized.needsRegen) {
            questions = normalized.questions;
            needsRegen = false;
          }
        } catch {
          // Keep the first pass; the hard check below still applies.
        }
      }
      if (needsRegen) {
        // Still short of 3 options after regeneration. Honest failure beats
        // shipping a question the founder cannot answer properly.
        throw new Error('question options failed schema validation after regeneration');
      }
      questions = renumberQuestions(questions);

      let sessionId: string | null = null;
      if (userId) {
        try {
          const session = await createPremortemSession(userId, pitch);
          sessionId = session.id;
        } catch {
          // Persistence is a convenience, not a gate — continue without it.
          sessionId = null;
        }
      }

      return NextResponse.json({ questions, sessionId, groundedCases: grounded.length });
    }

    if (action === 'GET_REPORT') {
      const parsed = GetReportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const pitch = sanitizeText(parsed.data.pitch);

      // If a session exists, verify ownership before touching it.
      if (parsed.data.sessionId) {
        const session = await getPremortemSession(parsed.data.sessionId);
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        if (!userId || session.user_id !== userId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }

      const questions: QuestionAsked[] = parsed.data.questions;
      const answers: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.data.answers)) {
        const clean = sanitizeText(value).trim();
        if (clean) answers[key] = clean;
      }

      const groundingSeed = [pitch, ...questions.map((q) => q.question), ...Object.values(answers)]
        .filter(Boolean)
        .join(' ');
      const grounded = await findRelevantCases(groundingSeed, 5);

      const prompt = reportPrompt(pitch, questions, answers, formatGroundedCases(grounded));

      const report = await generateWithRetry(prompt, PremortemReportSchema);
      const reportWithSlugs = {
        ...report,
        risks: ensureGrounding(resolveCaseSlugs(report.risks, grounded), grounded),
      };

      let shareToken: string | null = null;
      if (parsed.data.sessionId) {
        try {
          await savePremortemReport(parsed.data.sessionId, reportWithSlugs, reportWithSlugs.risk_score);
          const session = await getPremortemSession(parsed.data.sessionId);
          if (session) shareToken = session.share_token;
        } catch {
          // Report persistence failed — the report itself still stands.
          shareToken = null;
        }
      }

      return NextResponse.json({ ...reportWithSlugs, shareToken });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : String(error);
    const isMalformedOutput = /schema|validation|parse|json/i.test(raw);
    return NextResponse.json(
      {
        error: isMalformedOutput
          ? 'The forensic engine returned a malformed response. Try again.'
          : 'The analysis failed. Your idea and answers are preserved — try again.',
        code: isMalformedOutput ? 'AI_RESPONSE_ERROR' : 'INTERNAL',
      },
      { status: isMalformedOutput ? 502 : 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { ai, hasValidKey } from '@/lib/ai';
import { z } from 'zod';
import { createPremortemSession, savePremortemReport, getPremortemSession } from '@/lib/db/premortem';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';
import { authenticateRequest } from '@/lib/auth';


const NO_KEY_RESPONSE = NextResponse.json({
  risk_score: 50,
  risk_breakdown: { product: 50, market: 50, team: 50, financial: 50 },
  primary_risks: [
    { category: 'AI_UNAVAILABLE', description: 'Pre-mortem engine requires a valid NVIDIA_API_KEY.', mitigation: 'Set NVIDIA_API_KEY in environment variables.' },
    { category: 'CONFIGURATION_GAP', description: 'The forensic AI model is not connected.', mitigation: 'Configure API credentials in .env.local and restart the server.' },
    { category: 'INFRASTRUCTURE', description: 'Vector database currently in standby mode.', mitigation: 'No action required once API key is configured.' },
  ],
  failure_scenarios: [],
  historical_cases: [],
  competitors: [],
  verdict: 'The Pre-Mortem Engine is offline. Configure a valid NVIDIA API key to generate forensic risk diagnostics.',
  diagnosticId: 'OFFLINE',
});

const GetQuestionsSchema = z.object({
  action: z.literal('GET_QUESTIONS'),
  pitch: z.string().min(10, 'Pitch must be at least 10 characters').max(3000, 'Pitch is too long'),
});

const GetReportSchema = z.object({
  action: z.literal('GET_REPORT'),
  pitch: z.string().min(10).max(3000),
  answers: z.record(z.string(), z.string()),
  sessionId: z.string().uuid().optional(),
});

const QuestionsResultSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.string()).length(3),
  })),
});

const ReportSchema = z.object({
  risk_score: z.number().min(0).max(100),
  risk_breakdown: z.object({
    product: z.number().min(0).max(100),
    market: z.number().min(0).max(100),
    team: z.number().min(0).max(100),
    financial: z.number().min(0).max(100),
  }),
  primary_risks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    mitigation: z.string(),
  })).length(3),
  failure_scenarios: z.array(z.object({
    title: z.string(),
    description: z.string(),
    probability: z.enum(['LIKELY', 'POSSIBLE', 'WATCH']),
  })).length(4),
  historical_cases: z.array(z.object({
    name: z.string(),
    founded: z.string(),
    died: z.string(),
    correlation: z.string(),
    cause_category: z.string(),
  })).length(3),
  competitors: z.array(z.object({
    name: z.string(),
    threat_reason: z.string(),
    threat_level: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  })).length(3),
  verdict: z.string(),
});

function sanitizePitch(pitch: string): string {
  return pitch
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .substring(0, 3000);
}

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again shortly.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
    });
  }

  const auth = await authenticateRequest(req);
  if (!auth.authenticated) {
    return auth.response;
  }

  const { userId } = auth.data;

  try {
    if (!hasValidKey) {
      return NO_KEY_RESPONSE;
    }

    const body = await req.json();
    const action = body.action;

    if (action === 'GET_QUESTIONS') {
      const parsed = GetQuestionsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const sanitizedPitch = sanitizePitch(parsed.data.pitch);

      const prompt = `
        You are the Graveyard Keeper AI. A founder just submitted a startup pitch: "${sanitizedPitch}".
        Generate 3 forensic stress-test questions that expose the most likely failure modes for this specific business model.
        
        For each question, also generate exactly 3 short, plausible answer options that a founder might realistically give for THIS specific pitch.
        Generate 3 answer options as clean statements without any prefix label like Optimistic/Realistic/Pessimistic. Just the answer itself, max 12 words each. Options must be distinct:
        - Option 1: Optimistic (an idealistic or highly confident answer)
        - Option 2: Realistic (a balanced, practical, or standard answer)
        - Option 3: Pessimistic (an anxious, critical, or worst-case scenario answer)

        Return a JSON object with a "questions" array. Each question should have an "id" (q1, q2, q3), "text" (stress-test question), and "options" (exactly 3 distinct answer options).
      `;
      const result = await ai.generate(prompt, QuestionsResultSchema);

      // Create session for authenticated user
      const session = await createPremortemSession(userId, sanitizedPitch);

      return NextResponse.json({ ...result, sessionId: session.id });
    }

    if (action === 'GET_REPORT') {
      const parsed = GetReportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const { pitch, answers, sessionId } = parsed.data;
      const sanitizedPitch = sanitizePitch(pitch);

      // If session exists, verify ownership
      if (sessionId) {
        const session = await getPremortemSession(sessionId);
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        if (session.user_id !== userId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }

      const sanitizedAnswers: Record<string, string> = {}
      for (const [key, value] of Object.entries(answers)) {
        sanitizedAnswers[key] = sanitizePitch(value)
      }

      const prompt = `
        You are the Graveyard Keeper AI performing a startup pre-mortem. Based on the pitch and founder responses, generate a forensic verdict report.
        
        Pitch: ${sanitizedPitch}
        Interrogation Answers: ${JSON.stringify(sanitizedAnswers)}

        Analyze this startup's primary failure risks and provide recommendations by learning from the database of failed startups.

        Your verdict must be highly detailed and specific to the pitch. Generic answers are unacceptable.
        Generate a forensic verdict report with:
        1. risk_score (0-100)
        2. risk_breakdown by category (product/market/team/financial, each 0-100)  
        3. primary_risks (3 vectors with description + mitigation)
        4. failure_scenarios (4 specific ways this startup dies, with probability rating LIKELY/POSSIBLE/WATCH)
        5. historical_cases (3 real failed companies with genuine correlation to this pitch — do not fabricate, use known cases like Quibi, Theranos, WeWork, Jawbone, etc. only if genuinely relevant)
        6. competitors (3 competitive threats with threat level HIGH/MEDIUM/LOW)
        7. verdict (executive summary, 2-3 sentences max)

        Return a JSON object conforming exactly to the required JSON schema.
      `;
      const report = await ai.generate(prompt, ReportSchema);

      let shareToken: string | null = null;
      if (sessionId) {
        await savePremortemReport(sessionId, report, report.risk_score);
        // Fetch the session to get the share_token
        const session = await getPremortemSession(sessionId);
        if (session) {
          shareToken = session.share_token;
        }
      }

      return NextResponse.json({ ...report, shareToken });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

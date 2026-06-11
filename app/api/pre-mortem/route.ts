/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { ai, hasValidKey } from '@/lib/ai';
import { z } from 'zod';
import { createPremortemSession, savePremortemReport } from '@/lib/db/premortem';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';

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

const QuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.string()).length(3)
  }))
});

const ReportSchema = z.object({
  risk_score: z.number().min(0).max(100),
  risk_breakdown: z.object({
    product: z.number().min(0).max(100),
    market: z.number().min(0).max(100),
    team: z.number().min(0).max(100),
    financial: z.number().min(0).max(100)
  }),
  primary_risks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    mitigation: z.string()
  })).length(3),
  failure_scenarios: z.array(z.object({
    title: z.string(),
    description: z.string(),
    probability: z.enum(['LIKELY', 'POSSIBLE', 'WATCH'])
  })).length(4),
  historical_cases: z.array(z.object({
    name: z.string(),
    founded: z.string(),
    died: z.string(),
    correlation: z.string(),
    cause_category: z.string()
  })).length(3),
  competitors: z.array(z.object({
    name: z.string(),
    threat_reason: z.string(),
    threat_level: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })).length(3),
  verdict: z.string()
});

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again shortly.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) },
    });
  }

  try {
    if (!hasValidKey) {
      return NO_KEY_RESPONSE;
    }

    const body = await req.json();
    if (body.action === 'GET_QUESTIONS') {
      const prompt = `
        You are the Graveyard Keeper AI. A founder just submitted a startup pitch: "${body.pitch}".
        Generate 3 forensic stress-test questions that expose the most likely failure modes for this specific business model.
        
        For each question, also generate exactly 3 short, plausible answer options that a founder might realistically give for THIS specific pitch.
        Generate 3 answer options as clean statements without any prefix label like Optimistic/Realistic/Pessimistic. Just the answer itself, max 12 words each. Options must be distinct:
        - Option 1: Optimistic (an idealistic or highly confident answer)
        - Option 2: Realistic (a balanced, practical, or standard answer)
        - Option 3: Pessimistic (an anxious, critical, or worst-case scenario answer)

        Return a JSON object with a "questions" array. Each question should have an "id" (q1, q2, q3), "text" (stress-test question), and "options" (exactly 3 distinct answer options).
      `;
      const result = await ai.generate(prompt, QuestionsSchema);
      
      // If user is authenticated, create a session
      let sessionId = null;
      if (body.userId) {
        const session = await createPremortemSession(body.userId, body.pitch);
        sessionId = session.id;
      }

      return NextResponse.json({ ...result, sessionId });
    }

    if (body.action === 'GET_REPORT') {
      const { pitch, answers, sessionId } = body;
      const prompt = `
        You are the Graveyard Keeper AI performing a startup pre-mortem. Based on the pitch and founder responses, generate a forensic verdict report.
        
        Pitch: ${pitch}
        Interrogation Answers: ${JSON.stringify(answers)}

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

      // If session exists, save the report
      if (sessionId) {
        await savePremortemReport(sessionId, report as any, report.risk_score);
      }

      return NextResponse.json(report);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Pre-mortem error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

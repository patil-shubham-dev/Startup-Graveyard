import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/ai';
import { z } from 'zod';
import { getGlobalStats } from '@/lib/db/case-studies';
import { createPremortemSession, savePremortemReport } from '@/lib/db/premortem';

const QuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.string()).length(3)
  }))
});

const ReportSchema = z.object({
  risk_score: z.number().min(0).max(100),
  primary_risks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    mitigation: z.string()
  })),
  similar_cases: z.array(z.object({
    name: z.string(),
    correlation: z.string()
  })),
  verdict: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stats = await getGlobalStats();
    
    // Ensure we are using the most stable model
    const MODEL_ID = process.env.AI_DEFAULT_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct';
    
    if (body.action === 'GET_QUESTIONS') {
      const prompt = `
        You are the Graveyard Keeper AI. A founder just submitted a startup pitch: "${body.pitch}".
        Generate 3 forensic stress-test questions that expose the most likely failure modes for this specific business model.
        
        For each question, also generate exactly 3 short, plausible answer options (each under 15 words) that a founder might realistically give for THIS specific pitch. Options must be distinct:
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
        You are the Graveyard Keeper AI. Perform a startup pre-mortem analysis.
        
        Pitch: ${pitch}
        Interrogation Answers: ${JSON.stringify(answers)}

        Identify the most likely causes of failure based on historical patterns of ${stats.totalCases} failed startups in your archive.
        Return a JSON object following this schema:
        {
          "risk_score": number (0-100),
          "primary_risks": [{"category": string, "description": string, "mitigation": string}],
          "similar_cases": [{"name": string, "correlation": string}],
          "verdict": string
        }
      `;
      const report = await ai.generate(prompt, ReportSchema);

      // If session exists, save the report
      if (sessionId) {
        await savePremortemReport(sessionId, report, report.risk_score);
      }

      return NextResponse.json(report);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Pre-mortem error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

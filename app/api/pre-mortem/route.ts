import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/ai';
import { z } from 'zod';
import { getGlobalStats } from '@/lib/db/case-studies';

const QuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    text: z.string()
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
    
    if (body.action === 'GET_QUESTIONS') {
      const prompt = `
        You are the Graveyard Keeper AI. A founder just submitted a startup pitch: "${body.pitch}".
        Generate 3 forensic stress-test questions that expose the most likely failure modes for this specific business model.
        Return a JSON object with a "questions" array. Each question should have an "id" (q1, q2, q3) and "text".
      `;
      const result = await ai.generate(prompt, QuestionsSchema);
      return NextResponse.json(result);
    }

    if (body.action === 'GET_REPORT') {
      const { pitch, answers } = body;
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
      return NextResponse.json(report);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Pre-mortem error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

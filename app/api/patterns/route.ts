import { NextRequest, NextResponse } from 'next/server';
import { ai, hasValidKey } from '@/lib/ai';
import { z } from 'zod';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';
import { authenticateRequest } from '@/lib/auth';

const PatternsSchema = z.object({
  industry: z.string().max(100).optional(),
  keywords: z.string().max(500).optional(),
});

const AIResponseSchema = z.object({
  patterns: z.array(z.object({
    name: z.string(),
    frequency_pct: z.number(),
    severity: z.enum(['high', 'medium', 'low']),
    description: z.string(),
    warning_signs: z.array(z.string()),
    mitigation: z.string(),
  })),
  top_insight: z.string(),
});

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const auth = await authenticateRequest(req);
  const isGuest = auth.authenticated ? false : req.headers.get('x-guest-mode') === 'true';
  if (!auth.authenticated && !isGuest) return auth.response;

  if (!hasValidKey) {
    return NextResponse.json({ patterns: [], message: 'Pattern discovery requires a valid NVIDIA_API_KEY.' });
  }

  try {
    const body = await req.json();
    const parsed = PatternsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { industry, keywords } = parsed.data;

    const prompt = `Analyze these failure patterns and identify recurring themes in business failures.
${industry ? `Focus on the ${industry} industry.` : ''}
${keywords ? `Keywords of interest: ${keywords}` : ''}

Known failure patterns (approximate frequencies based on archive analysis):
1. "Product-Market Fit Failures" — building something nobody wants
2. "Burn Rate Failures" — burning through capital without sustainable unit economics
3. "Leadership Failures" — founder conflict, poor decisions kill execution
4. "Timing Failures" — right idea, wrong moment
5. "Scaling Failures" — growing too fast without operational foundation
6. "Competition Failures" — outmaneuvered by rivals or market shifts

Estimate frequency percentages based on the available context, not fabricated statistics.

Return a JSON object with:
{
  "patterns": [
    {
      "name": string,
      "frequency_pct": number,
      "severity": "high" | "medium" | "low",
      "description": string,
      "warning_signs": string[],
      "mitigation": string
    }
  ],
  "top_insight": string
}`;

    const result = await ai.generate(prompt, AIResponseSchema);

    const parsedResult = result.patterns.length > 0 ? result : {
      patterns: [{ name: 'Analysis Error', frequency_pct: 0, severity: 'low', description: 'Could not parse AI response', warning_signs: [], mitigation: 'Try again' }],
      top_insight: 'Analysis unavailable.',
    };

    return NextResponse.json(parsedResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pattern discovery failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    patterns: [
      { name: 'Product-Market Fit Failures', frequency_pct: null, severity: 'high', description: 'Building a product nobody wants — the most commonly observed failure pattern in the archive.', warning_signs: ['Low organic demand', 'No customer validation', 'High churn'], mitigation: 'Validate demand before building.' },
      { name: 'Burn Rate Failures', frequency_pct: null, severity: 'high', description: 'Running out of money before reaching profitability — extremely common across all stages.', warning_signs: ['Burn rate exceeds revenue', 'No path to positive unit economics', 'Frequent fundraising'], mitigation: 'Extend runway, focus on revenue.' },
      { name: 'Leadership Failures', frequency_pct: null, severity: 'medium', description: 'Founder conflict or poor decisions lead to collapse.', warning_signs: ['Founder exits', 'Key departures', 'Decision paralysis'], mitigation: 'Founder agreements, clear roles.' },
      { name: 'Timing Failures', frequency_pct: null, severity: 'medium', description: 'Right idea deployed at the wrong moment.', warning_signs: ['Market not ready', 'Regulatory headwinds', 'Too early for adoption'], mitigation: 'Monitor market readiness signals.' },
      { name: 'Scaling Failures', frequency_pct: null, severity: 'medium', description: 'Growing too fast without operational foundation.', warning_signs: ['Hiring ahead of revenue', 'Multiple failed pivots', 'Operational chaos'], mitigation: 'Match growth to operational capacity.' },
      { name: 'Competition Failures', frequency_pct: null, severity: 'low', description: 'Outmaneuvered by rivals or market shifts.', warning_signs: ['Market share decline', 'Pricing pressure', 'Competitor funding rounds'], mitigation: 'Differentiate, build moats, monitor competitive landscape.' },
    ],
    top_insight: 'Product-Market Fit Failures and Burn Rate Failures are the two most frequently observed patterns in the archive. Addressing these two categories would address the majority of preventable startup deaths.',
  });
}

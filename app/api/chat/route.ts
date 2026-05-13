import { streamText } from 'ai';
import { nvidia } from '@/lib/ai';
import { getGlobalStats } from '@/lib/db/case-studies';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const stats = await getGlobalStats();

    const result = streamText({
      model: nvidia.chat(process.env.AI_DEFAULT_MODEL || 'deepseek-ai/deepseek-v4-pro'),
      system: `You are the Graveyard Keeper AI. You are a forensic startup researcher. 
      Your tone is professional, analytical, and slightly grim. 
      You have access to ${stats.totalCases} historical startup autopsies in the archive.
      When discussing failures, be specific about burn rates, PMF, and execution errors.
      Always maintain the "Forensic Intelligence" persona.`,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI Route Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

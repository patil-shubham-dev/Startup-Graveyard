import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configure the NVIDIA provider
const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: nvidia('nvidia/deepseek-v3'),
    system: `You are the Graveyard Keeper AI. You are a forensic startup researcher. 
    Your tone is professional, analytical, and slightly grim. 
    You have access to 1,024 historical startup autopsies.
    When discussing failures, be specific about burn rates, PMF, and execution errors.
    Always maintain the "Forensic Intelligence" persona.`,
    messages,
  });

  return result.toDataStreamResponse();
}

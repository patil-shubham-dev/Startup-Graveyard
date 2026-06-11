/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const hasValidKey = NVIDIA_API_KEY.length > 20 && !NVIDIA_API_KEY.includes('your-nvidia');
const MODEL_ID = process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct';

let nvidia: ReturnType<typeof createOpenAI> | null = null;
if (hasValidKey) {
  nvidia = createOpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });
}

function getMessageText(message: Record<string, unknown>): string {
  if (!message) return '';
  if (typeof message.content === 'string' && message.content) return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('\n');
  }
  return '';
}

function convertUIMessages(messages: Record<string, unknown>[]) {
  const roleMap: Record<string, 'user' | 'assistant' | 'system'> = {
    user: 'user',
    assistant: 'assistant',
    system: 'system',
  };
  return messages.map(m => ({
    role: roleMap[String(m.role || '')] || ('user' as const),
    content: getMessageText(m),
  }));
}

const SYSTEM_PROMPT = `You are the Graveyard Keeper, a forensic investigator for failed startups. 
Speak in a highly clear, professional, and engaging yet slightly somber tone. 
CRITICAL REQUIREMENT: Use simple, easy-to-understand, and highly accessible language. 
Avoid overly complex business jargon, dense academic phrasing, or unnecessary consulting buzzwords. 
Instead of saying "exhibited severe mismatch in cash flow runway optimization under market validation deficits," say "ran out of money because they built something people did not actually want to pay for."
Explain concepts, lessons, and patterns of failure in a direct, clear, and educational way so that any founder, investor, or student can immediately grasp them.

When mentioning a startup that exists in our archive, wrap its name in [[Startup Name]].

CRITICAL INSTRUCTION:
At the very end of EVERY response, you MUST append a horizontal line separator (---) followed by a concise 1-2 sentence high-level recap summarizing the core reasons of the startup's collapse or failure pattern.
This recap must be preceded by a dynamic, creative, high-tech, or clinical header utilizing varied, descriptive forensic terminology. Do NOT use the exact same header vocabulary (like "In short" or "Summary") in consecutive answers—vary it creatively every single time.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const rateLimit = checkRateLimit(getRateLimitKey(req));
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded. Try again shortly.',
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
      },
    });
  }

  try {
    const body = await req.json();
    const messages = body.messages || [];

    if (!nvidia || !hasValidKey) {
      return new Response(JSON.stringify({
        role: 'assistant',
        content: "Forensic Intelligence Offline.\n\nThe Graveyard Keeper AI requires a valid NVIDIA API key to analyze startup failure patterns. Please configure `NVIDIA_API_KEY` in your environment variables and restart the server.\n\n---\n### SYSTEM_STATUS\n**VECTOR_ENGINE:** UNAVAILABLE\n**AI_MODEL:** NOT_CONFIGURED\n**AUTOPSY_DB:** STANDBY",
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastMessage = getMessageText(messages[messages.length - 1]);
    let context = '';

    if (lastMessage) {
      try {
        const embedText = lastMessage.length > 1000
          ? lastMessage.substring(0, 500) + '\n...\n' + lastMessage.substring(lastMessage.length - 500)
          : lastMessage;

        const { ai } = await import('@/lib/ai');

        const similarCases = await ai.search(embedText);

        if (similarCases && similarCases.length > 0) {
          context = similarCases.map(c =>
            `Case: ${c.company_name}
             Summary: ${c.summary}`
          ).join('\n\n');
        }
      } catch (ragError: any) {
        console.error('[Chat API] RAG error:', ragError);
      }
    }

    const customContext = body.context || '';
    const fullSystemPrompt = `${SYSTEM_PROMPT}
      
      ${customContext ? `SPECIAL_TASK: ${customContext}` : 'Analyze the failure patterns of startups based on available data.'}
      
      ARCHIVE_CONTEXT:
      ${context}`;

    const result = streamText({
      model: nvidia.chat(MODEL_ID),
      messages: convertUIMessages(messages),
      system: fullSystemPrompt,
    });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const { textStream } = result;
        const msgId = `msg-${Date.now()}`;
        writer.write({ type: 'text-start', id: msgId });
        for await (const chunk of textStream) {
          writer.write({ type: 'text-delta', id: msgId, delta: chunk });
        }
        writer.write({ type: 'text-end', id: msgId });
      },
      originalMessages: messages,
      onError: (error) => {
        console.error('[Chat API] Stream error:', error);
        return 'An error occurred during streaming.';
      },
    });

    const response = createUIMessageStreamResponse({ stream });
    response.headers.set('X-Timing-Ms', String(Date.now() - startTime));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    return response;

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal Server Error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, streamText } from 'ai';
import type { ModelMessage } from 'ai';
import { ZodSchema } from 'zod';
import OpenAI from 'openai';
import { LRUCache } from 'lru-cache';
import { searchCaseStudies } from '@/lib/db/case-studies';

export type Message = ModelMessage;

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const hasValidKey = NVIDIA_API_KEY.length > 20 && !NVIDIA_API_KEY.includes('your-nvidia');

const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct';

// Optional fallback provider (OpenAI-compatible gateway). When both
// OPENAI_API_KEY and OPENAI_BASE_URL are set, generation gracefully
// degrades to it if NVIDIA is unavailable or errors out.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || '';
const hasOpenAICompatFallback = OPENAI_API_KEY.length > 20 && OPENAI_BASE_URL.startsWith('https://');

let nvidiaInstance: ReturnType<typeof createOpenAI> | null = null;
let openaiInstance: OpenAI | null = null;
let openaiCompatInstance: ReturnType<typeof createOpenAI> | null = null;

if (hasValidKey) {
  nvidiaInstance = createOpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  openaiInstance = new OpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 30000,
    maxRetries: 2,
  });
}

if (hasOpenAICompatFallback) {
  openaiCompatInstance = createOpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: OPENAI_BASE_URL,
  });
}

export { hasValidKey };

export function getNvidiaModel(modelId?: string) {
  if (!nvidiaInstance || !hasValidKey) return null;
  return nvidiaInstance.chat(modelId || DEFAULT_MODEL);
}

const embeddingCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

const responseCache = new LRUCache<string, string>({
  max: 200,
  ttl: 1000 * 60 * 60,
});

function normalizeQuery(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildCacheKey(prefix: string, messages: Message[], system?: string): string {
  const lastMsg = messages[messages.length - 1];
  const text = typeof lastMsg?.content === 'string' ? lastMsg.content : '';
  return `${prefix}:${normalizeQuery(text)}:${(system || '').slice(0, 100)}`;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async chat(messages: Message[], system?: string): Promise<ReadableStream> {
    if (!nvidiaInstance || !hasValidKey) {
      throw new Error('AI service: NVIDIA_API_KEY not configured');
    }

    const cacheKey = buildCacheKey('chat', messages, system);
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(cached));
          controller.close();
        },
      });
    }

    const result = streamText({
      model: nvidiaInstance.chat(DEFAULT_MODEL),
      system,
      messages,
    });

    return result.toUIMessageStreamResponse().body!;
  }

  async embed(text: string): Promise<number[]> {
    if (!openaiInstance || !hasValidKey) {
      throw new Error('AI service: NVIDIA_API_KEY not configured');
    }

    const normalized = normalizeQuery(text);
    const cached = embeddingCache.get(normalized);
    if (cached) {
      return cached;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await openaiInstance.embeddings.create({
        model: 'nvidia/nv-embedqa-e5-v5',
        input: text,
        input_type: 'query',
      } as never, {
        signal: controller.signal,
      });

      const embedding = response.data[0].embedding;
      embeddingCache.set(normalized, embedding);
      return embedding;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generate<T>(
    prompt: string,
    schema: ZodSchema<T>,
    opts?: { bypassCache?: boolean }
  ): Promise<T> {
    if (!hasValidKey && !hasOpenAICompatFallback) {
      throw new Error('AI service: no AI provider configured (set NVIDIA_API_KEY, or OPENAI_API_KEY + OPENAI_BASE_URL)');
    }

    const cacheKey = `generate:${normalizeQuery(prompt)}`;
    if (!opts?.bypassCache) {
      const cached = responseCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error('AI generation timed out after 20s')), 20000);

    // Provider chain: NVIDIA first, then the OpenAI-compatible fallback.
    // Structured generation is the site's critical path, so a provider
    // failure degrades to the next configured provider instead of a 500.
    const providers: Array<{ name: string; instance: ReturnType<typeof createOpenAI> | null }> = [];
    if (hasValidKey) providers.push({ name: 'nvidia', instance: nvidiaInstance });
    if (hasOpenAICompatFallback) providers.push({ name: 'openai-compat', instance: openaiCompatInstance });

    let lastError: Error | null = null;
    try {
      for (const provider of providers) {
        if (!provider.instance) continue;
        try {
          const { object } = await generateObject({
            model: provider.instance.chat(DEFAULT_MODEL),
            schema: schema,
            prompt: prompt,
          });

          responseCache.set(cacheKey, JSON.stringify(object));
          return object as T;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`AI provider "${provider.name}" failed: ${lastError.message}`);
        }
      }
      throw lastError ?? new Error('AI service: no providers available');
    } finally {
      clearTimeout(timeout);
    }
  }

  async search(text: string): Promise<Array<{ company_name: string; summary: string; slug: string; similarity: number }>> {
    const normalized = normalizeQuery(text);
    const cacheKey = `search:${normalized}`;
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const embedText = text.length > 1000
      ? text.substring(0, 500) + '\n...\n' + text.substring(text.length - 500)
      : text;

    const embedding = await this.embed(embedText);
    const results = await searchCaseStudies(embedding, 7);

    responseCache.set(cacheKey, JSON.stringify(results));
    return results;
  }

  getEmbeddingCache() {
    return embeddingCache;
  }

  getResponseCache() {
    return responseCache;
  }
}

export const ai = AIService.getInstance();

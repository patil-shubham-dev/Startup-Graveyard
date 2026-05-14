import { createOpenAI } from '@ai-sdk/openai';
import { ModelMessage, generateObject, embed, streamText } from 'ai';
import { ZodSchema } from 'zod';

export type Message = ModelMessage;

// Default provider configuration
const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || 'deepseek-ai/deepseek-v4-pro';

/**
 * NVIDIA NIM Provider Instance
 */
export const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

/**
 * AI Service Layer - Provider Agnostic Interface
 * Refactored to use Vercel AI SDK for robustness and consistency.
 */
export class AIService {
  private static instance: AIService;
  
  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Simple chat completion (streaming)
   * Note: For direct use in React components, use useChat which calls /api/chat
   */
  async chat(messages: Message[], system?: string): Promise<ReadableStream> {
    const result = streamText({
      model: nvidia.chat(DEFAULT_MODEL),
      system,
      messages,
    });

    return result.toUIMessageStreamResponse().body!;
  }

  /**
   * Generate embeddings
   */
  async embed(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: nvidia.embedding('nvidia/nv-embedqa-e5-v5'),
      value: text,
    });
    return embedding;
  }

  /**
   * Structured data generation with Zod validation
   */
  async generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
    const { object } = await generateObject({
      model: nvidia.chat(DEFAULT_MODEL),
      schema: schema,
      prompt: prompt,
    });

    return object as T;
  }
}

export const ai = AIService.getInstance();

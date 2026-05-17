/* eslint-disable @typescript-eslint/no-explicit-any */
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, embed, streamText } from 'ai';
import { ZodSchema } from 'zod';
import OpenAI from 'openai';

export type Message = any;

// Default provider configuration
const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct';

/**
 * NVIDIA NIM Provider Instance (AI SDK)
 */
export const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

/**
 * Standard OpenAI Client (for specific parameter support like input_type)
 */
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

/**
 * AI Service Layer - Provider Agnostic Interface
 * Refactored for AI SDK v6 compatibility and NVIDIA NIM specific requirements.
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
   */
  async chat(messages: Message[], system?: string): Promise<ReadableStream> {
    const result = streamText({
      model: nvidia.chat(DEFAULT_MODEL), // Use .chat() for standard OpenAI compatibility in v6
      system,
      messages,
    });

    return result.toUIMessageStreamResponse().body!;
  }

  /**
   * Generate embeddings using standard OpenAI client to support input_type
   */
  async embed(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'nvidia/nv-embedqa-e5-v5',
      input: text,
      // @ts-ignore - input_type is required by NVIDIA NIM but not in standard OpenAI types
      input_type: 'query'
    });
    return response.data[0].embedding;
  }

  /**
   * Structured data generation with Zod validation
   */
  async generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
    const { object } = await generateObject({
      model: nvidia.chat(DEFAULT_MODEL), // Use .chat() to avoid /responses 404
      schema: schema,
      prompt: prompt,
    });

    return object as T;
  }
}

export const ai = AIService.getInstance();

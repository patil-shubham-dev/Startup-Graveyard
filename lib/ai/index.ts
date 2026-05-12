import { ZodSchema } from 'zod';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  chat(messages: Message[], system?: string): Promise<ReadableStream>;
  embed(text: string): Promise<number[]>;
  generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
}

// Default provider configuration
const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || 'google/gemini-2.0-flash-001';

/**
 * AI Service Layer - Provider Agnostic Interface
 * Currently defaults to OpenRouter/Gemini but architected for fallback.
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
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Chat request failed: ${response.statusText}`);
    }

    return response.body!;
  }

  /**
   * Generate embeddings
   */
  async embed(text: string): Promise<number[]> {
    const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nv-embedqa-e5-v5',
        input: text,
        input_type: 'query',
        encoding_format: 'float',
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Structured data generation with Zod validation
   */
  async generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T> {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Improved JSON extraction using regex to handle potential conversational wrapper text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to extract JSON from AI response: ${content}`);
    }

    try {
      const result = JSON.parse(jsonMatch[0]);
      return schema.parse(result);
    } catch (e) {
      console.error('JSON Parse Error:', e, 'Raw content:', content);
      throw e;
    }
  }
}

export const ai = AIService.getInstance();

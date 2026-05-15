import { NextRequest } from 'next/server';
import { ai, nvidia } from '@/lib/ai';
import { streamText } from 'ai';
import { searchCaseStudies } from '@/lib/db/case-studies';

// Use the robust model from AIService defaults
const MODEL_ID = process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || '';

    console.log('[Chat API] Request received:', { 
      messageCount: messages?.length,
      lastMessage: lastMessage.substring(0, 50) + '...'
    });

    // 1. Get relevant context from vector database
    let context = '';
    try {
      const embedding = await ai.embed(lastMessage);
      const similarCases = await searchCaseStudies(embedding, 3);
      
      if (similarCases && similarCases.length > 0) {
        context = similarCases.map(c => 
          `Case: ${c.company_name}
           Summary: ${c.summary}`
        ).join('\n\n');
        console.log('[Chat API] RAG context retrieved from', similarCases.length, 'cases');
      }
    } catch (ragError) {
      console.error('[Chat API] RAG error:', ragError);
      // Fallback: Continue without context rather than failing
    }

    // 2. Generate response (streaming)
    const result = streamText({
      model: nvidia(MODEL_ID),
      messages,
      system: `You are the Graveyard Keeper, a forensic investigator for failed startups. 
      Use the following case studies from our archive to provide evidence-based analysis:
      
      ${context}
      
      Speak in a professional, clinical, yet slightly somber tone. Focus on forensic facts and patterns of failure.
      When mentioning a startup that exists in our archive (like those in the context above), wrap its name in [[Startup Name]] for the system to identify.`,
    });

    console.log('[Chat API] Streaming started');
    
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('[Chat API] Fatal error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

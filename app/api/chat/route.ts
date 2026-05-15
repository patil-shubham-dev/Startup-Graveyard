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
    const customContext = body.context || '';
    const systemPrompt = `You are the Graveyard Keeper, a forensic investigator for failed startups. 
      ${customContext ? `SPECIAL_TASK: ${customContext}` : 'Analyze the failure patterns of startups based on available data.'}
      
      ARCHIVE_CONTEXT:
      ${context}
      
      Speak in a professional, clinical, yet slightly somber tone. Focus on forensic facts and patterns of failure.
      When mentioning a startup that exists in our archive, wrap its name in [[Startup Name]].`;

    const result = streamText({
      model: nvidia(MODEL_ID),
      messages,
      system: systemPrompt,
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

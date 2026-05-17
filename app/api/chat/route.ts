import { NextRequest } from 'next/server';
import { ai, nvidia } from '@/lib/ai';
import { generateText } from 'ai';
import { searchCaseStudies } from '@/lib/db/case-studies';

// Use the robust model from AIService defaults
const MODEL_ID = process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct';

function getMessageText(message: any): string {
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

function convertUIMessages(messages: any[]): any[] {
  return messages.map(m => {
    return { 
      role: m.role, 
      content: getMessageText(m) 
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastMessage = getMessageText(messages[messages.length - 1]);

    // 1. Get relevant context from vector database
    let context = '';
    if (lastMessage) {
      try {
        // Truncate query to maximum 1000 characters to keep embedding generation fast and within token limits
        const embedText = lastMessage.length > 1000
          ? lastMessage.substring(0, 500) + '\n...\n' + lastMessage.substring(lastMessage.length - 500)
          : lastMessage;

        const embedding = await ai.embed(embedText);
        const similarCases = await searchCaseStudies(embedding, 3);
        
        if (similarCases && similarCases.length > 0) {
          context = similarCases.map(c => 
            `Case: ${c.company_name}
             Summary: ${c.summary}`
          ).join('\n\n');
        }
      } catch (ragError: any) {
        console.error('[Chat API] RAG error:', ragError);
        // Fallback: Continue without context
      }
    }

    // 2. Generate response (full generation for client-side smooth typing)
    const customContext = body.context || '';
    const systemPrompt = `You are the Graveyard Keeper, a forensic investigator for failed startups. 
      ${customContext ? `SPECIAL_TASK: ${customContext}` : 'Analyze the failure patterns of startups based on available data.'}
      
      ARCHIVE_CONTEXT:
      ${context}
      
      Speak in a highly clear, professional, and engaging yet slightly somber tone. 
      CRITICAL REQUIREMENT: Use simple, easy-to-understand, and highly accessible language. 
      Avoid overly complex business jargon, dense academic phrasing, or unnecessary consulting buzzwords. 
      Instead of saying "exhibited severe mismatch in cash flow runway optimization under market validation deficits," say "ran out of money because they built something people did not actually want to pay for."
      Explain concepts, lessons, and patterns of failure in a direct, clear, and educational way so that any founder, investor, or student can immediately grasp them.
      
      When mentioning a startup that exists in our archive, wrap its name in [[Startup Name]].
      
      CRITICAL INSTRUCTION:
      At the very end of EVERY response, you MUST append a horizontal line separator (\`---\`) followed by a concise 1-2 sentence high-level recap summarizing the core reasons of the startup's collapse or failure pattern.
      This recap must be preceded by a dynamic, creative, high-tech, or clinical header utilizing varied, descriptive forensic terminology. Do NOT use the exact same header vocabulary (like "In short" or "Summary") in consecutive answers—vary it creatively every single time!
      Examples of high-fidelity, creative headings you can use include:
      - "### 📁 COLD_CASE_RECAP"
      - "### 📊 POST_MORTEM_SYNOPSIS"
      - "### 🔎 AUTOPSY_CONDENSED"
      - "### 💡 FORENSIC_TAKEAWAY"
      - "### 📝 ARCHIVAL_VERDICT"
      - "### 💀 THE_GRAVE_TRUTH"
      - "### 🗃️ RECORD_DEBRIEF"
      - "### 🔮 PATTERN_DIAGNOSTIC"
      - "### 🎯 CRITICAL_CORE"
      - "### 📑 BRIEF_FINDINGS"`;

    const result = await generateText({
      model: nvidia.chat(MODEL_ID),
      messages: convertUIMessages(messages),
      system: systemPrompt,
    });

    return new Response(JSON.stringify({ 
      role: 'assistant',
      content: result.text 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

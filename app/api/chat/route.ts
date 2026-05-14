import { streamText } from 'ai';
import { nvidia, ai } from '@/lib/ai';
import { getGlobalStats, searchCaseStudies } from '@/lib/db/case-studies';
import { appendChatMessage } from '@/lib/db/chat';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content;
    
    let context = '';
    if (lastMessage) {
      // 1. Generate embedding for the query
      const embedding = await ai.embed(lastMessage);
      
      // 2. Search for relevant case studies
      const similarCases = await searchCaseStudies(embedding, 3);
      
      // 3. Construct context
      if (similarCases.length > 0) {
        context = "REL_ARCHIVE_DATA:\n" + similarCases.map(c => 
          `- ${c.company_name}: ${c.summary} (Case ID: ${c.slug})`
        ).join('\n');
      }
    }

    const stats = await getGlobalStats();

    const result = streamText({
      model: nvidia.chat(process.env.AI_DEFAULT_MODEL || 'deepseek-ai/deepseek-v4-pro'),
      system: `You are the Graveyard Keeper AI. You are a forensic startup researcher. 
      Your tone is professional, analytical, and slightly grim. 
      You have access to ${stats.totalCases} historical startup autopsies in the archive.
      
      ${context ? `Use the following retrieved data from the archive to inform your answer:\n${context}` : 'No specific archive data retrieved for this query. Use your general knowledge of startup failure patterns.'}

      When discussing failures, be specific about burn rates, PMF, and execution errors.
      Always maintain the "Forensic Intelligence" persona.`,
      messages,
      onFinish: async ({ text }) => {
        if (sessionId) {
          try {
            // Save the conversation history including the new assistant message
            const history = [...messages, { role: 'assistant', content: text }];
            await appendChatMessage(sessionId, history);
          } catch (e) {
            console.error('Failed to save chat session:', e);
          }
        }
      }
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

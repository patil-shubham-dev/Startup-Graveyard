import { supabase } from './config';
import { Message } from '../ai';

export interface ChatSession {
  id: string;
  user_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export async function createChatSession(userId: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, messages: [] })
    .select()
    .single();

  if (error) throw error;
  return data as ChatSession;
}

export async function getChatSession(id: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as ChatSession;
}

export async function appendChatMessage(id: string, messages: Message[]): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ 
      messages,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
}

export async function listUserChats(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as ChatSession[];
}

import { supabase } from "@/lib/db/config";
import type { ChatConversation, ChatMessage, ChatMeta, ChatStorage } from "./types";

interface StoredEnvelope {
  v: 1;
  title: string;
  messages: ChatMessage[];
}

/**
 * Account-synced history via Supabase `chat_sessions`. The table stores a
 * JSONB payload; we persist the conversation envelope (title + messages)
 * inside it so the UI-facing model matches the local path exactly.
 * RLS ("auth.uid() = user_id") scopes every row to the signed-in user.
 */
export function createRemoteStorage(userId: string): ChatStorage {
  const db = supabase.from("chat_sessions");

  function envelopeOf(conversation: ChatConversation): StoredEnvelope {
    return { v: 1, title: conversation.title, messages: conversation.messages };
  }

  async function list(): Promise<ChatMeta[]> {
    const { data, error } = await db
      .select("id, created_at, updated_at, messages")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const payload = (row.messages ?? {}) as Partial<StoredEnvelope>;
      const msgs = Array.isArray(payload.messages) ? payload.messages : [];
      return {
        id: row.id as string,
        title: typeof payload.title === "string" && payload.title ? payload.title : "New inquiry",
        createdAt: Date.parse(row.created_at as string) || Date.now(),
        updatedAt: Date.parse(row.updated_at as string) || Date.now(),
        count: msgs.length,
      };
    });
  }

  async function get(id: string): Promise<ChatConversation | null> {
    const { data, error } = await db.select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    if (error || !data) return null;
    const payload = (data.messages ?? {}) as Partial<StoredEnvelope>;
    const msgs = Array.isArray(payload.messages) ? payload.messages : [];
    return {
      id: data.id as string,
      title: typeof payload.title === "string" && payload.title ? payload.title : "New inquiry",
      createdAt: Date.parse(data.created_at as string) || Date.now(),
      updatedAt: Date.parse(data.updated_at as string) || Date.now(),
      messages: msgs,
    };
  }

  async function save(conversation: ChatConversation): Promise<void> {
    const existing = await get(conversation.id);
    if (existing) {
      const { error } = await db
        .update({ messages: envelopeOf(conversation), updated_at: new Date().toISOString() })
        .eq("id", conversation.id)
        .eq("user_id", userId);
      if (error) throw error;
      return;
    }
    const { error } = await db.insert({
      id: conversation.id,
      user_id: userId,
      messages: envelopeOf(conversation),
    });
    if (error) throw error;
  }

  async function remove(id: string): Promise<void> {
    const { error } = await db.delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  return { kind: "remote", list, get, save, remove };
}

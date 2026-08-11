export interface RetrievedCase {
  name: string;
  slug: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  sources?: RetrievedCase[];
  stopped?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ChatMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  count: number;
}

/**
 * Storage contract for conversation history. The UI never knows whether a
 * conversation lives in IndexedDB (guests) or Supabase (signed-in users).
 */
export interface ChatStorage {
  readonly kind: "local" | "remote";
  list(): Promise<ChatMeta[]>;
  get(id: string): Promise<ChatConversation | null>;
  save(conversation: ChatConversation): Promise<void>;
  remove(id: string): Promise<void>;
}

export function toMeta(conversation: ChatConversation): ChatMeta {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    count: conversation.messages.length,
  };
}

/** Rough token estimate for the context indicator: ~4 chars per token. */
export function countTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function summarizeTitle(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "New inquiry";
  return t.length > 48 ? `${t.slice(0, 47).trimEnd()}…` : t;
}

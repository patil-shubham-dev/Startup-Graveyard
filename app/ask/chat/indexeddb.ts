import { del, get, set } from "idb-keyval";
import type { ChatConversation, ChatMeta, ChatStorage } from "./types";
import { toMeta } from "./types";

const INDEX_KEY = "ask:index";
const conversationKey = (id: string) => `ask:conv:${id}`;

/** Per-browser history via IndexedDB (idb-keyval) — the guest path. */
export function createLocalStorage(): ChatStorage {
  async function list(): Promise<ChatMeta[]> {
    const index = (await get<ChatMeta[]>(INDEX_KEY)) ?? [];
    return index.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async function read(id: string): Promise<ChatConversation | null> {
    return (await get<ChatConversation | undefined>(conversationKey(id))) ?? null;
  }

  async function save(conversation: ChatConversation): Promise<void> {
    const index = (await get<ChatMeta[]>(INDEX_KEY)) ?? [];
    const rest = index.filter((m) => m.id !== conversation.id);
    await Promise.all([
      set(conversationKey(conversation.id), conversation),
      set(INDEX_KEY, [...rest, toMeta(conversation)]),
    ]);
  }

  async function remove(id: string): Promise<void> {
    const index = (await get<ChatMeta[]>(INDEX_KEY)) ?? [];
    await Promise.all([del(conversationKey(id)), set(INDEX_KEY, index.filter((m) => m.id !== id))]);
  }

  return { kind: "local", list, get: read, save, remove };
}

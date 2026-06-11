'use client';

import { get, set, del } from 'idb-keyval';
import { useEffect, useRef, useCallback, useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  parts?: { type: string; text?: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const CHATS_INDEX_KEY = 'sg_chat_index';
const MSG_PREFIX = 'sg_chat_msg_';
const ACTIVE_CHAT_KEY = 'sg_active_chat_id';
const SAVE_DEBOUNCE_MS = 1000;

interface ChatIndex {
  ids: string[];
  meta: Record<string, { title: string; createdAt: number }>;
}

async function getChatIndex(): Promise<ChatIndex> {
  const val = await get(CHATS_INDEX_KEY);
  return val || { ids: [], meta: {} };
}

async function saveChatIndex(idx: ChatIndex) {
  await set(CHATS_INDEX_KEY, idx);
}

async function loadChatMessages(chatId: string): Promise<ChatMessage[]> {
  const msgs = await get(MSG_PREFIX + chatId);
  return msgs || [];
}

async function saveChatMessages(chatId: string, msgs: ChatMessage[]) {
  await set(MSG_PREFIX + chatId, msgs);
}

export async function deleteChat(chatId: string) {
  await del(MSG_PREFIX + chatId);
  const idx = await getChatIndex();
  const newMeta = { ...idx.meta };
  delete newMeta[chatId];
  await saveChatIndex({ ids: idx.ids.filter(id => id !== chatId), meta: newMeta });
}

export async function listChats(): Promise<ChatSession[]> {
  const idx = await getChatIndex();
  const sessions: ChatSession[] = [];
  for (const id of idx.ids) {
    const msgs = await loadChatMessages(id);
    const meta = idx.meta[id] || { title: 'Chat', createdAt: 0 };
    sessions.push({ id, ...meta, messages: msgs });
  }
  return sessions;
}

export function usePersistedChat() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const dirtyRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sessions = await listChats();
        setTimeout(() => setChats(sessions), 0);
        const activeId = localStorage.getItem(ACTIVE_CHAT_KEY);
        if (activeId && sessions.some(s => s.id === activeId)) {
          setTimeout(() => setActiveChatId(activeId), 0);
        }
      } catch { /* ignore */ }
      setTimeout(() => setLoaded(true), 0);
    })();
  }, []);

  const flush = useCallback(async () => {
    if (dirtyRef.current.size === 0) return;
    const dirty = new Set(dirtyRef.current);
    dirtyRef.current.clear();
    const promises: Promise<void>[] = [];
    dirty.forEach(chatId => {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        promises.push(saveChatMessages(chatId, chat.messages));
      }
    });
    await Promise.all(promises);
  }, [chats]);

  const markDirty = useCallback((chatId: string) => {
    dirtyRef.current.add(chatId);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  }, [flush]);

  const upsertChat = useCallback((chat: ChatSession) => {
    setChats(prev => {
      const existing = prev.findIndex(c => c.id === chat.id);
      const next = existing >= 0
        ? [...prev.slice(0, existing), chat, ...prev.slice(existing + 1)]
        : [chat, ...prev];
      return next;
    });
    markDirty(chat.id);
    saveChatIndex({
      ids: [chat.id, ...chats.filter(c => c.id !== chat.id).map(c => c.id)],
      meta: { ...Object.fromEntries(chats.map(c => [c.id, { title: c.title, createdAt: c.createdAt }])), [chat.id]: { title: chat.title, createdAt: chat.createdAt } },
    });
  }, [chats, markDirty]);

  const deleteChatById = useCallback(async (chatId: string) => {
    await deleteChat(chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
    dirtyRef.current.delete(chatId);
  }, [activeChatId]);

  const setActive = useCallback((chatId: string | null) => {
    setActiveChatId(chatId);
    if (chatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  }, []);

  const clearAll = useCallback(async () => {
    const idx = await getChatIndex();
    await Promise.all(idx.ids.map(id => del(MSG_PREFIX + id)));
    await del(CHATS_INDEX_KEY);
    setChats([]);
    setActiveChatId(null);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    dirtyRef.current.clear();
  }, []);

  return {
    chats,
    activeChatId,
    loaded,
    upsertChat,
    deleteChatById,
    setActive,
    clearAll,
  };
}

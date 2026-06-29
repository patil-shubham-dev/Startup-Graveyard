'use client';

import { get, set, del } from 'idb-keyval';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  createChatSession,
  appendChatMessage,
  listUserChats,
  deleteChatSession,
} from '@/lib/db/chat';

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

// --- IndexedDB helpers (fallback for unauthenticated users) ---

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

async function deleteLocalChat(chatId: string) {
  await del(MSG_PREFIX + chatId);
  const idx = await getChatIndex();
  const newMeta = { ...idx.meta };
  delete newMeta[chatId];
  await saveChatIndex({ ids: idx.ids.filter(id => id !== chatId), meta: newMeta });
}

async function listLocalChats(): Promise<ChatSession[]> {
  const idx = await getChatIndex();
  const sessions: ChatSession[] = [];
  for (const id of idx.ids) {
    const msgs = await loadChatMessages(id);
    const meta = idx.meta[id] || { title: 'Chat', createdAt: 0 };
    sessions.push({ id, ...meta, messages: msgs });
  }
  return sessions;
}

// --- Title helpers ---

function deriveTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find(m => m.role === 'user');
  const text = firstUserMsg?.content || '';
  const clean = text.replace(/[<>"']/g, '').trim();
  if (!clean) return 'New conversation';
  return clean.length > 40 ? clean.substring(0, 37) + '...' : clean;
}

// --- Hook ---

export function usePersistedChat(userId?: string | null) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isSupabaseBacked = !!userId;

  // Ref to always have the latest chats available in closures
  const chatsRef = useRef<ChatSession[]>([]);
  chatsRef.current = chats;

  // Dirty tracking for debounced saves (localStorage only)
  const dirtyRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if we've initialized Supabase subscriptions
  const supabaseInitRef = useRef(false);

  // ---------------------------------------------------------------
  // LOAD chats on mount
  // ---------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isSupabaseBacked) {
          const sessions = await listUserChats(userId!);
          if (cancelled) return;
          setChats(
            sessions.map(s => ({
              id: s.id,
              title: deriveTitle(s.messages as unknown as ChatMessage[]),
              messages: (s.messages as unknown as ChatMessage[]) || [],
              createdAt: new Date(s.created_at || Date.now()).getTime(),
            }))
          );
        } else {
          const sessions = await listLocalChats();
          if (cancelled) return;
          setChats(sessions);
        }

        // Restore active chat from localStorage
        const activeId = localStorage.getItem(ACTIVE_CHAT_KEY);
        if (activeId) {
          // Verify the chat still exists before restoring
          setActiveChatId(activeId);
        }
      } catch {
        // Silently fail
      }

      if (!cancelled) setLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [userId, isSupabaseBacked]);

  // ---------------------------------------------------------------
  // Debounced save: used only by localStorage fallback
  // ---------------------------------------------------------------
  const flushLocal = useCallback(async () => {
    if (dirtyRef.current.size === 0) return;
    const dirty = new Set(dirtyRef.current);
    dirtyRef.current.clear();
    const currentChats = chatsRef.current;
    await Promise.all(
      Array.from(dirty).map(async (chatId) => {
        const chat = currentChats.find(c => c.id === chatId);
        if (chat) {
          await saveChatMessages(chatId, chat.messages);
        }
      })
    );
  }, []);

  const markLocalDirty = useCallback((chatId: string) => {
    dirtyRef.current.add(chatId);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushLocal, SAVE_DEBOUNCE_MS);
  }, [flushLocal]);

  // ---------------------------------------------------------------
  // Persist index to IndexedDB whenever chats list changes
  // ---------------------------------------------------------------
  useEffect(() => {
    if (isSupabaseBacked) return;
    if (chats.length === 0) return;
    saveChatIndex({
      ids: chats.map(c => c.id),
      meta: Object.fromEntries(chats.map(c => [c.id, { title: c.title, createdAt: c.createdAt }])),
    });
  }, [chats, isSupabaseBacked]);

  // ---------------------------------------------------------------
  // AUTO-SAVE messages to Supabase whenever they change
  // ---------------------------------------------------------------
  const prevMessagesJsonRef = useRef<string>('');

  useEffect(() => {
    if (!isSupabaseBacked || !activeChatId) return;
    const nonSystem = chats.find(c => c.id === activeChatId)?.messages || [];
    const json = JSON.stringify(nonSystem);
    if (json === prevMessagesJsonRef.current) return;
    prevMessagesJsonRef.current = json;

    const timer = setTimeout(async () => {
      try {
        await appendChatMessage(activeChatId, nonSystem as never);
      } catch {
        // Silently fail
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [chats, activeChatId, isSupabaseBacked]);

  // ---------------------------------------------------------------
  // upsertChat: create or update a chat session
  // ---------------------------------------------------------------
  const upsertChat = useCallback(async (chat: ChatSession) => {
    if (isSupabaseBacked && userId) {
      try {
        if (chat.id.startsWith('chat-')) {
          // New chat — create in Supabase
          const newSession = await createChatSession(userId);
          const title = deriveTitle(chat.messages);
          const newId = newSession.id;
          // Sync the ref so the auto-save effect doesn't fire for the old temp ID
          prevMessagesJsonRef.current = JSON.stringify(chat.messages);
          // Save messages to the new session
          if (chat.messages.length > 0) {
            await appendChatMessage(newId, chat.messages as never);
          }
          // Update local state with the real UUID
          setChats(prev => {
            const next = prev.map(c => c.id === chat.id ? { ...chat, id: newId, title } : c);
            return next.some(c => c.id === newId) ? next : [{ ...chat, id: newId, title }, ...next];
          });
          // If this was the active chat, update the active ID
          if (activeChatId === chat.id) {
            setActiveChatId(newId);
            localStorage.setItem(ACTIVE_CHAT_KEY, newId);
          }
          return newId;
        }
        // Existing chat — update local state (auto-saved to Supabase via effect)
        setChats(prev => {
          const existing = prev.findIndex(c => c.id === chat.id);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = chat;
            return next;
          }
          return [chat, ...prev];
        });
      } catch {
        // Fall back to local save
        setChats(prev => {
          const existing = prev.findIndex(c => c.id === chat.id);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = chat;
            return next;
          }
          return [chat, ...prev];
        });
      }
    } else {
      // LocalStorage path
      setChats(prev => {
        const existing = prev.findIndex(c => c.id === chat.id);
        const next = existing >= 0
          ? [...prev.slice(0, existing), chat, ...prev.slice(existing + 1)]
          : [chat, ...prev];
        return next;
      });
      markLocalDirty(chat.id);
    }
  }, [isSupabaseBacked, userId, activeChatId, markLocalDirty]);

  // ---------------------------------------------------------------
  // deleteChatById
  // ---------------------------------------------------------------
  const deleteChatById = useCallback(async (chatId: string) => {
    if (isSupabaseBacked) {
      try {
        await deleteChatSession(chatId);
      } catch {
        // Silently fail
      }
    } else {
      await deleteLocalChat(chatId);
    }

    setChats(prev => prev.filter(c => c.id !== chatId));
    dirtyRef.current.delete(chatId);

    if (activeChatId === chatId) {
      setActiveChatId(null);
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  }, [isSupabaseBacked, activeChatId]);

  // ---------------------------------------------------------------
  // setActive
  // ---------------------------------------------------------------
  const setActive = useCallback((chatId: string | null) => {
    setActiveChatId(chatId);
    if (chatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  }, []);

  // ---------------------------------------------------------------
  // clearAll
  // ---------------------------------------------------------------
  const clearAll = useCallback(async () => {
    if (isSupabaseBacked && userId) {
      const all = await listUserChats(userId);
      await Promise.allSettled(all.map(s => deleteChatSession(s.id)));
    } else {
      const idx = await getChatIndex();
      await Promise.all(idx.ids.map(id => del(MSG_PREFIX + id)));
      await del(CHATS_INDEX_KEY);
    }
    setChats([]);
    setActiveChatId(null);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    dirtyRef.current.clear();
  }, [isSupabaseBacked, userId]);

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

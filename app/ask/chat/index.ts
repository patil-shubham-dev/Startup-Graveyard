import type { ChatConversation, ChatStorage } from "./types";
import { createLocalStorage } from "./indexeddb";
import { createRemoteStorage } from "./supabase";

export type { ChatStorage, ChatConversation, ChatMessage, ChatMeta, RetrievedCase } from "./types";
export { createLocalStorage } from "./indexeddb";
export { createRemoteStorage } from "./supabase";

/** Pick the storage backend by session state — the UI never decides. */
export function storageFor(userId: string | null): ChatStorage {
  return userId ? createRemoteStorage(userId) : createLocalStorage();
}

export interface MigrationResult {
  imported: number;
  skipped: number;
}

/**
 * Copies guest conversations (IndexedDB) into the signed-in account.
 * Safe by construction: a remote row with the same id is skipped (import is
 * idempotent), and a title collision gets a " · copy" suffix instead of an
 * overwrite. Local history is never deleted here.
 */
export async function migrateLocalToRemote(
  local: ChatStorage,
  remote: ChatStorage
): Promise<MigrationResult> {
  const [localMeta, remoteMeta] = await Promise.all([local.list(), remote.list()]);
  const remoteIds = new Set(remoteMeta.map((m) => m.id));
  const remoteTitles = new Set(remoteMeta.map((m) => m.title));
  let imported = 0;
  let skipped = 0;

  for (const meta of localMeta) {
    const conversation = await local.get(meta.id);
    if (!conversation || conversation.messages.length === 0) continue;
    if (remoteIds.has(conversation.id)) {
      skipped += 1;
      continue;
    }
    const copy: ChatConversation = {
      ...conversation,
      title: remoteTitles.has(conversation.title) ? `${conversation.title} · copy` : conversation.title,
    };
    await remote.save(copy);
    remoteIds.add(copy.id);
    remoteTitles.add(copy.title);
    imported += 1;
  }

  return { imported, skipped };
}

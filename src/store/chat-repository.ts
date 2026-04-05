import { cacheGet, cacheGetJson, cacheRemove, cacheSet, cacheSetJson } from '@/lib/cache'
import { ensureMessageIds } from '@/lib/chat-utils'
import type { Chat, ChatMessage } from '@/lib/types'
import { CACHE_KEY } from '@/services/constant'
import type { JsonValue } from '@/types/json'

import { normalizeChatList } from './chat-helpers'
import { stripBinaryDataForStorage } from './chat-persistence'

const messagesMap = new Map<string, ChatMessage[]>()

// --- Messages (in-memory) ---

function getMessages(chatId: string): ChatMessage[] | undefined {
  return messagesMap.get(chatId)
}

function setMessages(chatId: string, messages: ChatMessage[]): void {
  messagesMap.set(chatId, messages)
}

function deleteMessages(chatId: string): void {
  messagesMap.delete(chatId)
}

function clearMessages(): void {
  messagesMap.clear()
}

function allMessageKeys(): string[] {
  return Array.from(messagesMap.keys())
}

// --- Chat list (localStorage) ---

function loadChatList(): Chat[] {
  const raw = cacheGetJson(CACHE_KEY.CHAT_LIST, [])
  return normalizeChatList(raw)
}

function saveChatList(chatList: Chat[]): void {
  cacheSetJson(CACHE_KEY.CHAT_LIST, chatList)
}

// --- Current chat ID (localStorage) ---

function loadCurrentChatId(): string | undefined {
  return cacheGet(CACHE_KEY.CHAT_CURRENT_ID) ?? undefined
}

function saveCurrentChatId(id: string): void {
  cacheSet(CACHE_KEY.CHAT_CURRENT_ID, id)
}

function removeCurrentChatId(): void {
  cacheRemove(CACHE_KEY.CHAT_CURRENT_ID)
}

// --- Message persistence (localStorage) ---

function loadMessagesRaw(chatId: string): JsonValue[] {
  const raw = cacheGetJson(CACHE_KEY.chatMessages(chatId), [])
  return Array.isArray(raw) ? raw : []
}

function persistMessages(chatId: string, messages: ChatMessage[]): void {
  cacheSetJson(CACHE_KEY.chatMessages(chatId), stripBinaryDataForStorage(messages))
}

function removePersistedMessages(chatId: string): void {
  cacheRemove(CACHE_KEY.chatMessages(chatId))
}

// --- High-level persistence API ---

export type CommitConversationOptions = {
  persist?: boolean
}

/**
 * Normalize + update memory cache, optionally persist to localStorage.
 */
function commitConversation(
  chatId: string,
  messages: ChatMessage[],
  options: CommitConversationOptions = {}
): { normalized: ChatMessage[]; previousCount: number } {
  const { persist = false } = options
  const previousCount = messagesMap.get(chatId)?.length ?? 0

  if (messages.length > 0) {
    const normalized = ensureMessageIds(messages)
    setMessages(chatId, normalized)
    if (persist) {
      persistMessages(chatId, normalized)
    }
    return { normalized, previousCount }
  }

  deleteMessages(chatId)
  if (persist) {
    removePersistedMessages(chatId)
  }
  return { normalized: [], previousCount }
}

// --- Public API ---

export const chatRepo = {
  getMessages,
  setMessages,
  deleteMessages,
  clearMessages,
  allMessageKeys,
  commitConversation,
  loadChatList,
  saveChatList,
  loadCurrentChatId,
  saveCurrentChatId,
  removeCurrentChatId,
  loadMessagesRaw,
  removePersistedMessages
}

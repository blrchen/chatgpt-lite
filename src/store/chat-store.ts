import { cacheKeysWithPrefix } from '@/lib/cache'
import {
  DefaultPersona,
  EMPTY_MESSAGES,
  ensureMessageIds,
  getChatFallbackTitle
} from '@/lib/chat-utils'
import { AppError } from '@/lib/errors'
import type { Chat, ChatMessage, Persona } from '@/lib/types'
import { CACHE_KEY } from '@/services/constant'
import { toast } from 'sonner'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

import { coerceStoredMessage } from './chat-coerce'
import {
  createChatRecord,
  deriveTitleFromMessages,
  resolveCurrentId,
  sortChatsByPinnedThenRecent,
  truncateToWords
} from './chat-helpers'
import {
  chatRepo,
  type CommitConversationOptions as RepoCommitConversationOptions
} from './chat-repository'

// --- Utility functions ---

type ChatStateUpdater = (updater: (state: ChatState) => ChatState | Partial<ChatState>) => void

function updateChatField(set: ChatStateUpdater, chatId: string, updates: Partial<Chat>): void {
  set((state) => {
    const nextList = state.chatList.map((chat) =>
      chat.id === chatId ? { ...chat, ...updates } : chat
    )
    if (nextList.every((chat, index) => chat === state.chatList[index])) {
      return state
    }
    const chatList = sortChatsByPinnedThenRecent(nextList)
    const currentChatId = resolveCurrentId(chatList, state.currentChatId)
    return { chatList, currentChatId }
  })
}

type ConversationMetaInput = {
  existingChat: Chat
  normalizedMessages: ChatMessage[]
  previousCount: number
  updateMeta: boolean
  resetTitle: boolean
  personaName?: string
}

function getActivityTimestamp(normalizedMessages: ChatMessage[], previousCount: number): string {
  const now = new Date().toISOString()
  const latestTimestamp = normalizedMessages.at(-1)?.createdAt?.toISOString() ?? now
  return normalizedMessages.length > previousCount ? now : latestTimestamp
}

function deriveConversationTitleIfNeeded(
  existingChat: Chat,
  normalizedMessages: ChatMessage[],
  previousCount: number
): string | undefined {
  const isFirstMessage = previousCount === 0 && normalizedMessages.length > 0
  if (!isFirstMessage) {
    return undefined
  }

  const isDefaultPersona = !existingChat.personaId || existingChat.personaId === DefaultPersona.id
  if (!isDefaultPersona) {
    return undefined
  }

  const fallbackTitle = existingChat.title || 'New Chat'
  return deriveTitleFromMessages(normalizedMessages, fallbackTitle)
}

function deriveConversationMetaUpdates({
  existingChat,
  normalizedMessages,
  previousCount,
  updateMeta,
  resetTitle,
  personaName
}: ConversationMetaInput): Partial<Chat> {
  const updates: Partial<Chat> = {}

  if (updateMeta) {
    updates.updatedAt = getActivityTimestamp(normalizedMessages, previousCount)

    const derivedTitle = deriveConversationTitleIfNeeded(
      existingChat,
      normalizedMessages,
      previousCount
    )
    if (derivedTitle) {
      updates.title = derivedTitle
    }
  }

  if (resetTitle) {
    updates.title = getChatFallbackTitle(existingChat.personaId, personaName)
  }

  return updates
}

function getChatIdSet(chatList: Chat[]): Set<string> {
  return new Set(chatList.map((chat) => chat.id))
}

const PERSISTED_MESSAGE_KEY_PREFIX = CACHE_KEY.chatMessages('')
const PERSISTED_ORPHAN_SCAN_IDLE_TIMEOUT_MS = 1500

function getPersistedMessageChatIds(): string[] {
  return cacheKeysWithPrefix(PERSISTED_MESSAGE_KEY_PREFIX).map((key) =>
    key.slice(PERSISTED_MESSAGE_KEY_PREFIX.length)
  )
}

type CleanupOrphansOptions = {
  persistedOnly?: boolean
  candidateIds?: Iterable<string>
}

function cleanupOrphans(validIds: Set<string>, options: CleanupOrphansOptions = {}): void {
  const { persistedOnly = false, candidateIds } = options

  if (!persistedOnly) {
    const targets = candidateIds ?? chatRepo.allMessageKeys()
    for (const chatId of targets) {
      if (!validIds.has(chatId)) {
        chatRepo.deleteMessages(chatId)
        chatRepo.removePersistedMessages(chatId)
      }
    }
    return
  }

  const persistedTargets = candidateIds ?? getPersistedMessageChatIds()
  for (const chatId of persistedTargets) {
    if (!validIds.has(chatId)) {
      chatRepo.removePersistedMessages(chatId)
    }
  }
}

function schedulePersistedOrphanCleanup(): void {
  const run = () => {
    const validIds = getChatIdSet(useChatStore.getState().chatList)
    cleanupOrphans(validIds, { persistedOnly: true })
  }

  if (typeof window === 'undefined') {
    return
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: PERSISTED_ORPHAN_SCAN_IDLE_TIMEOUT_MS })
    return
  }

  window.setTimeout(run, 0)
}

// --- Store ---

interface ChatState {
  chatList: Chat[]
  currentChatId: string | undefined
  isChatHydrated: boolean

  hydrate: () => void
  getChatById: (id?: string | null) => Chat | undefined
  getMessagesForChat: (id?: string | null) => ChatMessage[]
  commitConversation: (
    chatId: string,
    messages: ChatMessage[],
    options?: CommitConversationOptions
  ) => { normalized: ChatMessage[]; previousCount: number }
  onChangeChat: (chat: Chat) => void
  onCreateChat: (persona: Persona, firstMessage?: string) => Chat | undefined
  onCreateDefaultChat: (firstMessage?: string) => Chat | undefined
  openOrCreateDefaultChat: () => Chat | undefined
  onDeleteChat: (chat: Chat) => void
  updateChatTitle: (chatId: string, title: string) => void
  updateChatPinned: (chatId: string, pinned: boolean) => void
}

type CommitConversationOptions = RepoCommitConversationOptions & {
  updateMeta?: boolean
  resetTitle?: boolean
  personaName?: string
}

// --- Selectors ---
export const selectCurrentChatId = (s: ChatState) => s.currentChatId
export const selectChatList = (s: ChatState) => s.chatList
export const selectIsChatHydrated = (s: ChatState) => s.isChatHydrated
export const selectHydrate = (s: ChatState) => s.hydrate
export const selectGetChatById = (s: ChatState) => s.getChatById
export const selectGetMessagesForChat = (s: ChatState) => s.getMessagesForChat
export const selectCommitConversation = (s: ChatState) => s.commitConversation
export const selectOnChangeChat = (s: ChatState) => s.onChangeChat
export const selectOnCreateChat = (s: ChatState) => s.onCreateChat
export const selectOnCreateDefaultChat = (s: ChatState) => s.onCreateDefaultChat
export const selectOpenOrCreateDefaultChat = (s: ChatState) => s.openOrCreateDefaultChat
export const selectOnDeleteChat = (s: ChatState) => s.onDeleteChat
export const selectUpdateChatTitle = (s: ChatState) => s.updateChatTitle
export const selectUpdateChatPinned = (s: ChatState) => s.updateChatPinned

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    chatList: [],
    currentChatId: undefined,
    isChatHydrated: false,

    hydrate: () => {
      if (get().isChatHydrated) return

      if (typeof window === 'undefined') {
        set({ isChatHydrated: true })
        return
      }

      try {
        const storedChatList = chatRepo.loadChatList()
        const storedCurrentChatId = chatRepo.loadCurrentChatId()

        for (const chat of storedChatList) {
          const storedMessagesRaw = chatRepo.loadMessagesRaw(chat.id)
          const storedMessages: ChatMessage[] = []

          for (const rawMessage of storedMessagesRaw) {
            const parsed = coerceStoredMessage(rawMessage)
            if (parsed) {
              storedMessages.push(parsed)
            }
          }

          const normalizedMessages = ensureMessageIds(storedMessages)
          chatRepo.setMessages(chat.id, normalizedMessages)
        }

        const chatList = sortChatsByPinnedThenRecent(
          storedChatList.length > 0 ? storedChatList : [createChatRecord()]
        )
        const currentChatId = resolveCurrentId(chatList, storedCurrentChatId)

        set({ chatList, currentChatId, isChatHydrated: true })
      } catch (error) {
        AppError.warn('store', 'corrupt_data', 'Failed to hydrate stored chats', error)
        toast.error('Failed to load saved chats. Your chat history may be unavailable.')
        chatRepo.clearMessages()
        const fallbackChat = createChatRecord()
        set({
          chatList: [fallbackChat],
          currentChatId: fallbackChat.id,
          isChatHydrated: true
        })
      }
    },

    getChatById: (id) => {
      const state = get()
      const targetId = id ?? state.currentChatId
      if (!targetId) return undefined
      return state.chatList.find((chat) => chat.id === targetId)
    },

    getMessagesForChat: (id) => {
      const targetId = id ?? get().currentChatId
      if (!targetId) return EMPTY_MESSAGES
      return chatRepo.getMessages(targetId) ?? EMPTY_MESSAGES
    },

    commitConversation: (chatId, messages, options = {}) => {
      const { persist = false, updateMeta = false, resetTitle = false, personaName } = options
      const { normalized, previousCount } = chatRepo.commitConversation(chatId, messages, {
        persist
      })

      if (updateMeta || resetTitle) {
        const existingChat = get().chatList.find((chat) => chat.id === chatId)
        if (existingChat) {
          const updates = deriveConversationMetaUpdates({
            existingChat,
            normalizedMessages: normalized,
            previousCount,
            updateMeta,
            resetTitle,
            personaName
          })

          if (updates.updatedAt != null || updates.title != null) {
            updateChatField(set, chatId, updates)
          }
        }
      }

      return { normalized, previousCount }
    },

    onChangeChat: (chat) => {
      set((state) => {
        if (state.chatList.some((c) => c.id === chat.id)) {
          if (state.currentChatId === chat.id) {
            return state
          }
          return { currentChatId: chat.id }
        }

        return {
          chatList: sortChatsByPinnedThenRecent([chat, ...state.chatList]),
          currentChatId: chat.id
        }
      })
    },

    onCreateChat: (persona, firstMessage) => {
      let createdChat: Chat | undefined
      set((state) => {
        const quickTitle = firstMessage ? truncateToWords(firstMessage, 4) : undefined
        const newChat = createChatRecord({
          title: quickTitle,
          personaId: persona.id,
          personaName: persona.name
        })
        createdChat = newChat
        return {
          chatList: sortChatsByPinnedThenRecent([newChat, ...state.chatList]),
          currentChatId: newChat.id
        }
      })
      return createdChat
    },

    onCreateDefaultChat: (firstMessage) => {
      return get().onCreateChat(DefaultPersona, firstMessage)
    },

    openOrCreateDefaultChat: () => {
      let selectedChat: Chat | undefined
      set((state) => {
        const emptyChat = state.chatList.find((chat) => {
          return (chatRepo.getMessages(chat.id) ?? EMPTY_MESSAGES).length === 0
        })

        if (emptyChat) {
          selectedChat = emptyChat
          if (state.currentChatId === emptyChat.id) {
            return state
          }
          return { currentChatId: emptyChat.id }
        }

        const newChat = createChatRecord({
          personaId: DefaultPersona.id,
          personaName: DefaultPersona.name
        })
        selectedChat = newChat
        return {
          chatList: sortChatsByPinnedThenRecent([newChat, ...state.chatList]),
          currentChatId: newChat.id
        }
      })
      return selectedChat
    },

    onDeleteChat: (chat) => {
      set((state) => {
        const filtered = state.chatList.filter((c) => c.id !== chat.id)
        if (filtered.length === state.chatList.length) {
          return state
        }

        const nextList = filtered.length > 0 ? filtered : [createChatRecord()]
        const chatList = sortChatsByPinnedThenRecent(nextList)
        const requestedCurrentId = state.currentChatId === chat.id ? undefined : state.currentChatId
        const currentChatId = resolveCurrentId(chatList, requestedCurrentId)
        return { chatList, currentChatId }
      })
    },

    updateChatTitle: (chatId, title) => {
      if (!title) return
      updateChatField(set, chatId, { title })
    },

    updateChatPinned: (chatId, pinned) => {
      updateChatField(set, chatId, { pinned })
    }
  }))
)

// --- Subscribers (each with a single responsibility) ---

// Subscriber 1: Persist chatList
useChatStore.subscribe(
  (state) => state.chatList,
  (chatList) => {
    if (!useChatStore.getState().isChatHydrated) return

    chatRepo.saveChatList(chatList)
  }
)

// Subscriber 2: Incremental cleanup when chats are removed
useChatStore.subscribe(
  (state) => state.chatList.map((chat) => chat.id),
  (chatIds, previousChatIds) => {
    if (!useChatStore.getState().isChatHydrated) return

    const previousIds = previousChatIds ?? []
    if (previousIds.length === 0) return

    const currentIds = new Set(chatIds)
    const removedIds = previousIds.filter((id) => !currentIds.has(id))
    if (removedIds.length > 0) {
      cleanupOrphans(currentIds, { candidateIds: removedIds })
    }
  },
  { equalityFn: shallow }
)

// Subscriber 3: One-time orphan reconciliation after hydration
useChatStore.subscribe(
  (state) => state.isChatHydrated,
  (isChatHydrated, wasChatHydrated) => {
    if (!isChatHydrated || wasChatHydrated) return

    const validIds = getChatIdSet(useChatStore.getState().chatList)
    cleanupOrphans(validIds)
    schedulePersistedOrphanCleanup()
  }
)

// Subscriber 4: Persist currentChatId
useChatStore.subscribe(
  (state) => state.currentChatId,
  (currentChatId) => {
    if (!useChatStore.getState().isChatHydrated) return

    if (currentChatId) {
      chatRepo.saveCurrentChatId(currentChatId)
    } else {
      chatRepo.removeCurrentChatId()
    }
  }
)

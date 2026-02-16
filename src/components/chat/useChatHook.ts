'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChatRef } from '@/components/chat/chat'
import { getTextFromParts } from '@/components/chat/chat-attachments'
import type { ChatContextValue } from '@/components/chat/chatContext'
import type { Chat, ChatMessage, Persona } from '@/components/chat/interface'
import { DefaultPersona, ensureMessageIds } from '@/components/chat/utils'
import { cacheGet, cacheGetJson, cacheRemove, cacheSet, cacheSetJson } from '@/lib/cache'
import { v4 as uuid } from 'uuid'

const STORAGE_KEYS = {
  chatList: 'chatList',
  chatCurrentId: 'chatCurrentID'
} as const

const WORD_SPLIT_REGEX = /\s+/
const BR_TAG_REGEX = /<br\s*\/?>/gi
const HTML_TAG_REGEX = /<[^>]*>/g

type StoredChatData = {
  chatList: Chat[]
  currentChatId: string | undefined
  messagesById: Map<string, ChatMessage[]>
}

function normalizeChatList(list: unknown): Chat[] {
  if (!Array.isArray(list)) {
    return []
  }

  const seen = new Set<string>()
  const now = new Date().toISOString()
  const result: Chat[] = []

  for (const chat of list) {
    if (!chat || typeof chat !== 'object') continue
    const record = chat as Chat
    const chatId = record.id
    if (!chatId || typeof chatId !== 'string' || seen.has(chatId)) continue
    seen.add(chatId)

    const createdAt = record.createdAt ?? now
    const updatedAt = record.updatedAt ?? createdAt
    const title = record.title || record.persona?.name || 'New Chat'
    const pinned = record.pinned ?? false
    result.push({ ...record, pinned, createdAt, updatedAt, title })
  }

  return result
}

function sortChatsByPinnedThenRecent(list: Chat[]): Chat[] {
  return [...list].sort((a, b) => {
    const pinnedDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
    if (pinnedDiff !== 0) {
      return pinnedDiff
    }
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(WORD_SPLIT_REGEX).slice(0, maxWords)
  return words.join(' ')
}

function stripHtmlTags(text: string): string {
  return text.replace(BR_TAG_REGEX, ' ').replace(HTML_TAG_REGEX, '')
}

function normalizeMessage(message: ChatMessage): ChatMessage {
  const parts = Array.isArray(message.parts) ? message.parts.filter(Boolean) : []

  return {
    ...message,
    parts,
    createdAt: message.createdAt ?? new Date().toISOString()
  }
}

function isLegacyMessage(message: unknown): boolean {
  if (!message || typeof message !== 'object') {
    return true
  }

  const candidate = message as {
    parts?: unknown
    content?: unknown
    sources?: unknown
  }

  if (
    Object.prototype.hasOwnProperty.call(candidate, 'content') ||
    Object.prototype.hasOwnProperty.call(candidate, 'sources')
  ) {
    return true
  }

  return !Array.isArray(candidate.parts)
}

function detectLegacyStoredChats(chatList: Chat[]): boolean {
  if (typeof window === 'undefined' || chatList.length === 0) {
    return false
  }

  for (const chat of chatList) {
    if (!chat?.id) continue
    const storedMessagesRaw = cacheGetJson<unknown>(`ms_${chat.id}`, [])
    if (!Array.isArray(storedMessagesRaw)) {
      return true
    }
    for (const message of storedMessagesRaw) {
      if (isLegacyMessage(message)) {
        return true
      }
    }
  }

  return false
}

function clearStoredChatsSafely(): void {
  try {
    cacheRemove(STORAGE_KEYS.chatList)
    cacheRemove(STORAGE_KEYS.chatCurrentId)

    if (typeof window === 'undefined') {
      return
    }

    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && key.startsWith('ms_')) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => {
      cacheRemove(key)
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[useChatHook] Failed to clear legacy chats', error)
    }
  }
}

function deriveTitleFromMessages(messages: ChatMessage[], fallback: string): string {
  const userMessage = messages.find((msg) => msg.role === 'user')
  const userContent = userMessage ? getTextFromParts(userMessage.parts ?? []).trim() : ''
  const firstContent = messages[0] ? getTextFromParts(messages[0].parts ?? []).trim() : ''
  const candidate = stripHtmlTags(userContent || firstContent || '')
  if (!candidate) {
    return fallback
  }
  return truncateToWords(candidate, 4)
}

function loadInitialChatData(): StoredChatData {
  return {
    chatList: [],
    currentChatId: undefined,
    messagesById: new Map<string, ChatMessage[]>()
  }
}

function loadStoredChatData(): StoredChatData {
  if (typeof window === 'undefined') {
    return loadInitialChatData()
  }

  try {
    const storedChatListRaw = cacheGetJson<unknown>(STORAGE_KEYS.chatList, [])
    const storedChatList = normalizeChatList(storedChatListRaw)
    if (detectLegacyStoredChats(storedChatList)) {
      clearStoredChatsSafely()
      return loadInitialChatData()
    }
    const storedCurrentChatId = cacheGet(STORAGE_KEYS.chatCurrentId)
    const messagesById = new Map<string, ChatMessage[]>()

    storedChatList.forEach((chat) => {
      if (!chat?.id) {
        return
      }
      const storedMessagesRaw = cacheGetJson<unknown>(`ms_${chat.id}`, [])
      const storedMessages = Array.isArray(storedMessagesRaw)
        ? storedMessagesRaw.filter((message) => message && typeof message === 'object')
        : []
      const normalizedMessages = ensureMessageIds(
        storedMessages.map((message) => normalizeMessage(message as ChatMessage))
      )
      messagesById.set(chat.id, normalizedMessages)
    })

    const initialChat =
      storedChatList.find((chat) => chat.id === storedCurrentChatId) || storedChatList[0]

    return {
      chatList: storedChatList,
      currentChatId: initialChat?.id,
      messagesById
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[useChatHook] Failed to hydrate stored chats', error)
    }
    return loadInitialChatData()
  }
}

type SyncOptions = { persist?: boolean; refreshConversation?: boolean }

function useChatHook(): ChatContextValue {
  const messagesMapRef = useRef<Map<string, ChatMessage[]>>(new Map<string, ChatMessage[]>())
  const chatInstanceRef = useRef<ChatRef | null>(null)
  const chatListRef = useRef<Chat[]>([])
  const currentChatIdRef = useRef<string | undefined>(undefined)
  const hasHydratedRef = useRef(false)
  const [initialData] = useState(loadInitialChatData)

  const [currentChatId, setCurrentChatId] = useState<string | undefined>(initialData.currentChatId)
  const [chatList, setChatList] = useState<Chat[]>(initialData.chatList)
  const [isChatHydrated, setIsChatHydrated] = useState(false)

  const currentChat = useMemo(
    () => chatList.find((chat) => chat.id === currentChatId),
    [chatList, currentChatId]
  )

  const applyState = useCallback(
    (nextList: Chat[], requestedCurrentId?: string, options?: SyncOptions) => {
      const normalized = sortChatsByPinnedThenRecent(normalizeChatList(nextList))
      const requestedId = requestedCurrentId ?? currentChatIdRef.current
      const resolvedCurrentId = normalized.find((chat) => chat.id === requestedId)
        ? requestedId
        : normalized[0]?.id
      const shouldPersist = options?.persist ?? isChatHydrated
      const shouldRefreshConversation = options?.refreshConversation ?? true

      chatListRef.current = normalized
      currentChatIdRef.current = resolvedCurrentId
      setChatList(normalized)
      setCurrentChatId(resolvedCurrentId)

      const validIds = new Set(normalized.map((chat) => chat.id))
      messagesMapRef.current.forEach((_, key) => {
        if (!validIds.has(key)) {
          messagesMapRef.current.delete(key)
          if (shouldPersist) {
            cacheRemove(`ms_${key}`)
          }
        }
      })

      if (shouldPersist) {
        cacheSetJson(STORAGE_KEYS.chatList, normalized)
        if (resolvedCurrentId) {
          cacheSet(STORAGE_KEYS.chatCurrentId, resolvedCurrentId)
        } else {
          cacheRemove(STORAGE_KEYS.chatCurrentId)
        }
      }

      if (shouldRefreshConversation) {
        const nextMessages = resolvedCurrentId
          ? messagesMapRef.current.get(resolvedCurrentId) || []
          : []
        chatInstanceRef.current?.setConversation(nextMessages, resolvedCurrentId ?? null)
        chatInstanceRef.current?.focus()
      }
    },
    [isChatHydrated]
  )

  const getChatById = useCallback((id?: string | null) => {
    const targetId = id ?? currentChatIdRef.current
    if (!targetId) {
      return undefined
    }
    return chatListRef.current.find((chat) => chat.id === targetId)
  }, [])

  const updateChatTitle = useCallback(
    (chatId: string, title: string) => {
      const nextList = chatListRef.current.map((chat) =>
        chat.id === chatId ? { ...chat, title: title || chat.title } : chat
      )
      applyState(nextList, currentChatIdRef.current, { refreshConversation: false })
    },
    [applyState]
  )

  const updateChatPinned = useCallback(
    (chatId: string, pinned: boolean) => {
      const nextList = chatListRef.current.map((chat) =>
        chat.id === chatId ? { ...chat, pinned } : chat
      )
      applyState(nextList, currentChatIdRef.current, { refreshConversation: false })
    },
    [applyState]
  )

  const saveMessages = useCallback(
    (messages: ChatMessage[], chatId?: string, options?: { chat?: Chat }) => {
      const targetChatId = chatId ?? currentChatIdRef.current
      if (!targetChatId) {
        return
      }
      const previousCount = messagesMapRef.current.get(targetChatId)?.length ?? 0
      const normalizedMessages = ensureMessageIds(messages.map(normalizeMessage))
      const latestTimestamp = normalizedMessages.at(-1)?.createdAt ?? new Date().toISOString()
      const hasNewMessages = normalizedMessages.length > previousCount
      const activityTimestamp = hasNewMessages ? new Date().toISOString() : latestTimestamp
      if (messages.length > 0) {
        cacheSetJson(`ms_${targetChatId}`, normalizedMessages)
        messagesMapRef.current.set(targetChatId, normalizedMessages)
      } else {
        cacheRemove(`ms_${targetChatId}`)
        messagesMapRef.current.delete(targetChatId)
      }
      const baseList = chatListRef.current
      const existingChatIndex = baseList.findIndex((item) => item.id === targetChatId)
      const isFirstMessage = previousCount === 0 && normalizedMessages.length > 0

      let nextList: Chat[]
      if (existingChatIndex !== -1) {
        nextList = baseList.map((item) => {
          if (item.id !== targetChatId) return item

          const isDefaultPersona = !item.persona || item.persona.id === 'chatgpt'
          const shouldDeriveTitle = isFirstMessage && isDefaultPersona
          const fallbackTitle =
            item.title || options?.chat?.title || options?.chat?.persona?.name || 'New Chat'

          return {
            ...item,
            updatedAt: messages.length > 0 ? activityTimestamp : item.updatedAt,
            title: shouldDeriveTitle
              ? deriveTitleFromMessages(normalizedMessages, fallbackTitle)
              : item.title
          }
        })
      } else {
        const newChat: Chat = {
          id: targetChatId,
          persona: options?.chat?.persona,
          title: options?.chat?.title || options?.chat?.persona?.name || 'New Chat',
          createdAt: latestTimestamp,
          updatedAt: latestTimestamp
        }
        nextList = [newChat, ...baseList]
      }

      applyState(nextList, currentChatIdRef.current, { refreshConversation: false })
    },
    [applyState]
  )

  const activateChat = useCallback(
    (chat: Chat, options?: { persistOutgoing?: boolean }) => {
      const { persistOutgoing = true } = options || {}
      const prevId = currentChatIdRef.current
      const isStreaming = chatInstanceRef.current?.isStreaming?.() ?? false
      if (persistOutgoing && prevId && prevId !== chat.id && !isStreaming) {
        const outgoingMessages = chatInstanceRef.current?.getConversation() || []
        saveMessages(outgoingMessages, prevId)
      }

      const baseList = chatListRef.current
      const exists = baseList.some((item) => item.id === chat.id)
      const updatedList = exists ? baseList : [chat, ...baseList]
      applyState(updatedList, chat.id)
    },
    [applyState, saveMessages]
  )

  const onChangeChat = useCallback(
    (chat: Chat) => {
      activateChat(chat)
    },
    [activateChat]
  )

  const onCreateChat = useCallback(
    (persona: Persona, firstMessage?: string) => {
      const id = uuid()
      const now = new Date().toISOString()
      const quickTitle = firstMessage
        ? truncateToWords(firstMessage, 4)
        : persona.name || 'New Chat'
      const newChat: Chat = {
        id,
        persona,
        title: quickTitle,
        createdAt: now,
        updatedAt: now
      }
      activateChat(newChat)
      return newChat
    },
    [activateChat]
  )

  const onCreateDefaultChat = useCallback(
    (firstMessage?: string) => {
      return onCreateChat(DefaultPersona, firstMessage)
    },
    [onCreateChat]
  )

  const onDeleteChat = useCallback(
    (chat: Chat) => {
      const filteredList = chatListRef.current.filter((item) => item.id !== chat.id)
      cacheRemove(`ms_${chat.id}`)
      messagesMapRef.current.delete(chat.id)

      const hasChatsLeft = filteredList.length > 0
      const now = new Date().toISOString()
      const nextList = hasChatsLeft
        ? filteredList
        : [
            {
              id: uuid(),
              title: 'New Chat',
              persona: DefaultPersona,
              createdAt: now,
              updatedAt: now
            }
          ]

      const isCurrentChatDeleted = currentChatId === chat.id || currentChatIdRef.current === chat.id
      const needsNewSelection = isCurrentChatDeleted || !hasChatsLeft
      const nextChatId = needsNewSelection ? nextList[0]?.id : currentChatIdRef.current

      applyState(nextList, nextChatId)
    },
    [applyState, currentChatId]
  )

  useEffect(() => {
    if (hasHydratedRef.current) {
      return
    }
    hasHydratedRef.current = true
    const stored = loadStoredChatData()
    messagesMapRef.current = new Map(stored.messagesById)
    if (stored.chatList.length === 0) {
      const now = new Date().toISOString()
      const defaultChat: Chat = {
        id: uuid(),
        title: 'New Chat',
        persona: DefaultPersona,
        createdAt: now,
        updatedAt: now
      }
      applyState([defaultChat], defaultChat.id, { persist: true })
    } else {
      applyState(stored.chatList, stored.currentChatId, { persist: false })
    }
    setIsChatHydrated(true)
  }, [applyState])

  return {
    chatRef: chatInstanceRef,
    currentChatId,
    currentChat,
    chatList,
    isChatHydrated,
    getChatById,
    updateChatTitle,
    updateChatPinned,
    onCreateChat,
    onCreateDefaultChat,
    onDeleteChat,
    onChangeChat,
    saveMessages
  }
}

export default useChatHook

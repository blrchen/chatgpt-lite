'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DefaultPersonas, ensureMessageIds } from '@/components/chat/utils'
import { cacheGet, cacheGetJson, cacheRemove, cacheSet } from '@/lib/cache'
import { v4 as uuid } from 'uuid'

import { ChatRef } from './chat'
import type { ChatContextValue } from './chatContext'
import { Chat, ChatMessage, Persona } from './interface'

const STORAGE_KEYS = {
  chatList: 'chatList',
  chatCurrentId: 'chatCurrentID'
} as const

const normalizeChatList = (list: Chat[]) => {
  const seen = new Set<string>()
  const now = new Date().toISOString()

  return list
    .filter((chat) => chat?.id && !seen.has(chat.id) && seen.add(chat.id))
    .map((chat) => {
      const createdAt = chat.createdAt ?? now
      const updatedAt = chat.updatedAt ?? createdAt
      const title = chat.title || chat.persona?.name || 'New Chat'
      return { ...chat, createdAt, updatedAt, title }
    })
}

const sortChatsByRecent = (list: Chat[]) =>
  [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

const truncateToWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).slice(0, maxWords)
  return words.join(' ')
}

const deriveTitleFromMessages = (messages: ChatMessage[], fallback: string) => {
  const userContent = messages.find((msg) => msg.role === 'user')?.content?.trim()
  const candidate = userContent || messages[0]?.content?.trim() || ''
  if (!candidate) {
    return fallback
  }
  return truncateToWords(candidate, 4)
}

const loadInitialChatData = () => ({
  chatList: [],
  currentChatId: undefined,
  messagesById: new Map<string, ChatMessage[]>()
})

const loadStoredChatData = () => {
  if (typeof window === 'undefined') {
    return loadInitialChatData()
  }
  const storedChatList = normalizeChatList(cacheGetJson<Chat[]>(STORAGE_KEYS.chatList, []))
  const storedCurrentChatId = cacheGet(STORAGE_KEYS.chatCurrentId)
  const messagesById = new Map<string, ChatMessage[]>()

  storedChatList.forEach((chat) => {
    if (!chat?.id) {
      return
    }
    const messages = cacheGetJson<ChatMessage[]>(`ms_${chat.id}`, [])
    messagesById.set(chat.id, ensureMessageIds(messages))
  })

  const initialChat =
    storedChatList.find((chat) => chat.id === storedCurrentChatId) || storedChatList[0]

  return {
    chatList: storedChatList,
    currentChatId: initialChat?.id,
    messagesById
  }
}

type SyncOptions = { persist?: boolean; refreshConversation?: boolean }

const useChatHook = (): ChatContextValue => {
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
      const normalized = sortChatsByRecent(normalizeChatList(nextList))
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
        cacheSet(STORAGE_KEYS.chatList, JSON.stringify(normalized))
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
      chatListRef.current = nextList
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
      const normalizedMessages = ensureMessageIds(messages)
      const latestTimestamp = normalizedMessages.at(-1)?.createdAt ?? new Date().toISOString()
      if (messages.length > 0) {
        cacheSet(`ms_${targetChatId}`, JSON.stringify(normalizedMessages))
        messagesMapRef.current.set(targetChatId, normalizedMessages)
      } else {
        cacheRemove(`ms_${targetChatId}`)
        messagesMapRef.current.delete(targetChatId)
      }
      const baseList = chatListRef.current
      const withChat = baseList.some((item) => item.id === targetChatId)
        ? baseList.map((item) =>
            item.id === targetChatId
              ? {
                  ...item,
                  updatedAt: messages.length > 0 ? latestTimestamp : item.updatedAt,
                  title:
                    previousCount === 0 &&
                    normalizedMessages.length > 0 &&
                    (!item.persona || item.persona.id === 'chatgpt')
                      ? deriveTitleFromMessages(
                          normalizedMessages,
                          item.title ||
                            options?.chat?.title ||
                            options?.chat?.persona?.name ||
                            'New Chat'
                        )
                      : item.title
                }
              : item
          )
        : [
            {
              id: targetChatId,
              persona: options?.chat?.persona,
              title: options?.chat?.title || options?.chat?.persona?.name || 'New Chat',
              createdAt: latestTimestamp,
              updatedAt: latestTimestamp
            },
            ...baseList
          ]
      const nextList = withChat
      applyState(nextList, currentChatIdRef.current, { refreshConversation: false })
    },
    [applyState]
  )

  const activateChat = useCallback(
    (chat: Chat, options?: { persistOutgoing?: boolean }) => {
      const { persistOutgoing = true } = options || {}
      const prevId = currentChatIdRef.current
      if (persistOutgoing && prevId && prevId !== chat.id) {
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
      return onCreateChat(DefaultPersonas[0], firstMessage)
    },
    [onCreateChat]
  )

  const onDeleteChat = useCallback(
    (chat: Chat) => {
      const filteredList = chatListRef.current.filter((item) => item.id !== chat.id)
      cacheRemove(`ms_${chat.id}`)
      messagesMapRef.current.delete(chat.id)

      const hasChatsLeft = filteredList.length > 0
      const nextList = hasChatsLeft
        ? filteredList
        : [
            {
              id: uuid(),
              title: DefaultPersonas[0].name || 'New Chat',
              persona: DefaultPersonas[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]

      const nextChatId =
        currentChatId === chat.id || currentChatIdRef.current === chat.id || !hasChatsLeft
          ? nextList[0]?.id
          : currentChatIdRef.current

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
        title: DefaultPersonas[0].name || 'New Chat',
        persona: DefaultPersonas[0],
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
    onCreateChat,
    onCreateDefaultChat,
    onDeleteChat,
    onChangeChat,
    saveMessages
  }
}

export default useChatHook

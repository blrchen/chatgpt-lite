'use client'

import { createContext, MutableRefObject } from 'react'

import type { ChatRef } from './chat'
import { Chat, ChatMessage, Persona } from './interface'

type ChatContextValue = {
  chatRef?: MutableRefObject<ChatRef | null>
  currentChatId?: string
  currentChat: Chat | undefined
  chatList: Chat[]
  isChatHydrated: boolean
  getChatById: (id?: string | null) => Chat | undefined
  updateChatTitle: (id: string, title: string) => void
  onDeleteChat: (chat: Chat) => void
  onCreateChat: (persona: Persona, firstMessage?: string) => Chat | undefined
  onCreateDefaultChat: (firstMessage?: string) => Chat | undefined
  onChangeChat: (chat: Chat) => void
  saveMessages: (messages: ChatMessage[], chatId?: string, options?: { chat?: Chat }) => void
}

const ChatContext = createContext<ChatContextValue>({
  currentChat: undefined,
  currentChatId: undefined,
  chatList: [],
  isChatHydrated: false,
  getChatById: () => undefined,
  updateChatTitle: () => {},
  onDeleteChat: () => {},
  onCreateChat: () => undefined,
  onCreateDefaultChat: () => undefined,
  onChangeChat: () => {},
  saveMessages: () => {}
})

export type { ChatContextValue }
export default ChatContext

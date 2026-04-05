import {
  coercePersonaId,
  DefaultPersona,
  getChatFallbackTitle,
  getTextFromParts,
  resolveChatTitle
} from '@/lib/chat-utils'
import { generateId } from '@/lib/id'
import type { Chat, ChatMessage, PersonaId } from '@/lib/types'
import { isJsonObject, readJsonString, type JsonValue } from '@/types/json'

const WORD_SPLIT_REGEX = /\s+/
const BR_TAG_REGEX = /<br\s*\/?>/gi
const HTML_TAG_REGEX = /<[^>]*>/g

export function normalizeChatList(list: JsonValue | Chat[]): Chat[] {
  if (!Array.isArray(list)) return []

  const seen = new Set<string>()
  const now = new Date().toISOString()
  const result: Chat[] = []

  for (const chat of list) {
    if (!isJsonObject(chat)) continue
    const chatId = readJsonString(chat, 'id')
    if (!chatId || seen.has(chatId)) continue
    seen.add(chatId)

    const createdAt = readJsonString(chat, 'createdAt') ?? now
    const updatedAt = readJsonString(chat, 'updatedAt') ?? createdAt
    const pinned = typeof chat.pinned === 'boolean' ? chat.pinned : false
    const personaId = coercePersonaId(readJsonString(chat, 'personaId'))
    const title = resolveChatTitle({ title: readJsonString(chat, 'title'), personaId })
    result.push({ id: chatId, pinned, createdAt, updatedAt, title, personaId })
  }

  return result
}

export type CreateChatRecordArgs = {
  id?: string
  title?: string
  personaId?: PersonaId
  personaName?: string
  createdAt?: string
  updatedAt?: string
  pinned?: boolean
}

export function createChatRecord({
  id = generateId(),
  title,
  personaId = DefaultPersona.id,
  personaName,
  createdAt = new Date().toISOString(),
  updatedAt = createdAt,
  pinned
}: CreateChatRecordArgs = {}): Chat {
  const chat: Chat = {
    id,
    title: title || getChatFallbackTitle(personaId, personaName),
    personaId,
    createdAt,
    updatedAt
  }
  if (pinned !== undefined) {
    chat.pinned = pinned
  }
  return chat
}

export function sortChatsByPinnedThenRecent(list: Chat[]): Chat[] {
  return list.toSorted((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function resolveCurrentId(
  chatList: Chat[],
  requestedId: string | undefined
): string | undefined {
  if (requestedId && chatList.some((c) => c.id === requestedId)) return requestedId
  return chatList[0]?.id
}

export function truncateToWords(text: string, maxWords: number): string {
  return text.split(WORD_SPLIT_REGEX).slice(0, maxWords).join(' ')
}

function stripHtmlTags(text: string): string {
  return text.replace(BR_TAG_REGEX, ' ').replace(HTML_TAG_REGEX, '')
}

export function deriveTitleFromMessages(messages: ChatMessage[], fallback: string): string {
  const userMessage = messages.find((msg) => msg.role === 'user')
  const userContent = userMessage ? getTextFromParts(userMessage.parts ?? []).trim() : ''
  const rawContent =
    userContent || (messages[0] ? getTextFromParts(messages[0].parts ?? []).trim() : '')
  const candidate = stripHtmlTags(rawContent)
  if (!candidate) return fallback
  return truncateToWords(candidate, 4)
}

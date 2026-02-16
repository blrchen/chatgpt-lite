import type { PDFImage } from '@/lib/file-parser'
import type { UIMessage, UIMessagePart, UITools } from 'ai'

export type TextMessagePart = { type: 'text'; text: string }
export type ImageMessagePart = { type: 'image'; image: string; mimeType?: string }
export type DocumentMessagePart = {
  type: 'document'
  name: string
  content: string
  mimeType: string
  images?: PDFImage[]
}

export type MessageContentPart = TextMessagePart | ImageMessagePart | DocumentMessagePart
export type MessageContent = string | MessageContentPart[]

export type ChatMessageSource =
  | { type: 'url'; id: string; url: string; title?: string }
  | { type: 'document'; id: string; mediaType: string; title: string; filename?: string }

export type DocumentAttachmentData = {
  name: string
  content: string
  mimeType: string
  images?: PDFImage[]
}

export type ChatMessageDataParts = {
  document: DocumentAttachmentData
}

export type ChatMessagePart = UIMessagePart<ChatMessageDataParts, UITools>

export interface ChatMessage extends UIMessage<unknown, ChatMessageDataParts, UITools> {
  createdAt?: string
}

export interface Persona {
  id?: string
  role: ChatRole
  name?: string
  prompt?: string
}

export interface Chat {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  pinned?: boolean
  persona?: Persona
}

export type ChatRole = 'assistant' | 'user' | 'system'

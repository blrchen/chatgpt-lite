import type { PDFImage } from '@/lib/file-parser'
import type { JsonValue } from '@/types/json'
import type { UIMessage, UIMessagePart, UITools } from 'ai'

export type ChatMessageSource =
  | { type: 'url'; sourceId: string; url: string; title?: string }
  | {
      type: 'document'
      sourceId: string
      mediaType: string
      title: string
      filename?: string
    }

export type DocumentAttachmentData = {
  name: string
  content: string
  mimeType: string
  images?: PDFImage[]
}

type ChatMessageDataParts = {
  document: DocumentAttachmentData
}

export type ChatMessagePart = UIMessagePart<ChatMessageDataParts, UITools>
type ChatMessageMetadata = Record<string, JsonValue>

type BaseChatMessage = Omit<
  UIMessage<ChatMessageMetadata, ChatMessageDataParts, UITools>,
  'createdAt'
>

export type ChatMessage = BaseChatMessage & {
  createdAt?: Date
}

declare const personaIdBrand: unique symbol
export type PersonaId = string & { readonly [personaIdBrand]: 'PersonaId' }

export interface Persona {
  id: PersonaId
  role: 'system'
  name?: string
  prompt: string
}

export interface Chat {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  pinned?: boolean
  personaId?: PersonaId
}

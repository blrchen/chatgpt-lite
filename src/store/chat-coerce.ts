import {
  persistedChatMessageSchema,
  chatMessagePartSchema,
  documentAttachmentSchema,
  pdfImageSchema
} from '@/lib/chat-message-contract'
import { isImageMediaType, normalizeMediaType } from '@/lib/chat-message-part-utils'
import { generateId } from '@/lib/id'
import type { ChatMessage, ChatMessagePart, DocumentAttachmentData } from '@/lib/types'
import { isJsonObject, readJsonString, type JsonValue } from '@/types/json'

type StoredPdfImage = NonNullable<DocumentAttachmentData['images']>[number]
const documentAttachmentWithoutImagesSchema = documentAttachmentSchema.omit({ images: true })

function coerceStoredPdfImage(value: JsonValue | undefined): StoredPdfImage | null {
  const parsed = pdfImageSchema.safeParse(value)
  if (!parsed.success) {
    return null
  }

  return parsed.data
}

function coerceDocumentAttachmentData(value: JsonValue | undefined): DocumentAttachmentData | null {
  if (!isJsonObject(value)) return null

  const base = documentAttachmentWithoutImagesSchema.safeParse(value)
  if (!base.success) return null

  let images: StoredPdfImage[] | undefined
  if (Array.isArray(value.images)) {
    images = []
    for (const raw of value.images) {
      const image = coerceStoredPdfImage(raw)
      if (image) images.push(image)
    }
  }

  return { ...base.data, images }
}

function coerceStoredDataDocumentPart(value: JsonValue): ChatMessagePart | null {
  if (!isJsonObject(value)) {
    return null
  }

  const data = coerceDocumentAttachmentData(value.data)
  if (!data) {
    return null
  }

  const id = readJsonString(value, 'id')
  return id ? { type: 'data-document', id, data } : { type: 'data-document', data }
}

function isValidStoredFilePart(value: JsonValue): boolean {
  if (!isJsonObject(value)) {
    return false
  }

  const mediaType = normalizeMediaType(readJsonString(value, 'mediaType'))
  const url = readJsonString(value, 'url')
  if (mediaType == null || url === undefined) {
    return false
  }

  return url.length > 0 || isImageMediaType(mediaType)
}

function coerceStoredMessagePart(value: JsonValue | undefined): ChatMessagePart | null {
  if (!isJsonObject(value)) return null

  const type = readJsonString(value, 'type')
  if (!type) return null

  if (type === 'data-document') {
    return coerceStoredDataDocumentPart(value)
  }

  const parsedPart = chatMessagePartSchema.safeParse(value)
  if (!parsedPart.success) return null

  if (type === 'file' && !isValidStoredFilePart(value)) {
    return null
  }

  // Keep forward-compatible AI SDK part shapes instead of dropping them during hydrate.
  return parsedPart.data as ChatMessagePart
}

function coerceStoredMessageParts(value: JsonValue | undefined): ChatMessagePart[] | null {
  if (!Array.isArray(value)) return null

  const parts: ChatMessagePart[] = []
  for (const raw of value) {
    const part = coerceStoredMessagePart(raw)
    if (part) parts.push(part)
  }
  return parts
}

function coerceStoredCreatedAt(value: JsonValue | undefined): Date | undefined {
  const createdAt = typeof value === 'string' ? value : undefined
  if (!createdAt) return undefined

  const parsedDate = new Date(createdAt)
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
}

export function coerceStoredMessage(message: JsonValue | undefined): ChatMessage | null {
  const parsed = persistedChatMessageSchema.safeParse(message)
  if (!parsed.success) return null

  const id = parsed.data.id ?? generateId()
  const createdAt = coerceStoredCreatedAt(parsed.data.createdAt as JsonValue | undefined)
  const parts = coerceStoredMessageParts(parsed.data.parts as JsonValue[] | undefined)
  if (parts === null) return null

  return { id, createdAt, role: parsed.data.role, parts }
}

import type { ParsedFile } from '@/lib/file-parser'
import { generateId } from '@/lib/id'
import type { ChatMessagePart, DocumentAttachmentData } from '@/lib/types'
import type { FileUIPart } from 'ai'

import { SUPPORTED_API_IMAGE_TYPES } from './chat-attachment-shared'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'] as const
const IMAGE_EXTENSION_SET = new Set<string>(IMAGE_EXTENSIONS)

// HEIC/HEIF are accepted in IMAGE_EXTENSIONS so users can select those files, but they are
// intentionally excluded from this pass-through map because provider APIs do not accept them.
// getImageMimeType will still infer image/heic or image/heif from extension, and
// convertImageToSupportedFormat converts unsupported types to PNG before send.
const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}

const SUPPORTED_DOCUMENT_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
] as const
const SUPPORTED_DOCUMENT_MIME_TYPE_SET = new Set<string>(SUPPORTED_DOCUMENT_MIME_TYPES)
const DOCUMENT_EXTENSIONS = ['.txt', '.md', '.csv', '.pdf', '.xlsx', '.xls'] as const
const DOCUMENT_EXTENSION_SET = new Set<string>(DOCUMENT_EXTENSIONS)

export const ATTACHMENTS_ACCEPT = [
  'image/*',
  ...IMAGE_EXTENSIONS,
  ...DOCUMENT_EXTENSIONS,
  ...SUPPORTED_DOCUMENT_MIME_TYPES
].join(',')

export type UploadedImage = {
  id: string
  url: string
  mimeType: string
  name?: string
}

type UploadedImageInput = Omit<UploadedImage, 'id'>

export function createUploadedImage(image: UploadedImageInput): UploadedImage {
  return {
    id: generateId(),
    ...image
  }
}

export type UploadedDocument = ParsedFile & {
  id: string
}

export function createUploadedDocument(document: ParsedFile): UploadedDocument {
  return {
    id: generateId(),
    ...document
  }
}

export interface ChatComposerPayload {
  text: string
  uploadedImages: UploadedImage[]
  uploadedDocuments: UploadedDocument[]
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read file data URL'))
        return
      }

      resolve(reader.result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.onabort = () => reject(new Error('File read was aborted'))
    reader.readAsDataURL(file)
  })
}

export function convertImageToSupportedFormat(
  dataUrl: string,
  mimeType: string
): Promise<{ url: string; mimeType: string }> {
  const normalizedMimeType = mimeType.toLowerCase()

  if (SUPPORTED_API_IMAGE_TYPES.has(normalizedMimeType)) {
    return Promise.resolve({ url: dataUrl, mimeType: normalizedMimeType })
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        ctx.drawImage(img, 0, 0)
        const convertedUrl = canvas.toDataURL('image/png')
        resolve({ url: convertedUrl, mimeType: 'image/png' })
      } catch {
        reject(new Error('Failed to convert image'))
      }
    }
    img.onerror = () =>
      reject(new Error('Unsupported image format. Supported: JPEG, PNG, GIF, WebP'))
    img.src = dataUrl
  })
}

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex) : ''
}

export function getImageMimeType(file: File): string {
  const normalizedType = file.type.toLowerCase()

  if (normalizedType && normalizedType !== 'application/octet-stream') {
    return normalizedType
  }

  const extension = getFileExtension(file.name.toLowerCase())
  const mappedMimeType = EXT_TO_MIME[extension]
  if (mappedMimeType) {
    return mappedMimeType
  }

  if (extension) {
    return `image/${extension.slice(1)}`
  }

  return normalizedType || 'application/octet-stream'
}

export function isImageFile(file: File): boolean {
  return (
    file.type.toLowerCase().startsWith('image/') ||
    IMAGE_EXTENSION_SET.has(getFileExtension(file.name.toLowerCase()))
  )
}

export function isDocumentFile(file: File): boolean {
  return (
    SUPPORTED_DOCUMENT_MIME_TYPE_SET.has(file.type.toLowerCase()) ||
    DOCUMENT_EXTENSION_SET.has(getFileExtension(file.name.toLowerCase()))
  )
}

export function buildUserMessageParts(
  text: string,
  uploadedImages: UploadedImage[],
  uploadedDocuments: UploadedDocument[]
): ChatMessagePart[] {
  const parts: ChatMessagePart[] = []

  if (text) {
    parts.push({ type: 'text', text })
  }

  for (const image of uploadedImages) {
    const filePart: FileUIPart = {
      type: 'file',
      mediaType: image.mimeType,
      url: image.url,
      filename: image.name
    }
    parts.push(filePart)
  }

  for (const doc of uploadedDocuments) {
    const data: DocumentAttachmentData = {
      name: doc.name,
      content: doc.content,
      mimeType: doc.mimeType,
      images: doc.images
    }

    parts.push({ type: 'data-document', id: doc.id, data })
  }

  return parts
}

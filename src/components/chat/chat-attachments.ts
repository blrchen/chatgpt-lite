import type {
  ChatMessagePart,
  DocumentAttachmentData,
  MessageContent,
  MessageContentPart
} from '@/components/chat/interface'
import type { ParsedFile } from '@/lib/file-parser'
import type { FileUIPart } from 'ai'

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
]
export const DOCUMENT_EXTENSIONS = ['.txt', '.csv', '.pdf', '.xlsx', '.xls']

export type UploadedImage = { url: string; mimeType: string; name?: string }
export type UploadedDocument = ParsedFile

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function isImageFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  return file.type.startsWith('image/') || IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext))
}

export function isDocumentFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  return (
    SUPPORTED_DOCUMENT_MIME_TYPES.includes(fileType) ||
    DOCUMENT_EXTENSIONS.some((ext) => fileName.endsWith(ext))
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

    parts.push({ type: 'data-document', data })
  }

  return parts
}

export function buildMessageContentFromParts(parts: ChatMessagePart[]): MessageContent {
  const resultParts: MessageContentPart[] = []

  for (const part of parts) {
    if (part.type === 'text') {
      resultParts.push({ type: 'text', text: part.text })
    } else if (part.type === 'file') {
      if (part.mediaType.startsWith('image/')) {
        resultParts.push({ type: 'image', image: part.url, mimeType: part.mediaType })
      }
    } else if (part.type === 'data-document') {
      const doc = part.data
      resultParts.push({
        type: 'document',
        name: doc.name,
        content: doc.content,
        mimeType: doc.mimeType,
        images: doc.images
      })
    }
  }

  if (resultParts.length === 0) {
    return ''
  }

  if (resultParts.length === 1 && resultParts[0]?.type === 'text') {
    return resultParts[0].text
  }

  return resultParts
}

export function getTextFromParts(parts: ChatMessagePart[]): string {
  const textSegments: string[] = []

  for (const part of parts) {
    if (part.type === 'text') {
      textSegments.push(part.text)
    } else if (part.type === 'data-document') {
      textSegments.push(part.data.name)
    }
  }

  return textSegments.join(' ')
}

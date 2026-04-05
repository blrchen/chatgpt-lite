import { isDataUrl } from '@/lib/chat-message-part-utils'
import type { ChatMessage } from '@/lib/types'

/**
 * Strip large binary data (base64 data URLs, PDF images) from message parts
 * before persisting to localStorage to avoid exceeding the ~5MB quota.
 * The in-memory copy retains the full data for API requests and display.
 */
export function stripBinaryDataForStorage(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    if (message.role !== 'user' || !Array.isArray(message.parts)) {
      return message
    }

    let hasChanges = false
    const strippedParts = message.parts.map((part) => {
      if (part.type === 'file' && typeof part.url === 'string' && isDataUrl(part.url)) {
        hasChanges = true
        return { ...part, url: '' }
      }

      if (
        part.type === 'data-document' &&
        part.data &&
        Array.isArray(part.data.images) &&
        part.data.images.length > 0
      ) {
        hasChanges = true
        return { ...part, data: { ...part.data, images: [] } }
      }

      return part
    })

    return hasChanges ? { ...message, parts: strippedParts } : message
  })
}

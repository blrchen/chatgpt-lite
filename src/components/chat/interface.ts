import { UIMessage as AISDKUIMessage } from '@ai-sdk/react'

// Re-export UIMessage from AI SDK
export type UIMessage = AISDKUIMessage

// Legacy types - kept for backward compatibility with localStorage
export type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string; mimeType?: string }
      | { type: 'document'; name: string; content: string; mimeType: string }
    >

export type SourceAnnotation =
  | {
      type: 'source-url'
      sourceId: string
      url: string
      title?: string
    }
  | {
      type: 'source-document'
      sourceId: string
      title?: string
      documentId?: string
    }
  | {
      type: 'citation'
      sourceId: string
      text: string
      reference?: string
    }
  | {
      type: 'url_citation' // Claude native format with text positions
      sourceId?: string
      url: string
      title?: string
      start_index: number // Character position where citation starts
      end_index: number // Character position where citation ends
    }

// Legacy ChatMessage type - kept for backward compatibility
export interface ChatMessage {
  id: string
  createdAt: string
  content: MessageContent
  role: ChatRole
  sources?: SourceAnnotation[]
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
  persona?: Persona
}

export type ChatRole = 'assistant' | 'user' | 'system'

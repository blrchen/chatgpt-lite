import { v4 as uuid } from 'uuid'

import type { ChatMessage, Persona } from './interface'

export function generateMessageId(): string {
  return globalThis.crypto?.randomUUID?.() ?? uuid()
}

export function ensureMessageIds(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    id: message.id ?? generateMessageId(),
    createdAt: message.createdAt ?? new Date().toISOString()
  }))
}

export const DefaultPersona: Persona = {
  id: 'chatgpt',
  role: 'system',
  name: 'ChatGPT',
  prompt: 'You are an AI assistant that helps people find information.'
}

export const DefaultPersonas: Persona[] = [DefaultPersona]

export function findLastMessageIndex(messages: ChatMessage[], role: ChatMessage['role']): number {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === role) {
      return i
    }
  }
  return -1
}

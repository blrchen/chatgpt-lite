import { v4 as uuid } from 'uuid'

import { ChatMessage, Persona } from './interface'

export const generateMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return uuid()
}

export const ensureMessageIds = (messages: ChatMessage[]) =>
  messages.map((message) => ({
    ...message,
    id: message.id ?? generateMessageId(),
    createdAt: message.createdAt ?? new Date().toISOString()
  }))

export const DefaultPersona: Persona = {
  id: 'chatgpt',
  role: 'system',
  name: 'ChatGPT',
  prompt: 'You are an AI assistant that helps people find information.'
}

export const DefaultPersonas: Persona[] = [DefaultPersona]

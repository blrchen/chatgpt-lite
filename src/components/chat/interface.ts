export interface ChatMessage {
  id: string
  createdAt: string
  content: string
  role: ChatRole
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

export interface Message {
  role: Role
  content: string
}

export type Role = 'assistant' | 'user'

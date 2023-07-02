declare type ChatRole = 'assistant' | 'user' | 'system'

declare interface ChatMessage {
  content: string
  role: ChatRole
}

declare interface Persona {
  id?: string
  role: ChatRole
  avatar?: string
  name?: string
  prompt?: string
  key?: string
  isDefault?: boolean
}

declare interface Chat {
  id: string
  persona?: Persona
  messages?: ChatMessage[]
}

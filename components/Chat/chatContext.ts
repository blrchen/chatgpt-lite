'use client'

import { createContext, MutableRefObject } from 'react'
import { Chat, ChatMessage, Persona } from './interface'

const ChatContext = createContext<{
  debug?: boolean
  personaPanelType: string
  DefaultPersonas: Persona[]
  currentChatRef?: MutableRefObject<Chat | undefined>
  chatList: Chat[]
  personas: Persona[]
  isOpenPersonaModal?: boolean
  editPersona?: Persona
  personaModalLoading?: boolean
  openPersonaPanel?: boolean
  toggleSidebar?: boolean
  onOpenPersonaModal?: () => void
  onClosePersonaModal?: () => void
  setCurrentChat?: (chat: Chat) => void
  onCreatePersona?: (persona: Persona) => void
  onDeleteChat?: (chat: Chat) => void
  onDeletePersona?: (persona: Persona) => void
  onEditPersona?: (persona: Persona) => void
  onCreateChat?: (persona: Persona) => void
  onChangeChat?: (chat: Chat) => void
  saveMessages?: (messages: ChatMessage[]) => void
  onOpenPersonaPanel?: (type?: string) => void
  onClosePersonaPanel?: () => void
  onToggleSidebar?: () => void
  forceUpdate?: () => void
}>({
  personaPanelType: 'chat',
  DefaultPersonas: [],
  chatList: [],
  personas: []
})

export default ChatContext

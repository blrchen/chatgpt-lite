'use client'

import { Suspense, useCallback, useContext } from 'react'
import {
  Chat,
  ChatContext,
  PersonaProvider,
  SideBar,
  useChatHook,
  type Persona
} from '@/components/chat'
import { useAppContext } from '@/contexts/app'

import PersonaModal from './persona-modal'
import PersonaPanel from './persona-panel'

const ChatProvider = () => {
  const provider = useChatHook()

  return (
    <ChatContext.Provider value={provider}>
      <PersonaProvider>
        <ChatExperience />
      </PersonaProvider>
    </ChatContext.Provider>
  )
}

const ChatExperience = () => {
  const { chatRef, onCreateChat } = useContext(ChatContext)
  const { closePersonaPanel } = useAppContext()

  const handleStartPersonaChat = useCallback(
    (persona: Persona) => {
      onCreateChat(persona)
      closePersonaPanel()
    },
    [closePersonaPanel, onCreateChat]
  )

  return (
    <>
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative flex flex-1 overflow-hidden">
          <SideBar />
          <div className="relative flex flex-1 flex-col overflow-hidden transition-all duration-300">
            <Chat ref={chatRef} />
            <PersonaPanel onStartChat={handleStartPersonaChat} />
          </div>
        </div>
      </div>
      <PersonaModal />
    </>
  )
}

const ChatPage = () => {
  return (
    <Suspense>
      <ChatProvider />
    </Suspense>
  )
}

export default ChatPage

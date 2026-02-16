'use client'

import { Suspense, useCallback, useContext } from 'react'
import Chat from '@/components/chat/chat'
import ChatContext from '@/components/chat/chatContext'
import type { Persona } from '@/components/chat/interface'
import { PersonaProvider } from '@/components/chat/personaContext'
import { SideBar } from '@/components/chat/sidebar'
import useChatHook from '@/components/chat/useChatHook'
import { Header } from '@/components/header/header'
import { useAppContext } from '@/contexts/app'

import PersonaModal from './persona-modal'
import PersonaPanel from './persona-panel'

function ChatProvider(): React.JSX.Element {
  const provider = useChatHook()

  return (
    <ChatContext.Provider value={provider}>
      <PersonaProvider>
        <ChatExperience />
      </PersonaProvider>
    </ChatContext.Provider>
  )
}

function ChatExperience(): React.JSX.Element {
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
      <div className="bg-background flex min-h-0 flex-1 overflow-hidden">
        <SideBar />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <Header />
          <Chat ref={chatRef} />
          <PersonaPanel onStartChat={handleStartPersonaChat} />
        </div>
      </div>
      <PersonaModal />
    </>
  )
}

export default function ChatPage(): React.JSX.Element {
  return (
    <Suspense>
      <ChatProvider />
    </Suspense>
  )
}

'use client'
import { Suspense } from 'react'
import { Chat, ChatContext, SideBar, useChatHook } from '@/components/chat'
import { Header } from '@/components/header'
import PersonaModal from './persona-modal'
import PersonaPanel from './persona-panel'

const ChatProvider = () => {
  const provider = useChatHook()

  return (
    <ChatContext.Provider value={provider}>
      <div className="h-full flex flex-col bg-background">
        <Header />
        <div className="relative flex-1 flex overflow-hidden">
          <SideBar />
          <div className="flex-1 relative transition-all duration-300">
            <Chat ref={provider.chatRef} />
            <PersonaPanel />
          </div>
        </div>
      </div>
      <PersonaModal />
    </ChatContext.Provider>
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

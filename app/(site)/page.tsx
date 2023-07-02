'use client'

import { useState } from 'react'

import Sidebar from '@/components/sidebar'
import Chat from '@/components/chat'
import MobileNav from '@/components/mobileNav'
import ChatContext from '@/contexts/chatContext'
import useChatHook from '@/hooks/useChatHook'
import PersonaModal from '@/components/personaModal'
import PromptPanel from '@/components/personaPanel'

export default function Home() {
  const provider = useChatHook()

  const [isComponentVisible, setIsComponentVisible] = useState(false)

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible)
  }

  return (
    <ChatContext.Provider value={provider}>
      <main className="overflow-hidden w-full h-screen relative flex">
        <MobileNav
          showMobileSiderbar={isComponentVisible}
          toggleComponentVisibility={toggleComponentVisibility}
        />

        <div className="dark hidden flex-shrink-0 bg-gray-900 md:flex md:w-[260px] md:flex-col">
          <Sidebar />
        </div>

        <div className="relative max-w-full flex-1 h-full">
          <Chat ref={provider.chatRef} />
          <PromptPanel />
        </div>
        <PersonaModal />
      </main>
    </ChatContext.Provider>
  )
}

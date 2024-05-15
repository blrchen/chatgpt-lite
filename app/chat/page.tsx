'use client'
import { Suspense, useState, useEffect } from 'react'
import { Flex } from '@radix-ui/themes'
import { Chat, ChatContext, ChatSideBar, useChatHook } from '@/components'
import PersonaModal from './PersonaModal'
import PersonaPanel from './PersonaPanel'

const ChatProvider = () => {
  const provider = useChatHook()

  return (
    <ChatContext.Provider value={provider}>
      <Flex style={{ height: 'calc(100% - 56px)' }} className="relative">
        <ChatSideBar />
        <div className="flex-1 relative">
          <Chat ref={provider.chatRef} />
          <PersonaPanel />
        </div>
      </Flex>
      <PersonaModal />
    </ChatContext.Provider>
  )
}

const ChatPage = () => {
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey') || ''
    if (storedApiKey) {
      setApiKey(storedApiKey)
    } else {
      const userApiKey = prompt('Veuillez entrer votre clé API :')
      if (userApiKey) {
        localStorage.setItem('apiKey', userApiKey)
        setApiKey(userApiKey)
      }
    }
  }, [])

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ChatProvider />
    </Suspense>
  )
}

export default ChatPage

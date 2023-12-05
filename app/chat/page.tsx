'use client'

import { Flex } from '@radix-ui/themes'
import { Chat, ChatSiderBar, PersonaPanel, ChatContext, useChatHook } from '@/components'

import PersonaModal from './PersonaModal'

const ChatPage = () => {
  const provider = useChatHook()

  return (
    <ChatContext.Provider value={provider}>
      <Flex style={{ height: 'calc(100% - 56px)' }} className="relative">
        <ChatSiderBar />
        <div className="flex-1 relative">
          <Chat ref={provider.chatRef} />
          <PersonaPanel />
        </div>
      </Flex>
      <PersonaModal />
    </ChatContext.Provider>
  )
}

export default ChatPage

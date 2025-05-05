// @ts-nocheck

'use client'
import { Suspense } from 'react'
import { Flex } from '@radix-ui/themes'
import { Chat, ChatContext, ChatSideBar, useChatHook } from '@/components'

const ChatProvider = () => {
  const provider = useChatHook()

  return (
    <ChatContext.Provider value={provider}>
      <Flex style={{ height: 'calc(100% - 56px)' }} className="relative">
        <ChatSideBar />
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Beta
            </span>
          </div>
          <Chat ref={provider.chatRef} />
        </div>
      </Flex>
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

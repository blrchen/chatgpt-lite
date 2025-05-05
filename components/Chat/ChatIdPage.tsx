'use client'
import { Flex } from '@radix-ui/themes'
import ChatIdConversation from './ChatIdConversation'
import { ChatSideBar } from './ChatSideBar'

export default function ChatIdPage({ chatId }: { chatId: string }) {
  return (
    <div className="h-[calc(100vh-56px)] flex">
      <ChatSideBar />
      <div className="flex-1 flex flex-col h-full" style={{ paddingTop: '76px', height: '100vh' }}>
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Beta
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatIdConversation chatId={chatId} hideActions={true} />
        </div>
      </div>
    </div>
  )
}

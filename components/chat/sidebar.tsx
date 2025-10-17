'use client'

import React, { useContext } from 'react'
import clsx from 'clsx'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BiMessageDetail } from 'react-icons/bi'
import { HiOutlinePlus } from 'react-icons/hi'
import { RiRobot2Line } from 'react-icons/ri'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import ChatContext from './chatContext'

export const SideBar = () => {
  const {
    currentChatRef,
    chatList,
    DefaultPersonas,
    toggleSidebar,
    onDeleteChat,
    onChangeChat,
    onCreateChat,
    onOpenPersonaPanel,
    onToggleSidebar
  } = useContext(ChatContext)

  // Function to close sidebar only on mobile
  const closeSidebarOnMobile = () => {
    // Check if we're on mobile (screen width < 768px)
    if (window.innerWidth < 768) {
      onToggleSidebar?.()
    }
  }
  return (
    <>
      {/* Mobile overlay - only show when sidebar is open on mobile */}
      {toggleSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onToggleSidebar}
        />
      )}
      {/* Sidebar - conditionally render on desktop, slide on mobile */}
      <div
        className={clsx(
          'h-full w-[260px] bg-background border-r border-border',
          // Mobile: fixed overlay with slide animation
          'fixed left-0 top-0 z-50 transition-transform duration-300 ease-out',
          // Mobile: slide in/out from left
          toggleSidebar ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static positioning, conditional rendering
          'md:static md:h-auto md:transition-none',
          // Desktop: hide completely when toggled off (like Gemini)
          toggleSidebar ? 'md:block' : 'md:hidden'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* New Chat Button */}
          <Button
            type="button"
            onClick={() => {
              onCreateChat?.(DefaultPersonas[0])
              closeSidebarOnMobile()
            }}
            className="mb-6 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-full py-2 px-4 flex items-center gap-2 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span className="font-medium">New chat</span>
          </Button>
          {/* Recent Section */}
          <div className="mb-4">
            <h3 className="text-muted-foreground text-sm font-medium mb-3">Recent</h3>
          </div>
          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {chatList.map((chat) => (
                <div
                  key={chat.id}
                  className={clsx(
                    'group relative rounded-lg px-3 py-2 cursor-pointer transition-colors hover:bg-accent',
                    {
                      'bg-accent': currentChatRef?.current?.id === chat.id
                    }
                  )}
                  onClick={() => {
                    onChangeChat?.(chat)
                    closeSidebarOnMobile()
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BiMessageDetail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-foreground text-sm">
                      {chat.persona?.name || 'New Chat'}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat?.(chat)
                    }}
                  >
                    <AiOutlineCloseCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          {/* Persona Store Button */}
          <div className="mt-auto pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenPersonaPanel?.('chat')}
              className="w-full justify-start rounded-lg"
            >
              <RiRobot2Line className="w-4 h-4 mr-2" />
              <span className="text-sm">Persona Store</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SideBar

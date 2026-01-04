'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppContext } from '@/contexts/app'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { Bot, MessageSquare, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import ChatContext from './chatContext'

export const SideBar = () => {
  const { toggleSidebar, onToggleSidebar, openPersonaPanel } = useAppContext()
  const {
    currentChatId,
    chatList,
    onDeleteChat,
    onChangeChat,
    onCreateDefaultChat,
    updateChatTitle
  } = useContext(ChatContext)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isHydrated = isDesktop !== undefined
  const sidebarState = toggleSidebar ? 'open' : 'closed'
  const dismissIfMobile = () => {
    if (isDesktop === false) {
      onToggleSidebar()
    }
  }
  const handleNewChat = () => {
    onCreateDefaultChat()
    dismissIfMobile()
  }
  const startRename = (chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId)
    setRenameValue(currentTitle)
  }
  const cancelRename = () => {
    setRenamingChatId(null)
    setRenameValue('')
  }
  const confirmRename = () => {
    if (renamingChatId && renameValue.trim()) {
      updateChatTitle(renamingChatId, renameValue.trim())
    }
    cancelRename()
  }
  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingChatId])

  return (
    <>
      {/* Mobile overlay - only show when sidebar is open on mobile (after hydration) */}
      {isHydrated && toggleSidebar && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-[color:var(--overlay)] backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={onToggleSidebar}
        />
      )}
      {/* Sidebar - conditionally render on desktop, slide on mobile */}
      <div
        data-state={sidebarState}
        className={cn(
          'bg-background text-foreground border-border fixed top-0 left-0 z-50 flex h-svh w-[260px] flex-col border-r transition-transform duration-300 ease-out data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0',
          'md:static md:h-full md:translate-x-0 md:transition-none md:data-[state=closed]:hidden'
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* New Chat Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleNewChat}
            className="group/btn !bg-secondary !text-secondary-foreground mb-6 rounded-full transition-transform active:scale-95"
          >
            <Plus className="size-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            <span className="font-medium">New chat</span>
          </Button>
          {/* Recent Section */}
          <div className="mb-1">
            <h3 className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wider uppercase">
              Recent
            </h3>
          </div>
          {/* Chat List - viewport override fixes Radix's display:table that breaks text truncation */}
          <ScrollArea className="flex-1 [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!min-w-0">
            <div className="space-y-0.5" role="listbox" aria-label="Recent chats">
              {chatList.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
                  <MessageSquare className="mb-2 size-8" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                chatList.map((chat) => {
                  const isActive = currentChatId === chat.id
                  const chatTitle = chat.title || chat.persona?.name || 'New Chat'

                  return (
                    <div
                      key={chat.id}
                      role="option"
                      tabIndex={0}
                      aria-selected={isActive}
                      aria-label={chatTitle}
                      className={cn(
                        'group focus-visible:ring-ring focus-visible:ring-offset-background relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-transparent px-3 py-2 text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground border-l-primary font-medium shadow-sm'
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5'
                      )}
                      onClick={() => {
                        onChangeChat(chat)
                        dismissIfMobile()
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onChangeChat(chat)
                          dismissIfMobile()
                        }
                      }}
                    >
                      {renamingChatId === chat.id ? (
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={confirmRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              confirmRename()
                            } else if (e.key === 'Escape') {
                              cancelRename()
                            }
                            e.stopPropagation()
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Rename chat"
                          className="ring-ring min-w-0 flex-1 truncate rounded bg-transparent px-1 text-sm font-medium ring-1 outline-none"
                        />
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                'min-w-0 flex-1 truncate text-sm font-medium',
                                isActive
                                  ? 'text-sidebar-primary-foreground'
                                  : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                              )}
                            >
                              {chatTitle}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[200px]">
                            <p className="break-words">{chatTitle}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              'size-6 flex-shrink-0 rounded-full !border-transparent transition-all duration-150 focus-visible:opacity-100',
                              'focus-visible:ring-sidebar-ring/50',
                              isActive
                                ? '!text-sidebar-primary-foreground hover:!bg-sidebar-primary-foreground/10 opacity-100'
                                : 'text-sidebar-foreground hover:bg-foreground/10 opacity-100 md:opacity-0 md:group-hover:opacity-100'
                            )}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Chat options"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              startRename(chat.id, chatTitle)
                            }}
                          >
                            <Pencil className="mr-2 size-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteChat(chat)
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
          {/* Persona Store Button */}
          <div className="border-border mt-auto border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                openPersonaPanel()
                dismissIfMobile()
              }}
              className="w-full justify-start rounded-lg"
            >
              <Bot className="mr-2 size-4" />
              <span className="text-sm">Persona Store</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SideBar

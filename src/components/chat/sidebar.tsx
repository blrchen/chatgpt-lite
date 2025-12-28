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
import { useAppContext } from '@/contexts/app'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { Bot, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

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
            className="!bg-secondary !text-secondary-foreground mb-6 rounded-full"
          >
            <Plus className="size-4" />
            <span className="font-medium">New chat</span>
          </Button>
          {/* Recent Section */}
          <div className="mb-2">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Recent</h3>
          </div>
          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1" role="listbox" aria-label="Recent chats">
              {chatList.map((chat) => {
                const isActive = currentChatId === chat.id

                return (
                  <div
                    key={chat.id}
                    role="option"
                    tabIndex={0}
                    aria-selected={isActive}
                    className={cn(
                      'group focus-visible:ring-ring focus-visible:ring-offset-background relative flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
                        className="ring-ring min-w-0 flex-1 truncate rounded bg-transparent px-1 text-sm font-medium ring-1 outline-none"
                      />
                    ) : (
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-sm font-medium',
                          isActive
                            ? 'text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                        )}
                      >
                        {chat.title || chat.persona?.name || 'New Chat'}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            'size-6 flex-shrink-0 rounded-full !border-transparent opacity-100 transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100',
                            'focus-visible:ring-sidebar-ring/50',
                            isActive
                              ? '!text-sidebar-primary-foreground hover:!bg-sidebar-primary-foreground/10 opacity-100'
                              : 'text-sidebar-foreground hover:bg-foreground/10'
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
                            startRename(chat.id, chat.title || chat.persona?.name || 'New Chat')
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
              })}
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

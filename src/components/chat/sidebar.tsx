'use client'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
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
import {
  Bot,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2
} from 'lucide-react'

import ChatContext from './chatContext'

export function SideBar(): React.JSX.Element {
  const { toggleSidebar, onToggleSidebar, openPersonaPanel } = useAppContext()
  const {
    currentChatId,
    chatList,
    onDeleteChat,
    onChangeChat,
    onCreateDefaultChat,
    updateChatTitle,
    updateChatPinned
  } = useContext(ChatContext)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isHydrated = isDesktop !== undefined
  const sidebarState = toggleSidebar ? 'open' : 'closed'

  const dismissIfMobile = useCallback(() => {
    if (isDesktop === false) {
      onToggleSidebar()
    }
  }, [isDesktop, onToggleSidebar])

  const handleNewChat = useCallback(() => {
    onCreateDefaultChat()
    dismissIfMobile()
  }, [onCreateDefaultChat, dismissIfMobile])

  const handleOpenPersonaLibrary = useCallback(() => {
    openPersonaPanel()
    dismissIfMobile()
  }, [openPersonaPanel, dismissIfMobile])

  const startRename = useCallback((chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId)
    setRenameValue(currentTitle)
  }, [])

  const cancelRename = useCallback(() => {
    setRenamingChatId(null)
    setRenameValue('')
  }, [])

  const confirmRename = useCallback(() => {
    if (renamingChatId) {
      const trimmedValue = renameValue.trim()
      if (trimmedValue) {
        updateChatTitle(renamingChatId, trimmedValue)
      }
    }
    cancelRename()
  }, [renamingChatId, renameValue, updateChatTitle, cancelRename])
  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingChatId])

  // Track previous isDesktop value to detect viewport transitions
  const prevIsDesktopRef = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    // Auto-close sidebar when transitioning from desktop to mobile
    if (prevIsDesktopRef.current === true && isDesktop === false && toggleSidebar) {
      onToggleSidebar()
    }
    prevIsDesktopRef.current = isDesktop
  }, [isDesktop, toggleSidebar, onToggleSidebar])

  const pinnedChats = useMemo(() => chatList.filter((chat) => chat.pinned), [chatList])
  const recentChats = useMemo(() => chatList.filter((chat) => !chat.pinned), [chatList])

  const renderChatItem = useCallback(
    (chat: (typeof chatList)[number]) => {
      const isActive = currentChatId === chat.id
      const chatTitle = chat.title || chat.persona?.name || 'New Chat'
      const isRenaming = renamingChatId === chat.id
      const isPinned = Boolean(chat.pinned)

      const selectChat = () => {
        onChangeChat(chat)
        dismissIfMobile()
      }

      return (
        <div
          key={chat.id}
          role="option"
          tabIndex={0}
          aria-selected={isActive}
          aria-label={chatTitle}
          className={cn(
            'group focus-visible:ring-ring focus-visible:ring-offset-background relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-[transform,background-color,border-color] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]',
            isActive
              ? 'bg-primary/10 border-primary/20 border shadow-sm'
              : 'hover:bg-sidebar-accent/80 border border-transparent'
          )}
          onClick={selectChat}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              selectChat()
            }
          }}
        >
          {isRenaming ? (
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
              className="ring-ring focus-visible:ring-ring/60 focus-visible:ring-offset-background min-w-0 flex-1 truncate rounded bg-transparent px-1 text-sm font-medium ring-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'block min-w-0 flex-1 truncate text-sm font-medium',
                    isActive ? 'text-foreground' : 'text-sidebar-foreground'
                  )}
                >
                  {chatTitle}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[300px]">
                <p className="text-pretty break-words">{chatTitle}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {!isRenaming && isPinned && (
            <Pin className="text-primary/50 size-3 flex-shrink-0" aria-hidden="true" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  'size-11 flex-shrink-0 rounded-full !border-transparent transition-[opacity,background-color] duration-150 focus-visible:opacity-100 md:size-6',
                  'focus-visible:ring-sidebar-ring/50',
                  isActive
                    ? 'text-accent-foreground hover:bg-accent-foreground/10 opacity-100'
                    : 'text-sidebar-foreground hover:bg-foreground/10 opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100'
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
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  updateChatPinned(chat.id, !isPinned)
                }}
              >
                {isPinned ? <PinOff className="mr-2 size-4" /> : <Pin className="mr-2 size-4" />}
                {isPinned ? 'Unpin' : 'Pin'}
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
    },
    [
      cancelRename,
      confirmRename,
      currentChatId,
      dismissIfMobile,
      onChangeChat,
      onDeleteChat,
      renameValue,
      renamingChatId,
      startRename,
      updateChatPinned
    ]
  )

  const showMobileOverlay = isHydrated && toggleSidebar && !isDesktop

  return (
    <>
      {/* Mobile overlay - only show when sidebar is open on mobile (after hydration) */}
      {showMobileOverlay && (
        <div
          className="bg-overlay fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={onToggleSidebar}
        />
      )}
      {/* Sidebar - conditionally render on desktop, slide on mobile */}
      <div
        data-state={sidebarState}
        className={cn(
          'bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 left-0 z-50 flex h-svh w-[260px] flex-col border-r transition-transform duration-200 ease-out data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 motion-reduce:transition-none',
          'md:static md:h-full md:translate-x-0 md:transition-none md:data-[state=closed]:hidden'
        )}
      >
        <div className="flex h-full flex-col px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Sidebar header with logo and toggle */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="group focus-visible:ring-ring/50 focus-visible:ring-offset-background flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span
                className="text-primary/50 group-hover:text-primary/70 font-serif text-lg transition-colors duration-200"
                aria-hidden="true"
              >
                ✦
              </span>
              <span className="text-foreground group-hover:text-primary font-display text-lg font-medium tracking-tight transition-colors duration-200">
                ChatGPT Lite
              </span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-muted-foreground hover:text-foreground hover:bg-primary/5 size-11 rounded-lg transition-colors duration-200 md:size-9"
              title="Close Sidebar"
              aria-label="Close Sidebar"
            >
              <PanelLeft className="size-5" />
            </Button>
          </div>
          {/* New chat button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleNewChat}
            className="text-foreground border-border/60 hover:bg-primary/5 hover:border-primary/30 mb-4 justify-start rounded-lg"
          >
            <Plus className="size-4 shrink-0" />
            <span className="font-medium">New chat</span>
          </Button>
          {/* Chat List - viewport override fixes Radix's display:table that breaks text truncation */}
          <ScrollArea className="flex-1 [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!min-w-0">
            <div className="space-y-0.5" role="listbox" aria-label="Chats">
              {chatList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="border-border/40 bg-muted/50 relative mb-5 rounded-2xl border p-5 shadow-sm">
                    <span
                      className="text-primary/20 absolute -top-1.5 -right-1.5 font-serif text-sm"
                      aria-hidden="true"
                    >
                      ✦
                    </span>
                    <MessageSquare className="text-muted-foreground size-7" />
                  </div>
                  <p className="text-muted-foreground font-serif text-sm text-pretty italic">
                    No conversations yet
                  </p>
                  <p className="text-muted-foreground mt-1.5 text-xs tracking-wide text-pretty">
                    Start one above
                  </p>
                </div>
              ) : (
                <>
                  {pinnedChats.length > 0 && (
                    <div role="presentation" aria-hidden="true" className="mb-3">
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <Pin className="text-primary/50 size-3" aria-hidden="true" />
                        <h3 className="text-muted-foreground text-xs font-semibold text-balance">
                          Pinned
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">{pinnedChats.map(renderChatItem)}</div>

                  {recentChats.length > 0 && (
                    <div role="presentation" aria-hidden="true" className="mt-5 mb-3">
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <h3 className="text-muted-foreground text-xs font-semibold text-balance">
                          Recent
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">{recentChats.map(renderChatItem)}</div>
                </>
              )}
            </div>
          </ScrollArea>
          {/* Persona Store Button */}
          <div className="mt-auto pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleOpenPersonaLibrary}
              className="group hover:bg-primary/5 relative w-full justify-start overflow-hidden rounded-xl transition-colors duration-200 hover:shadow-sm"
            >
              <span className="bg-primary/5 pointer-events-none absolute inset-0 translate-y-full transition-transform duration-200 ease-out group-hover:translate-y-0" />
              <Bot className="text-primary/60 group-hover:text-primary relative mr-2.5 size-4 transition-colors duration-200" />
              <span className="relative text-sm font-medium">Persona Library</span>
              <span
                className="text-primary/30 group-hover:text-primary/50 relative ml-auto font-serif text-xs transition-colors duration-200"
                aria-hidden="true"
              >
                ✦
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

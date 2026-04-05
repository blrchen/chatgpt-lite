'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { AppButton, AppIconButton } from '@/components/common/app-button'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Bot, PanelLeftClose, Plus } from 'lucide-react'

import { SidebarChatGroups } from './sidebar-chat-groups'
import { SidebarRenameDialog } from './sidebar-rename-dialog'
import { useSidebarChats } from './use-sidebar-chats'

function preloadPersonaPanel(): void {
  if (typeof window !== 'undefined') {
    void import('@/app/chat/persona-panel')
  }
}

export function SideBar(): React.JSX.Element {
  const { isMobile, setOpenMobile, toggleSidebar } = useSidebar()

  const closeMobile = useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])

  const {
    currentChatId,
    isChatHydrated,
    chatList,
    pinnedChats,
    recentChats,
    renamingChatId,
    renameValue,
    trimmedRenameValue,
    isDeleteConfirmOpen,
    handleNewChat,
    handleOpenPersonaLibrary,
    handleSelectChat,
    startRename,
    setRenameValue,
    cancelRename,
    confirmRename,
    handleTogglePin,
    handleDeleteChat,
    handleDeleteConfirmOpenChange,
    confirmDeleteChat
  } = useSidebarChats({ closeMobile })

  return (
    <>
      <Sidebar side="left" collapsible="offcanvas">
        <SidebarHeader className="px-2 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Link
              href="/chat"
              className="group focus-visible:ring-ring/50 focus-visible:ring-offset-background flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span
                className="text-primary/70 group-hover:text-primary font-serif text-lg transition-colors duration-200"
                aria-hidden="true"
              >
                ✦
              </span>
              <span className="text-foreground group-hover:text-primary font-display text-lg font-medium tracking-tight transition-colors duration-200">
                ChatGPT Lite
              </span>
            </Link>
            <ButtonWithTooltip label="Close sidebar" placement="bottom">
              <AppIconButton
                type="button"
                variant="ghost"
                onClick={toggleSidebar}
                className="hover:bg-primary/5 rounded-lg transition-colors duration-200"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="size-4" aria-hidden="true" />
              </AppIconButton>
            </ButtonWithTooltip>
          </div>
          <AppButton
            type="button"
            variant="outline"
            onClick={handleNewChat}
            className="text-foreground border-border/60 hover:bg-primary/5 hover:border-primary/30 justify-start rounded-lg"
          >
            <Plus className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">New chat</span>
          </AppButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarChatGroups
            isChatHydrated={isChatHydrated}
            chatListLength={chatList.length}
            currentChatId={currentChatId}
            pinnedChats={pinnedChats}
            recentChats={recentChats}
            onSelectChat={handleSelectChat}
            onStartRename={startRename}
            onTogglePin={handleTogglePin}
            onDeleteChat={handleDeleteChat}
          />
        </SidebarContent>
        <SidebarFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleOpenPersonaLibrary}
                onMouseEnter={preloadPersonaPanel}
                onFocus={preloadPersonaPanel}
                className="h-11 md:h-9"
              >
                <Bot className="text-primary/70 size-4" aria-hidden="true" />
                <span>Persona Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRenameDialog
        open={renamingChatId !== null}
        renameValue={renameValue}
        trimmedRenameValue={trimmedRenameValue}
        onRenameValueChange={setRenameValue}
        onCancel={cancelRename}
        onConfirm={confirmRename}
      />
      <ConfirmActionDialog
        open={isDeleteConfirmOpen}
        onOpenChange={handleDeleteConfirmOpenChange}
        title="Delete this chat?"
        description="This removes its messages and cannot be undone."
        confirmLabel="Delete chat"
        confirmVariant="destructive"
        onConfirm={confirmDeleteChat}
      />
    </>
  )
}

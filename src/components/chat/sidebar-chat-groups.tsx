import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from '@/components/ui/sidebar'
import { MessageSquare, Pin } from 'lucide-react'

import { SidebarChatItem } from './sidebar-chat-item'
import type { SidebarChatListItem } from './use-sidebar-chats'

type SidebarChatGroupsProps = {
  isChatHydrated: boolean
  chatListLength: number
  currentChatId: string | undefined
  pinnedChats: SidebarChatListItem[]
  recentChats: SidebarChatListItem[]
  onSelectChat: (chat: SidebarChatListItem) => void
  onStartRename: (chatId: string, currentTitle: string) => void
  onTogglePin: (chatId: string, nextPinned: boolean) => void
  onDeleteChat: (chat: SidebarChatListItem) => void
}

export function SidebarChatGroups({
  isChatHydrated,
  chatListLength,
  currentChatId,
  pinnedChats,
  recentChats,
  onSelectChat,
  onStartRename,
  onTogglePin,
  onDeleteChat
}: SidebarChatGroupsProps): React.JSX.Element {
  if (chatListLength === 0 && isChatHydrated) {
    return (
      <Empty className="items-start gap-4 border-0 px-2 py-12 text-left">
        <EmptyHeader className="items-start text-left">
          <EmptyMedia
            variant="icon"
            className="border-border/40 relative mb-0 size-16 rounded-2xl border shadow-sm [&_svg:not([class*='size-'])]:size-7"
          >
            <span
              className="text-primary/20 absolute -top-1.5 -right-1.5 font-serif text-sm"
              aria-hidden="true"
            >
              ✦
            </span>
            <MessageSquare className="text-muted-foreground size-7" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-muted-foreground text-sm font-normal text-pretty">
            No conversations yet
          </EmptyTitle>
          <EmptyDescription className="text-muted-foreground text-xs tracking-wide text-pretty">
            Start one above
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      {pinnedChats.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>
            <Pin className="text-primary/70 mr-1 size-3" aria-hidden="true" />
            Pinned
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pinnedChats.map((chat) => (
                <SidebarChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={currentChatId === chat.id}
                  onSelect={onSelectChat}
                  onStartRename={onStartRename}
                  onTogglePin={onTogglePin}
                  onDelete={onDeleteChat}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {recentChats.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentChats.map((chat) => (
                <SidebarChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={currentChatId === chat.id}
                  onSelect={onSelectChat}
                  onStartRename={onStartRename}
                  onTogglePin={onTogglePin}
                  onDelete={onDeleteChat}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  )
}

import { memo, useCallback } from 'react'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { resolveChatTitle } from '@/lib/chat-utils'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react'

import type { SidebarChatListItem } from './use-sidebar-chats'

type SidebarChatItemProps = {
  chat: SidebarChatListItem
  isActive: boolean
  onSelect: (chat: SidebarChatListItem) => void
  onStartRename: (chatId: string, currentTitle: string) => void
  onTogglePin: (chatId: string, nextPinned: boolean) => void
  onDelete: (chat: SidebarChatListItem) => void
}

export const SidebarChatItem = memo(function SidebarChatItem({
  chat,
  isActive,
  onSelect,
  onStartRename,
  onTogglePin,
  onDelete
}: SidebarChatItemProps): React.JSX.Element {
  const chatTitle = resolveChatTitle(chat)
  const isPinned = chat.pinned === true

  const handleSelect = useCallback(() => {
    onSelect(chat)
  }, [chat, onSelect])

  const handleRenameMenuClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      onStartRename(chat.id, chatTitle)
    },
    [chat.id, chatTitle, onStartRename]
  )

  const handlePinMenuClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      onTogglePin(chat.id, !isPinned)
    },
    [chat.id, isPinned, onTogglePin]
  )

  const handleDeleteMenuClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      onDelete(chat)
    },
    [chat, onDelete]
  )

  return (
    <SidebarMenuItem className="[contain-intrinsic-size:auto_44px] [content-visibility:auto]">
      <ButtonWithTooltip
        placement="right"
        label={<p className="text-pretty break-words">{chatTitle}</p>}
      >
        <SidebarMenuButton
          isActive={isActive}
          onClick={handleSelect}
          className={cn('h-11 pr-10 md:h-9', !isActive && 'hover:bg-sidebar-accent/50')}
        >
          <span className="truncate">{chatTitle}</span>
        </SidebarMenuButton>
      </ButtonWithTooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            showOnHover
            className="!top-0 !right-0 !size-11 rounded-lg md:!size-9"
            aria-label="Chat options"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={handleRenameMenuClick}>
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Rename...
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handlePinMenuClick}>
              {isPinned ? (
                <PinOff className="mr-2 size-4" aria-hidden="true" />
              ) : (
                <Pin className="mr-2 size-4" aria-hidden="true" />
              )}
              {isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleDeleteMenuClick}
            >
              <Trash2 className="mr-2 size-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
})

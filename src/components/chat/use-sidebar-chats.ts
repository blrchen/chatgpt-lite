import { useCallback, useMemo, useState } from 'react'
import {
  selectChatList,
  selectCurrentChatId,
  selectIsChatHydrated,
  selectOnChangeChat,
  selectOnDeleteChat,
  selectOpenOrCreateDefaultChat,
  selectUpdateChatPinned,
  selectUpdateChatTitle,
  useChatStore
} from '@/store/chat-store'
import {
  selectClosePersonaPanel,
  selectOpenPersonaPanel,
  usePersonaUiStore
} from '@/store/persona-ui-store'

export type SidebarChatListItem = ReturnType<typeof selectChatList>[number]

type UseSidebarChatsArgs = {
  closeMobile: () => void
}

function splitChatsByPin(chatList: SidebarChatListItem[]): {
  pinnedChats: SidebarChatListItem[]
  recentChats: SidebarChatListItem[]
} {
  const pinnedChats: SidebarChatListItem[] = []
  const recentChats: SidebarChatListItem[] = []

  for (const chat of chatList) {
    if (chat.pinned) {
      pinnedChats.push(chat)
      continue
    }

    recentChats.push(chat)
  }

  return { pinnedChats, recentChats }
}

export function useSidebarChats({ closeMobile }: UseSidebarChatsArgs): {
  currentChatId: string | undefined
  isChatHydrated: boolean
  chatList: SidebarChatListItem[]
  pinnedChats: SidebarChatListItem[]
  recentChats: SidebarChatListItem[]
  renamingChatId: string | null
  renameValue: string
  trimmedRenameValue: string
  isDeleteConfirmOpen: boolean
  handleNewChat: () => void
  handleOpenPersonaLibrary: () => void
  handleSelectChat: (chat: SidebarChatListItem) => void
  startRename: (chatId: string, currentTitle: string) => void
  setRenameValue: (value: string) => void
  cancelRename: () => void
  confirmRename: () => void
  handleTogglePin: (chatId: string, nextPinned: boolean) => void
  handleDeleteChat: (chat: SidebarChatListItem) => void
  handleDeleteConfirmOpenChange: (open: boolean) => void
  confirmDeleteChat: () => void
} {
  const openPersonaPanel = usePersonaUiStore(selectOpenPersonaPanel)
  const closePersonaPanel = usePersonaUiStore(selectClosePersonaPanel)
  const currentChatId = useChatStore(selectCurrentChatId)
  const isChatHydrated = useChatStore(selectIsChatHydrated)
  const chatList = useChatStore(selectChatList)
  const onDeleteChat = useChatStore(selectOnDeleteChat)
  const onChangeChat = useChatStore(selectOnChangeChat)
  const openOrCreateDefaultChat = useChatStore(selectOpenOrCreateDefaultChat)
  const updateChatTitle = useChatStore(selectUpdateChatTitle)
  const updateChatPinned = useChatStore(selectUpdateChatPinned)

  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [chatPendingDelete, setChatPendingDelete] = useState<SidebarChatListItem | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const trimmedRenameValue = renameValue.trim()

  const handleNewChat = useCallback(() => {
    openOrCreateDefaultChat()
    closePersonaPanel()
    closeMobile()
  }, [closePersonaPanel, closeMobile, openOrCreateDefaultChat])

  const handleOpenPersonaLibrary = useCallback(() => {
    openPersonaPanel()
    closeMobile()
  }, [openPersonaPanel, closeMobile])

  const startRename = useCallback((chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId)
    setRenameValue(currentTitle)
  }, [])

  const cancelRename = useCallback(() => {
    setRenamingChatId(null)
    setRenameValue('')
  }, [])

  const confirmRename = useCallback(() => {
    if (renamingChatId && trimmedRenameValue) {
      updateChatTitle(renamingChatId, trimmedRenameValue)
    }
    cancelRename()
  }, [cancelRename, renamingChatId, trimmedRenameValue, updateChatTitle])

  const handleDeleteChat = useCallback((chat: SidebarChatListItem): void => {
    setChatPendingDelete(chat)
  }, [])

  const handleSelectChat = useCallback(
    (chat: SidebarChatListItem): void => {
      onChangeChat(chat)
      closePersonaPanel()
      closeMobile()
    },
    [closeMobile, closePersonaPanel, onChangeChat]
  )

  const confirmDeleteChat = useCallback((): void => {
    if (!chatPendingDelete) {
      return
    }

    onDeleteChat(chatPendingDelete)
    setChatPendingDelete(null)
  }, [chatPendingDelete, onDeleteChat])

  const handleDeleteConfirmOpenChange = useCallback((open: boolean): void => {
    if (!open) {
      setChatPendingDelete(null)
    }
  }, [])

  const { pinnedChats, recentChats } = useMemo(() => splitChatsByPin(chatList), [chatList])

  return {
    currentChatId,
    isChatHydrated,
    chatList,
    pinnedChats,
    recentChats,
    renamingChatId,
    renameValue,
    trimmedRenameValue,
    isDeleteConfirmOpen: chatPendingDelete !== null,
    handleNewChat,
    handleOpenPersonaLibrary,
    handleSelectChat,
    startRename,
    setRenameValue,
    cancelRename,
    confirmRename,
    handleTogglePin: updateChatPinned,
    handleDeleteChat,
    handleDeleteConfirmOpenChange,
    confirmDeleteChat
  }
}

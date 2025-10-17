'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { ChatGPInstance } from './chat'
import { Chat, ChatMessage, Persona } from './interface'
import { DefaultPersonas } from './utils'

enum StorageKeys {
  Chat_List = 'chatList',
  Chat_Current_ID = 'chatCurrentID',
  Sidebar_Toggle = 'sidebarToggle'
}

let isInit = false

const useChatHook = () => {
  const [_, forceUpdate] = useReducer((x: number) => x + 1, 0)
  const messagesMap = useRef<Map<string, ChatMessage[]>>(new Map<string, ChatMessage[]>())
  const chatRef = useRef<ChatGPInstance>(null)
  const currentChatRef = useRef<Chat | undefined>(undefined)
  const [chatList, setChatList] = useState<Chat[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [editPersona, setEditPersona] = useState<Persona | undefined>()
  const [isOpenPersonaModal, setIsOpenPersonaModal] = useState<boolean>(false)
  const [openPersonaPanel, setOpenPersonaPanel] = useState<boolean>(false)
  const [toggleSidebar, setToggleSidebar] = useState<boolean>(() => {
    // Initialize from localStorage, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(StorageKeys.Sidebar_Toggle)
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })

  const onOpenPersonaPanel = () => {
    setOpenPersonaPanel(true)
    // Close sidebar on mobile when opening persona panel
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setToggleSidebar(false)
    }
  }

  const onClosePersonaPanel = useCallback(() => {
    setOpenPersonaPanel(false)
  }, [setOpenPersonaPanel])

  const onOpenPersonaModal = () => {
    setIsOpenPersonaModal(true)
  }

  const onClosePersonaModal = () => {
    setEditPersona(undefined)
    setIsOpenPersonaModal(false)
  }

  const onChangeChat = useCallback((chat: Chat) => {
    const oldMessages = chatRef.current?.getConversation() || []
    const newMessages = messagesMap.current.get(chat.id) || []
    chatRef.current?.setConversation(newMessages)
    chatRef.current?.focus()
    if (currentChatRef.current?.id) {
      messagesMap.current.set(currentChatRef.current?.id, oldMessages)
    }
    currentChatRef.current = chat
    forceUpdate()
  }, [])

  const onCreateChat = useCallback(
    (persona: Persona) => {
      const id = uuid()
      const newChat: Chat = {
        id,
        persona: persona
      }
      setChatList((state) => [...state, newChat])
      onChangeChat(newChat)
      onClosePersonaPanel()
    },
    [setChatList, onChangeChat, onClosePersonaPanel]
  )

  const onToggleSidebar = useCallback(() => {
    setToggleSidebar((state) => {
      const newState = !state
      localStorage.setItem(StorageKeys.Sidebar_Toggle, JSON.stringify(newState))
      return newState
    })
  }, [])

  const onDeleteChat = useCallback(
    (chat: Chat) => {
      setChatList((prevList) => {
        const newList = prevList.filter((item) => item.id !== chat.id)
        localStorage.removeItem(`ms_${chat.id}`)
        messagesMap.current.delete(chat.id)
        if (currentChatRef.current?.id === chat.id) {
          if (newList.length > 0) {
            currentChatRef.current = newList[0]
            const newMessages = messagesMap.current.get(newList[0].id) || []
            chatRef.current?.setConversation(newMessages)
            chatRef.current?.focus()
          } else {
            currentChatRef.current = undefined
            onOpenPersonaPanel()
          }
        }
        return newList
      })
    },
    [onOpenPersonaPanel]
  )

  const onCreateOrUpdatePersona = (values: Persona) => {
    console.log('onCreateOrUpdatePersona', values)
    const { name, prompt } = values
    if (editPersona) {
      setPersonas((state) =>
        state.map((item) => (item.id === editPersona.id ? { ...item, name, prompt } : item))
      )
    } else {
      // Create new persona
      const persona: Persona = {
        id: uuid(),
        role: 'system',
        name,
        prompt,
        key: ''
      }
      setPersonas((state) => [...state, persona])
    }
    onClosePersonaModal()
  }

  const onEditPersona = (persona: Persona) => {
    setEditPersona(persona)
    onOpenPersonaModal()
  }

  const onDeletePersona = (persona: Persona) => {
    setPersonas((state) => state.filter((item) => item.id !== persona.id))
  }

  const saveMessages = (messages: ChatMessage[]) => {
    if (messages.length > 0) {
      localStorage.setItem(`ms_${currentChatRef.current?.id}`, JSON.stringify(messages))
    } else {
      localStorage.removeItem(`ms_${currentChatRef.current?.id}`)
    }
  }

  useEffect(() => {
    const chatList = (JSON.parse(localStorage.getItem(StorageKeys.Chat_List) || '[]') ||
      []) as Chat[]
    const currentChatId = localStorage.getItem(StorageKeys.Chat_Current_ID)
    if (chatList.length > 0) {
      const currentChat = chatList.find((chat) => chat.id === currentChatId)
      setChatList(chatList)

      chatList.forEach((chat) => {
        const messages = JSON.parse(localStorage.getItem(`ms_${chat?.id}`) || '[]') as ChatMessage[]
        messagesMap.current.set(chat.id!, messages)
      })

      onChangeChat(currentChat || chatList[0])
    } else {
      onCreateChat(DefaultPersonas[0])
    }

    return () => {
      document.body.removeAttribute('style')
      localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
    }
  }, [])

  useEffect(() => {
    if (currentChatRef.current?.id) {
      localStorage.setItem(StorageKeys.Chat_Current_ID, currentChatRef.current.id)
    }
  }, [chatList, currentChatRef.current?.id])

  useEffect(() => {
    localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
  }, [chatList])

  useEffect(() => {
    const loadedPersonas = JSON.parse(localStorage.getItem('Personas') || '[]') as Persona[]
    const updatedPersonas = loadedPersonas.map((persona) => {
      if (!persona.id) {
        persona.id = uuid()
      }
      return persona
    })
    setPersonas(updatedPersonas)
  }, [])

  useEffect(() => {
    localStorage.setItem('Personas', JSON.stringify(personas))
  }, [personas])

  useEffect(() => {
    if (isInit && !openPersonaPanel && chatList.length === 0) {
      onCreateChat(DefaultPersonas[0])
    }
    isInit = true
  }, [chatList, openPersonaPanel, onCreateChat])

  return {
    DefaultPersonas,
    chatRef,
    currentChatRef,
    chatList,
    personas,
    editPersona,
    isOpenPersonaModal,
    openPersonaPanel,
    toggleSidebar,
    onOpenPersonaModal,
    onClosePersonaModal,
    onCreateChat,
    onDeleteChat,
    onChangeChat,
    onCreateOrUpdatePersona,
    onDeletePersona,
    onEditPersona,
    saveMessages,
    onOpenPersonaPanel,
    onClosePersonaPanel,
    onToggleSidebar,
    forceUpdate
  }
}

export default useChatHook

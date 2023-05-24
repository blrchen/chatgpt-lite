import React, { useEffect, useRef, useState } from 'react'
import { Divider, Drawer, Select, Space, Typography } from 'antd'

import ChatGPT from '@/components/ChatGPT'
import { ChatGPInstance, ChatGPTVersion, ChatMessage } from '@/components/ChatGPT/interface'

import ChatSidebar, { DefaultPersona } from './components/ChatSidebar'
import { Chat, Persona } from './components/ChatSidebar/interface'

import styles from './index.module.less'
import { MenuOutlined } from '@ant-design/icons'

const { Text, Link } = Typography

const enum StorageKeys {
  Chat_GPT_Version = 'chatGPTVersion',
  Chat_List = 'chatList',
  Chat_Current_ID = 'chatCurrentID'
}

const Chat = () => {
  const chatRef = useRef<ChatGPInstance>(null)
  const messagesMap = useRef<Map<string, ChatMessage[]>>(new Map<string, ChatMessage[]>())

  const [isActive, setIsActive] = useState(false)
  const [chatList, setChatList] = useState<Chat[]>([])
  const [prompts, setPrompts] = useState<ChatMessage[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>()
  const [chatGPTVersion, setChatGPTVersion] = useState<ChatGPTVersion>(ChatGPTVersion.GPT_35_turbo)
  const [open, setOpen] = useState(false)

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  const saveMessages = () => {
    if (currentChat) {
      messagesMap.current.set(currentChat.id, chatRef.current?.getMessages() || [])
    }
  }

  const onNewChat = (persona: Persona) => {
    const id = `chat_id_${Date.now()}`
    const messages: ChatMessage[] = []
    const newChat: Chat = {
      id,
      persona: persona
    }
    messagesMap.current.set(id, messages)
    chatRef.current?.setMessages(messages)
    setIsActive(false)
    saveMessages()
    setPrompts([{ content: persona.prompt || '', role: persona.role! }])
    setCurrentChat(newChat)
    setChatList((state) => {
      return [...state, newChat]
    })
  }

  const onCloseChat = (chat: Chat) => {
    const index = chatList.findIndex((item) => item.id === chat.id)
    messagesMap.current.delete(chat.id!)
    chatList.splice(index, 1)
    setChatList([...chatList])
    if (chatList.length && chat.id === currentChat?.id) {
      onChangeChat(chatList[0])
    }
  }

  const onChangeChat = (chat?: Chat) => {
    setIsActive(false)
    saveMessages()
    if (chat) {
      setPrompts([{ content: chat.persona?.prompt || '', role: chat.persona?.role! }])
      setCurrentChat(chat)
      const messages = messagesMap.current.get(chat.id!)
      chatRef.current?.setMessages(messages || [])
    }
  }

  const onChangeVersion = (version: ChatGPTVersion) => {
    setChatGPTVersion(version)
  }

  const onToggleSideBar = () => {
    setIsActive((state) => {
      return !state
    })
  }

  useEffect(() => {
    const version = localStorage.getItem(StorageKeys.Chat_GPT_Version) as ChatGPTVersion
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
      onNewChat(DefaultPersona[0])
    }

    setChatGPTVersion(version || ChatGPTVersion.GPT_35_turbo)
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.removeAttribute('style')
      localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
    }
  }, [])

  const onMessages = (messages: ChatMessage[]) => {
    if (messages.length > 0) {
      localStorage.setItem(`ms_${currentChat?.id}`, JSON.stringify(messages))
    } else {
      localStorage.removeItem(`ms_${currentChat?.id}`)
    }
  }

  useEffect(() => {
    localStorage.setItem(StorageKeys.Chat_GPT_Version, chatGPTVersion)
  }, [chatGPTVersion])

  useEffect(() => {
    localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
  }, [chatList])

  useEffect(() => {
    if (currentChat) {
      localStorage.setItem(StorageKeys.Chat_Current_ID, currentChat?.id)
    }
  }, [currentChat])

  return (
    <>
      <div className={styles.chatWrapper}>
        <ChatSidebar
          isActive={isActive}
          chatList={chatList}
          currentChatId={currentChat?.id}
          onNewChat={onNewChat}
          onCloseChat={onCloseChat}
          onChangeChat={onChangeChat}
        />
        <ChatGPT
          header={
            <div className={styles.chatHeader}>
              {currentChat?.persona?.name}
              <Link className={styles.menu} onClick={onToggleSideBar}>
                <MenuOutlined />
              </Link>
            </div>
          }
          ref={chatRef}
          fetchPath="/api/chat-completion"
          prompts={prompts}
          config={{ model: chatGPTVersion, stream: true }}
          onMessages={onMessages}
          onChangeVersion={onChangeVersion}
          onSettings={showDrawer}
        />
      </div>
      <Drawer
        title="Chat Settings"
        placement="right"
        closable={true}
        onClose={onClose}
        open={open}
        getContainer={false}
        style={{ position: 'absolute' }}
      >
        <Space size="middle">
          <Text> Chat GPT Version</Text>
          <Select
            style={{ width: 200 }}
            onChange={onChangeVersion}
            value={chatGPTVersion}
            options={Object.values(ChatGPTVersion).map((value) => ({
              value: value,
              label: value
            }))}
          />
        </Space>
        <Divider />
      </Drawer>
    </>
  )
}

export default Chat

'use client'

import React, { useContext } from 'react'
import { Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import cs from 'classnames'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { SiOpenai } from 'react-icons/si'
import ChatContext from './chatContext'

import './index.scss'

export const ChatSiderBar = () => {
  const {
    currentChat,
    chatList,
    DefaultPersonas,
    toggleSidebar,
    onDeleteChat,
    onChangeChat,
    onCreateChat,
    onOpenPersonaPanel
  } = useContext(ChatContext)

  return (
    <Flex direction="column" className={cs('chart-sider-bar', { show: toggleSidebar })}>
      <Flex className="p-2 h-full overflow-hidden w-64" direction="column" gap="3">
        <Box
          width="auto"
          onClick={() => onCreateChat?.(DefaultPersonas[0])}
          className="bg-token-surface-primary active:scale-95 "
        >
          <SiOpenai className="h-5 w-5" />
          <Text>New Chat</Text>
        </Box>
        <ScrollArea className="flex-1" type="auto" scrollbars="vertical">
          <Flex direction="column" gap="3">
            {chatList.map((chat) => (
              <Box
                key={chat.id}
                width="auto"
                className={cs('bg-token-surface active:scale-95 truncate', {
                  active: currentChat?.id === chat.id
                })}
                onClick={() => onChangeChat?.(chat)}
              >
                <Text as="p" className="truncate">
                  {chat.persona?.name}
                </Text>
                <IconButton
                  size="2"
                  variant="ghost"
                  color="gray"
                  radius="full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat?.(chat)
                  }}
                >
                  <AiOutlineCloseCircle className="h-4 w-4" />
                </IconButton>
              </Box>
            ))}
          </Flex>
        </ScrollArea>
        <Box
          width="auto"
          onClick={() => onOpenPersonaPanel?.('chat')}
          className="bg-token-surface-primary active:scale-95 "
        >
          <Text>Persona Store</Text>
        </Box>
      </Flex>
    </Flex>
  )
}

export default ChatSiderBar

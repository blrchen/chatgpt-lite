'use client'

import React, { useContext } from 'react'
import { Avatar, Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import cs from 'classnames'
import Image from 'next/image'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BiMessageDetail } from 'react-icons/bi'
import { FaPlus } from 'react-icons/fa6'
import { FiPlus } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'
import ChatContext from './chatContext'
import { DeleteChatAlert } from './DeleteChatAlert'

import './index.scss'

export const PersonaIcons = () => (
  <div className="personaIcons">
    <Image
      src="/bot-icon.png"
      alt="TurboChat"
      width={19}
      height={19}
      className="rounded-full icon"
    />
    <Image
      src="/persona/image-generator.png"
      alt="TurboChat"
      width={19}
      height={19}
      className="rounded-full icon"
    />
    <Image
      src="/persona/youtube-scenarist.png"
      alt="TurboChat"
      width={19}
      height={19}
      className="rounded-full icon"
    />
    <Avatar
        fallback={<FaPlus className="size-3" />}
        color={undefined}
        size="1"
        radius="full"
        className="rounded-full icon plus"
      />
  </div>
)

export const ChatSideBar = () => {
  const {
    currentChatRef,
    chatList,
    DefaultPersonas,
    toggleSidebar,
    openPersonaPanel,
    onDeleteChat,
    onChangeChat,
    onCreateChat,
    onOpenPersonaPanel,
    onToggleSidebar
  } = useContext(ChatContext)

  return (
    <Flex direction="column" className={cs('chart-side-bar', { show: toggleSidebar })}>
      <Flex className="p-2 h-full overflow-hidden w-64" direction="column" gap="3">
        <Box
          width="auto"
          onClick={() => {
            onToggleSidebar?.()
            onCreateChat?.(DefaultPersonas[0])
          }}
          className="bg-token-surface-primary active:scale-95 cursor-pointer"
        >
          <FiPlus className="size-4" />
          <Text>New Chat</Text>
        </Box>
        <ScrollArea className="flex-1" type="auto" scrollbars="vertical">
          <Flex direction="column" gap="3">
            {chatList.map((chat) => (
              <Box
                key={chat.id}
                width="auto"
                className={cs('bg-token-surface active:scale-95 truncate cursor-pointer', {
                  active: currentChatRef?.current?.id === chat.id,
                  disabled: openPersonaPanel
                })}
                onClick={() => {
                  onToggleSidebar?.()
                  onChangeChat?.(chat)
                }}
              >
                <Flex gap="2" align="center">
                  <BiMessageDetail className="size-4" />
                  <Text as="p" className="truncate">
                    {chat.persona?.name}
                  </Text>
                </Flex>
                <DeleteChatAlert
                  onAction={(e) => {
                    e.stopPropagation()
                    onDeleteChat?.(chat)
                  }}
                  onCancel={(e) => e.stopPropagation()}
                >
                  <IconButton
                    size="2"
                    className="cursor-pointer"
                    variant="ghost"
                    color="gray"
                    radius="full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AiOutlineCloseCircle className="size-4" />
                  </IconButton>
                </DeleteChatAlert>
              </Box>
            ))}
          </Flex>
        </ScrollArea>
        <Box
          width="auto"
          onClick={() => onOpenPersonaPanel?.('chat')}
          className="bg-token-surface-primary active:scale-95 cursor-pointer"
        >
          <RiRobot2Line className="size-4" />
          <Text>Persona Store</Text>
          <PersonaIcons />
        </Box>
      </Flex>
    </Flex>
  )
}

export default ChatSideBar

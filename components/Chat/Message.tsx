'use client'

import { useContext } from 'react'
import { Avatar, Flex } from '@radix-ui/themes'
import { SiOpenai } from 'react-icons/si'
import { HiUser } from 'react-icons/hi'
import { Markdown } from '@/components'
import ChatContext from './chatContext'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

const Message = (props: MessageProps) => {
  const { currentChat } = useContext(ChatContext)
  const { role, content } = props.message
  const isUser = role === 'user'

  return (
    <Flex gap="4" className="mb-5">
      <Avatar
        fallback={isUser ? <HiUser className="h-4 w-4" /> : <SiOpenai className="h-4 w-4" />}
        color={isUser ? undefined : 'green'}
        size="2"
        radius="full"
      />
      <Flex direction="column" gap="2" className="flex-1 pt-1 break-all">
        <Markdown>{content}</Markdown>
      </Flex>
    </Flex>
  )
}

export default Message

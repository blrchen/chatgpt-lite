'use client'

import { Avatar, Flex } from '@radix-ui/themes'
import { HiUser } from 'react-icons/hi'
import { SiOpenai } from 'react-icons/si'
import { Markdown } from '@/components'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

const Message = (props: MessageProps) => {
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
      <div className="flex-1 pt-1 break-all">
        {isUser ? (
          <div
            className="userMessage"
            dangerouslySetInnerHTML={{
              __html: content.replace(
                /<(?!\/?br\/?.+?>|\/?img|\/?table|\/?thead|\/?tbody|\/?tr|\/?td|\/?th.+?>)[^<>]*>/gi,
                ''
              )
            }}
          ></div>
        ) : (
          <Markdown>{content}</Markdown>
        )}
      </div>
    </Flex>
  )
}

export default Message

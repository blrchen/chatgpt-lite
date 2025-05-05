'use client'

import { useCallback, useState } from 'react'
import { Avatar, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { HiUser } from 'react-icons/hi'
import { RiRobot2Line } from 'react-icons/ri'
import { Markdown } from '@/components'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

const Message = (props: MessageProps) => {
  const { role, content } = props.message
  const isUser = role === 'user'
  const copy = useCopyToClipboard()
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const onCopy = useCallback(() => {
    copy(content, (isSuccess) => {
      if (isSuccess) {
        setCopied(true)
        setTooltipOpen(true)
        setTimeout(() => {
          setCopied(false)
          setTooltipOpen(false)
        }, 2000)
      }
    })
  }, [content, copy])

  return (
    <Flex gap="4" className="mb-6">
      <Avatar
        fallback={isUser ? <HiUser className="size-4" /> : <RiRobot2Line className="size-4" />}
        color={isUser ? 'gray' : 'blue'}
        size="2"
        radius="full"
        className="mt-1"
      />
      <div className="flex-1 pt-1 break-all">
        {isUser ? (
          <div className="userMessage">
            {content}
          </div>
        ) : (
          <Flex direction="column" gap="4">
            <Markdown>{content}</Markdown>
            <Flex gap="4" align="center">
              <Tooltip open={tooltipOpen} content={copied ? "Copied!" : "Copy"}>
                <IconButton
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  variant="ghost"
                  color="gray"
                  onClick={onCopy}
                  onMouseLeave={() => !copied && setTooltipOpen(false)}
                >
                  {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                </IconButton>
              </Tooltip>
            </Flex>
          </Flex>
        )}
      </div>
    </Flex>
  )
}

export default Message

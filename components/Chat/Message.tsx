'use client'

import { useCallback, useState } from 'react'
import { Avatar, Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { FaRegCopy } from 'react-icons/fa6'
import { HiUser } from 'react-icons/hi'
import { RiRobot2Line } from 'react-icons/ri'
import sanitizeHtml from 'sanitize-html'
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
  const [tooltipText, setTooltipText] = useState<string>('Copy response')

  const onCopy = useCallback(() => {
    copy(content, (isSuccess) => {
      if (isSuccess) {
        setTooltipText('Copied!')
        setTooltipOpen(true)
        setTimeout(() => {
          setTooltipText('Copy response')
          setTooltipOpen(false)
        }, 1000)
      }
    })
  }, [content, copy])

  return (
    <Flex gap="4" className="mb-5">
      <Avatar
        fallback={isUser ? <HiUser className="size-4" /> : <RiRobot2Line className="size-4" />}
        color={isUser ? undefined : 'green'}
        size="2"
        radius="full"
      />
      <div className="flex-1 pt-1 break-all">
        {isUser ? (
          <div
            className="userMessage"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(content, {
                allowedTags: ['br', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
                allowedAttributes: {
                  img: ['src', 'alt'],
                  '*': ['class']
                }
              })
            }}
          ></div>
        ) : (
          <Flex direction="column" gap="4">
            <Markdown>{content}</Markdown>
            <Flex gap="4" align="center">
              <Tooltip
                open={tooltipOpen}
                content={tooltipText}
                onOpenChange={setTooltipOpen}
                delayDuration={200}
              >
                <IconButton
                  className="cursor-pointer"
                  variant="outline"
                  color="gray"
                  onClick={onCopy}
                  onMouseEnter={() => {
                    setTooltipText('Copy response')
                    setTooltipOpen(true)
                  }}
                  onMouseLeave={() => {
                    setTooltipOpen(false)
                  }}
                >
                  <FaRegCopy />
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

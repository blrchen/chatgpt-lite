'use client'

import { useCallback, useState } from 'react'
import { Avatar, Flex, Tooltip, Text, Button } from '@radix-ui/themes'
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
  const [copied, setCopied] = useState<boolean>(false)

  const onCopy = useCallback(() => {
    copy(content, (isSuccess) => {
      if (isSuccess) {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 1500)
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
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(content, {
                allowedTags: ['br', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div'],
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
            <Flex gap="2" align="center" className="copy-btn-group">
              <Tooltip content={copied ? 'Copied!' : 'Copy to clipboard'} delayDuration={200}>
                <Button
                  variant="soft"
                  color={copied ? 'green' : 'gray'}
                  size="2"
                  className="rounded-xl cursor-pointer"
                  disabled={copied}
                  onClick={onCopy}
                  tabIndex={0}
                  style={{ gap: 8, display: 'flex', alignItems: 'center' }}
                >
                  <FaRegCopy className="size-5" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
        )}
      </div>
    </Flex>
  )
}

export default Message

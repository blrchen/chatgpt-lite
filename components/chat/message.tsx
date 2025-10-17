'use client'

import { useCallback, useState } from 'react'
import { FaRegCopy } from 'react-icons/fa6'
import { HiUser } from 'react-icons/hi'
import { RiRobot2Line } from 'react-icons/ri'
import sanitizeHtml from 'sanitize-html'
import { Markdown } from '@/components/markdown'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

export const Message = (props: MessageProps) => {
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
    <div className="flex gap-3 group items-start">
      <div className={`flex-shrink-0 ${isUser ? 'mt-1.5' : 'mt-0.5'}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
          {isUser ? <HiUser className="w-4 h-4" /> : <RiRobot2Line className="w-4 h-4" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-foreground leading-relaxed">
          {isUser ? (
            <div
              className="leading-relaxed mt-2.5"
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
            <div className="space-y-3">
              <div className="leading-relaxed">
                <Markdown>{content}</Markdown>
              </div>
              {content && (
                <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-200 pt-2 border-t border-border/50 mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-3 text-xs hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border"
                        disabled={copied}
                        onClick={onCopy}
                      >
                        <FaRegCopy className="size-3 mr-1.5" />
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// export { Message }

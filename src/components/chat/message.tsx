'use client'

import { memo, useCallback, useDeferredValue } from 'react'
import { Markdown } from '@/components/markdown'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Copy } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'

import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

const MessageComponent = (props: MessageProps) => {
  const { role, content } = props.message
  const deferredContent = useDeferredValue(content)
  const isUser = role === 'user'
  const { copy, copied } = useCopyToClipboard()

  const onCopy = useCallback(() => {
    void copy(content)
  }, [content, copy])

  return (
    <div className={`group flex min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 pt-2.5 pb-1.5 break-words ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        }`}
      >
        {isUser ? (
          <div
            className="leading-relaxed"
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
          <div className="space-y-2">
            <div className="leading-relaxed">
              <Markdown>{deferredContent}</Markdown>
            </div>
            {content && (
              <div className="border-border text-muted-foreground group-hover:text-foreground mt-2 border-t pt-2 transition-colors duration-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none"
                      disabled={copied}
                      onClick={onCopy}
                    >
                      <Copy className="mr-1.5 size-3" />
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const Message = memo(MessageComponent)
Message.displayName = 'Message'

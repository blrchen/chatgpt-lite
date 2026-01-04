'use client'

import { memo, useCallback, useDeferredValue } from 'react'
import { Markdown } from '@/components/markdown'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Check, Copy } from 'lucide-react'

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
    <div className={`group/message flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 break-words ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground border-border border'
          }`}
        >
          {isUser ? (
            <div className="leading-relaxed whitespace-pre-wrap">{content}</div>
          ) : (
            <div className="leading-relaxed">
              <Markdown>{deferredContent}</Markdown>
            </div>
          )}
        </div>
        {!isUser && content && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="hover:bg-muted focus-visible:ring-ring mt-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 disabled:pointer-events-none"
                disabled={copied}
                onClick={onCopy}
                aria-label={copied ? 'Copied' : 'Copy to clipboard'}
              >
                {copied ? (
                  <Check className="text-primary size-3.5" />
                ) : (
                  <Copy className="text-muted-foreground size-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {copied ? 'Copied!' : 'Copy'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export const Message = memo(MessageComponent)
Message.displayName = 'Message'

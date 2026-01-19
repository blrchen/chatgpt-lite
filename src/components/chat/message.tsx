'use client'

import { memo, useCallback, useDeferredValue } from 'react'
import { Markdown } from '@/components/markdown'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Check, Copy, FileText } from 'lucide-react'

import { ChatMessage, MessageContent } from './interface'

export interface MessageProps {
  message: ChatMessage
}

const renderContent = (content: MessageContent) => {
  if (typeof content === 'string') {
    return content
  }

  return content.map((part, index) => {
    if (part.type === 'text') {
      return <span key={index}>{part.text}</span>
    } else if (part.type === 'image') {
      return (
        <img
          key={index}
          src={part.image}
          alt="Uploaded"
          className="max-w-full rounded-lg mt-2"
          style={{ maxHeight: '300px' }}
        />
      )
    } else if (part.type === 'document') {
      return (
        <div key={index} className="mt-2 p-3 rounded-lg border border-border bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{part.name}</span>
          </div>
          <div className="text-xs text-muted-foreground max-h-40 overflow-y-auto whitespace-pre-wrap">
            {part.content.slice(0, 500)}
            {part.content.length > 500 && '...'}
          </div>
        </div>
      )
    }
    return null
  })
}

const getTextContent = (content: MessageContent): string => {
  if (typeof content === 'string') {
    return content
  }
  return content
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join(' ')
}

const MessageComponent = (props: MessageProps) => {
  const { role, content } = props.message
  const deferredContent = useDeferredValue(content)
  const isUser = role === 'user'
  const { copy, copied } = useCopyToClipboard()

  const onCopy = useCallback(() => {
    void copy(getTextContent(content))
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
            <div className="leading-relaxed whitespace-pre-wrap">{renderContent(content)}</div>
          ) : (
            <div className="leading-relaxed">
              <Markdown>{typeof deferredContent === 'string' ? deferredContent : getTextContent(deferredContent)}</Markdown>
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

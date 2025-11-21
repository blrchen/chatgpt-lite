'use client'

import { useCallback, useContext, useState } from 'react'
import { FaRegCopy } from 'react-icons/fa6'
import sanitizeHtml from 'sanitize-html'
import { toast } from 'sonner'
import { Markdown } from '@/components/markdown'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import ChatContext from './chatContext'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

export const Message = (props: MessageProps) => {
  const { role, content } = props.message
  const isUser = role === 'user'
  const copy = useCopyToClipboard()
  const [copied, setCopied] = useState<boolean>(false)
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  const { currentChatRef } = useContext(ChatContext)

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
  const onVote = useCallback(
    (choice: 'yes' | 'no') => {
      setVote(choice)
      toast.success(`You voted ${choice === 'yes' ? 'Yes' : 'No'}`)
      // Save vote to server log
      try {
        const plain = sanitizeHtml(content || '').substring(0, 50) // limit to 50 chars for logging
        void fetch('/api/log/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentChatRef?.current?.id || 'anon',
            role: 'vote',
            content: `Vote - ${choice} = ${plain}`
          })
        })
      } catch (e) {
        console.warn('failed to log vote', e)
      }
    },
    [vote]
  )
  return (
    <div className="flex gap-3 group items-start">
      <div className="flex-1 min-w-0">
        <div className="text-foreground leading-relaxed">
          {isUser ? (
            <div
              className="leading-relaxed mt-2.5 bg-gray-100 p-4 rounded-2xl w-fit max-w-2xl ml-auto"
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
              <div className="leading-relaxed whitespace-pre-wrap">
                <Markdown>{content}</Markdown>
              </div>
              {content && (
                <div>
                  <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-200 pt-2 border-border/50 mt-2">
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
                  <div className="w-full border-t border-border/50 my-2" />
                  <div className="mt-2 flex flex-col items-center justify-center gap-2">
                    <span className="text-lg">Is OP an asshole?</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-8 px-3 text-lg"
                        onClick={() => onVote('yes')}
                        aria-pressed={vote === 'yes'}
                      >
                        Yes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-8 px-3 text-lg"
                        onClick={() => onVote('no')}
                        aria-pressed={vote === 'no'}
                      >
                        No
                      </Button>
                    </div>
                    <br />
                    <p className="text-lg mb-2">Please explain your reasoning:</p>
                  </div>
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

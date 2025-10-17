'use client'

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import ContentEditable from 'react-contenteditable'
import { AiOutlineClear, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FiSend } from 'react-icons/fi'
import sanitizeHtml from 'sanitize-html'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import ChatContext from './chatContext'
import type { Chat, ChatMessage } from './interface'
import { Message } from './message'

export interface ChatProps {}

export interface ChatGPInstance {
  setConversation: (messages: ChatMessage[]) => void
  getConversation: () => ChatMessage[]
  focus: () => void
}

const postChatOrQuestion = async (chat: Chat, messages: ChatMessage[], input: string) => {
  const url = '/api/chat'

  const data = {
    prompt: chat?.persona?.prompt,
    messages: [...messages!],
    input
  }

  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

const Chat = (props: ChatProps, ref: any) => {
  const { currentChatRef, saveMessages, forceUpdate } = useContext(ChatContext)

  const [isLoading, setIsLoading] = useState(false)

  const conversationRef = useRef<ChatMessage[]>([])

  const [message, setMessage] = useState('')

  const [currentMessage, setCurrentMessage] = useState<string>('')

  // Fix: Ref should be React.RefObject<HTMLElement> instead of HTMLElement | null
  const textAreaRef = useRef<HTMLElement>(null) as React.MutableRefObject<HTMLElement>

  const conversation = useRef<ChatMessage[]>([])

  const bottomOfChatRef = useRef<HTMLDivElement>(null)
  const sendMessage = useCallback(
    async (e: any) => {
      if (!isLoading) {
        e.preventDefault()
        const input = sanitizeHtml(textAreaRef.current?.innerHTML || '')
        if (input.length < 1) {
          toast.error('Please type a message to continue.')
          return
        }

        const message = [...conversation.current]
        conversation.current = [...conversation.current, { content: input, role: 'user' }]
        setMessage('')
        setIsLoading(true)
        if (!currentChatRef?.current) {
          toast.error('No chat selected.')
          setIsLoading(false)
          return
        }
        try {
          const response = await postChatOrQuestion(currentChatRef.current, message, input)

          if (response.ok) {
            const data = response.body

            if (!data) {
              throw new Error('No data')
            }

            const reader = data.getReader()
            const decoder = new TextDecoder('utf-8')
            let done = false
            let resultContent = ''

            while (!done) {
              try {
                const { value, done: readerDone } = await reader.read()
                const char = decoder.decode(value)
                if (char) {
                  setCurrentMessage((state) => {
                    resultContent = state + char
                    return resultContent
                  })
                }
                done = readerDone
              } catch {
                done = true
              }
            }
            setTimeout(() => {
              conversation.current = [
                ...conversation.current,
                { content: resultContent, role: 'assistant' }
              ]

              setCurrentMessage('')
            }, 1)
          } else {
            const result = await response.json()
            if (response.status === 401) {
              conversation.current.pop()
              location.href =
                result.redirect +
                `?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`
            } else {
              toast.error(result.error)
            }
          }

          setIsLoading(false)
        } catch (error: any) {
          console.error(error)
          toast.error(error.message)
          setIsLoading(false)
        }
      }
    },
    [currentChatRef, isLoading]
  )

  const handleKeypress = useCallback(
    (e: any) => {
      if (e.keyCode == 13 && !e.shiftKey) {
        sendMessage(e)
        e.preventDefault()
      }
    },
    [sendMessage]
  )

  const clearMessages = () => {
    conversation.current = []
    forceUpdate?.()
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '50px'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + 2}px`
    }
  }, [message, textAreaRef])

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation, currentMessage])

  useEffect(() => {
    conversationRef.current = conversation.current
    if (currentChatRef?.current?.id) {
      saveMessages?.(conversation.current)
    }
  }, [currentChatRef, conversation.current, saveMessages])

  useEffect(() => {
    if (!isLoading) {
      textAreaRef.current?.focus()
    }
  }, [isLoading])

  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: ChatMessage[]) {
        conversation.current = messages
        forceUpdate?.()
      },
      getConversation() {
        return conversationRef.current
      },
      focus: () => {
        textAreaRef.current?.focus()
      }
    }
  })

  return (
    <div className="relative flex flex-col h-full bg-background text-foreground">
      {/* Main chat area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {conversation.current.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-8 px-4">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-normal text-foreground">
                    Hello, I&apos;m here to help
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Ask me anything, or try one of these:
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div
                    className="p-4 rounded-xl border border-border hover:border-accent-foreground cursor-pointer transition-colors"
                    onClick={() => {
                      setMessage(
                        'Write a screenplay for an engaging and fun Chemistry 101 explainer video covering topics like atomic structure, chemical bonding and reactions.'
                      )
                      textAreaRef.current?.focus()
                    }}
                  >
                    <p className="text-foreground text-sm">
                      Write a screenplay for an engaging and fun Chemistry 101 explainer video
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl border border-border hover:border-accent-foreground cursor-pointer transition-colors"
                    onClick={() => {
                      setMessage('Explain quantum computing in simple terms')
                      textAreaRef.current?.focus()
                    }}
                  >
                    <p className="text-foreground text-sm">
                      Explain quantum computing in simple terms
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl border border-border hover:border-accent-foreground cursor-pointer transition-colors"
                    onClick={() => {
                      setMessage('Create a workout plan for beginners')
                      textAreaRef.current?.focus()
                    }}
                  >
                    <p className="text-foreground text-sm">Create a workout plan for beginners</p>
                  </div>
                  <div
                    className="p-4 rounded-xl border border-border hover:border-accent-foreground cursor-pointer transition-colors"
                    onClick={() => {
                      setMessage('Help me plan a trip to New Zealand')
                      textAreaRef.current?.focus()
                    }}
                  >
                    <p className="text-foreground text-sm">Help me plan a trip to New Zealand</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {conversation.current.map((item, index) => (
                  <Message key={index} message={item} />
                ))}
                {currentMessage && (
                  <Message message={{ content: currentMessage, role: 'assistant' }} />
                )}
                <div ref={bottomOfChatRef}></div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      {/* Input area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {conversation.current.length > 0 && (
            <div className="flex justify-start mb-3">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg"
                disabled={isLoading}
                onClick={clearMessages}
              >
                <AiOutlineClear className="size-4 mr-2" />
                <span>Clear chat</span>
              </Button>
            </div>
          )}
          <div className="relative">
            <div className="flex items-end gap-3 bg-secondary rounded-3xl border border-border focus-within:border-accent-foreground transition-all duration-200">
              <div className="flex-1 px-4 py-3 min-h-[52px] flex items-center">
                <ContentEditable
                  innerRef={textAreaRef}
                  style={{
                    minHeight: '24px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    outline: 'none'
                  }}
                  className="w-full bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-base resize-none"
                  html={message}
                  disabled={isLoading}
                  onChange={(e) => {
                    setMessage(sanitizeHtml(e.target.value))
                  }}
                  onKeyDown={(e: any) => {
                    handleKeypress(e)
                  }}
                />
              </div>

              <div className="flex items-center pr-2 pb-2">
                {isLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <AiOutlineLoading3Quarters className="animate-spin size-5 text-muted-foreground" />
                  </div>
                ) : (
                  <Button
                    size="icon"
                    disabled={isLoading || !message.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    onClick={sendMessage}
                  >
                    <FiSend className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default forwardRef<ChatGPInstance, ChatProps>(Chat)

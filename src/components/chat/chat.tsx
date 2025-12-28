'use client'

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { ensureMessageIds, generateMessageId } from '@/components/chat/utils'
import { Button } from '@/components/ui/button'
import { ArrowUp, Eraser, Loader2 } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'
import { toast } from 'sonner'
import { StickToBottom } from 'use-stick-to-bottom'

import ChatContext from './chatContext'
import type { ChatMessage } from './interface'
import { Message } from './message'
import { usePersonaContext } from './personaContext'

export interface ChatRef {
  setConversation: (messages: ChatMessage[], chatId?: string | null) => void
  getConversation: () => ChatMessage[]
  focus: () => void
}

const toMessagePayload = (messages: ChatMessage[]) =>
  messages.map(({ role, content }) => ({ role, content }))

const sendChatMessage = async (personaPrompt: string, messages: ChatMessage[], input: string) => {
  const url = '/api/chat'

  const data = {
    prompt: personaPrompt,
    messages: toMessagePayload(messages),
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

type ConversationUpdater = ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])

const Chat = (_: object, ref: React.ForwardedRef<ChatRef>) => {
  const {
    currentChat,
    currentChatId,
    saveMessages,
    isChatHydrated,
    getChatById,
    onCreateDefaultChat
  } = useContext(ChatContext)
  const { getPersonaById } = usePersonaContext()

  const [loadingChatId, setLoadingChatId] = useState<string | null>(null)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)

  const [message, setMessage] = useState('')

  const [currentMessage, setCurrentMessage] = useState<string>('')

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  const getComposerValue = useCallback(() => textAreaRef.current?.value ?? message ?? '', [message])
  const getComposerText = useCallback(() => {
    return sanitizeHtml(getComposerValue(), { allowedTags: [], allowedAttributes: {} }).trim()
  }, [getComposerValue])
  const getComposerHtml = useCallback(() => {
    const normalized = getComposerValue().replace(/\r\n/g, '\n')
    const withBreaks = normalized.replace(/\n/g, '<br />')
    return sanitizeHtml(withBreaks, {
      allowedTags: ['br'],
      allowedAttributes: {}
    }).trim()
  }, [getComposerValue])

  const [conversation, setConversationState] = useState<ChatMessage[]>([])
  const conversationRef = useRef<ChatMessage[]>([])
  const conversationChatIdRef = useRef<string | undefined>(undefined)
  const activeChatIdRef = useRef<string | null>(null)
  const streamingChatIdRef = useRef<string | null>(null)
  const setConversation = useCallback(
    (updater: ConversationUpdater, chatId?: string | null) => {
      setConversationState((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (prev: ChatMessage[]) => ChatMessage[])(prev)
            : updater
        const nextWithIds = ensureMessageIds(next)
        conversationRef.current = nextWithIds
        const resolvedChatId =
          chatId === null ? undefined : (chatId ?? currentChatId ?? conversationChatIdRef.current)
        conversationChatIdRef.current = resolvedChatId
        return nextWithIds
      })
    },
    [currentChatId]
  )

  const chatInputId = useId()
  const helperTextId = useId()
  const errorTextId = useId()
  const isCurrentChatLoading = loadingChatId !== null && loadingChatId === currentChatId
  const hasActiveChat = Boolean(currentChatId ?? conversationChatIdRef.current)
  const canSend =
    isChatHydrated && hasActiveChat && !isCurrentChatLoading && Boolean(getComposerText())
  const textareaClassName =
    'text-foreground w-full min-w-0 resize-none !border-0 !bg-transparent text-base leading-relaxed break-all !outline-none !shadow-none focus:!outline-none focus:!border-0 focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 max-h-[200px] min-h-[24px] overflow-y-auto [field-sizing:content]'

  const ensureActiveChat = useCallback(() => {
    const targetId = conversationChatIdRef.current ?? currentChatId ?? null
    const chat = getChatById(targetId)
    if (chat) {
      conversationChatIdRef.current = chat.id
      return chat
    }
    const created = onCreateDefaultChat?.()
    if (created) {
      conversationChatIdRef.current = created.id
    }
    return created ?? undefined
  }, [currentChatId, getChatById, onCreateDefaultChat])

  useEffect(() => {
    activeChatIdRef.current = currentChatId ?? null
  }, [currentChatId])

  const sendMessage = useCallback(
    async (e: React.FormEvent | React.MouseEvent) => {
      if (loadingChatId !== null && loadingChatId === currentChatId) {
        return
      }

      e.preventDefault()
      const input = getComposerHtml()
      if (input.length < 1) {
        setComposerError('Please enter a message to continue.')
        return
      }

      if (!isChatHydrated) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return
      }

      const activeChat = ensureActiveChat()
      if (!activeChat) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return
      }

      const targetChatId = activeChat.id
      activeChatIdRef.current = targetChatId
      const history = [...conversationRef.current]
      const personaForChat =
        activeChat.persona?.id && getPersonaById
          ? (getPersonaById(activeChat.persona.id) ?? activeChat.persona)
          : activeChat.persona
      const personaPrompt = personaForChat?.prompt?.trim() ?? ''
      if (!personaPrompt) {
        setComposerError('This persona is missing a prompt. Please edit it and try again.')
        return
      }
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        createdAt: new Date().toISOString(),
        content: input,
        role: 'user'
      }
      const pendingConversation = [...history, userMessage]

      setLoadingChatId(targetChatId)
      setComposerError(null)
      setConversation(pendingConversation, targetChatId)
      saveMessages(pendingConversation, targetChatId, { chat: activeChat })
      setMessage('')
      setCurrentMessage('')

      streamingChatIdRef.current = targetChatId

      try {
        const response = await sendChatMessage(personaPrompt, history, input)

        if (response.ok) {
          const data = response.body

          if (!data) {
            throw new Error('No data')
          }

          const reader = data.getReader()
          const decoder = new TextDecoder('utf-8')
          let done = false
          let resultContent = ''
          let frameHandle: number | null = null
          let chunkBuffer = ''

          const flushBuffer = () => {
            if (!chunkBuffer) return
            resultContent += chunkBuffer
            chunkBuffer = ''
            const isCurrentChatActive =
              streamingChatIdRef.current === targetChatId &&
              activeChatIdRef.current === targetChatId
            if (isCurrentChatActive) {
              setCurrentMessage(resultContent)
            }
          }

          while (!done) {
            try {
              const { value, done: readerDone } = await reader.read()
              const char = decoder.decode(value, { stream: true })
              if (char) {
                chunkBuffer += char
                if (frameHandle === null) {
                  frameHandle = requestAnimationFrame(() => {
                    flushBuffer()
                    frameHandle = null
                  })
                }
              }
              done = readerDone
            } catch {
              done = true
            }
          }

          if (frameHandle !== null) {
            cancelAnimationFrame(frameHandle)
            frameHandle = null
          }
          flushBuffer()

          const finalAssistantMessage: ChatMessage = {
            id: generateMessageId(),
            createdAt: new Date().toISOString(),
            content: resultContent,
            role: 'assistant'
          }
          const finalConversation: ChatMessage[] = [...pendingConversation, finalAssistantMessage]

          if (activeChatIdRef.current === targetChatId) {
            setConversation(finalConversation, targetChatId)
          }
          saveMessages(finalConversation, targetChatId, { chat: activeChat })
          if (
            streamingChatIdRef.current === targetChatId &&
            activeChatIdRef.current === targetChatId
          ) {
            setCurrentMessage('')
          }
        } else {
          const result = await response.json()
          if (response.status === 401) {
            if (
              streamingChatIdRef.current === targetChatId &&
              activeChatIdRef.current === targetChatId
            ) {
              setConversation((prev) => prev.slice(0, -1), targetChatId)
            }
            saveMessages(history, targetChatId, { chat: activeChat })
            location.href =
              result.redirect +
              `?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`
          } else {
            toast.error(result.error)
            setComposerError('Unable to send message. Please try again.')
          }
        }
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Unknown error')
        setComposerError('Something went wrong. Please try again.')
      } finally {
        if (streamingChatIdRef.current === targetChatId) {
          streamingChatIdRef.current = null
        }
        setLoadingChatId((prev) => (prev === targetChatId ? null : prev))
      }
    },
    [
      isChatHydrated,
      ensureActiveChat,
      getPersonaById,
      getComposerHtml,
      currentChatId,
      loadingChatId,
      saveMessages,
      setConversation
    ]
  )

  const handleKeypress = useCallback(
    (e: React.KeyboardEvent) => {
      // Block submission during IME composition (e.g., Chinese/Japanese/Korean input)
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault()
        if (!isChatHydrated || isCurrentChatLoading) {
          return
        }
        const input = getComposerText()
        if (!input) {
          setComposerError('Please enter a message to continue.')
          return
        }
        sendMessage(e)
      }
    },
    [getComposerText, isChatHydrated, isComposing, isCurrentChatLoading, sendMessage]
  )

  const clearMessages = () => {
    const chatId = currentChatId ?? null
    if (isCurrentChatLoading) {
      return
    }
    setConversation([], chatId)
  }

  useEffect(() => {
    if (currentChatId) {
      conversationChatIdRef.current = currentChatId
    }
  }, [currentChatId])

  useEffect(() => {
    if (!currentChat?.id) {
      setCurrentMessage('')
      return
    }
    if (streamingChatIdRef.current && streamingChatIdRef.current !== currentChat.id) {
      setCurrentMessage('')
    }
  }, [currentChat?.id])

  useEffect(() => {
    if (!currentChatId) {
      return
    }
    if (!isChatHydrated) {
      return
    }
    if (conversationChatIdRef.current !== currentChatId) {
      setCurrentMessage('')
    }
  }, [currentChatId, isChatHydrated])

  useEffect(() => {
    if (!isChatHydrated) {
      return
    }
    const targetChatId = conversationChatIdRef.current ?? currentChatId
    if (!targetChatId) {
      return
    }
    saveMessages(conversation, targetChatId)
  }, [conversation, currentChatId, isChatHydrated, saveMessages])

  useEffect(() => {
    if (!isCurrentChatLoading) {
      textAreaRef.current?.focus()
    }
  }, [isCurrentChatLoading])

  const renderComposer = (showClear?: boolean) => {
    const actionAlignment = showClear ? 'justify-between' : 'justify-end'

    return (
      <div className="relative">
        <div className="bg-background border-border flex flex-col rounded-2xl border transition-all duration-200">
          <div className="relative flex min-h-[44px] min-w-0 flex-1 items-start px-4 pt-2 pb-1">
            <label className="sr-only" htmlFor={chatInputId}>
              Message input
            </label>
            <p id={helperTextId} className="sr-only">
              Press Enter to send your message. Use Shift plus Enter to insert a new line.
            </p>
            {!message && !isComposerFocused && (
              <span className="text-muted-foreground pointer-events-none absolute top-2 left-4 text-base">
                Ask anything
              </span>
            )}
            <textarea
              ref={textAreaRef}
              rows={1}
              className={textareaClassName}
              value={message}
              disabled={isCurrentChatLoading || !isChatHydrated}
              id={chatInputId}
              aria-invalid={!!composerError}
              aria-describedby={composerError ? `${helperTextId} ${errorTextId}` : helperTextId}
              onFocus={() => setIsComposerFocused(true)}
              onBlur={() => setIsComposerFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setMessage(e.target.value)
                setComposerError(null)
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                handleKeypress(e)
              }}
            />
          </div>

          <div className={`flex items-center ${actionAlignment} px-3 pb-3`}>
            {showClear && (
              <Button
                size="sm"
                variant="outline"
                className="shadow-none"
                disabled={isCurrentChatLoading}
                onClick={clearMessages}
              >
                <Eraser className="mr-2 size-4" />
                Clear chat
              </Button>
            )}
            {isCurrentChatLoading ? (
              <div
                className="flex items-center justify-center p-2"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            ) : (
              <Button
                size="icon"
                disabled={!canSend}
                className="!bg-primary !text-primary-foreground hover:!bg-primary/90 size-8 rounded-full"
                onClick={sendMessage}
                aria-label="Send message"
                title="Send message"
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-1 space-y-1">
          {composerError && (
            <p id={errorTextId} className="text-destructive text-xs" role="alert">
              {composerError}
            </p>
          )}
        </div>
      </div>
    )
  }

  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: ChatMessage[], chatId?: string | null) {
        setConversation(messages, chatId)
      },
      getConversation() {
        return conversationRef.current
      },
      focus: () => {
        textAreaRef.current?.focus()
      }
    }
  }, [setConversation])

  return (
    <div className="bg-background text-foreground relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Main chat area */}
      <div className="min-h-0 flex-1">
        <StickToBottom className="relative h-full overflow-y-auto" initial="smooth" resize="smooth">
          <StickToBottom.Content className="@container/chat mx-auto w-full max-w-5xl px-4 pt-4 pb-3 md:px-6 lg:px-8">
            {!isChatHydrated ? (
              <div className="flex h-full min-h-[60vh] items-center justify-center">
                <div className="text-muted-foreground flex items-center gap-3 text-sm">
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  <span>Loading your chats…</span>
                </div>
              </div>
            ) : conversation.length === 0 ? (
              <div className="flex h-full min-h-[60vh] flex-col items-center justify-center space-y-8">
                <div className="space-y-4 text-center">
                  <div className="bg-secondary text-secondary-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h1 className="text-foreground text-3xl font-normal md:text-4xl">
                    Hello, I&apos;m here to help
                  </h1>
                </div>
                <div className="w-full max-w-2xl">{renderComposer()}</div>
              </div>
            ) : (
              <div className="@container/chat mx-auto w-full max-w-5xl space-y-4 px-4 md:px-6 lg:px-8">
                {conversation.map((item) => (
                  <Message key={item.id} message={item} />
                ))}
                {currentMessage && (
                  <Message
                    key="streaming"
                    message={{
                      id: 'streaming',
                      createdAt: conversation.at(-1)?.createdAt ?? new Date().toISOString(),
                      content: currentMessage,
                      role: 'assistant'
                    }}
                  />
                )}
              </div>
            )}
          </StickToBottom.Content>
        </StickToBottom>
      </div>
      {/* Input area - only show at bottom when there are messages */}
      {conversation.length > 0 && (
        <div className="bg-background">
          <div className="@container/chat mx-auto w-full max-w-5xl px-4 pt-0 pb-2 md:px-6 lg:px-8">
            {renderComposer(true)}
          </div>
        </div>
      )}
    </div>
  )
}

export default forwardRef<ChatRef, object>(Chat)

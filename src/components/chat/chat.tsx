'use client'

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { buildUserMessageParts } from '@/components/chat/chat-attachments'
import {
  ChatComposer,
  type ChatComposerHandle,
  type ChatComposerPayload
} from '@/components/chat/chat-composer'
import ChatContext from '@/components/chat/chatContext'
import type { Chat, ChatMessage } from '@/components/chat/interface'
import { MessageList } from '@/components/chat/message-list'
import { usePersonaContext } from '@/components/chat/personaContext'
import { ensureMessageIds, generateMessageId } from '@/components/chat/utils'
import { createChatTransport } from '@/lib/chat-transport'
import { useChat } from '@ai-sdk/react'
import { toast } from 'sonner'
import { StickToBottom } from 'use-stick-to-bottom'

export interface ChatRef {
  setConversation: (messages: ChatMessage[], chatId?: string | null) => void
  getConversation: () => ChatMessage[]
  focus: () => void
  isStreaming: () => boolean
}

const LOADING_DOTS = [0, 1, 2] as const

type ChatProps = object

function Chat(_: ChatProps, ref: React.ForwardedRef<ChatRef>): React.JSX.Element {
  const {
    currentChat,
    currentChatId,
    saveMessages,
    isChatHydrated,
    getChatById,
    onCreateDefaultChat
  } = useContext(ChatContext)
  const { getPersonaById } = usePersonaContext()

  const [composerError, setComposerError] = useState<string | null>(null)
  const [hasActiveChat, setHasActiveChat] = useState(Boolean(currentChatId))

  const transport = useMemo(() => createChatTransport(), [])
  const messagesRef = useRef<ChatMessage[]>([])
  const composerRef = useRef<ChatComposerHandle | null>(null)
  const activeChatIdRef = useRef<string | null>(null)
  const activeChatRef = useRef<Chat | null>(null)
  const inflightChatIdRef = useRef<string | null>(null)
  const inflightChatRef = useRef<Chat | null>(null)
  const currentChatRef = useRef<Chat | undefined>(currentChat)
  const previousChatIdRef = useRef<string | undefined>(currentChatId)

  const { messages, setMessages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport,
    onFinish: ({ messages: finalMessages, isAbort }) => {
      if (isAbort) {
        inflightChatIdRef.current = null
        inflightChatRef.current = null
        return
      }
      const targetChatId =
        inflightChatIdRef.current ?? activeChatIdRef.current ?? currentChatId ?? null
      if (!targetChatId) {
        return
      }
      const normalized = ensureMessageIds(
        finalMessages.map((message) => ({
          ...message,
          createdAt: message.createdAt ?? new Date().toISOString()
        }))
      )
      saveMessages(normalized, targetChatId, {
        chat: inflightChatRef.current ?? activeChatRef.current ?? currentChatRef.current
      })
      inflightChatIdRef.current = null
      inflightChatRef.current = null
    },
    onError: (err) => {
      console.error(err)
      toast.error(err?.message ?? 'Something went wrong')
      setComposerError('Something went wrong. Please try again.')
    }
  })

  const isCurrentChatLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (error) {
      setComposerError(error.message)
    }
  }, [error])

  useEffect(() => {
    currentChatRef.current = currentChat
  }, [currentChat])

  useEffect(() => {
    setComposerError(null)
  }, [currentChatId])

  useEffect(() => {
    activeChatIdRef.current = currentChatId ?? null
    activeChatRef.current = currentChat ?? null
  }, [currentChatId, currentChat])

  useEffect(() => {
    setHasActiveChat(Boolean(currentChatId))
  }, [currentChatId])

  useEffect(() => {
    if (previousChatIdRef.current !== currentChatId) {
      if (isCurrentChatLoading) {
        stop()
      }
      previousChatIdRef.current = currentChatId
    }
  }, [currentChatId, isCurrentChatLoading, stop])

  const ensureActiveChat = useCallback(() => {
    const targetId = currentChatId ?? activeChatIdRef.current ?? null
    const chat = getChatById(targetId)
    if (chat) {
      activeChatIdRef.current = chat.id
      activeChatRef.current = chat
      setHasActiveChat(true)
      return chat
    }
    const created = onCreateDefaultChat?.()
    if (created) {
      activeChatIdRef.current = created.id
      activeChatRef.current = created
      setHasActiveChat(true)
    }
    return created ?? undefined
  }, [currentChatId, getChatById, onCreateDefaultChat])

  const handleSend = useCallback(
    async ({ text, uploadedImages, uploadedDocuments }: ChatComposerPayload) => {
      if (!isChatHydrated) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return false
      }

      const activeChat = ensureActiveChat()
      if (!activeChat) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return false
      }

      const personaId = activeChat.persona?.id
      let personaForChat = activeChat.persona
      if (personaId) {
        personaForChat = getPersonaById(personaId) ?? activeChat.persona
      }
      const personaPrompt = personaForChat?.prompt?.trim() ?? ''
      if (!personaPrompt) {
        setComposerError('This persona is missing a prompt. Please edit it and try again.')
        return false
      }

      const parts = buildUserMessageParts(text, uploadedImages, uploadedDocuments)
      if (parts.length === 0) {
        setComposerError('Please enter a message or upload a file to continue.')
        return false
      }

      const messageId = generateMessageId()
      const createdAt = new Date().toISOString()
      const userMessage: ChatMessage = {
        id: messageId,
        createdAt,
        role: 'user',
        parts
      }

      const pendingConversation = ensureMessageIds([...messagesRef.current, userMessage])
      saveMessages(pendingConversation, activeChat.id, { chat: activeChat })
      setComposerError(null)
      activeChatIdRef.current = activeChat.id
      activeChatRef.current = activeChat
      inflightChatIdRef.current = activeChat.id
      inflightChatRef.current = activeChat

      try {
        await sendMessage(userMessage, {
          body: {
            prompt: personaPrompt
          }
        })
        return true
      } catch (err) {
        inflightChatIdRef.current = null
        inflightChatRef.current = null
        console.error(err)
        toast.error(err instanceof Error ? err.message : 'Unknown error')
        setComposerError('Something went wrong. Please try again.')
        return false
      }
    },
    [ensureActiveChat, getPersonaById, isChatHydrated, saveMessages, sendMessage]
  )

  const handleClearMessages = useCallback(() => {
    const chatId = currentChatId ?? null
    if (isCurrentChatLoading) {
      return
    }
    stop()
    setMessages([])
    if (chatId) {
      saveMessages([], chatId)
    }
  }, [currentChatId, isCurrentChatLoading, saveMessages, setMessages, stop])

  useImperativeHandle(ref, () => {
    return {
      setConversation(nextMessages: ChatMessage[], chatId?: string | null) {
        const normalized = ensureMessageIds(nextMessages)
        setMessages(normalized)
        if (chatId !== undefined) {
          const resolvedChat = getChatById(chatId ?? null)
          activeChatIdRef.current = chatId ?? null
          activeChatRef.current = resolvedChat ?? null
          setHasActiveChat(Boolean(chatId))
        }
      },
      getConversation() {
        return messagesRef.current
      },
      focus: () => {
        composerRef.current?.focus()
      },
      isStreaming: () => isCurrentChatLoading
    }
  }, [getChatById, isCurrentChatLoading, setHasActiveChat, setMessages])

  let chatBody: React.JSX.Element
  if (!isChatHydrated) {
    chatBody = (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="text-primary/20 font-serif text-6xl select-none md:text-7xl">❧</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 size-16 rounded-full blur-xl" />
          </div>
        </div>
        <div className="text-muted-foreground flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5">
            {LOADING_DOTS.map((i) => (
              <span
                key={i}
                className="bg-primary/40 size-1.5 animate-[pulse-dot_1.4s_ease-in-out_infinite] rounded-full motion-reduce:animate-none"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span className="animate-in fade-in font-serif text-sm tracking-wide text-balance italic duration-200 motion-reduce:animate-none">
            Preparing your workspace…
          </span>
        </div>
      </div>
    )
  } else {
    chatBody = <MessageList messages={messages} isStreaming={isCurrentChatLoading} />
  }

  if (messages.length === 0 && isChatHydrated) {
    return (
      <div className="bg-background text-foreground flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="animate-in fade-in zoom-in-95 relative w-full max-w-2xl -translate-y-4 space-y-8 text-center duration-200 motion-reduce:animate-none">
          <div className="space-y-6">
            <h1
              className="text-foreground font-display animate-in fade-in slide-in-from-bottom-2 text-4xl font-medium tracking-tight text-balance duration-200 motion-reduce:animate-none md:text-5xl lg:text-6xl"
              style={{ animationDelay: '100ms' }}
            >
              What shall we explore?
            </h1>
            <p
              className="text-muted-foreground animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-md font-serif text-lg leading-relaxed text-pretty duration-200 motion-reduce:animate-none md:text-xl"
              style={{ animationDelay: '200ms' }}
            >
              I&apos;m here to help you think, write, and discover.
            </p>
          </div>
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none"
            style={{ animationDelay: '300ms' }}
          >
            <ChatComposer
              ref={composerRef}
              isChatHydrated={isChatHydrated}
              isSending={isCurrentChatLoading}
              hasActiveChat={hasActiveChat}
              showClear={false}
              composerError={composerError}
              setComposerError={setComposerError}
              onClear={handleClearMessages}
              onSend={handleSend}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <StickToBottom
        className="relative min-h-0 flex-1 overflow-y-auto"
        initial="smooth"
        resize="smooth"
      >
        <StickToBottom.Content className="relative flex min-h-full flex-col">
          <div className="@container/chat relative mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-3 md:px-6 lg:px-8">
            {chatBody}
          </div>
        </StickToBottom.Content>
      </StickToBottom>
      <div className="border-border/40 shrink-0 border-t pt-4">
        <div className="@container/chat mx-auto w-full max-w-5xl px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:px-6 lg:px-8">
          <ChatComposer
            ref={composerRef}
            isChatHydrated={isChatHydrated}
            isSending={isCurrentChatLoading}
            hasActiveChat={hasActiveChat}
            showClear={true}
            composerError={composerError}
            setComposerError={setComposerError}
            onClear={handleClearMessages}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  )
}

export default forwardRef<ChatRef, ChatProps>(Chat)

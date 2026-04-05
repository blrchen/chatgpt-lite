import {
  createContext,
  useContext,
  useMemo,
  type Context,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'
import { type ChatComposerPayload } from '@/lib/chat-attachments'
import { type ChatStreamPhase, type ChatStreamStatus } from '@/lib/chat-utils'
import type { ChatMessage } from '@/lib/types'

type ChatMessagesContextValue = {
  messages: ChatMessage[]
  streamStatus: ChatStreamStatus
  streamPhase: ChatStreamPhase
  error: string | null
  onDismissError: () => void
}

type ChatComposerContextValue = {
  isChatHydrated: boolean
  hasActiveChat: boolean
  isSending: boolean
  composerError: string | null
  setComposerError: Dispatch<SetStateAction<string | null>>
  onClear: () => void
  onSend: (payload: ChatComposerPayload) => Promise<boolean> | boolean
  onStop: () => void
}

type ChatSessionProviderProps = {
  messages: ChatMessage[]
  streamStatus: ChatStreamStatus
  streamPhase: ChatStreamPhase
  error: string | null
  onDismissError: () => void
  isChatHydrated: boolean
  hasActiveChat: boolean
  isSending: boolean
  composerError: string | null
  setComposerError: Dispatch<SetStateAction<string | null>>
  onClear: () => void
  onSend: (payload: ChatComposerPayload) => Promise<boolean> | boolean
  onStop: () => void
  children: ReactNode
}

const ChatMessagesContext = createContext<ChatMessagesContextValue | null>(null)
const ChatComposerContext = createContext<ChatComposerContextValue | null>(null)

function useRequiredContext<T>(context: Context<T | null>, contextName: string): T {
  const value = useContext(context)
  if (value !== null) {
    return value
  }
  throw new Error(`${contextName} must be used within ChatSessionProvider.`)
}

export function ChatSessionProvider({
  messages,
  streamStatus,
  streamPhase,
  error,
  onDismissError,
  isChatHydrated,
  hasActiveChat,
  isSending,
  composerError,
  setComposerError,
  onClear,
  onSend,
  onStop,
  children
}: ChatSessionProviderProps): React.JSX.Element {
  const messagesValue = useMemo<ChatMessagesContextValue>(
    () => ({
      messages,
      streamStatus,
      streamPhase,
      error,
      onDismissError
    }),
    [messages, streamStatus, streamPhase, error, onDismissError]
  )

  const composerValue = useMemo<ChatComposerContextValue>(
    () => ({
      isChatHydrated,
      hasActiveChat,
      isSending,
      composerError,
      setComposerError,
      onClear,
      onSend,
      onStop
    }),
    [
      isChatHydrated,
      hasActiveChat,
      isSending,
      composerError,
      setComposerError,
      onClear,
      onSend,
      onStop
    ]
  )

  return (
    <ChatMessagesContext.Provider value={messagesValue}>
      <ChatComposerContext.Provider value={composerValue}>{children}</ChatComposerContext.Provider>
    </ChatMessagesContext.Provider>
  )
}

export function useChatMessagesContext(): ChatMessagesContextValue {
  return useRequiredContext(ChatMessagesContext, 'ChatMessagesContext')
}

export function useChatComposerContext(): ChatComposerContextValue {
  return useRequiredContext(ChatComposerContext, 'ChatComposerContext')
}

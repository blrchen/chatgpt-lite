'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react'
import { buildUserMessageParts, type ChatComposerPayload } from '@/lib/chat-attachments'
import { createChatTransport } from '@/lib/chat-transport'
import {
  DefaultPersona,
  getTextFromParts,
  isStreamingStatus,
  preloadMarkdown,
  type ChatStreamPhase,
  type ChatStreamStatus
} from '@/lib/chat-utils'
import { generateId } from '@/lib/id'
import type { ChatMessage } from '@/lib/types'
import { selectGetMessagesForChat, selectIsChatHydrated, useChatStore } from '@/store/chat-store'
import { usePersonaStore } from '@/store/persona-store'
import { useChat, type UseChatHelpers } from '@ai-sdk/react'

const CHAT_STREAM_THROTTLE_MS = 32
const DEFAULT_COMPOSER_ERROR_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_COMPOSER_ERROR_MESSAGE = 'Network error. Please check your connection and try again.'

interface UseChatSessionReturn {
  messages: ChatMessage[]
  status: ChatStreamStatus
  streamPhase: ChatStreamPhase
  isLoading: boolean
  isChatHydrated: boolean
  streamError: string | null
  composerError: string | null
  setComposerError: Dispatch<SetStateAction<string | null>>
  handleSend: (payload: ChatComposerPayload) => Promise<boolean>
  handleStop: () => void
  handleClearMessages: () => void
  handleDismissError: () => void
}

type ChatSessionError =
  | { source: 'composer'; message: string }
  | { source: 'dismissed-stream'; error: Error }

type PreparedSendResult =
  | { error: string }
  | { parts: ReturnType<typeof buildUserMessageParts>; personaPrompt: string }

type StreamPhaseParams = {
  isLoading: boolean
  messages: ChatMessage[]
  hasPendingToolCall: boolean
}

type ChatSendMessage = UseChatHelpers<ChatMessage>['sendMessage']

type SessionCommitOptions = {
  trimTrailingAssistant?: boolean
  updateMeta?: boolean
  resetTitle?: boolean
  personaName?: string
}

type SendUserMessageParams = {
  chatId: string
  payload: ChatComposerPayload
  prepareSend: (payload: ChatComposerPayload) => PreparedSendResult
  sendMessage: ChatSendMessage
  setComposerError: Dispatch<SetStateAction<string | null>>
  resetToolCallPhase: () => void
}

function parseErrorMessageFromJsonText(text: string): string | null {
  try {
    const parsed: unknown = JSON.parse(text)

    if (typeof parsed === 'string') {
      const message = parsed.trim()
      return message.length > 0 ? message : null
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'message' in parsed &&
      typeof (parsed as { message?: unknown }).message === 'string'
    ) {
      const message = (parsed as { message: string }).message.trim()
      return message.length > 0 ? message : null
    }
  } catch {
    // Ignore parse errors and fall back to the raw message.
  }

  return null
}

function getComposerErrorMessage(error: unknown): string {
  if (error == null) {
    return DEFAULT_COMPOSER_ERROR_MESSAGE
  }

  if (typeof error === 'string') {
    const rawMessage = error.trim()
    if (rawMessage.length === 0) {
      return DEFAULT_COMPOSER_ERROR_MESSAGE
    }

    return parseErrorMessageFromJsonText(rawMessage) ?? rawMessage
  }

  if (error instanceof Error) {
    const rawMessage = error.message.trim()
    if (rawMessage.length === 0) {
      return DEFAULT_COMPOSER_ERROR_MESSAGE
    }

    const parsedMessage = parseErrorMessageFromJsonText(rawMessage)
    if (parsedMessage) {
      return parsedMessage
    }

    const lowerMessage = rawMessage.toLowerCase()
    if (
      lowerMessage === 'failed to fetch' ||
      lowerMessage.includes('networkerror') ||
      lowerMessage.includes('network request failed')
    ) {
      return NETWORK_COMPOSER_ERROR_MESSAGE
    }

    return rawMessage
  }

  return DEFAULT_COMPOSER_ERROR_MESSAGE
}

function dropTrailingEmptyAssistantMessages(conversation: ChatMessage[]): ChatMessage[] {
  let end = conversation.length
  while (end > 0) {
    const last = conversation[end - 1]
    if (last.role !== 'assistant' || getTextFromParts(last.parts).trim().length > 0) {
      break
    }
    end--
  }
  return end === conversation.length ? conversation : conversation.slice(0, end)
}

function commitConversation(
  chatId: string,
  conversation: ChatMessage[],
  options: SessionCommitOptions = {}
): ChatMessage[] {
  const nextConversation = options.trimTrailingAssistant
    ? dropTrailingEmptyAssistantMessages(conversation)
    : conversation

  const chatState = useChatStore.getState()
  if (!chatState.getChatById(chatId)) {
    return nextConversation
  }

  chatState.commitConversation(chatId, nextConversation, {
    persist: true,
    updateMeta: options.updateMeta,
    resetTitle: options.resetTitle,
    personaName: options.personaName
  })

  return nextConversation
}

function deriveStreamPhase({
  isLoading,
  messages,
  hasPendingToolCall
}: StreamPhaseParams): ChatStreamPhase {
  if (!isLoading) {
    return 'idle'
  }

  const pendingAssistantMessage = messages.length > 0 ? messages[messages.length - 1] : undefined
  const pendingAssistantHasText =
    pendingAssistantMessage?.role === 'assistant' &&
    getTextFromParts(pendingAssistantMessage.parts).trim().length > 0

  if (pendingAssistantHasText) {
    return 'streaming'
  }

  return hasPendingToolCall ? 'tool-calling' : 'thinking'
}

async function sendUserMessage({
  chatId,
  payload,
  prepareSend,
  sendMessage,
  setComposerError,
  resetToolCallPhase
}: SendUserMessageParams): Promise<boolean> {
  const prepared = prepareSend(payload)
  if ('error' in prepared) {
    setComposerError(prepared.error)
    return false
  }

  try {
    setComposerError(null)
    resetToolCallPhase()
    preloadMarkdown()

    const userMessage: ChatMessage = {
      id: generateId(),
      createdAt: new Date(),
      role: 'user',
      parts: prepared.parts
    }

    const messages = useChatStore.getState().getMessagesForChat(chatId)
    commitConversation(chatId, [...messages, userMessage], { updateMeta: true })

    await sendMessage(userMessage, {
      body: { prompt: prepared.personaPrompt }
    })
    return true
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return true
    }
    setComposerError(getComposerErrorMessage(err))
    console.error(err)
    return false
  }
}

export function useChatSession(chatId: string): UseChatSessionReturn {
  const getMessagesForChat = useChatStore(selectGetMessagesForChat)
  const isChatHydrated = useChatStore(selectIsChatHydrated)

  const [sessionError, setSessionError] = useState<ChatSessionError | null>(null)
  const [hasPendingToolCall, setHasPendingToolCall] = useState(false)
  const [transport] = useState(createChatTransport)
  const [initialMessages] = useState(() => getMessagesForChat(chatId))
  const resetToolCallPhase = useCallback(() => {
    setHasPendingToolCall(false)
  }, [])

  const commitMessages = useCallback(
    (conversation: ChatMessage[]) => {
      return commitConversation(chatId, conversation)
    },
    [chatId]
  )

  const commitTrimmedMessages = useCallback(
    (conversation: ChatMessage[]) => {
      return commitConversation(chatId, conversation, { trimTrailingAssistant: true })
    },
    [chatId]
  )

  // Persist only — metadata (updatedAt, title) is handled by commitConversation pre-send.
  const handleFinish = useCallback(
    ({ messages: finalMessages, isAbort }: { messages: ChatMessage[]; isAbort: boolean }) => {
      resetToolCallPhase()
      if (isAbort) {
        return commitTrimmedMessages(finalMessages)
      }

      commitMessages(finalMessages)
    },
    [commitMessages, commitTrimmedMessages, resetToolCallPhase]
  )

  const handleError = useCallback(
    (err: Error) => {
      resetToolCallPhase()
      console.error(err)
    },
    [resetToolCallPhase]
  )

  const handleToolCall = useCallback(() => {
    setHasPendingToolCall(true)
  }, [])

  const { messages, setMessages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    id: chatId,
    messages: initialMessages,
    transport,
    experimental_throttle: CHAT_STREAM_THROTTLE_MS,
    onToolCall: handleToolCall,
    onFinish: handleFinish,
    onError: handleError
  })

  const isLoading = isStreamingStatus(status)
  const streamPhase = useMemo<ChatStreamPhase>(() => {
    return deriveStreamPhase({
      isLoading,
      messages,
      hasPendingToolCall
    })
  }, [hasPendingToolCall, isLoading, messages])

  useEffect(() => {
    if (!error) return
    setMessages(commitTrimmedMessages)
  }, [commitTrimmedMessages, error, setMessages])

  const setComposerError: Dispatch<SetStateAction<string | null>> = useCallback(
    (nextComposerError) => {
      setSessionError((currentError) => {
        const currentComposerError =
          currentError?.source === 'composer' ? currentError.message : null
        const resolvedComposerError =
          typeof nextComposerError === 'function'
            ? nextComposerError(currentComposerError)
            : nextComposerError

        if (resolvedComposerError != null) {
          return { source: 'composer', message: resolvedComposerError }
        }

        if (currentError?.source === 'composer') {
          return null
        }

        return currentError
      })
    },
    []
  )

  const isDismissedActiveStreamError =
    sessionError?.source === 'dismissed-stream' && sessionError.error === error
  const streamError =
    sessionError?.source === 'composer' || !error || isDismissedActiveStreamError
      ? null
      : error.message
  const composerError = sessionError?.source === 'composer' ? sessionError.message : null

  const prepareSend = useCallback(
    ({ text, uploadedImages, uploadedDocuments }: ChatComposerPayload): PreparedSendResult => {
      const chatState = useChatStore.getState()
      if (!chatState.isChatHydrated) {
        return {
          error: 'Setting up your chat. Please wait a moment.'
        }
      }

      const chat = chatState.getChatById(chatId)
      if (!chat) {
        return {
          error: 'Chat not found. Please try again.'
        }
      }

      const persona = chat.personaId
        ? usePersonaStore.getState().getPersonaById(chat.personaId)
        : undefined
      const personaPrompt = persona?.prompt.trim() || DefaultPersona.prompt
      if (!personaPrompt) {
        return {
          error: 'This persona is missing a prompt. Please edit it and try again.'
        }
      }

      const parts = buildUserMessageParts(text, uploadedImages, uploadedDocuments)
      if (parts.length === 0) {
        return {
          error: 'Please enter a message or upload a file to continue.'
        }
      }

      if (isStreamingStatus(status)) {
        return {
          error: 'Message is already sending. Please wait a moment.'
        }
      }

      return {
        parts,
        personaPrompt
      }
    },
    [chatId, status]
  )

  const stopStream = useCallback(() => {
    resetToolCallPhase()
    stop()
  }, [resetToolCallPhase, stop])

  const handleSend = useCallback(
    (payload: ChatComposerPayload) => {
      return sendUserMessage({
        chatId,
        payload,
        prepareSend,
        sendMessage,
        setComposerError,
        resetToolCallPhase
      })
    },
    [chatId, prepareSend, resetToolCallPhase, sendMessage, setComposerError]
  )

  const handleStop = useCallback(() => {
    stopStream()
    setMessages(commitTrimmedMessages)
  }, [commitTrimmedMessages, setMessages, stopStream])

  const handleClearMessages = useCallback(() => {
    if (isLoading) return

    stopStream()
    setMessages([])
    const chatState = useChatStore.getState()
    const chat = chatState.getChatById(chatId)
    const persona = chat?.personaId
      ? usePersonaStore.getState().getPersonaById(chat.personaId)
      : undefined
    commitConversation(chatId, [], {
      resetTitle: true,
      personaName: persona?.name
    })
  }, [chatId, isLoading, setMessages, stopStream])

  const handleDismissError = useCallback(() => {
    if (!error) {
      return
    }

    setSessionError((currentError) => {
      if (currentError?.source === 'composer') {
        return currentError
      }

      if (currentError?.source === 'dismissed-stream' && currentError.error === error) {
        return currentError
      }

      return { source: 'dismissed-stream', error }
    })
  }, [error])

  return {
    messages,
    status,
    streamPhase,
    isLoading,
    isChatHydrated,
    streamError,
    composerError,
    setComposerError,
    handleSend,
    handleStop,
    handleClearMessages,
    handleDismissError
  }
}

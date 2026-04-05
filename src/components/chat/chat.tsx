'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { ChatComposer, type ChatComposerHandle } from '@/components/chat/chat-composer'
import { ChatSessionProvider } from '@/components/chat/chat-session-context'
import { MessageList } from '@/components/chat/message-list'
import { Separator } from '@/components/ui/separator'
import { useChatSession } from '@/hooks/useChatSession'
import { isMobileViewport } from '@/lib/viewport'
import { selectCurrentChatId, selectIsChatHydrated, useChatStore } from '@/store/chat-store'
import { Loader2 } from 'lucide-react'
import { StickToBottom } from 'use-stick-to-bottom'

const CHAT_COLUMN_MAX_WIDTH = 'max-w-[60rem]'
const SAFE_AREA_HORIZONTAL_PADDING =
  'pr-[max(env(safe-area-inset-right),1rem)] pl-[max(env(safe-area-inset-left),1rem)] md:pr-[max(env(safe-area-inset-right),1.5rem)] md:pl-[max(env(safe-area-inset-left),1.5rem)] lg:pr-[max(env(safe-area-inset-right),2rem)] lg:pl-[max(env(safe-area-inset-left),2rem)]'
const CHAT_COLUMN_CLASS = `@container/chat mx-auto w-full ${CHAT_COLUMN_MAX_WIDTH} ${SAFE_AREA_HORIZONTAL_PADDING}`
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotionPreference(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  mediaQuery.addEventListener('change', onChange)

  return () => {
    mediaQuery.removeEventListener('change', onChange)
  }
}

function getReducedMotionPreferenceSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function LoadingIndicator(): React.JSX.Element {
  return (
    <Loader2 className="text-muted-foreground size-4 animate-spin motion-reduce:animate-none" />
  )
}

function ActiveChat({
  chatId,
  isChatHydrated
}: {
  chatId: string
  isChatHydrated: boolean
}): React.JSX.Element {
  const composerRef = useRef<ChatComposerHandle>(null)

  const {
    messages,
    status,
    streamPhase,
    isLoading,
    streamError,
    composerError,
    setComposerError,
    handleSend,
    handleStop,
    handleClearMessages,
    handleDismissError
  } = useChatSession(chatId)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotionPreference,
    getReducedMotionPreferenceSnapshot,
    () => false
  )
  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'

  useEffect(() => {
    if (!isMobileViewport()) {
      composerRef.current?.focus()
    }
  }, [chatId])

  return (
    <ChatSessionProvider
      messages={messages}
      streamStatus={status}
      streamPhase={streamPhase}
      error={streamError}
      onDismissError={handleDismissError}
      isChatHydrated={isChatHydrated}
      hasActiveChat={Boolean(chatId)}
      isSending={isLoading}
      composerError={composerError}
      setComposerError={setComposerError}
      onClear={handleClearMessages}
      onStop={handleStop}
      onSend={handleSend}
    >
      {messages.length === 0 ? (
        <div className="bg-background text-foreground flex min-h-0 flex-1 flex-col items-center justify-center pr-[max(env(safe-area-inset-right),1rem)] pl-[max(env(safe-area-inset-left),1rem)]">
          <div className="relative flex w-full max-w-2xl -translate-y-6 flex-col gap-10 text-center">
            <div className="flex flex-col gap-5">
              <h1 className="text-foreground text-3xl font-medium tracking-tight text-balance md:text-4xl lg:text-5xl">
                How can I help?
              </h1>
            </div>
            <ChatComposer ref={composerRef} showClear={false} />
          </div>
        </div>
      ) : (
        <div className="bg-background text-foreground relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <h1 className="sr-only">Chat conversation</h1>
          <StickToBottom
            className="relative min-h-0 flex-1 overflow-y-auto"
            initial={scrollBehavior}
            resize={scrollBehavior}
          >
            <StickToBottom.Content className="relative flex min-h-full flex-col">
              <div className={`${CHAT_COLUMN_CLASS} relative flex-1 pt-5 pb-4`}>
                <MessageList />
              </div>
            </StickToBottom.Content>
          </StickToBottom>
          <div className="bg-background relative shrink-0">
            <Separator className="bg-border/60" />
            <div
              className={`${CHAT_COLUMN_CLASS} pt-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]`}
            >
              <ChatComposer ref={composerRef} showClear={true} />
            </div>
          </div>
        </div>
      )}
    </ChatSessionProvider>
  )
}

function Chat(): React.JSX.Element {
  const currentChatId = useChatStore(selectCurrentChatId)
  const isChatHydrated = useChatStore(selectIsChatHydrated)

  if (!isChatHydrated || !currentChatId) {
    return (
      <div className="flex h-full min-h-[60dvh] flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="text-primary/20 font-serif text-6xl select-none md:text-7xl">
            &#10087;
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 size-16 rounded-full blur-xl" />
          </div>
        </div>
        <div
          className="text-muted-foreground flex flex-col items-center gap-4"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <LoadingIndicator />
          <span className="text-sm tracking-wide text-balance">Preparing your workspace...</span>
        </div>
      </div>
    )
  }

  return <ActiveChat key={currentChatId} chatId={currentChatId} isChatHydrated={isChatHydrated} />
}

export default Chat

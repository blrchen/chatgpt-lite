import { memo, useCallback, useDeferredValue, useId, useMemo, type ReactNode } from 'react'
import { CopyStatusAnnouncement } from '@/components/accessibility/copy-status-announcement'
import {
  InlineCitationBadge,
  SourcesList,
  SourcesToggle,
  useSourcesExpanded
} from '@/components/chat/message-sources-view'
import { renderUserParts } from '@/components/chat/message-user-parts'
import { AppIconButton } from '@/components/common/app-button'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import { Markdown } from '@/components/markdown/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useInViewport } from '@/hooks/useInViewport'
import { getTextFromParts, type ChatStreamPhase } from '@/lib/chat-utils'
import type { ChatMessage, ChatMessageSource } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, Copy, Loader2, Search } from 'lucide-react'

import { getSourcesFromParts, stripTrailingSourceMarkdownLinks } from './message-sources'

interface MessageProps {
  message: ChatMessage
  isThinking?: boolean
  streamPhase?: ChatStreamPhase
}

type SourceUrlMap = Map<string, { index: number; source: ChatMessageSource }>

function StreamStatusIndicator({
  icon,
  label
}: {
  icon: ReactNode
  label: string
}): React.JSX.Element {
  return (
    <span
      className="text-muted-foreground inline-flex items-center gap-2 text-sm leading-relaxed"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  )
}

function StreamingCursor(): React.JSX.Element {
  const [cursorRef, isInView] = useInViewport<HTMLDivElement>()

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none absolute right-3 bottom-3"
    >
      <Skeleton
        className={cn(
          'bg-card-foreground/50 h-4 w-1 rounded-full',
          isInView ? 'motion-reduce:animate-none' : 'animate-none'
        )}
      />
    </div>
  )
}

function UserMessage({ message }: MessageProps): React.JSX.Element {
  return (
    <div className="flex w-full justify-end">
      <div className="flex max-w-[92%] min-w-0 flex-col items-end md:max-w-[88%]">
        <div className="bg-secondary text-secondary-foreground max-w-full rounded-2xl rounded-br-md px-4 py-3 break-words">
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            {renderUserParts(message.parts)}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AssistantMessageBodyProps {
  isThinking?: boolean
  phase?: ChatStreamPhase
  hasRenderedText: boolean
  markdownSource: string
  showCursor: boolean
  sourceUrlMap: SourceUrlMap
  renderLinkAnnotation: (href: string) => ReactNode | null
}

function AssistantMessageBody({
  isThinking,
  phase,
  hasRenderedText,
  markdownSource,
  showCursor,
  sourceUrlMap,
  renderLinkAnnotation
}: AssistantMessageBodyProps): React.JSX.Element {
  const showWaitingState = isThinking && !hasRenderedText
  const showToolCallIndicator = showWaitingState && phase === 'tool-calling'
  const showThinkingIndicator = showWaitingState && !showToolCallIndicator
  let bodyContent: ReactNode

  if (showThinkingIndicator) {
    bodyContent = (
      <StreamStatusIndicator
        icon={<Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
        label="Thinking"
      />
    )
  } else if (showToolCallIndicator) {
    bodyContent = (
      <StreamStatusIndicator
        icon={<Search className="size-3.5" aria-hidden="true" />}
        label="Using tools"
      />
    )
  } else {
    bodyContent = (
      <Markdown renderLinkAnnotation={sourceUrlMap.size > 0 ? renderLinkAnnotation : undefined}>
        {markdownSource}
      </Markdown>
    )
  }

  return (
    <div className="text-foreground relative max-w-full break-words">
      <div className="text-base leading-relaxed">{bodyContent}</div>
      {showCursor && <StreamingCursor />}
    </div>
  )
}

interface AssistantMessageActionsProps {
  hasCopyText: boolean
  copied: boolean
  onCopy: () => void
  sources: ChatMessageSource[]
  sourcesExpanded: boolean
  onToggleSources: () => void
  sourceListId: string
}

function AssistantMessageActions({
  hasCopyText,
  copied,
  onCopy,
  sources,
  sourcesExpanded,
  onToggleSources,
  sourceListId
}: AssistantMessageActionsProps): React.JSX.Element | null {
  if (!hasCopyText && sources.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-1 flex w-full max-w-full items-center">
        {hasCopyText && (
          <>
            <ButtonWithTooltip label={copied ? 'Copied' : 'Copy'}>
              <AppIconButton
                variant="ghost"
                size="icon-sm"
                touch={false}
                mutedDisabled={false}
                className={cn(
                  'text-muted-foreground size-11 transition-colors duration-200 md:size-7',
                  copied ? 'text-accent-foreground' : 'hover:text-foreground'
                )}
                disabled={copied}
                onClick={onCopy}
                aria-label={copied ? 'Message copied to clipboard' : 'Copy to clipboard'}
              >
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              </AppIconButton>
            </ButtonWithTooltip>
            <CopyStatusAnnouncement copied={copied} message="Message copied to clipboard." />
          </>
        )}
        <SourcesToggle
          sources={sources}
          expanded={sourcesExpanded}
          onToggle={onToggleSources}
          sourceListId={sourceListId}
        />
      </div>
      <SourcesList sources={sources} expanded={sourcesExpanded} sourceListId={sourceListId} />
    </>
  )
}

function AssistantMessage({ message, isThinking, streamPhase }: MessageProps): React.JSX.Element {
  const parts = message.parts
  const sources = useMemo(() => getSourcesFromParts(parts), [parts])
  const { copy, copied } = useCopyToClipboard()
  const { expanded: sourcesExpanded, toggle: toggleSources } = useSourcesExpanded()
  const sourceListId = useId()

  const fullText = useMemo(() => getTextFromParts(parts), [parts])
  const deferredText = useDeferredValue(fullText)
  const markdownSource = useMemo(() => {
    return sources.length > 0
      ? stripTrailingSourceMarkdownLinks(deferredText, sources)
      : deferredText
  }, [deferredText, sources])
  const sourceUrlMap = useMemo<SourceUrlMap>(() => {
    const urlMap: SourceUrlMap = new Map()

    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index]

      if (source.type === 'url') {
        urlMap.set(source.url, { index, source })
      }
    }

    return urlMap
  }, [sources])
  const renderLinkAnnotation = useCallback(
    function renderLinkAnnotation(href: string): ReactNode | null {
      const match = sourceUrlMap.get(href)

      if (!match) {
        return null
      }

      return <InlineCitationBadge index={match.index} source={match.source} />
    },
    [sourceUrlMap]
  )

  const hasCopyText = fullText.trim().length > 0
  const hasRenderedText = deferredText.trim().length > 0
  const phase = isThinking ? (streamPhase ?? 'thinking') : undefined
  const showCursor = Boolean(isThinking && phase === 'streaming' && hasRenderedText)

  const handleCopy = useCallback(() => {
    void copy(fullText)
  }, [copy, fullText])

  return (
    <div className="flex w-full justify-start">
      <div className="flex w-full max-w-full min-w-0 flex-col items-start">
        <AssistantMessageBody
          isThinking={isThinking}
          phase={phase}
          hasRenderedText={hasRenderedText}
          markdownSource={markdownSource}
          showCursor={showCursor}
          sourceUrlMap={sourceUrlMap}
          renderLinkAnnotation={renderLinkAnnotation}
        />
        <AssistantMessageActions
          hasCopyText={hasCopyText}
          copied={copied}
          onCopy={handleCopy}
          sources={sources}
          sourcesExpanded={sourcesExpanded}
          onToggleSources={toggleSources}
          sourceListId={sourceListId}
        />
      </div>
    </div>
  )
}

function MessageComponent({ message, isThinking, streamPhase }: MessageProps): React.JSX.Element {
  if (message.role === 'user') {
    return <UserMessage message={message} />
  }

  return <AssistantMessage message={message} isThinking={isThinking} streamPhase={streamPhase} />
}

export const Message = memo(MessageComponent)
Message.displayName = 'Message'

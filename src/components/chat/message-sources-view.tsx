import { useCallback, useState } from 'react'
import Image from 'next/image'
import { getDomain, getSourceTitle } from '@/components/chat/message-sources'
import { AppButton } from '@/components/common/app-button'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { ChatMessageSource } from '@/lib/types'
import { cn, truncateFilenameMiddle } from '@/lib/utils'
import { ChevronDown, FileText, Globe } from 'lucide-react'

function Favicon({ domain }: { domain: string }): React.JSX.Element {
  const [hasError, setHasError] = useState(domain.length === 0)
  const fallbackLabel = domain.charAt(0).toUpperCase() || '?'

  if (hasError) {
    return (
      <span className="bg-muted text-muted-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold uppercase">
        {fallbackLabel}
      </span>
    )
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
      alt=""
      width={32}
      height={32}
      unoptimized
      loading="lazy"
      sizes="32px"
      className="size-8 shrink-0 rounded-md"
      onError={() => setHasError(true)}
    />
  )
}

export function InlineCitationBadge({
  index,
  source
}: {
  index: number
  source: ChatMessageSource
}): React.JSX.Element {
  const title = getSourceTitle(source)
  const url = source.type === 'url' ? source.url : ''
  const domain = url ? getDomain(url) : ''
  const documentSubtitle =
    source.type === 'document'
      ? source.filename
        ? truncateFilenameMiddle(source.filename, 28)
        : source.mediaType
      : ''

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Source ${index + 1}: ${title}`}
          className="bg-accent text-accent-foreground hover:bg-accent/90 ml-1 size-4 rounded-full align-super text-[10px] font-medium transition-colors duration-200"
        >
          {index + 1}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        sideOffset={8}
        className="flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 p-3"
      >
        <div className="flex flex-col gap-1.5">
          <div className="line-clamp-2 text-sm font-semibold">{title}</div>
          {source.type === 'url' ? (
            <>
              {domain ? <div className="text-muted-foreground text-xs">{domain}</div> : null}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary focus-visible:ring-ring/50 focus-visible:ring-offset-background block rounded-sm text-xs break-all underline underline-offset-2 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {url}
              </a>
            </>
          ) : (
            <>
              {documentSubtitle ? (
                <div className="text-muted-foreground text-xs break-all">{documentSubtitle}</div>
              ) : null}
              <div className="text-muted-foreground text-xs">{source.mediaType}</div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function useSourcesExpanded() {
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded((v) => !v), [])
  return { expanded, toggle }
}

export function SourcesToggle({
  sources,
  expanded,
  onToggle,
  sourceListId
}: {
  sources: ChatMessageSource[]
  expanded: boolean
  onToggle: () => void
  sourceListId: string
}): React.JSX.Element | null {
  if (sources.length === 0) return null

  const sourceCountLabel = `${sources.length} Source${sources.length === 1 ? '' : 's'}`

  return (
    <AppButton
      type="button"
      variant="ghost"
      size="sm"
      touch={false}
      mutedDisabled={false}
      aria-expanded={expanded}
      aria-controls={sourceListId}
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground h-11 items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium md:h-7 md:px-1 md:py-0.5"
    >
      <Globe data-icon="inline-start" aria-hidden="true" />
      <span>{sourceCountLabel}</span>
      <ChevronDown
        data-icon="inline-end"
        className={cn(
          'transition-transform duration-200 motion-reduce:transition-none',
          expanded && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </AppButton>
  )
}

export function SourcesList({
  sources,
  expanded,
  sourceListId
}: {
  sources: ChatMessageSource[]
  expanded: boolean
  sourceListId: string
}): React.JSX.Element | null {
  if (sources.length === 0) return null

  return (
    <div
      className={cn(
        'grid w-full max-w-full transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      )}
    >
      <div className="overflow-hidden">
        <div id={sourceListId} aria-hidden={!expanded} className="mt-1.5 flex flex-col gap-2">
          {sources.map((source) => {
            const title = getSourceTitle(source)

            if (source.type === 'url') {
              const domain = getDomain(source.url)

              return (
                <a
                  key={source.sourceId}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={expanded ? undefined : -1}
                  className="focus-visible:ring-ring/50 focus-visible:ring-offset-background bg-card/70 hover:bg-accent/35 flex min-h-14 w-full max-w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Favicon key={domain} domain={domain} />
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground line-clamp-1 text-sm leading-tight font-semibold">
                      {title}
                    </div>
                    <div className="text-muted-foreground mt-1 truncate text-xs">
                      {domain || source.url}
                    </div>
                  </div>
                </a>
              )
            }

            return (
              <div
                key={source.sourceId}
                className="bg-card/70 flex min-h-14 w-full max-w-full items-center gap-3 rounded-xl px-3 py-2.5"
              >
                <span className="bg-muted text-muted-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground line-clamp-1 text-sm leading-tight font-semibold">
                    {title}
                  </div>
                  <div className="text-muted-foreground mt-1 truncate text-xs">
                    {source.filename
                      ? truncateFilenameMiddle(source.filename, 36)
                      : source.mediaType}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

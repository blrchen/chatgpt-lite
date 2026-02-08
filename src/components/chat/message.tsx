'use client'

import { memo, useCallback, useDeferredValue } from 'react'
import { Markdown } from '@/components/markdown'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Check, Copy, ExternalLink, FileText, Wrench } from 'lucide-react'

import { UIMessage } from './interface'

// Import types from AI SDK
type UIMessagePart = NonNullable<UIMessage['parts']>[number]

export interface MessageProps {
  message: UIMessage
}

// Render individual UIMessage parts
const renderPart = (part: UIMessagePart, index: number) => {
  // Text part
  if (part.type === 'text') {
    return (
      <span key={index} className="whitespace-pre-wrap">
        {part.text}
      </span>
    )
  }

  // Reasoning part (e.g., from models like o1)
  if (part.type === 'reasoning') {
    return (
      <div key={index} className="bg-muted/30 my-2 rounded-lg border-l-4 border-blue-500 p-3">
        <div className="mb-1 text-xs font-semibold text-blue-600">💭 Reasoning</div>
        <div className="text-muted-foreground text-sm italic">{part.text}</div>
      </div>
    )
  }

  // File part (images, documents, etc.)
  if (part.type === 'file') {
    if (part.mediaType?.startsWith('image/')) {
      return (
        <img
          key={index}
          src={part.url}
          alt={part.filename || 'Image'}
          className="mt-2 max-w-full rounded-lg"
          style={{ maxHeight: '300px' }}
        />
      )
    }
    // Other file types
    return (
      <div key={index} className="border-border bg-muted/50 mt-2 flex items-center gap-2 rounded-lg border p-3">
        <FileText className="text-muted-foreground size-4" />
        <span className="text-sm">{part.filename || 'File'}</span>
        <span className="text-muted-foreground text-xs">({part.mediaType})</span>
      </div>
    )
  }

  // Step boundary
  if (part.type === 'step-start') {
    return (
      <div key={index} className="border-border my-3 border-t" />
    )
  }

  // Tool calls
  if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
    const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace('tool-', '')
    const hasOutput = 'state' in part && (part.state === 'output-available' || part.state === 'output-error')

    return (
      <div key={index} className="bg-amber-50 dark:bg-amber-950/20 my-2 rounded-lg border border-amber-200 dark:border-amber-800 p-3">
        <div className="mb-1 flex items-center gap-2">
          <Wrench className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Tool: {toolName}
          </span>
          {'state' in part && (
            <span className="text-muted-foreground text-[10px]">({part.state})</span>
          )}
        </div>
        {hasOutput && 'output' in part && (
          <div className="text-muted-foreground mt-2 text-xs">
            <pre className="overflow-x-auto">{JSON.stringify(part.output, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  // Custom data parts
  if (part.type.startsWith('data-')) {
    const dataPart = part as { type: string; data: unknown }
    return (
      <div key={index} className="bg-muted/50 my-2 rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">
          <strong>Data ({dataPart.type}):</strong>
          <pre className="mt-1 overflow-x-auto">{JSON.stringify(dataPart.data, null, 2)}</pre>
        </div>
      </div>
    )
  }

  // Unknown part type
  return null
}

const getTextFromParts = (parts: UIMessagePart[]): string => {
  return parts
    .filter((part) => part.type === 'text' || part.type === 'reasoning')
    .map((part) => (part as { text: string }).text)
    .join('\n')
}

// Extract sources from metadata
const getSourcesFromMetadata = (metadata: unknown): SourceItem[] => {
  const sources: SourceItem[] = []

  // Type guard for metadata
  if (!metadata || typeof metadata !== 'object') {
    return sources
  }

  const meta = metadata as Record<string, unknown>

  // Check for sources in metadata
  if (meta.sources && Array.isArray(meta.sources)) {
    sources.push(...meta.sources)
  }

  // Check for annotations (Claude native format)
  if (meta.annotations && Array.isArray(meta.annotations)) {
    meta.annotations.forEach((annotation: unknown) => {
      if (
        annotation &&
        typeof annotation === 'object' &&
        'type' in annotation &&
        annotation.type === 'url_citation'
      ) {
        const ann = annotation as Record<string, unknown>
        sources.push({
          type: 'url_citation',
          sourceId: (ann.sourceId as string) || `citation-${sources.length}`,
          url: ann.url as string,
          title: ann.title as string,
          start_index: ann.start_index as number,
          end_index: ann.end_index as number
        })
      }
    })
  }

  return sources
}

// Extract source parts from message parts
const getSourcePartsFromParts = (parts: UIMessagePart[]) => {
  return parts.filter(
    (part) => part.type === 'source-url' || part.type === 'source-document'
  )
}

// Type for source items (can come from parts or metadata)
type SourceItem = {
  type?: string
  sourceId?: string
  url?: string
  title?: string
  documentId?: string
  text?: string
  reference?: string
  start_index?: number
  end_index?: number
}

const MessageComponent = (props: MessageProps) => {
  const { role, parts = [], metadata } = props.message
  const deferredParts = useDeferredValue(parts)
  const isUser = role === 'user'
  const { copy, copied } = useCopyToClipboard()

  // Extract text content for copying
  const textContent = getTextFromParts(parts)

  // Get sources from both parts and metadata
  const sourceParts = getSourcePartsFromParts(parts) as SourceItem[]
  const metadataSources = getSourcesFromMetadata(metadata)

  // Deduplicate sources by sourceId to avoid duplicate keys
  const allSourcesMap = new Map<string, SourceItem>()
  const allSourcesArray: SourceItem[] = []

  // Add parts sources first
  sourceParts.forEach((source, idx) => {
    const key = source.sourceId || `part-${idx}`
    if (!allSourcesMap.has(key)) {
      allSourcesMap.set(key, source)
      allSourcesArray.push(source)
    }
  })

  // Then add metadata sources (skip if same sourceId)
  metadataSources.forEach((source, idx) => {
    const key = source.sourceId || `meta-${idx}`
    if (!allSourcesMap.has(key)) {
      allSourcesMap.set(key, source)
      allSourcesArray.push(source)
    }
  })

  const allSources: SourceItem[] = allSourcesArray

  const onCopy = useCallback(() => {
    void copy(textContent)
  }, [textContent, copy])

  // Separate content parts from source parts
  const contentParts = parts.filter(
    (part) => part.type !== 'source-url' && part.type !== 'source-document'
  )

  return (
    <div className={`group/message flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 wrap-break-word ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground border-border border'
          }`}
        >
          {isUser ? (
            <div className="leading-relaxed">
              {contentParts.map((part, index) => renderPart(part, index))}
            </div>
          ) : (
            <div className="leading-relaxed">
              <Markdown>{getTextFromParts(deferredParts)}</Markdown>
              {/* Render non-text parts after markdown */}
              {contentParts
                .filter((part) => part.type !== 'text' && part.type !== 'reasoning')
                .map((part, index) => renderPart(part, index))}
            </div>
          )}
        </div>

        {/* Sources from both parts and metadata */}
        {!isUser && allSources.length > 0 && (
          <div className="mt-3 w-full space-y-2">
            <h4 className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
              <ExternalLink className="size-3" />
              参考来源
            </h4>
            <div className="space-y-1.5">
              {allSources.map((source: SourceItem, idx: number) => {
                const url = source.url
                const title = (() => {
                  if (source.title) return source.title
                  if (source.type === 'source-document')
                    return `Document: ${source.documentId || source.title || 'Unknown'}`
                  if (source.type === 'citation') return source.text
                  return url || 'Unknown source'
                })()

                const Element = url ? 'a' : 'div'
                const linkProps = url
                  ? {
                      href: url,
                      target: '_blank' as const,
                      rel: 'noopener noreferrer'
                    }
                  : {}

                // Generate unique key using multiple fields
                const uniqueKey =
                  source.sourceId ||
                  `source-${idx}-${source.type}-${source.url || source.title || idx}`

                return (
                  <Element
                    key={uniqueKey}
                    {...linkProps}
                    className="border-border bg-background/50 hover:bg-accent/50 group/source flex items-start gap-2 rounded-lg border px-3 py-2 text-xs transition-colors"
                  >
                    <span className="text-muted-foreground shrink-0 font-medium">[{idx + 1}]</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground group-hover/source:text-primary line-clamp-1 font-medium">
                        {title}
                      </div>
                      {url && (
                        <div className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px]">
                          {url}
                        </div>
                      )}
                      {source.type === 'citation' && 'reference' in source && source.reference && (
                        <div className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px]">
                          {source.reference}
                        </div>
                      )}
                    </div>
                    {url && (
                      <ExternalLink className="text-muted-foreground mt-0.5 size-3 shrink-0" />
                    )}
                  </Element>
                )
              })}
            </div>
          </div>
        )}

        {!isUser && textContent && (
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

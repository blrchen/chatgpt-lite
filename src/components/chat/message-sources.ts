import type { ChatMessagePart, ChatMessageSource } from '@/lib/types'
import { truncateFilenameMiddle } from '@/lib/utils'

const TRAILING_SOURCE_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)\s*$/

function getSourceKey(source: ChatMessageSource): string {
  if (source.type === 'url') {
    return `url:${source.url}`
  }

  return `document:${source.mediaType}:${source.filename ?? ''}:${source.title}`
}

function dedupeSources(sources: ChatMessageSource[]): ChatMessageSource[] {
  const seen = new Set<string>()
  const deduped: ChatMessageSource[] = []

  for (const source of sources) {
    const key = getSourceKey(source)

    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(source)
  }

  return deduped
}

export function getSourcesFromParts(parts: ChatMessagePart[]): ChatMessageSource[] {
  const sourcesFromParts: ChatMessageSource[] = []

  for (const part of parts) {
    switch (part.type) {
      case 'source-url':
        sourcesFromParts.push({
          type: 'url',
          sourceId: part.sourceId,
          url: part.url,
          title: part.title
        })
        break
      case 'source-document':
        sourcesFromParts.push({
          type: 'document',
          sourceId: part.sourceId,
          mediaType: part.mediaType,
          title: part.title,
          filename: part.filename
        })
        break
    }
  }

  return dedupeSources(sourcesFromParts)
}

export function getSourceTitle(source: ChatMessageSource): string {
  if (source.type === 'url') {
    return source.title || source.url
  }

  if (source.filename) {
    return source.title || `Document: ${truncateFilenameMiddle(source.filename, 32)}`
  }

  return source.title || 'Document'
}

export function stripTrailingSourceMarkdownLinks(
  text: string,
  sources: ChatMessageSource[]
): string {
  const urls = new Set<string>()
  for (const source of sources) {
    if (source.type === 'url') {
      urls.add(source.url)
    }
  }

  if (urls.size === 0) {
    return text
  }

  let working = text.trimEnd()
  let strippedCount = 0

  while (true) {
    const match = working.match(TRAILING_SOURCE_LINK_PATTERN)
    if (!match || !urls.has(match[2])) {
      break
    }

    strippedCount++
    working = working.slice(0, working.length - match[0].length).trimEnd()
  }

  // Keep single trailing links in the main answer (they are often intentional).
  return strippedCount >= 2 ? working : text
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

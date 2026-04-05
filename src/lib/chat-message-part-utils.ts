const DATA_URL_REGEX = /^data:([^;]+);base64,(.+)$/i
const DATA_URL_PREFIX_REGEX = /^data:/i

export type ParsedBase64DataUrl = {
  mimeType?: string
  base64: string
}

export function normalizeMediaType(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : undefined
}

export function isImageMediaType(value: string): boolean {
  return normalizeMediaType(value)?.startsWith('image/') === true
}

export function isDataUrl(value: string): boolean {
  return DATA_URL_PREFIX_REGEX.test(value)
}

export function parseBase64DataUrl(dataUrl: string): ParsedBase64DataUrl | null {
  const match = dataUrl.match(DATA_URL_REGEX)
  if (!match) {
    return null
  }

  const mimeType = normalizeMediaType(match[1])
  return { mimeType, base64: match[2] }
}

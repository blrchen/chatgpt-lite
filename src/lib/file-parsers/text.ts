import type { ParsedFile } from '@/lib/file-parser'
import { getNormalizedFileMimeType } from '@/lib/file-parsers/shared'

export async function parseTextDocument(file: File): Promise<ParsedFile> {
  const text = await file.text()
  const fallbackMimeType = file.name.toLowerCase().endsWith('.md') ? 'text/markdown' : 'text/plain'

  return {
    name: file.name,
    content: text,
    mimeType: getNormalizedFileMimeType(file, fallbackMimeType)
  }
}

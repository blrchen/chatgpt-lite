import type { ParsedFile } from '@/lib/file-parser'
import { getNormalizedFileMimeType } from '@/lib/file-parsers/shared'
import { formatSizeInMB } from '@/lib/size'
import { MAX_PDF_FILE_SIZE } from '@/services/constant'

export async function parsePdfDocument(file: File): Promise<ParsedFile> {
  if (file.size > MAX_PDF_FILE_SIZE) {
    throw new Error(
      `File size (${formatSizeInMB(file.size)}) exceeds the maximum allowed size of ${formatSizeInMB(
        MAX_PDF_FILE_SIZE
      )}`
    )
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || errorData.error || 'Failed to parse PDF')
  }

  const data = await response.json()

  let content = `[PDF File: ${file.name}]\n\nPages: ${data.pages}\n\n`

  if (data.images && data.images.length > 0) {
    content += `Images found: ${data.images.length}\n\n`
  }

  content += data.content

  return {
    name: file.name,
    content,
    mimeType: getNormalizedFileMimeType(file, 'application/pdf'),
    images: data.images || []
  }
}

import type { ParsedFile } from '@/lib/file-parser'
import {
  formatRowsAsTable,
  getNormalizedFileMimeType,
  type TableCell
} from '@/lib/file-parsers/shared'

export async function parseCsvDocument(file: File): Promise<ParsedFile> {
  const { default: Papa } = await import('papaparse')
  const fallbackMimeType = 'text/csv'

  return new Promise((resolve, reject) => {
    Papa.parse<TableCell[]>(file, {
      complete: (results) => {
        let content = `[CSV File: ${file.name}]\n\n`
        if (results.data && results.data.length > 0) {
          content += formatRowsAsTable(results.data)
        }
        resolve({
          name: file.name,
          content,
          mimeType: getNormalizedFileMimeType(file, fallbackMimeType)
        })
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

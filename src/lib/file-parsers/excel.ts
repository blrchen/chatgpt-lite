import type { ParsedFile } from '@/lib/file-parser'
import {
  formatRowsAsTable,
  getNormalizedFileMimeType,
  type TableCell
} from '@/lib/file-parsers/shared'

export async function parseExcelDocument(file: File): Promise<ParsedFile> {
  const [arrayBuffer, XLSX] = await Promise.all([file.arrayBuffer(), import('xlsx')])
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const fallbackMimeType = file.name.toLowerCase().endsWith('.xls')
    ? 'application/vnd.ms-excel'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  let content = `[Excel File: ${file.name}]\n\n`

  for (const [index, sheetName] of workbook.SheetNames.entries()) {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json<TableCell[]>(worksheet, { header: 1 })

    content += `Sheet: ${sheetName}\n`
    content += '-'.repeat(50) + '\n'
    content += formatRowsAsTable(jsonData)

    if (index < workbook.SheetNames.length - 1) {
      content += '\n'
    }
  }

  return {
    name: file.name,
    content,
    mimeType: getNormalizedFileMimeType(file, fallbackMimeType)
  }
}

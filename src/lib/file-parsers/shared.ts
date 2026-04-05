export type TableCell = string | number | boolean | null | undefined
export type TableRows = TableCell[][]

export function formatRowsAsTable(rows: TableRows, addSeparatorAfterHeader = true): string {
  const lines: string[] = []
  for (const [index, row] of rows.entries()) {
    if (!Array.isArray(row)) continue
    lines.push(row.join(' | '))
    if (addSeparatorAfterHeader && index === 0) {
      lines.push('-'.repeat(50))
    }
  }
  return lines.length > 0 ? lines.join('\n') + '\n' : ''
}

export function getNormalizedFileMimeType(file: File, fallbackMimeType: string): string {
  const fileType = file.type.toLowerCase()
  if (fileType && fileType !== 'application/octet-stream') {
    return fileType
  }

  return fallbackMimeType
}

// File size limit: 10MB
const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB in bytes

function formatRowsAsTable(rows: unknown[][], addSeparatorAfterHeader = true): string {
  let content = ''
  rows.forEach((row, index) => {
    if (Array.isArray(row)) {
      content += row.join(' | ') + '\n'
      if (addSeparatorAfterHeader && index === 0) {
        content += '-'.repeat(50) + '\n'
      }
    }
  })
  return content
}

export interface PDFImage {
  pageNumber: number
  name: string
  width: number
  height: number
  dataUrl: string
}

export interface ParsedFile {
  name: string
  content: string
  mimeType: string
  images?: PDFImage[]
}

// Parse PDF file (server-side via API)
export const parsePDF = async (file: File): Promise<ParsedFile> => {
  try {
    // Check file size before uploading (10MB limit)
    if (file.size > MAX_PDF_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      throw new Error(`File size (${sizeMB}MB) exceeds the maximum allowed size of 10MB`)
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to parse PDF')
    }

    const data = await response.json()

    // Build content with text and image references
    let content = `[PDF File: ${file.name}]\n\nPages: ${data.pages}\n\n`

    // Add image summary if images exist
    if (data.images && data.images.length > 0) {
      content += `Images found: ${data.images.length}\n\n`
    }

    content += data.content

    return {
      name: file.name,
      content,
      mimeType: file.type,
      images: data.images || []
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    return {
      name: file.name,
      content: `[PDF File: ${file.name}]\n\nUnable to extract text from this PDF. The file may be:\n- Image-based (scanned) PDF requiring OCR\n- Encrypted or password-protected\n- Corrupted or in an unsupported format\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
      mimeType: file.type
    }
  }
}

// Parse TXT file
export const parseTXT = async (file: File): Promise<ParsedFile> => {
  const text = await file.text()
  return {
    name: file.name,
    content: text,
    mimeType: file.type
  }
}

// Parse CSV file
export const parseCSV = async (file: File): Promise<ParsedFile> => {
  const { default: Papa } = await import('papaparse')

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        let content = `[CSV File: ${file.name}]\n\n`
        if (results.data && results.data.length > 0) {
          content += formatRowsAsTable(results.data as unknown[][])
        }
        resolve({
          name: file.name,
          content,
          mimeType: file.type
        })
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

// Parse Excel file
export const parseExcel = async (file: File): Promise<ParsedFile> => {
  const [arrayBuffer, XLSX] = await Promise.all([file.arrayBuffer(), import('xlsx')])
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  let content = `[Excel File: ${file.name}]\n\n`

  // Process each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

    content += `Sheet: ${sheetName}\n`
    content += '-'.repeat(50) + '\n'
    content += formatRowsAsTable(jsonData)

    if (index < workbook.SheetNames.length - 1) {
      content += '\n'
    }
  })

  return {
    name: file.name,
    content,
    mimeType: file.type
  }
}

type FileParser = (file: File) => Promise<ParsedFile>

const fileTypeParsers: Array<{ test: (type: string, name: string) => boolean; parse: FileParser }> =
  [
    {
      test: (type, name) => type === 'text/plain' || name.endsWith('.txt'),
      parse: parseTXT
    },
    {
      test: (type, name) => type === 'text/csv' || name.endsWith('.csv'),
      parse: parseCSV
    },
    {
      test: (type, name) =>
        type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        type === 'application/vnd.ms-excel' ||
        name.endsWith('.xlsx') ||
        name.endsWith('.xls'),
      parse: parseExcel
    },
    {
      test: (type, name) => type === 'application/pdf' || name.endsWith('.pdf'),
      parse: parsePDF
    }
  ]

// Main file parser function
export async function parseFile(file: File): Promise<ParsedFile> {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  const parser = fileTypeParsers.find(({ test }) => test(fileType, fileName))
  if (parser) {
    return parser.parse(file)
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`)
}

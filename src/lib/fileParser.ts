'use client'

import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedFile {
  name: string
  content: string
  mimeType: string
}

// Parse PDF file (server-side via API)
export const parsePDF = async (file: File): Promise<ParsedFile> => {
  try {
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

    return {
      name: file.name,
      content: `[PDF File: ${file.name}]\n\nPages: ${data.pages}\n\n${data.content}`,
      mimeType: file.type
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
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        // Convert CSV data to formatted text
        let content = `[CSV File: ${file.name}]\n\n`

        if (results.data && results.data.length > 0) {
          // Add header row if exists
          const rows = results.data as string[][]

          // Create a simple table format
          rows.forEach((row, index) => {
            content += row.join(' | ') + '\n'
            if (index === 0) {
              // Add separator after header
              content += '-'.repeat(50) + '\n'
            }
          })
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
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  let content = `[Excel File: ${file.name}]\n\n`

  // Process each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    content += `Sheet: ${sheetName}\n`
    content += '-'.repeat(50) + '\n'

    // Convert to text format
    jsonData.forEach((row: any, rowIndex) => {
      if (Array.isArray(row)) {
        content += row.join(' | ') + '\n'
        if (rowIndex === 0) {
          content += '-'.repeat(50) + '\n'
        }
      }
    })

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

// Main file parser function
export const parseFile = async (file: File): Promise<ParsedFile> => {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  // Check by MIME type or file extension
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return parseTXT(file)
  } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    return parseCSV(file)
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileType === 'application/vnd.ms-excel' ||
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls')
  ) {
    return parseExcel(file)
  } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return parsePDF(file)
  } else {
    throw new Error(`Unsupported file type: ${fileType || fileName}`)
  }
}

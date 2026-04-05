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

type FileParser = (file: File) => Promise<ParsedFile>
type FileParserLoader = () => Promise<FileParser>

type FileTypeParser = {
  test: (type: string, name: string) => boolean
  load: FileParserLoader
}

let textParserPromise: Promise<FileParser> | null = null
let csvParserPromise: Promise<FileParser> | null = null
let excelParserPromise: Promise<FileParser> | null = null
let pdfParserPromise: Promise<FileParser> | null = null

function loadTextParser(): Promise<FileParser> {
  textParserPromise ??= import('@/lib/file-parsers/text').then((mod) => mod.parseTextDocument)
  return textParserPromise
}

function loadCsvParser(): Promise<FileParser> {
  csvParserPromise ??= import('@/lib/file-parsers/csv').then((mod) => mod.parseCsvDocument)
  return csvParserPromise
}

function loadExcelParser(): Promise<FileParser> {
  excelParserPromise ??= import('@/lib/file-parsers/excel').then((mod) => mod.parseExcelDocument)
  return excelParserPromise
}

function loadPdfParser(): Promise<FileParser> {
  pdfParserPromise ??= import('@/lib/file-parsers/pdf').then((mod) => mod.parsePdfDocument)
  return pdfParserPromise
}

const fileTypeParsers: FileTypeParser[] = [
  {
    test: (type, name) =>
      type === 'text/plain' ||
      type === 'text/markdown' ||
      name.endsWith('.txt') ||
      name.endsWith('.md'),
    load: loadTextParser
  },
  {
    test: (type, name) => type === 'text/csv' || name.endsWith('.csv'),
    load: loadCsvParser
  },
  {
    test: (type, name) =>
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      type === 'application/vnd.ms-excel' ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xls'),
    load: loadExcelParser
  },
  {
    test: (type, name) => type === 'application/pdf' || name.endsWith('.pdf'),
    load: loadPdfParser
  }
]

export async function parseFile(file: File): Promise<ParsedFile> {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  const parser = fileTypeParsers.find(({ test }) => test(fileType, fileName))
  if (parser) {
    const parse = await parser.load()
    return parse(file)
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`)
}

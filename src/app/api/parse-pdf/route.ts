import { join } from 'path'
import { pathToFileURL } from 'url'
import { NextResponse, type NextRequest } from 'next/server'
import { AppError } from '@/lib/errors'
import type { PDFImage } from '@/lib/file-parser'
import { formatSizeInMB } from '@/lib/size'
import { MAX_PDF_FILE_SIZE } from '@/services/constant'

export const runtime = 'nodejs'
type PDFParseInstance = InstanceType<(typeof import('pdf-parse'))['PDFParse']>

// pdf.js falls back to a fake worker in Node.js, but it still resolves the worker module by path.
const WORKER_PATH = join(
  process.cwd(),
  'node_modules',
  'pdf-parse',
  'dist',
  'worker',
  'pdf.worker.mjs'
)
const WORKER_URL = pathToFileURL(WORKER_PATH).href
let isWorkerConfigured = false

async function ensureDomPolyfill(): Promise<void> {
  if (typeof globalThis.DOMMatrix !== 'undefined') {
    return
  }

  const { DOMMatrix, DOMPoint, DOMRect } = await import('@napi-rs/canvas')
  Object.assign(globalThis, { DOMMatrix, DOMPoint, DOMRect })
}

async function loadPdfParseModule(): Promise<typeof import('pdf-parse')> {
  await ensureDomPolyfill()
  const pdfParseModule = await import('pdf-parse')

  if (!isWorkerConfigured) {
    pdfParseModule.PDFParse.setWorker(WORKER_URL)
    isWorkerConfigured = true
  }

  return pdfParseModule
}

async function extractPDFData(parser: PDFParseInstance): Promise<{
  content: string
  pages: number
  images: PDFImage[]
}> {
  // Keep parser operations sequential. In Node.js, pdf.js uses an in-process loopback worker,
  // and concurrent calls on a fresh PDFParse instance race to transfer the same ArrayBuffer.
  const textResult = await parser.getText()
  const imageResult = await parser.getImage({ imageThreshold: 50 })

  return {
    content: textResult.text,
    pages: textResult.total,
    images: imageResult.pages.flatMap((page) =>
      page.images.map((img) => ({
        pageNumber: page.pageNumber,
        name: img.name,
        width: img.width,
        height: img.height,
        dataUrl: img.dataUrl
      }))
    )
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const formData = await req.formData()
    const fileValue = formData.get('file')

    if (!fileValue || typeof fileValue === 'string') {
      return new AppError('invalid_file', 'No file provided').toResponse()
    }

    if (fileValue.type !== 'application/pdf' && !fileValue.name.toLowerCase().endsWith('.pdf')) {
      return new AppError('invalid_file', 'File must be a PDF').toResponse()
    }

    if (fileValue.size > MAX_PDF_FILE_SIZE) {
      return new AppError(
        'file_too_large',
        `File size (${formatSizeInMB(fileValue.size)}) exceeds the maximum allowed size of ${formatSizeInMB(MAX_PDF_FILE_SIZE)}`
      ).toResponse()
    }

    const [{ PDFParse }, arrayBuffer] = await Promise.all([
      loadPdfParseModule(),
      fileValue.arrayBuffer()
    ])

    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) })

    try {
      const parsedPDF = await extractPDFData(parser)

      return NextResponse.json({
        success: true,
        name: fileValue.name,
        content: parsedPDF.content,
        pages: parsedPDF.pages,
        images: parsedPDF.images
      })
    } finally {
      await parser.destroy()
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    return AppError.from('parse_error', error, 'Failed to parse PDF').toResponse()
  }
}

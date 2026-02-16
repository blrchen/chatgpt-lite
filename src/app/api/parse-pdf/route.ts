import { join } from 'path'
import { pathToFileURL } from 'url'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

// Configure worker path for Node.js environment
// Convert to file:// URL for Windows compatibility
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

type ParsedPdfImage = {
  pageNumber: number
  name: string
  width: number
  height: number
  dataUrl: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const fileValue = formData.get('file')

    if (!fileValue || typeof fileValue === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const file = fileValue

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    // Check file size (10MB limit)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        { error: `File size (${sizeMB}MB) exceeds the maximum allowed size of 10MB` },
        { status: 413 }
      )
    }

    const arrayBufferPromise = file.arrayBuffer()

    if (typeof globalThis.DOMMatrix === 'undefined') {
      const { DOMMatrix, DOMPoint, DOMRect } = await import('@napi-rs/canvas')
      const globalWithDom = globalThis as Record<string, unknown>
      globalWithDom.DOMMatrix = DOMMatrix
      globalWithDom.DOMPoint = DOMPoint
      globalWithDom.DOMRect = DOMRect
    }

    // Dynamic import: Prevent triggering of pdfjs during module initialization stage
    const { PDFParse } = await import('pdf-parse')

    if (!isWorkerConfigured) {
      PDFParse.setWorker(WORKER_URL)
      isWorkerConfigured = true
    }

    // Convert file to buffer
    const buffer = Buffer.from(await arrayBufferPromise)

    // Parse PDF using pdf-parse
    const parser = new PDFParse({ data: buffer })

    // Extract text
    const textResult = await parser.getText()

    // Extract images
    const imageResult = await parser.getImage({ imageThreshold: 50 })

    await parser.destroy()

    // Process images into base64 data URLs
    const images: ParsedPdfImage[] = imageResult.pages.flatMap((page) =>
      page.images.map((img) => ({
        pageNumber: page.pageNumber,
        name: img.name,
        width: img.width,
        height: img.height,
        dataUrl: img.dataUrl
      }))
    )

    return NextResponse.json({
      success: true,
      name: file.name,
      content: textResult.text,
      pages: textResult.total,
      images
    })
  } catch (error) {
    console.error('PDF parsing error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to parse PDF',
        success: false
      },
      { status: 500 }
    )
  }
}

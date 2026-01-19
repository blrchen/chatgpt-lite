import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import { join } from 'path'
import { pathToFileURL } from 'url'

// Note: pdf-parse requires Node.js environment
export const runtime = 'nodejs'

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

// Configure worker path for Node.js environment
// Convert to file:// URL for Windows compatibility
const workerPath = join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs')
const workerUrl = pathToFileURL(workerPath).href
PDFParse.setWorker(workerUrl)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF using pdf-parse
    const parser = new PDFParse({ data: buffer })

    // Extract text
    const textResult = await parser.getText()

    // Extract images
    const imageResult = await parser.getImage({ imageThreshold: 50 })

    await parser.destroy()

    // Process images into base64 data URLs
    const images = []
    for (const page of imageResult.pages) {
      for (const img of page.images) {
        images.push({
          pageNumber: page.pageNumber,
          name: img.name,
          width: img.width,
          height: img.height,
          dataUrl: img.dataUrl // Base64 data URL
        })
      }
    }

    return NextResponse.json({
      success: true,
      name: file.name,
      content: textResult.text,
      pages: textResult.total,
      images: images
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

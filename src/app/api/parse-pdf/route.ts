import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import { join } from 'path'
import { pathToFileURL } from 'url'

// Note: pdf-parse requires Node.js environment
export const runtime = 'nodejs'

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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF using pdf-parse
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()

    return NextResponse.json({
      success: true,
      name: file.name,
      content: result.text,
      pages: result.total
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

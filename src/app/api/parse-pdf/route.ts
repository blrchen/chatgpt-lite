import { NextRequest, NextResponse } from 'next/server'
import PDFParser from 'pdf2json'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Note: pdf2json requires Node.js environment
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null

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

    // Create a temporary file (pdf2json needs a file path)
    tempFilePath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`)
    writeFileSync(tempFilePath, buffer)

    // Parse PDF using pdf2json
    const pdfParser = new PDFParser()

    const parsedData = await new Promise<{
      Pages?: Array<{
        Texts?: Array<{
          R?: Array<{ T?: string }>
        }>
      }>
    }>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => {
        const errorMessage = errData instanceof Error
          ? errData.message
          : errData.parserError?.message || 'PDF parsing error'
        reject(new Error(errorMessage))
      })

      pdfParser.on('pdfParser_dataReady', (pdfData: {
        Pages?: Array<{
          Texts?: Array<{
            R?: Array<{ T?: string }>
          }>
        }>
      }) => {
        resolve(pdfData)
      })

      pdfParser.loadPDF(tempFilePath!)
    })

    // Extract text from parsed data
    let text = ''
    let pageCount = 0

    if (parsedData.Pages) {
      pageCount = parsedData.Pages.length

      parsedData.Pages.forEach((page) => {
        if (page.Texts) {
          page.Texts.forEach((textItem) => {
            if (textItem.R) {
              textItem.R.forEach((run) => {
                if (run.T) {
                  text += decodeURIComponent(run.T) + ' '
                }
              })
            }
          })
          text += '\n'
        }
      })
    }

    // Clean up temp file
    if (tempFilePath) {
      unlinkSync(tempFilePath)
    }

    return NextResponse.json({
      success: true,
      name: file.name,
      content: text.trim(),
      pages: pageCount
    })
  } catch (error) {
    console.error('PDF parsing error:', error)

    // Clean up temp file on error
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath)
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to parse PDF',
        success: false
      },
      { status: 500 }
    )
  }
}

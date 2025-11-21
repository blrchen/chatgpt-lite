export const runtime = 'nodejs'

import fs from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { sessionId = 'anon' } = data as { sessionId?: string }

    const dir = path.join(process.cwd(), 'chat-exports', 'buffer')
    const safeName = `${String(sessionId).replace(/[^a-z0-9-_]/gi, '-')}.ndjson`
    const filePath = path.join(dir, safeName)

    // read buffer file
    let exists = true
    try {
      await fs.access(filePath)
    } catch {
      exists = false
    }

    if (!exists) {
      return NextResponse.json({ ok: true, message: 'no buffer to flush' })
    }

    const content = await fs.readFile(filePath, 'utf8')

    // Option: write a single export file per flush with timestamp
    const exportName = `exports/${String(sessionId).replace(/[^a-z0-9-_]/gi, '-')}/${Date.now()}.txt`

    // For NDJSON, we can convert each line to a human-readable line
    const lines = content
      .split('\n')
      .filter(Boolean)
      .map((ln) => {
        try {
          const obj = JSON.parse(ln)
          const who = obj.role === 'assistant' ? 'GPT' : 'User'
          const when = obj.ts || new Date().toISOString()
          const plain = (obj.content || '').replace(/<[^>]*>/g, '')
          return `[${when}] ${who}: ${plain}`
        } catch {
          return ln
        }
      })
      .join('\n')

    // put export file
    await put(`chat-exports/${exportName}`, lines + '\n', {
      access: 'public',
      allowOverwrite: true
    })

    // remove buffer file after successful upload
    await fs.unlink(filePath)

    return NextResponse.json({ ok: true, path: `/chat-exports/${exportName}` })
  } catch (err: any) {
    console.error('flush log error', err)
    return NextResponse.json({ error: err?.message || 'unknown' }, { status: 500 })
  }
}

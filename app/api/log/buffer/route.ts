export const runtime = 'nodejs'

import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const {
      sessionId = 'anon',
      role,
      content,
      ts
    } = data as {
      sessionId?: string
      role?: string
      content?: string
      ts?: string
    }

    if (!role || typeof content !== 'string') {
      return NextResponse.json({ error: 'role and content required' }, { status: 400 })
    }

    const dir = path.join(process.cwd(), 'chat-exports', 'buffer')
    await fs.mkdir(dir, { recursive: true })

    const safeName = `${String(sessionId).replace(/[^a-z0-9-_]/gi, '-')}.ndjson`
    const filePath = path.join(dir, safeName)

    const when = ts ?? new Date().toISOString()
    // strip simple HTML tags
    const plain = content.replace(/<[^>]*>/g, '')
    const entry = JSON.stringify({ role, content: plain, ts: when }) + '\n'

    await fs.appendFile(filePath, entry, 'utf8')

    return NextResponse.json({ ok: true, path: `/chat-exports/buffer/${safeName}` })
  } catch (err: any) {
    console.error('buffer log error', err)
    return NextResponse.json({ error: err?.message || 'unknown' }, { status: 500 })
  }
}

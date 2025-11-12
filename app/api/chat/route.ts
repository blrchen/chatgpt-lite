// app/api/log/route.ts
import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

// POST body: { sessionId: string, role: 'assistant'|'user', content: string, final?: boolean }
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { sessionId = 'anon', role, content } = data
    if (!role || typeof content !== 'string') {
      return NextResponse.json({ error: 'role and content required' }, { status: 400 })
    }

    // create directory for exports
    const dir = path.join(process.cwd(), 'chat-exports')
    await fs.mkdir(dir, { recursive: true })

    // sanitize a safe filename
    const safeName = `${String(sessionId).replace(/[^a-z0-9-_]/gi, '-')}.txt`
    const filePath = path.join(dir, safeName)

    // format line with timestamp and label
    const who = role === 'assistant' ? 'GPT' : 'User'
    const now = new Date().toISOString()
    const plain = (content || '').replace(/<\/?[^>]+(>|$)/g, '') // strip any HTML tags
    const line = `[${now}] ${who}: ${plain}\n`

    // append to file
    await fs.appendFile(filePath, line, 'utf8')

    return NextResponse.json({ ok: true, path: `/chat-exports/${safeName}` })
  } catch (err: any) {
    console.error('log error', err)
    return NextResponse.json({ error: err.message || 'unknown' }, { status: 500 })
  }
}

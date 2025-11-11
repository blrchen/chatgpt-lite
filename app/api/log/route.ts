import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const {
      sessionId = 'anon',
      role,
      content
    } = data as {
      sessionId?: string
      role?: string
      content?: string
    }

    if (!role || typeof content !== 'string') {
      return NextResponse.json({ error: 'role and content required' }, { status: 400 })
    }

    const dir = path.join(process.cwd(), 'chat-exports')
    await fs.mkdir(dir, { recursive: true })

    const safeName = `${String(sessionId).replace(/[^a-z0-9-_]/gi, '-')}.txt`
    const filePath = path.join(dir, safeName)

    const who = role === 'assistant' ? 'GPT' : 'User'
    const now = new Date().toISOString()
    // strip simple HTML tags if any
    const plain = content.replace(/<[^>]*>/g, '')
    const line = `[${now}] ${who}: ${plain}\n`

    await fs.appendFile(filePath, line, 'utf8')

    return NextResponse.json({ ok: true, path: `/chat-exports/${safeName}` })
  } catch (err: any) {
    console.error('log error', err)
    return NextResponse.json({ error: err?.message || 'unknown' }, { status: 500 })
  }
}

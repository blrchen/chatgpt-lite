import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export interface Message {
  role: string
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages, input } = (await req.json()) as {
      prompt: string
      messages: Message[]
      input: string
    }
    const messagesWithHistory = [
      { content: prompt, role: 'system' },
      ...messages,
      { content: input, role: 'user' }
    ]

  //env file
    const apiUrl = process.env.OPENAI_API_URL
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL

    if (!apiUrl || !apiKey || !model) {
      throw new Error('Missing required API configuration')
    }

    const stream = await getOpenAIStream(apiUrl, apiKey, model, messagesWithHistory)
    return new NextResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

const getOpenAIStream = async (
  apiUrl: string,
  apiKey: string,
  model: string,
  messages: Message[]
) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const res = await fetch(apiUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
      // 'api-key': `${apiKey}`
    },
    method: 'POST',
    body: JSON.stringify({
      model: model,
      frequency_penalty: 0,
      max_tokens: 4000,
      messages: messages,
      presence_penalty: 0,
      stream: true,
      temperature: 0.5,
      top_p: 0.95
    })
  })

  if (res.status !== 200) {
    const statusText = res.statusText
    const responseBody = await res.text()
    console.error(`OpenAI API response error: ${responseBody}`)
    throw new Error(
      `The OpenAI API has encountered an error with a status code of ${res.status} ${statusText}: ${responseBody}`
    )
  }

  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data

          if (data === '[DONE]') {
            controller.close()
            return
          }

          try {
            const json = JSON.parse(data)
            const text = json.choices[0]?.delta?.content
            if (text !== undefined) {
              const queue = encoder.encode(text)
              controller.enqueue(queue)
            } else {
              console.error('Received undefined content:', json)
            }
          } catch (e) {
            console.error('Error parsing event data:', e)
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of res.body as any) {
        // An extra newline is required to make AzureOpenAI work.
        const str = decoder.decode(chunk).replace('[DONE]\n', '[DONE]\n\n')
        parser.feed(str)
      }
    }
  })
}

import { NextRequest } from 'next/server'
import { createAzure } from '@ai-sdk/azure'
import type { ModelMessage } from '@ai-sdk/provider-utils'
import { convertToModelMessages, streamText } from 'ai'

export const runtime = 'edge'

type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string | URL }
      | { type: 'document'; name: string; content: string; mimeType: string }
    >

type ChatCompletionMessage = {
  role: 'assistant' | 'user' | 'system'
  content: MessageContent
}

const convertToCoreMessage = (msg: ChatCompletionMessage): ModelMessage => {
  if (msg.role === 'system') {
    return {
      role: 'system',
      content: typeof msg.content === 'string' ? msg.content : ''
    }
  }

  if (msg.role === 'user') {
    if (typeof msg.content === 'string') {
      return {
        role: 'user',
        content: msg.content
      }
    }
    return {
      role: 'user',
      content: msg.content.map((part) => {
        if (part.type === 'text') {
          return { type: 'text', text: part.text }
        } else if (part.type === 'image') {
          return { type: 'image', image: part.image }
        } else {
          // Convert document to text
          return {
            type: 'text',
            text: `[Document: ${part.name}]\n\n${part.content}`
          }
        }
      })
    }
  }

  // assistant
  return {
    role: 'assistant',
    content: typeof msg.content === 'string' ? msg.content : ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages, input } = (await req.json()) as {
      prompt: string
      messages: ChatCompletionMessage[]
      input: MessageContent
    }

    // Initialize Azure provider
    const azure = createAzure({
      resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || ''
    })

    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4'
    const model = azure(deployment)

    // Build messages array with proper typing
    const messagesWithHistory: ModelMessage[] = [
      { role: 'system', content: prompt },
      ...messages.map(convertToCoreMessage),
      convertToCoreMessage({ role: 'user', content: input })
    ]

    // Use streamText from ai-sdk
    const result = await streamText({
      model,
      messages: messagesWithHistory,
      temperature: 1
    })

    // Return the text stream
    return result.toTextStreamResponse()
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

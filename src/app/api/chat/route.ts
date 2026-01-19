import { NextRequest } from 'next/server'
import { createAzure } from '@ai-sdk/azure'
import { createOpenAI } from '@ai-sdk/openai'
import type { ModelMessage } from '@ai-sdk/provider-utils'
import { convertToModelMessages, streamText, type LanguageModel } from 'ai'

export const runtime = 'edge'

/**
 * Helper method to dynamically select and configure the AI model
 * based on environment variables.
 *
 * @returns {LanguageModel} Configured language model (Azure or OpenAI)
 */
function getModel(): LanguageModel {
  // Check if Azure OpenAI credentials are provided
  const azureResourceName = process.env.AZURE_OPENAI_RESOURCE_NAME
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT

  if (azureResourceName && azureApiKey && azureDeployment) {
    // Use Azure OpenAI
    const azure = createAzure({
      resourceName: azureResourceName,
      apiKey: azureApiKey
    })
    return azure(azureDeployment)
  }

  // Fallback to OpenAI
  const openaiApiKey = process.env.OPENAI_API_KEY
  let openaiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1'
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  // Ensure baseURL ends with /v1 for OpenAI-compatible APIs
  if (!openaiBaseUrl.endsWith('/v1')) {
    openaiBaseUrl = openaiBaseUrl.replace(/\/$/, '') + '/v1'
  }
  if (!openaiApiKey) {
    throw new Error(
      'No AI provider configured. Please set either Azure OpenAI or OpenAI credentials in environment variables.'
    )
  }

  const openai = createOpenAI({
    apiKey: openaiApiKey,
    baseURL: openaiBaseUrl
  })

  return openai.chat(openaiModel)
}

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

    // Build messages array with proper typing
    const messagesWithHistory: ModelMessage[] = [
      { role: 'system', content: prompt },
      ...messages.map(convertToCoreMessage),
      convertToCoreMessage({ role: 'user', content: input })
    ]

    // Use streamText from ai-sdk
    const result = await streamText({
      model: getModel(),
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

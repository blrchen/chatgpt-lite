import type { NextRequest } from 'next/server'
import { azure as azureProvider, createAzure } from '@ai-sdk/azure'
import { createOpenAI } from '@ai-sdk/openai'
import type { ModelMessage } from '@ai-sdk/provider-utils'
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type LanguageModel,
  type ToolSet
} from 'ai'

export const runtime = 'edge'

let cachedModel:
  | {
      model: LanguageModel
      isAzure: boolean
      openaiModel?: string
      openaiProvider?: ReturnType<typeof createOpenAI>
    }
  | undefined

/**
 * Helper method to dynamically select and configure the AI model
 * based on environment variables.
 *
 * @returns {object} Configured language model and provider metadata (Azure or OpenAI)
 */
function getModel(): {
  model: LanguageModel
  isAzure: boolean
  openaiModel?: string
  openaiProvider?: ReturnType<typeof createOpenAI>
} {
  if (cachedModel) {
    return cachedModel
  }

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
    cachedModel = { model: azure(azureDeployment), isAzure: true }
    return cachedModel
  }

  // Fallback to OpenAI
  const openaiApiKey = process.env.OPENAI_API_KEY
  let openaiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1'
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
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

  cachedModel = {
    model: openai.chat(openaiModel),
    isAzure: false,
    openaiModel,
    openaiProvider: openai
  }
  return cachedModel
}

type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string | URL }
      | {
          type: 'document'
          name: string
          content: string
          mimeType: string
          images?: Array<{
            pageNumber: number
            name: string
            width: number
            height: number
            dataUrl: string
          }>
        }
    >

type ChatCompletionMessage = {
  role: 'assistant' | 'user' | 'system'
  content: MessageContent
}

function convertToCoreMessage(msg: ChatCompletionMessage): ModelMessage {
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
      content: msg.content.flatMap((part) => {
        if (part.type === 'text') {
          return [{ type: 'text', text: part.text }]
        } else if (part.type === 'image') {
          return [{ type: 'image', image: part.image }]
        } else {
          // Convert document to text and include images
          const result: Array<
            { type: 'text'; text: string } | { type: 'image'; image: string | URL }
          > = []

          // Add document text
          result.push({
            type: 'text',
            text: `[Document: ${part.name}]\n\n${part.content}`
          })

          // Add document images if present
          if (part.images && part.images.length > 0) {
            result.push({
              type: 'text',
              text: `\n\n[This document contains ${part.images.length} image(s)]`
            })

            part.images.forEach((img) => {
              result.push({
                type: 'image',
                image: img.dataUrl
              })
            })
          }

          return result
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

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const toToolSetEntry = <T>(tool: T): ToolSet[string] => tool as ToolSet[string]
    const { prompt, messages, input } = (await req.json()) as {
      prompt: string
      messages: ChatCompletionMessage[]
      input: MessageContent
    }

    const acceptHeader = req.headers.get('accept') ?? ''
    const wantsUiStream = acceptHeader.includes('text/event-stream')

    const messagesWithHistory: ModelMessage[] = [
      { role: 'system', content: prompt },
      ...messages.map(convertToCoreMessage),
      convertToCoreMessage({ role: 'user', content: input })
    ]

    const { model, isAzure, openaiModel, openaiProvider } = getModel()

    const runStream = async () => {
      if (isAzure) {
        const canUseWebSearch = true
        console.log('[Chat API] Auto web search:', {
          provider: 'azure',
          canUseWebSearch,
          modelWillDecide: canUseWebSearch
        })

        const tools = {
          // Azure Web Search (preview)
          // The model will automatically decide when to use this tool
          web_search_preview: toToolSetEntry(
            azureProvider.tools.webSearchPreview({
              searchContextSize: 'high'
              // userLocation: {
              //   type: 'approximate',
              //   country: 'CN'
              // }
            })
          )
        } satisfies ToolSet

        return streamText({
          model,
          messages: messagesWithHistory,
          tools
          // Note: No toolChoice specified - let the model decide intelligently
        })
      }

      if (openaiProvider && openaiModel) {
        try {
          const tools = {
            // OpenAI Web Search (preview)
            // The model will automatically decide when to use this tool
            web_search_preview: toToolSetEntry(
              openaiProvider.tools.webSearchPreview({
                searchContextSize: 'high'
              })
            )
          } satisfies ToolSet

          return await streamText({
            model: openaiProvider.responses(openaiModel),
            messages: messagesWithHistory,
            tools
          })
        } catch (error) {
          console.error('[Chat API] Web search failed, falling back to chat:', error)
        }
      }

      console.log('[Chat API] Chat completion fallback:', {
        provider: 'openai',
        model: openaiModel ?? 'unknown'
      })

      return streamText({
        model,
        messages: messagesWithHistory
      })
    }

    if (!wantsUiStream) {
      const result = await runStream()
      return result.toTextStreamResponse()
    }

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = await runStream()
        writer.merge(result.toUIMessageStream({ sendSources: true, sendReasoning: false }))
      },
      onFinish: ({ finishReason, responseMessage }) => {
        console.log('[Chat API] UI stream finished:', {
          finishReason,
          messageId: responseMessage?.id
        })
      }
    })

    return createUIMessageStreamResponse({
      stream
    })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

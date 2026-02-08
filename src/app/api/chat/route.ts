import { NextRequest } from 'next/server'
import { azure as azureProvider, createAzure } from '@ai-sdk/azure'
import { createOpenAI } from '@ai-sdk/openai'
import type { ModelMessage } from '@ai-sdk/provider-utils'
import { convertToModelMessages, LanguageModel, streamText, UIMessage } from 'ai'

export const runtime = 'edge'

/**
 * Helper method to dynamically select and configure the AI model
 * based on environment variables.
 *
 * @returns {LanguageModel} Configured language model (Azure or OpenAI)
 */
function getModel(): { model: LanguageModel; isAzure: boolean } {
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
    return { model: azure(azureDeployment), isAzure: true }
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

  return { model: openai.chat(openaiModel), isAzure: false }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages } = (await req.json()) as {
      prompt: string
      messages: UIMessage[]
    }

    const messagesWithHistory: ModelMessage[] = [
      { role: 'system', content: prompt },
      ...(await convertToModelMessages(messages))
    ]

    const { model, isAzure } = getModel()

    // Auto-enable web search tool for Azure native configuration
    // The model will intelligently decide when to use it based on the question
    const canUseWebSearch = isAzure

    console.log('[Chat API] Auto web search:', {
      isAzure,
      canUseWebSearch,
      modelWillDecide: canUseWebSearch
    })

    // Use streamText from ai-sdk
    const result = streamText({
      model,
      messages: messagesWithHistory,
      tools: canUseWebSearch
        ? ({
            // ✅ Azure Web Search (preview)
            // The model will automatically decide when to use this tool
            web_search_preview: azureProvider.tools.webSearchPreview({
              searchContextSize: 'high'
              // userLocation: {
              //   type: 'approximate',
              //   country: 'CN'
              // }
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
        : undefined
      // Note: No toolChoice specified - let the model decide intelligently
    })

    // ✅ Use toUIMessageStreamResponse to include text + sources (annotations from web search)
    // This automatically includes SourceUrlUIPart for citations
    return result.toUIMessageStreamResponse({
      sendSources: true
    })
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

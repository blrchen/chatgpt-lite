import { Message } from '@/models'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

export const config = {
  runtime: 'edge'
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { messages } = (await req.json()) as {
      messages: Message[]
    }

    const charLimit = 12000
    let charCount = 0
    let messagesToSend = []

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (charCount + message.content.length > charLimit) {
        break
      }
      charCount += message.content.length
      messagesToSend.push(message)
    }

    const useAzureOpenAI =
      process.env.AZURE_OPENAI_API_BASE_URL && process.env.AZURE_OPENAI_API_BASE_URL.length > 0

    let apiUrl: string
    let apiKey: string
    let model: string
    if (useAzureOpenAI) {
      const apiBaseUrl = process.env.AZURE_OPENAI_API_BASE_URL
      const version = '2023-03-15-preview'
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || ''
      apiUrl = `${apiBaseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${version}`
      apiKey = process.env.AZURE_OPENAI_API_KEY || ''
      model = 'gpt-35-turbo'
    } else {
      const apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com'
      apiUrl = `${apiBaseUrl}/v1/chat/completions`
      apiKey = process.env.OPENAI_API_KEY || ''
      model = 'gpt-3.5-turbo'
    }
    const stream = await OpenAIStream(apiUrl, apiKey, model, messagesToSend)

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

const OpenAIStream = async (apiUrl: string, apiKey: string, model: string, messages: Message[]) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const res = await fetch(apiUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'api-key': `${apiKey}`
    },
    method: 'POST',
    body: JSON.stringify({
      model: model,
      frequency_penalty: 0,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps people find information.`
        },
        ...messages
      ],
      presence_penalty: 0,
      stream: true,
      temperature: 0.7,
      top_p: 0.95
    })
  })

  if (res.status !== 200) {
    const statusText = res.statusText
    throw new Error(
      `The OpenAI API has encountered an error with a status code of ${res.status} and message ${statusText}`
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
            const text = json.choices[0].delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of res.body as any) {
        const str = decoder.decode(chunk).replace('[DONE]\n', '[DONE]\n\n')
        parser.feed(str)
      }
    }
  })
}
export default handler

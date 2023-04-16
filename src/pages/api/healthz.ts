export const config = {
  runtime: 'edge'
}

const handler = async (req: any): Promise<Response> => {
  console.log('Handling request:', req.url)

  try {
    let azureOpenAIKey = false
    let openAIKey = false
    if (process.env.AZURE_OPENAI_API_KEY) {
      if (process.env.AZURE_OPENAI_API_KEY.trim() !== '') {
        azureOpenAIKey = true
      }
    }

    if (process.env.OPENAI_API_KEY) {
      if (process.env.OPENAI_API_KEY.trim() !== '') {
        openAIKey = true
      }
    }

    if (!azureOpenAIKey && !openAIKey) {
      return new Response('OpenAI key is empty')
    }
    return new Response('Ok')
  } catch (error) {
    console.error(error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export default handler

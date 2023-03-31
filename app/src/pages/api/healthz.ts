export const config = {
  runtime: 'edge'
}

const handler = async (req: any): Promise<Response> => {
  console.log('Handling request:', req.url)
  try {
    const response = new Response('Hello, World!')
    return response
  } catch (error) {
    console.error(error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export default handler

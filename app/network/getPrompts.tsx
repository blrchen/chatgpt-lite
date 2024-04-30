export const getPrompts = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/prompts', {
      method: 'GET',
      headers: {
        ContentType: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des prompts')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching prompts:', error)
    throw error
  }
}

export default getPrompts

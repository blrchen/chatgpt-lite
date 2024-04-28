export const getPrompts = async (): Promise<any[]> => {
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
    throw new Error('Erreur lors de la sauvegarde du prompt')
  }
  console.log('response', response)
  return await response.json()
}

export default getPrompts

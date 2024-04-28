const getPrompts = async () => {
  const response = await fetch('/api/prompts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
  console.log('response', response)
  if (!response.ok) {
    throw new Error('Erreur lors de la sauvegarde du prompt')
  }
  console.log('response', response)
  return await response.json()
}

export default getPrompts

export const uploadPrompt = async (id: string, name: string, prompt: string, brand: string) => {
  const data = { id, name, prompt, brand }

  const response = await fetch('/api/prompts', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': ' PUT',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la sauvegarde du prompt')
  }

  return await response.json()
}

export default uploadPrompt

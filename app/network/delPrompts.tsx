// create the delete methode

export const delPrompts = async (id: string): Promise<any[]> => {
  try {
    const response = await fetch('/api/prompts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json', // Correction ici
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({ id: id })
    })

    if (response.status !== 200) {
      throw new Error('Erreur lors de la récupération des prompts')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching prompts:', error)
    throw error
  }
}

export default delPrompts

import PromptManager from '@/serveur/PromptManager/PromptManager'
export default async function handler(req, res) {
  // Configuration des headers CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  )
  // Gestion des requêtes OPTIONS pour le preflight de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const promptManager = new PromptManager()

    if (req.method === 'POST') {
      // Ajouter un nouveau prompt
      const { name, prompt, brand } = req.body
      const promptSend = await promptManager.savePrompt(name, prompt, brand)
      return res.status(201).json(promptSend)
    }
    if (req.method === 'GET') {
      // Récupérer tous les prompts
      const prompts = await promptManager.getPrompts()
      return res.status(200).json(prompts)
    }
    // delete methode
    if (req.method === 'DELETE') {
      const { id } = req.body

      const promptDelete = await promptManager.deletePrompt(id)

      return res.status(200).json(promptDelete)
    }
    // put methode
    if (req.method === 'PUT') {
      const { id, name, prompt, brand } = req.body

      const promptUpdate = await promptManager.updatePrompt(id, name, prompt, brand)
      return res.status(200).json(promptUpdate)
    } else {
      // Méthode non autorisée
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
      return res.status(405).end(`Méthode ${req.method} non autorisée`)
    }
  } catch (error) {
    res.status(500).json({ error: `Erreur lors de la gestion de la méthode ${req.method}` })
  }
}

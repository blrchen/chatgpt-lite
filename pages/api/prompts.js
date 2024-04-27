import PromptManager from '@/serveur/PromptManager/PromptManager'
export default async function handler(req, res) {
  // Configuration des headers CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  )

  // Gestion des requêtes OPTIONS pour le preflight de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const promptManager = new PromptManager()

  try {
    if (req.method === 'POST') {
      // Ajouter un nouveau prompt
      const { name, prompt } = req.body
      promptManager.savePrompt(name, prompt)
      res.status(201).json(prompt)
    } else if (req.method === 'GET') {
      // Récupérer tous les prompts
      const prompts = await prisma.prompt.findMany()
      res.status(200).json(prompts)
    } else {
      // Méthode non autorisée
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
      res.status(405).end(`Méthode ${req.method} non autorisée`)
    }
  } catch (error) {
    res.status(500).json({ error: `Erreur lors de la gestion de la méthode ${req.method}` })
  }
}

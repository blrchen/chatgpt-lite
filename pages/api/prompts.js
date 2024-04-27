import PromptManager from '@/serveur/PromptManager/PromptManager'
export default async function handler(req, res) {
  // Définir les headers CORS pour autoriser les requêtes cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*') // Ajustez '*' pour restreindre les origines si nécessaire
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Gérer les requêtes OPTIONS pour le preflight de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const promptManager = new PromptManager()
  if (req.method === 'POST') {
    // Ajouter un nouveau prompt
    const { name, prompt } = req.body

    try {
      promptManager.savePrompt(name, prompt)

      res.status(201).json(prompt)
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création du prompt' })
    }
  } else if (req.method === 'GET') {
    // Récupérer tous les prompts
    try {
      const prompts = await prisma.prompt.findMany()
      res.status(200).json(prompts)
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des prompts' })
    }
  } else {
    // Méthode non autorisée
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
    res.status(405).end(`Méthode ${req.method} non autorisée`)
  }
}

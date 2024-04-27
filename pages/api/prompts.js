import PromptManager from '@/serveur/PromptManager/PromptManager'
export default async function handler(req, res) {
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
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Méthode ${req.method} non autorisée`)
  }
}

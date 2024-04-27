import { PrismaClient } from '@prisma/client'
import PromptManager from '@/serveur/PromptManager/PromptManager'
export default async function handler(req, res) {
  console.log('in the api  ----------------')
  const promptManager = new PromptManager()
  if (req.method === 'POST') {
    console.log('in the api  ----------------')
    console.dir(req.body)
    console.log('in the api  ----------------')
    // Ajouter un nouveau prompt
    const { name, prompt } = req.body
    console.log('------------------------------------------------------------')
    console.log('title', name)
    console.log('content', prompt)
    console.log('------------------------------------------------------------')
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
  }
}

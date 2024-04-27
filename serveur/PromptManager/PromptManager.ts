// nous voulons crée une classe qui vas savgarder , récuperer , chercher des prompts dans la bdd mongo
import { PrismaClient } from '@prisma/client'

class PromptManager {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  // }
  async savePrompt(name: string, prompt: string) {
    return await this.prisma.prompt.create({
      data: {
        name: name,
        prompt: prompt
      }
    })
  }

  // // Méthode pour récupérer un prompt par ID
  // async getPromptById(id: string) {
  //   return await this.prisma.prompt.findUnique({
  //     where: { id }
  //   })
  // }

  // // Méthode pour chercher des prompts par contenu
  // async searchPrompts(keyword: string) {
  //   return await this.prisma.prompt.findMany({
  //     where: {
  //       content: {
  //         contains: keyword,
  //         mode: 'insensitive'
  //       }
  //     }
  //   })
  // }
}
export default PromptManager

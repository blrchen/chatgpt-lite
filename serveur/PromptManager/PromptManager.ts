// nous voulons crée une classe qui vas savgarder , récuperer , chercher des prompts dans la bdd mongo
import { PrismaClient } from '@prisma/client'

class PromptManager {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async savePrompt(name: string, prompt: string, brand: string) {
    console.log('savePrompt', name, prompt, brand)
    return await this.prisma.prompt.create({
      data: {
        name: name,
        prompt: prompt,
        brand: brand
      }
    })
  }
  async getPrompts() {
    const response = await this.prisma.prompt.findMany()
    return response
  }
  // create the delete methode
  async deletePrompt(id: string) {
    const deletePrompt = await this.prisma.prompt.delete({
      where: { id }
    })
    console.log('deletePrompt in the prompt manager', deletePrompt)
    return deletePrompt
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

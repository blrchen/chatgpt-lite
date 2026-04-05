import { chatMessageSchema } from '@/lib/chat-message-contract'
import { z } from 'zod'

// --- Request schema ---

export const chatRequestSchema = z.object({
  prompt: z.string().trim().min(1),
  messages: z.array(chatMessageSchema)
})

export type ChatRequest = z.infer<typeof chatRequestSchema>

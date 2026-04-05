import { z } from 'zod'

export const chatMessageRoleSchema = z.enum(['user', 'assistant', 'system'])

function createPartSchema<TShape extends z.ZodRawShape>(shape: TShape) {
  return z.object(shape).passthrough()
}

export const pdfImageSchema = z
  .object({
    pageNumber: z.number().finite(),
    name: z.string(),
    width: z.number().finite(),
    height: z.number().finite(),
    dataUrl: z.string()
  })
  .passthrough()

export const documentAttachmentSchema = z
  .object({
    name: z.string(),
    content: z.string(),
    mimeType: z.string(),
    images: z.array(pdfImageSchema).optional()
  })
  .passthrough()

const knownPartSchema = z.discriminatedUnion('type', [
  createPartSchema({ type: z.literal('text'), text: z.string() }),
  createPartSchema({ type: z.literal('file'), mediaType: z.string(), url: z.string() }),
  createPartSchema({
    type: z.literal('data-document'),
    id: z.string().optional(),
    data: documentAttachmentSchema
  }),
  createPartSchema({ type: z.literal('reasoning'), text: z.string() }),
  createPartSchema({ type: z.literal('step-start') }),
  createPartSchema({
    type: z.literal('source-url'),
    sourceId: z.string(),
    url: z.string(),
    title: z.string().optional()
  }),
  createPartSchema({
    type: z.literal('source-document'),
    sourceId: z.string(),
    mediaType: z.string(),
    title: z.string(),
    filename: z.string().optional()
  })
])

const knownPartTypes = [
  'text',
  'file',
  'data-document',
  'reasoning',
  'step-start',
  'source-url',
  'source-document'
] as const

const knownPartTypeSet = new Set<string>(knownPartTypes)

const fallbackPartSchema = createPartSchema({ type: z.string() }).refine(
  (part) => !knownPartTypeSet.has(part.type),
  { message: 'Known part types must satisfy their required schema.' }
)

export const chatMessagePartSchema = knownPartSchema.or(fallbackPartSchema)

export const chatMessageSchema = z.object({
  role: chatMessageRoleSchema,
  parts: z.array(chatMessagePartSchema)
})

/**
 * Persisted chat message base schema for localStorage payloads.
 * Part-level coercion is handled separately to preserve legacy tolerance rules.
 */
export const persistedChatMessageSchema = z
  .object({
    id: z.string().optional(),
    role: chatMessageRoleSchema,
    parts: z.array(z.unknown()),
    createdAt: z.unknown().optional()
  })
  .passthrough()

import { coercePersona, createPersonaId, DefaultPersona } from '@/lib/chat-utils'
import type { Persona } from '@/lib/types'
import type { JsonValue } from '@/types/json'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PERSONA_STORE_KEY = 'persona-store'

function normalizeStoredPersonas(personas: Array<JsonValue | Persona>): Persona[] {
  return personas.flatMap((p) => {
    const coerced = coercePersona(p)
    return coerced ? [coerced] : []
  })
}

interface PersonaState {
  personas: Persona[]
  savePersona: (args: { id?: Persona['id']; name: string; prompt: string }) => void
  deletePersona: (persona: Persona) => void
  getPersonaById: (id: string) => Persona | undefined
}

// --- Selectors ---
export const selectPersonas = (s: PersonaState) => s.personas
export const selectSavePersona = (s: PersonaState) => s.savePersona
export const selectDeletePersona = (s: PersonaState) => s.deletePersona
export const selectGetPersonaById = (s: PersonaState) => s.getPersonaById

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      personas: [],

      savePersona: ({ id, name, prompt }) => {
        set((state) => {
          const nextPersonas = id
            ? state.personas.map((persona) =>
                persona.id === id ? { ...persona, name, prompt } : persona
              )
            : [...state.personas, { id: createPersonaId(), role: 'system' as const, name, prompt }]

          return { personas: nextPersonas }
        })
      },

      deletePersona: (persona) => {
        set((state) => ({
          personas: state.personas.filter((p) => p.id !== persona.id)
        }))
      },

      getPersonaById: (id) => {
        const found = get().personas.find((p) => p.id === id)
        if (found) return found
        if (id === DefaultPersona.id) return DefaultPersona
        return undefined
      }
    }),
    {
      name: PERSONA_STORE_KEY,
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Backfill missing IDs and normalize any legacy persona shape
        state.personas = normalizeStoredPersonas(state.personas)
      }
    }
  )
)

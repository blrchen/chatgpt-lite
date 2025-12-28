'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useAppContext } from '@/contexts/app'
import { cacheGetJson, cacheSet } from '@/lib/cache'
import { v4 as uuid } from 'uuid'

import type { Persona } from './interface'
import { DefaultPersonas } from './utils'

type PersonaContextValue = {
  defaultPersonas: Persona[]
  personas: Persona[]
  editPersona?: Persona
  isPersonaModalOpen: boolean
  openCreatePersonaModal: () => void
  openEditPersonaModal: (persona: Persona) => void
  closePersonaModal: () => void
  savePersona: (values: { id?: string; name: string; prompt: string }) => void
  deletePersona: (persona: Persona) => void
  getPersonaById: (id: string) => Persona | undefined
}

const PERSONAS_STORAGE_KEY = 'Personas'

const PersonaContext = createContext<PersonaContextValue | null>(null)

export const usePersonaContext = () => {
  const context = useContext(PersonaContext)
  if (!context) {
    throw new Error('usePersonaContext must be used within PersonaProvider')
  }
  return context
}

export const PersonaProvider = ({ children }: { children: ReactNode }) => {
  const {
    personaModalOpen,
    openPersonaModal: openPersonaModalFromApp,
    closePersonaModal: closePersonaModalFromApp
  } = useAppContext()
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const stored = cacheGetJson<Persona[]>(PERSONAS_STORAGE_KEY, [])
    return stored.map((persona) => {
      if (!persona.id) {
        return {
          ...persona,
          id: uuid()
        }
      }
      return persona
    })
  })
  const [editPersona, setEditPersona] = useState<Persona | undefined>(undefined)

  useEffect(() => {
    cacheSet(PERSONAS_STORAGE_KEY, JSON.stringify(personas))
  }, [personas])

  const closePersonaModal = useCallback(() => {
    setEditPersona(undefined)
    closePersonaModalFromApp()
  }, [closePersonaModalFromApp])

  const openCreatePersonaModal = useCallback(() => {
    setEditPersona(undefined)
    openPersonaModalFromApp()
  }, [openPersonaModalFromApp])

  const openEditPersonaModal = useCallback(
    (persona: Persona) => {
      setEditPersona(persona)
      openPersonaModalFromApp()
    },
    [openPersonaModalFromApp]
  )

  const savePersona = useCallback(
    ({ id, name, prompt }: { id?: string; name: string; prompt: string }) => {
      if (id) {
        setPersonas((prev) =>
          prev.map((item) => (item.id === id ? { ...item, name, prompt } : item))
        )
      } else {
        const persona: Persona = {
          id: uuid(),
          role: 'system',
          name,
          prompt
        }
        setPersonas((prev) => [...prev, persona])
      }
      closePersonaModal()
    },
    [closePersonaModal]
  )

  const deletePersona = useCallback((persona: Persona) => {
    setPersonas((prev) => prev.filter((item) => item.id !== persona.id))
  }, [])

  const getPersonaById = useCallback(
    (id: string) => {
      return (
        personas.find((persona) => persona.id === id) ||
        DefaultPersonas.find((persona) => persona.id === id)
      )
    },
    [personas]
  )

  const value = useMemo<PersonaContextValue>(
    () => ({
      defaultPersonas: DefaultPersonas,
      personas,
      editPersona,
      isPersonaModalOpen: personaModalOpen,
      openCreatePersonaModal,
      openEditPersonaModal,
      closePersonaModal,
      savePersona,
      deletePersona,
      getPersonaById
    }),
    [
      deletePersona,
      editPersona,
      getPersonaById,
      openCreatePersonaModal,
      openEditPersonaModal,
      closePersonaModal,
      personaModalOpen,
      personas,
      savePersona
    ]
  )

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}

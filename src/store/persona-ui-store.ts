import type { PersonaId } from '@/lib/types'
import { create } from 'zustand'

type PersonaModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; personaId: PersonaId }

interface PersonaUiState {
  personaModal: PersonaModalState
  personaPanelOpen: boolean
  openCreatePersonaModal: () => void
  openEditPersonaModal: (id: PersonaId) => void
  closePersonaModal: () => void
  openPersonaPanel: () => void
  closePersonaPanel: () => void
  /** Close the modal if the deleted persona was being edited. */
  onPersonaDeleted: (id: PersonaId) => void
}

// --- Selectors ---
export const selectEditPersonaId = (s: PersonaUiState) =>
  s.personaModal.mode === 'edit' ? s.personaModal.personaId : undefined
export const selectPersonaPanelOpen = (s: PersonaUiState) => s.personaPanelOpen
export const selectPersonaModalOpen = (s: PersonaUiState) => s.personaModal.mode !== 'closed'
export const selectOpenCreatePersonaModal = (s: PersonaUiState) => s.openCreatePersonaModal
export const selectOpenEditPersonaModal = (s: PersonaUiState) => s.openEditPersonaModal
export const selectClosePersonaModal = (s: PersonaUiState) => s.closePersonaModal
export const selectOpenPersonaPanel = (s: PersonaUiState) => s.openPersonaPanel
export const selectClosePersonaPanel = (s: PersonaUiState) => s.closePersonaPanel
export const selectOnPersonaDeleted = (s: PersonaUiState) => s.onPersonaDeleted

export const usePersonaUiStore = create<PersonaUiState>()((set) => ({
  personaModal: { mode: 'closed' },
  personaPanelOpen: false,

  openCreatePersonaModal: () => set({ personaModal: { mode: 'create' } }),
  openEditPersonaModal: (id) => set({ personaModal: { mode: 'edit', personaId: id } }),
  closePersonaModal: () => set({ personaModal: { mode: 'closed' } }),
  openPersonaPanel: () => set({ personaPanelOpen: true }),
  closePersonaPanel: () => set({ personaPanelOpen: false }),

  onPersonaDeleted: (id) =>
    set((state) => {
      if (state.personaModal.mode === 'edit' && state.personaModal.personaId === id) {
        return { personaModal: { mode: 'closed' } }
      }
      return state
    })
}))

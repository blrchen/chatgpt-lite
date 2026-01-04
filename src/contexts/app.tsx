'use client'

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { cacheGet, cacheGetJson, cacheSet } from '@/lib/cache'
import { getInitialPresetId } from '@/lib/themes'
import { CacheKey } from '@/services/constant'

const SIDEBAR_STORAGE_KEY = 'sidebarToggle'

const getInitialThemePreset = () => getInitialPresetId(cacheGet(CacheKey.ThemePreset))

interface AppContextValue {
  themePreset: string
  setThemePreset: Dispatch<SetStateAction<string>>
  toggleSidebar: boolean
  onToggleSidebar: () => void
  personaPanelOpen: boolean
  openPersonaPanel: () => void
  closePersonaPanel: () => void
  personaModalOpen: boolean
  openPersonaModal: () => void
  closePersonaModal: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider')
  }
  return context
}

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [themePreset, setThemePreset] = useState<string>(getInitialThemePreset)
  const [toggleSidebar, setToggleSidebarState] = useState<boolean>(false)
  const [personaPanelOpen, setPersonaPanelOpen] = useState<boolean>(false)
  const [personaModalOpen, setPersonaModalOpen] = useState<boolean>(false)

  useEffect(() => {
    cacheSet(CacheKey.ThemePreset, themePreset)
  }, [themePreset])

  useEffect(() => {
    const defaultOpen = window.innerWidth >= 768
    setToggleSidebarState(cacheGetJson<boolean>(SIDEBAR_STORAGE_KEY, defaultOpen))
  }, [])

  const onToggleSidebar = useCallback(() => {
    setToggleSidebarState((prev) => {
      const next = !prev
      cacheSet(SIDEBAR_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const openPersonaPanel = useCallback(() => {
    setPersonaPanelOpen(true)
  }, [])

  const closePersonaPanel = useCallback(() => {
    setPersonaPanelOpen(false)
  }, [])

  const openPersonaModal = useCallback(() => {
    setPersonaModalOpen(true)
  }, [])

  const closePersonaModal = useCallback(() => {
    setPersonaModalOpen(false)
  }, [])

  return (
    <AppContext.Provider
      value={{
        themePreset,
        setThemePreset,
        toggleSidebar,
        onToggleSidebar,
        personaPanelOpen,
        openPersonaPanel,
        closePersonaPanel,
        personaModalOpen,
        openPersonaModal,
        closePersonaModal
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

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
import { cacheGet, cacheSet } from '@/lib/cache'
import { DEFAULT_THEME_PRESET, themePresets } from '@/lib/themes'
import { CacheKey } from '@/services/constant'

const SIDEBAR_STORAGE_KEY = 'sidebarToggle'

const getInitialThemePreset = () => {
  const cached = cacheGet(CacheKey.ThemePreset)
  if (cached && themePresets[cached]) {
    return cached
  }
  return DEFAULT_THEME_PRESET
}

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
    const saved = cacheGet(SIDEBAR_STORAGE_KEY)
    if (saved !== null) {
      setToggleSidebarState(JSON.parse(saved))
    } else {
      setToggleSidebarState(window.innerWidth >= 768)
    }
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

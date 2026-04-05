import { DEFAULT_THEME_PRESET } from '@/lib/themes/constants'
import { resolvePresetId } from '@/lib/themes/theme-preset'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const APP_STORE_KEY = 'app-store'

interface AppState {
  themePreset: string
  setThemePreset: (preset: string) => void
}

// --- Selectors ---
export const selectThemePreset = (s: AppState) => s.themePreset
export const selectSetThemePreset = (s: AppState) => s.setThemePreset

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themePreset: DEFAULT_THEME_PRESET,

      setThemePreset: (preset: string) => {
        set({ themePreset: resolvePresetId(preset) })
      }
    }),
    {
      name: APP_STORE_KEY,
      partialize: (state) => ({
        themePreset: state.themePreset
      })
    }
  )
)

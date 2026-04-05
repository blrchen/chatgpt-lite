'use client'

import { useEffect, useInsertionEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { resolvePresetId } from '@/lib/themes/theme-preset'
import { applyThemePresetStyles } from '@/lib/themes/theme-preset-styles'
import { CACHE_KEY } from '@/services/constant'
import { selectThemePreset, useAppStore } from '@/store/app-store'
import type { ThemeMode } from '@/types/theme'
import { ThemeProvider as NextThemesProvider, useTheme, type ThemeProviderProps } from 'next-themes'

function isValidTheme(value?: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

const DEFAULT_THEME_ENV = process.env.NEXT_PUBLIC_DEFAULT_THEME
const DEFAULT_THEME_MODE: ThemeMode = isValidTheme(DEFAULT_THEME_ENV) ? DEFAULT_THEME_ENV : 'light'
const FALLBACK_THEME_COLOR = '#fcfbfa'
let cachedThemeColorMetas: HTMLMetaElement[] = []
let lastAppliedThemeColor: string | null = null

function getThemeColorMetas(): HTMLMetaElement[] {
  cachedThemeColorMetas = cachedThemeColorMetas.filter((meta) => meta.isConnected)
  if (cachedThemeColorMetas.length > 0) {
    return cachedThemeColorMetas
  }

  const foundMetas = Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
  )
  if (foundMetas.length > 0) {
    cachedThemeColorMetas = foundMetas
    return cachedThemeColorMetas
  }

  const themeColorMeta = document.createElement('meta')
  themeColorMeta.name = 'theme-color'
  document.head.appendChild(themeColorMeta)
  cachedThemeColorMetas = [themeColorMeta]
  return cachedThemeColorMetas
}

function ThemeSync(): null {
  const themePreset = useAppStore(selectThemePreset)
  const presetId = resolvePresetId(themePreset)
  const { resolvedTheme } = useTheme()

  useInsertionEffect(() => {
    applyThemePresetStyles(presetId)
    document.documentElement.classList.remove('theme-loading')
  }, [presetId])

  useEffect(() => {
    const frameId = window.requestAnimationFrame(syncThemeColorMeta)
    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [presetId, resolvedTheme])

  return null
}

function syncThemeColorMeta(): void {
  if (typeof document === 'undefined') {
    return
  }

  const mainContent = document.getElementById('main-content')
  const backgroundColor =
    (mainContent && getComputedStyle(mainContent).backgroundColor) ||
    getComputedStyle(document.documentElement).backgroundColor

  const nextThemeColor = backgroundColor || FALLBACK_THEME_COLOR
  if (nextThemeColor === lastAppliedThemeColor) {
    return
  }

  for (const themeColorMeta of getThemeColorMetas()) {
    themeColorMeta.content = nextThemeColor
  }

  lastAppliedThemeColor = nextThemeColor
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      disableTransitionOnChange
      storageKey={CACHE_KEY.THEME}
      defaultTheme={DEFAULT_THEME_MODE}
      {...props}
    >
      <ThemeSync />
      <TooltipProvider delayDuration={120}>{children}</TooltipProvider>
      <Toaster position="top-center" richColors />
    </NextThemesProvider>
  )
}

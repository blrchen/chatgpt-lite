'use client'

import { useInsertionEffect, useMemo } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { useAppContext } from '@/contexts/app'
import { cacheGet } from '@/lib/cache'
import {
  applyThemePresetStyles,
  getThemePresetCss,
  isValidPresetId,
  resolvePresetId,
  THEME_STYLE_ELEMENT_ID
} from '@/lib/themes'
import { CacheKey } from '@/services/constant'
import type { ThemeMode } from '@/types/theme'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

function isValidTheme(value?: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

const DEFAULT_THEME_ENV = process.env.NEXT_PUBLIC_DEFAULT_THEME
const DEFAULT_THEME_MODE: ThemeMode = isValidTheme(DEFAULT_THEME_ENV) ? DEFAULT_THEME_ENV : 'light'

const THEME_PRESET_STYLE_SCRIPT = `(function() {
  try {
    document.documentElement.classList.add('theme-loading');
    var css = localStorage.getItem('${CacheKey.ThemePresetCss}');
    if (!css) return;
    var styleEl = document.getElementById('${THEME_STYLE_ELEMENT_ID}');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = '${THEME_STYLE_ELEMENT_ID}';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  } catch (error) {
    // Ignore errors (e.g., storage disabled)
  }
})();`

function getPresetId(current: string): string {
  if (typeof window === 'undefined') {
    return resolvePresetId(current)
  }
  return isValidPresetId(current) ? current : resolvePresetId(cacheGet(CacheKey.ThemePreset))
}

function ThemePresetStyle(): React.JSX.Element {
  const { themePreset } = useAppContext()
  const presetId = useMemo(() => getPresetId(themePreset), [themePreset])
  const css = useMemo(() => getThemePresetCss(presetId), [presetId])

  return (
    <style
      id={THEME_STYLE_ELEMENT_ID}
      dangerouslySetInnerHTML={{ __html: css }}
      suppressHydrationWarning
    />
  )
}

function ThemePresetStyleScript(): React.JSX.Element {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_PRESET_STYLE_SCRIPT }}
      suppressHydrationWarning
    />
  )
}

function ThemePresetSync(): null {
  const { themePreset } = useAppContext()
  const presetId = useMemo(() => getPresetId(themePreset), [themePreset])

  useInsertionEffect(() => {
    applyThemePresetStyles(presetId)
    document.documentElement.classList.remove('theme-loading')
  }, [presetId])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      disableTransitionOnChange
      storageKey={CacheKey.Theme}
      defaultTheme={DEFAULT_THEME_MODE}
      {...props}
    >
      <ThemePresetStyleScript />
      <ThemePresetStyle />
      <ThemePresetSync />
      {children}
      <Toaster position="top-center" richColors />
    </NextThemesProvider>
  )
}

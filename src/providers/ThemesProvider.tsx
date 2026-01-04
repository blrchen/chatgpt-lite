'use client'

import { useInsertionEffect, useMemo } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { useAppContext } from '@/contexts/app'
import { cacheGet } from '@/lib/cache'
import {
  applyThemePresetStyles,
  getInitialPresetId,
  getThemePresetCss,
  isValidPresetId,
  resolvePresetId as resolvePreset,
  THEME_STYLE_ELEMENT_ID
} from '@/lib/themes'
import { CacheKey } from '@/services/constant'
import { ThemeMode } from '@/types/theme'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

const isValidTheme = (value?: string | null): value is ThemeMode =>
  value === 'light' || value === 'dark'
const DEFAULT_THEME_MODE: ThemeMode = isValidTheme(process.env.NEXT_PUBLIC_DEFAULT_THEME)
  ? (process.env.NEXT_PUBLIC_DEFAULT_THEME as ThemeMode)
  : 'light'

const resolvePresetId = (current: string) => {
  if (typeof window === 'undefined') {
    return resolvePreset(current)
  }
  if (isValidPresetId(current)) {
    return current
  }
  return getInitialPresetId(cacheGet(CacheKey.ThemePreset))
}

function ThemePresetStyle() {
  const { themePreset } = useAppContext()
  const presetId = useMemo(() => resolvePresetId(themePreset), [themePreset])
  const css = useMemo(() => getThemePresetCss(presetId), [presetId])

  return (
    <style
      id={THEME_STYLE_ELEMENT_ID}
      dangerouslySetInnerHTML={{ __html: css }}
      suppressHydrationWarning
    />
  )
}

const ThemePresetStyleScript = () => {
  const script = `(function() {
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
  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />
}

function ThemePresetSync() {
  const { themePreset } = useAppContext()
  const presetId = useMemo(() => resolvePresetId(themePreset), [themePreset])

  useInsertionEffect(() => {
    applyThemePresetStyles(presetId)
    document.documentElement.classList.remove('theme-loading')
  }, [presetId])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
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

'use client'

import { useEffect } from 'react'
import type { ThemeProviderProps } from 'next-themes'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useTheme } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { useAppContext } from '@/contexts/app'
import { cacheGet } from '@/lib/cache'
import { CacheKey } from '@/services/constant'

function ThemeSync() {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme()
  const { theme, setTheme } = useAppContext()

  useEffect(() => {
    const themeInCache = cacheGet(CacheKey.Theme)
    if (themeInCache && ['dark', 'light'].includes(themeInCache)) {
      setTheme(themeInCache)
      setNextTheme(themeInCache)
    } else {
      const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light'
      if (['dark', 'light'].includes(defaultTheme)) {
        setTheme(defaultTheme)
        setNextTheme(defaultTheme)
      }
    }
  }, [setTheme, setNextTheme])

  useEffect(() => {
    if (nextTheme && nextTheme !== theme) {
      setTheme(nextTheme)
    }
  }, [nextTheme, theme, setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" disableTransitionOnChange defaultTheme="light" {...props}>
      <ThemeSync />
      {children}
      <Toaster position="top-center" richColors />
    </NextThemesProvider>
  )
}

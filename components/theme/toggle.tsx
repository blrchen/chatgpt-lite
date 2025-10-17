'use client'

import { useTheme } from 'next-themes'
import { BsMoonStars, BsSun } from 'react-icons/bs'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/contexts/app'
import { cacheSet } from '@/lib/cache'
import { CacheKey } from '@/services/constant'

export default function ThemeToggle() {
  const { theme, setTheme: setAppTheme } = useAppContext()
  const { setTheme } = useTheme()

  const handleThemeChange = function (_theme: string) {
    if (_theme === theme) {
      return
    }

    cacheSet(CacheKey.Theme, _theme, -1)
    localStorage.setItem('theme', _theme)
    setAppTheme(_theme)
    setTheme(_theme)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
    >
      {theme === 'dark' ? <BsSun className="h-5 w-5" /> : <BsMoonStars className="h-5 w-5" />}
    </Button>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function ThemeToggle(): React.JSX.Element | null {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      className="hover:bg-primary/5 group relative size-11 overflow-hidden rounded-full transition-colors duration-200 md:size-9"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <span className="relative flex size-5 items-center justify-center">
        <Sun
          className={cn(
            'absolute size-5 transition-[transform,opacity] duration-200 ease-out group-hover:rotate-45 motion-reduce:transition-none',
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
          )}
        />
        <Moon
          className={cn(
            'absolute size-5 transition-[transform,opacity] duration-200 ease-out group-hover:-rotate-12 motion-reduce:transition-none',
            isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          )}
        />
      </span>
    </Button>
  )
}

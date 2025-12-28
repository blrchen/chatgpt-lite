'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppContext } from '@/contexts/app'
import { themePresetEntries, themePresets } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemePreset } from '@/types/theme'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SearchIcon,
  ShuffleIcon,
  SunIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'

const SWATCH_KEYS = ['primary', 'accent', 'secondary', 'border']

const sortOptions = (entries: [string, ThemePreset][]) =>
  [...entries].sort((a, b) => {
    const nameA = (a[1].label || a[0]).toLowerCase()
    const nameB = (b[1].label || b[0]).toLowerCase()
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })

export default function ThemeOptionsDropdown() {
  const { themePreset, setThemePreset } = useAppContext()
  const { theme } = useTheme()
  const resolvedTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light'
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>(resolvedTheme)
  const presets = useMemo(() => themePresets, [])
  const options = useMemo(() => sortOptions(themePresetEntries), [])
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mode = resolvedTheme
  const selectedPreset = presets[themePreset]
  const selectedColors = selectedPreset?.styles?.[mode] ?? selectedPreset?.styles?.light ?? {}

  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return options
    }
    const query = search.trim().toLowerCase()
    return options.filter(([id, preset]) => {
      const name = (preset.label || id).toLowerCase()
      return name.includes(query) || id.toLowerCase().includes(query)
    })
  }, [options, search])
  const visibleOptions = filteredOptions.length ? filteredOptions : options

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setSearch('')
  }, [])

  const handleSelect = useCallback(
    (presetId: string) => {
      if (!presetId) {
        return
      }

      setThemePreset(presetId)
      closeDropdown()
    },
    [closeDropdown, setThemePreset]
  )

  useEffect(() => {
    if (!open) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, closeDropdown])

  useEffect(() => {
    setPreviewMode(resolvedTheme)
  }, [resolvedTheme])

  const handleTogglePreview = useCallback(() => {
    setPreviewMode((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const handleShuffleSelect = useCallback(() => {
    if (!visibleOptions.length) {
      return
    }
    const random = visibleOptions[Math.floor(Math.random() * visibleOptions.length)]
    if (random) {
      handleSelect(random[0])
    }
  }, [handleSelect, visibleOptions])

  const handleStepSelect = useCallback(
    (direction: 'prev' | 'next') => {
      if (!visibleOptions.length) {
        return
      }
      const currentIndex = visibleOptions.findIndex(([id]) => id === themePreset)
      const normalizedIndex = currentIndex === -1 ? 0 : currentIndex
      const nextIndex =
        direction === 'next'
          ? (normalizedIndex + 1) % visibleOptions.length
          : (normalizedIndex - 1 + visibleOptions.length) % visibleOptions.length
      handleSelect(visibleOptions[nextIndex][0])
    },
    [handleSelect, themePreset, visibleOptions]
  )

  if (!mounted) {
    return null
  }

  return (
    <div className="border-input flex items-stretch rounded-md border" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="border-input hidden h-9 w-9 rounded-l-md rounded-r-none border-r md:flex"
        aria-label="Select previous theme"
        title="Select previous theme"
        onClick={() => handleStepSelect('prev')}
        disabled={!visibleOptions.length}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen((prev) => !prev)}
          className="text-card-foreground group h-9 max-w-[260px] min-w-[160px] items-center justify-between gap-2 rounded-md px-2.5 text-sm font-medium focus-visible:ring-[3px] md:rounded-none"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Selected theme: ${selectedPreset?.label || themePreset}`}
        >
          <div className="flex min-w-0 items-center gap-2 text-left">
            <MiniSwatches colors={selectedColors} className="shrink-0" swatchClassName="size-3" />
            <span className="truncate">{selectedPreset?.label || themePreset}</span>
          </div>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
        </Button>

        {open && (
          <div className="border-border bg-popover text-popover-foreground fixed top-14 right-2 left-2 z-30 rounded-xl border shadow-2xl md:absolute md:top-auto md:right-auto md:left-0 md:mt-2 md:w-80">
            <div className="focus-within:ring-ring/50 flex items-center gap-2 border-b px-3 py-1.5 focus-within:ring-2 focus-within:ring-inset">
              <SearchIcon className="text-muted-foreground size-4" aria-hidden="true" />
              <Input
                className="h-9 border-0 bg-transparent px-0 text-sm focus-visible:border-0 focus-visible:ring-0"
                placeholder="Search themes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && filteredOptions[0]) {
                    handleSelect(filteredOptions[0][0])
                  }
                }}
                autoFocus
              />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs font-medium">
              <span className="flex-1 text-center">
                {filteredOptions.length} theme{filteredOptions.length === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Preview ${previewMode === 'light' ? 'dark' : 'light'} tokens`}
                  title={`Preview ${previewMode === 'light' ? 'dark' : 'light'} tokens`}
                  onClick={handleTogglePreview}
                >
                  {previewMode === 'light' ? (
                    <MoonIcon className="size-3.5" />
                  ) : (
                    <SunIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <Separator className="bg-border" />
            <div
              className="max-h-[360px] overflow-y-auto p-1"
              role="listbox"
              aria-label="Theme presets"
            >
              <p className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-semibold tracking-wide uppercase">
                Built-in themes
              </p>
              <div className="space-y-1">
                {filteredOptions.map(([id, preset]) => {
                  const colors = preset.styles?.[previewMode] ?? preset.styles?.light ?? {}
                  const isActive = id === themePreset
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelect(id)}
                      className={cn(
                        'focus-visible:ring-ring group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition focus-visible:ring-2 focus-visible:outline-hidden',
                        isActive
                          ? 'bg-accent text-accent-foreground ring-accent/40 shadow-sm ring-1'
                          : 'hover:bg-accent/50'
                      )}
                      role="option"
                      aria-selected={isActive}
                    >
                      <MiniSwatches colors={colors} />
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm leading-tight font-medium">
                          {preset.label || id}
                        </span>
                        <span className="text-muted-foreground text-xs leading-tight">{id}</span>
                      </div>
                      {isActive && (
                        <span className="text-primary text-xs font-semibold uppercase">Active</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="border-input hidden h-9 w-9 rounded-none border-l md:flex"
        aria-label="Shuffle themes"
        title="Shuffle themes"
        onClick={handleShuffleSelect}
        disabled={!visibleOptions.length}
      >
        <ShuffleIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="border-input hidden h-9 w-9 rounded-l-none rounded-r-md border-l md:flex"
        aria-label="Select next theme"
        title="Select next theme"
        onClick={() => handleStepSelect('next')}
        disabled={!visibleOptions.length}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}

function MiniSwatches({
  colors,
  className,
  swatchClassName = 'h-3 w-3'
}: {
  colors: Record<string, string>
  className?: string
  swatchClassName?: string
}) {
  return (
    <span className={cn('flex items-center gap-0.5', className)} aria-hidden="true">
      {SWATCH_KEYS.slice(0, 4).map((key) => {
        const background =
          colors?.[key] || colors?.primary || colors?.accent || colors?.background || 'var(--muted)'
        return (
          <span
            key={key}
            className={cn('border-muted rounded-sm border', swatchClassName)}
            style={{ backgroundColor: background, borderColor: colors?.border || 'transparent' }}
          />
        )
      })}
    </span>
  )
}

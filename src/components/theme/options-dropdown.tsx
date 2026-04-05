'use client'

import { memo, useCallback, useDeferredValue, useId, useMemo, useState } from 'react'
import { AppButton, AppIconButton } from '@/components/common/app-button'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import { ThemeOptionsDropdownPlaceholder } from '@/components/theme/options-dropdown-placeholder'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useHydrated } from '@/hooks/useHydrated'
import { getThemePreset, getThemePresetEntries, resolvePresetId } from '@/lib/themes/theme-preset'
import { cn } from '@/lib/utils'
import { isMobileViewport } from '@/lib/viewport'
import { selectSetThemePreset, selectThemePreset, useAppStore } from '@/store/app-store'
import type { ThemeMode, ThemePreset } from '@/types/theme'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  ShuffleIcon,
  SunIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'

const SWATCH_KEYS = ['primary', 'accent', 'secondary', 'border'] as const

type ThemeOptionsDropdownContentProps = {
  themeMode: ThemeMode
  themePreset: string
  setThemePreset: (presetId: string) => void
}

type DesktopThemeActionButtonProps = {
  children: React.ReactNode
  className: string
  disabled: boolean
  label: string
  onClick: () => void
}

function getCircularIndex(current: number, length: number, direction: 'prev' | 'next'): number {
  const normalizedCurrent = current === -1 ? 0 : current
  const step = direction === 'next' ? 1 : -1
  return (normalizedCurrent + step + length) % length
}

function sortOptions(entries: Array<[string, ThemePreset]>): Array<[string, ThemePreset]> {
  return entries.toSorted((a, b) => {
    const nameA = getPresetLabel(a[0], a[1]).toLowerCase()
    const nameB = getPresetLabel(b[0], b[1]).toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

function getPresetLabel(id: string, preset: ThemePreset): string {
  return preset.label || id
}

function getPresetColors(preset: ThemePreset, mode: ThemeMode): Record<string, string> {
  return preset.styles[mode]
}

const SORTED_THEME_OPTIONS = sortOptions(getThemePresetEntries())

function DesktopThemeActionButton({
  children,
  className,
  disabled,
  label,
  onClick
}: DesktopThemeActionButtonProps): React.JSX.Element {
  return (
    <ButtonWithTooltip label={label} placement="bottom">
      <AppIconButton
        variant="ghost"
        size="icon-sm"
        className={className}
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </AppIconButton>
    </ButtonWithTooltip>
  )
}

export default function ThemeOptionsDropdown(): React.JSX.Element {
  const themePreset = useAppStore(selectThemePreset)
  const setThemePreset = useAppStore(selectSetThemePreset)
  const { resolvedTheme } = useTheme()
  const themeMode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light'
  const mounted = useHydrated()
  if (!mounted) {
    return <ThemeOptionsDropdownPlaceholder />
  }

  return (
    <ThemeOptionsDropdownContent
      key={themeMode}
      themeMode={themeMode}
      themePreset={themePreset}
      setThemePreset={setThemePreset}
    />
  )
}

function ThemeOptionsDropdownContent({
  themeMode,
  themePreset,
  setThemePreset
}: ThemeOptionsDropdownContentProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [previewMode, setPreviewMode] = useState<ThemeMode>(themeMode)
  const themePickerPanelId = useId()

  const resolvedThemePreset = resolvePresetId(themePreset)
  const selectedPreset = getThemePreset(resolvedThemePreset)
  const selectedPresetLabel = getPresetLabel(resolvedThemePreset, selectedPreset)
  const selectedColors = getPresetColors(selectedPreset, themeMode)
  const normalizedSearch = search.trim().toLowerCase()
  const deferredNormalizedSearch = useDeferredValue(normalizedSearch)

  const filteredOptions = useMemo(() => {
    if (!deferredNormalizedSearch) {
      return SORTED_THEME_OPTIONS
    }

    return SORTED_THEME_OPTIONS.filter(([id, preset]) => {
      const name = getPresetLabel(id, preset).toLowerCase()
      return (
        name.includes(deferredNormalizedSearch) ||
        id.toLowerCase().includes(deferredNormalizedSearch)
      )
    })
  }, [deferredNormalizedSearch])
  const hasFilteredOptions = filteredOptions.length > 0

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch('')
    }
  }, [])

  const handleSelect = useCallback(
    (presetId: string) => {
      setThemePreset(presetId)
      handleOpenChange(false)
    },
    [handleOpenChange, setThemePreset]
  )

  const handleTogglePreview = useCallback(() => {
    setPreviewMode((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const previewToggleLabel = `Preview ${previewMode === 'light' ? 'dark' : 'light'} tokens`

  const handleShuffleSelect = useCallback(() => {
    if (!hasFilteredOptions) {
      return
    }
    const [randomPresetId] = filteredOptions[Math.floor(Math.random() * filteredOptions.length)]
    handleSelect(randomPresetId)
  }, [filteredOptions, handleSelect, hasFilteredOptions])

  const handleStepSelect = useCallback(
    (direction: 'prev' | 'next') => {
      if (!hasFilteredOptions) {
        return
      }
      const currentIndex = filteredOptions.findIndex(([id]) => id === resolvedThemePreset)
      const nextIndex = getCircularIndex(currentIndex, filteredOptions.length, direction)
      handleSelect(filteredOptions[nextIndex][0])
    },
    [filteredOptions, handleSelect, hasFilteredOptions, resolvedThemePreset]
  )

  return (
    <div className="border-border/60 flex items-stretch rounded-md border">
      <DesktopThemeActionButton
        className="border-input disabled:border-border/60 hidden rounded-l-md rounded-r-none border-r md:flex"
        label="Select previous theme"
        onClick={() => handleStepSelect('prev')}
        disabled={!hasFilteredOptions}
      >
        <ChevronLeftIcon className="size-4" aria-hidden="true" />
      </DesktopThemeActionButton>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            className="text-card-foreground max-w-64 min-w-40 items-center justify-between gap-2 rounded-md px-3 text-sm font-medium focus-visible:ring-[3px] md:rounded-none"
            aria-controls={open ? themePickerPanelId : undefined}
            aria-expanded={open}
            aria-label={`Selected theme: ${selectedPresetLabel}`}
          >
            <div className="flex min-w-0 items-center gap-2 text-left">
              <MiniSwatches colors={selectedColors} className="shrink-0" swatchClassName="size-4" />
              <span className="truncate">{selectedPresetLabel}</span>
            </div>
            <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          </AppButton>
        </PopoverTrigger>
        <PopoverContent
          id={themePickerPanelId}
          align="center"
          sideOffset={8}
          collisionPadding={8}
          className="border-border bg-popover text-popover-foreground w-[min(20rem,calc(100vw-1rem))] rounded-xl p-0 shadow-2xl md:w-80"
          onOpenAutoFocus={(event) => {
            if (isMobileViewport()) {
              return
            }

            event.preventDefault()
            const panel = event.currentTarget as HTMLElement | null
            const input = panel?.querySelector<HTMLInputElement>('[cmdk-input]')
            input?.focus()
          }}
        >
          <Command shouldFilter={false} className="rounded-xl bg-transparent">
            <CommandInput
              name="theme-search"
              value={search}
              onValueChange={setSearch}
              placeholder="Search themes…"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search themes"
              className="focus-visible:ring-ring/50 h-11 text-base focus-visible:ring-2"
            />
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs font-medium">
              <span className="flex-1 text-left tabular-nums">
                {filteredOptions.length} theme{filteredOptions.length === 1 ? '' : 's'}
              </span>
              <ButtonWithTooltip label={previewToggleLabel}>
                <AppIconButton
                  variant="ghost"
                  size="icon"
                  className="size-11 md:size-11"
                  touch={false}
                  mutedDisabled={false}
                  aria-label={previewToggleLabel}
                  onClick={handleTogglePreview}
                >
                  {previewMode === 'light' ? (
                    <MoonIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <SunIcon className="size-4" aria-hidden="true" />
                  )}
                </AppIconButton>
              </ButtonWithTooltip>
            </div>
            <Separator />
            <CommandList className="max-h-96 overscroll-contain p-1">
              <CommandEmpty className="text-muted-foreground px-3 py-8 text-left text-sm">
                No themes found.
              </CommandEmpty>
              <CommandGroup heading="Themes">
                {filteredOptions.map(([id, preset]) => {
                  const colors = getPresetColors(preset, previewMode)
                  const isActive = id === resolvedThemePreset
                  return (
                    <CommandItem
                      key={id}
                      value={id}
                      onSelect={() => handleSelect(id)}
                      className={cn(
                        'focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-hidden',
                        isActive
                          ? 'bg-accent text-accent-foreground ring-border shadow-sm ring-1'
                          : 'text-foreground hover:bg-foreground/[0.04] data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground'
                      )}
                    >
                      <MiniSwatches colors={colors} />
                      <span className="truncate text-sm leading-tight font-medium">
                        {getPresetLabel(id, preset)}
                      </span>
                      {isActive && <Badge className="shadow-sm">Active</Badge>}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DesktopThemeActionButton
        className="border-input disabled:border-border/60 hidden rounded-none border-l md:flex"
        label="Shuffle themes"
        onClick={handleShuffleSelect}
        disabled={!hasFilteredOptions}
      >
        <ShuffleIcon className="size-4" aria-hidden="true" />
      </DesktopThemeActionButton>
      <DesktopThemeActionButton
        className="border-input disabled:border-border/60 hidden rounded-l-none rounded-r-md border-l md:flex"
        label="Select next theme"
        onClick={() => handleStepSelect('next')}
        disabled={!hasFilteredOptions}
      >
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </DesktopThemeActionButton>
    </div>
  )
}

type MiniSwatchesProps = {
  colors: Record<string, string>
  className?: string
  swatchClassName?: string
}

function getSwatchColor(colors: Record<string, string>, key: string): string {
  return colors[key] ?? colors.primary ?? 'var(--muted)'
}

const DEFAULT_SWATCH_CLASS = 'size-4'

const MiniSwatches = memo(function MiniSwatches({
  colors,
  className,
  swatchClassName = DEFAULT_SWATCH_CLASS
}: MiniSwatchesProps): React.JSX.Element {
  return (
    <span className={cn('flex items-center gap-0.5', className)} aria-hidden="true">
      {SWATCH_KEYS.map((key) => {
        const background = getSwatchColor(colors, key)
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
})

/**
 * Theme system ported from tweakcn - a visual theme editor for shadcn/ui
 * Source: https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-presets.ts
 */

import type { ThemeModeValues, ThemePreset } from '@/types/theme'

import { DEFAULT_THEME_PRESET } from './constants'
import { defaultPresets } from './tweakcn-presets'

const SYSTEM_FONT_STACKS: Record<string, string> = {
  'font-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'font-serif': '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
  'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
}

function applySystemFonts(preset: ThemePreset): ThemePreset {
  return {
    ...preset,
    styles: {
      light: { ...preset.styles.light, ...SYSTEM_FONT_STACKS },
      dark: { ...(preset.styles.dark ?? preset.styles.light), ...SYSTEM_FONT_STACKS }
    }
  }
}

const themePresetIdSet = new Set(Object.keys(defaultPresets))
const themePresetCache = new Map<string, ThemePreset>()
let themePresetEntriesCache: Array<[string, ThemePreset]> | null = null

export function isValidPresetId(id: string | null | undefined): id is string {
  return typeof id === 'string' && themePresetIdSet.has(id)
}

export function resolvePresetId(id: string | null | undefined): string {
  return isValidPresetId(id) ? id : DEFAULT_THEME_PRESET
}

function getResolvedThemePreset(resolvedPresetId: string): ThemePreset {
  const cachedPreset = themePresetCache.get(resolvedPresetId)

  if (cachedPreset) {
    return cachedPreset
  }

  const sourcePreset = defaultPresets[resolvedPresetId]
  const preset = applySystemFonts(sourcePreset)
  themePresetCache.set(resolvedPresetId, preset)
  return preset
}

export function getThemePreset(presetId?: string): ThemePreset {
  return getResolvedThemePreset(resolvePresetId(presetId))
}

export function getThemePresetEntries(): Array<[string, ThemePreset]> {
  if (themePresetEntriesCache) {
    return themePresetEntriesCache
  }

  themePresetEntriesCache = Array.from(themePresetIdSet, (presetId) => [
    presetId,
    getResolvedThemePreset(presetId)
  ])
  return themePresetEntriesCache
}

const fontKeyMap: Record<string, string> = {
  'font-sans': 'theme-font-sans',
  'font-serif': 'theme-font-serif',
  'font-mono': 'theme-font-mono'
}

const themePresetCssCache = new Map<string, string>()

function formatCssVars(values: ThemeModeValues = {}): string {
  return Object.entries(values)
    .map(([key, value]) => {
      const cssKey = fontKeyMap[key] || key
      return `  --${cssKey}: ${value};`
    })
    .join('\n')
}

function createThemeCss(preset: ThemePreset): string {
  const light = preset.styles.light
  const dark = preset.styles.dark ?? light
  return `:root {\n${formatCssVars(light)}\n}\n\n.dark {\n${formatCssVars(dark)}\n}`
}

export function getThemePresetCss(presetId?: string): string {
  const resolvedPresetId = resolvePresetId(presetId)
  const cachedCss = themePresetCssCache.get(resolvedPresetId)

  if (cachedCss) {
    return cachedCss
  }

  const css = createThemeCss(getResolvedThemePreset(resolvedPresetId))
  themePresetCssCache.set(resolvedPresetId, css)
  return css
}

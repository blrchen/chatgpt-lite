/**
 * Theme system ported from tweakcn - a visual theme editor for shadcn/ui
 * Source: https://github.com/jnsahaj/tweakcn/blob/main/utils/theme-presets.ts
 */

import { CacheKey } from '@/services/constant'
import { ThemeModeValues, ThemePreset } from '@/types/theme'

import { defaultPresets } from './tweakcn-presets'

const DEFAULT_THEME_PRESET = 'vercel'
const STYLE_ELEMENT_ID = 'chatgpt-lite-theme-styles'

const SYSTEM_FONT_STACKS: Record<string, string> = {
  'font-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'font-serif': 'Georgia, Cambria, "Times New Roman", serif',
  'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
}

const applySystemFonts = (preset: ThemePreset): ThemePreset => ({
  ...preset,
  styles: {
    light: { ...preset.styles.light, ...SYSTEM_FONT_STACKS },
    dark: { ...(preset.styles.dark ?? preset.styles.light), ...SYSTEM_FONT_STACKS }
  }
})

const applySystemFontsToMap = (presets: Record<string, ThemePreset>) =>
  Object.fromEntries(
    Object.entries(presets).map(([key, preset]) => [key, applySystemFonts(preset)])
  ) as Record<string, ThemePreset>

export const themePresets: Record<string, ThemePreset> = applySystemFontsToMap(defaultPresets)
export const themePresetEntries = Object.entries(themePresets) as [string, ThemePreset][]

const fontKeyMap: Record<string, string> = {
  'font-sans': 'theme-font-sans',
  'font-serif': 'theme-font-serif',
  'font-mono': 'theme-font-mono'
}

const formatCssVars = (values: ThemeModeValues = {}) =>
  Object.entries(values)
    .map(([key, value]) => {
      const cssKey = fontKeyMap[key] || key
      return `  --${cssKey}: ${value};`
    })
    .join('\n')

const createThemeCss = (preset: ThemePreset) => {
  const light = preset?.styles?.light ?? {}
  const dark = preset?.styles?.dark ?? light
  return `:root {\n${formatCssVars(light)}\n}\n\n.dark {\n${formatCssVars(dark)}\n}`
}

const ensureStyleElement = () => {
  let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = STYLE_ELEMENT_ID
    document.head.appendChild(styleEl)
  }
  return styleEl
}

const getThemePreset = (presetId?: string): ThemePreset => {
  if (presetId && themePresets[presetId]) {
    return themePresets[presetId]
  }
  return themePresets[DEFAULT_THEME_PRESET]
}

export const getThemePresetCss = (presetId?: string) => {
  const preset = getThemePreset(presetId)
  return createThemeCss(preset)
}

export const THEME_STYLE_ELEMENT_ID = STYLE_ELEMENT_ID
const persistPresetCss = (css: string) => {
  try {
    localStorage.setItem(CacheKey.ThemePresetCss, css)
  } catch {
    // ignore write failures
  }
}

export const applyThemePresetStyles = (presetId?: string) => {
  if (typeof document === 'undefined') {
    return
  }

  const css = getThemePresetCss(presetId)
  const styleEl = ensureStyleElement()
  styleEl.textContent = css
  if (presetId) {
    styleEl.dataset.preset = presetId
  } else {
    delete styleEl.dataset.preset
  }
  persistPresetCss(css)
}

export { DEFAULT_THEME_PRESET }

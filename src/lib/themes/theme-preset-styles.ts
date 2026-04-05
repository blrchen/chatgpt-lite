import { cacheSet } from '@/lib/cache'
import { CACHE_KEY } from '@/services/constant'

import { THEME_STYLE_ELEMENT_ID } from './constants'
import { getThemePresetCss } from './theme-preset'

function ensureStyleElement(): HTMLStyleElement {
  let styleEl = document.getElementById(THEME_STYLE_ELEMENT_ID) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = THEME_STYLE_ELEMENT_ID
    document.head.appendChild(styleEl)
  }
  return styleEl
}

function persistPresetCss(css: string): void {
  try {
    cacheSet(CACHE_KEY.THEME_PRESET_CSS, css)
  } catch {
    // ignore write failures
  }
}

export function applyThemePresetStyles(presetId?: string): void {
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

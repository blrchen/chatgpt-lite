export type ThemeMode = 'light' | 'dark'

export type ThemeModeValues = Record<string, string>

export type ThemePreset = {
  label?: string
  createdAt?: string
  styles: Record<ThemeMode, ThemeModeValues>
}

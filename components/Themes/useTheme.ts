import { useContext } from 'react'
import { UseThemeProps } from './interface'
import { ThemeContext } from './ThemeContext'

const defaultContext: UseThemeProps = { theme: 'light', setTheme: (_) => {}, themes: ['light', 'dark'] }

export const useTheme = () => useContext(ThemeContext) ?? defaultContext

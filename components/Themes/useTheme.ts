import { useContext } from 'react'
import { UseThemeProps } from './interface'
import { ThemeContext } from './ThemeContext'

const defaultContext: UseThemeProps = { setTheme: (_) => {}, themes: [] }

export const useTheme = () => useContext(ThemeContext) ?? defaultContext

import { createContext } from 'react'
import { UseThemeProps } from './interface'

export const ThemeContext = createContext<UseThemeProps | undefined>(undefined)

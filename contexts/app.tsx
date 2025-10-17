'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext({} as Record<string, any>)

export const useAppContext = () => useContext(AppContext)

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<string>('dark')

  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
  }, [])

  const [user, setUser] = useState<any>(null)

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        user,
        setUser
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

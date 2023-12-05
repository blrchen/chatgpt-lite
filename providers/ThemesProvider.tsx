import React, { PropsWithChildren } from 'react'
import { ThemeProvider } from '@/components/Themes'
import { Theme, ThemePanel } from '@radix-ui/themes'

export const ThemesProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <Theme accentColor="violet" style={{ height: '100%' }} className="h-full">
        {children}
        {/* <ThemePanel /> */}
      </Theme>
    </ThemeProvider>
  )
}

export default ThemesProvider

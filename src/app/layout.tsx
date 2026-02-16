import type { Metadata } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppContextProvider } from '@/contexts/app'
import { ThemeProvider } from '@/providers/themes-provider'
import { Analytics } from '@vercel/analytics/react'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ChatGPT Lite',
    template: `%s - ChatGPT Lite`
  },
  description: 'AI assistant powered by ChatGPT',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-dvh overflow-hidden text-sm antialiased">
        <AppContextProvider>
          <ThemeProvider>
            <TooltipProvider>
              <main className="bg-background text-foreground flex h-full flex-1 flex-col overflow-hidden">
                {children}
              </main>
            </TooltipProvider>
          </ThemeProvider>
        </AppContextProvider>
        <Analytics />
      </body>
    </html>
  )
}

import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppContextProvider } from '@/contexts/app'
import { ThemeProvider } from '@/providers/ThemesProvider'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full overflow-hidden">
        <AppContextProvider>
          <ThemeProvider attribute="class" disableTransitionOnChange defaultTheme="light">
            <TooltipProvider>
              <main className="h-full flex flex-col flex-1 bg-background text-foreground">
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

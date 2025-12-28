import { Metadata } from 'next'
import { Header } from '@/components/header'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppContextProvider } from '@/contexts/app'
import { ThemeProvider } from '@/providers/ThemesProvider'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full overflow-hidden text-sm antialiased">
        <AppContextProvider>
          <ThemeProvider attribute="class" disableTransitionOnChange defaultTheme="light">
            <TooltipProvider>
              <main className="bg-background text-foreground flex h-full flex-1 flex-col">
                <Header />
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
              </main>
            </TooltipProvider>
          </ThemeProvider>
        </AppContextProvider>
        <Analytics />
      </body>
    </html>
  )
}

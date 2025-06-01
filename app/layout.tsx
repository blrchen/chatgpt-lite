import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import ThemesProvider from '@/providers/ThemesProvider'

import '@/styles/globals.scss'
import '@/styles/theme-config.css'

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemesProvider>
          <Header />
          {children}
          <Toaster position="top-center" toastOptions={{ style: { color: 'red' } }} />
        </ThemesProvider>
        <Analytics />
      </body>
    </html>
  )
}

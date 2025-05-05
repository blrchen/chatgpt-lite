// @ts-nocheck
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'react-hot-toast'
import { Header } from '@/components/Header'
import Providers from '@/providers/PrivyProvider'
import ThemesProvider from '@/providers/ThemesProvider'
import '@/styles/globals.scss'
import '@/styles/theme-config.css'

export const metadata = {
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
    <html lang="en">
      <body>
        <Providers>
          <ThemesProvider>
            <Header />
            {children}
            <Toaster />
          </ThemesProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

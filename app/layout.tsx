import { Inter } from 'next/font/google'
import ThemesProvider from '@/providers/ThemesProvider'
import { Toaster } from '@/components'
import { Header } from '@/components/Header'

import '@/styles/globals.scss'
import '@/styles/theme-config.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
            <ThemesProvider>
              <Header />
              {children}
              <Toaster />
            </ThemesProvider>
      </body>
    </html>
  )
}

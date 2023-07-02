'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@material-tailwind/react'
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <Toaster
            toastOptions={{
              className: 'overflow-hidden break-word'
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import localFont from 'next/font/local'

const geistSans = localFont({
  src: [
    { path: './fonts/geist-100.ttf', weight: '100' },
    { path: './fonts/geist-200.ttf', weight: '200' },
    { path: './fonts/geist-300.ttf', weight: '300' },
    { path: './fonts/geist-400.ttf', weight: '400' },
    { path: './fonts/geist-500.ttf', weight: '500' },
    { path: './fonts/geist-600.ttf', weight: '600' },
    { path: './fonts/geist-700.ttf', weight: '700' },
    { path: './fonts/geist-800.ttf', weight: '800' },
    { path: './fonts/geist-900.ttf', weight: '900' }
  ],
  display: 'swap',
  variable: '--font-geist-sans-loaded'
})

const geistMono = localFont({
  src: [
    { path: './fonts/geist-mono-100.ttf', weight: '100' },
    { path: './fonts/geist-mono-200.ttf', weight: '200' },
    { path: './fonts/geist-mono-300.ttf', weight: '300' },
    { path: './fonts/geist-mono-400.ttf', weight: '400' },
    { path: './fonts/geist-mono-500.ttf', weight: '500' },
    { path: './fonts/geist-mono-600.ttf', weight: '600' },
    { path: './fonts/geist-mono-700.ttf', weight: '700' },
    { path: './fonts/geist-mono-800.ttf', weight: '800' },
    { path: './fonts/geist-mono-900.ttf', weight: '900' }
  ],
  display: 'swap',
  variable: '--font-geist-mono-loaded'
})

export const appFontClassName = `${geistSans.variable} ${geistMono.variable}`

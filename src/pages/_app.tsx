import '@/styles/globals.css'
import 'antd/dist/antd.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

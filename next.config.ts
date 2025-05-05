import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  sassOptions: {
    // includePaths: [path.join(__dirname, 'styles')]
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/chat',
        permanent: true
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

export default nextConfig

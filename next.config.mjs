/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
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
  },
  experimental: {
    serverActions: {
      allowedOrigins: []
    }
  }
}

export default nextConfig

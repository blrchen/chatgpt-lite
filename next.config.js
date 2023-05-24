/** @type {import('next').NextConfig} */
const withLess = require('next-with-less')
const path = require('node:path')

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  swcMinify: true,
  transpilePackages: ['antd-mobile'],
  webpack(config, options) {
    // disable css-module in Next.js
    config.module.rules.forEach((rule) => {
      const { oneOf } = rule
      if (oneOf) {
        oneOf.forEach((one) => {
          if (!`${one.issuer?.and}`.includes('_app')) return
          one.issuer.and = [path.resolve(__dirname)]
        })
      }
    })

    return config
  }
}

module.exports = withLess(nextConfig)

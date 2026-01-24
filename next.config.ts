import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  serverExternalPackages: ['@napi-rs/canvas'],
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
};

export default nextConfig;

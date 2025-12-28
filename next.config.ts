import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
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

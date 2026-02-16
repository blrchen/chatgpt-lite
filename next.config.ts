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
    optimizePackageImports: ['lucide-react'],
    serverActions: {
      allowedOrigins: []
    }
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@destiny-ai/ui', '@destiny-ai/core', '@destiny-ai/database', '@destiny-ai/utils'],
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude firebase-admin from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'firebase-admin': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;


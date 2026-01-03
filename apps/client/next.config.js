/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@destiny-ai/ui', '@destiny-ai/core', '@destiny-ai/database', '@destiny-ai/utils'],
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
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


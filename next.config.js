/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
        pathname: '/**',
      },
    ],
  },
  // Disable static generation errors for dynamic routes
  // Pages will be generated on-demand instead
  output: undefined,
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  // Don't fail build on static generation errors
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;

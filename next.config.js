/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    dirs: ['lib', 'app', 'components', 'hooks', 'types'],
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: '**',
        protocol: 'http',
        port: '',
      },
      {
        hostname: '**',
        protocol: 'https',
        port: '',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
    incremental: true,
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;

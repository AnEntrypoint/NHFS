/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    dirs: ['lib', 'app', 'components', 'hooks', 'types'],
    ignoreDuringBuilds: false,
  },
  images: {
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
    tsconfigPath: './tsconfig.json',
    incremental: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;

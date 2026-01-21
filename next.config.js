/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  outputFileTracingExcludes: {
    '*': [
      './node_modules/@swc/core-linux-x64-gnu',
      './node_modules/@swc/core-linux-x64-musl',
      './node_modules/@esbuild',
      './node_modules/typescript',
      './node_modules/prettier',
      './node_modules/eslint',
      './node_modules/@typescript-eslint',
      './node_modules/@eslint',
      './node_modules/postcss',
      './node_modules/tailwindcss',
      './node_modules/autoprefixer',
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@heroui/breadcrumbs',
      '@heroui/button',
      '@heroui/divider',
      '@heroui/dropdown',
      '@heroui/image',
      '@heroui/input',
      '@heroui/modal',
      '@heroui/navbar',
      '@heroui/progress',
      '@heroui/switch',
      '@heroui/system',
      '@heroui/theme',
      '@heroui/toast',
      '@heroui/tooltip',
      '@solar-icons/react',
      'framer-motion',
    ],
    turbotrace: {
      logLevel: 'error',
      logDetail: false,
      memoryLimit: 4096,
    },
  },
};

module.exports = nextConfig;

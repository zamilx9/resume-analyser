/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Performance optimizations for Next.js 16+ */
  
  // Optimize images with modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Disable optimization in dev for faster builds
  },

  // Turbopack configuration for faster builds
  turbopack: {
    resolveAlias: {},
  },

  // Enable CSS optimization and code splitting
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lodash', 'react-icons', 'zustand', 'primereact', 'primeicons'],
  },

  // Enable component caching for faster builds
  cacheComponents: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Compress assets
  compress: true,

  // Disable production source maps for smaller bundle
  productionBrowserSourceMaps: false,

  // React strict mode
  reactStrictMode: true,
};

export default nextConfig;

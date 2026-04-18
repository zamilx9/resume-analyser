// .eslintignore and performance optimizations config
const buildOptions = {
  // Minification strategy
  minify: true,
  compress: {
    pure_funcs: ['console.log'],
    passes: 2,
  },

  // Code splitting optimization
  codeSplitting: {
    enabled: true,
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
    },
  },

  // Cache configuration
  cache: {
    type: 'filesystem',
    cacheDirectory: '.next/cache',
    buildDependencies: {
      config: ['next.config.js'],
    },
  },

  // API optimization
  api: {
    timeout: 8000, // 8s timeout for API calls
    retries: 1,
    retryDelay: 1000,
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = buildOptions;

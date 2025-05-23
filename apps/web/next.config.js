/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui", "@your-org/ui"],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  // Disable static page generation for now
  output: 'standalone',
  
  // Image optimization configuration
  images: {
    domains: [
      'images.unsplash.com',
      'res.cloudinary.com',
      'property-portal-images.s3.amazonaws.com',
      'localhost'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Configure compiler for better performance
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // Enable React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Enable emotion for CSS-in-JS optimization
    emotion: true,
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Enable optimistic updates
    optimisticClientCache: true,
    // Enable server components
    serverComponents: true,
    // Enable concurrent features
    concurrentFeatures: true,
    // Enable scroll restoration
    scrollRestoration: true,
  },
  
  // Configure webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    // Enable code splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          priority: 5,
        },
      },
    };
    
    return config;
  },
};

module.exports = nextConfig;
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
  // Configure for GitHub Pages deployment
  ...(process.env.NODE_ENV === 'production' && {
    // Set the base path for GitHub Pages
    basePath: '/property-portal',
    // Use asset prefix for GitHub Pages
    assetPrefix: '/property-portal',
    // Configure for static export when building for production
    output: 'export',
    // Disable image optimization since it requires a server
    images: {
      unoptimized: true,
    },
    // Disable middleware for static export
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
  }),
};

module.exports = nextConfig;
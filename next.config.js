/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are now stable and enabled by default
  // experimental.serverActions option removed as it's no longer needed
  
  // Docker configuration
  output: 'standalone',
  
  // Image optimization for Docker
  images: {
    unoptimized: true
  },
  
  // Ensure proper hostname binding in Docker
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig

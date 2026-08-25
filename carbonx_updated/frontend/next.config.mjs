/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    '@web3modal/wagmi',
    '@web3modal/scaffold',
    '@web3modal/scaffold-utils',
    '@wagmi/core',
    '@wagmi/connectors',
  ],
  webpack: (config, { isServer }) => {
    // Suppress browser-only modules on server
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
      'encoding':    false,
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        net:    false,
        tls:    false,
        crypto: false,
      }
    }
    return config
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff'                          },
        { key: 'X-Frame-Options',         value: 'DENY'                             },
        { key: 'X-XSS-Protection',        value: '1; mode=block'                   },
        { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin'  },
        { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
}
export default nextConfig

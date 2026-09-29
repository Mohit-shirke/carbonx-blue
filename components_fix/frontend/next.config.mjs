/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs:            false,
      net:           false,
      tls:           false,
      encoding:      false,
      'pino-pretty': false,
      'idb-keyval':  false,
    }
    if (isServer) {
      const ext = Array.isArray(config.externals) ? config.externals : []
      config.externals = [...ext,
        '@walletconnect/keyvaluestorage',
        'idb-keyval', 'pino-pretty', 'encoding',
      ]
    }
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask/ },
      { module: /node_modules\/pino/ },
      { module: /node_modules\/@walletconnect/ },
      { module: /node_modules\/encoding/ },
    ]
    return config
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@walletconnect/universal-provider',
      '@walletconnect/keyvaluestorage',
    ],
  },
  compress: true, poweredByHeader: false, reactStrictMode: true,
}
export default nextConfig

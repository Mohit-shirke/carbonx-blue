/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Prevent WalletConnect indexedDB SSR crash ──────────────────
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Tell webpack to ignore browser-only modules on server
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:           false,
        net:          false,
        tls:          false,
        crypto:       false,
        stream:       false,
        path:         false,
        os:           false,
        'idb-keyval': false,
      }

      // Externalize WalletConnect packages from SSR bundle
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push(
          '@walletconnect/keyvaluestorage',
          'idb-keyval',
        )
      }
    }
    return config
  },

  // ── Silence known WalletConnect peer dep warnings ─────────────
  experimental: {
    // Fixes: "Multiple versions of Lit loaded"
    serverComponentsExternalPackages: [
      '@walletconnect/universal-provider',
      '@walletconnect/keyvaluestorage',
    ],
  },

  // ── Performance ───────────────────────────────────────────────
  compress:          true,
  poweredByHeader:   false,
  reactStrictMode:   true,

  // ── Image domains ─────────────────────────────────────────────
  images: {
    domains: ['polygonscan.com', 'www.oklink.com'],
  },
}

export default nextConfig

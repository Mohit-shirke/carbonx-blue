'use client'
/**
 * CarbonX Web3 Providers
 * KEY FIX: Dynamic import of WagmiProvider to prevent SSR indexedDB error
 * KEY FIX: initWeb3Modal() called inside useEffect (client-only)
 */

import { useEffect, useState } from 'react'
import { WagmiProvider }       from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, initWeb3Modal }       from '@/lib/web3Config'

// QueryClient — stable reference across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
})

export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Init Web3Modal ONLY on client — prevents indexedDB SSR crash
    initWeb3Modal()
  }, [])

  // Render children immediately (SSR safe)
  // WagmiProvider is safe server-side with ssr:true in config
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

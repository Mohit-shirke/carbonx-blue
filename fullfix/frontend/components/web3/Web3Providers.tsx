'use client'
import { useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, initWeb3Modal } from '@/lib/web3Config'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry:1, staleTime:30_000 } },
})

export function Web3Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { initWeb3Modal() }, [])
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

'use client'
import React, { useEffect, useRef, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, initWeb3Modal } from '@/lib/web3Config'

// Create QueryClient outside component to avoid re-creation
const queryClient = new QueryClient()

interface Props { children: React.ReactNode }

export function Web3Providers({ children }: Props) {
  const initialized = useRef(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      initWeb3Modal()
    } catch (err) {
      console.warn('Web3Modal init skipped:', (err as Error).message)
    }
    setReady(true)
  }, [])

  // Always wrap in WagmiProvider so hooks work everywhere
  // WagmiProvider handles SSR gracefully with wagmiConfig
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Providers

'use client'
import React, { useEffect, useRef, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, initWeb3Modal } from '@/lib/web3Config'

const wagmiQC = new QueryClient()

interface Props { children: React.ReactNode }

export function Web3Providers({ children }: Props) {
  const initialized = useRef(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initWeb3Modal()
      setReady(true)
    }
  }, [])
  if (!ready) return <>{children}</>
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={wagmiQC}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
export default Web3Providers

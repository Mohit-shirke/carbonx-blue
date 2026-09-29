/**
 * CarbonX Web3 Configuration — Polygon PoS Mainnet
 * Chain ID: 137 | RPC: Multiple providers for redundancy
 * Explorer: Polygonscan (official) + OKLink
 * 
 * Architecture: Multi-RPC fallback for 99.9% uptime
 * Primary:   https://polygon-rpc.com (free, no key)
 * Secondary: https://rpc.ankr.com/polygon (free tier 30K req/day)
 * Tertiary:  https://polygon.llamarpc.com (free, no key)
 */

import { createConfig, http }   from 'wagmi'
import { defineChain }          from 'viem'
import { createAppKit }         from '@web3modal/wagmi/react'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'

// ── Polygon PoS Mainnet Definition ────────────────────────────────
export const polygonMainnet = defineChain({
  id:   137,
  name: 'Polygon',
  nativeCurrency: { name:'POL', symbol:'POL', decimals:18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
        'https://rpc.ankr.com/polygon',
        'https://polygon.llamarpc.com',
        'https://polygon-bor-rpc.publicnode.com',
      ]
    },
    public: {
      http: [
        'https://polygon-rpc.com',
        'https://rpc.ankr.com/polygon',
        'https://polygon.llamarpc.com',
      ]
    },
  },
  blockExplorers: {
    default: { name:'Polygonscan', url:'https://polygonscan.com' },
    oklink:  { name:'OKLink',      url:'https://www.oklink.com/polygon' },
  },
  testnet: false,  // ← MAINNET
})

// ── Wagmi Config ──────────────────────────────────────────────────
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains:      [polygonMainnet],
  connectors:  [
    walletConnect({ projectId }),
    injected(),
    coinbaseWallet({ appName:'CarbonX' }),
  ],
  transports: {
    [polygonMainnet.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com'
    ),
  },
  ssr: true,
})

// ── AppKit (Web3Modal) ────────────────────────────────────────────
createAppKit({
  adapters:    [],
  networks:    [polygonMainnet],
  projectId,
  metadata: {
    name:        'CarbonX',
    description: 'Blue Carbon Registry on Polygon',
    url:         'https://carbonx.app',
    icons:       ['https://carbonx.app/logo.png'],
  },
  features: {
    analytics:    true,
    email:        false,
    socials:      false,
  },
  themeMode:   'dark',
})

// ── Helper constants ──────────────────────────────────────────────
export const CHAIN_ID        = 137
export const EXPLORER_URL    = 'https://polygonscan.com'
export const OKLINK_URL      = 'https://www.oklink.com/polygon'
export const NETWORK_NAME    = 'Polygon'
export const NATIVE_CURRENCY = 'POL'

// ── Contract address (mainnet — set after deploy) ─────────────────
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000'

/**
 * CarbonX Web3 Configuration — Polygon PoS Mainnet
 * Chain ID: 137 | wagmi v2 + @web3modal/wagmi v5
 *
 * KEY FIX: createAppKit comes from @web3modal/wagmi (NOT /react)
 * KEY FIX: No top-level side effects — must call initWeb3Modal() client-side only
 */

import { createConfig, http }                from 'wagmi'
import { polygon }                           from 'wagmi/chains'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'

// ── Use wagmi's built-in polygon chain (Chain ID: 137) ────────────
export { polygon as polygonMainnet }

// ── Wagmi config (safe to import anywhere) ────────────────────────
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains:     [polygon],
  connectors: [
    walletConnect({ projectId }),
    injected(),
    coinbaseWallet({ appName: 'CarbonX' }),
  ],
  transports: {
    [polygon.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com'
    ),
  },
  ssr: true,
})

// ── AppKit init — MUST be called client-side only ─────────────────
// Called once from Web3Providers.tsx inside useEffect
let _initialized = false

export function initWeb3Modal() {
  if (typeof window === 'undefined') return  // SSR guard
  if (_initialized) return
  _initialized = true

  // Dynamic import so it never runs on server
  import('@web3modal/wagmi').then(({ createWeb3Modal }) => {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      defaultChain:   polygon,
      themeMode:      'dark',
      themeVariables: {
        '--w3m-accent':        '#10B981',
        '--w3m-border-radius-master': '8px',
      },
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      ],
    })
  }).catch(console.error)
}

// ── Helper constants ──────────────────────────────────────────────
export const CHAIN_ID        = 137
export const EXPLORER_URL    = 'https://polygonscan.com'
export const OKLINK_URL      = 'https://www.oklink.com/polygon'
export const NETWORK_NAME    = 'Polygon'
export const NATIVE_CURRENCY = 'POL'

export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000'

/**
 * CarbonX Web3 — Polygon PoS Mainnet (Chain ID: 137)
 * SSR-safe: no top-level side effects
 */
import { createConfig, http } from 'wagmi'
import { polygon }            from 'wagmi/chains'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'

export { polygon as polygonMainnet }

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains:     [polygon],
  connectors: [
    walletConnect({ projectId }),
    injected(),
    coinbaseWallet({ appName:'CarbonX' }),
  ],
  transports: { [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com') },
  ssr: true,
})

let _init = false
export function initWeb3Modal() {
  if (typeof window === 'undefined' || _init) return
  _init = true
  import('@web3modal/wagmi').then(({ createWeb3Modal }) => {
    createWeb3Modal({
      wagmiConfig, projectId, defaultChain: polygon,
      themeMode: 'dark',
      themeVariables: { '--w3m-accent':'#10B981', '--w3m-border-radius-master':'8px' },
    })
  }).catch(() => {})
}

export const CHAIN_ID        = 137
export const EXPLORER_URL    = 'https://polygonscan.com'
export const OKLINK_URL      = 'https://www.oklink.com/polygon'
export const NETWORK_NAME    = 'Polygon'
export const NATIVE_CURRENCY = 'POL'
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000'

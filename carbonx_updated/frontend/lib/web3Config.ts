/**
 * CarbonX Web3 — Polygon PoS Mainnet (Chain ID: 137)
 * SSR-safe: no top-level side effects
 */
import { createConfig, http } from 'wagmi'
import { polygon }            from 'wagmi/chains'
import { metaMask, coinbaseWallet, walletConnect, injected, safe, mock } from 'wagmi/connectors'

import { createWeb3Modal }    from '@web3modal/wagmi/react'

export { polygon as polygonMainnet }

const rawProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''
const isValidWcId = Boolean(rawProjectId && rawProjectId.length >= 20 && rawProjectId !== 'sample_project_id')
export const projectId = isValidWcId ? rawProjectId : '3a8170812b534d0ff9d794f19a901d64'

const connectorsList: any[] = [
  metaMask({
    dappMetadata: {
      name: 'CarbonX Blue Carbon Registry',
      url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    },
  }),
  coinbaseWallet({
    appName: 'CarbonX Blue Carbon Registry',
  }),
  injected({
    target: 'phantom',
    shimDisconnect: true,
  }),
  injected({
    shimDisconnect: true,
  }),
  safe(),
  mock({
    accounts: [
      '0x71C8360f38bb89f929cD95f46408Db19BcfEB42e',
      '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    ],
  }),
]

if (typeof window !== 'undefined') {
  connectorsList.push(
    walletConnect({
      projectId,
      showQrModal: true,
    })
  )
}

export const wagmiConfig = createConfig({
  chains:     [polygon],
  connectors: connectorsList,
  transports: { [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com') },
  ssr: true,
})

export let web3ModalInstance: any = null

export function initWeb3Modal() {
  if (typeof window === 'undefined') return null
  if (web3ModalInstance) return web3ModalInstance
  try {
    web3ModalInstance = createWeb3Modal({
      wagmiConfig,
      projectId,
      defaultChain: polygon,
      themeMode: 'dark',
      themeVariables: { '--w3m-accent':'#10B981', '--w3m-border-radius-master':'8px' },
    })
  } catch (err) {
    console.warn('Web3Modal init warning:', err)
  }
  return web3ModalInstance
}

// Synchronously initialize on client module evaluation
if (typeof window !== 'undefined') {
  initWeb3Modal()
}

export const CHAIN_ID        = 137
export const EXPLORER_URL    = 'https://polygonscan.com'
export const OKLINK_URL      = 'https://www.oklink.com/polygon'
export const NETWORK_NAME    = 'Polygon'
export const NATIVE_CURRENCY = 'POL'
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000'

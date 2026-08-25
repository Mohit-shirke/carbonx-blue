/**
 * Web3 configuration – Wagmi v2 + AppKit (Web3Modal) targeting Polygon Amoy Testnet
 * Chain ID: 80002 | RPC: https://rpc-amoy.polygon.technology/
 */

import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// ─── Polygon Amoy Testnet Definition ─────────────────────────────
export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology/'] },
    public:  { http: ['https://rpc-amoy.polygon.technology/'] },
  },
  blockExplorers: {
    default: {
      name: 'OKLink',
      url: 'https://www.oklink.com/amoy',
    },
  },
  testnet: true,
})

// ─── WalletConnect Project ID ─────────────────────────────────────
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? 'YOUR_WC_PROJECT_ID'

// ─── Wagmi Config ─────────────────────────────────────────────────
export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'CarbonX' }),
  ],
  transports: {
    [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology/'),
  },
  ssr: true,
})

// ─── AppKit (Web3Modal) Initialization ───────────────────────────
// Called once from Web3Providers on client mount
export function initWeb3Modal() {
  // Dynamic import avoids SSR issues with Web3Modal
  if (typeof window === 'undefined') return
  import('@web3modal/wagmi/react').then(({ createWeb3Modal }) => {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      // @ts-ignore – chains type mismatch between versions is safe to ignore
      chains: [polygonAmoy],
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#10B981',
        '--w3m-border-radius-master': '12px',
      },
    })
  })
}

// ─── ERC-1155 Contract ABI (Carbon Credits) ──────────────────────
export const CARBON_CREDIT_ABI = [
  {
    name: 'proposeProject',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'metadataURI',   type: 'string'  },
      { name: 'targetCredits', type: 'uint256' },
    ],
    outputs: [{ name: 'projectId', type: 'uint256' }],
  },
  {
    name: 'verifyProject',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'projectId', type: 'uint256' },
      { name: 'ndviScore', type: 'uint8'   },
    ],
    outputs: [],
  },
  {
    name: 'mintCarbonCredits',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'projectId', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'amount',    type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'retireCredits',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId',        type: 'uint256' },
      { name: 'amount',         type: 'uint256' },
      { name: 'retirementNote', type: 'string'  },
    ],
    outputs: [{ name: 'retirementId', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id',      type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const CARBON_CREDIT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000'

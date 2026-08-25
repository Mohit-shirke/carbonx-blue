/**
 * Web3 Relayer Service
 * Server-side wallet that auto-mints ERC-1155 tokens post-payment
 * Uses viem for type-safe contract interactions on Polygon Amoy
 */

const { createWalletClient, createPublicClient, http, defineChain } = require('viem')
const { privateKeyToAccount } = require('viem/accounts')

// ─── Polygon Amoy chain definition ───────────────────────────────
const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology/'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/amoy' },
  },
  testnet: true,
})

// ─── ERC-1155 ABI (mint function only needed server-side) ─────────
const MINT_ABI = [
  {
    name: 'mintCarbonCredits',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'projectId', type: 'uint256' },
      { name: 'recipient',  type: 'address' },
      { name: 'amount',     type: 'uint256' },
    ],
    outputs: [],
  },
]

let walletClient = null
let publicClient = null

function getClients() {
  if (!process.env.RELAYER_PRIVATE_KEY || process.env.RELAYER_PRIVATE_KEY === '0xYOUR_SERVER_RELAYER_PRIVATE_KEY') {
    console.warn('[Relayer] RELAYER_PRIVATE_KEY not configured — mint calls will be simulated.')
    return { walletClient: null, publicClient: null }
  }

  if (!walletClient) {
    const account = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY)
    walletClient = createWalletClient({ account, chain: polygonAmoy, transport: http() })
    publicClient = createPublicClient({ chain: polygonAmoy, transport: http() })
  }
  return { walletClient, publicClient }
}

/**
 * mintCreditsOnChain
 * Fires a server-side transaction to mint ERC-1155 tokens to a buyer wallet
 *
 * @param {object} params
 * @param {number} params.projectId   - On-chain project ID
 * @param {string} params.recipient   - Buyer's wallet address (0x…)
 * @param {number} params.amount      - Token amount to mint
 * @returns {Promise<string>}         - Transaction hash
 */
async function mintCreditsOnChain({ projectId, recipient, amount }) {
  const { walletClient: wc, publicClient: pc } = getClients()
  const contractAddress = process.env.CONTRACT_ADDRESS

  // Simulation mode when keys/contract not configured
  if (!wc || !contractAddress || contractAddress === '0xYOUR_DEPLOYED_CONTRACT_ADDRESS') {
    console.log(`[Relayer SIM] Would mint ${amount} credits of project #${projectId} → ${recipient}`)
    return `0xSIMULATED_${Date.now().toString(16)}`
  }

  try {
    const txHash = await wc.writeContract({
      address: contractAddress,
      abi: MINT_ABI,
      functionName: 'mintCarbonCredits',
      args: [BigInt(projectId), recipient, BigInt(amount)],
    })

    // Wait for confirmation
    await pc.waitForTransactionReceipt({ hash: txHash, confirmations: 2 })

    console.log(`[Relayer] ✓ Minted ${amount} credits for project #${projectId} → ${recipient} | tx: ${txHash}`)
    return txHash
  } catch (err) {
    console.error('[Relayer] Mint failed:', err.message)
    throw new Error(`On-chain mint failed: ${err.message}`)
  }
}

module.exports = { mintCreditsOnChain }

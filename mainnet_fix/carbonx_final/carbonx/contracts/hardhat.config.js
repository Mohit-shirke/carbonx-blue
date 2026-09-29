/**
 * CarbonX Hardhat Configuration — Polygon PoS Mainnet
 * 
 * Deploy command:
 *   npx hardhat run scripts/deploy.js --network polygon
 *
 * Verify on Polygonscan:
 *   npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS
 *
 * Gas estimation:
 *   npx hardhat run scripts/estimateGas.js --network polygon
 */

require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config({ path: '../backend/.env' })

const PRIVATE_KEY   = process.env.RELAYER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001'
const POLYGON_RPC   = process.env.POLYGON_RPC || 'https://polygon-rpc.com'
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_API_KEY || ''

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: { enabled:true, runs:200 },
      viaIR:     true,
    },
  },

  networks: {
    // ── Polygon PoS Mainnet (Chain ID: 137) ──────────────────────
    polygon: {
      url:      POLYGON_RPC,
      chainId:  137,
      accounts: [PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`],
      gasPrice: 'auto',  // Polygon has dynamic gas pricing (EIP-1559)
    },

    // ── Polygon Mumbai (Legacy testnet — deprecated April 2024) ───
    // mumbai: { url:'https://rpc-mumbai.maticvigil.com', chainId:80001 },
    // NOTE: Mumbai was deprecated. Amoy replaced it but also no longer needed for mainnet.

    // ── Local development (Hardhat node) ──────────────────────────
    hardhat: {
      chainId: 31337,
    },
  },

  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_KEY,  // Get free key at polygonscan.com/apis
    },
  },

  gasReporter: {
    enabled:     process.env.REPORT_GAS === 'true',
    currency:    'USD',
    coinmarketcap: process.env.CMC_API_KEY,
    token:       'MATIC',
    gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
  },

  paths: {
    sources:   './contracts',
    tests:     './test',
    cache:     './cache',
    artifacts: './artifacts',
  },
}

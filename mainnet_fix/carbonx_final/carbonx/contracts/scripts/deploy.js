/**
 * CarbonX Smart Contract Deploy Script
 * Target: Polygon PoS Mainnet (Chain ID: 137)
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network polygon
 *
 * After deploy:
 *   1. Copy CONTRACT_ADDRESS to backend/.env
 *   2. Copy CONTRACT_ADDRESS to frontend/.env.local
 *   3. Verify: npx hardhat verify --network polygon YOUR_ADDRESS
 */

const { ethers } = require('hardhat')
const fs         = require('fs')
const path       = require('path')

async function main() {
  console.log('🚀 Deploying CarbonCredit.sol to Polygon Mainnet...\n')

  const [deployer] = await ethers.getSigners()
  const network    = await ethers.provider.getNetwork()

  console.log(`   Network:  ${network.name} (Chain ID: ${network.chainId})`)
  console.log(`   Deployer: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  const polBal  = parseFloat(ethers.formatEther(balance)).toFixed(4)
  console.log(`   Balance:  ${polBal} POL\n`)

  if (network.chainId !== 137n) {
    throw new Error(`❌ Wrong network! Expected Polygon Mainnet (137), got ${network.chainId}`)
  }

  if (parseFloat(polBal) < 0.1) {
    console.warn(`⚠️  Low POL balance. Make sure you have enough POL for gas.`)
    console.warn(`   Get POL: Bridge from Ethereum at https://wallet.polygon.technology/`)
  }

  // Deploy
  const CarbonCredit = await ethers.getContractFactory('CarbonCredit')
  console.log('   Deploying...')
  const contract = await CarbonCredit.deploy()
  await contract.waitForDeployment()

  const address     = await contract.getAddress()
  const deployTx    = contract.deploymentTransaction()
  const receipt     = await deployTx.wait(3)  // Wait 3 confirmations

  console.log('\n✅ DEPLOYMENT SUCCESSFUL!')
  console.log(`   Contract Address: ${address}`)
  console.log(`   Tx Hash:          ${deployTx.hash}`)
  console.log(`   Block:            ${receipt.blockNumber}`)
  console.log(`   Gas Used:         ${receipt.gasUsed.toString()}`)
  console.log(`\n   🔍 View on Polygonscan:`)
  console.log(`   https://polygonscan.com/address/${address}`)
  console.log(`\n   📋 Next Steps:`)
  console.log(`   1. Copy this to backend/.env:   CONTRACT_ADDRESS=${address}`)
  console.log(`   2. Copy this to frontend/.env.local: NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`)
  console.log(`   3. Verify contract: npx hardhat verify --network polygon ${address}`)

  // Save deployment info
  const deployInfo = {
    network:         'Polygon Mainnet',
    chain_id:        137,
    contract_address: address,
    deployer:        deployer.address,
    tx_hash:         deployTx.hash,
    block:           receipt.blockNumber.toString(),
    deployed_at:     new Date().toISOString(),
    polygonscan_url: `https://polygonscan.com/address/${address}`,
  }

  const outPath = path.join(__dirname, '../deployment.json')
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2))
  console.log(`\n   📁 Deployment info saved to: contracts/deployment.json`)
}

main().catch(err => {
  console.error('\n❌ Deployment failed:', err)
  process.exit(1)
})

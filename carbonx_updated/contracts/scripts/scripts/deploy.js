/**
 * Deploy CarbonCredit.sol to Polygon Amoy Testnet
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network amoy
 *
 * After deploy:
 *   1. Copy CONTRACT_ADDRESS into backend/.env  → CONTRACT_ADDRESS=0x…
 *   2. Copy CONTRACT_ADDRESS into frontend/.env.local → NEXT_PUBLIC_CONTRACT_ADDRESS=0x…
 *   3. Verify: npx hardhat verify --network amoy <address> <relayerAddress>
 */

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n🌱 Deploying CarbonCredit to Polygon Amoy...");
  console.log(`   Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance : ${ethers.formatEther(balance)} MATIC`);

  if (balance === 0n) {
    throw new Error("Deployer wallet has no MATIC. Get testnet MATIC from a faucet!");
  }

  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  
  // FIXED: Passing deployer.address back in since the contract constructor requires 1 argument
  const contract = await CarbonCredit.deploy(deployer.address);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`\n✅ CarbonCredit deployed!`);
  console.log(`   Address : ${address}`);
  console.log(`   Network : Polygon Amoy (Chain ID: 80002)`);
  console.log(`   Explorer: https://amoy.polygonscan.com/address/${address}`);

  // Log env vars to update
  console.log("\n─── Update your .env files ──────────────────────────────");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("─────────────────────────────────────────────────────────\n");

  // Verify on Polygonscan (optional – requires POLYGONSCAN_API_KEY)
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("Waiting 5 blocks before verification...");
    await new Promise(r => setTimeout(r, 30_000)); // ~30s on Amoy
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [deployer.address], // Matching the constructor argument here too
      });
      console.log("✅ Contract verified on Polygonscan");
    } catch (e) {
      console.warn("⚠️  Verification failed (can retry manually):", e.message);
    }
  }
}

// Gracefully force-close the process to prevent Windows async handle crashes
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Deployment failed:", err);
    process.exit(1);
  });
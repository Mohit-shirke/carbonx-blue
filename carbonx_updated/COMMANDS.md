# CarbonX — Startup Commands (Polygon Mainnet)

## Daily Development Startup

```powershell
# Step 1 — Start PostgreSQL
docker start carbonx_postgres

# Step 2 — Backend (Terminal 1)
cd "X:\CarbonX Blue\carbonx_updated\backend"
npm run dev

# Step 3 — Frontend (Terminal 2)
cd "X:\CarbonX Blue\carbonx_updated\frontend"
npm run dev

# Browser: http://localhost:3000
```

## Deploy Smart Contract to Polygon Mainnet

```powershell
# 1. Get POL for gas (bridge from Ethereum)
#    https://wallet.polygon.technology/

# 2. Set your private key in backend/.env
#    RELAYER_PRIVATE_KEY=your_key_here
#    POLYGON_RPC=https://polygon-rpc.com

# 3. Deploy
cd "X:\CarbonX Blue\carbonx_updated\contracts"
npx hardhat run scripts/deploy.js --network polygon

# 4. Copy CONTRACT_ADDRESS from output to both .env files

# 5. Verify on Polygonscan (optional but recommended)
npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS
```

## Environment Setup

### backend/.env — POLYGON MAINNET
```
PORT=4000
NODE_ENV=development
POLYGON_RPC=https://polygon-rpc.com
CONTRACT_ADDRESS=0xYOUR_MAINNET_CONTRACT
RELAYER_PRIVATE_KEY=YOUR_PRIVATE_KEY
JWT_SECRET=GENERATE_RANDOM_256_BIT
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
```

### frontend/.env.local — POLYGON MAINNET
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WC_PROJECT_ID=YOUR_WC_KEY
NEXT_PUBLIC_STRIPE_PK=pk_live_YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_MAINNET_CONTRACT
```

## Free RPC Options (No API Key Needed)
- https://polygon-rpc.com (official Polygon Foundation)
- https://rpc.ankr.com/polygon (30K req/day free)
- https://polygon.llamarpc.com (no limits)
- https://polygon-bor-rpc.publicnode.com (no limits)

## Blockchain Explorer
- Polygonscan: https://polygonscan.com
- OKLink: https://www.oklink.com/polygon

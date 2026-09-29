# 🌿 CarbonX — Blockchain Blue Carbon Registry & MRV System

> **Production-ready, open-source platform** for verifiable blue carbon credit issuance, AI satellite MRV validation, and transparent on-chain retirement — built on Polygon Mainnet (Chain ID: 137) with ERC-1155, Next.js, and Stripe.

---

## Architecture Overview

```
carbonx/
├── frontend/          # Next.js 14 App Router · Tailwind · Wagmi · Framer Motion
├── backend/           # Express.js Modular API · JWT Auth · Stripe · Web3 Relayer
├── contracts/         # Solidity ERC-1155 · Hardhat · Polygon PoS Mainnet
└── docker-compose.yml # Full local stack (Postgres + Backend + Frontend)
```

---

## Module Summary

| Module | Description |
|--------|-------------|
| **1 – Theme Engine** | System-aware dark/light with time-based automation (6PM→6AM dark), localStorage override, Framer Motion tactile feedback on every button |
| **2 – RBAC Auth** | Split-screen login/register with animated stat counter, 4-persona role selection (NGO / Validator / Corporate / Auditor), JWT in HTTP-only cookies |
| **3 – Dashboard** | Interactive SVG Sundarbans mangrove map with hover telemetry modals (NDVI, tree density, credits available) + live block-explorer transaction ticker |
| **4 – Marketplace** | Scannable project cards with Verra/CCTS badges, multi-rail checkout drawer (Polygon Web3 MATIC/USDC + Stripe Live Card + UPI Instant QR), live gas estimator |
| **5 – Ledger** | On-chain ERC-1155 burn via `retireCredits()`, immutable retirement records table, Polygonscan explorer links, retirement certificate API |
| **6 – AI MRV Pipeline** | Server-Sent Events streaming terminal, Sentinel-2 simulation steps, PostgreSQL status update to `VERIFIED`, SSE-compatible validator dashboard |
| **7 – AI Chatbot** | Floating FAB with glow ring, keyword-matched response engine, guided marketplace tour (highlights + scroll), animated typing dots |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local Postgres)
- Web3 Wallet (MetaMask, Coinbase Wallet, WalletConnect) on Polygon Mainnet
- POL / MATIC or USDC on Polygon Mainnet (Chain ID: 137)

---

### 1. Clone & Install

```bash
git clone https://github.com/your-org/carbonx.git
cd carbonx

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..

# Contracts
cd contracts && npm install && cd ..
```

---

### 2. Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — fill in Stripe keys, JWT secret, relayer private key

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local — fill in WalletConnect Project ID, Stripe PK, API URL
```

**Required keys to set:**

| Variable | Where to get |
|----------|-------------|
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com) → Test mode |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --forward-to localhost:4000/api/v1/payments/webhook` |
| `NEXT_PUBLIC_STRIPE_PK` | Stripe dashboard → Publishable key |
| `NEXT_PUBLIC_WC_PROJECT_ID` | [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `RELAYER_PRIVATE_KEY` | Export from MetaMask (testnet wallet only — never mainnet!) |
| `JWT_SECRET` | Any 32+ char random string |

---

### 3. Start PostgreSQL

```bash
docker-compose up postgres -d
```

---

### 4. Run Database Migrations

```bash
cd backend
npx knex migrate:latest
```

---

### 5. Deploy Smart Contract (Polygon PoS Mainnet)

```bash
cd contracts

# Set RELAYER_PRIVATE_KEY in contracts/.env
cp backend/.env.example .env

# Compile
npx hardhat compile

# Deploy to Polygon Mainnet
npx hardhat run scripts/deploy.js --network polygon

# Copy the deployed address into backend/.env and frontend/.env.local
# CONTRACT_ADDRESS=0x…
```

---

### 6. Start Development Servers

```bash
# Terminal 1 — Backend (port 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Visit **http://localhost:3000**

---

### 7. Docker Full Stack (Alternative)

```bash
docker-compose up --build
```

All three services (PostgreSQL, Backend, Frontend) start together.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Register with role selection |
| `POST` | `/api/v1/auth/login` | — | Sign in → JWT cookie |
| `POST` | `/api/v1/auth/logout` | Cookie | Clear session |
| `GET`  | `/api/v1/auth/me` | Cookie | Get current user |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/v1/projects` | Optional | List all projects |
| `GET`  | `/api/v1/projects/:id` | Optional | Project detail + MRV logs |
| `POST` | `/api/v1/projects` | NGO | Propose new project |
| `PATCH`| `/api/v1/projects/:id/verify` | Government | Verify project |

### MRV

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/mrv/analyze` | Government/Auditor | **SSE** streaming pipeline |
| `GET`  | `/api/v1/mrv/queue` | Government/Auditor | Pending validation queue |
| `GET`  | `/api/v1/mrv/logs/:projectId` | Authenticated | MRV audit log |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/payments/create-intent` | Authenticated | Create Stripe PaymentIntent |
| `POST` | `/api/v1/payments/webhook` | Stripe Sig | Webhook → auto-mint on success |
| `GET`  | `/api/v1/payments/history` | Authenticated | User payment history |

### Ledger

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/v1/ledger` | Optional | Public retirement ledger |
| `POST` | `/api/v1/ledger/retire` | Authenticated | Record on-chain retirement |
| `GET`  | `/api/v1/ledger/certificate/:id` | — | Retirement certificate JSON |

---

## Smart Contract

**CarbonCredit.sol** — ERC-1155 on Polygon Amoy

| Function | Role | Description |
|----------|------|-------------|
| `proposeProject(uri, credits)` | Anyone | Submit project with IPFS metadata |
| `verifyProject(id, ndviScore)` | VALIDATOR | Approve after MRV; unlock minting |
| `mintCarbonCredits(id, to, amt)` | RELAYER | Server-side auto-mint post-payment |
| `retireCredits(id, amt, note)` | Anyone | Burn tokens → permanent offset record |
| `rejectProject(id, reason)` | VALIDATOR | Reject invalid project |
| `batchMintCredits(ids, tos, amts)` | RELAYER | Gas-efficient multi-project mint |

**Roles:**
- `DEFAULT_ADMIN_ROLE` — Contract owner, manages roles
- `VALIDATOR_ROLE` — Government validators, calls `verifyProject`
- `RELAYER_ROLE` — Server wallet, calls `mintCarbonCredits`

---

## Testing

```bash
# Smart contract tests (Hardhat + Chai)
cd contracts && npx hardhat test

# Contract coverage
cd contracts && npx hardhat coverage

# Backend API (add Jest/Supertest — structure ready)
cd backend && npm test
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| Icons | Lucide React |
| Web3 Client | Wagmi v2 + Viem v2 |
| Web3 Modal | AppKit (Web3Modal v5) |
| Blockchain | Polygon PoS Mainnet (Chain ID: 137) |
| Smart Contract | Solidity 0.8.20 + OpenZeppelin v5 |
| Contract Tooling | Hardhat v2 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 16 + Knex.js |
| Auth | bcryptjs + JWT (HTTP-only cookies) |
| Payments | Multi-Rail: Stripe Live + Instant UPI + Web3 USDC/MATIC |
| ORM/QueryBuilder | Knex.js |
| Containerization | Docker + Docker Compose |

---

## Production Payment Rails

CarbonX supports 3 instant settlement rails:

| Rail | Settlement | Description |
|------|------------|-------------|
| **Web3 (MATIC / USDC)** | Instant on-chain (Chain 137) | Direct ERC-1155 smart contract minting via MetaMask/Coinbase |
| **Card (USD / Global)** | Stripe Live Gateway | 256-bit SSL encrypted PCI-DSS Level 1 processing (Visa, Mastercard, Amex, Apple Pay) |
| **UPI & NetBanking** | Instant QR / VPA | Zero-fee UPI payments (Google Pay, PhonePe, Paytm, BHIM, NetBanking) |

---

## Wallet Setup (MetaMask — Polygon Mainnet)

1. Open MetaMask → Network Selection
2. Network Name: `Polygon Mainnet`
3. RPC URL: `https://polygon-rpc.com`
4. Chain ID: `137`
5. Symbol: `POL` (or `MATIC`)
6. Explorer: `https://polygonscan.com`

Or — CarbonX will prompt you to switch automatically when you connect on another network.

---

## License

MIT — free to use, fork, and extend. Contributions welcome.

---

## Credits

Built with ❤️ using 100% open-source tooling:
OpenZeppelin · Wagmi · Viem · Next.js · Tailwind CSS · Framer Motion · Express · Knex · Stripe · Hardhat · PostgreSQL

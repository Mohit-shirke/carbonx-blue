
# ╔══════════════════════════════════════════════════════════════════════╗
# ║     CarbonX — Complete A to Z Terminal Setup Guide (Windows)        ║
# ║     VS Code Terminal · Project Path: X:\carbonx\carbonx             ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# HOW TO USE THIS GUIDE:
#   1. Open VS Code
#   2. Press Ctrl + ` (backtick key, top-left of keyboard) to open terminal
#   3. Copy and paste EACH command ONE AT A TIME
#   4. Wait for EVERY command to FULLY finish before running the next one
#   5. Yellow "warn" lines are normal — only red "ERR!" lines are problems
#   6. If something fails, jump straight to PART 13 - TROUBLESHOOTING
# ═══════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — CHECK AND INSTALL NODE.JS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First check if Node.js is already installed. In VS Code terminal:

    node --version

✅ GOOD:  Shows v20.x.x or v18.x.x — skip to PART 2
❌ ERROR: "not recognized" — follow steps below

--- INSTALL NODE.JS (only if not installed) ---
1. Go to: https://nodejs.org/en/download
2. Click the big green "LTS" button → download Windows Installer (.msi)
3. Run the installer — click Next through everything
   IMPORTANT: make sure "Add to PATH" checkbox stays checked
4. After install — CLOSE VS Code completely, then reopen it
5. Confirm install worked:

    node --version
    npm --version

   Should show: v20.x.x and 10.x.x


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — INSTALL POSTGRESQL DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHOOSE ONE OPTION:

╔═══════════════════════════════════════════════════════════════════╗
║  OPTION A — Docker (RECOMMENDED, easiest)                        ║
╚═══════════════════════════════════════════════════════════════════╝

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install it and RESTART your computer
3. Open Docker Desktop — wait until the whale icon in taskbar stops animating
4. Check Docker is working:

    docker --version

   Shows: Docker version 24.x.x or higher — good

5. Start a PostgreSQL container (ONE command — paste it all at once):

    docker run --name carbonx_postgres -e POSTGRES_DB=carbonx_db -e POSTGRES_USER=carbonx -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine

   ✅ Success: prints a long string of random letters/numbers (container ID)

6. Confirm it is running:

    docker ps

   ✅ Success: shows a row with "carbonx_postgres" and status "Up X seconds"

→ SKIP TO PART 3


╔═══════════════════════════════════════════════════════════════════╗
║  OPTION B — Direct PostgreSQL Install (no Docker)                ║
╚═══════════════════════════════════════════════════════════════════╝

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer" (EDB installer link)
3. Download version 16 for Windows x86-64
4. Run the installer with these exact settings:
   • Password:  password    ← TYPE EXACTLY THIS (all lowercase)
   • Port:      5432        ← leave default
   • Everything else: leave as default, click Next
5. After install, open a NEW terminal in VS Code and run:

    psql -U postgres -h localhost

   Type the password: postgres  (or whatever you set)
   You will see the psql prompt:  postgres=#

6. Now type these commands ONE AT A TIME inside psql:

    CREATE USER carbonx WITH PASSWORD 'password';

    CREATE DATABASE carbonx_db OWNER carbonx;

    GRANT ALL PRIVILEGES ON DATABASE carbonx_db TO carbonx;

    \q

   ✅ Each line prints: CREATE ROLE / CREATE DATABASE / GRANT / (exits)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — EXTRACT PROJECT AND OPEN IN VS CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Find the carbonx.zip file you downloaded from Claude
2. Right-click carbonx.zip → "Extract All"
3. In the "Extract to" box type:   X:\carbonx\
   (If X: drive doesn't exist, use C:\carbonx\ and adjust all commands below)
4. Click Extract
5. You should now have this structure:
     X:\carbonx\carbonx\
       ├── frontend\
       ├── backend\
       ├── contracts\
       ├── docker-compose.yml
       └── README.md

6. Open VS Code
7. Click:  File → Open Folder
8. Navigate to:  X:\carbonx\carbonx
9. Click "Select Folder"
10. Press Ctrl + ` to open the terminal

11. Confirm you are in the right place:

    cd /d X:\carbonx\carbonx
    dir

    ✅ Should list: backend  contracts  frontend  docker-compose.yml  README.md


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — CREATE ENVIRONMENT FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4A — BACKEND .env FILE
─────────────────────────────
Make sure you are at project root first:

    cd /d X:\carbonx\carbonx

Copy the example file:

    copy backend\.env.example backend\.env

Open it in VS Code editor:

    code backend\.env

The file opens. Find and edit THESE specific lines:
(leave everything else exactly as-is)

    JWT_SECRET=carbonx_super_secret_32chars_minimum_change_this_now_abc123

    STRIPE_SECRET_KEY=sk_test_...
    (→ Get from: https://dashboard.stripe.com → Developers → API Keys → Secret key)
    (→ Make sure TEST MODE toggle is ON — orange label at top of Stripe page)

    STRIPE_WEBHOOK_SECRET=whsec_placeholder
    (→ Leave as placeholder for now — you will update this in PART 10)

    RELAYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
    (→ Export from MetaMask: click 3 dots on account → Account Details → Export Private Key)
    (→ ⚠️ CREATE A FRESH METAMASK ACCOUNT just for testing — never use your real wallet!)

Press Ctrl + S to save.


STEP 4B — FRONTEND .env.local FILE
────────────────────────────────────
Still at project root (X:\carbonx\carbonx), run:

    copy frontend\.env.example frontend\.env.local

Open it:

    code frontend\.env.local

Edit these lines:

    NEXT_PUBLIC_API_URL=http://localhost:4000

    NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
    (→ Free at: https://cloud.walletconnect.com → Sign up → New Project → copy Project ID)

    NEXT_PUBLIC_STRIPE_PK=pk_test_...
    (→ Same Stripe page as above → Publishable key — starts with pk_test_)

    NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
    (→ Leave as zeros for now — update after Part 7)

Press Ctrl + S to save.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — INSTALL ALL NPM PACKAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run these THREE blocks in order. Each takes 2-5 minutes.
Wait for each to FINISH before running the next.

STEP 5A — BACKEND:

    cd /d X:\carbonx\carbonx\backend
    npm install

    ✅ Done when you see: "added XXX packages" and cursor returns

STEP 5B — FRONTEND:

    cd /d X:\carbonx\carbonx\frontend
    npm install

    ✅ Done when you see: "added XXX packages" (takes longer — be patient)

STEP 5C — CONTRACTS:

    cd /d X:\carbonx\carbonx\contracts
    npm install

    ✅ Done when you see: "added XXX packages"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — RUN DATABASE MIGRATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This creates all the database tables (users, projects, payments, etc.)
PostgreSQL MUST be running before this step.

    cd /d X:\carbonx\carbonx\backend
    npm run migrate

✅ SUCCESS output:
   Batch 1 run: 1 migrations

❌ "Connection refused" means PostgreSQL is not running:
   Docker users → run:  docker start carbonx_postgres
   Direct install → Win+R → services.msc → find "postgresql-x64-16" → Start it


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — COMPILE AND DEPLOY SMART CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREREQUISITES:
  • MetaMask extension installed in Chrome/Firefox/Brave
  • A testnet-only wallet (create a fresh new account in MetaMask)
  • Free testnet MATIC in that wallet

STEP 7A — ADD POLYGON AMOY NETWORK TO METAMASK
────────────────────────────────────────────────
In MetaMask:
1. Click the network dropdown at the top (shows "Ethereum Mainnet")
2. Click "Add Network" → "Add a network manually"
3. Fill in exactly:
   Network Name:  Polygon Amoy Testnet
   RPC URL:       https://rpc-amoy.polygon.technology/
   Chain ID:      80002
   Symbol:        MATIC
   Explorer:      https://www.oklink.com/amoy
4. Click Save → Switch to Polygon Amoy

STEP 7B — GET FREE TESTNET MATIC
──────────────────────────────────
1. In MetaMask, make sure you're on Polygon Amoy
2. Copy your wallet address (0x...)
3. Go to: https://faucet.polygon.technology/
4. Select "Polygon Amoy" from the dropdown
5. Paste your wallet address → click Submit
6. Wait ~30 seconds
7. Check MetaMask — you should have 0.5 MATIC

STEP 7C — COMPILE THE CONTRACT
────────────────────────────────

    cd /d X:\carbonx\carbonx\contracts
    npx hardhat compile

✅ Success: "Compiled 1 Solidity file successfully"
   A new "artifacts" folder appears in the contracts directory

STEP 7D — COPY ENV FILE FOR HARDHAT
─────────────────────────────────────

    copy ..\backend\.env .env

(Hardhat needs your RELAYER_PRIVATE_KEY to deploy)

STEP 7E — DEPLOY TO POLYGON AMOY
──────────────────────────────────

    npx hardhat run scripts/deploy.js --network amoy

✅ Success output looks like:

   🌱 Deploying CarbonCredit to Polygon Amoy...
      Deployer: 0xYOUR_WALLET_ADDRESS
      Balance : 0.5 MATIC

   ✅ CarbonCredit deployed!
      Address : 0xABC123DEF456...
      Network : Polygon Amoy (Chain ID: 80002)
      Explorer: https://amoy.polygonscan.com/address/0xABC123...

   ─── Update your .env files ───────────────────────
   CONTRACT_ADDRESS=0xABC123DEF456...

📋 COPY THE CONTRACT ADDRESS — you need it in the next step!

STEP 7F — SAVE CONTRACT ADDRESS TO BOTH .env FILES
────────────────────────────────────────────────────
Open backend .env:

    code /d X:\carbonx\carbonx\backend\.env

Find CONTRACT_ADDRESS line and replace with your real address:
    CONTRACT_ADDRESS=0xABC123DEF456...

Open frontend .env.local:

    code /d X:\carbonx\carbonx\frontend\.env.local

Find NEXT_PUBLIC_CONTRACT_ADDRESS and replace:
    NEXT_PUBLIC_CONTRACT_ADDRESS=0xABC123DEF456...

Save both files with Ctrl + S.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — START THE APPLICATION (TWO TERMINALS NEEDED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You need TWO terminal panels open at the same time.

To split the terminal in VS Code:
  → Press Ctrl+Shift+5   OR
  → Click the split-terminal icon (looks like a rectangle split in two)
    in the top-right corner of the terminal panel

TERMINAL 1 — START BACKEND:

    cd /d X:\carbonx\carbonx\backend
    npm run dev

✅ Wait until you see ALL THREE of these lines:
   🌱 CarbonX Backend running on http://localhost:4000
   Environment: development
   ✅ PostgreSQL connected

   ⚠️ IMPORTANT: Do NOT close this terminal. Keep it running!


TERMINAL 2 — START FRONTEND:
(Click on the right/second terminal panel first)

    cd /d X:\carbonx\carbonx\frontend
    npm run dev

✅ Wait until you see:
   ▲ Next.js 14.x.x
   - Local:   http://localhost:3000
   ✓ Ready in Xs

   ⚠️ IMPORTANT: Do NOT close this terminal. Keep it running!

   Note: First run may take 30-60 seconds — be patient.


STEP 8C — OPEN IN BROWSER

Open Google Chrome, Firefox, or Brave and navigate to:

    http://localhost:3000

🎉 You should see the CarbonX homepage!


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — EXPLORE THE APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 9A — REGISTER AN ACCOUNT

1. Go to: http://localhost:3000/auth
2. Click "Create Account" tab
3. Fill in: Name, Email, Password
4. Select a role (e.g. "Corporate Enterprise Buyer")
5. Click "Create Account"
6. You will be redirected to the dashboard

STEP 9B — EXPLORE ALL PAGES

Dashboard   → http://localhost:3000/dashboard
  • Animated KPI cards at the top
  • Interactive Sundarbans mangrove SVG map
    (hover over green/amber circles to see NDVI telemetry popups)
  • Live transaction ticker on the right — watch MINT/RETIRE events scroll

Marketplace → http://localhost:3000/marketplace
  • 6 blue carbon project cards with NDVI heatmap banners
  • Filter by Active / Upcoming
  • Search by name or location
  • Click "Purchase Carbon Credits" on any active project
  • Checkout drawer slides open — test both payment tabs:
    Tab 1: Web3/MATIC (requires MetaMask connected)
    Tab 2: Card/USD (Stripe sandbox — see test cards below)

MRV Page    → http://localhost:3000/mrv
  • Shows project validation queue
  • Click "Run MRV Analysis" on a pending project
  • Watch the Sentinel-2 satellite pipeline stream step by step
  • Project status changes to VERIFIED automatically
  • (Requires Government Validator role — register with that role to test)

Ledger      → http://localhost:3000/ledger
  • Table of all on-chain credit retirement records
  • Form to retire credits (requires wallet connected + deployed contract)
  • Each record links to OKLink block explorer

AI Chatbot  → Click the GREEN PULSING BUTTON at bottom-right corner
  • Click "💡 Tour the Marketplace" for automated guided tour
  • Click "🌱 Learn About AI MRV Validation"
  • Click "🔒 View Ledger Transparency"
  • Type any question — it knows about tokens, blockchain, MRV, payments

STEP 9C — TEST STRIPE CARD PAYMENTS

In the Marketplace → click any active project → Purchase Carbon Credits
→ Switch to "Card / USD" tab in the checkout drawer
→ Use these test card numbers:

    Works (payment succeeds):     4242 4242 4242 4242
    Declined (test decline):      4000 0000 0000 0002
    3D Secure (extra auth step):  4000 0025 0000 3155

    For ALL test cards use:
    Expiry Date: 12/26  (any future date)
    CVC:         123    (any 3 digits)
    ZIP:         42424  (any 5 digits)

STEP 9D — TEST WEB3 METAMASK PAYMENTS

1. Make sure MetaMask is installed and has Polygon Amoy network added
2. Make sure you have testnet MATIC in your wallet (from Part 7B)
3. In CarbonX navbar → click "Connect Wallet"
4. MetaMask popup → click "Connect"
5. If wrong network appears → click the "Switch to Amoy" button
6. Go to Marketplace → click any project → Purchase Carbon Credits
7. Keep "Web3 / MATIC" tab selected → click "Confirm On-Chain Purchase"
8. MetaMask popup → confirm the transaction


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — STRIPE WEBHOOK SETUP (Enables Auto Token Minting)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This makes card payments automatically trigger on-chain ERC-1155 minting.
Without this step, the card payment works but tokens won't be minted.

STEP 10A — DOWNLOAD STRIPE CLI

1. Go to: https://github.com/stripe/stripe-cli/releases/latest
2. Under "Assets" find: stripe_x.x.x_windows_x86_64.zip
3. Click to download it
4. Extract the zip file
5. Inside is stripe.exe — move it to: C:\stripe\stripe.exe
   (create the C:\stripe folder if it doesn't exist)

STEP 10B — LOGIN TO STRIPE CLI

Open a THIRD terminal in VS Code (click + button in terminal panel):

    C:\stripe\stripe.exe login

Press Enter. A browser tab opens.
Click "Allow access" in the browser.
Come back to the terminal — you will see:
"Done! The Stripe CLI is configured."

STEP 10C — START FORWARDING WEBHOOKS

In that third terminal:

    C:\stripe\stripe.exe listen --forward-to localhost:4000/api/v1/payments/webhook

✅ You will see:
   > Ready! Your webhook signing secret is whsec_abc123xyz789...

📋 COPY THAT whsec_... VALUE — you need it now!

STEP 10D — UPDATE WEBHOOK SECRET IN .env

Open backend .env in VS Code:

    code /d X:\carbonx\carbonx\backend\.env

Find the STRIPE_WEBHOOK_SECRET line and replace with your copied value:

    STRIPE_WEBHOOK_SECRET=whsec_abc123xyz789...

Press Ctrl + S.

STEP 10E — RESTART THE BACKEND

Go to Terminal 1 (where backend is running):
  Press Ctrl + C to stop it
  Then run:

    npm run dev

✅ Backend restarts and now picks up the new webhook secret.

Now when you make a test card payment:
  1. Stripe CLI receives the event
  2. Forwards it to your backend
  3. Backend calls mintCarbonCredits() on Polygon Amoy
  4. ERC-1155 tokens appear in your wallet!

You will see logs in Terminal 1 like:
  [Webhook] Event received: payment_intent.succeeded
  [Relayer] ✓ Minted 10 credits for project #1 → 0xYOUR_WALLET


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — RUN SMART CONTRACT TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    cd /d X:\carbonx\carbonx\contracts
    npx hardhat test

✅ ALL 15 TESTS SHOULD PASS:

  CarbonCredit
    proposeProject
      ✓ allows anyone to propose a project
      ✓ reverts on empty metadataURI
      ✓ reverts on zero targetCredits
    verifyProject
      ✓ validator can verify a proposed project
      ✓ non-validator cannot verify
      ✓ cannot verify non-existent project
    mintCarbonCredits
      ✓ relayer can mint credits to buyer
      ✓ cannot mint beyond targetCredits
      ✓ non-relayer cannot mint
      ✓ cannot mint to zero address
    retireCredits
      ✓ buyer can retire their credits
      ✓ reverts when retiring more than balance
      ✓ reverts on empty retirement note
    availableCredits
      ✓ returns remaining mintable credits
    pausable
      ✓ owner can pause and unpause

  15 passing (Xs)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 12 — HOW TO STOP AND RESTART EACH DAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO STOP EVERYTHING:
  Terminal 1 → press Ctrl + C
  Terminal 2 → press Ctrl + C
  Terminal 3 (Stripe) → press Ctrl + C
  To stop Docker Postgres:
      docker stop carbonx_postgres

TO START AGAIN TOMORROW:
  1. Open Docker Desktop (wait for whale to stop spinning)
  2. Open VS Code → open folder X:\carbonx\carbonx
  3. Start Postgres:
         docker start carbonx_postgres
  4. Terminal 1 — backend:
         cd /d X:\carbonx\carbonx\backend
         npm run dev
  5. Terminal 2 — frontend:
         cd /d X:\carbonx\carbonx\frontend
         npm run dev
  6. Terminal 3 — Stripe webhooks (optional):
         C:\stripe\stripe.exe listen --forward-to localhost:4000/api/v1/payments/webhook
  7. Open: http://localhost:3000

✅ You do NOT need to:
   • Run npm install again
   • Run migrations again
   • Redeploy the contract again


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 13 — TROUBLESHOOTING (Common Errors & Exact Fixes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: 'node' is not recognized as an internal or external command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: Node.js not installed or not added to Windows PATH
FIX:
  1. Reinstall Node.js from https://nodejs.org — check "Add to PATH" during install
  2. CLOSE VS Code completely
  3. Reopen VS Code and try again

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: connect ECONNREFUSED 127.0.0.1:5432
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: PostgreSQL database is not running
FIX (Docker):
    docker start carbonx_postgres
    docker ps
  (verify it shows "Up X seconds")
FIX (Direct install):
  Press Win+R → type: services.msc → Enter
  Find "postgresql-x64-16" in the list
  Right-click → Start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: password authentication failed for user "carbonx"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: Database user password mismatch
FIX:
    psql -U postgres -h localhost
  (enter your postgres admin password)
    ALTER USER carbonx WITH PASSWORD 'password';
    \q

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: Cannot find module '@web3modal/wagmi/react'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: Web3Modal package not installed correctly
FIX:
    cd /d X:\carbonx\carbonx\frontend
    npm install @web3modal/wagmi@5.1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: Module not found: Can't resolve 'clsx'
   OR: Module not found: Can't resolve 'framer-motion'
   OR: Module not found: Can't resolve 'lucide-react'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: npm install did not complete properly
FIX:
    cd /d X:\carbonx\carbonx\frontend
    rmdir /s /q node_modules
    npm install

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: ENOENT: no such file or directory 'backend\.env'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: .env file was not created
FIX:
    cd /d X:\carbonx\carbonx
    copy backend\.env.example backend\.env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: Port 3000 is already in use
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: Another program is using port 3000
FIX:
    netstat -ano | findstr :3000
  Note the PID number in the last column, then:
    taskkill /PID [paste_the_number_here] /F
  Then try starting the frontend again

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: Port 4000 is already in use
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:
    netstat -ano | findstr :4000
    taskkill /PID [number] /F

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: JWT secret is too short / weak
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: Open backend\.env and make JWT_SECRET longer:
    JWT_SECRET=this_must_be_at_least_32_characters_long_carbonx2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: hardhat compile — Compiler version mismatch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:
    cd /d X:\carbonx\carbonx\contracts
    npx hardhat compile --force

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: insufficient funds for gas (during contract deploy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: Testnet wallet has no MATIC
FIX:
  1. Check your wallet is on Polygon Amoy network in MetaMask
  2. Go to https://faucet.polygon.technology/
  3. Select "Polygon Amoy" — paste your wallet address — click Submit
  4. Wait 30 seconds and try deploy again

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: Stripe webhook signature invalid
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE: Wrong webhook secret in .env or Stripe CLI not running
FIX:
  1. Make sure Terminal 3 is running:
         C:\stripe\stripe.exe listen --forward-to localhost:4000/api/v1/payments/webhook
  2. Copy the "whsec_..." value it shows
  3. Paste it into STRIPE_WEBHOOK_SECRET in backend\.env
  4. Restart backend: Ctrl+C → npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: npm warn deprecated ... (various deprecation warnings)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are WARNINGS not errors — completely normal, ignore them.
Only lines starting with "npm ERR!" are actual errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: docker: command not found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: Docker Desktop is not running
  1. Open Docker Desktop from the Start menu
  2. Wait for the whale icon in taskbar to stop animating (1-2 minutes)
  3. Try the docker command again


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE — All Important URLs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR APP:
  Home page:   http://localhost:3000
  Auth:        http://localhost:3000/auth
  Dashboard:   http://localhost:3000/dashboard
  Marketplace: http://localhost:3000/marketplace
  MRV:         http://localhost:3000/mrv
  Ledger:      http://localhost:3000/ledger

BACKEND API:
  Health check:  http://localhost:4000/health
  All routes:    http://localhost:4000/api/v1/...

EXTERNAL (free accounts needed):
  Stripe (test keys):    https://dashboard.stripe.com
  WalletConnect ID:      https://cloud.walletconnect.com
  Polygon Faucet:        https://faucet.polygon.technology
  Amoy Block Explorer:   https://www.oklink.com/amoy
  Amoy Polygonscan:      https://amoy.polygonscan.com


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE — All Commands in Order (Copy This for Daily Use)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

════ FIRST TIME ONLY (run once, in this order) ════

  docker run --name carbonx_postgres -e POSTGRES_DB=carbonx_db -e POSTGRES_USER=carbonx -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine

  cd /d X:\carbonx\carbonx\backend   && npm install
  cd /d X:\carbonx\carbonx\frontend  && npm install
  cd /d X:\carbonx\carbonx\contracts && npm install

  cd /d X:\carbonx\carbonx
  copy backend\.env.example backend\.env
  copy frontend\.env.example frontend\.env.local

  [EDIT BOTH .env FILES WITH YOUR KEYS - see Part 4]

  cd /d X:\carbonx\carbonx\backend
  npm run migrate

  cd /d X:\carbonx\carbonx\contracts
  npx hardhat compile
  copy ..\backend\.env .env
  npx hardhat run scripts/deploy.js --network amoy

  [COPY CONTRACT ADDRESS INTO BOTH .env FILES - see Part 7F]


════ EVERY DAY (run these each time) ════

  docker start carbonx_postgres

  [Terminal 1]:
  cd /d X:\carbonx\carbonx\backend && npm run dev

  [Terminal 2]:
  cd /d X:\carbonx\carbonx\frontend && npm run dev

  [Terminal 3 - optional for payments]:
  C:\stripe\stripe.exe listen --forward-to localhost:4000/api/v1/payments/webhook

  Open browser: http://localhost:3000


════ TESTING ════

  cd /d X:\carbonx\carbonx\contracts && npx hardhat test

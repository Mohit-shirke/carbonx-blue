# ============================================================
#   CarbonX — VS Code Terminal Commands
#   Path: X:\carbonx_final\carbonx
#   Copy each command ONE AT A TIME into your terminal
# ============================================================


# ════════════════════════════════════════════════════════════
# STEP 1 — Open VS Code at project root
# ════════════════════════════════════════════════════════════

# Press Ctrl+` in VS Code to open terminal, then run:

cd /d X:\carbonx_final\carbonx


# ════════════════════════════════════════════════════════════
# STEP 2 — Start PostgreSQL via Docker (run ONCE ever)
# ════════════════════════════════════════════════════════════

docker run --name carbonx_postgres -e POSTGRES_DB=carbonx_db -e POSTGRES_USER=carbonx -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine


# ════════════════════════════════════════════════════════════
# STEP 3 — Create environment files (run ONCE ever)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local


# ════════════════════════════════════════════════════════════
# STEP 4 — Install backend packages (run ONCE ever)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\backend
npm install


# ════════════════════════════════════════════════════════════
# STEP 5 — Install frontend packages (run ONCE ever)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\frontend
npm install


# ════════════════════════════════════════════════════════════
# STEP 6 — Install contract packages (run ONCE ever)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\contracts
npm install


# ════════════════════════════════════════════════════════════
# STEP 7 — Run database migrations (run ONCE ever)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\backend
npm run migrate


# ════════════════════════════════════════════════════════════
# STEP 8 — Compile smart contract (run ONCE ever)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\contracts
npx hardhat compile


# ════════════════════════════════════════════════════════════
# STEP 9 — START BACKEND (keep this terminal open always)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\backend
npm run dev


# ════════════════════════════════════════════════════════════
# STEP 10 — START FRONTEND (open a 2nd terminal with Ctrl+Shift+5)
# ════════════════════════════════════════════════════════════

cd /d X:\carbonx_final\carbonx\frontend
npm run dev


# ════════════════════════════════════════════════════════════
# STEP 11 — Open in browser
# ════════════════════════════════════════════════════════════

# Open Chrome/Firefox and go to:
# http://localhost:3000


# ════════════════════════════════════════════════════════════
# EVERY DAY AFTER (only these 3 things needed):
# ════════════════════════════════════════════════════════════

# Start Postgres:
docker start carbonx_postgres

# Terminal 1 — Backend:
cd /d X:\carbonx_final\carbonx\backend
npm run dev

# Terminal 2 — Frontend:
cd /d X:\carbonx_final\carbonx\frontend
npm run dev

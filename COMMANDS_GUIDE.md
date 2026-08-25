# CarbonX — Complete A to Z Command Guide
# Location: X:\CarbonX Blue
# Terminal: PowerShell in VS Code (Ctrl+`)

## EVERY DAY STARTUP
    docker start carbonx_postgres
    [Terminal 1] cd "X:\CarbonX Blue\carbonx_updated\backend" && npm run dev
    [Terminal 2] cd "X:\CarbonX Blue\carbonx_updated\frontend" && npm run dev
    [Browser] http://localhost:3000

## FIRST TIME SETUP (run once in order)
    docker run --name carbonx_postgres -e POSTGRES_DB=carbonx_db -e POSTGRES_USER=carbonx -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine
    cd "X:\CarbonX Blue\carbonx_updated"
    Copy-Item backend\.env.example backend\.env
    Copy-Item frontend\.env.example frontend\.env.local
    cd backend && npm install && npm run migrate && npm run seed
    cd ..\frontend && npm install
    cd ..\contracts && npm install && npx hardhat compile
    Copy-Item ..\backend\.env .env
    npx hardhat run scripts/deploy.js --network amoy

## DOCKER CONFLICT ERROR FIX
    docker start carbonx_postgres
    # If that fails:
    docker rm -f carbonx_postgres
    docker run --name carbonx_postgres -e POSTGRES_DB=carbonx_db -e POSTGRES_USER=carbonx -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine
    cd backend && npm run migrate && npm run seed

## STOP EVERYTHING
    Ctrl+C (in each terminal)
    docker stop carbonx_postgres

## ALL PAGES
    http://localhost:3000           # Home
    http://localhost:3000/auth      # Login / Register
    http://localhost:3000/dashboard # Analytics
    http://localhost:3000/marketplace # Buy credits
    http://localhost:3000/mrv       # MRV pipeline
    http://localhost:3000/ledger    # Retirements
    http://localhost:3000/calculator # Carbon footprint
    http://localhost:3000/pricing   # Revenue model
    http://localhost:3000/about     # Team & mission
    http://localhost:3000/blog      # Articles
    http://localhost:3000/feedback  # Reviews
    http://localhost:3000/contact   # Contact form
    http://localhost:3000/profile   # My account
    http://localhost:3000/terms     # Terms of service
    http://localhost:3000/privacy   # Privacy policy
    http://localhost:4000/health    # API health check

## STRIPE TEST CARDS
    Success:   4242 4242 4242 4242  Expiry: 12/26  CVC: 123
    Declined:  4000 0000 0000 0002
    3D Secure: 4000 0025 0000 3155

## USEFUL COMMANDS
    docker ps                          # check postgres running
    docker logs carbonx_postgres       # postgres logs
    npm run migrate                    # run DB migrations
    npm run migrate:rollback           # rollback migration
    npm run seed                       # seed sample projects
    npx hardhat compile                # compile contract
    npx hardhat test                   # run 15 tests
    npx hardhat run scripts/deploy.js --network amoy  # deploy
    netstat -ano | findstr :3000       # check port
    netstat -ano | findstr :4000       # check port

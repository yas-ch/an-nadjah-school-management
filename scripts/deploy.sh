#!/usr/bin/env bash
# =============================================================================
# AN-NADJAH — Production Deployment Script
# Run this on your Ubuntu VPS after cloning the repository.
# =============================================================================

set -euo pipefail

echo "=== AN-NADJAH Deployment ==="

# 1. Ensure environment variables
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in your values."
  exit 1
fi

# 2. Install production dependencies
echo "→ Installing dependencies..."
npm ci --omit=dev

# 3. Generate Prisma Client
echo "→ Generating Prisma Client..."
npx prisma generate

# 4. Push database schema
echo "→ Pushing database schema..."
npx prisma db push

# 5. Build Next.js
echo "→ Building application..."
npm run build

# 6. Start via PM2
echo "→ Starting with PM2..."
pm2 delete annadjah 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# 7. Save PM2 process list for auto-restart
pm2 save

echo "=== Deployment Complete ==="
echo "→ App running at http://localhost:3000"
echo "→ Run 'pm2 status' to check process health"
echo "→ Run 'pm2 logs annadjah' to view logs"

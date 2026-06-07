#!/usr/bin/env bash
# =============================================================================
# AN-NADJAH — Production Deployment Script
# Run this on your Ubuntu VPS after cloning the repository.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   sudo ./scripts/deploy.sh
# =============================================================================

set -euo pipefail

APP_NAME="annadjah"
APP_DIR="/var/www/annadjah"
PORT="${PORT:-3000}"

echo "=== AN-NADJAH Deployment ==="
echo "Target: $APP_DIR"

# 1. Check .env exists
if [ ! -f "$APP_DIR/.env" ]; then
  echo "ERROR: .env file not found at $APP_DIR/.env"
  echo "Copy .env.example to .env and fill in your values:"
  echo "  cp $APP_DIR/.env.example $APP_DIR/.env"
  echo "  nano $APP_DIR/.env"
  exit 1
fi

# 2. Load env for immediate use
set -a
source "$APP_DIR/.env"
set +a

# 3. Ensure DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set in .env"
  exit 1
fi

# 4. Install dependencies
echo "→ Installing production dependencies..."
cd "$APP_DIR"
npm ci --omit=dev --ignore-scripts 2>&1

# 5. Generate Prisma Client (requires DATABASE_URL from .env)
echo "→ Generating Prisma Client..."
npx prisma generate 2>&1

# 6. Push database schema
echo "→ Pushing database schema..."
npx prisma db push --skip-generate 2>&1

# 7. Build Next.js
echo "→ Building application..."
npm run build 2>&1

# 8. Ensure logs directory exists
mkdir -p "$APP_DIR/logs"

# 9. Start or reload PM2
echo "→ Starting with PM2..."
if pm2 list | grep -q "$APP_NAME"; then
  pm2 reload ecosystem.config.cjs --env production 2>&1
else
  pm2 start ecosystem.config.cjs --env production 2>&1
fi

# 10. Save PM2 process list (auto-restart on server reboot)
pm2 save 2>&1

# 11. Verify
echo ""
echo "=== Deployment Complete ==="
echo "→ App running on port $PORT (via PM2)"
echo ""
echo "Useful commands:"
echo "  pm2 status              — check process health"
echo "  pm2 logs $APP_NAME       — view live logs"
echo "  pm2 monit               — monitor CPU/memory"
echo "  sudo systemctl reload nginx — reload nginx config"
echo ""
echo "If nginx is configured, the app should be accessible at:"
echo "  https://annadjah.app"

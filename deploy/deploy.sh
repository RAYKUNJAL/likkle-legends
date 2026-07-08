#!/usr/bin/env bash
# Likkle Legends — VPS deploy/update script.
# Usage: ./deploy/deploy.sh   (run from the repo root on the VPS)
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
    echo "ERROR: .env.production not found. Copy .env.production.example and fill it in first."
    exit 1
fi

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Building and restarting containers"
docker compose --env-file .env.production build web
docker compose --env-file .env.production up -d

echo "==> Waiting for the app to come up"
for i in $(seq 1 30); do
    if docker compose exec -T web wget -qO- http://127.0.0.1:3000/api/health > /dev/null 2>&1; then
        echo "==> App is healthy"
        break
    fi
    [ "$i" = 30 ] && { echo "ERROR: app failed health check"; docker compose logs --tail 50 web; exit 1; }
    sleep 2
done

echo "==> Cleaning up old images"
docker image prune -f > /dev/null

echo "==> Deploy complete: $(git rev-parse --short HEAD)"

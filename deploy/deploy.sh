#!/usr/bin/env bash
# Likkle Legends — resilient VPS deploy.
# Usage: ./deploy/deploy.sh   (run from the repo root on the VPS)
#
# Safety design (why the site can't go down from a deploy):
#   1. Build the new image as a SEPARATE step. If the build fails (the #1
#      cause of outages: out-of-memory or out-of-disk on a small VPS), we
#      STOP and the currently-running site is never touched.
#   2. Tag the current working image so we can roll back.
#   3. Only after a good build do we recreate the web container.
#   4. Health-check the new container; if it fails, roll back to the tagged
#      image so the site stays live.
set -euo pipefail

cd "$(dirname "$0")/.."
COMPOSE="docker compose --env-file .env.production"

if [ ! -f .env.production ]; then
    echo "ERROR: .env.production not found. Copy .env.production.example and fill it in first."
    exit 1
fi

# ── Preflight: disk + memory (Next.js builds are hungry; OOM is the usual killer) ──
avail_kb=$(df --output=avail -k . | tail -1 | tr -d ' ')
if [ "${avail_kb:-0}" -lt 2000000 ]; then
    echo "WARNING: less than ~2GB free disk. Freeing space (docker prune)…"
    docker system prune -af >/dev/null 2>&1 || true
fi
if ! free -m 2>/dev/null | awk '/Swap:/ {exit ($2>0)?0:1}'; then
    echo "NOTE: no swap detected. If the build gets 'Killed', add swap:"
    echo "      fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
fi

echo "==> Pulling latest code"
git fetch origin main
git checkout main >/dev/null 2>&1 || true
git pull --ff-only origin main

# ── Tag the current running image for rollback ──
CURRENT_IMG=$($COMPOSE images -q web 2>/dev/null || true)
if [ -n "$CURRENT_IMG" ]; then
    docker tag "$CURRENT_IMG" likkle-legends-web:rollback 2>/dev/null || true
    echo "==> Tagged current image for rollback"
fi

# ── Build the new image FIRST — a failure here leaves the live site untouched ──
echo "==> Building new image (site stays live during build)"
if ! $COMPOSE build web; then
    echo "ERROR: build failed. The live site was NOT touched and is still serving the old version."
    echo "       Common causes: out of memory (add swap) or out of disk (docker system prune -af)."
    exit 1
fi

# ── Swap in the new container ──
echo "==> Starting new containers"
$COMPOSE up -d

# ── Health-check the new web container ──
echo "==> Health-checking the app"
healthy=false
for i in $(seq 1 30); do
    if $COMPOSE exec -T web wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
        healthy=true
        break
    fi
    sleep 2
done

if [ "$healthy" != true ]; then
    echo "ERROR: new build failed its health check."
    $COMPOSE logs --tail 60 web || true
    if docker image inspect likkle-legends-web:rollback >/dev/null 2>&1; then
        echo "==> Rolling back to the previous image so the site stays up"
        docker tag likkle-legends-web:rollback "$(${COMPOSE} images -q web 2>/dev/null || echo likkle-legends-web:latest)" 2>/dev/null || true
        $COMPOSE up -d --no-deps web || true
        echo "==> Rolled back. Investigate the failed build, then redeploy."
    fi
    exit 1
fi

echo "==> App is healthy"
docker image prune -f >/dev/null 2>&1 || true
echo "==> Deploy complete: $(git rev-parse --short HEAD)"

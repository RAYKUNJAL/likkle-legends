#!/usr/bin/env bash
# Likkle Legends — universal VPS updater.
# Detects how the site is currently running (docker compose or pm2/systemd)
# and updates it in place. Safe to run repeatedly. Used by the GitHub
# Actions deploy workflow and fine to run by hand.
set -euo pipefail

cd "$(dirname "$0")/.."
echo "==> Repo: $(pwd)"

echo "==> Pulling latest main"
git fetch origin main
git checkout main >/dev/null 2>&1 || true
git pull --ff-only origin main

if docker compose ps --status running 2>/dev/null | grep -qE 'web|caddy'; then
    echo "==> Detected docker compose deployment"
    exec ./deploy/deploy.sh
fi

echo "==> No compose stack running — using node build + process manager"
npm install --no-audit --no-fund
npm run build

if command -v pm2 >/dev/null 2>&1 && pm2 list 2>/dev/null | grep -q online; then
    echo "==> Restarting pm2 processes"
    pm2 restart all --update-env
elif systemctl is-active --quiet likkle-legends 2>/dev/null; then
    echo "==> Restarting systemd service"
    sudo systemctl restart likkle-legends
else
    echo "!! Build complete, but no known process manager found."
    echo "!! Restart your app process manually to serve the new build."
    exit 1
fi

echo "==> Waiting for health check"
for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
        echo "==> App is healthy — deployed $(git rev-parse --short HEAD)"
        exit 0
    fi
    sleep 2
done
echo "!! App did not pass health check — check logs"
exit 1

#!/usr/bin/env bash
# =============================================================================
# Likkle Legends — resilient deploy with Traefik routing auto-heal.
#
# Problem: Every `docker compose up -d` recreates likkle-legends-web-1 with a
# new internal IP. The Coolify Traefik proxy caches the old IP in its dynamic
# YAML, so the site goes 502 until someone manually updates the YAML and
# restarts coolify-proxy.
#
# This script automates the whole flow: build → recreate → discover IP →
# rewrite the dynamic YAML → restart the proxy → verify all routes.
#
# Usage:   ./scripts/deploy-likkle.sh        (run from repo root ON the VPS)
# Requires: .env.production, docker, docker compose, curl, git
# =============================================================================
set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────────
PROXY_YAML="/data/coolify/proxy/dynamic/likkle-legends.yaml"
PROXY_CONTAINER="coolify-proxy"
WEB_CONTAINER="likkle-legends-web-1"
CRON_CONTAINER="likkle-legends-cron-1"
COOLIFY_NET="coolify"
SUPABASE_NET="supabase_default"
HEALTH_URL="https://likklelegends.com/api/health"
BLOG_CRON_PATH="/api/cron/generate-blog"
HEALTH_TIMEOUT=40   # iterations (×2s each)
COMPOSE="docker compose --env-file .env.production"
# Traefik dynamic-config provider watches the file directory, so a file rewrite
# is picked up automatically. We only send SIGHUP as a gentle nudge and fall back
# to a full restart only if the route check still fails.
PROXY_RESTART="${PROXY_RESTART:-signal}"   # signal | restart | none

cd "$(dirname "$0")/.."

# ── 1. Pull latest code ─────────────────────────────────────────────────────
echo "==> [1/9] Pulling latest code"
git fetch origin main
git checkout main >/dev/null 2>&1 || true
# Stash any local edits (e.g. hotfixes) so the ff-only pull succeeds.
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "       Stashing local changes"
    git stash push -u -m "auto-stash before deploy $(date -u +%FT%TZ)" >/dev/null
fi
git pull --ff-only origin main

# ── 2. Source .env.production ───────────────────────────────────────────────
echo "==> [2/9] Sourcing .env.production"
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production not found in $(pwd)"
    echo "       Copy .env.production.example and fill it in first."
    exit 1
fi
set -a; source .env.production; set +a

# ── 3. Build and start the web container ────────────────────────────────────
echo "==> [3/9] Building new image (site stays live during build)"

# Tag current image for rollback safety (matches deploy/deploy.sh pattern)
CURRENT_IMG=$($COMPOSE images -q web 2>/dev/null || true)
if [ -n "$CURRENT_IMG" ]; then
    docker tag "$CURRENT_IMG" likkle-legends-web:rollback 2>/dev/null || true
    echo "       Tagged current image for rollback"
fi

# Build FIRST — a build failure leaves the live site untouched
if ! $COMPOSE build web; then
    echo "ERROR: build failed. Live site was NOT touched."
    echo "       Common: OOM (add swap) or disk full (docker system prune -af)."
    exit 1
fi

echo "       Starting containers"
$COMPOSE up -d

# ── 4. Reconnect external networks ──────────────────────────────────────────
echo "==> [4/9] Ensuring external network connections"
# docker compose up should handle these (declared as external in compose.yml),
# but we explicitly ensure them as a safety net.
docker network connect "$COOLIFY_NET"  "$WEB_CONTAINER" 2>/dev/null || true
docker network connect "$SUPABASE_NET" "$WEB_CONTAINER" 2>/dev/null || true

# Restart cron so it picks up the new web container DNS
$COMPOSE up -d --no-deps cron 2>/dev/null || true

# ── 5. Discover the new container IP on the coolify network ──────────────────
echo "==> [5/9] Discovering new container IP on $COOLIFY_NET network"
# Iterate all networks attached to the container and pick the one matching COOLIFY_NET.
# Two equivalent forms for compatibility across Docker versions.
NEW_IP=$(docker inspect "$WEB_CONTAINER" \
    --format '{{range $net, $conf := .NetworkSettings.Networks}}{{if eq $net "'"$COOLIFY_NET"'"}}{{$conf.IPAddress}}{{end}}{{end}}')

if [ -z "$NEW_IP" ]; then
    # Fallback: parse via -j JSON + grep (works on any docker with jq absent)
    NEW_IP=$(docker inspect "$WEB_CONTAINER" \
        --format '{{json .NetworkSettings.Networks}}' \
        | grep -oE "\"$COOLIFY_NET\":\{[^}]*\"IPAddress\":\"([^\"]+)\"" \
        | grep -oE 'IPAddress":"[^"]+' | cut -d'"' -f3)
fi

if [ -z "$NEW_IP" ]; then
    echo "ERROR: could not find container IP on '$COOLIFY_NET' network."
    echo "       Is $WEB_CONTAINER connected to $COOLIFY_NET?"
    docker inspect "$WEB_CONTAINER" \
        --format "Networks: {{range \$n,\$c := .NetworkSettings.Networks}}{{\$n}}={{\$c.IPAddress}} {{end}}" || true
    exit 1
fi
echo "       New IP: $NEW_IP"

# ── 6. Rewrite the Traefik dynamic YAML ─────────────────────────────────────
echo "==> [6/9] Writing $PROXY_YAML (IP=$NEW_IP, redirect-to-https added)"

# Back up the existing file
if [ -f "$PROXY_YAML" ]; then
    cp "$PROXY_YAML" "${PROXY_YAML}.bak.$(date +%Y%m%d-%H%M%S)"
fi

cat > "$PROXY_YAML" <<YAMLEOF
# Auto-generated by scripts/deploy-likkle.sh — do NOT edit by hand.
# Last updated: $(date -u +%Y-%m-%dT%H:%M:%SZ) — container IP $NEW_IP
# Regenerates after every deploy so Traefik never serves a stale container IP.

http:
  middlewares:
    likkle-supabase-strip:
      stripPrefix:
        prefixes:
          - "/supabase"
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true

  routers:
    # HTTP → HTTPS redirect (catches ALL http traffic for this host, including /supabase)
    likklelegends-http:
      rule: "Host(\`likklelegends.com\`) || Host(\`www.likklelegends.com\`)"
      entryPoints:
        - http
      middlewares:
        - redirect-to-https
      service: likklelegends
      priority: 10

    # HTTPS main router
    likklelegends:
      rule: "Host(\`likklelegends.com\`) || Host(\`www.likklelegends.com\`)"
      entryPoints:
        - https
      service: likklelegends
      tls:
        certResolver: letsencrypt
      priority: 10

    # Supabase API proxy — strip /supabase prefix (higher priority wins)
    likkle-supabase:
      rule: "(Host(\`likklelegends.com\`) || Host(\`www.likklelegends.com\`)) && PathPrefix(\`/supabase\`)"
      entryPoints:
        - https
      middlewares:
        - likkle-supabase-strip
      service: likkle-supabase-svc
      tls:
        certResolver: letsencrypt
      priority: 100

  services:
    likklelegends:
      loadBalancer:
        servers:
          - url: "http://$NEW_IP:3000"
    likkle-supabase-svc:
      loadBalancer:
        servers:
          - url: "http://supabase-kong:8000"
YAMLEOF

echo "       YAML written ($(wc -l < "$PROXY_YAML") lines)"

# ── 7. Reload coolify-proxy ──────────────────────────────────────────────────
echo "==> [7/9] Reloading $PROXY_CONTAINER"
# The file provider watches /traefik/dynamic/ and auto-reloads on change.
# We send SIGHUP as a belt-and-suspenders nudge; fall back to a full restart
# only if the operator explicitly asks for it via PROXY_RESTART=restart.
if [ "$PROXY_RESTART" = "restart" ]; then
    echo "       Full restart requested (PROXY_RESTART=restart)"
    docker restart "$PROXY_CONTAINER" >/dev/null
elif [ "$PROXY_RESTART" = "signal" ]; then
    # SIGHUP triggers a config reload without dropping connections.
    docker kill -s HUP "$PROXY_CONTAINER" >/dev/null 2>&1 || true
    echo "       Sent SIGHUP (file watcher also auto-reloads)"
else
    echo "       PROXY_RESTART=none — relying on file watcher alone"
fi

# ── 8. Wait for healthy and verify routes ───────────────────────────────────
echo "==> [8/9] Waiting for $PROXY_CONTAINER to become healthy"
proxy_healthy=false
for i in $(seq 1 "$HEALTH_TIMEOUT"); do
    status=$(docker inspect "$PROXY_CONTAINER" --format '{{.State.Health.Status}}' 2>/dev/null || echo "")
    if [ "$status" = "healthy" ]; then
        proxy_healthy=true
        echo "       coolify-proxy healthy (attempt $i)"
        break
    fi
    sleep 2
done

if [ "$proxy_healthy" != true ]; then
    echo "       WARNING: coolify-proxy not healthy after ${HEALTH_TIMEOUT}×2s — continuing anyway"
    docker logs --tail 10 "$PROXY_CONTAINER" 2>&1 | sed 's/^/       /' || true
fi

# Give Traefik a moment to load the dynamic config
sleep 2

echo ""
echo "    Verifying routes:"
fails=0

# a) HTTPS health check (the main app) — retry to allow Traefik reload to settle
https_ok=false
for attempt in 1 2 3 4 5; do
    if curl -sfL --max-time 20 "$HEALTH_URL" >/dev/null 2>&1; then
        https_ok=true
        echo "    ✓ HTTPS health check  → $HEALTH_URL (attempt $attempt)"
        break
    fi
    sleep 3
done
if [ "$https_ok" != true ]; then
    echo "    ✗ HTTPS health check FAILED after 5 attempts"
    fails=$((fails + 1))
fi

# b) HTTP → HTTPS redirect
http_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
    -H 'Host: likklelegends.com' \
    "http://localhost/api/health" 2>/dev/null || echo "000")
if [ "$http_code" = "301" ] || [ "$http_code" = "308" ]; then
    echo "    ✓ HTTP→HTTPS redirect → $http_code"
else
    echo "    ✗ HTTP→HTTPS redirect NOT working (got $http_code, expected 301/308)"
    fails=$((fails + 1))
fi

# c) /supabase route (should NOT 502/503 — 401/404 means route works, just no auth)
supa_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
    "https://likklelegends.com/supabase/" 2>/dev/null || echo "000")
case "$supa_code" in
    2*|30*|40*|429) echo "    ✓ /supabase/ route    → $supa_code (reachable)" ;;
    502|503|504|000)
        echo "    ✗ /supabase/ route    → $supa_code (proxy can't reach backend)"
        fails=$((fails + 1))
        ;;
    *) echo "    ? /supabase/ route    → $supa_code (unexpected but not 502)" ;;
esac

# d) Verify the YAML has the correct IP
yaml_ip=$(grep 'url: "http://' "$PROXY_YAML" | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+')
if [ "$yaml_ip" = "$NEW_IP" ]; then
    echo "    ✓ YAML IP matches    → $yaml_ip"
else
    echo "    ✗ YAML IP mismatch    → YAML has '$yaml_ip', container has '$NEW_IP'"
    fails=$((fails + 1))
fi

echo ""
if [ "$fails" -gt 0 ]; then
    echo "    ⚠ $fails verification(s) failed — site may have routing issues"
else
    echo "    ✓ All route verifications passed"
fi

# ── 9. Fire the blog cron to keep content fresh ──────────────────────────────
echo "==> [9/9] Firing blog cron ($BLOG_CRON_PATH)"
if docker ps --format '{{.Names}}' | grep -q "^${CRON_CONTAINER}$"; then
    # Use `sh` to invoke run-cron.sh so it works even if the exec bit is not set
    # (the file is bind-mounted read-only from the repo and may be mode 0644).
    if docker exec "$CRON_CONTAINER" sh /scripts/run-cron.sh "$BLOG_CRON_PATH" 2>&1 | sed 's/^/       /'; then
        echo "       Blog cron fired"
    else
        echo "       (blog cron failed — non-fatal, will retry on schedule)"
    fi
else
    echo "       (cron container not running — skipping blog cron fire)"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
docker image prune -f >/dev/null 2>&1 || true
echo ""
echo "============================================================"
echo " Deploy complete: $(git rev-parse --short HEAD)"
echo " Container IP:    $NEW_IP (on $COOLIFY_NET)"
echo " Proxy YAML:      $PROXY_YAML"
echo " Failures:        $fails"
echo "============================================================"

if [ "$fails" -gt 0 ]; then
    exit 1
fi

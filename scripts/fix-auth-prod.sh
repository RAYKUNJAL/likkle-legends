#!/usr/bin/env bash
# Run ON trini as root. Fixes Likkle Legends login/signup auth wiring.
set -euo pipefail

ENV_FILE=/opt/likkle-legends/.env.production
TRAEFIK_FILE=/data/coolify/proxy/dynamic/likkle-legends.yaml
BACKUP_DIR=/opt/likkle-legends/backups
TS=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"
cp -a "$ENV_FILE" "$BACKUP_DIR/env.production.$TS.bak"
cp -a "$TRAEFIK_FILE" "$BACKUP_DIR/likkle-legends.yaml.$TS.bak"

echo "[1/6] Writing Traefik route for /supabase/* -> supabase-kong:8000 (strip prefix)"
cat > "$TRAEFIK_FILE" <<'YAML'
http:
  middlewares:
    likkle-supabase-strip:
      stripPrefix:
        prefixes:
          - "/supabase"

  routers:
    likklelegends:
      rule: "Host(`likklelegends.com`) || Host(`www.likklelegends.com`)"
      entryPoints:
        - http
        - https
      service: likklelegends
      tls:
        certResolver: letsencrypt
      priority: 10

    likkle-supabase:
      rule: "(Host(`likklelegends.com`) || Host(`www.likklelegends.com`)) && PathPrefix(`/supabase`)"
      entryPoints:
        - http
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
          - url: "http://likkle-legends-web-1:3000"
    likkle-supabase-svc:
      loadBalancer:
        servers:
          - url: "http://supabase-kong:8000"
YAML

echo "[2/6] Patching .env.production Supabase URLs"
# Server-side: docker-internal Kong
if grep -q '^SUPABASE_URL=' "$ENV_FILE"; then
  sed -i 's#^SUPABASE_URL=.*#SUPABASE_URL=http://supabase-kong:8000#' "$ENV_FILE"
else
  echo 'SUPABASE_URL=http://supabase-kong:8000' >> "$ENV_FILE"
fi

# Browser-side: public path proxy
if grep -q '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE"; then
  sed -i 's#^NEXT_PUBLIC_SUPABASE_URL=.*#NEXT_PUBLIC_SUPABASE_URL=https://www.likklelegends.com/supabase#' "$ENV_FILE"
else
  echo 'NEXT_PUBLIC_SUPABASE_URL=https://www.likklelegends.com/supabase' >> "$ENV_FILE"
fi

# Keep non-public anon fallback aligned if present
if grep -q '^SUPABASE_ANON_KEY=' "$ENV_FILE"; then
  :
elif grep -q '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE"; then
  NP_ANON=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d= -f2-)
  echo "SUPABASE_ANON_KEY=$NP_ANON" >> "$ENV_FILE"
fi

echo "  SUPABASE_URL=$(grep '^SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2-)"
echo "  NEXT_PUBLIC_SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2-)"

echo "[3/6] Ensure web container on supabase_default + coolify networks"
docker network connect supabase_default likkle-legends-web-1 2>/dev/null || true
docker network connect coolify likkle-legends-web-1 2>/dev/null || true
# Kong must also reach coolify network for Traefik name resolution if stored by name
docker network connect coolify supabase-kong 2>/dev/null || true

echo "[4/6] Probe Public /supabase auth after Traefik reload wait"
sleep 3
ANON=$(grep '^SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d= -f2-)
if [ -z "$ANON" ]; then
  ANON=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d= -f2-)
fi
code=$(curl -sk --max-time 10 -o /tmp/ll_supa.txt -w '%{http_code}' \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  "https://www.likklelegends.com/supabase/auth/v1/settings")
echo "  public auth/settings -> $code"
head -c 180 /tmp/ll_supa.txt; echo

echo "[5/6] Pull latest code + rebuild web (uses fixed env build-args)"
cd /opt/likkle-legends
git fetch origin main
git checkout main
git reset --hard origin/main

# Export env for compose build args
set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a

docker compose build --no-cache web
docker compose up -d web
sleep 2
docker network connect supabase_default likkle-legends-web-1 2>/dev/null || true
docker network connect coolify likkle-legends-web-1 2>/dev/null || true

echo "[6/6] Wait for healthy + verify"
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  st=$(docker inspect -f '{{.State.Health.Status}}' likkle-legends-web-1 2>/dev/null || echo starting)
  echo "  health=$st"
  if [ "$st" = healthy ]; then break; fi
  sleep 10
done

echo "=== Internal health-check ==="
docker exec likkle-legends-web-1 wget -qO- --timeout=8 http://127.0.0.1:3000/api/health-check || true
echo
echo "=== Public health-check ==="
curl -sk --max-time 10 https://www.likklelegends.com/api/health-check; echo
echo "=== Public supabase settings ==="
curl -sk --max-time 10 -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  https://www.likklelegends.com/supabase/auth/v1/settings | head -c 220; echo
echo "=== Server can reach Kong via docker DNS ==="
docker exec likkle-legends-web-1 wget -qO- --timeout=5 http://supabase-kong:8000/auth/v1/health 2>&1 | head -c 200; echo
echo "=== git HEAD ==="
git log -1 --oneline
echo DONE

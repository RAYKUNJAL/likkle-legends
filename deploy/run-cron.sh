#!/bin/sh
# Invoked by crond inside the likkle-legends-cron container.
# Requires CRON_SECRET and WEB_URL env vars (set in docker-compose / .env.production).
set -eu
PATH_SUFFIX="${1:-}"
if [ -z "$PATH_SUFFIX" ]; then
  echo "usage: run-cron.sh /api/cron/<name>" >&2
  exit 2
fi
if [ -z "${CRON_SECRET:-}" ]; then
  echo "CRON_SECRET missing" >&2
  exit 2
fi
# Prefer explicit WEB_URL; fall back to the reliable compose DNS name for this stack only.
BASE="${WEB_URL:-http://likkle-legends-web-1:3000}"
URL="${BASE}${PATH_SUFFIX}"
# Log to stderr so crond captures failures
echo "[cron] GET $URL" >&2
wget -qO- --timeout=120 --header="Authorization: Bearer ${CRON_SECRET}" "$URL" || {
  code=$?
  echo "[cron] FAILED $URL exit=$code" >&2
  exit $code
}
echo >&2

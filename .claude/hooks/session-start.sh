#!/bin/bash
set -euo pipefail

echo '{"async": false}'

# Only run in remote Claude Code environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "🚀 Installing dependencies for Likkle Legends..."
npm install --prefer-offline --no-audit

echo "✅ Session ready for web development"

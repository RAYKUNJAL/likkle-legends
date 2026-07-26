#!/bin/sh
# Build wrapper — sets a larger V8 stack so Next.js can analyze the massive
# portal component tree without "Maximum call stack size exceeded".
# Also sets NEXT_SKIP_SSG=1 to skip static export of pages that need DB.
export NEXT_SKIP_SSG=true
exec node --stack-size=4096 node_modules/.bin/next build

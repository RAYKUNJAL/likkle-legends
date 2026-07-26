#!/bin/sh
# Build wrapper — sets a larger V8 stack so Next.js can analyze the massive
# portal component tree without "Maximum call stack size exceeded".
exec node --stack-size=4096 node_modules/.bin/next build

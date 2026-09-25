# Likkle Legends — production image for VPS deployment
# Multi-stage build using Next.js standalone output (see next.config.mjs)

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined at build time — pass them as build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
# Plan ids must be present at image build. Runtime env_file is too late for the client bundle.
ARG NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL
ARG NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY
ARG NEXT_PUBLIC_PAYPAL_PLAN_STARTER
ARG NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY
ARG NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS
ARG NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY
ARG NEXT_PUBLIC_PAYPAL_PLAN_FAMILY
ARG NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_GA4_MEASUREMENT_ID
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID \
    NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL=$NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL \
    NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY=$NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY \
    NEXT_PUBLIC_PAYPAL_PLAN_STARTER=$NEXT_PUBLIC_PAYPAL_PLAN_STARTER \
    NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY=$NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY \
    NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS=$NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS \
    NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY=$NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY \
    NEXT_PUBLIC_PAYPAL_PLAN_FAMILY=$NEXT_PUBLIC_PAYPAL_PLAN_FAMILY \
    NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY=$NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY \
    NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID \
    NEXT_PUBLIC_GA4_MEASUREMENT_ID=$NEXT_PUBLIC_GA4_MEASUREMENT_ID \
    NEXT_TELEMETRY_DISABLED=1
# Build with increased V8 stack — the portal page is a massive component tree
# that overflows the default 984KB stack during Next.js static analysis.
COPY build.sh /app/build.sh
RUN chmod +x /app/build.sh && /app/build.sh

# ---- run ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

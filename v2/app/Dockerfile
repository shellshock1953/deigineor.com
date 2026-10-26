# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat && npm install -g pnpm@12.6.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
# NEXT_PUBLIC_* is inlined at build time, so the public URL is a build argument.
ARG NEXT_PUBLIC_SITE_URL=https://v2.deigineor.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 MEDIA_DIR=/data/media
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs \
  && mkdir -p /data/media && chown nextjs:nodejs /data/media
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/seed ./seed
USER nextjs
EXPOSE 3000
VOLUME /data/media
# Pending migrations are applied while the server boots (payload `prodMigrations`, see src/instrumentation.ts).
CMD ["node", "server.js"]

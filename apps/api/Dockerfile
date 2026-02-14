# ── Build stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm ci --workspace=@lightwatch/api --workspace=@lightwatch/shared

# Copy source
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
COPY tsconfig.base.json ./

# Build shared first, then api
RUN npm run build --workspace=@lightwatch/shared && \
    npm run build --workspace=@lightwatch/api

# ── Production stage ──────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm ci --workspace=@lightwatch/api --workspace=@lightwatch/shared --omit=dev

COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/apps/api/dist apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]

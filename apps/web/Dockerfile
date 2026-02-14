# ── Build stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

RUN npm ci --workspace=@lightwatch/web --workspace=@lightwatch/shared

COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/
COPY tsconfig.base.json ./

RUN npm run build --workspace=@lightwatch/shared && \
    npm run build --workspace=@lightwatch/web

# ── Production stage (static files served by nginx) ───────────────────
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

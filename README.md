# Lightwatch Console

Real-time monitoring dashboard for the [Lightwatch Monitoring Platform](https://github.com/RapidTest25/lightwatch-console). Built as a monorepo with a React frontend and Express BFF (Backend-for-Frontend) that proxies the Lightwatch API.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Express](https://img.shields.io/badge/Express-4-000)
![Vite](https://img.shields.io/badge/Vite-6-646cff)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (:3000)                     │
│  React + TypeScript + Vite                              │
│  Dark-theme monitoring dashboard                        │
└──────────────────────┬──────────────────────────────────┘
                       │ /v1/* (REST)  /v1/ws/* (WebSocket)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   BFF API (:4000)                       │
│  Express + TypeScript                                   │
│  Route proxy · Auth · WebSocket relay                   │
└──────┬───────────────────────────┬──────────────────────┘
       │ REST /api/*               │ WS /ws/*
       ▼                           ▼
┌──────────────┐         ┌──────────────────┐
│  Query API   │         │  Realtime API    │
│  (:3003)     │         │  (:3002)         │
└──────────────┘         └──────────────────┘
       Lightwatch Monitoring Platform
```

## Monorepo Structure

```
lightwatch-console/
├── apps/
│   ├── api/                    # Express BFF server
│   │   └── src/
│   │       ├── clients/        # Lightwatch HTTP client + WebSocket proxy
│   │       ├── config/         # Environment config loader
│   │       ├── controllers/    # Route handlers
│   │       ├── middleware/     # Auth, error handler, request logger
│   │       ├── routes/         # Modular route definitions (v1)
│   │       ├── services/       # Business logic / API calls
│   │       └── utils/          # ApiError, response helpers, sessions
│   │
│   └── web/                    # React + Vite frontend
│       └── src/
│           ├── components/     # Reusable UI (SummaryCard, StatusBadge, etc.)
│           ├── features/       # Feature pages (services, logs, metrics, ...)
│           ├── hooks/          # usePolling, useLiveStream
│           ├── lib/            # API client, relative-time formatter
│           └── styles/         # Global, layout, component styles
│
├── packages/
│   └── shared/                 # Shared TypeScript types & interfaces
│       └── src/types/          # ServiceRecord, LogEntry, Alert, etc.
│
└── infra/                      # Docker Compose + nginx reverse proxy
```

## Pages

| Page | Description |
|------|-------------|
| **Services** | Overview with summary cards (total/healthy/degraded/unhealthy), auto-refresh polling, status badges with glow indicators |
| **Logs** | Log explorer with filters (service, level, date range), pagination, and live tail via WebSocket |
| **Metrics** | System and application metrics table |
| **Security** | Security events feed with severity badges |
| **Alerts** | Alert rule management with create form + live firing feed |

## Reusable Components

| Component | Description |
|-----------|-------------|
| `SummaryCard` | Metric card with accent border and label/value/sub layout |
| `StatusBadge` | Service status with colored dot (glow + pulse for unhealthy) |
| `LiveIndicator` | Pulsing LIVE / PAUSED badge for auto-refresh state |
| `RelativeTime` | Auto-updating relative timestamp ("2m ago") with full date tooltip |
| `PageHeader` | Title + subtitle + right-aligned action slot |
| `TableSkeleton` / `CardSkeleton` | Shimmer loading placeholders |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- Lightwatch Monitoring Platform running locally:
  - Ingest API on `:3001`
  - Realtime API on `:3002`
  - Query API on `:3003`

### Install & Run

```bash
# Clone
git clone https://github.com/RapidTest25/lightwatch-console.git
cd lightwatch-console

# Install all workspace dependencies
npm install

# Create environment file for the BFF
cp apps/api/.env.example apps/api/.env

# Start BFF API server (port 4000)
cd apps/api && npm run dev &

# Start frontend dev server (port 3000)
cd apps/web && npm run dev
```

Open **http://localhost:3000** in your browser.

### Environment Variables

Create `apps/api/.env` (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | BFF server port |
| `LIGHTWATCH_API_BASE_URL` | `http://localhost:3003` | Lightwatch Query API URL |
| `LIGHTWATCH_REALTIME_URL` | `http://localhost:3002` | Lightwatch Realtime API URL |
| `LIGHTWATCH_API_KEY` | _(empty)_ | API key for Lightwatch (if auth enabled) |
| `AUTH_ENABLED` | `false` | Enable session-based console authentication |
| `SESSION_SECRET` | `dev-secret-change-me` | Secret for session signing |
| `CONSOLE_USERNAME` | `admin` | Console login username |
| `CONSOLE_PASSWORD_HASH` | _(empty)_ | SHA-256 hash of console password |
| `REQUEST_TIMEOUT_MS` | `10000` | Upstream request timeout |

Generate a password hash:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('your-password').digest('hex'))"
```

## Docker Deployment

```bash
cd infra

# Configure environment
cp .env.example .env
# Edit .env with your Lightwatch API details

# Build and start all services
docker compose up --build -d
```

This starts:
- **nginx** reverse proxy on `:80` — routes `/v1/*` → api, `/` → web
- **api** — Express BFF container
- **web** — Static React build served by nginx

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, React Router 7, TypeScript 5.7 |
| BFF API | Express 4, TypeScript, Node 18+ native `fetch`, `ws` |
| Shared | `@lightwatch/shared` — typed domain models |
| Styling | Custom CSS with CSS variables (dark theme) |
| Infra | Docker multi-stage builds, nginx, Docker Compose |

## API Routes (BFF)

```
GET    /health              # Health check
POST   /auth/login          # Session login
POST   /auth/logout         # Session logout
GET    /auth/me             # Current session info

GET    /v1/services         # List services
GET    /v1/logs             # Query logs (with filters)
GET    /v1/metrics          # Query metrics
GET    /v1/security         # Security events
GET    /v1/alerts           # List alert rules
POST   /v1/alerts           # Create alert rule

WS     /v1/ws/logs          # Live log stream
WS     /v1/ws/alerts        # Live alert feed
WS     /v1/ws/metrics       # Live metrics stream
WS     /v1/ws/security      # Live security events
```

## Scripts

```bash
# From root — runs across all workspaces
npm run dev          # Start all dev servers
npm run build        # Build all packages
npm run lint         # Type-check all packages

# Per workspace
npm run dev -w @lightwatch/api
npm run dev -w @lightwatch/web
npm run lint -w @lightwatch/api
```

## License

MIT

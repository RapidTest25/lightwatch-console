# Lightwatch Console

Web-based dashboard that consumes the Lightwatch Monitoring Platform API.

## Architecture

```
Frontend (React + TypeScript)
    ↓
Backend BFF (Express + TypeScript)
    ↓
Lightwatch Monitoring Platform API
```

## Structure

```
lightwatch-console/
  apps/
    web/        # React + TypeScript frontend
    api/        # Express + TypeScript BFF
  packages/
    shared/     # Shared types and interfaces
  infra/        # Docker and deployment configs
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development
npm run dev
```

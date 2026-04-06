# PERN Monorepo (Client + Server)

This repository is structured as a minimal, production-ready PERN starter monorepo using npm workspaces.

## Workspaces

- `client/`: React + Vite + TypeScript frontend
- `server/`: Express + TypeScript backend

## Requirements

- Node.js 20+ (recommended)
- npm 10+

## Install

From the project root:

```bash
npm install
```

## Run Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

## Build

```bash
npm run build
```

## Formatting

```bash
npm run lint
npm run format
```

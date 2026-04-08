# kafoo Agent Guidelines

## Workspace Structure

- Monorepo with `client/` (React/Vite) and `server/` (Express/TypeScript) workspaces
- Root `package.json` manages shared scripts via npm workspaces
- Feature specifications located in `specs/001-foundation-monorepo-setup/`

## Essential Commands

- `npm run dev` - Start both client (localhost:5173) and server (localhost:5000) concurrently
- `npm run build` - Build both client and server for production
- `npm run lint` - Check code formatting with Prettier
- `npm run format` - Auto-format code with Prettier

## Package-Specific Commands

**Server:**

- `npm run dev --workspace=server` - Start only server
- `npm run build --workspace=server` - Build only server
- `npm run start --workspace=server` - Run built server
- `npm run type-check --workspace=server` - Type-check server code
- Database setup: `cd server && npx prisma generate && npx prisma db push && npx prisma db seed`
- Health check: `curl http://localhost:5000/v1/health` and `curl http://localhost:5000/v1/health/db`

**Client:**

- `npm run dev --workspace=client` - Start only client
- `npm run build --workspace=client` - Build only client
- `npm run preview --workspace=client` - Preview built client
- `npm run type-check --workspace=client` - Type-check client code

## Development Flow

1. Install dependencies: `npm install`
2. Copy environment example: `cp server/.env.example server/.env` and configure values
3. Initialize database: `cd server && npx prisma generate && npx prisma db push && npx prisma db seed`
4. Start development: `npm run dev`
5. Verify health endpoints: `curl http://localhost:5000/v1/health` and `curl http://localhost:5000/v1/health/db`
6. Lint before committing: `npm run lint`
7. Format code: `npm run format`

## Specification Structure

- `specs/001-foundation-monorepo-setup/tasks.md` - 36 implementation tasks across 7 phases
- `specs/001-foundation-monorepo-setup/plan.md` - Technical architecture and stack details
- `specs/001-foundation-monorepo-setup/data-model.md` - 10-table PostgreSQL schema definition
- `specs/001-foundation-monorepo-setup/quickstart.md` - Step-by-step setup and verification guide
- `specs/001-foundation-monorepo-setup/contracts/health.md` - API response formats

## Environment

- Node.js 20+ required
- Server health check: http://localhost:5000/v1/health (not /api/health)
- Database health: http://localhost:5000/v1/health/db
- Prisma schema located in `server/prisma/schema.prisma`
- Environment variables validated via Zod in `server/src/config/env.ts`
- Seed data populates system settings in `server/prisma/seed.ts`

## Implementation Approach

- Follow task order in `tasks.md` - respect dependencies and parallel execution markers [P]
- Complete Phase 1 (Setup) and Phase 2 (Foundational) before user story work
- Implement in this order for MVP: Database schema (US1) → Health endpoints (US2)
- Then implement Middleware (US3) and Service Singletons (US4) in parallel
- Finish with Polish phase (verification and cleanup)
- Commit after each task or logical group

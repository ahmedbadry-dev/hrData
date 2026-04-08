# Implementation Plan: Foundation Setup

**Branch**: `001-foundation-monorepo-setup` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-foundation-monorepo-setup/spec.md`

## Summary

Establish the Kafoo API server foundation within the existing npm
workspaces monorepo. This phase adds: Prisma ORM with the full
10-table PostgreSQL schema, environment validation via Zod,
service singletons (Prisma, Redis, BullMQ, Mailer, LLM), Winston
structured logging, a standardized error system, response helpers,
shared utility modules, and health check endpoints — all following
the constitution's router/controller/service separation pattern.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode already enabled)
**Primary Dependencies**: Express 4.x, Prisma ORM, ioredis, BullMQ,
Winston, Zod, Nodemailer, bcrypt, jsonwebtoken
**Storage**: PostgreSQL via Prisma ORM, Redis via ioredis
**Testing**: Deferred to Phase 11
**Target Platform**: Node.js 20+ server (Linux/Windows)
**Project Type**: Web service API (monorepo backend workspace)
**Constraints**: Existing npm workspaces structure (`server/`, `client/`),
existing middleware (cors, helmet, morgan, express.json)
**Scale/Scope**: 10 database tables, ~25 new source files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                    | Status  | Notes                                                                                                                         |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| I. Architecture & Modules    | ✅ Pass | Health routes use router/controller/service pattern. All new features get own directory under `v1/modules/`.                  |
| II. Type Safety First        | ✅ Pass | `strict: true` already set. Prisma generates types. Zod validates env and future API input.                                   |
| III. Security by Default     | ✅ Pass | `crypto.util.ts` provides AES-256 helpers. JWT and auth middleware are utility stubs ready for Phase 2. Secrets never logged. |
| IV. Queue-First              | ✅ Pass | BullMQ singleton configured. No async work in this phase — queues used starting Phase 4/5.                                    |
| V. Frontend State Boundaries | N/A     | Backend-only phase.                                                                                                           |

No violations. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-monorepo-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── health.md
```

### Source Code (repository root)

```text
server/
├── prisma/
│   ├── schema.prisma          # Full 10-table schema
│   └── seed.ts                # Default system settings
├── src/
│   ├── main.ts                # Entry point (replaces index.ts)
│   ├── app.ts                 # Express app factory + middleware
│   ├── router.ts              # v1 API router mounting
│   ├── config/
│   │   ├── env.ts             # Zod env validation + typed config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── redis.ts           # ioredis client singleton
│   │   ├── bullmq.ts          # BullMQ connection + queue map
│   │   ├── mailer.ts          # Nodemailer transport singleton
│   │   ├── llm.ts             # LLM API client singleton
│   │   └── constants.ts       # App-wide constants
│   ├── v1/
│   │   └── modules/
│   │       └── health/
│   │           ├── health.routes.ts
│   │           ├── health.controller.ts
│   │           └── health.service.ts
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── error-codes.ts
│   │   └── utils/
│   │       ├── logger.util.ts
│   │       ├── hash.util.ts
│   │       ├── jwt.util.ts
│   │       ├── crypto.util.ts
│   │       ├── paginate.util.ts
│   │       ├── tracking-pixel.util.ts
│   │       └── template-compiler.util.ts
│   └── http/
│       ├── middlewares/
│       │   ├── error-handler.ts
│       │   ├── not-found.ts
│       │   └── request-logger.ts
│       └── responses/
│           ├── success.response.ts
│           └── error.response.ts
```

**Structure Decision**: The existing `server/` workspace is the
backend home. All new code goes under `server/src/` following the
PLAN.md directory conventions. The current `server/src/index.ts`
will be refactored into `main.ts` (entry) and `app.ts` (Express
setup). The `client/` workspace is untouched in this phase.

## Complexity Tracking

No constitution violations — table not needed.

# Research: Foundation Setup

**Branch**: `001-foundation-monorepo-setup`
**Date**: 2026-04-08

## R1: Prisma ORM Setup in Existing Express Project

**Decision**: Use Prisma ORM with PostgreSQL, initializing in
`server/prisma/` directory.

**Rationale**: Prisma is the project's chosen ORM (constitution).
It provides type-safe database access, auto-generated TypeScript
types, and declarative schema migrations. Placing `prisma/` inside
`server/` keeps the database concern co-located with the backend.

**Alternatives considered**:

- TypeORM: More traditional, but Prisma's generated types align
  better with the "Type Safety First" constitution principle.
- Knex.js: Query builder only, lacks the schema-as-code and
  type generation that Prisma provides.

## R2: Environment Validation Strategy

**Decision**: Use Zod to validate all environment variables at
startup in `config/env.ts`. Export a typed `env` object.

**Rationale**: Zod is already a project dependency (constitution
mandates it for API input). Reusing it for env validation avoids
adding another library. Fail-fast on missing vars prevents runtime
surprises.

**Alternatives considered**:

- envalid: Purpose-built for env validation, but adds a dependency
  when Zod already provides the same capability.
- Manual validation: Error-prone and lacks type inference.

## R3: Logging Strategy

**Decision**: Winston with two transports — colorized Console for
development, JSON-formatted Console for production.

**Rationale**: PLAN.md specifies Winston explicitly. Structured
JSON logging in production enables log aggregation tools.
Colorized output in development improves readability.

**Alternatives considered**:

- pino: Faster, but Winston is the project's stated choice and
  provides richer formatting options.
- console.log: No structured output, no log levels, no transport
  flexibility.

## R4: Redis Client Choice

**Decision**: Use ioredis as the Redis client. BullMQ requires
ioredis internally.

**Rationale**: BullMQ mandates ioredis (not node-redis). Using
ioredis directly for both BullMQ and general caching avoids
maintaining two Redis client libraries.

**Alternatives considered**:

- node-redis (redis): Incompatible with BullMQ's internal
  requirements. Would require running both clients.

## R5: Password Hashing Library

**Decision**: Use bcrypt (native C++ bindings via `bcrypt` npm
package) with salt rounds = 12.

**Rationale**: Constitution specifies bcrypt with cost factor 12.
Native bindings are faster than pure JS alternatives. The server
environment (Node.js on Linux/Windows) supports native compilation.

**Alternatives considered**:

- bcryptjs: Pure JS, no native compilation issues, but ~3x slower.
  Acceptable fallback if native build fails.
- argon2: More modern, but the project plan explicitly specifies
  bcrypt.

## R6: JWT Library

**Decision**: Use `jsonwebtoken` for signing and verifying JWTs.

**Rationale**: Industry standard for Node.js JWT operations. The
PLAN.md references passport-jwt for Phase 2 auth, which works
with jsonwebtoken tokens.

**Alternatives considered**:

- jose: More modern, supports JWE, but passport-jwt ecosystem
  is built around jsonwebtoken format.

## R7: AES-256 Encryption for Secrets at Rest

**Decision**: Use Node.js built-in `crypto` module with
AES-256-GCM for encrypting Gmail tokens and API keys.

**Rationale**: Constitution mandates AES-256 encryption. GCM mode
provides authenticated encryption (integrity + confidentiality).
No external dependency needed — Node.js `crypto` is built-in.

**Alternatives considered**:

- AES-256-CBC: Lacks built-in authentication; requires separate
  HMAC for integrity.
- External libraries (tweetnacl, libsodium): Unnecessary when
  Node.js `crypto` provides AES-256-GCM natively.

## R8: Project Entry Point Refactoring

**Decision**: Split current `server/src/index.ts` into `main.ts`
(server bootstrap) and `app.ts` (Express app factory). Health
routes move to `v1/modules/health/`.

**Rationale**: Separating app creation from server startup enables
testing the Express app without binding to a port. Moving health
routes into the module pattern follows constitution Principle I.

**Alternatives considered**:

- Keep everything in index.ts: Violates separation of concerns
  and makes testing impossible without starting the server.

## R9: Nodemailer Transport Configuration

**Decision**: Create a Nodemailer transport singleton in
`config/mailer.ts`. In development, use a test account
(Ethereal). In production, use SMTP credentials from env.

**Rationale**: The mailer singleton is needed by Phase 2 (email
verification) and Phase 5 (Gmail integration). Configuring it
now with Ethereal for dev means email flows can be tested without
real SMTP credentials.

**Alternatives considered**:

- Skip mailer until Phase 2: Creates a dependency gap — Phase 2
  would need to both create and use the singleton.

## R10: LLM Client Singleton

**Decision**: Create a placeholder LLM client singleton in
`config/llm.ts` that initializes only when `LLM_API_KEY` is
present. Uses the OpenAI SDK (or compatible).

**Rationale**: The LLM client is not used until Phase 4 (scraping).
Making it optional at startup prevents blocking development when
the API key is unavailable.

**Alternatives considered**:

- Skip until Phase 4: Same dependency gap issue as mailer.
  Better to have the singleton ready.

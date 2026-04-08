<!--
=== Sync Impact Report ===
Version change: [template] → 1.0.0 (initial ratification)
Modified principles: N/A (first fill)
Added sections:
  - Core Principles (5 principles defined)
  - Technology Stack & Constraints
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check
    section references constitution gates dynamically)
  - .specify/templates/spec-template.md — ✅ compatible (no principle-specific
    references)
  - .specify/templates/tasks-template.md — ✅ compatible (phase structure
    aligns with modular architecture principle)
  - .specify/templates/commands/*.md — no command files exist yet
Follow-up TODOs: None
=== End Sync Impact Report ===
-->

# Kafoo Constitution

## Core Principles

### I. Architecture & Modules (Express)

Every feature MUST live in its own folder with separated router,
controller, and service files.

- **Routers** MUST only wire HTTP paths to controller methods.
  No business logic, no direct DB calls.
- **Controllers** MUST only handle `req`/`res` concerns:
  parsing input, calling services, and sending responses.
- **Services** own all business logic and all database calls
  via Prisma. No other layer may import `prisma` directly.
- A new feature means a new directory under the feature root,
  never a new method bolted onto an unrelated module.

**Rationale:** Enforces single-responsibility at the module
level, keeps each layer independently testable, and prevents
the "fat controller" anti-pattern that makes refactoring
painful.

### II. Type Safety First

TypeScript strict mode (`"strict": true`) is non-negotiable
across every workspace.

- All database model types MUST come from Prisma-generated
  types — never hand-written interfaces that duplicate the
  schema.
- All API input validation MUST use Zod schemas. Raw
  `req.body` access without validation is forbidden.
- Any type that crosses application boundaries (api ↔ web ↔
  admin) MUST be defined in the shared `packages/types`
  package and imported from there.

**Rationale:** A single source of truth for types eliminates
an entire class of runtime bugs and keeps the monorepo
contracts enforceable at compile time.

### III. Security by Default

All protected routes MUST use JWT authentication middleware
chained with role-checking middleware — no unguarded endpoints
for authenticated features.

- Gmail OAuth2 refresh tokens MUST be AES-256 encrypted at
  rest before storage.
- The LLM API key MUST be AES-256 encrypted at rest.
- Secrets MUST NEVER appear in log output, API responses,
  or error payloads.
- Plain-text storage of any credential is forbidden.

**Rationale:** The platform handles user Gmail tokens and
third-party API keys. A single leak compromises user accounts
and service billing. Defense-in-depth is mandatory, not
optional.

### IV. Queue-First for Async Work

Email sends and scraper runs MUST always go through BullMQ
queues — never called directly from a route handler.

- Every queue job MUST implement retry logic: maximum 3
  attempts with exponential backoff.
- On success or failure, the job MUST update
  `applications.status` to reflect the outcome.
- Route handlers MUST enqueue work and return immediately;
  long-running operations never block the request cycle.

**Rationale:** Direct API calls from request handlers create
unpredictable latency, make retries ad-hoc, and risk losing
work on transient failures. Queues give durability,
observability, and back-pressure for free.

### V. Frontend State Boundaries

- **Server state** (fetching, caching, mutations) MUST use
  TanStack Query exclusively. No custom fetch wrappers or
  raw `useEffect` data-fetching patterns.
- **Client UI state** (modals, toggles, ephemeral selections)
  MUST use Zustand. No prop-drilling chains or Context abuse
  for transient UI state.
- **Forms** MUST use React Hook Form with a Zod resolver. No
  raw `useState` for form field values.

**Rationale:** Clear boundaries between server state, client
state, and form state eliminate an entire category of
synchronization bugs and make each concern independently
testable and replaceable.

## Technology Stack & Constraints

- **Runtime:** Node.js 20+, npm 10+, npm workspaces monorepo.
- **Backend:** Express + TypeScript, Prisma ORM, PostgreSQL,
  BullMQ (Redis-backed), JWT authentication.
- **Frontend:** React + Vite + TypeScript, TanStack Query,
  Zustand, React Hook Form + Zod.
- **Shared types:** `packages/types` workspace consumed by
  all apps.
- **Encryption:** AES-256 for all secrets at rest.
- **Queue broker:** Redis (required for BullMQ).

All dependency additions MUST be justified. Do not add a
library when the platform or an existing dependency already
provides the capability.

## Development Workflow

- Every PR MUST pass TypeScript strict compilation with zero
  errors before merge.
- Zod schemas MUST validate all external input at API
  boundaries — no unvalidated data enters services.
- Code reviews MUST verify compliance with this constitution's
  principles. Reviewers SHOULD use the Constitution Check
  section in plan documents as a gate.
- Commits SHOULD be atomic: one logical change per commit.
- Feature branches MUST branch from `main` and merge back via
  pull request.

## Governance

This constitution is the authoritative source of architectural
and process rules for the Kafoo project. It supersedes ad-hoc
decisions, chat agreements, and undocumented conventions.

- **Amendments** require: (1) a written proposal describing
  the change and rationale, (2) update to this document with
  version bump, and (3) propagation check across all
  `.specify/templates/` files.
- **Versioning** follows semantic versioning:
  - MAJOR: Principle removed or fundamentally redefined.
  - MINOR: New principle added or existing one materially
    expanded.
  - PATCH: Wording clarifications, typo fixes, non-semantic
    refinements.
- **Compliance** is verified during code review and plan
  creation. The Constitution Check section in plan documents
  MUST be completed before Phase 0 research begins.

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08

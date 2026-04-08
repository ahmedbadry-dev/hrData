# Tasks: Foundation Setup

**Input**: Design documents from `specs\001-foundation-monorepo-setup\`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts\health.md, quickstart.md
**Tests**: Not requested — no test tasks included.
**Organization**: Tasks grouped by user story from spec.md (4 stories).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4 (maps to spec.md user stories)
- All paths are relative to `server\` unless stated otherwise

## Path Conventions

- **Backend**: `server\src\`
- **Prisma**: `server\prisma\`
- **Root config**: project root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create the directory structure.

- [x] T001 Install new server dependencies by running this exact command from the `server\` directory:

  ```
  npm install @prisma/client ioredis bullmq winston zod nodemailer bcrypt jsonwebtoken uuid
  npm install -D prisma @types/nodemailer @types/bcrypt @types/jsonwebtoken @types/uuid
  ```

- [x] T002 Create the full directory structure under `server\src\`. Run these mkdir commands:
  ```
  mkdir -p server\src\config
  mkdir -p server\src\v1\modules\health
  mkdir -p server\src\shared\errors
  mkdir -p server\src\shared\utils
  mkdir -p server\src\http\middlewares
  mkdir -p server\src\http\responses
  mkdir -p server\prisma
  ```
  Do NOT delete any existing files. The existing `server\src\index.ts` will be replaced in a later task.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Every subsequent file imports from these modules.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create `server\src\config\env.ts` — Zod-validated environment configuration.
      This file MUST:
  - Import `z` from `zod`
  - Define a Zod schema for ALL required env vars (see list below)
  - Call `z.object({...}).parse(process.env)` at module load time
  - Export the parsed, typed `env` object as a named export
  - If validation fails, the error message MUST list ALL missing/invalid vars at once (Zod does this by default)

  Required environment variables and their Zod types:

  ```typescript
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().min(32),
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  LLM_API_KEY: z.string().optional().default(''),
  LLM_BASE_URL: z.string().optional().default(''),
  APP_URL: z.string().default('http://localhost:5173'),
  API_URL: z.string().default('http://localhost:5000'),
  ```

  Import `dotenv/config` at the top (side-effect import) so `.env` is loaded before parsing.

- [x] T004 [P] Create `server\src\shared\utils\logger.util.ts` — Winston logger.
      This file MUST:
  - Import `winston` (createLogger, format, transports)
  - Import `env` from `@/config/env`
  - Create and export a `logger` instance with:
    - In development (`env.NODE_ENV === 'development'`): Console transport with `format.combine(format.colorize(), format.timestamp(), format.printf(...))`
      The printf format: `${timestamp} [${level}]: ${message}`
    - In production: Console transport with `format.combine(format.timestamp(), format.json())`
    - Default level: `'info'`
  - Export the logger as the default export

- [x] T005 [P] Create `server\src\shared\errors\AppError.ts` — Custom error class.
      This file MUST:
  - Export a class `AppError` that extends `Error`
  - Constructor params: `message: string, statusCode: number, code: string, isOperational: boolean = true`
  - Store all params as public readonly properties
  - Set `this.name = 'AppError'`
  - Call `Error.captureStackTrace(this, this.constructor)`

- [x] T006 [P] Create `server\src\shared\errors\error-codes.ts` — Error code constants.
      This file MUST export an object `ErrorCodes` with these entries (each is `{ code: string, status: number, message: string }`):

  ```typescript
  export const ErrorCodes = {
    NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
    VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400, message: 'Validation failed' },
    UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Authentication required' },
    FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Insufficient permissions' },
    CONFLICT: { code: 'CONFLICT', status: 409, message: 'Resource already exists' },
    INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Internal server error' },
    DB_CONNECTION_ERROR: {
      code: 'DB_CONNECTION_ERROR',
      status: 503,
      message: 'Database connection failed',
    },
    RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Too many requests' },
    BAD_REQUEST: { code: 'BAD_REQUEST', status: 400, message: 'Bad request' },
    ACCOUNT_LOCKED: { code: 'ACCOUNT_LOCKED', status: 423, message: 'Account is locked' },
    EMAIL_NOT_VERIFIED: { code: 'EMAIL_NOT_VERIFIED', status: 403, message: 'Email not verified' },
    TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401, message: 'Token has expired' },
    INVALID_TOKEN: { code: 'INVALID_TOKEN', status: 401, message: 'Invalid token' },
  } as const;
  ```

- [x] T007 [P] Create `server\src\http\responses\success.response.ts` — Standardized success helper.
      This file MUST:
  - Import `Response` from `express`
  - Export a function `sendSuccess(res: Response, data: unknown, message: string = 'Success', statusCode: number = 200): void`
  - The function calls `res.status(statusCode).json({ success: true, message, data })`
  - Export a function `sendPaginatedSuccess(res: Response, data: unknown[], meta: { page: number; limit: number; total: number; totalPages: number }, message: string = 'Success'): void`
  - The paginated function calls `res.status(200).json({ success: true, message, data, meta })`

- [x] T008 [P] Create `server\src\http\responses\error.response.ts` — Standardized error helper.
      This file MUST:
  - Import `Response` from `express`
  - Export a function `sendError(res: Response, message: string, code: string, statusCode: number = 400): void`
  - The function calls `res.status(statusCode).json({ success: false, message, error: { code, status: statusCode } })`

- [x] T009 Create `server\src\config\constants.ts` — App-wide constants.
      This file MUST export:
  ```typescript
  export const APP_CONSTANTS = {
    BCRYPT_SALT_ROUNDS: 12,
    MAX_EMAILS_PER_DAY: 50,
    MAX_FAILED_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    VERIFICATION_TOKEN_EXPIRES_HOURS: 24,
    RESET_TOKEN_EXPIRES_HOURS: 1,
    SCRAPER_INTERVAL_MINUTES: 120,
    RATE_LIMIT_AUTH: { windowMs: 60_000, max: 10 },
    RATE_LIMIT_API: { windowMs: 60_000, max: 100 },
    PAGINATION_DEFAULT_PAGE: 1,
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
  } as const;
  ```

**Checkpoint**: Foundation ready — all shared modules are importable. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Database Schema & Data Foundation (Priority: P1) MVP

**Goal**: Complete Prisma schema with all 10 tables, client singleton, and seed script.

**Independent Test**: Run `npx prisma generate && npx prisma db push && npx prisma db seed` and verify all 10 tables exist with correct columns.

**Reference**: See `specs\001-foundation-monorepo-setup\data-model.md` for the complete entity definitions (all field names, types, constraints, and relationships).

### Implementation for User Story 1

- [x] T010 [US1] Create `server\prisma\schema.prisma` — Full database schema.
      This file MUST:
  - Use `datasource db` with `provider = "postgresql"` and `url = env("DATABASE_URL")`
  - Use `generator client` with `provider = "prisma-client-js"`
  - Define ALL 10 models exactly matching `data-model.md`:

  **Model: User** — fields: `id` (String @id @default(uuid())), `fullName` (String), `email` (String @unique), `phone` (String?), `passwordHash` (String), `role` (UserRole enum, default USER), `status` (UserStatus enum, default PENDING_VERIFICATION), `emailVerified` (Boolean, default false), `verificationToken` (String?), `verificationTokenExpiresAt` (DateTime?), `resetToken` (String?), `resetTokenExpiresAt` (DateTime?), `refreshToken` (String?), `failedLoginAttempts` (Int, default 0), `lockedUntil` (DateTime?), `createdAt` (DateTime @default(now())), `updatedAt` (DateTime @updatedAt).
  Relations: has many GmailToken, SavedJob, Cv, EmailTemplate, Application, Notification, ActivityLog.

  **Model: GmailToken** — fields: `id` (String @id @default(uuid())), `userId` (String @unique), `accessToken` (String), `refreshToken` (String), `tokenExpiry` (DateTime), `email` (String), `createdAt`, `updatedAt`.
  Relation: belongs to User (userId → User.id, onDelete: Cascade).

  **Model: Job** — fields: `id` (String @id @default(uuid())), `title` (String), `companyName` (String), `location` (String?), `category` (String?), `description` (String?), `hrEmail` (String?), `source` (String), `sourceUrl` (String?), `language` (String, default "ar"), `postedAt` (DateTime?), `expiresAt` (DateTime?), `isExpired` (Boolean, default false), `createdAt`, `updatedAt`.
  Add `@@unique([title, companyName, location])` for deduplication.
  Relations: has many SavedJob, Application.

  **Model: SavedJob** — fields: `id` (String @id @default(uuid())), `userId` (String), `jobId` (String), `createdAt` (DateTime @default(now())).
  Add `@@unique([userId, jobId])`.
  Relations: belongs to User (cascade), belongs to Job (cascade).

  **Model: Cv** — fields: `id` (String @id @default(uuid())), `userId` (String), `fileName` (String), `fileUrl` (String), `fileSize` (Int), `isDefault` (Boolean, default false), `createdAt`, `updatedAt`.
  Relation: belongs to User (cascade). Has many Application.

  **Model: EmailTemplate** — fields: `id` (String @id @default(uuid())), `userId` (String), `name` (String), `subject` (String), `body` (String), `isDefault` (Boolean, default false), `createdAt`, `updatedAt`.
  Relation: belongs to User (cascade). Has many Application.

  **Model: Application** — fields: `id` (String @id @default(uuid())), `userId` (String), `jobId` (String), `cvId` (String?), `emailTemplateId` (String?), `status` (ApplicationStatus enum, default SCHEDULED), `scheduledAt` (DateTime?), `sentAt` (DateTime?), `openedAt` (DateTime?), `trackingToken` (String? @unique), `errorMessage` (String?), `retryCount` (Int, default 0), `createdAt`, `updatedAt`.
  Relations: belongs to User (cascade), belongs to Job (cascade), belongs to Cv? (set null), belongs to EmailTemplate? (set null).

  **Model: Notification** — fields: `id` (String @id @default(uuid())), `userId` (String?), `title` (String), `body` (String), `type` (NotificationType enum, default INFO), `target` (NotificationTarget enum, default USER), `isRead` (Boolean, default false), `createdAt` (DateTime @default(now())).
  Relation: belongs to User? (cascade).

  **Model: ActivityLog** — fields: `id` (String @id @default(uuid())), `userId` (String?), `action` (String), `entityType` (String?), `entityId` (String?), `metadata` (Json?), `ipAddress` (String?), `createdAt` (DateTime @default(now())).
  Relation: belongs to User? (onDelete: SetNull).

  **Model: SystemSetting** — fields: `id` (String @id @default(uuid())), `key` (String @unique), `value` (String), `description` (String?), `createdAt`, `updatedAt`.

  **Enums** to define:

  ```prisma
  enum UserRole { USER ADMIN SUPER_ADMIN }
  enum UserStatus { PENDING_VERIFICATION ACTIVE SUSPENDED }
  enum ApplicationStatus { SCHEDULED SENDING SENT FAILED EMAIL_OPENED }
  enum NotificationType { INFO SUCCESS WARNING ALERT }
  enum NotificationTarget { ALL ADMIN USER }
  ```

  Use `@map` and `@@map` to map camelCase Prisma fields to snake_case database columns and table names. Example: `fullName String @map("full_name")` and `@@map("users")` on the User model. Apply this consistently to ALL models and fields.

- [x] T011 [US1] Create `server\src\config\prisma.ts` — Prisma client singleton.
      This file MUST:
  - Import `PrismaClient` from `@prisma/client`
  - Import `logger` from `@\shared\utils\logger.util`
  - Create a single `PrismaClient` instance. In development, attach to `globalThis` to prevent multiple instances during hot reload:
    ```typescript
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    export const prisma =
      globalForPrisma.prisma ?? new PrismaClient({ log: ['query', 'error', 'warn'] });
    if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
    ```
  - Export `prisma` as a named export

- [x] T012 [US1] Create `server\prisma\seed.ts` — Database seed script.
      This file MUST:
  - Import `PrismaClient` from `@prisma/client`
  - Create a new `PrismaClient` instance
  - Insert default system settings using `prisma.systemSetting.upsert` for each entry (upsert by `key`):
    | key | value | description |
    |-----|-------|-------------|
    | auto_registration_enabled | "true" | Allow new user registration |
    | maintenance_mode | "false" | Block non-admin routes when enabled |
    | verbose_logs | "false" | Enable verbose logging |
    | email_sending_enabled | "true" | Enable email sending globally |
    | max_emails_per_day | "50" | Daily email limit per user |
    | smtp_sender_email | "" | SMTP sender address |
    | scraper_enabled | "true" | Enable scrapers |
    | scraper_interval_minutes | "120" | Minutes between scraper runs |
    | scraper_time_gap_seconds | "5" | Seconds between individual source scrapes |
  - Wrap in a main function, call it, then `$disconnect()` in finally block
  - Log "Seed completed successfully" on success

- [x] T013 [US1] Add seed script configuration to `server\package.json`.
      Add this to the root of `server\package.json`:
  ```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
  ```
  Also add a script: `"db:seed": "npx prisma db seed"`

**Checkpoint**: Database schema is complete. Run `npx prisma generate` and `npx prisma db push` to verify. Run `npx prisma db seed` to populate defaults.

---

## Phase 4: User Story 2 — API Server with Health Monitoring (Priority: P1)

**Goal**: Refactor entry point into app factory pattern and implement health endpoints using router/controller/service separation.

**Independent Test**: Start the server and run:

- `curl http://localhost:5000/v1/health` → 200 with `{ status: "ok" }`
- `curl http://localhost:5000/v1/health/db` → 200 with `{ db: "connected" }`

**Reference**: See `specs\001-foundation-monorepo-setup\contracts\health.md` for exact response formats.

### Implementation for User Story 2

- [x] T014 [US2] Create `server\src\v1\modules\health\health.service.ts` — Health check business logic.
      This file MUST:
  - Import `prisma` from `@\config\prisma`
  - Export an object `healthService` with two methods:
    1. `getBasicHealth()`: Returns `{ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }`
    2. `getDatabaseHealth()`: Runs `await prisma.$queryRaw\`SELECT 1\``inside a try/catch. On success returns`{ status: 'ok', db: 'connected' }`. On error, throws `new AppError('Database connection failed', 503, 'DB_CONNECTION_ERROR')`.

- [x] T015 [US2] Create `server\src\v1\modules\health\health.controller.ts` — Request/response handling only.
      This file MUST:
  - Import `Request, Response, NextFunction` from `express`
  - Import `healthService` from `./health.service`
  - Import `sendSuccess` from `@\http\responses\success.response`
  - Export an object `healthController` with two methods:
    1. `getHealth(req: Request, res: Response)`: Calls `healthService.getBasicHealth()`, passes result to `sendSuccess(res, data, 'Server is running')`
    2. `getDatabaseHealth(req: Request, res: Response, next: NextFunction)`: Calls `await healthService.getDatabaseHealth()`, passes result to `sendSuccess(res, data, 'Database connected')`. Wraps in try/catch, calls `next(error)` on failure.

- [x] T016 [US2] Create `server\src\v1\modules\health\health.routes.ts` — Route wiring only.
      This file MUST:
  - Import `Router` from `express`
  - Import `healthController` from `./health.controller`
  - Create a `router` using `Router()`
  - Define two routes:
    1. `router.get('/', healthController.getHealth)`
    2. `router.get('/db', healthController.getDatabaseHealth)`
  - Export `router` as default

- [x] T017 [US2] Create `server\src\router.ts` — v1 API router mounting.
      This file MUST:
  - Import `Router` from `express`
  - Import `healthRoutes` from `@\v1\modules\health\health.routes`
  - Create a `v1Router` using `Router()`
  - Mount: `v1Router.use('/health', healthRoutes)`
  - Export `v1Router` as default
  - NOTE: Future modules (auth, jobs, etc.) will be mounted here in later phases.

- [x] T018 [US2] Create `server\src\app.ts` — Express app factory.
      This file MUST:
  - Import `express` and create an `app` instance
  - Import `cors` from `cors`, `helmet` from `helmet`, `morgan` from `morgan`
  - Import `env` from `@\config\env`
  - Import `v1Router` from `@\router`
  - Import `notFoundHandler` from `@\http\middlewares\not-found` (will exist after T021)
  - Import `errorHandler` from `@\http\middlewares\error-handler` (will exist after T020)
  - Apply middleware in this order:
    1. `app.use(helmet())`
    2. `app.use(cors())`
    3. `app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))`
    4. `app.use(express.json())`
    5. `app.use(express.urlencoded({ extended: true }))`
  - Mount routes: `app.use('/v1', v1Router)`
  - Apply error handlers AFTER routes:
    1. `app.use(notFoundHandler)`
    2. `app.use(errorHandler)`
  - Export `app` as default
  - NOTE: Do NOT start the server here. No `app.listen()`.

- [x] T019 [US2] Replace `server\src\index.ts` with `server\src\main.ts` — Server entry point.
      This file MUST:
  - Import `app` from `@\app`
  - Import `env` from `@\config\env`
  - Import `logger` from `@\shared\utils\logger.util`
  - Call `app.listen(env.PORT, () => { logger.info(\`Server listening on port ${env.PORT}\`) })`
  - Add unhandled rejection and uncaught exception handlers that log the error and exit with code 1
  - Delete `server\src\index.ts` after creating this file
  - Update `server\package.json` scripts to reference `src\main.ts` instead of `src\index.ts`:
    - `"dev": "tsx watch src\main.ts"`
    - `"main": "dist\main.js"` (in package.json root)
  - Update `server\tsconfig.json` if `rootDir` references index.ts specifically (it currently uses `./src` which is fine)

**Checkpoint**: Server starts and responds to health endpoints. Run `npm run dev` from `server\` and test with curl.

---

## Phase 5: User Story 3 — Middleware Stack & Error Handling (Priority: P2)

**Goal**: Global error handler, 404 handler, and request logger middleware.

**Independent Test**:

- `curl http://localhost:5000/v1/nonexistent` → 404 JSON with `NOT_FOUND` code
- Trigger an error in any route → structured JSON error response (no stack trace in production)

**Reference**: See error response format in `specs\001-foundation-monorepo-setup\contracts\health.md`.

### Implementation for User Story 3

- [x] T020 [US3] Create `server\src\http\middlewares\error-handler.ts` — Global error handler.
      This file MUST:
  - Import `Request, Response, NextFunction` from `express`
  - Import `AppError` from `@\shared\errors\AppError`
  - Import `logger` from `@\shared\utils\logger.util`
  - Import `env` from `@\config\env`
  - Export a function with signature: `(err: Error, req: Request, res: Response, _next: NextFunction) => void`
    (Express recognizes 4-param functions as error handlers)
  - If `err` is an `AppError` (check with `instanceof`):
    - Log at `warn` level: `${err.code}: ${err.message}`
    - Return `res.status(err.statusCode).json({ success: false, message: err.message, error: { code: err.code, status: err.statusCode } })`
  - If `err` is a Zod validation error (check `err.name === 'ZodError'`):
    - Return `res.status(400).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', status: 400 } })`
  - Otherwise (unexpected error):
    - Log at `error` level the full error (message + stack)
    - Return `res.status(500).json({ success: false, message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message, error: { code: 'INTERNAL_ERROR', status: 500 } })`
    - NEVER expose stack traces or internal details in production

- [x] T021 [P] [US3] Create `server\src\http\middlewares\not-found.ts` — 404 handler for unmatched routes.
      This file MUST:
  - Import `Request, Response` from `express`
  - Export a function: `(req: Request, res: Response) => void`
  - Return `res.status(404).json({ success: false, message: \`Route not found: ${req.method} ${req.originalUrl}\`, error: { code: 'NOT_FOUND', status: 404 } })`

- [x] T022 [P] [US3] Create `server\src\http\middlewares\request-logger.ts` — Request logging middleware.
      This file MUST:
  - Import `Request, Response, NextFunction` from `express`
  - Import `logger` from `@\shared\utils\logger.util`
  - Export a function: `(req: Request, res: Response, next: NextFunction) => void`
  - Log at `info` level: `${req.method} ${req.originalUrl} — ${res.statusCode}`
  - Use `res.on('finish', ...)` to capture the final status code after the response completes
  - Call `next()` immediately (non-blocking)
  - NOTE: This is in addition to morgan. Morgan logs to stdout, this middleware logs to Winston for structured JSON in production.

**Checkpoint**: 404 and error responses return structured JSON matching the contract format.

---

## Phase 6: User Story 4 — Configuration & Service Singletons (Priority: P2)

**Goal**: Redis, BullMQ, Mailer, and LLM singletons + shared utility modules + updated .env.example.

**Independent Test**: Import each singleton and verify it initializes without errors when env vars are set.

### Implementation for User Story 4

- [x] T023 [US4] Create `server\src\config\redis.ts` — ioredis client singleton.
      This file MUST:
  - Import `Redis` from `ioredis`
  - Import `env` from `@\config\env`
  - Import `logger` from `@\shared\utils\logger.util`
  - Create and export a `redis` instance: `new Redis({ host: env.REDIS_HOST, port: env.REDIS_PORT, maxRetriesPerRequest: null })` (BullMQ requires `maxRetriesPerRequest: null`)
  - Add event listeners:
    - `redis.on('connect', () => logger.info('Redis connected'))`
    - `redis.on('error', (err) => logger.warn('Redis connection error', err.message))`
  - Export `redis` as a named export

- [x] T024 [US4] Create `server\src\config\bullmq.ts` — BullMQ connection and queue registration.
      This file MUST:
  - Import `Queue` from `bullmq`
  - Import `redis` from `@\config\redis`
  - Create a `connection` object: `{ connection: redis }`
  - Create and export named queues (they will be used in later phases):
    ```typescript
    export const emailSendQueue = new Queue('email-send-queue', { connection: redis });
    export const scraperQueue = new Queue('scraper-queue', { connection: redis });
    ```
  - Export the `connection` config for workers to reuse: `export const bullmqConnection = { connection: redis }`

- [x] T025 [P] [US4] Create `server\src\config\mailer.ts` — Nodemailer transport singleton.
      This file MUST:
  - Import `nodemailer` from `nodemailer`
  - Import `env` from `@\config\env`
  - Import `logger` from `@\shared\utils\logger.util`
  - Create and export a transporter:
    ```typescript
    export const mailer = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    ```
  - Log `'Mailer transport created'` at info level

- [x] T026 [P] [US4] Create `server\src\config\llm.ts` — LLM API client singleton.
      This file MUST:
  - Import `env` from `@\config\env`
  - Import `logger` from `@\shared\utils\logger.util`
  - Export a placeholder object:
    ```typescript
    export const llmClient = {
      isConfigured: Boolean(env.LLM_API_KEY),
      apiKey: env.LLM_API_KEY,
      baseUrl: env.LLM_BASE_URL,
    };
    ```
  - Log a warning if `LLM_API_KEY` is not set: `'LLM API key not configured — LLM features will be unavailable'`
  - NOTE: The actual OpenAI SDK integration happens in Phase 4 (scraping). This is a config placeholder.

- [x] T027 [P] [US4] Create `server\src\shared\utils\hash.util.ts` — Password hashing utility.
      This file MUST:
  - Import `bcrypt` from `bcrypt`
  - Import `APP_CONSTANTS` from `@\config\constants`
  - Export two functions:
    1. `hashPassword(password: string): Promise<string>` — calls `bcrypt.hash(password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS)`
    2. `comparePassword(password: string, hash: string): Promise<boolean>` — calls `bcrypt.compare(password, hash)`

- [x] T028 [P] [US4] Create `server\src\shared\utils\jwt.util.ts` — JWT operations utility.
      This file MUST:
  - Import `jwt` from `jsonwebtoken`
  - Import `env` from `@\config\env`
  - Export three functions:
    1. `signAccessToken(payload: { userId: string; role: string }): string` — calls `jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN })`
    2. `signRefreshToken(payload: { userId: string }): string` — calls `jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })`
    3. `verifyToken(token: string, secret: string): jwt.JwtPayload` — calls `jwt.verify(token, secret)` and returns the decoded payload, throws on invalid/expired

- [x] T029 [P] [US4] Create `server\src\shared\utils\crypto.util.ts` — AES-256-GCM encryption utility.
      This file MUST:
  - Import `crypto` from `node:crypto`
  - Import `env` from `@\config\env`
  - Use AES-256-GCM algorithm
  - Export two functions:
    1. `encrypt(plaintext: string): string` —
       Generate a random 16-byte IV. Create cipher with `crypto.createCipheriv('aes-256-gcm', Buffer.from(env.ENCRYPTION_KEY, 'hex'), iv)`. Encrypt the plaintext. Get the auth tag. Return a colon-separated string: `iv_hex:encrypted_hex:authTag_hex`.
    2. `decrypt(ciphertext: string): string` —
       Split on ':' to get iv, encrypted, authTag. Create decipher with `crypto.createDecipheriv('aes-256-gcm', Buffer.from(env.ENCRYPTION_KEY, 'hex'), iv_buffer)`. Set auth tag. Decrypt and return plaintext.

- [x] T030 [P] [US4] Create `server\src\shared\utils\paginate.util.ts` — Pagination utility.
      This file MUST:
  - Import `APP_CONSTANTS` from `@\config\constants`
  - Export two functions:
    1. `buildSkipTake(page?: number, limit?: number): { skip: number; take: number }` —
       Default page to `APP_CONSTANTS.PAGINATION_DEFAULT_PAGE`, limit to `APP_CONSTANTS.PAGINATION_DEFAULT_LIMIT`. Cap limit at `APP_CONSTANTS.PAGINATION_MAX_LIMIT`. Return `{ skip: (page - 1) * limit, take: limit }`.
    2. `buildMeta(total: number, page: number, limit: number): { page: number; limit: number; total: number; totalPages: number }` —
       Return `{ page, limit, total, totalPages: Math.ceil(total / limit) }`.

- [x] T031 [P] [US4] Create `server\src\shared\utils\tracking-pixel.util.ts` — 1x1 transparent PNG pixel.
      This file MUST:
  - Export a function `getTrackingPixel(): Buffer` that returns a Buffer containing a 1x1 transparent PNG image
  - The PNG bytes (hardcoded): `Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')`
  - Export a constant `TRACKING_PIXEL_CONTENT_TYPE = 'image/png'`

- [x] T032 [P] [US4] Create `server\src\shared\utils\template-compiler.util.ts` — Template variable replacement.
      This file MUST:
  - Export a function `compileTemplate(template: string, variables: Record<string, string>): string`
  - Replace all occurrences of `{{variable_name}}` in the template with the corresponding value from the variables object
  - Use a regex: `template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '')`
  - Return the compiled string

- [x] T033 [US4] Update `server\.env.example` — Document all required environment variables.
      Replace the current content (which only has `PORT=5000`) with the full list:

  ```env
  # Server
  PORT=5000
  NODE_ENV=development

  # Database
  DATABASE_URL=postgresql://user:password@localhost:5432/kafoo

  # Redis
  REDIS_HOST=localhost
  REDIS_PORT=6379

  # JWT
  JWT_ACCESS_SECRET=your-access-secret-min-16-chars
  JWT_REFRESH_SECRET=your-refresh-secret-min-16-chars
  JWT_ACCESS_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d

  # Encryption (32 bytes = 64 hex characters)
  ENCRYPTION_KEY=your-64-hex-character-encryption-key-here-0000000000000000

  # Email (SMTP)
  SMTP_HOST=smtp.ethereal.email
  SMTP_PORT=587
  SMTP_USER=
  SMTP_PASS=

  # LLM (optional — not needed until Phase 4)
  LLM_API_KEY=
  LLM_BASE_URL=

  # App URLs
  APP_URL=http://localhost:5173
  API_URL=http://localhost:5000
  ```

**Checkpoint**: All singletons initialize on server startup. All utilities are importable. Environment is fully documented.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, verification, and cleanup.

- [x] T034 Verify TypeScript compilation passes with zero errors. Run `cd server && npx tsc --noEmit` and fix any type errors in the files created above.

- [x] T035 Verify the complete startup flow works end-to-end:
  1. Copy `.env.example` to `.env` and fill in real values
  2. Run `npx prisma generate`
  3. Run `npx prisma db push`
  4. Run `npx prisma db seed`
  5. Run `npm run dev`
  6. Test: `curl http://localhost:5000/v1/health` → 200
  7. Test: `curl http://localhost:5000/v1/health/db` → 200
  8. Test: `curl http://localhost:5000/v1/nonexistent` → 404
     Fix any issues found.

- [x] T036 Run quickstart.md validation — walk through every step in `specs\001-foundation-monorepo-setup\quickstart.md` and verify each command works and each expected output matches.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (npm install)
- **US1 — Database (Phase 3)**: Depends on Phase 2 (env.ts, logger)
- **US2 — Health (Phase 4)**: Depends on Phase 2 + Phase 3 (prisma singleton)
- **US3 — Middleware (Phase 5)**: Depends on Phase 2 (AppError, logger, env)
- **US4 — Singletons (Phase 6)**: Depends on Phase 2 (env, logger, constants)
- **Polish (Phase 7)**: Depends on all phases complete

### Parallel Opportunities

- T004, T005, T006, T007, T008 (Phase 2) — all write different files, no dependencies on each other
- T014, T015, T016 (Phase 4 health module) — must be sequential: service → controller → routes
- T021, T022 (Phase 5) — can run in parallel with each other (different files)
- T023-T032 (Phase 6) — most are parallel: redis.ts, mailer.ts, llm.ts, and all utils are independent files. Only bullmq.ts depends on redis.ts.

### User Story Independence

- **US1 (Database)** and **US4 (Singletons)** can run in parallel after Phase 2 — they touch different files
- **US2 (Health)** depends on US1 (needs prisma singleton for /health/db)
- **US3 (Middleware)** can run in parallel with US1 and US4 — independent files

### Within Each User Story

- Models/schemas before singletons
- Singletons before services
- Services before controllers
- Controllers before routes
- Routes before app wiring

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (install deps)
2. Complete Phase 2: Foundational (env, logger, errors, responses)
3. Complete Phase 3: US1 — Database schema + Prisma singleton + seed
4. Complete Phase 4: US2 — Health endpoints + app refactor
5. **STOP and VALIDATE**: Server starts, health endpoints work
6. This is a deployable increment

### Full Delivery

1. Setup + Foundational → foundation ready
2. US1 (Database) → schema working ✓
3. US2 (Health) → endpoints working ✓
4. US3 (Middleware) + US4 (Singletons) → can run in parallel
5. Polish → full validation
6. All user stories complete

---

## Notes

- All file paths use the `@\` alias which maps to `server\src\` (configured in tsconfig.json)
- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- No test tasks included (testing deferred to Phase 11 per plan)
- Commit after each task or logical group
- Total: 36 tasks across 7 phases

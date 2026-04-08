# Kufu' Platform — Implementation Plan

## Spec-Driven Development with Spec Kit

**Version:** 1.0.0
**Date:** April 2026
**Based on SRS:** Kufu' Platform v1.0.5
**Methodology:** Spec-Driven Development (SDD) using [GitHub Spec Kit](https://github.com/github/spec-kit)

---

## What is Spec Kit?

Spec Kit is GitHub's open-source toolkit for **Spec-Driven Development (SDD)** — a methodology where the specification is the center of the entire engineering process. Instead of writing a spec and setting it aside, the spec drives the implementation, checklists, and task breakdowns.

### The Spec Kit Workflow (per phase)

Each phase follows this exact sequence — you **do not move to the next step until the current one is reviewed and accepted**:

| Step | Command      | What Happens                                                           |
| ---- | ------------ | ---------------------------------------------------------------------- |
| 1    | `/specify`   | AI generates a full spec from your high-level description (what + why) |
| 2    | `/clarify`   | AI asks targeted questions to resolve ambiguities before planning      |
| 3    | `/plan`      | You provide the tech stack; AI generates a detailed technical plan     |
| 4    | `/tasks`     | AI breaks the plan into small, atomic, reviewable implementation tasks |
| 5    | `/implement` | AI implements task-by-task; you review each one before continuing      |

### Setup

```bash
# Install Spec Kit CLI globally
npm install -g specify-cli

# Initialize in the project root
cd kafoo/
specify init

# This creates:
# .speckit/
#   constitution.md     ← Project-wide architectural rules
#   specs/              ← One folder per phase spec
```

---

## Constitution (Run Once — Before All Phases)

Before any phase begins, establish the project constitution. This is the **single source of truth** for all AI decisions.

```bash
/constitution
```

### Constitution Content (paste this as your constitution):

```markdown
# Kufu' Platform — Project Constitution

## Architecture

- Monorepo: Turborepo + pnpm workspaces
- Backend: apps/api (Express.js + TypeScript, NOT NestJS)
- User Frontend: apps/web (React 18 + Vite + TypeScript)
- Admin Frontend: apps/admin (React 18 + Vite + TypeScript)
- Shared packages: packages/types, packages/config

## Backend Rules

- All routes follow: /v1/[module]/
- Controller → Service → Queries/Repository pattern (no fat controllers)
- All request bodies validated with Zod DTOs
- All responses use sendSuccess() / sendError() helpers
- JWT: Access Token (15min) + Refresh Token (7 days)
- Passwords: bcrypt with saltRounds = 12
- Gmail tokens: AES-256 encrypted before storing in DB
- Error handling: AppError class + global error-handler middleware
- Logging: Winston (colored dev / JSON prod)

## Database

- PostgreSQL via Prisma ORM
- All IDs are UUIDs
- Soft deletes are NOT used; hard deletes with cascade

## Queue System

- BullMQ + ioredis for email-send-queue and scraper-queue
- Email retries: 3 attempts with exponential backoff (30s, 2min, 10min)

## Security

- Rate limiting on all auth endpoints (10 req/min per IP)
- Email send limit: 50 emails/day per user
- HTTPS only, TLS 1.2+
- CORS: trusted frontend domains only

## Frontend Rules

- React Query (TanStack) for server state
- Zustand for client-side global state
- React Hook Form + Zod for form validation
- Tailwind CSS + shadcn/ui for UI components
- Recharts for all data visualization
- RTL layout support (Arabic primary language)

## Language

- Primary UI language: Arabic (RTL)
- API error messages: English
- Code and comments: English
```

---

## Phase Overview

| #   | Phase                          | Core Deliverable                                                      | Spec Kit Entry Point |
| --- | ------------------------------ | --------------------------------------------------------------------- | -------------------- |
| 1   | Foundation & Monorepo Setup    | Project scaffold, configs, DB schema, health check                    | `/specify`           |
| 2   | Authentication System          | Register, login, refresh, email verify, reset password                | `/specify`           |
| 3   | Jobs Module                    | CRUD, search, filter, pagination, saved jobs, CVs                     | `/specify`           |
| 4   | Web Scraping & LLM Parsing     | BullMQ scraper queue, all 11 scrapers, LLM parser                     | `/specify`           |
| 5   | Gmail Integration & Auto-Apply | OAuth2, bulk email send, scheduling, tracking pixel                   | `/specify`           |
| 6   | Analytics & Notifications      | User + Admin analytics endpoints, notifications system                | `/specify`           |
| 7   | Admin Panel (Backend)          | Dashboard stats, user management, system settings                     | `/specify`           |
| 8   | Frontend — Landing & Auth      | Landing page, register, login, password flows                         | `/specify`           |
| 9   | Frontend — User Portal         | Dashboard, job discovery, saved jobs, auto-apply, analytics, settings | `/specify`           |
| 10  | Frontend — Admin Panel         | Admin dashboard, scrapers, users, notifications, settings             | `/specify`           |
| 11  | Testing, Security & Deployment | Unit tests, integration tests, Docker, CI/CD                          | `/specify`           |

---

## Phase 1: Foundation & Monorepo Setup

### Goal

Scaffold the entire project structure, configure all tools, establish the database schema, and get the server running with health check endpoints.

### Spec Kit Commands

```bash
# Step 1 — Write the spec
/specify
> "Set up a Turborepo monorepo called 'kufu' with pnpm workspaces.
>  Create three apps: apps/api (Express + TypeScript), apps/web (React + Vite),
>  apps/admin (React + Vite). Create shared packages: packages/types and packages/config.
>  Set up the Express server with: global middleware (CORS, helmet, morgan, express.json),
>  Prisma ORM connected to PostgreSQL, ioredis client, BullMQ queue registration,
>  Winston logger (colored dev / JSON prod), global error handler, 404 handler,
>  and health check routes GET /health and GET /health/db.
>  Create the full Prisma schema with all 10 tables from the SRS."

# Step 2 — Clarify
/clarify

# Step 3 — Plan with technical constraints
/plan
> "Use pnpm workspaces + turbo.json for the monorepo.
>  Backend: Express.js (NOT NestJS), TypeScript strict mode, Prisma, PostgreSQL, ioredis, BullMQ.
>  Frontend: React 18, Vite, TypeScript. Use dotenv + Zod for env validation (env.ts).
>  Use the folder structure defined in the SRS target backend structure."

# Step 4 — Generate tasks
/tasks

# Step 5 — Implement task by task
/implement
```

### Deliverables Checklist

- [ ] `turbo.json` + `pnpm-workspace.yaml` configured
- [ ] `apps/api` Express server running on PORT from `.env`
- [ ] `apps/web` Vite dev server running
- [ ] `apps/admin` Vite dev server running
- [ ] `packages/types` with shared TypeScript interfaces
- [ ] `packages/config` with shared ESLint + Prettier + TS config
- [ ] Full Prisma schema (`prisma/schema.prisma`) with all 10 tables:
  - `users`, `gmail_tokens`, `jobs`, `saved_jobs`, `cvs`,
    `email_templates`, `applications`, `notifications`,
    `activity_logs`, `system_settings`
- [ ] `GET /health` → `{ status: "ok" }`
- [ ] `GET /health/db` → `{ status: "ok", db: "connected" }`
- [ ] All config singletons: `prisma.ts`, `redis.ts`, `bullmq.ts`, `mailer.ts`, `llm.ts`
- [ ] `src/shared/errors/AppError.ts` + `error-codes.ts`
- [ ] `src/shared/utils/` — logger, hash, jwt, crypto, paginate, tracking-pixel, template-compiler
- [ ] Global middleware stack wired in `app.ts`
- [ ] `.env.example` with all required variables

### Key Files Created

```
apps/api/
  src/
    main.ts
    app.ts
    router.ts
    config/env.ts, prisma.ts, redis.ts, bullmq.ts, mailer.ts, llm.ts, constants.ts
    health/health.routes.ts
    shared/errors/AppError.ts, error-codes.ts
    shared/utils/logger.util.ts, hash.util.ts, jwt.util.ts, crypto.util.ts, ...
    http/middlewares/error-handler.ts, not-found.ts, request-logger.ts
    http/responses/success.response.ts, error.response.ts
prisma/schema.prisma
prisma/seed.ts
```

---

## Phase 2: Authentication System

### Goal

Build the complete authentication module: registration, email verification, login, JWT token management, logout, password reset, and account lockout.

### Spec Kit Commands

```bash
/specify
> "Build a complete authentication module for the Kufu' platform.
>  Endpoints:
>  POST /auth/register — register user, hash password (bcrypt 12), send verification email, return 201
>  POST /auth/login — validate credentials, check account status, issue accessToken (15min) + refreshToken (7d), support Remember Me, lockout after 5 failed attempts for 15 minutes
>  POST /auth/logout — invalidate refresh token in DB
>  POST /auth/refresh — validate refresh token, return new access token
>  POST /auth/forgot-password — generate reset token, send reset email via nodemailer
>  POST /auth/reset-password — validate reset token, update password hash
>  GET /auth/verify-email/:token — mark email_verified = true, set status = active
>  POST /auth/resend-verification — resend verification email (rate limited)
>  All protected routes use authenticate.ts middleware that verifies JWT accessToken."

/clarify
/plan
> "Express.js with passport-jwt strategy. Use token.service.ts for JWT sign/verify.
>  Store refresh tokens in the users table. Use Nodemailer for verification and reset emails.
>  Use the mailer/templates/ for HTML email templates.
>  Apply authLimiter (10 req/min per IP) to all auth endpoints.
>  Zod DTOs for all request bodies."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `src/v1/modules/auth/auth.routes.ts` — all 8 endpoints
- [ ] `src/v1/modules/auth/auth.controller.ts` — thin controller
- [ ] `src/v1/modules/auth/auth.service.ts` — all business logic
- [ ] `src/v1/modules/auth/token.service.ts` — JWT sign + verify + rotate
- [ ] DTOs: `register.dto.ts`, `login.dto.ts`, `refresh-token.dto.ts`, `forgot-password.dto.ts`, `reset-password.dto.ts`
- [ ] `src/http/middlewares/authenticate.ts` — JWT guard attaching `req.user`
- [ ] `src/http/middlewares/authorize.ts` — role-based access factory `authorize('admin')`
- [ ] `src/http/middlewares/rate-limit.ts` — `authLimiter`, `apiLimiter`, `emailLimiter`
- [ ] `src/mailer/templates/verify-email.template.ts`
- [ ] `src/mailer/templates/reset-password.template.ts`
- [ ] `src/mailer/templates/account-suspended.template.ts`
- [ ] Account lockout: 5 failed logins → 15 min lockout (stored in Redis)
- [ ] Email verification flow working end-to-end

### API Endpoints Delivered

| Method | Endpoint                       | Auth   |
| ------ | ------------------------------ | ------ |
| POST   | `/v1/auth/register`            | Public |
| POST   | `/v1/auth/login`               | Public |
| POST   | `/v1/auth/logout`              | User   |
| POST   | `/v1/auth/refresh`             | Public |
| POST   | `/v1/auth/forgot-password`     | Public |
| POST   | `/v1/auth/reset-password`      | Public |
| GET    | `/v1/auth/verify-email/:token` | Public |
| POST   | `/v1/auth/resend-verification` | User   |

---

## Phase 3: Jobs Module, Saved Jobs & CVs

### Goal

Build all job-related features: listing, searching, filtering, pagination, bookmarking, and CV file management.

### Spec Kit Commands

```bash
/specify
> "Build three modules: jobs, saved-jobs, and cvs.
>  Jobs: GET /jobs (paginated, filtered by keyword/location/source/datePosted/category/language),
>  GET /jobs/:id (single job), GET /jobs/search (search endpoint), GET /jobs/saved (user saved jobs),
>  POST /jobs/:id/save (bookmark), DELETE /jobs/:id/save (unbookmark).
>  Saved Jobs: also expose POST and DELETE via jobs module.
>  CVs: POST /cvs (upload CV file — PDF only, max 5MB, store URL),
>  GET /cvs (list user CVs), DELETE /cvs/:id, PATCH /cvs/:id/default (set as default CV).
>  All routes are protected (User role required)."

/clarify
/plan
> "Use Prisma for all queries. Implement jobs.queries.ts for complex filter queries with Prisma where clauses.
>  File upload for CVs: use multer middleware, store files on local disk (uploads/ folder) or cloud storage URL.
>  Pagination: use paginate.util.ts (buildSkipTake + buildMeta). Deduplication in saved_jobs uses UNIQUE constraint."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `src/v1/modules/jobs/jobs.routes.ts`
- [ ] `src/v1/modules/jobs/jobs.controller.ts`
- [ ] `src/v1/modules/jobs/jobs.service.ts` — getById, markExpired
- [ ] `src/v1/modules/jobs/jobs.queries.ts` — findWithFilters (keyword, location, source, date, paginate)
- [ ] `src/v1/modules/jobs/dto/jobs-filter.dto.ts`
- [ ] `src/v1/modules/saved-jobs/saved-jobs.routes.ts`
- [ ] `src/v1/modules/saved-jobs/saved-jobs.service.ts` — save, unsave, getSaved, removeAll
- [ ] `src/v1/modules/cvs/cvs.routes.ts`
- [ ] `src/v1/modules/cvs/cvs.service.ts` — upload, list, delete, setDefault
- [ ] Pagination meta returned on all paginated responses
- [ ] Job search with all query params working

### API Endpoints Delivered

| Method | Endpoint              | Auth |
| ------ | --------------------- | ---- |
| GET    | `/v1/jobs`            | User |
| GET    | `/v1/jobs/:id`        | User |
| GET    | `/v1/jobs/search`     | User |
| GET    | `/v1/jobs/saved`      | User |
| POST   | `/v1/jobs/:id/save`   | User |
| DELETE | `/v1/jobs/:id/save`   | User |
| POST   | `/v1/cvs`             | User |
| GET    | `/v1/cvs`             | User |
| DELETE | `/v1/cvs/:id`         | User |
| PATCH  | `/v1/cvs/:id/default` | User |

---

## Phase 4: Web Scraping & LLM Parsing Pipeline

### Goal

Build the complete automated job data collection engine: BullMQ scraper queue, all 11 scraper implementations, and the LLM HTML-to-JSON parsing service.

### Spec Kit Commands

```bash
/specify
> "Build a web scraping + LLM parsing pipeline for the Kufu' platform.
>  Architecture:
>  1. scraper-queue (BullMQ repeatable job, every 120 minutes)
>  2. ScraperWorker picks up jobs from the queue
>  3. ScraperProcessor orchestrates: fetch page HTML → extract job containers → send each to LLM API → parse JSON → deduplicate → insert into jobs table
>  4. Abstract base class scraper.base.ts: fetchPage (axios), extractContainers (cheerio), sendToLLM
>  5. 11 concrete scraper implementations (one per job board source)
>  6. llm-parser.service.ts: sends raw HTML container to LLM API, returns structured JSON
>  7. Deduplication: skip if (title + company_name + location) already exists
>  8. Admin endpoints: GET /admin/scrapers, POST /admin/scrapers/:name/run, PATCH /admin/scrapers/:name/toggle, GET /admin/scrapers/:name/logs (SSE)"

/clarify
/plan
> "Use axios for HTTP requests, cheerio for HTML parsing, playwright for JS-rendered pages.
>  Use openai SDK (or compatible) for LLM calls. Each scraper extends scraper.base.ts.
>  Store scraper status (active/idle/error, lastRun, jobsFetched) in system_settings table or a separate scrapers config.
>  Use BullMQ repeatable jobs. Admin can manually trigger via 'Run Now' which enqueues an immediate job.
>  SSE endpoint for real-time scraper logs using Winston stream."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `src/workers/scraper/scraper.worker.ts`
- [ ] `src/workers/scraper/scraper.processor.ts`
- [ ] `src/workers/scraper/scraper.base.ts` — abstract base class
- [ ] `src/workers/scraper/llm/llm-parser.service.ts`
- [ ] `src/workers/scraper/llm/llm-parser.prompt.ts`
- [ ] 11 scraper source files:
  - `wzayf.scraper.ts`, `ewdifh.scraper.ts`, `wdeftksa.scraper.ts`, `jobs1.scraper.ts`
  - `linkedksa.scraper.ts`, `saudijobs24.scraper.ts`, `wazaef.scraper.ts`, `jbscv.scraper.ts`
  - `saudiajobs.scraper.ts`, `wadhefa.scraper.ts`, `saudijobsin.scraper.ts`
- [ ] `src/workers/scraper/sources/index.ts` — registry map
- [ ] `src/scheduler/index.ts` — registers repeatable BullMQ scraper job on boot
- [ ] Admin scraper endpoints (GET, POST trigger, PATCH toggle, PATCH config, GET logs SSE)
- [ ] Deduplication logic working (title + company + location uniqueness check)
- [ ] LLM JSON output validated before DB insertion
- [ ] Anti-scraping: user-agent rotation, delays, exponential backoff retry

### Scraper Sources Covered

| #   | Source               | Language |
| --- | -------------------- | -------- |
| 1   | wzayf22.blogspot.com | Arabic   |
| 2   | ewdifh.com           | Arabic   |
| 3   | wdeftksa.com         | Arabic   |
| 4   | jobs-1.com           | Arabic   |
| 5   | linkedksa.com        | Arabic   |
| 6   | saudijobs24.com      | Arabic   |
| 7   | wazaef.net           | Arabic   |
| 8   | jbscv.com            | Arabic   |
| 9   | saudia.jobs          | Arabic   |
| 10  | wadhefa.com          | Arabic   |
| 11  | saudijobs.in         | English  |

---

## Phase 5: Gmail Integration & Auto-Apply

### Goal

Build the Gmail OAuth2 connection flow, the BullMQ email send queue, the bulk auto-apply feature with scheduling, and the email open-rate tracking pixel.

### Spec Kit Commands

```bash
/specify
> "Build the Gmail integration and Auto-Apply system.
>  Gmail OAuth2 flow:
>  - GET /gmail/auth-url → returns Google OAuth2 authorization URL
>  - GET /gmail/callback → exchanges code for access_token + refresh_token, encrypts with AES-256, stores in gmail_tokens
>  - GET /gmail/status → checks if Gmail is connected for the current user
>  - DELETE /gmail/disconnect → revokes Gmail access, deletes tokens from DB
>
>  Applications / Auto-Apply:
>  - POST /applications/send → send single application immediately (enqueue BullMQ delay=0)
>  - POST /applications/bulk-send → bulk send with optional scheduledAt (enqueue BullMQ with delay)
>  - GET /applications → list user applications with status filters + pagination
>  - GET /applications/:id → single application details
>  - DELETE /applications/:id → remove from history
>  - PATCH /applications/:id/cancel → cancel scheduled application (remove from BullMQ)
>  - GET /track/open/:token → tracking pixel (returns 1x1 PNG, marks application as email_opened)
>
>  Email send worker:
>  - email-send.worker.ts: BullMQ Worker on email-send-queue
>  - email-send.processor.ts: uses gmail.sender.ts to send via Gmail API, updates application status
>  - Retry: 3 attempts (30s, 2min, 10min backoff)
>  - Embed tracking pixel in each email HTML body"

/clarify
/plan
> "Use googleapis SDK for Gmail API (gmail.users.messages.send).
>  OAuth2 scopes: https://www.googleapis.com/auth/gmail.send
>  Token storage: AES-256 encrypted via crypto.util.ts.
>  Silent token refresh: if access_token expired, use refresh_token to get a new one.
>  BullMQ delayed jobs for scheduling. Job payload defined in bullmq.types.ts.
>  Apply emailLimiter middleware (50 emails/day per user).
>  Cover letter template compiler: template-compiler.util.ts replaces {{job_title}}, {{company_name}}, {{user_name}}.
>  Tracking pixel: tracking-pixel.util.ts returns 1x1 transparent PNG Buffer."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `src/v1/modules/gmail/gmail.routes.ts`
- [ ] `src/v1/modules/gmail/gmail.service.ts` — getAuthUrl, handleCallback, getStatus, disconnect
- [ ] `src/v1/modules/gmail/gmail.token.service.ts` — AES-256 encrypt/decrypt + silent token refresh
- [ ] `src/config/google-oauth.ts` — Google OAuth2 client singleton
- [ ] `src/v1/modules/applications/applications.routes.ts`
- [ ] `src/v1/modules/applications/applications.service.ts` — send, bulk-send, cancel, delete
- [ ] `src/v1/modules/applications/applications.queries.ts` — user history with filters + paginate
- [ ] `src/workers/email-send/email-send.worker.ts`
- [ ] `src/workers/email-send/email-send.processor.ts`
- [ ] `src/workers/email-send/gmail.sender.ts` — sendEmail() via googleapis
- [ ] `src/v1/modules/tracking/tracking.routes.ts` + `tracking.controller.ts`
- [ ] Tracking pixel endpoint (no auth, updates application status to email_opened)
- [ ] Email retry logic: 3 attempts with exponential backoff
- [ ] Daily email limit enforced (50/user/day via emailLimiter)
- [ ] Template variables compiled before sending

### Application Status Flow

```
scheduled → sending → sent → email_opened
                   ↘ failed (after 3 retries)
```

---

## Phase 6: Analytics & Notifications

### Goal

Build the analytics endpoints for both users and admins, plus the notifications system.

### Spec Kit Commands

```bash
/specify
> "Build analytics and notifications modules.
>
>  User Analytics (GET /analytics/*):
>  - /analytics/summary → { totalJobs, savedJobs, openRate, totalEmailsSent }
>  - /analytics/weekly-activity → email count per day for last 7 days (for bar chart)
>  - /analytics/open-rate-trend → open rate per day for last 30 days
>
>  Notifications (User):
>  - GET /notifications → list user's notifications
>  - PATCH /notifications/:id/read → mark notification as read
>  - PATCH /notifications/read-all → mark all as read
>
>  Admin Analytics (GET /admin/analytics/*):
>  - /admin/analytics/stats → { activeUsers, aiSuccessRate, openRate, totalApplications }
>  - /admin/analytics/user-activity → { activeSessions, newSessions } per day (last 7 days)
>  - /admin/analytics/top-jobs → top 5 most applied job titles
>  - /admin/analytics/daily-applications → daily application count for last 30 days
>  - /admin/analytics/success-rate → { successful, failed, pending } counts
>
>  Admin Notifications:
>  - POST /admin/notifications/send → broadcast or targeted notification
>  - GET /admin/notifications → list all sent notifications
>  - DELETE /admin/notifications/:id → delete notification"

/clarify
/plan
> "Use Prisma aggregate queries (count, groupBy) for all analytics.
>  Notifications are stored in the notifications table (see SRS section 9.8).
>  Admin notifications target can be 'all' or 'admin' or a specific user_id.
>  No WebSockets needed for notifications — polling is acceptable for MVP."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `src/v1/modules/analytics/analytics.routes.ts`
- [ ] `src/v1/modules/analytics/analytics.service.ts`
- [ ] `src/v1/modules/analytics/analytics.queries.ts`
- [ ] `src/v1/modules/notifications/notifications.routes.ts`
- [ ] `src/v1/modules/notifications/notifications.service.ts`
- [ ] `src/v1/modules/admin/analytics/admin-analytics.controller.ts`
- [ ] `src/v1/modules/admin/analytics/admin-analytics.service.ts`
- [ ] `src/v1/modules/admin/analytics/admin-analytics.queries.ts`
- [ ] `src/v1/modules/admin/notifications/admin-notifications.service.ts`

---

## Phase 7: Admin Panel (Backend — Remaining Modules)

### Goal

Complete the admin backend: dashboard KPIs, user management (CRUD + suspend/activate), and system settings with danger zone actions.

### Spec Kit Commands

```bash
/specify
> "Build three admin backend modules:
>
>  Admin Dashboard:
>  - GET /admin/dashboard/stats → { activeUsers, totalApplicationsSent, successRate, totalJobsInDB, scrapersStatus }
>  - GET /admin/dashboard/weekly-chart → 3-line chart data (sends, registrations, scraper errors) last 7 days
>  - GET /admin/dashboard/top-categories → top applied job categories
>
>  Admin User Management:
>  - GET /admin/users → list users (searchable by name/email/phone, filter by status: all/active/suspended, paginated)
>  - GET /admin/users/:id → full user profile with application history
>  - PATCH /admin/users/:id → edit user name/email/phone
>  - PATCH /admin/users/:id/suspend → set status = suspended
>  - PATCH /admin/users/:id/activate → set status = active
>  - DELETE /admin/users/:id → permanently delete user (with cascade)
>
>  System Settings:
>  - GET /admin/settings → return all key-value settings
>  - PATCH /admin/settings → update settings (general, email, scraper settings)
>  - POST /admin/settings/test-smtp → send a test email using current SMTP config
>  - POST /admin/settings/factory-reset → reset all settings to defaults (super_admin only)
>  - DELETE /admin/settings/clear-logs → purge all activity_logs (super_admin only)"

/clarify
/plan
> "All admin routes use authenticate.ts + authorize('admin') middleware.
>  Danger zone endpoints use authorize('super_admin').
>  System settings stored as key-value in system_settings table.
>  Maintenance mode check is done in maintenance.ts middleware (reads from settings).
>  Activity logs written via shared logger, not via API calls."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `src/v1/modules/admin/dashboard/dashboard.controller.ts`
- [ ] `src/v1/modules/admin/dashboard/dashboard.service.ts`
- [ ] `src/v1/modules/admin/dashboard/dashboard.queries.ts`
- [ ] `src/v1/modules/admin/users/admin-users.controller.ts`
- [ ] `src/v1/modules/admin/users/admin-users.service.ts`
- [ ] `src/v1/modules/admin/settings/settings.controller.ts`
- [ ] `src/v1/modules/admin/settings/settings.service.ts`
- [ ] `src/http/middlewares/maintenance.ts` — blocks non-admin routes in maintenance mode
- [ ] Factory reset + clear logs endpoints (super_admin guarded)

---

## Phase 8: Frontend — Landing Page & Authentication

### Goal

Build the user-facing landing page and all authentication screens.

### Spec Kit Commands

```bash
/specify
> "Build the landing page and authentication screens for the Kufu' React web app (apps/web).
>
>  Landing Page (HomePage.tsx):
>  - Hero section: headline + 2 CTA buttons
>  - Features section: 4 feature cards
>  - How It Works section: 3-step visual
>  - Stats section: live counters (total jobs, applications sent, registered users)
>  - Footer: Privacy Policy, Terms of Service, Contact Us
>  - Fully responsive (mobile-first), RTL Arabic layout
>
>  Auth Pages:
>  - RegisterPage.tsx: form with fullName, email, phone, password, confirmPassword — Zod validation
>  - LoginPage.tsx: email + password + Remember Me checkbox
>  - ForgotPasswordPage.tsx: email input only
>  - ResetPasswordPage.tsx: new password + confirm (token from URL)
>  - EmailVerificationPage.tsx: shows status of email verification from URL token
>
>  After login: redirect to /dashboard
>  After register: redirect to email verification page"

/clarify
/plan
> "Use React Router v6 for routing. React Hook Form + Zod for form validation.
>  TanStack Query for API calls (useMutation for login/register).
>  Zustand for auth state (user, tokens, isAuthenticated).
>  Tailwind CSS + shadcn/ui for components.
>  RTL direction: set dir='rtl' on html element for Arabic pages.
>  Axios instance in services/api.ts with interceptors for token refresh."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `apps/web/src/pages/home/HomePage.tsx` — all landing page sections
- [ ] `apps/web/src/components/home/` — Hero, Features, HowItWorks, Stats, Footer
- [ ] `apps/web/src/pages/auth/RegisterPage.tsx`
- [ ] `apps/web/src/pages/auth/LoginPage.tsx`
- [ ] `apps/web/src/pages/auth/ForgotPasswordPage.tsx`
- [ ] `apps/web/src/pages/auth/ResetPasswordPage.tsx`
- [ ] `apps/web/src/pages/auth/EmailVerificationPage.tsx`
- [ ] `apps/web/src/services/api.ts` — Axios instance with auth interceptors
- [ ] `apps/web/src/stores/auth.store.ts` — Zustand auth state
- [ ] Protected route wrapper component
- [ ] Token refresh interceptor (silent refresh on 401)

---

## Phase 9: Frontend — User Portal

### Goal

Build all user portal screens: Dashboard, Job Discovery, Saved Jobs, Auto-Apply wizard, Analytics & Tracking, and Settings.

### Spec Kit Commands

```bash
/specify
> "Build the full User Portal for Kufu' (apps/web).
>
>  UserDashboardPage.tsx:
>  - 4 KPI cards: Available Jobs, Saved Jobs, Open Rate, Total Emails Sent
>  - Weekly send activity bar chart (Sun–Thu, emails sent per day) using Recharts
>  - Empty state when no activity
>
>  JobDiscoveryPage.tsx:
>  - Search bar + city filter + time filter
>  - Job cards grid: company, title, date, location, category, HR email, Send CV link
>  - Save/unsave toggle (star icon) on each card
>  - Pagination
>
>  SavedJobsPage.tsx:
>  - Header with count + Remove All button
>  - Saved job cards list
>  - Select jobs for auto-apply (checkbox per card)
>
>  AutoApplyPage.tsx (2-step wizard):
>  - Step 1: blocked state if Gmail not connected (red warning box + link to Settings)
>  - Step 1 (connected): email subject field, message body textarea, CV upload, selected jobs list
>  - Step 2: date/time scheduler + confirm button
>
>  AnalyticsPage.tsx:
>  - Application list with status badges (قيد الإرسال, مرسل, فشل, تم الفتح)
>
>  SettingsPage.tsx:
>  - Gmail connection section (connect/disconnect button + linked email display)
>  - Info section (saved jobs count, platform version)"

/clarify
/plan
> "React Query for all data fetching (useQuery, useMutation, useInfiniteQuery for job list).
>  Recharts BarChart for dashboard weekly activity.
>  shadcn/ui components: Card, Button, Input, Badge, Dialog, Tabs.
>  RTL layout with Tailwind. Arabic text UI labels as per SRS section 5.
>  All forms validated with React Hook Form + Zod."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `UserDashboardPage.tsx` — 4 KPI cards + weekly bar chart
- [ ] `JobDiscoveryPage.tsx` — search, filters, job cards, pagination
- [ ] `SavedJobsPage.tsx` — saved jobs list, remove all, select for auto-apply
- [ ] `AutoApplyPage.tsx` — 2-step wizard (blocked state + step 1 + step 2)
- [ ] `AnalyticsPage.tsx` — applications list with status badges
- [ ] `SettingsPage.tsx` — Gmail connect/disconnect + info section
- [ ] User layout: `UserLayout.tsx`, `UserNavbar.tsx`, `UserSidebar.tsx`
- [ ] Shared UI atoms: `Button`, `Input`, `Badge`, `Avatar`, `Spinner`, `Toggle`
- [ ] Shared molecules: `StatCard`, `JobCard`, `PageHeader`, `SearchBox`, `DataTable`

---

## Phase 10: Frontend — Admin Panel

### Goal

Build the complete Admin Panel frontend: dashboard, scraper management, user management, notifications, advanced analytics, and system settings.

### Spec Kit Commands

```bash
/specify
> "Build the Admin Panel frontend for Kufu' (apps/admin).
>
>  AdminDashboardPage.tsx:
>  - 5 KPI cards: Active Users, Total Applications, Success Rate, Total Jobs, Scrapers Status
>  - Multi-line chart (Recharts): Application Sends + New Registrations + Scraper Errors (last 7 days)
>  - Bar chart: Top Job Categories
>
>  ScraperManagementPage.tsx:
>  - Table of 11 scrapers: name, status, last run, jobs fetched, enable/disable toggle, Run Now button
>  - Real-time scraper terminal log (SSE stream) below the table
>  - Log level filter: INFO / WARN / ERROR
>
>  UserManagementPage.tsx:
>  - Search bar + filter tabs (All / Active / Suspended)
>  - Users table: #, User (avatar+name+email), Phone, Join Date, Status badge, Actions
>  - Actions: Activity (opens profile modal) | Suspend/Activate | Edit | Delete (with confirmation)
>
>  NotificationsPage.tsx:
>  - Send New Notification button + form modal (title, body, type, target)
>  - Notification cards list with color-coded left border (success=green, warning=yellow, alert=red)
>  - Delete button per card
>
>  AdvancedAnalyticsPage.tsx:
>  - 4 KPI cards
>  - 2x2 chart grid: User Activity bar chart, Most Requested Jobs horizontal bar, Daily Applications line chart, Success Rate distribution chart
>
>  SystemSettingsPage.tsx:
>  - General Settings section (toggles: auto registration, maintenance mode, verbose logs)
>  - Email Settings section (toggles + SMTP sender email input + Save button)
>  - Scraper Settings section (toggles + time gap input + Save button)
>  - Danger Zone section (Clear All Logs + Reset Settings buttons with confirmation dialogs)"

/clarify
/plan
> "Same stack as apps/web. Recharts for all charts.
>  SSE for scraper logs: use EventSource API in React.
>  Confirmation dialogs for all destructive actions using shadcn/ui AlertDialog.
>  Admin layout: AdminLayout.tsx, AdminNavbar.tsx, AdminSidebar.tsx."
/tasks
/implement
```

### Deliverables Checklist

- [ ] `AdminDashboardPage.tsx` — KPI cards + multi-line chart + bar chart
- [ ] `ScraperManagementPage.tsx` — scrapers table + SSE log terminal
- [ ] `UserManagementPage.tsx` — table + actions + profile modal
- [ ] `NotificationsPage.tsx` — send form modal + cards list
- [ ] `AdvancedAnalyticsPage.tsx` — 4 KPI + 2x2 chart grid
- [ ] `SystemSettingsPage.tsx` — 3 settings sections + danger zone
- [ ] Admin layout: `AdminLayout.tsx`, `AdminNavbar.tsx`, `AdminSidebar.tsx`
- [ ] SSE client hook for real-time scraper logs

---

## Phase 11: Testing, Security Hardening & Deployment

### Goal

Write unit + integration tests, apply security hardening, containerize with Docker, and set up CI/CD.

### Spec Kit Commands

```bash
/specify
> "Add testing, security hardening, and Docker setup to the Kufu' platform.
>
>  Testing:
>  - Unit tests for: auth.service.ts, token.service.ts, gmail.token.service.ts,
>    llm-parser.service.ts, template-compiler.util.ts, crypto.util.ts
>  - Integration tests for: auth endpoints (register, login, refresh, reset password),
>    jobs endpoints (list, search, save, unsave), applications endpoints (send, bulk-send, cancel)
>  - Use Jest + supertest for integration tests
>
>  Security Hardening:
>  - Add helmet.js for HTTP security headers
>  - Add express-rate-limit to all routes
>  - CORS configured for trusted domains only
>  - Verify all inputs are validated via Zod (no raw req.body access)
>  - Verify no sensitive data leaked in API responses (no password_hash, no tokens in responses)
>
>  Docker:
>  - Dockerfile for apps/api (multi-stage: build → production)
>  - docker-compose.yml: api, web, admin, postgres, redis services
>  - .env.example documented with all required variables
>
>  CI/CD (GitHub Actions):
>  - On PR: run lint, type-check, unit tests
>  - On merge to main: build Docker images, run integration tests"

/clarify
/plan
> "Jest + ts-jest for TypeScript tests. Supertest for HTTP integration tests.
>  Use a test PostgreSQL database (separate from dev). Docker Compose for local dev.
>  GitHub Actions workflows in .github/workflows/."
/tasks
/implement
```

### Deliverables Checklist

- [ ] Unit tests for all service files (target: 80% coverage)
- [ ] Integration tests for all major API flows
- [ ] `Dockerfile` (multi-stage) for `apps/api`
- [ ] `docker-compose.yml` with api + web + admin + postgres + redis
- [ ] `.github/workflows/ci.yml` (lint + typecheck + test on PR)
- [ ] `.github/workflows/deploy.yml` (build + push on main)
- [ ] Security headers via helmet.js
- [ ] All Zod validation coverage verified
- [ ] No sensitive data in API responses confirmed

---

## Spec Kit File Structure (per Phase)

When you run the Spec Kit commands for each phase, it generates this structure:

```
.speckit/
├── constitution.md                   ← Written once (Phase 0)
└── specs/
    ├── 001-foundation-setup/
    │   ├── spec.md                   ← Generated by /specify
    │   ├── plan.md                   ← Generated by /plan
    │   ├── tasks.md                  ← Generated by /tasks
    │   ├── research.md               ← Auto-generated
    │   ├── data-model.md             ← Auto-generated
    │   └── contracts/                ← Auto-generated API contracts
    ├── 002-authentication/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    ├── 003-jobs-module/
    ├── 004-scraping-llm/
    ├── 005-gmail-autoapply/
    ├── 006-analytics-notifications/
    ├── 007-admin-backend/
    ├── 008-frontend-landing-auth/
    ├── 009-frontend-user-portal/
    ├── 010-frontend-admin/
    └── 011-testing-deployment/
```

---

## Development Order: Quick Reference

```
Phase 1  → Foundation (monorepo + DB schema + server scaffold)
    ↓
Phase 2  → Auth (register, login, JWT, email verify, reset password)
    ↓
Phase 3  → Jobs (CRUD, search, save, CVs)
    ↓
Phase 4  → Scraping + LLM (data ingestion pipeline)
    ↓
Phase 5  → Gmail + Auto-Apply (email queue + tracking pixel)
    ↓
Phase 6  → Analytics + Notifications
    ↓
Phase 7  → Admin Backend (dashboard, user mgmt, settings)
    ↓
Phase 8  → Frontend: Landing + Auth pages
    ↓
Phase 9  → Frontend: User Portal (all 6 pages)
    ↓
Phase 10 → Frontend: Admin Panel (all 6 pages)
    ↓
Phase 11 → Testing + Security + Docker + CI/CD
```

---

## Tech Stack Reference

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Monorepo       | Turborepo + pnpm workspaces                      |
| Backend        | Express.js + TypeScript (strict)                 |
| Database       | PostgreSQL + Prisma ORM                          |
| Queue          | BullMQ + ioredis (Redis)                         |
| Authentication | JWT (passport-jwt) + bcrypt                      |
| Scraping       | Axios + Cheerio + Playwright                     |
| AI Parsing     | OpenAI SDK (or compatible LLM)                   |
| Email Send     | googleapis (Gmail API)                           |
| Email System   | Nodemailer (platform notifications)              |
| Validation     | Zod (backend) + React Hook Form + Zod (frontend) |
| Frontend       | React 18 + Vite + TypeScript                     |
| Routing        | React Router v6                                  |
| Server State   | TanStack Query (React Query)                     |
| Client State   | Zustand                                          |
| UI Library     | Tailwind CSS + shadcn/ui                         |
| Charts         | Recharts                                         |
| Testing        | Jest + ts-jest + supertest                       |
| DevOps         | Docker + Docker Compose + GitHub Actions         |

---

_Kufu' Platform — Implementation Plan v1.0.0_
_Generated: April 2026_
_Methodology: Spec-Driven Development (SDD) with GitHub Spec Kit_

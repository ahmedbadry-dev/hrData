# Kafoo Project Full Documentation

Last Updated: 2026-04-16

## 1) Project Overview

Kafoo is a monorepo web application with:
- Frontend: React + Vite + TypeScript in client
- Backend: Express + TypeScript + Prisma + PostgreSQL in server
- Monorepo orchestration via npm workspaces in root

Current implementation status summary:
- Core backend foundation is fully operational (Express, Middleware, Prisma, Redis, BullMQ).
- Most planned backend functional modules are implemented: auth, jobs, applications, gmail, analytics, notifications, tracking pixel, health checks.
- Scraper system is being refactored (currently excluded from this documentation).
- Frontend UI is mature with RTL Arabic support and a premium Neo-Brutalist design.
- Frontend migration to a modular structure (src/modules) is complete for core features (auth, jobs, applications).
- Data fetching is handled via React Query, integrated with backend APIs.
- Backend features account lockout, session management with refresh tokens, and rate limiting.

## 2) Monorepo and Workspaces

Root workspace configuration:
- package name: pern-monorepo
- workspaces:
  - client
  - server

Root scripts:
- npm run dev: runs server and client together via concurrently
- npm run build: builds server then client
- npm run lint: prettier check
- npm run format: prettier write
- npm run type:check: runs typescript compiler check for both workspaces

## 3) Technology Stack

### Backend Stack
- Runtime and framework: Node.js, Express
- Language: TypeScript
- Validation: Zod
- Auth: JWT + bcrypt + cookie-session rotation
- Database: PostgreSQL + Prisma ORM (v6+)
- Queue: BullMQ (v5+)
- Cache/broker: Redis (ioredis)
- Email: Nodemailer + Gmail OAuth2 integration
- Logging: Winston + Morgan
- Security middleware: Helmet + CORS + cookie-parser + express-rate-limit

### Frontend Stack
- Runtime/UI: React (latest)
- Build tool: Vite + @tailwindcss/vite
- Language: TypeScript
- Routing: react-router-dom (v7)
- Data/client libs: axios, @tanstack/react-query, react-hook-form, zod, zustand
- Styling: Vanilla CSS (CSS Modules) + TailwindCSS 4
- Charts/UI libs: chart.js, tanstack table, react-dropzone
- i18n: i18next + react-i18next + RTL support

## 4) Runtime Architecture

### Backend startup flow
1. server/src/main.ts loads env and starts HTTP server.
2. server/src/app.ts builds middleware stack and mounts /api.
3. server/src/router.ts mounts:
   - /health -> health module
   - /v1 -> versioned API routes
4. server/src/v1/routes.ts mounts all active modules:
   - /auth
   - /jobs
   - /track
   - /admin/users
   - /admin/analytics
   - /admin/notifications
   - /notifications (user-specific)
   - /applications
   - /gmail (OAuth integration)

### Backend middleware chain
- helmet
- cors (dynamic: open in development, allowlist in production)
- morgan logger
- express.json / urlencoded
- cookieParser
- custom requestLogger
- rate limiting (auth-specific)
- global errorHandler

### Shared API response contract
All controllers return standardized response shape through ResponseHelper:
- success (boolean)
- statusCode (number)
- message (string)
- data (optional object/array)
- timestamp (ISO string)
- path (string)
- paginationMeta (optional, for paginated endpoints)

## 5) Environment and Configuration

Key backend env groups:
- Server: PORT, NODE_ENV, APP_URL, API_URL, CORS_ALLOWED_ORIGINS
- Database: DATABASE_URL
- Redis: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- JWT: access/refresh/verification secrets and expirations
- Encryption: ENCRYPTION_KEY (hex)
- SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
- LLM Integration: GROQ_API_KEY
- Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

Main backend config files:
- server/src/config/env.config.ts
- server/src/config/db.config.ts
- server/src/config/redis.ts
- server/src/config/bullmq.ts
- server/src/config/mailer.config.ts
- server/src/config/constants.ts

## 6) Database Schema Documentation (Prisma)

Schema file: server/prisma/schema.prisma

### Enums
- UserRole: USER, ADMIN, SUPER_ADMIN
- UserStatus: PENDING_VERIFICATION, ACTIVE, SUSPENDED
- ApplicationStatus: SCHEDULED, SENDING, SENT, FAILED, EMAIL_SENT, EMAIL_OPENED, EMAIL_FAILED
- NotificationType: INFO, SUCCESS, WARNING, ALERT
- NotificationTarget: ALL, ADMIN, USER
- JobLocation: RIYADH, JEDDAH, DAMMAM, KHOBAR, MECCA, MEDINA, TABUK
- DateFilter: DAY, WEEK, MONTH

### Models

#### User (users)
- Core identity table.
- Stores profile, auth state, and account security flags (lockout, verification).

#### Session (sessions)
- Persists refresh tokens and device context (IP, User-Agent).
- Supports session rotation and "Remember Me" functionality.

#### GmailToken (gmail_tokens)
- Stores OAuth tokens for Gmail integration per user.

#### Job (jobs)
- Job inventory with company, location, category, and source metadata.
- Unique constraint on (title, companyName, location).

#### SavedJob (saved_jobs)
- User-bookmarked jobs.

#### EmailTemplate (email_templates)
- Reusable email templates per user.

#### Application (applications)
- Tracks job applications.
- Integrated with BullMQ for scheduled sending.
- Stores tracking tokens for email open events.
- Note: CV data is passed during scheduling and not persisted in this model.

#### Notification (notifications)
- In-app notification storage.

#### ActivityLog (activity_logs)
- Audit records for user/system actions.

#### SystemSetting (system_settings)
- Key-value configuration storage.

## 7) Backend API Endpoints Documentation

### Health Endpoints (/api/health)
1. GET /: basic service health.
2. GET /db: DB connectivity health.

### Auth Endpoints (/api/v1/auth)
1. POST /register: User registration + verification email.
2. POST /verify-email?token=...: Verify email.
3. POST /login: Credentials login + refresh cookie. Supports "Remember Me".
4. POST /logout: Clear session and cookies.
5. POST /logout-all: Invalidate all user sessions.
6. POST /refresh: Rotate tokens using refresh cookie.
7. POST /forgot-password: Send reset link.
8. POST /reset-password?token=...: Reset password.
9. GET /validate-reset-token?token=...: Check if reset token is valid/expired.
10. PATCH /change-password: Change password (requires auth).

### Jobs Endpoints (/api/v1/jobs)
1. GET /: List jobs (paginated + filters).
2. GET /saved: List current user saved jobs.
3. GET /search: Search jobs with date filters.
4. GET /:id: Fetch single job.
5. POST /:id/save: Bookmark job.
6. DELETE /:id/save: Unsave job.
7. POST /bulk-save: Bookmark multiple jobs.
8. POST /bulk-unsave: Unsave multiple jobs.
9. POST /: Create single job (Admin/Source).
10. POST /bulk: Create jobs in bulk.

### Applications Endpoints (/api/v1/applications)
1. GET /: List user applications (paginated + status filter).
2. GET /:id: Fetch application details.
3. POST /schedule: Schedule applications for jobIds.
   - Body: jobIds, sendTime, delayBetweenEmails, cv (base64 or file).
4. DELETE /:id: Cancel a scheduled application.

### Tracking Endpoint (/api/v1/track)
1. GET /open/:token: Tracks email open via transparent GIF.

### Gmail (OAuth) Endpoints (/api/v1/gmail)
1. GET /auth-url: Get Google OAuth URL.
2. GET /callback: Handle OAuth callback.
3. GET /status: Check connection status.
4. DELETE /disconnect: Revoke tokens.

### Admin Users Endpoints (/api/v1/admin/users)
1. GET /: Paginated users list.
2. GET /:id: User details.
3. PATCH /:id: Update profile.
4. PATCH /:id/suspend: Suspend user.
5. PATCH /:id/activate: Re-activate user.
6. DELETE /:id: Wipe user data.

### Analytics & Notifications (Admin)
1. GET /admin/analytics/overview: System stats.
2. GET /admin/analytics/logins-per-day: Login frequency.
3. POST /admin/notifications/create: Broadcast notifications.
4. GET /notifications/my: User notifications list.

## 8) Frontend Documentation

### Architecture
- Modular structure under client/src/modules/ (auth, jobs, applications, admin).
- State management: React Query (server state) + Zustand (UI state).
- Design System: Custom Neo-Brutalist components with CSS Modules.

### Key Pages
- Home: Marketing landing with hero, features, and how-it-works.
- Auth: Login, Register, Verify Email, Reset Password.
- User Dashboard:
  - DashboardHomePage: Analytics overview.
  - DashboardJobsPage: Search and filter marketplace.
  - DashboardSavedJobsPage: Manage saved jobs and bulk-apply.
  - DashboardAutoApplyPage: BullMQ-powered scheduling workflow.
  - DashboardSettingsPage: Account and Gmail management.
- Admin Dashboard:
  - User management, system analytics, and broadcast notifications.

### Premium UI Elements
- SplashLoader: Animated "kafoo" brand loader with grainy textures and pulsing rings.
- RTL Support: Full Arabic language support across all dashboard and marketing pages.
- Responsive Design: Optimized for desktop and mobile.

## 9) Full Folder Structure

```text
.
├── client
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       │   ├── admin
│       │   │   ├── layout (AdminLayout, AdminNavbar, AdminSidebar)
│       │   │   └── sections (Analytics, Home, Users, Scraper, Settings...)
│       │   ├── auth (LoginForm, RegisterForm, RegisterModal)
│       │   ├── common (Card, DataTable, EmptyState, PageHeader, SearchBox, Select, StatCard)
│       │   ├── home
│       │   │   ├── layout (HomeFooter, HomeLayout, HomeNavbar)
│       │   │   └── sections (Hero, How, Features, Quote, Cta...)
│       │   ├── ui (Avatar, Badge, Button, Input, SplashLoader, Toggle...)
│       │   └── user
│       │       ├── layout (UserLayout, UserNavbar, UserSidebar)
│       │       └── sections (Analytics, AutoApply, Home, SavedJobs...)
│       ├── constants
│       ├── context
│       ├── hooks
│       ├── lib
│       ├── modules (Modular Business Logic)
│       │   ├── admin
│       │   ├── applications (api, components, hooks, types)
│       │   ├── auth (api, components, hooks, types)
│       │   └── jobs (api, components, hooks, types)
│       ├── pages
│       │   ├── admin (Dashboard, Users, Analytics, Notifications, Scrap...)
│       │   ├── auth (Login, Register, VerifyEmail, ResetPassword)
│       │   ├── error (NotFound)
│       │   ├── home
│       │   └── user (Dashboard, Jobs, SavedJobs, AutoApply, Analysis...)
│       ├── services (api.ts)
│       ├── styles (global.css)
│       ├── types
│       ├── App.tsx
│       ├── AppRoutes.tsx
│       └── main.tsx
├── server
│   ├── prisma
│   │   ├── migrations
│   │   └── schema.prisma
│   └── src
│       ├── config (db, redis, bullmq, mailer, env...)
│       ├── http
│       │   ├── middlewares (auth, error-handler, request-logger, validation...)
│       │   └── responses (success, error)
│       ├── notifications
│       │   ├── templates (verify-email, reset-password, application-status...)
│       │   └── notifications.service.ts
│       ├── shared
│       │   ├── constants
│       │   ├── errors (AppError, BadRequest, NotFound, Unauthorized...)
│       │   ├── types
│       │   ├── utils (api-response, hash, jwt, logger, paginate, tracking-pixel...)
│       │   └── validation
│       ├── v1
│       │   ├── modules
│       │   │   ├── analytics (service, controller, routes)
│       │   │   ├── applications (service, controller, routes, dto, types)
│       │   │   ├── auth (service, controller, routes, dto, types)
│       │   │   ├── gmail (service, controller, routes, dto)
│       │   │   ├── health (service, controller, routes)
│       │   │   ├── jobs (service, controller, routes, dto, types)
│       │   │   ├── notifications (service, controller, routes, dto)
│       │   │   ├── tracking (service, controller, routes)
│       │   │   └── users (service, controller, routes, dto, types)
│       │   └── routes.ts (V1 Router)
│       ├── workers
│       │   └── job-applications-schedule.worker.ts
│       ├── app.ts (Express Application)
│       ├── main.ts (Server Entry)
│       └── router.ts (Main Router)
├── package.json (Root)
├── PROJECT_FULL_DOCUMENTATION.md
└── README.md
```

## 10) Important Technical Notes

1. Auth: Uses HTTP-only cookies for refresh tokens + CSRF tokens.
2. Gmail Integration: Requires Google OAuth2 "gmail.send" and "userinfo.email" scopes.
3. BullMQ: Workers handle delayed email sending with exponential backoff.
4. CV Handling: CVs are uploaded as base64 or multipart and passed directly to the email worker; they are not permanently stored in the primary database.
5. Search: Supports keyword, location, and date (DAY/WEEK/MONTH) filtering.


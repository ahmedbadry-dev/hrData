# Kafoo Project Full Documentation

Last Updated: 2026-04-13

## 1) Project Overview

Kafoo is a monorepo web application with:
- Frontend: React + Vite + TypeScript in client
- Backend: Express + TypeScript + Prisma + PostgreSQL in server
- Monorepo orchestration via npm workspaces in root

Current implementation status summary:
- Core backend foundation is fully operational (Express, Middleware, Prisma, Redis, BullMQ).
- Most planned backend functional modules are implemented: auth, jobs, applications, cvs, gmail, analytics, notifications, tracking pixel, health checks.
- Scraper system is implemented with job enrichment using LLM (Groq) and scheduled workers.
- Frontend UI is mature with RTL Arabic support.
- Frontend migration to a modular structure (src/modules) is underway, with core features (auth, jobs, applications) now connected to real backend APIs using React Query.
- Backend test coverage has expanded to include new modules like analytics.

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

## 3) Technology Stack

### Backend Stack
- Runtime and framework: Node.js, Express
- Language: TypeScript
- Validation: Zod
- Auth: JWT + bcrypt
- Database: PostgreSQL + Prisma ORM
- Queue: BullMQ
- Cache/broker: Redis (ioredis)
- Email: Nodemailer
- Logging: Winston + Morgan
- Security middleware: Helmet + CORS + cookie-parser

### Frontend Stack
- Runtime/UI: React
- Build tool: Vite
- Language: TypeScript
- Routing: react-router-dom
- Data/client libs (installed): axios, @tanstack/react-query, react-hook-form, zod, zustand
- Charts/UI libs (installed/in use): chart.js, tanstack table, custom CSS modules components
- i18n packages installed: i18next + react-i18next

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
   - /cvs
   - /gmail (OAuth integration)

### Backend middleware chain
- helmet
- cors (dynamic: open in development, allowlist in production)
- morgan logger
- express.json / urlencoded
- cookieParser
- custom requestLogger
- global errorHandler

### Shared API response contract
All controllers return standardized response shape through ResponseHelper:
- success
- statusCode
- message
- data (optional)
- timestamp
- path
- paginationMeta (for paginated endpoints)

## 5) Environment and Configuration

Key backend env groups from server/.env.example:
- Server: PORT, NODE_ENV
- Database: DATABASE_URL
- Redis: REDIS_HOST, REDIS_PORT
- JWT: access/refresh/verification secrets and expirations
- Encryption: ENCRYPTION_KEY (hex)
- SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
- LLM Integration: GROQ_API_KEY (currently migrated to Groq)
- URLs: APP_URL, API_URL, CORS_ALLOWED_ORIGINS

Main backend config files:
- server/src/config/env.config.ts
- server/src/config/db.config.ts
- server/src/config/redis.ts
- server/src/config/bullmq.ts
- server/src/config/mailer.config.ts
- server/src/config/llm.ts
- server/src/config/constants.ts
- server/src/scraper/worker/scraper.scheduler.ts (Scraper logic)

## 6) Database Schema Documentation (Prisma)

Schema file:
- server/prisma/schema.prisma

### Enums
- UserRole: USER, ADMIN, SUPER_ADMIN
- UserStatus: PENDING_VERIFICATION, ACTIVE, SUSPENDED
- ApplicationStatus: SCHEDULED, SENDING, SENT, FAILED, EMAIL_SENT, EMAIL_OPENED
- NotificationType: INFO, SUCCESS, WARNING, ALERT
- NotificationTarget: ALL, ADMIN, USER
- JobLocation: RIYADH, JEDDAH, DAMMAM, KHOBAR, MECCA, MEDINA, TABUK
- DateFilter: DAY, WEEK, MONTH

### Models

#### User (users)
Purpose:
- Core identity/account table.

Important fields:
- id (uuid)
- firstName, lastName, fullName
- email (unique)
- phone (unique, nullable)
- passwordHash
- role, status, emailVerified
- verification/reset token fields
- failedLoginAttempts, lockedUntil
- createdAt, updatedAt

Relations:
- sessions[]
- gmailTokens[]
- savedJobs[]
- cvs[]
- emailTemplates[]
- applications[]
- notifications[]
- activityLogs[]

#### Session (sessions)
Purpose:
- Persist refresh-session context per token/device.

Important fields:
- id
- userId
- tokenHash (unique)
- expiresAt
- deviceName, ipAddress, userAgent
- createdAt, updatedAt

Relation:
- belongs to User (cascade on delete)

#### GmailToken (gmail_tokens)
Purpose:
- Stores OAuth tokens for Gmail integration.

Important fields:
- userId (unique)
- accessToken, refreshToken
- tokenExpiry
- email
- createdAt, updatedAt

Relation:
- belongs to User (cascade)

#### Job (jobs)
Purpose:
- Job inventory table.

Important fields:
- title, companyName, location, category, description
- hrEmail
- source, sourceUrl, language
- postedAt, expiresAt, isExpired
- createdAt, updatedAt

Constraints:
- unique(title, companyName, location)

Relations:
- savedJobs[]
- applications[]

#### SavedJob (saved_jobs)
Purpose:
- User-bookmarked jobs.

Important fields:
- userId, jobId
- createdAt

Constraints:
- unique(userId, jobId)

Relations:
- belongs to User (cascade)
- belongs to Job (cascade)

#### Cv (cvs)
Purpose:
- CV metadata per user.

Important fields:
- userId
- fileName, fileUrl, fileSize
- isDefault
- createdAt, updatedAt

Relations:
- belongs to User (cascade)
- applications[]

#### EmailTemplate (email_templates)
Purpose:
- Reusable email templates per user.

Important fields:
- userId
- name, subject, body
- isDefault
- createdAt, updatedAt

Relations:
- belongs to User (cascade)
- applications[]

#### Application (applications)
Purpose:
- Tracks application sending pipeline and email open tracking.

Important fields:
- userId, jobId
- cvId (nullable), emailTemplateId (nullable)
- status
- scheduledAt, sentAt, openedAt
- trackingToken (unique, nullable)
- errorMessage
- retryCount
- createdAt, updatedAt

Relations:
- belongs to User (cascade)
- belongs to Job (cascade)
- optional Cv (set null on cv delete)
- optional EmailTemplate (set null on template delete)

#### Notification (notifications)
Purpose:
- In-app notification storage.

Important fields:
- userId (nullable)
- title, body
- type, target
- isRead
- createdAt

Relation:
- optional relation to User (cascade)

#### ActivityLog (activity_logs)
Purpose:
- Event/audit-like records.

Important fields:
- userId (nullable)
- action
- entityType, entityId
- metadata (JSON)
- ipAddress
- createdAt

Relation:
- optional relation to User (set null on user delete)

#### SystemSetting (system_settings)
Purpose:
- Key-value configuration storage.

Important fields:
- key (unique)
- value
- description
- createdAt, updatedAt

### Prisma migrations currently present
- 20260410141226_init_schema_with_enums
- 20260410172815_add_full_name_to_user
- 20260410174805_add_email_tracking_statuses

## 7) Backend API Endpoints Documentation

Base URL prefix in app:
- /api

### Health Endpoints
Mounted at /api/health

1. GET /api/health
- Purpose: basic service health
- Auth: public
- Response data:
  - status
  - uptime
  - timestamp

2. GET /api/health/db
- Purpose: DB connectivity health
- Auth: public
- Response data:
  - status
  - db = connected

### Auth Endpoints
Mounted at /api/v1/auth

1. POST /api/v1/auth/register
- Validation schema: CreateUserDtoSchema
- Body:
  - firstName: string
  - lastName: string
  - email: email
  - phone: startsWith(0)
  - password: min 8
- Auth: public
- Behavior:
  - checks duplicate phone/email
  - hashes password
  - generates email verification temp token
  - stores hashed verification token
  - sends verification email

2. POST /api/v1/auth/verify-email
- Validation schema: VerifyEmailDtoSchema
- Query:
  - token: string
- Auth: public
- Behavior:
  - verifies token
  - marks emailVerified true
  - sets status ACTIVE

3. POST /api/v1/auth/login
- Validation schema: LoginDtoSchema
- Body:
  - email
  - password (min 8)
- Auth: public
- Behavior:
  - checks lockout and credentials
  - updates failed attempts counters
  - validates status/email verification
  - creates access + refresh tokens
  - stores session
  - sets refresh token cookie

4. POST /api/v1/auth/logout
- Auth: required (Bearer)
- Behavior:
  - removes current hashed refresh session
  - clears refresh cookie

5. POST /api/v1/auth/logout-all
- Auth: required (Bearer)
- Behavior:
  - deletes all sessions for current user
  - clears cookie

6. POST /api/v1/auth/refresh
- Auth: uses refreshToken cookie
- Behavior:
  - verifies refresh token
  - validates stored session and expiry
  - rotates session and returns new access token (+ new refresh cookie)

7. POST /api/v1/auth/forgot-password
- Validation schema: ForgotPasswordDtoSchema
- Body:
  - email
- Auth: public
- Behavior:
  - checks active + verified user
  - creates hashed reset token with expiry
  - sends reset email

8. POST /api/v1/auth/reset-password
- Validation schema: ResetPasswordDtoSchema
- Query:
  - token
- Body:
  - password
  - confirmPassword (must match)
- Auth: public
- Behavior:
  - validates token + expiry
  - updates password hash
  - clears reset token fields and user sessions

9. PATCH /api/v1/auth/change-password
- Validation schema: ChangePasswordDtoSchema
- Body:
  - currentPassword
  - newPassword
  - confirmNewPassword (must match)
- Auth: required (Bearer)
- Behavior:
  - verifies current password
  - saves new hash
  - deletes active sessions

### Jobs Endpoints
Mounted at /api/v1/jobs

All jobs endpoints in current routes require authentication middleware.

1. POST /api/v1/jobs/
- Validation: CreateJobDtoSchema
- Purpose: create single job record

2. POST /api/v1/jobs/bulk
- Validation: CreateBulkJobsDtoSchema
- Purpose: create bulk jobs (up to 100)

3. GET /api/v1/jobs/saved
- Validation: GetJobsDtoSchema (query)
- Query:
  - page, limit, keyword, location
- Purpose: list current user saved jobs with pagination

4. GET /api/v1/jobs/search
- Validation: SearchJobsDtoSchema (query)
- Query:
  - page, limit, keyword, location, dateFilter (DAY|WEEK|MONTH)
- Purpose: search jobs with filters and pagination

5. GET /api/v1/jobs/
- Validation: GetJobsDtoSchema
- Purpose: list jobs (paginated + filters)

6. GET /api/v1/jobs/:id
- Validation: JobIdParamDtoSchema
- Purpose: fetch single job by UUID

7. POST /api/v1/jobs/:id/save
- Validation: JobIdParamDtoSchema
- Purpose: save/bookmark job for current user

8. DELETE /api/v1/jobs/:id/save
- Validation: JobIdParamDtoSchema
- Purpose: unsave bookmarked job

### Tracking Endpoint
Mounted at /api/v1/track

1. GET /api/v1/track/open/:token
- Auth: public
- Purpose:
  - track email open event by tracking token
  - update application status to EMAIL_OPENED and openedAt
  - return transparent GIF pixel response

### Admin Users Endpoints
Mounted at /api/v1/admin/users

All endpoints require:
- authenticationMiddleware
- authorizationMiddleware(UserRole.ADMIN)

1. GET /api/v1/admin/users/
- Validation: GetUsersDtoSchema
- Query:
  - page, limit, keyword, status
- Purpose: paginated users list with search/filter

2. GET /api/v1/admin/users/:id
- Validation: UserIdParamDtoSchema
- Purpose: get one user

3. PATCH /api/v1/admin/users/:id
- Validation:
  - params: UserIdParamDtoSchema
  - body: UpdateUserDtoSchema
- Body fields (optional): firstName, lastName, phone
- Purpose: update user profile fields

4. PATCH /api/v1/admin/users/:id/suspend
- Validation: UserIdParamDtoSchema
- Purpose: suspend user (cannot suspend admin)

5. PATCH /api/v1/admin/users/:id/activate
- Validation: UserIdParamDtoSchema
- Purpose: activate suspended user

6. DELETE /api/v1/admin/users/:id
- Validation: UserIdParamDtoSchema
- Purpose: delete user and related data in transaction

### Applications Endpoints
Mounted at /api/v1/applications

All endpoints require authentication middleware.

1. GET /api/v1/applications/
- Validation: GetApplicationsDtoSchema (query)
- Query: page, limit, status
- Purpose: Fetch paginated list of user's applications.

2. GET /api/v1/applications/:id
- Validation: ApplicationIdParamDtoSchema
- Purpose: Fetch single application details.

3. POST /api/v1/applications/schedule
- Validation: ScheduleApplicationsDtoSchema
- Body: jobIds, sendTime, delayBetweenEmails, cvId
- Purpose: Schedule applications for selected jobs using BullMQ.

4. DELETE /api/v1/applications/:id
- Validation: ApplicationIdParamDtoSchema
- Purpose: Cancel a scheduled application.

### CVs Endpoints
Mounted at /api/v1/cvs

All endpoints require authentication middleware.

1. POST /api/v1/cvs/
- Body: file (multipart/form-data)
- Purpose: Upload a new PDF CV.

2. GET /api/v1/cvs/
- Purpose: List all CVs for the current user.

3. PATCH /api/v1/cvs/:id/default
- Validation: CvIdParamDtoSchema
- Purpose: Set a CV as the default for applications.

4. GET /api/v1/cvs/:id/file
- Validation: CvIdParamDtoSchema
- Purpose: Download the CV file.

5. DELETE /api/v1/cvs/:id
- Validation: CvIdParamDtoSchema
- Purpose: Delete a CV.

### Gmail (OAuth) Endpoints
Mounted at /api/v1/gmail

All endpoints require authentication middleware (except callback).

1. GET /api/v1/gmail/auth-url
- Purpose: Generate Google OAuth URL for Gmail integration.

2. GET /api/v1/gmail/callback
- Purpose: Handle Google OAuth callback and exchange codes for tokens.

3. GET /api/v1/gmail/status
- Purpose: Check if Gmail is connected and get the account email.

4. DELETE /api/v1/gmail/disconnect
- Purpose: Revoke tokens and disconnect Gmail.

### Admin Analytics Endpoints
Mounted at /api/v1/admin/analytics

All endpoints require Admin role.

1. GET /api/v1/admin/analytics/overview
- Purpose: Get high-level system overview (users, jobs, applications counts).

2. GET /api/v1/admin/analytics/logins-per-day
- Purpose: Get login frequency stats.

3. GET /api/v1/admin/analytics/applications-per-day
- Purpose: Get application frequency stats.

4. GET /api/v1/admin/analytics/top-jobs
- Purpose: Get most applied-to jobs.

### Notifications Endpoints
#### Admin Endpoints
Mounted at /api/v1/admin/notifications

1. POST /api/v1/admin/notifications/create
- Purpose: Create a notification for all users or specific groups.

#### User Endpoints
Mounted at /api/v1/notifications

1. GET /api/v1/notifications/my
- Purpose: List user notifications.

2. PATCH /api/v1/notifications/mark-all-read
- Purpose: Mark all notifications as read.

3. PATCH /api/v1/notifications/:id/mark-read
- Purpose: Mark single notification as read.

### Auth and Role Behavior

Authentication:
- Bearer token from Authorization header
- verifies token signature/type
- validates active, verified user
- validates live session by tokenId
- attaches req.user

Authorization:
- checks req.user role against allowed roles

### Implemented business logic highlights

Auth service methods implemented:
- register, verifyEmail, login, logout, logoutAll, refresh, forgotPassword, resetPassword, changePassword
- account lockout behavior with failed attempts and lock duration

Jobs service methods implemented:
- list/search/getById/save/unsave/create/createBulk
- pagination and saved state mapping

Users service methods implemented:
- list/get/update/suspend/activate/delete
- admin guard logic and pagination

## 8) Email and Tracking Documentation

Notification service features:
- sendVerificationEmail
- sendPasswordResetEmail
- sendApplicationStatusEmail
- retry behavior with up to 3 attempts

Tracking utilities:
- generateTrackingPixelUrl(token) -> /api/v1/track/open/:token URL
- TRANSPARENT_GIF 1x1 response payload

## 9) Frontend Documentation

### Frontend Routing Map

Public routes:
- /
- /login
- /register
- * -> NotFoundPage

Admin routes:
- /admin
- /admin/users
- /admin/analysis
- /admin/notifications
- /admin/scrap
- /admin/settings

User routes:
- /dashboard
- /dashboard/jobs
- /dashboard/saved-jobs
- /dashboard/auto-apply
- /dashboard/analysis
- /dashboard/settings

### Frontend pages and behavior

Home:
- HomePage composes:
  - HomeHeroSection
  - HomeHowSection
  - HomeFeaturesSection
  - HomeQuoteSection
  - HomeCtaSection
  - HomeFooterSection

Auth:
- LoginPage -> LoginForm
- RegisterPage -> RegisterForm
- Current behavior in forms is UI simulation and validation messaging (no real API call yet).

User dashboard pages:
- DashboardHomePage: KPI cards + weekly chart (from section component)
- DashboardJobsPage: search/filter UI, uses mockJobs, supports save and load more
- DashboardSavedJobsPage: saved list and remove actions
- DashboardAutoApplyPage: workflow with gmail-connected guard and send trigger
- DashboardAnalysisPage: application status list
- DashboardSettingsPage: gmail connect/disconnect and platform info actions

User dashboard state source:
- UserDashboardLayout holds local state:
  - savedJobs
  - applications
  - gmailConnected
- Persistence currently uses localStorage via userData helpers.

Admin dashboard pages:
- AdminHomePage
- AdminUsersPage
- AdminAnalyticsPage
- AdminNotificationsPage
- AdminScrapPage
- AdminSettingsPage

Admin dashboard state source:
- AdminDashboardLayout holds local state for:
  - users list and filters
  - announcements
  - scraper logs and running state
  - token visibility and mock actions
  - modal and toast states
- Data is mock-based from adminData.ts and in-memory state.

### Frontend Modular Architecture
The frontend has migrated to a modular structure under `client/src/modules/`. Each module contains its own:
- **api/**: React Query hooks and service calls.
- **components/**: Module-specific UI components.
- **hooks/**: Custom hooks for logic.
- **types/**: TypeScript definitions.

Current active modules:
- **auth/**: Handles login, registration, password reset, and protected routes.
- **jobs/**: Job search, filtering, and saved jobs.
- **applications/**: Application scheduling and status tracking.
- **cvs/**: CV management and uploads.

### Frontend data layer status
- axios instance exists in client/src/services/api.ts with baseURL /api.
- Core user flows (Auth, Jobs, Applications, CVs) are now fully wired to backend endpoints using @tanstack/react-query.
- State management uses a combination of Zustand and React Query cache.
- RTL support is consistently applied across all new modules.

## 10) Backend and Frontend Gaps (Current State)

Implemented strongly:
- Backend foundation and all core modules (Auth, Jobs, Applications, CVs, Gmail, Analytics, Notifications).
- Scraper system with LLM enrichment.
- Frontend modular architecture and core API integration.

Still missing or partial for full production feature set:
- Advanced analytics visualizations (more charts and deep-dive reports).
- Deployment automation (full CI/CD pipelines are not yet fully documented).
- Comprehensive end-to-end (E2E) testing suite for the integrated frontend-backend flows.

## 11) Testing Documentation

Current backend tests found:
- server/tests/analytics.dto.test.ts (New)
- server/tests/analytics.service.test.ts (New)
- server/tests/auth.middleware.test.ts
- server/tests/auth.routes.binding.test.ts
- server/tests/auth.service.login-status.test.ts
- server/tests/auth.service.refresh.test.ts
- server/tests/config-and-jwt-env.test.ts
- server/tests/crypto.util.test.ts
- server/tests/error-handler-jwt.test.ts
- server/tests/jobs.search.dto.test.ts
- server/tests/jobs.service.search.test.ts
- server/tests/refresh.dto.test.ts

Test command:
- in server workspace: npm run test

## 12) Build Artifacts and Generated Code

This repository includes committed generated/build outputs:
- client/dist/*
- server/dist/*
- server/generated/prisma/*

These are documented below in full file inventory.

## 13) Full Folder Structure (All Directories)

The following includes all project directories excluding .git and node_modules trees.

```text
.
.claude
.claude/skills
.claude/skills/speckit-analyze
.claude/skills/speckit-checklist
.claude/skills/speckit-clarify
.claude/skills/speckit-constitution
.claude/skills/speckit-implement
.claude/skills/speckit-plan
.claude/skills/speckit-specify
.claude/skills/speckit-tasks
.claude/skills/speckit-taskstoissues
.specify
.specify/integrations
.specify/integrations/claude
.specify/integrations/claude/scripts
.specify/memory
.specify/scripts
.specify/scripts/bash
.specify/templates
client
client/dist
client/dist/assets
client/src
client/src/components
client/src/components/admin
client/src/components/admin/layout
client/src/components/admin/layout/AdminLayout
client/src/components/admin/layout/AdminNavbar
client/src/components/admin/layout/AdminSidebar
client/src/components/admin/sections
client/src/components/admin/sections/AdminAnalyticsSection
client/src/components/admin/sections/AdminAnnouncementsSection
client/src/components/admin/sections/AdminHomeSection
client/src/components/admin/sections/AdminModals
client/src/components/admin/sections/AdminScraperSection
client/src/components/admin/sections/AdminSettingsSection
client/src/components/admin/sections/AdminToast
client/src/components/admin/sections/AdminUsersSection
client/src/components/auth
client/src/components/auth/LoginForm
client/src/components/auth/RegisterForm
client/src/components/auth/RegisterModal
client/src/components/common
client/src/components/common/Card
client/src/components/common/DataTable
client/src/components/common/EmptyState
client/src/components/common/PageHeader
client/src/components/common/SearchBox
client/src/components/common/Select
client/src/components/common/StatCard
client/src/components/home
client/src/components/home/layout
client/src/components/home/layout/HomeFooter
client/src/components/home/layout/HomeLayout
client/src/components/home/layout/HomeNavbar
client/src/components/home/sections
client/src/components/home/sections/HomeCtaSection
client/src/components/home/sections/HomeFeaturesSection
client/src/components/home/sections/HomeFooterSection
client/src/components/home/sections/HomeHeroSection
client/src/components/home/sections/HomeHowItWorksSection
client/src/components/home/sections/HomeHowSection
client/src/components/home/sections/HomeQuoteSection
client/src/components/ui
client/src/components/ui/Avatar
client/src/components/ui/Badge
client/src/components/ui/Button
client/src/components/ui/Input
client/src/components/ui/Spinner
client/src/components/ui/Toggle
client/src/components/user
client/src/components/user/layout
client/src/components/user/layout/UserLayout
client/src/components/user/layout/UserNavbar
client/src/components/user/layout/UserSidebar
client/src/components/user/sections
client/src/components/user/sections/UserAnalyticsSection
client/src/components/user/sections/UserAutoApplySection
client/src/components/user/sections/UserHomeSection
client/src/components/user/sections/UserSavedJobsSection
client/src/components/user/sections/UserSearchSection
client/src/components/user/sections/UserSettingsSection
client/src/context
client/src/lib
client/src/modules
client/src/modules/admin
client/src/modules/applications
client/src/modules/auth
client/src/modules/cvs
client/src/modules/jobs
client/src/pages
client/src/pages/admin
client/src/pages/auth
client/src/pages/error
client/src/pages/home
client/src/pages/user
client/src/services
client/src/styles
client/src/types
server
server/dist
server/dist/generated
server/dist/generated/prisma
server/dist/generated/prisma/internal
server/dist/generated/prisma/models
server/dist/src
server/dist/src/config
server/dist/src/http
server/dist/src/http/middlewares
server/dist/src/http/responses
server/dist/src/notifications
server/dist/src/notifications/templates
server/dist/src/shared
server/dist/src/shared/constants
server/dist/src/shared/errors
server/dist/src/shared/utils
server/dist/src/v1
server/dist/src/v1/modules
server/dist/src/v1/modules/auth
server/dist/src/v1/modules/auth/dto
server/dist/src/v1/modules/auth/types
server/dist/src/v1/modules/health
server/dist/src/v1/modules/users
server/dist/src/v1/modules/users/types
server/generated
server/generated/prisma
server/generated/prisma/internal
server/generated/prisma/models
server/generated/prisma/runtime
server/prisma
server/prisma/migrations
server/prisma/migrations/20260410141226_init_schema_with_enums
server/prisma/migrations/20260410172815_add_full_name_to_user
server/prisma/migrations/20260410174805_add_email_tracking_statuses
server/src
server/src/config
server/src/http
server/src/http/middlewares
server/src/notifications
server/src/notifications/templates
server/src/scraper
server/src/scraper/ewdifh
server/src/scraper/llm
server/src/scraper/worker
server/src/shared
server/src/shared/constants
server/src/shared/errors
server/src/shared/types
server/src/shared/utils
server/src/shared/validation
server/src/v1
server/src/v1/modules
server/src/v1/modules/analytics
server/src/v1/modules/applications
server/src/v1/modules/auth
server/src/v1/modules/auth/dto
server/src/v1/modules/auth/types
server/src/v1/modules/cvs
server/src/v1/modules/gmail
server/src/v1/modules/health
server/src/v1/modules/jobs
server/src/v1/modules/jobs/dto
server/src/v1/modules/jobs/types
server/src/v1/modules/notifications
server/src/v1/modules/tracking
server/src/v1/modules/users
server/src/v1/modules/users/dto
server/src/v1/modules/users/types
server/tests
```

## 14) Full File Inventory (Every File)

File inventory below includes all files in repository excluding .git and node_modules trees.

Total files in this snapshot: 393

```text
.claude/settings.local.json
.claude/skills/speckit-analyze/SKILL.md
.claude/skills/speckit-checklist/SKILL.md
.claude/skills/speckit-clarify/SKILL.md
.claude/skills/speckit-constitution/SKILL.md
.claude/skills/speckit-implement/SKILL.md
.claude/skills/speckit-plan/SKILL.md
.claude/skills/speckit-specify/SKILL.md
.claude/skills/speckit-tasks/SKILL.md
.claude/skills/speckit-taskstoissues/SKILL.md
.gitignore
.prettierignore
.prettierrc
.specify/init-options.json
.specify/integration.json
.specify/integrations/claude.manifest.json
.specify/integrations/claude/scripts/update-context.ps1
.specify/integrations/claude/scripts/update-context.sh
.specify/integrations/speckit.manifest.json
.specify/memory/constitution.md
.specify/scripts/bash/check-prerequisites.sh
.specify/scripts/bash/common.sh
.specify/scripts/bash/create-new-feature.sh
.specify/scripts/bash/setup-plan.sh
.specify/scripts/bash/update-agent-context.sh
.specify/templates/agent-file-template.md
.specify/templates/checklist-template.md
.specify/templates/constitution-template.md
.specify/templates/plan-template.md
.specify/templates/spec-template.md
.specify/templates/tasks-template.md
client/.env.development
client/.env.production
client/dist/assets/index-B5GInnQH.css
client/dist/assets/index-Bek3mCn9.js
client/dist/index.html
client/index.html
client/package.json
client/src/App.tsx
client/src/components/admin/layout/AdminLayout/AdminLayout.module.css
client/src/components/admin/layout/AdminLayout/AdminLayout.tsx
client/src/components/admin/layout/AdminNavbar/AdminNavbar.module.css
client/src/components/admin/layout/AdminNavbar/AdminNavbar.tsx
client/src/components/admin/layout/AdminSidebar/AdminSidebar.module.css
client/src/components/admin/layout/AdminSidebar/AdminSidebar.tsx
client/src/components/admin/layout/index.ts
client/src/components/admin/sections/AdminAnalyticsSection/AdminAnalyticsSection.module.css
client/src/components/admin/sections/AdminAnalyticsSection/AdminAnalyticsSection.tsx
client/src/components/admin/sections/AdminAnnouncementsSection/AdminAnnouncementsSection.module.css
client/src/components/admin/sections/AdminAnnouncementsSection/AdminAnnouncementsSection.tsx
client/src/components/admin/sections/adminData.ts
client/src/components/admin/sections/AdminHomeSection/AdminHomeSection.module.css
client/src/components/admin/sections/AdminHomeSection/AdminHomeSection.tsx
client/src/components/admin/sections/AdminModals/AdminModals.module.css
client/src/components/admin/sections/AdminModals/AdminModals.tsx
client/src/components/admin/sections/AdminScraperSection/AdminScraperSection.module.css
client/src/components/admin/sections/AdminScraperSection/AdminScraperSection.tsx
client/src/components/admin/sections/AdminSettingsSection/AdminSettingsSection.module.css
client/src/components/admin/sections/AdminSettingsSection/AdminSettingsSection.tsx
client/src/components/admin/sections/AdminToast/AdminToast.module.css
client/src/components/admin/sections/AdminToast/AdminToast.tsx
client/src/components/admin/sections/AdminUsersSection/AdminUsersSection.module.css
client/src/components/admin/sections/AdminUsersSection/AdminUsersSection.tsx
client/src/components/admin/sections/index.ts
client/src/components/auth/index.ts
client/src/components/auth/LoginForm/LoginForm.module.css
client/src/components/auth/LoginForm/LoginForm.tsx
client/src/components/auth/RegisterForm/RegisterForm.module.css
client/src/components/auth/RegisterForm/RegisterForm.tsx
client/src/components/auth/RegisterModal/RegisterModal.module.css
client/src/components/auth/RegisterModal/RegisterModal.tsx
client/src/components/common/Card/Card.module.css
client/src/components/common/Card/Card.tsx
client/src/components/common/DataTable/DataTable.module.css
client/src/components/common/DataTable/DataTable.tsx
client/src/components/common/EmptyState/EmptyState.module.css
client/src/components/common/EmptyState/EmptyState.tsx
client/src/components/common/index.ts
client/src/components/common/PageHeader/PageHeader.module.css
client/src/components/common/PageHeader/PageHeader.tsx
client/src/components/common/SearchBox/SearchBox.module.css
client/src/components/common/SearchBox/SearchBox.tsx
client/src/components/common/Select/Select.module.css
client/src/components/common/Select/Select.tsx
client/src/components/common/StatCard/StatCard.module.css
client/src/components/common/StatCard/StatCard.tsx
client/src/components/home/layout/HomeFooter/HomeFooter.tsx
client/src/components/home/layout/HomeLayout/HomeLayout.module.css
client/src/components/home/layout/HomeLayout/HomeLayout.tsx
client/src/components/home/layout/HomeNavbar/HomeNavbar.tsx
client/src/components/home/layout/index.ts
client/src/components/home/sections/HomeCtaSection/HomeCtaSection.tsx
client/src/components/home/sections/homeData.ts
client/src/components/home/sections/HomeFeaturesSection/HomeFeaturesSection.tsx
client/src/components/home/sections/HomeFooterSection/HomeFooterSection.tsx
client/src/components/home/sections/HomeHeroSection/HomeHeroSection.tsx
client/src/components/home/sections/HomeHowItWorksSection/HomeHowItWorksSection.tsx
client/src/components/home/sections/HomeHowSection/HomeHowSection.tsx
client/src/components/home/sections/HomeQuoteSection/HomeQuoteSection.tsx
client/src/components/home/sections/index.ts
client/src/components/ui/Avatar/Avatar.module.css
client/src/components/ui/Avatar/Avatar.tsx
client/src/components/ui/Badge/Badge.module.css
client/src/components/ui/Badge/Badge.tsx
client/src/components/ui/Button/Button.module.css
client/src/components/ui/Button/Button.tsx
client/src/components/ui/index.ts
client/src/components/ui/Input/Input.module.css
client/src/components/ui/Input/Input.tsx
client/src/components/ui/Spinner/Spinner.module.css
client/src/components/ui/Spinner/Spinner.tsx
client/src/components/ui/Toggle/Toggle.module.css
client/src/components/ui/Toggle/Toggle.tsx
client/src/components/user/layout/index.ts
client/src/components/user/layout/UserLayout/UserLayout.module.css
client/src/components/user/layout/UserLayout/UserLayout.tsx
client/src/components/user/layout/UserNavbar/UserNavbar.module.css
client/src/components/user/layout/UserNavbar/UserNavbar.tsx
client/src/components/user/layout/UserSidebar/UserSidebar.module.css
client/src/components/user/layout/UserSidebar/UserSidebar.tsx
client/src/components/user/sections/index.ts
client/src/components/user/sections/UserAnalyticsSection/UserAnalyticsSection.module.css
client/src/components/user/sections/UserAnalyticsSection/UserAnalyticsSection.tsx
client/src/components/user/sections/UserAutoApplySection/UserAutoApplySection.module.css
client/src/components/user/sections/UserAutoApplySection/UserAutoApplySection.tsx
client/src/components/user/sections/userData.ts
client/src/components/user/sections/UserHomeSection/UserHomeSection.module.css
client/src/components/user/sections/UserHomeSection/UserHomeSection.tsx
client/src/components/user/sections/UserSavedJobsSection/UserSavedJobsSection.module.css
client/src/components/user/sections/UserSavedJobsSection/UserSavedJobsSection.tsx
client/src/components/user/sections/UserSearchSection/UserSearchSection.module.css
client/src/components/user/sections/UserSearchSection/UserSearchSection.tsx
client/src/components/user/sections/UserSettingsSection/UserSettingsSection.module.css
client/src/components/user/sections/UserSettingsSection/UserSettingsSection.tsx
client/src/lib/utils.ts
client/src/main.tsx
client/src/pages/admin/AdminAnalyticsPage.tsx
client/src/pages/admin/AdminDashboardLayout.tsx
client/src/pages/admin/AdminHomePage.tsx
client/src/pages/admin/AdminNotificationsPage.tsx
client/src/pages/admin/AdminScrapPage.tsx
client/src/pages/admin/AdminSettingsPage.tsx
client/src/pages/admin/AdminUsersPage.tsx
client/src/pages/auth/AuthPages.module.css
client/src/pages/auth/LoginPage.tsx
client/src/pages/auth/RegisterPage.tsx
client/src/pages/error/NotFoundPage.tsx
client/src/pages/home/HomePage.tsx
client/src/pages/user/DashboardAnalysisPage.tsx
client/src/pages/user/DashboardAutoApplyPage.tsx
client/src/pages/user/DashboardHomePage.tsx
client/src/pages/user/DashboardJobsPage.tsx
client/src/pages/user/DashboardSavedJobsPage.tsx
client/src/pages/user/DashboardSettingsPage.tsx
client/src/pages/user/UserDashboardLayout.tsx
client/src/services/api.ts
client/src/styles.d.ts
client/src/styles/global.css
client/tsconfig.json
client/tsconfig.node.json
client/vite.config.ts
package.json
package-lock.json
PROJECT_FULL_DOCUMENTATION.md
README.md
server/.env
server/.env.example
server/dist/generated/prisma/browser.js
server/dist/generated/prisma/client.js
server/dist/generated/prisma/commonInputTypes.js
server/dist/generated/prisma/enums.js
server/dist/generated/prisma/internal/class.js
server/dist/generated/prisma/internal/prismaNamespace.js
server/dist/generated/prisma/internal/prismaNamespaceBrowser.js
server/dist/generated/prisma/models.js
server/dist/generated/prisma/models/ActivityLog.js
server/dist/generated/prisma/models/Application.js
server/dist/generated/prisma/models/Cv.js
server/dist/generated/prisma/models/EmailTemplate.js
server/dist/generated/prisma/models/GmailToken.js
server/dist/generated/prisma/models/Job.js
server/dist/generated/prisma/models/Notification.js
server/dist/generated/prisma/models/SavedJob.js
server/dist/generated/prisma/models/SystemSetting.js
server/dist/generated/prisma/models/User.js
server/dist/index.js
server/dist/src/app.js
server/dist/src/config/bullmq.js
server/dist/src/config/constants.js
server/dist/src/config/db.config.js
server/dist/src/config/env.config.js
server/dist/src/config/env.js
server/dist/src/config/llm.js
server/dist/src/config/mailer.config.js
server/dist/src/config/mailer.js
server/dist/src/config/prisma.js
server/dist/src/config/redis.js
server/dist/src/http/middlewares/auth.middleware.js
server/dist/src/http/middlewares/error-handler.js
server/dist/src/http/middlewares/request-logger.js
server/dist/src/http/middlewares/validation.middleware.js
server/dist/src/http/responses/error.response.js
server/dist/src/http/responses/success.response.js
server/dist/src/main.js
server/dist/src/notifications/notifications.service.js
server/dist/src/notifications/templates/reset-password.template.js
server/dist/src/notifications/templates/verify-email.template.js
server/dist/src/router.js
server/dist/src/shared/constants/http-status.constants.js
server/dist/src/shared/errors/AppError.js
server/dist/src/shared/errors/BadRequestException.js
server/dist/src/shared/errors/ConflictException.js
server/dist/src/shared/errors/error-codes.js
server/dist/src/shared/errors/ForbiddenException.js
server/dist/src/shared/errors/InternalServerError.js
server/dist/src/shared/errors/NotFoundException.js
server/dist/src/shared/errors/UnauthorizedException.js
server/dist/src/shared/utils/api-response.js
server/dist/src/shared/utils/crypto.util.js
server/dist/src/shared/utils/escape-html.utils.js
server/dist/src/shared/utils/exclude-password.utils.js
server/dist/src/shared/utils/hash.util.js
server/dist/src/shared/utils/jwt.util.js
server/dist/src/shared/utils/logger.util.js
server/dist/src/shared/utils/paginate.util.js
server/dist/src/shared/utils/template-compiler.util.js
server/dist/src/shared/utils/tracking-pixel.util.js
server/dist/src/v1/modules/auth/auth.constants.js
server/dist/src/v1/modules/auth/auth.controller.js
server/dist/src/v1/modules/auth/auth.routes.js
server/dist/src/v1/modules/auth/auth.service.js
server/dist/src/v1/modules/auth/dto/change-password.dto.js
server/dist/src/v1/modules/auth/dto/create-user.dto.js
server/dist/src/v1/modules/auth/dto/forgot-password.dto.js
server/dist/src/v1/modules/auth/dto/login.dto.js
server/dist/src/v1/modules/auth/dto/refresh.dto.js
server/dist/src/v1/modules/auth/dto/reset-password.dto.js
server/dist/src/v1/modules/auth/dto/revoke-session.dto.js
server/dist/src/v1/modules/auth/dto/verify-email.dto.js
server/dist/src/v1/modules/auth/types/auth.types.js
server/dist/src/v1/modules/health/health.controller.js
server/dist/src/v1/modules/health/health.routes.js
server/dist/src/v1/modules/health/health.service.js
server/dist/src/v1/modules/users/types/user.types.js
server/dist/src/v1/routes.js
server/generated/prisma/browser.ts
server/generated/prisma/client.d.ts
server/generated/prisma/client.js
server/generated/prisma/client.ts
server/generated/prisma/commonInputTypes.ts
server/generated/prisma/default.d.ts
server/generated/prisma/default.js
server/generated/prisma/edge.d.ts
server/generated/prisma/edge.js
server/generated/prisma/enums.ts
server/generated/prisma/index.d.ts
server/generated/prisma/index.js
server/generated/prisma/index-browser.js
server/generated/prisma/internal/class.ts
server/generated/prisma/internal/prismaNamespace.ts
server/generated/prisma/internal/prismaNamespaceBrowser.ts
server/generated/prisma/models.ts
server/generated/prisma/models/ActivityLog.ts
server/generated/prisma/models/Application.ts
server/generated/prisma/models/Cv.ts
server/generated/prisma/models/EmailTemplate.ts
server/generated/prisma/models/GmailToken.ts
server/generated/prisma/models/Job.ts
server/generated/prisma/models/Notification.ts
server/generated/prisma/models/SavedJob.ts
server/generated/prisma/models/SystemSetting.ts
server/generated/prisma/models/User.ts
server/generated/prisma/package.json
server/generated/prisma/query_compiler_fast_bg.js
server/generated/prisma/query_compiler_fast_bg.wasm
server/generated/prisma/query_compiler_fast_bg.wasm-base64.js
server/generated/prisma/query_engine_bg.js
server/generated/prisma/query_engine_bg.wasm
server/generated/prisma/query_engine-windows.dll.node
server/generated/prisma/query_engine-windows.dll.node.tmp32332
server/generated/prisma/query_engine-windows.dll.node.tmp36260
server/generated/prisma/query_engine-windows.dll.node.tmp38844
server/generated/prisma/runtime/client.d.ts
server/generated/prisma/runtime/client.js
server/generated/prisma/runtime/edge.js
server/generated/prisma/runtime/edge-esm.js
server/generated/prisma/runtime/index-browser.d.ts
server/generated/prisma/runtime/index-browser.js
server/generated/prisma/runtime/library.d.ts
server/generated/prisma/runtime/library.js
server/generated/prisma/runtime/react-native.js
server/generated/prisma/runtime/wasm-compiler-edge.js
server/generated/prisma/runtime/wasm-engine-edge.js
server/generated/prisma/schema.prisma
server/generated/prisma/wasm.d.ts
server/generated/prisma/wasm.js
server/generated/prisma/wasm-edge-light-loader.mjs
server/generated/prisma/wasm-worker-loader.mjs
server/package.json
server/prisma.config.ts
server/prisma/migrations/20260410141226_init_schema_with_enums/migration.sql
server/prisma/migrations/20260410172815_add_full_name_to_user/migration.sql
server/prisma/migrations/20260410174805_add_email_tracking_statuses/migration.sql
server/prisma/migrations/migration_lock.toml
server/prisma/schema.prisma
server/prisma/seed.ts
server/src/app.ts
server/src/config/bullmq.ts
server/src/config/constants.ts
server/src/config/db.config.ts
server/src/config/env.config.ts
server/src/config/llm.ts
server/src/config/mailer.config.ts
server/src/config/redis.ts
server/src/http/middlewares/auth.middleware.ts
server/src/http/middlewares/error-handler.ts
server/src/http/middlewares/request-logger.ts
server/src/http/middlewares/validation.middleware.ts
server/src/main.ts
server/src/notifications/notifications.service.ts
server/src/notifications/templates/application-status.template.ts
server/src/notifications/templates/reset-password.template.ts
server/src/notifications/templates/verify-email.template.ts
server/src/router.ts
server/src/shared/constants/http-status.constants.ts
server/src/shared/errors/AppError.ts
server/src/shared/errors/BadRequestException.ts
server/src/shared/errors/ConflictException.ts
server/src/shared/errors/error-codes.ts
server/src/shared/errors/ForbiddenException.ts
server/src/shared/errors/InternalServerError.ts
server/src/shared/errors/NotFoundException.ts
server/src/shared/errors/UnauthorizedException.ts
server/src/shared/types/express.d.ts
server/src/shared/utils/api-response.ts
server/src/shared/utils/crypto.util.ts
server/src/shared/utils/escape-html.utils.ts
server/src/shared/utils/exclude-password.utils.ts
server/src/shared/utils/hash.util.ts
server/src/shared/utils/jwt.util.ts
server/src/shared/utils/logger.util.ts
server/src/shared/utils/paginate.util.ts
server/src/shared/utils/template-compiler.util.ts
server/src/shared/utils/tracking-pixel.util.ts
server/src/v1/modules/auth/auth.constants.ts
server/src/v1/modules/auth/auth.controller.ts
server/src/v1/modules/auth/auth.routes.ts
server/src/v1/modules/auth/auth.service.ts
server/src/v1/modules/auth/dto/change-password.dto.ts
server/src/v1/modules/auth/dto/create-user.dto.ts
server/src/v1/modules/auth/dto/forgot-password.dto.ts
server/src/v1/modules/auth/dto/login.dto.ts
server/src/v1/modules/auth/dto/refresh.dto.ts
server/src/v1/modules/auth/dto/reset-password.dto.ts
server/src/v1/modules/auth/dto/revoke-session.dto.ts
server/src/v1/modules/auth/dto/verify-email.dto.ts
server/src/v1/modules/auth/types/auth.types.ts
server/src/v1/modules/health/health.controller.ts
server/src/v1/modules/health/health.routes.ts
server/src/v1/modules/health/health.service.ts
server/src/v1/modules/jobs/dto/create-bulk-jobs.dto.ts
server/src/v1/modules/jobs/dto/create-job.dto.ts
server/src/v1/modules/jobs/dto/get-jobs.dto.ts
server/src/v1/modules/jobs/dto/job-id-param.dto.ts
server/src/v1/modules/jobs/dto/search-jobs.dto.ts
server/src/v1/modules/jobs/jobs.constants.ts
server/src/v1/modules/jobs/jobs.controller.ts
server/src/v1/modules/jobs/jobs.routes.ts
server/src/v1/modules/jobs/jobs.service.ts
server/src/v1/modules/jobs/types/jobs.types.ts
server/src/v1/modules/tracking/tracking.controller.ts
server/src/v1/modules/tracking/tracking.routes.ts
server/src/v1/modules/tracking/tracking.service.ts
server/src/v1/modules/users/dto/get-users.dto.ts
server/src/v1/modules/users/dto/update-user.dto.ts
server/src/v1/modules/users/dto/user-id-param.dto.ts
server/src/v1/modules/users/types/user.types.ts
server/src/v1/modules/users/users.constants.ts
server/src/v1/modules/users/users.controller.ts
server/src/v1/modules/users/users.routes.ts
server/src/v1/modules/users/users.service.ts
server/src/v1/routes.ts
server/tests/auth.middleware.test.ts
server/tests/auth.routes.binding.test.ts
server/tests/auth.service.login-status.test.ts
server/tests/auth.service.refresh.test.ts
server/tests/config-and-jwt-env.test.ts
server/tests/crypto.util.test.ts
server/tests/error-handler-jwt.test.ts
server/tests/jobs.search.dto.test.ts
server/tests/jobs.service.search.test.ts
server/tests/refresh.dto.test.ts
server/tsconfig.json
typecheck.log
```

## 15) Important Notes for Next Engineering Steps

1. Keep API docs in this file synchronized whenever any new route is added under server/src/v1/modules.
2. Move frontend user/admin/auth data fetching from mock/localStorage to backend APIs incrementally per domain.
3. Keep Prisma schema section synchronized with new migrations.
4. Consider splitting this document into:
   - Architecture docs
   - API reference
   - Frontend feature docs
   - Auto-generated inventory docs


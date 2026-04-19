# Kafoo Project Full Documentation

Last Updated: 2026-04-19

## 1) Project Overview

Kafoo is a monorepo web application with:
- Frontend: React + Vite + TypeScript in client
- Backend: Express + TypeScript + Prisma + PostgreSQL in server
- Monorepo orchestration via npm workspaces in root

Current implementation status summary:
- Core backend foundation is fully operational (Express, Middleware, Prisma, Redis, BullMQ).
- Most planned backend functional modules are implemented: auth, jobs, applications, gmail, analytics, notifications, tracking pixel, health checks.
- Scraper system is fully operational and integrated with BullMQ and AI extraction logic (Gemini 3 Flash).
- Backend features account lockout, session management with refresh tokens, rate limiting, and CSRF protection.
- Frontend UI is mature with RTL Arabic support and a premium Neo-Brutalist design.
- Frontend migration to a modular structure (src/modules) is complete for core features (auth, jobs, applications).
- Data fetching is handled via React Query, integrated with backend APIs.

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
- Auth: JWT + bcrypt + cookie-session rotation + CSRF protection
- Database: PostgreSQL + Prisma ORM (v6+)
- Queue: BullMQ (v5+) for scheduled email applications and scraping tasks
- Monitoring: @bull-board/express for queue management
- Cache/broker: Redis (ioredis)
- Email: Nodemailer + Gmail OAuth2 integration
- LLM Integration: Google Gemini (Gemini 3 Flash), Groq (optional), OpenAI (optional)
- Web Scraping: Cheerio + Axios + Bottleneck (rate limiting)
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
2. server/src/app.ts builds middleware stack, mounts BullBoard for monitoring, and mounts /api.
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
   - /admin/scraper
   - /notifications (user-specific)
   - /applications
   - /gmail (OAuth integration)

### Backend middleware chain
- helmet
- cors (dynamic: uses allowlist from env)
- morgan logger
- express.json / urlencoded (with 10mb limit)
- cookieParser
- custom requestLogger
- CSRF protection (csrf-csrf)
- rate limiting (auth-specific and global API)
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
- Server: PORT, NODE_ENV, APP_URL, SERVER_URL, CORS_ALLOWED_ORIGINS
- Database: DATABASE_URL
- Redis: REDIS_HOST, REDIS_PORT
- JWT: access/refresh/verification secrets and expirations
- Encryption: ENCRYPTION_KEY (64-char hex)
- SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
- LLM Integration: GOOGLE_GENAI_API_KEY (Gemini), GROQ_API_KEY, OPENAI_API_KEY
- Google OAuth: GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REDIRECT_URI

Main backend config files:
- server/src/config/env.config.ts
- server/src/config/db.config.ts
- server/src/config/redis.ts
- server/src/config/bullmq.ts
- server/src/config/bull-board.ts
- server/src/config/mailer.config.ts
- server/src/config/llm.ts
- server/src/config/constants.ts

## 6) Database Schema Documentation (Prisma)

Schema file: server/prisma/schema.prisma

### Enums
- UserRole: USER, ADMIN, SUPER_ADMIN
- UserStatus: PENDING_VERIFICATION, ACTIVE, SUSPENDED
- ApplicationStatus: SCHEDULED, SENDING, SENT, FAILED, EMAIL_SENT, EMAIL_OPENED, EMAIL_FAILED
- NotificationType: INFO, SUCCESS, WARNING, ALERT
- NotificationTarget: ALL, ADMIN, USER
- JobLocation: RIYADH, JEDDAH, DAMMAM, KHOBAR, MECCA, MEDINA, TABUK, OTHER
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

### Admin Scraper Endpoints (/api/v1/admin/scraper)
1. GET /status: Get scraper scheduler and queue status.
2. POST /start: Start the recurring scraper schedule.
3. POST /stop: Stop/Pause the scraper schedule.
4. POST /run-now: Trigger a manual scrape job immediately.

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

### 8.1) Architecture & Design System
- **Framework**: React 18+ with Vite and TypeScript.
- **Design Style**: **Neo-Brutalist** (High contrast, thick borders, vibrant accents, grainy textures, and bold typography).
- **RTL Support**: Native Arabic support with `dir="rtl"` and logical CSS properties.
- **State Management**:
  - **Server State**: `@tanstack/react-query` for caching and synchronization.
  - **UI State**: `Zustand` for lightweight client-side state (sidebar toggles, modals).
  - **Context API**: `AuthModalContext` for global auth modals and `AuthContext` for user session.
- **Layout Patterns**:
  - **Home Layout**: Centered marketing content with a sticky glassmorphism navbar and a multi-section footer.
  - **Dashboard Layouts (User/Admin)**: Persistent Sidebar (desktop) / Drawer (mobile) + Top Navbar + Scrollable Content Area.

### 8.2) Page Detailed Documentation

#### A) Home Page (Marketing)
- **Layout**: Full-width scrolling page with distinct sections.
- **Sections**:
  - **Hero**: Atmospheric intro with a pulsing "Kafoo" brand loader and call-to-action.
  - **How it Works**: Step-by-step visual guide to the automation workflow.
  - **Features**: Grid card layout showcasing Scraper, Auto-Apply, and Tracking.
  - **Quote/Testimonial**: Stylized block for social proof.
  - **CTA Footer**: Final push for registration.

#### B) Authentication Pages
- **Login/Register**: Implemented as high-fidelity modals accessible from any page, plus dedicated routes for direct access.
- **Verify Email**: A dedicated landing page that validates the token from the URL and displays success/error states with custom icons.
- **Reset Password**: Multi-step layout with token validation, password strength feedback, and a "Success" panel upon completion.

#### C) User Dashboard
- **Home (Overview)**:
  - **Stats Row**: Cards showing Total Jobs, Saved Jobs, Applications Sent, and Replies.
  - **Activity Chart**: Weekly bar chart of sent applications.
  - **Quick Actions**: Navigation shortcuts to jobs and auto-apply.
- **Jobs Marketplace**:
  - **Search & Filter Bar**: Keyword search, Location dropdown (Riyadh, Jeddah, etc.), and Date filters (Last 24h, Week, Month).
  - **Job Cards**: Detailed cards with company logo placeholders, metadata, and a "Save" heart toggle.
  - **Pagination**: Server-side pagination with smooth transitions.
- **Saved Jobs**:
  - **Management**: List of bookmarked jobs with "Unsave" and "Bulk Remove" options.
  - **Bulk Transfer**: Fast-track selected jobs to the Auto-Apply queue.
- **Auto-Apply (The Engine)**:
  - **Selection**: Checklist of saved jobs to apply for.
  - **Scheduling**: Options for "Immediately", "Specific Time (e.g., 8 AM)", or custom delays.
  - **CV Upload**: Drag-and-drop zone for PDF/Word documents.
  - **Gmail Connect**: Status indicator and OAuth link button.
- **Analysis (Tracking)**:
  - **Applications Table**: Detailed list of sent/scheduled applications.
  - **Status Indicators**: Pulse badges for "Scheduled", "Sent", "Opened", "Failed".
  - **Detailed View**: View retry counts and specific error messages for failed attempts.
- **Settings**:
  - **Profile**: Manage name, phone, and account status.
  - **Integrations**: Connect/Disconnect Google/Gmail account with real-time status sync.

#### D) Admin Dashboard
- **Admin Home**: High-level system health monitoring (Daily Logins, Total Users, Recent System Logs).
- **User Management**: Advanced data table for Super Admins to Suspend, Activate, or Delete accounts.
- **Scraper Control**:
  - **Terminal View**: Real-time log output from the scraper worker.
  - **manual Trigger**: "Run Now" button to bypass scheduled cron.
  - **Settings**: Configure API tokens and target URLs.
- **Notifications**: Create "Broadcast" notifications (Alert/Info/Success) that appear to all users in real-time.

---

## 9) Detailed Scraper System Documentation

### 9.1) Core Workflow
1.  **Discovery**: `scraper.service` iterates through configured sites in `scraper.config.ts`.
2.  **Extraction**: `scraper.client` fetches HTML and uses Cheerio selectors to find job links.
3.  **Content Analysis**: The system visits each link and extracts the job description body.
4.  **AI Engine**:
    - Raw text is sent to **Gemini 3 Flash**.
    - AI extracts structured JSON: `title`, `company`, `location`, `category`, `hrEmail`.
    - **Bottleneck** ensures we stay within AI rate limits (e.g., 100 RPM).
5.  **Storage**: Jobs are normalized and saved to PostgreSQL with a unique constraint check.

### 9.2) Scheduled Tasks (Cron)
- The scraper runs on a configurable schedule (default: every 6 hours).
- Managed via `BullMQ` with a dedicated `scraper-worker`.
- Features "Locking" via Redis to prevent overlapping runs if a previous run is still active.

---

## 10) Email Tracking & Analytics Logic

### 10.1) Tracking Pixel
- Each email sent via Auto-Apply contains a hidden `1x1 transparent GIF`.
- The pixel URL contains a unique JWT/Token associated with the `Application` ID.
- Accessing the pixel triggers the `/api/v1/track/open/:token` endpoint, which increments the "Opened" status in the DB.

### 10.2) Analytics Pipeline
- **Activity Logs**: Every significant user action (Login, Save, Apply) creates an `ActivityLog` entry.
- **Aggregations**: Admin analytics perform SQL `COUNT` and `GROUP BY` operations on these logs to generate the charts.

---

## 11) Security Implementation Details

- **CSRF Protection**: Native `csrf-csrf` middleware using double-submit cookies.
- **Session Security**:
  - **Access Token**: Short-lived (15m) JWT in memory or secure cookie.
  - **Refresh Token**: Long-lived (7d) JWT in an **HTTP-only, Secure, SameSite=Strict** cookie.
  - **Session Rotation**: On each `/refresh` call, a new refresh token is issued and the old one is invalidated.
- **Encryption**: sensitive data (like Gmail tokens) are encrypted at rest using `AES-256-GCM` before being stored in the database.
- **Rate Limiting**:
  - **Global**: 100 requests per 15 minutes per IP.
  - **Auth**: 10 attempts per 1 hour to prevent brute force.

---

## 12) Full Folder Structure

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
│       ├── modules (Modular Business Logic)
│       │   ├── admin (analytics, notifications, users)
│       │   ├── applications (api, components, hooks, types)
│       │   ├── auth (api, components, hooks, types)
│       │   └── jobs (api, components, hooks, types)
│       ├── pages
│       │   ├── admin (Dashboard, Users, Analytics, Notifications, Scrap...)
│       │   ├── auth (Login, Register, VerifyEmail, ResetPassword)
│       │   ├── error (NotFound)
│       │   ├── home
│       │   └── user (Dashboard, Jobs, SavedJobs, AutoApply, Analysis...)
│       ├── App.tsx
│       ├── AppRoutes.tsx
│       └── main.tsx
├── server
│   ├── prisma
│   │   └── schema.prisma
│   └── src
│       ├── config (db, redis, bullmq, bull-board, mailer, env, llm...)
│       ├── http
│       │   ├── middlewares (auth, error-handler, request-logger, validation, csrf...)
│       │   └── responses (success, error)
│       ├── scraper (Core Scraper Logic)
│       │   ├── scraper.client.ts
│       │   ├── scraper.config.ts
│       │   ├── scraper.service.ts
│       │   ├── scraper.scheduler.ts
│       │   └── scraper.storage.ts
│       ├── shared
│       │   ├── constants
│       │   ├── errors
│       │   ├── types
│       │   ├── utils (api-response, hash, jwt, logger, paginate, tracking-pixel...)
│       │   └── validation
│       ├── v1
│       │   ├── modules
│       │   │   ├── analytics
│       │   │   ├── applications
│       │   │   ├── auth
│       │   │   ├── gmail
│       │   │   ├── health
│       │   │   ├── jobs
│       │   │   ├── notifications
│       │   │   ├── scraper (API Module)
│       │   │   ├── tracking
│       │   │   └── users
│       │   └── routes.ts (V1 Router)
│       ├── workers
│       │   ├── job-applications-schedule.worker.ts
│       │   └── scraper.worker.ts
│       ├── app.ts (Express Application)
│       ├── main.ts (Server Entry)
│       └── router.ts (Main Router)
├── package.json (Root)
├── PROJECT_FULL_DOCUMENTATION.md
└── README.md
```

## 13) Final Technical Notes

1. **Auth**: Uses HTTP-only cookies for refresh tokens + CSRF tokens.
2. **Gmail Integration**: Requires Google OAuth2 "gmail.send" and "userinfo.email" scopes.
3. **BullMQ**: 
   - **Application Worker**: Handles delayed email sending with exponential backoff.
   - **Scraper Worker**: Handles recurring job scraping tasks.
4. **AI Scraper**: Uses Gemini 3 Flash to extract structured JSON from raw HTML. Features a fallback mechanism and rate-limiting via Bottleneck.
5. **CV Handling**: CVs are uploaded as base64 and passed directly to the email worker; they are not permanently stored in the primary database.
6. **Search**: Supports keyword, location, and date (DAY/WEEK/MONTH) filtering.
7. **Monitoring**: BullBoard is available at `/admin/queues` (requires admin privileges).

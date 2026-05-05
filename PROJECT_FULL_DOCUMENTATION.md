# HR Data Project Full Documentation

Last Updated: 2026-04-20

## 1) Project Overview

HR Data is a high-performance monorepo web application designed to automate job searching and applications. It features a robust scraper system, AI-driven data extraction, and a sophisticated automated email application engine.

Current implementation status summary:

- **Core Backend**: Fully operational Express server with Prisma (v6) and PostgreSQL.
- **Modular Frontend**: Mature React (Vite) frontend with a premium Neo-Brutalist design and full RTL Arabic support.
- **Automation Pipeline**: Integrated BullMQ worker system for scheduled scraping and bulk job applications.
- **AI Integration**: Custom AI extraction logic using Gemini 3 Flash for job normalization.
- **Security**: Advanced session management, rate limiting, and CSRF protection.
- **Gmail Integration**: Full Google OAuth2 flow for sending applications directly from user accounts.

## 2) Monorepo and Workspaces

Root workspace configuration:

- **Package Name**: pern-monorepo
- **Workspaces**:
  - `client`: React + Vite + TypeScript
  - `server`: Node.js + Express + TypeScript + Prisma

Root scripts:

- `npm run dev`: Runs server and client concurrently for development.
- `npm run build`: Builds both workspaces for production.
- `npm run lint / format`: Code quality and style enforcement.
- `npm run type:check`: Full project TypeScript validation.

## 3) Technology Stack

### Backend Stack

- **Framework**: Node.js, Express (v5+ compatible)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM (v6.19+)
- **Queue System**: BullMQ (v5+) + Redis (ioredis)
- **Auth**: JWT (Access/Refresh) + bcrypt + Cookie-session rotation
- **AI/LLM**: Google Gemini SDK (@google/genai), Groq SDK, OpenAI SDK
- **Scraper**: Cheerio + Axios + Bottleneck (Rate limiting)
- **Email**: Nodemailer + Gmail API (googleapis)
- **Monitoring**: @bull-board/express (Queue management)
- **Validation**: Zod (v4+)

### Frontend Stack

- **Framework**: React (v18+) + Vite
- **UI Architecture**: TailwindCSS 4 + CSS Modules
- **Design System**: Neo-Brutalist (Custom tokens)
- **State Management**: Zustand (UI State) + TanStack Query v5 (Server State)
- **Routing**: React Router 7
- **i18n**: i18next + react-i18next (RTL support)
- **Charts**: Chart.js
- **Form Handling**: React Hook Form + Zod

## 4) Runtime Architecture

### Backend Startup Flow

1. `server/src/main.ts` initializes environment and starts the HTTP server.
2. `server/src/app.ts` configures the middleware stack (Security, Logging, Parsing).
3. `server/src/router.ts` mounts the `/health` and `/api/v1` routes.
4. `server/src/v1/routes.ts` registers all functional modules.

### Shared API Response Contract

All endpoints utilize a standard `ResponseHelper` for consistent communication:

- `success`: boolean
- `statusCode`: number
- `message`: string
- `data`: object/array (optional)
- `paginationMeta`: object (optional, for list endpoints)

## 5) Database Schema Documentation (Prisma)

### Core Enums

- `UserRole`: USER, ADMIN, SUPER_ADMIN
- `UserStatus`: PENDING_VERIFICATION, ACTIVE, SUSPENDED
- `ApplicationStatus`: SCHEDULED, SENDING, SENT, FAILED, EMAIL_SENT, EMAIL_OPENED, EMAIL_FAILED
- `JobLocation`: RIYADH, JEDDAH, DAMMAM, KHOBAR, MECCA, MEDINA, TABUK, OTHER
- `NotificationType`: INFO, SUCCESS, WARNING, ALERT

### Key Models

#### `User`

- Central identity and profile storage.
- Tracks account security (failures, lockout) and verification status.

#### `Job`

- Normalized job listings.
- Unique constraint on `(title, companyName, location)` to prevent duplicates.
- Includes metadata like `sourceUrl`, `hrEmail`, and `postedAt`.

#### `Application`

- Bridges `User` and `Job`.
- Tracks the lifecycle of an automated application.
- Stores `trackingToken` for pixel analytics.

#### `GmailToken`

- Securely stores OAuth2 tokens for Gmail integration.
- Encrypted at rest.

#### `ActivityLog`

- High-resolution audit trail of system and user events.

## 6) Backend API Endpoints Documentation

### Auth (/api/v1/auth)

| Method | Endpoint                | Description                        |
| :----- | :---------------------- | :--------------------------------- |
| POST   | `/register`             | User sign-up + verification email  |
| POST   | `/verify-email`         | Validate token from email          |
| POST   | `/login`                | Credentials login + Refresh cookie |
| POST   | `/refresh`              | Rotate Access/Refresh tokens       |
| POST   | `/logout`               | Invalidate current session         |
| POST   | `/logout-all`           | Invalidate all active sessions     |
| POST   | `/forgot-password`      | Send reset link                    |
| POST   | `/reset-password`       | Update password via token          |
| GET    | `/validate-reset-token` | Check token validity               |
| PATCH  | `/change-password`      | Update password (Authenticated)    |

### Jobs (/api/v1/jobs)

| Method | Endpoint          | Description                        |
| :----- | :---------------- | :--------------------------------- |
| GET    | `/`               | Paginated job list with filters    |
| GET    | `/search`         | Full-text search with date filters |
| GET    | `/saved`          | List user's bookmarked jobs        |
| GET    | `/saved/eligible` | Jobs ready for application         |
| GET    | `/:id`            | Single job details                 |
| POST   | `/:id/save`       | Bookmark a job                     |
| DELETE | `/:id/save`       | Unsave a job                       |
| POST   | `/bulk-save`      | Bulk bookmarking                   |
| POST   | `/bulk-unsave`    | Bulk unsaving                      |
| POST   | `/`               | Create job (Admin only)            |
| POST   | `/bulk`           | Create multiple jobs (Admin only)  |

### Applications (/api/v1/applications)

| Method | Endpoint    | Description                             |
| :----- | :---------- | :-------------------------------------- |
| GET    | `/`         | List user applications                  |
| GET    | `/:id`      | Application audit trail                 |
| POST   | `/schedule` | Queue applications (supports CV upload) |
| DELETE | `/:id`      | Cancel scheduled application            |

### Analytics (Admin - /api/v1/admin/analytics)

| Method | Endpoint                | Description           |
| :----- | :---------------------- | :-------------------- |
| GET    | `/overview`             | Core system stats     |
| GET    | `/advanced-overview`    | Deep-dive metrics     |
| GET    | `/logins-per-day`       | User retention data   |
| GET    | `/applications-per-day` | Engine performance    |
| GET    | `/top-jobs`             | Most popular listings |
| GET    | `/recent-activity-logs` | System audit trail    |

### Notifications (/api/v1/notifications)

| Method | Endpoint        | Description                   |
| :----- | :-------------- | :---------------------------- |
| GET    | `/me`           | User's notifications          |
| PATCH  | `/read-all`     | Mark all as read              |
| PATCH  | `/:id/read`     | Mark specific as read         |
| POST   | `/admin/create` | Broadcast system-wide (Admin) |

### Scraper Control (Admin - /api/v1/admin/scraper)

| Method | Endpoint   | Description                  |
| :----- | :--------- | :--------------------------- |
| GET    | `/status`  | Active workers & queue depth |
| POST   | `/start`   | Resume recurring schedule    |
| POST   | `/stop`    | Pause worker system          |
| POST   | `/run-now` | Trigger manual sync          |

## 7) Frontend Documentation

### 7.1) Architecture & Design System

- **Style**: **Neo-Brutalist** (High contrast, bold shadows, raw typography, and "cards with depth").
- **State Strategy**:
  - `react-query` for all server-side data fetching and optimistic updates.
  - `zustand` for high-frequency UI switches (sidebar, theme, modals).
- **RTL**: Fully mirrored layout with Arabic language support by default.

### 7.2) Main Pages

- **Home**: Marketing site with interactive feature showcase.
- **Jobs Marketplace**: High-speed search interface with multi-filter support.
- **Saved Jobs**: Management hub for building application queues.
- **Auto-Apply Dashboard**: Mission control for scheduling and monitoring AI-sent emails.
- **Analytics View**: Visualizing application success rates and tracking pixel data.
- **Admin Users**: Full CRUD and moderation tools for user accounts.
- **Admin Scraper**: Real-time log streaming and control center for the job engine.

### 7.3) Core Components

- **UI Primitives**: Buttons, Inputs, Badges, and Modals with unified Neo-Brutalist styling.
- **Data Display**: Custom `DataTable` with server-side sorting and pagination.
- **Feedback**: Animated Loading screens, Pulse indicators for background tasks, and Toast notifications.
- **Sections**: Modularized dashboard blocks (e.g., `UserSearchSection`, `UserAnalyticsSection`).

## 8) Detailed Scraper System Documentation

### 8.1) Extraction Workflow

1. **Source Discovery**: Scans pre-configured job boards (Jobhuna, etc.).
2. **AI Normalization**: Gemini 3 Flash processes raw HTML/Text to extract:
   - `hrEmail`: Targeted extraction for application delivery.
   - `category`: Automatic classification of job type.
   - `location`: Mapping to internal `JobLocation` enum.
3. **Storage**: Atomic upsert to PostgreSQL using unique identifiers.

### 8.2) Management

- Managed via **BullMQ** with specific "Concurrency" and "Backoff" strategies to prevent IP blocking.
- Real-time status reporting available in the Admin Scraper Dashboard.

## 9) Email Tracking & Analytics

- **Pixel-Based Tracking**: Every application includes a unique tracking GIF.
- **Real-Time Integration**: Opening an email triggers a callback to `/api/v1/track/open/:token`.
- **UI Reflection**: Dashboard updates in real-time to show "Email Opened" status to the user.

## 10) Security & Performance

- **CSRF**: Double-submit cookie pattern.
- **Session**: Advanced "Refresh Token" rotation with session blacklisting.
- **Encryption**: AES-256-GCM for user integrations (Google OAuth).
- **Speed**: Heavy use of Redis for caching frequently accessed jobs and session data.

## 11) Monorepo Layout

```text
.
â”œâ”€â”€ client                  # React Application
â”‚   â”œâ”€â”€ src/components      # UI Components (Reusable)
â”‚   â”œâ”€â”€ src/modules         # Feature-based logic (Hooks, API, Types)
â”‚   â””â”€â”€ src/pages           # Routable Page Views
â”œâ”€â”€ server                  # Express API
â”‚   â”œâ”€â”€ prisma/schema.prisma# Database Definition
â”‚   â”œâ”€â”€ src/v1/modules      # Domain-driven backend modules
â”‚   â”œâ”€â”€ src/workers         # BullMQ Background Workers
â”‚   â””â”€â”€ src/scraper         # Core Engine Extraction Logic
â””â”€â”€ PROJECT_FULL_DOCUMENTATION.md
```

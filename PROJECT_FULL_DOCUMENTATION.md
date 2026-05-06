# HR Data Project Full Documentation

Last Updated: 2026-05-06

## 1) Project Overview

HR Data is a professional, high-performance monorepo web application designed to automate the end-to-end job search and application lifecycle. It combines advanced web scraping, AI-driven data extraction, and a sophisticated automated email engine to help users apply for jobs efficiently.

### Current Implementation Status

- **Core Backend**: Express.js server utilizing Prisma (v6) with PostgreSQL and Redis.
- **Modular Frontend**: Premium React (Vite) frontend with a **Neo-Brutalist** design and seamless RTL (Arabic) support.
- **Automation Pipeline**: Robust BullMQ worker system for background processing of scrapes and applications.
- **AI Normalization**: Integrated Google Gemini 1.5 Flash for high-accuracy extraction from raw job descriptions.
- **Email System**: Custom-built unified branding system with Gmail API integration for authenticated sending.
- **Security**: Advanced session rotation, rate limiting, and English-to-Arabic error mapping.

---

## 2) Monorepo and Workspaces

The project is structured as a monorepo using NPM workspaces to share configurations and facilitate concurrent development.

- **Package Name**: `pern-monorepo`
- **Workspaces**:
  - `client`: React + Vite + TypeScript (Frontend)
  - `server`: Node.js + Express + TypeScript + Prisma (Backend)

### Global Scripts

- `npm run dev`: Boots both server and client concurrently using `concurrently`.
- `npm run build`: Compiles both projects for production.
- `npm run lint`: Enforces code quality across the entire monorepo.
- `npm run type:check`: Runs full TypeScript validation for both workspaces.

---

## 3) Technology Stack

### Backend Stack

- **Engine**: Node.js v20+, Express v5 (Router-compatible)
- **Database**: PostgreSQL with **Prisma ORM v6.19+**
- **Caching & Queues**: **Redis** (ioredis) + **BullMQ v5+**
- **Authentication**:
  - JWT (Access/Refresh tokens)
  - Cookie-based session management
  - Bcrypt for secure password hashing
- **Email Infrastructure**:
  - **Gmail API** (googleapis)
  - **Nodemailer** for specialized transport
- **AI/LLM**: `@google/genai` (Gemini 1.5 Flash)
- **Security**:
  - **express-rate-limit** (Custom translation bridge)
  - **Helmet.js** for secure headers
  - **CORS** & **CSRF** protection
- **Validation**: **Zod** for schema-driven validation

### Frontend Stack

- **Framework**: **React v18+** with **Vite**
- **Styling**: **Vanilla CSS Modules** (Primary) + **TailwindCSS 4** (Utilities)
- **Design Language**: **Neo-Brutalist** (Sharp edges, high contrast, deep shadows)
- **State Management**:
  - **TanStack Query v5** (Server state & caching)
  - **Zustand** (UI state: modals, menus)
- **i18n**: **i18next** with full RTL mirroring
- **Routing**: **React Router 7**
- **Analytics**: Custom integrated dashboard with **Chart.js**

---

## 4) Core Backend Services

### 4.1) Scraper Engine (`server/src/scraper`)

A multi-layered system designed to ingest data from various sources:

- **`ScraperClient`**: Handles HTTP requests using `axios` and `cheerio` with anti-detection headers.
- **`ExtractionService`**: Leverages Gemini AI to turn messy HTML into structured JSON (Title, HR Email, Location).
- **`ScraperStorage`**: Manages atomic database upserts and deduplication logic.
- **`ScraperConfig`**: Centralized configuration for targets like `awamirtawzif`, `wadifh`, `linkedksa`, etc.

### 4.2) Email Template System (`server/src/notifications/templates`)

A unified branding system for all outgoing communications:

- **Unified Style**: Professional background (`#F4F0E8`), official logo, and standardized RTL footer.
- **Copyright Branding**: `جميع الحقوق محفوظة لدى © 2026 HR Data` (Fixed alignment via LTR spans).
- **Templates**:
  - `VerifyEmail`: Multi-language onboarding.
  - `ResetPassword`: Secure recovery.
  - `Announcement`: Broadcast formatting.
  - `JobApplication`: **Clean, personal email format** (No branding/logos) to maximize recruitment response.

### 4.3) Gmail Integration Service (`server/src/lib/email`)

- **`GmailSender`**: Implements Google OAuth2 to send emails directly from the user's connected account.
- **Attachment Support**: Handles CV/Resume injection from user profiles.

---

## 5) Database Schema (Prisma)

### Key Models & Lifecycle

- **`User`**: Profiles, account status (ACTIVE/PENDING), and security metrics.
- **`Job`**: normalized job listings with unique composite keys `(title, companyName, location)`.
- **`Application`**: Linked to `User` and `Job`, tracking state from `SCHEDULED` to `EMAIL_OPENED`.
- **`ScrapedLog`**: Real-time logging for scraper performance (Links found vs Jobs extracted).
- **`SystemSetting`**: Dynamic configuration (e.g., logos, system maintenance modes).

---

## 6) API Documentation

### Public & Auth (`/api/v1/auth`)

Standard authentication flow with email verification and secure password recovery.

### Jobs Marketplace (`/api/v1/jobs`)

Full-text search across thousands of Saudi job listings with advanced filters (Location, Date).

### User Applications (`/api/v1/applications`)

Management of automated application schedules. Supports manual CV uploads per application.

### Tracking (`/api/v1/track`)

- `GET /open/:token`: Transparently records when an employer opens an application email using a 1x1 pixel.

### Admin Scraper Control (`/api/v1/admin/scraper`)

- `GET /status`: Live worker metrics.
- `POST /run-now`: Immediate manual trigger.
- `POST /reset-queue`: **Critical Admin Action** to clear and reset the extraction queue.

---

## 7) Frontend Features & Logic

### 7.1) Neo-Brutalist UI

The application uses a unique design system defined by:

- **High Contrast**: Pure whites, deep blacks (`var(--ink)`), and vibrant accent reds.
- **Elevation**: Hard shadows (`box-shadow: 4px 4px 0 var(--ink)`).
- **Responsiveness**: Fully fluid layout for mobile and desktop.

### 7.2) Error Mapping System (`client/src/lib/error-mapper.ts`)

A sophisticated bridge between backend and user:

- Backend returns technical English errors (e.g., "Too many requests").
- Frontend maps these via a centralized library to user-friendly Arabic (e.g., "لقد تجاوزت الحد المسموح به").

### 7.3) Admin Dashboard

- **Analytics**: Real-time charts showing login activity and application success.
- **Scraper Monitoring**: Log stream visualization for tracking site-by-site extraction health.

---

## 8) Background Workers (BullMQ)

- **`ScraperWorker`**: Recurring job to run the extraction engine every 2 hours.
- **`JobApplicationWorker`**: Processes the application queue, managing email rate limits to protect user's Gmail accounts.
- **`MaintenanceWorker`**: Daily cleanup of old logs and temporary tracking tokens.

---

## 9) Security & Performance

- **Rate Limiting**: Intelligent limiting on sensitive endpoints (Login, Register, Scraper Start).
- **Session Security**: Double-token pattern (HttpOnly Refresh + Memory Access) prevents XSS/CSRF.
- **Encryption**: sensitive data like OAuth tokens are encrypted before storage.
- **Optimized Caching**: Redis caches the job marketplace results for sub-100ms response times.

---

## 10) Monorepo Layout

```text
.
├── client                      # React Frontend
│   ├── src/components/auth     # Modals (Login/Signup with centered logos)
│   ├── src/components/home     # Landing page sections
│   ├── src/lib/error-mapper.ts # Technical error translation
│   └── src/pages               # Dashboard, Marketplace, Admin
├── server                      # Node.js Backend
│   ├── src/v1/modules          # Domain-driven API modules
│   ├── src/scraper             # Job extraction services
│   ├── src/workers             # BullMQ background processing
│   └── src/notifications       # Unified Email Templates
└── PROJECT_FULL_DOCUMENTATION.md
```

# Kafoo Project Structure

This document provides a comprehensive map of the entire Kafoo project, including the `client`, `server`, and root configuration files.

## Root Directory

```text
kafoo/
├── .claude/                     # Claude-related configurations
├── .git/                        # Git repository metadata (Omitted in Detail)
├── .specify/                    # Specify-related configurations
├── client/                      # Frontend Application (React + Vite)
├── server/                      # Backend Application (Node.js + Express + Prisma)
├── .gitignore                   # Files to ignore in Git
├── .prettierignore              # Files to ignore in Prettier
├── .prettierrc                  # Prettier configuration
├── docker-compose.dev.yml       # Docker Compose for development (Redis, DB, etc.)
├── package.json                 # Root package manifest
├── package-lock.json            # Fixed dependency versions
├── PROJECT_FULL_DOCUMENTATION.md # Full project documentation
├── README.md                    # Project overview
├── SERVER_STRUCTURE.md          # This document
└── typecheck.log                # Type-checking results
```

---

## Client Application (`client/`)

The frontend is built using React, Vite, and TypeScript. It follows a modular architecture.

### Directory Tree

```text
client/
├── core/                        # Core system declarations
│   └── declarations/
│       └── react-query.d.ts
├── public/                      # Static assets
├── src/                         # Source Code
│   ├── assets/                  # Images, SVGs, and other assets
│   │   └── react.svg
│   ├── components/              # Shared UI Components
│   │   ├── common/              # Reusable layout components
│   │   │   ├── AvatarGroup/
│   │   │   │   ├── AvatarGroup.module.css
│   │   │   │   └── AvatarGroup.tsx
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.module.css
│   │   │   │   └── Footer.tsx
│   │   │   ├── JobCard/
│   │   │   │   ├── JobCard.module.css
│   │   │   │   └── JobCard.tsx
│   │   │   ├── JobsGrid/
│   │   │   │   ├── JobsGrid.module.css
│   │   │   │   └── JobsGrid.tsx
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.module.css
│   │   │   │   └── Navbar.tsx
│   │   │   ├── NotificationCard/
│   │   │   │   ├── NotificationCard.module.css
│   │   │   │   └── NotificationCard.tsx
│   │   │   ├── NotificationPanel/
│   │   │   │   ├── NotificationPanel.module.css
│   │   │   │   └── NotificationPanel.tsx
│   │   │   ├── StatusBadge/
│   │   │   │   ├── StatusBadge.module.css
│   │   │   │   └── StatusBadge.tsx
│   │   │   └── index.ts
│   │   ├── home/                # Homepage-specific sections
│   │   │   ├── HeroSection/
│   │   │   │   ├── HeroSection.module.css
│   │   │   │   └── HeroSection.tsx
│   │   │   ├── HomeHowSection/
│   │   │   │   └── HomeHowSection.tsx
│   │   │   ├── HomeQuoteSection/
│   │   │   │   └── HomeQuoteSection.tsx
│   │   │   └── index.ts
│   │   ├── ui/                  # Atomic Design UI elements
│   │   │   ├── Avatar/
│   │   │   │   ├── Avatar.module.css
│   │   │   │   └── Avatar.tsx
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.module.css
│   │   │   │   └── Badge.tsx
│   │   │   ├── Button/
│   │   │   │   ├── Button.module.css
│   │   │   │   └── Button.tsx
│   │   │   ├── Input/
│   │   │   │   ├── Input.module.css
│   │   │   │   └── Input.tsx
│   │   │   ├── Spinner/
│   │   │   │   ├── Spinner.module.css
│   │   │   │   └── Spinner.tsx
│   │   │   ├── Toggle/
│   │   │   │   ├── Toggle.module.css
│   │   │   │   └── Toggle.tsx
│   │   │   └── index.ts
│   │   └── user/                # User-specific layout components
│   │       ├── layout/
│   │       │   ├── UserLayout/
│   │       │   │   ├── UserLayout.module.css
│   │       │   │   └── UserLayout.tsx
│   │       │   ├── UserNavbar/
│   │       │   │   ├── UserNavbar.module.css
│   │       │   │   └── UserNavbar.tsx
│   │       │   ├── UserSidebar/
│   │       │   │   ├── UserSidebar.module.css
│   │       │   │   └── UserSidebar.tsx
│   │       │   └── index.ts
│   │       ├── sections/
│   │       │   ├── UserAnalyticsSection/
│   │       │   │   ├── UserAnalyticsSection.module.css
│   │       │   │   └── UserAnalyticsSection.tsx
│   │       │   ├── UserAutoApplySection/
│   │       │   │   ├── UserAutoApplySection.module.css
│   │       │   │   └── UserAutoApplySection.tsx
│   │       │   ├── UserHomeSection/
│   │       │   │   ├── UserHomeSection.module.css
│   │       │   │   └── UserHomeSection.tsx
│   │       │   ├── UserSavedJobsSection/
│   │       │   │   ├── UserSavedJobsSection.module.css
│   │       │   │   └── UserSavedJobsSection.tsx
│   │       │   ├── UserSearchSection/
│   │       │   │   ├── UserSearchSection.module.css
│   │       │   │   └── UserSearchSection.tsx
│   │       │   ├── UserSettingsSection/
│   │       │   │   ├── UserSettingsSection.module.css
│   │       │   │   └── UserSettingsSection.tsx
│   │       │   ├── index.ts
│   │       │   └── userData.ts
│   │       └── index.ts
│   ├── contexts/                # React Context providers
│   │   ├── AuthModalContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/                   # Custom React hooks
│   │   └── index.ts
│   ├── lib/                     # Libraries and wrappers
│   │   ├── react-query/         # React Query configuration
│   │   │   ├── QueryClientProvider.tsx
│   │   │   └── types.ts
│   │   ├── error-mapper.ts
│   │   └── utils.ts
│   ├── modules/                 # Feature-based modules
│   │   ├── applications/        # Job Applications module
│   │   │   ├── api/
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── mutations/
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── use-cancel-application.ts
│   │   │   │   │   │   └── use-schedule-application.ts
│   │   │   │   │   └── queries/
│   │   │   │   │       ├── index.ts
│   │   │   │   │       ├── use-application-detail.ts
│   │   │   │   │       └── use-applications-list.ts
│   │   │   │   ├── applications.service.ts
│   │   │   │   └── index.ts
│   │   │   ├── components/
│   │   │   │   ├── UserApplicationsSection/
│   │   │   │   │   ├── UserApplicationsSection.module.css
│   │   │   │   │   └── UserApplicationsSection.tsx
│   │   │   │   └── index.ts
│   │   │   ├── pages/
│   │   │   │   ├── DashboardApplicationsPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── auth/                # Authentication module
│   │   │   ├── api/
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── use-auth.ts
│   │   │   │   ├── mutations/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── use-login.ts
│   │   │   │   │   ├── use-logout.ts
│   │   │   │   │   └── use-register.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── components/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── context/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   └── index.ts
│   │   │   └── types/
│   │   │       ├── auth-context.types.ts
│   │   │       └── auth.types.ts
│   │   ├── cvs/                 # CV management module
│   │   │   └── api/
│   │   │       ├── hooks/
│   │   │       │   ├── queries/
│   │   │       │   │   └── use-cvs-list.ts
│   │   │       │   └── index.ts
│   │   │       └── cvs.service.ts
│   │   └── jobs/                # Job board module
│   │       ├── api/
│   │       │   ├── hooks/
│   │       │   │   ├── mutations/
│   │       │   │   │   ├── index.ts
│   │       │   │   │   ├── use-save-job.ts
│   │       │   │   │   └── use-unsave-job.ts
│   │       │   │   ├── queries/
│   │       │   │   │   ├── index.ts
│   │       │   │   │   ├── use-job-detail.ts
│   │       │   │   │   ├── use-jobs-list.ts
│   │       │   │   │   └── use-saved-jobs.ts
│   │       │   │   └── index.ts
│   │       │   ├── jobs.service.ts
│   │       │   └── index.ts
│   │       ├── pages/
│   │       │   └── PublicJobsPage.tsx
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── pages/                   # Top-level Page components
│   │   ├── admin/               # Admin side pages
│   │   │   ├── AdminAnalyticsPage.tsx
│   │   │   ├── AdminDashboardLayout.tsx
│   │   │   ├── AdminHomePage.tsx
│   │   │   ├── AdminNotificationsPage.tsx
│   │   │   ├── AdminScrapPage.tsx
│   │   │   ├── AdminSettingsPage.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   ├── auth/                # Auth pages
│   │   │   ├── AuthPages.module.css
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   ├── error/               # Error pages
│   │   │   └── NotFoundPage.tsx
│   │   ├── home/                # Public landing page
│   │   │   └── HomePage.tsx
│   │   └── user/                # User dashboard pages
│   │       ├── DashboardAnalysisPage.tsx
│   │       ├── DashboardAutoApplyPage.tsx
│   │       ├── DashboardHomePage.tsx
│   │       ├── DashboardJobsPage.tsx
│   │       ├── DashboardSavedJobsPage.tsx
│   │       ├── DashboardSettingsPage.tsx
│   │       └── UserDashboardLayout.tsx
│   ├── providers/               # App-wide providers
│   │   └── Providers.tsx
│   ├── services/                # Base API service
│   │   └── api.ts
│   ├── styles/                  # Global styles
│   │   └── global.css
│   ├── types/                   # Global TypeScript types (Shared)
│   ├── App.tsx                  # Main App component
│   ├── AppRoutes.tsx            # Route definitions
│   ├── main.tsx                 # Entry point
│   ├── styles.d.ts              # CSS Modules declarations
│   └── vite-env.d.ts            # Vite environment types
├── .env.development             # Development env variables
├── .env.production              # Production env variables
├── index.html                   # HTML Template
├── package.json                 # Client dependencies & scripts
├── tsconfig.json                # TS config for client
├── tsconfig.app.json            # TS config for app
├── tsconfig.node.json           # TS config for Vite node
└── vite.config.ts               # Vite configuration
```

---

## Server Application (`server/`)

The backend is built with Node.js, Express, and Prisma ORM.

### Directory Tree

```text
server/
├── generated/                   # Automatically generated files (e.g., Prisma Client)
│   └── prisma/
├── prisma/                      # Database Schema & Migrations
│   ├── migrations/              # SQL Migration history
│   │   ├── 20260410141226_init_schema_with_enums/
│   │   ├── 20260410172815_add_full_name_to_user/
│   │   ├── 20260410174805_add_email_tracking_statuses/
│   │   └── migration_lock.toml
│   ├── schema.prisma            # Main Prisma schema
│   └── seed.ts                  # Database seeding script
├── src/                         # Application Source Code
│   ├── config/                  # System Configurations
│   │   ├── bullmq.ts
│   │   ├── constants.ts
│   │   ├── db.config.ts
│   │   ├── env.config.ts
│   │   ├── llm.ts
│   │   ├── mailer.config.ts
│   │   └── redis.ts
│   ├── http/                    # Request Handling Layer
│   │   └── middlewares/         # Express Middlewares
│   │       ├── auth.middleware.ts
│   │       ├── error-handler.ts
│   │       ├── request-logger.ts
│   │       └── validation.middleware.ts
│   ├── notifications/           # Messaging & Notifications
│   │   ├── templates/           # Email Templates
│   │   │   ├── application-status.template.ts
│   │   │   ├── job-application.template.ts
│   │   │   ├── reset-password.template.ts
│   │   │   └── verify-email.template.ts
│   │   └── notifications.service.ts
│   ├── scraper/                 # Job Scraping Logic
│   │   ├── index.ts             # Scraper entry point
│   │   ├── test-smoke.ts        # Smoke test for scrapers
│   │   ├── ewdifh/              # EWDIFH portal scraper
│   │   │   ├── ewdifh-detail.scraper.ts
│   │   │   ├── ewdifh-listing.scraper.ts
│   │   │   └── ewdifh.scraper.ts
│   │   ├── llm/                 # AI enrichment for job data
│   │   │   └── job-enrichment.service.ts
│   │   └── worker/              # Background workers for scraping
│   │       ├── scraper.scheduler.ts
│   │       └── scraper.worker.ts
│   ├── shared/                  # Common Utilities & Shared Logic
│   │   ├── constants/
│   │   │   └── http-status.constants.ts
│   │   ├── errors/              # Custom Exception Classes
│   │   │   ├── AppError.ts
│   │   │   ├── BadRequestException.ts
│   │   │   ├── ConflictException.ts
│   │   │   ├── error-codes.ts
│   │   │   ├── ForbiddenException.ts
│   │   │   ├── InternalServerError.ts
│   │   │   ├── NotFoundException.ts
│   │   │   └── UnauthorizedException.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   ├── utils/               # Helper Functions
│   │   │   ├── api-response.ts
│   │   │   ├── crypto.util.ts
│   │   │   ├── escape-html.utils.ts
│   │   │   ├── exclude-password.utils.ts
│   │   │   ├── hash.util.ts
│   │   │   ├── jwt.util.ts
│   │   │   ├── logger.util.ts
│   │   │   ├── paginate.util.ts
│   │   │   ├── template-compiler.util.ts
│   │   │   └── tracking-pixel.util.ts
│   │   └── validation/          # Joi/Zod validation schemas
│   ├── v1/                      # API Version 1
│   │   ├── modules/             # Feature-based Modules
│   │   │   ├── applications/    # Application management
│   │   │   │   ├── dto/
│   │   │   │   ├── types/
│   │   │   │   ├── applications.constants.ts
│   │   │   │   ├── applications.controller.ts
│   │   │   │   ├── applications.routes.ts
│   │   │   │   └── applications.service.ts
│   │   │   ├── auth/            # Authentication & Session
│   │   │   │   ├── dto/
│   │   │   │   ├── types/
│   │   │   │   ├── auth.constants.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── cvs/             # CV handling
│   │   │   │   ├── dto/
│   │   │   │   ├── cvs.controller.ts
│   │   │   │   ├── cvs.routes.ts
│   │   │   │   └── cvs.service.ts
│   │   │   ├── health/          # System health checks
│   │   │   │   ├── health.controller.ts
│   │   │   │   ├── health.routes.ts
│   │   │   │   └── health.service.ts
│   │   │   ├── jobs/            # Job listings management
│   │   │   │   ├── dto/
│   │   │   │   ├── types/
│   │   │   │   ├── jobs.constants.ts
│   │   │   │   ├── jobs.controller.ts
│   │   │   │   ├── jobs.routes.ts
│   │   │   │   └── jobs.service.ts
│   │   │   ├── tracking/        # Email tracking & Analytics
│   │   │   │   ├── tracking.controller.ts
│   │   │   │   ├── tracking.routes.ts
│   │   │   │   └── tracking.service.ts
│   │   │   └── users/           # User profile & Management
│   │   │       ├── dto/
│   │   │       ├── types/
│   │   │       ├── users.constants.ts
│   │   │       ├── users.controller.ts
│   │   │       ├── users.routes.ts
│   │   │       └── users.service.ts
│   │   └── routes.ts            # V1 Route Registry
│   ├── workers/                 # General background workers
│   │   └── email-send.worker.ts
│   ├── app.ts                   # Express app configuration
│   ├── main.ts                  # Server entry point
│   └── router.ts                # Main route orchestrator
├── tests/                       # Integration & Unit Tests
│   ├── auth.middleware.test.ts
│   ├── auth.routes.binding.test.ts
│   ├── auth.service.login-status.test.ts
│   ├── auth.service.refresh.test.ts
│   ├── config-and-jwt-env.test.ts
│   ├── crypto.util.test.ts
│   ├── error-handler-jwt.test.ts
│   ├── jobs.search.dto.test.ts
│   ├── jobs.service.search.test.ts
│   └── refresh.dto.test.ts
├── uploads/                     # User-uploaded files
│   └── cvs/                     # Stored PDF CVs
├── .env                         # Environment variables (Sensitive)
├── .env.example                 # Env template
├── package.json                 # Server manifest
├── prisma.config.ts             # Prisma config wrapper
├── scraped-results.json         # Temporary storage for scraped data
└── tsconfig.json                # TS config for server
```


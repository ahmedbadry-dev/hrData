# Server Folder Structure

This document provides a comprehensive map of the `server` directory for the Kafoo project.

## Directory Tree

```text
server/
├── prisma/                      # Database Schema & Migrations
│   ├── migrations/              # SQL Migration history
│   │   ├── 20260410141226_init_schema_with_enums/
│   │   ├── 20260410172815_add_full_name_to_user/
│   │   └── 20260410174805_add_email_tracking_statuses/
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
│   │   │   ├── reset-password.template.ts
│   │   │   └── verify-email.template.ts
│   │   └── notifications.service.ts
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
│   │   └── utils/               # Helper Functions
│   │       ├── api-response.ts
│   │       ├── crypto.util.ts
│   │       ├── escape-html.utils.ts
│   │       ├── exclude-password.utils.ts
│   │       ├── hash.util.ts
│   │       ├── jwt.util.ts
│   │       ├── logger.util.ts
│   │       ├── paginate.util.ts
│   │       ├── template-compiler.util.ts
│   │       └── tracking-pixel.util.ts
│   ├── v1/                      # API Version 1
│   │   ├── modules/             # Feature-based Modules
│   │   │   ├── auth/            # Authentication & Session Management
│   │   │   │   ├── dto/         # Data Transfer Objects
│   │   │   │   ├── types/       # Module-specific types
│   │   │   │   ├── auth.constants.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── health/          # System Health Checks
│   │   │   ├── jobs/            # Job Management
│   │   │   ├── tracking/        # Analytics & Email Tracking
│   │   │   └── users/           # User Management
│   │   └── routes.ts            # V1 Route Registry
│   ├── app.ts                   # Express App Configuration
│   ├── main.ts                  # Server Entry Point
│   └── router.ts                # Main Route Orchestrator
├── .env                         # Environment variables (Hidden/Sensitive)
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies & Scripts
├── prisma.config.ts             # Prisma configuration
└── tsconfig.json                # TypeScript configuration
```

## Detailed File List

### Configuration & Root
- `.env`: Environment variables for database, JWT, and third-party services.
- `package.json`: Main manifest for the backend project.
- `tsconfig.json`: TypeScript compiler rules including path aliases.

### Database (`prisma/`)
- `schema.prisma`: The source of truth for the database schema, including Enums and Tables.
- `seed.ts`: Script to populate the database with initial/dummy data.

### Source Code (`src/`)
- `main.ts`: Initializes the database connection and starts the HTTP server.
- `app.ts`: Configures Express, CORS, security headers, and global middlewares.
- `v1/modules/`: Follows a modular architecture where each folder (e.g., `auth`, `jobs`) encapsulates its own controllers, services, and DTOs.

### Shared Utilities (`src/shared/`)
- `utils/`: Reusable logic like JWT signing, password hashing, and pagination.
- `errors/`: Consistent error handling using custom HTTP exceptions.

### Testing (`tests/`)
- Integrated Vitest/Jest files for validating core business logic and API endpoints.

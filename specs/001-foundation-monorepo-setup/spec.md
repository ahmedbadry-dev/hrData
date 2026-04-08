# Feature Specification: Foundation Setup

**Feature Branch**: `001-foundation-setup`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description: "Phase 1 of Kufu' Platform — configure tooling, establish database schema, and get server running with health checks"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Database Schema & Data Foundation (Priority: P1)

As the platform, I need a complete database schema with all core
entities so that every subsequent feature phase can persist and
query data without schema redesigns.

**Why this priority**: The database schema underpins every feature
module (auth, jobs, applications, analytics). Defining it upfront
avoids mid-project migrations that break existing features.

**Independent Test**: Run the database migration command and verify
all 10 tables are created with correct columns, types, constraints,
and relationships.

**Acceptance Scenarios**:

1. **Given** a running database instance, **When** the migration
   command is executed, **Then** all 10 tables are created: users,
   gmail_tokens, jobs, saved_jobs, cvs, email_templates,
   applications, notifications, activity_logs, system_settings.
2. **Given** the schema is applied, **When** inspecting table
   relationships, **Then** all foreign keys, cascading deletes,
   unique constraints, and indexes are present as defined.
3. **Given** the schema, **When** a seed script is run, **Then**
   default system settings and any required initial data are
   populated.

---

### User Story 2 - API Server with Health Monitoring (Priority: P1)

As an operations engineer, I need health check endpoints so that
deployment orchestrators and monitoring tools can verify the API
server and its dependencies (database, cache) are operational.

**Why this priority**: Health endpoints are required for deployment
readiness checks. Without them, automated deployments cannot verify
the server is healthy before routing traffic.

**Independent Test**: Start the API server and call both health
endpoints; verify correct JSON responses and status codes.

**Acceptance Scenarios**:

1. **Given** the API server is running, **When** a request is made
   to the basic health endpoint, **Then** it returns HTTP 200 with
   `{ status: "ok" }`.
2. **Given** the API server is running and the database is connected,
   **When** a request is made to the database health endpoint,
   **Then** it returns HTTP 200 with `{ status: "ok", db: "connected" }`.
3. **Given** the API server is running but the database is
   unreachable, **When** a request is made to the database health
   endpoint, **Then** it returns an appropriate error status
   indicating the database is disconnected.

---

### User Story 3 - Middleware Stack & Error Handling (Priority: P2)

As the platform, I need a standardized middleware pipeline and
global error handling so that all future API routes automatically
benefit from security headers, request logging, input parsing,
and consistent error responses.

**Why this priority**: Middleware and error handling are consumed
by every route in every subsequent phase. Establishing them now
ensures consistency and avoids duplicating this work per feature.

**Independent Test**: Send a request to a non-existent endpoint
and verify the 404 response follows the standard error format.
Trigger an unhandled error and verify it is caught by the global
error handler with a structured response.

**Acceptance Scenarios**:

1. **Given** the API server is running, **When** a request is made
   to a non-existent route, **Then** a structured JSON error
   response with HTTP 404 is returned.
2. **Given** a route that throws an unexpected error, **When** the
   error propagates, **Then** the global error handler catches it
   and returns a structured error response without leaking stack
   traces in production.
3. **Given** any API request, **When** it is processed, **Then**
   security headers are present in the response, the request is
   logged, and CORS rules are enforced.

---

### User Story 4 - Configuration & Service Singletons (Priority: P2)

As a developer, I need centralized configuration management and
pre-configured service singletons (database client, cache client,
queue system, mailer, LLM client) so that feature modules can
import and use them without setup boilerplate.

**Why this priority**: Every feature module depends on at least one
of these services. Centralizing configuration prevents duplicated
connection logic and inconsistent environment variable handling.

**Independent Test**: Import each service singleton in isolation
and verify it initializes correctly with environment variables.

**Acceptance Scenarios**:

1. **Given** a properly configured environment file, **When** the
   server starts, **Then** all service singletons (database, cache,
   queue, mailer, LLM) initialize without errors.
2. **Given** a missing or invalid environment variable, **When** the
   server attempts to start, **Then** it fails fast with a clear
   error message identifying the missing configuration.
3. **Given** any feature module, **When** it needs database, cache,
   or queue access, **Then** it can import the corresponding
   singleton without any setup code.

---

### Edge Cases

- What happens when Redis is unavailable at startup? The server
  MUST start but log a warning; queue features degrade gracefully.
- What happens when the database connection string is invalid? The
  server MUST fail fast with a clear error message.
- What happens when environment variables are missing? Startup
  validation MUST enumerate all missing variables, not fail one at
  a time.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a complete database schema with
  10 tables: users, gmail_tokens, jobs, saved_jobs, cvs,
  email_templates, applications, notifications, activity_logs,
  system_settings.
- **FR-002**: All database entity identifiers MUST be UUIDs.
- **FR-003**: System MUST implement hard deletes with cascading
  (no soft deletes).
- **FR-004**: System MUST expose a basic health check endpoint
  returning server status.
- **FR-005**: System MUST expose a database health check endpoint
  verifying database connectivity.
- **FR-006**: System MUST apply security headers, CORS, request
  logging, and JSON body parsing as global middleware.
- **FR-007**: System MUST provide a global error handler that
  returns structured JSON error responses and never leaks internal
  details in production.
- **FR-008**: System MUST provide a 404 handler for unmatched routes.
- **FR-009**: System MUST validate all required environment
  variables at startup and fail fast with clear errors if any are
  missing.
- **FR-010**: System MUST provide pre-configured singletons for:
  database client, Redis/cache client, queue system, mailer
  transport, and LLM API client.
- **FR-011**: System MUST provide a structured logging utility with
  human-readable output in development and machine-parseable output
  in production.
- **FR-012**: System MUST provide shared utility modules for:
  password hashing, JWT operations, encryption/decryption,
  pagination, tracking pixel generation, and template compilation.
- **FR-013**: System MUST provide a standardized error class with
  error code mapping for consistent API error responses.
- **FR-014**: System MUST include an environment variable template
  file documenting all required configuration.
- **FR-015**: System MUST provide a database seed script for
  populating initial/default data.
- **FR-016**: Shared type definitions MUST be consumable by all
  three applications without duplication.

### Key Entities

- **User**: Platform user account with profile information, role,
  account status, and credentials.
- **GmailToken**: OAuth2 tokens (encrypted) linking a user to their
  Gmail account for sending emails.
- **Job**: Scraped job listing with title, company, location,
  category, source, HR contact, and metadata.
- **SavedJob**: Bookmark relationship between a user and a job.
- **CV**: User-uploaded resume file reference with a default flag.
- **EmailTemplate**: Reusable email template with subject and body
  containing variable placeholders.
- **Application**: Record of a job application sent by the platform
  on behalf of a user, with status tracking.
- **Notification**: System or admin notification targeted to users.
- **ActivityLog**: Audit trail of significant platform events.
- **SystemSetting**: Key-value configuration pairs for platform
  behavior (scraper intervals, email limits, maintenance mode, etc.).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The basic health endpoint responds within 50ms under
  no load.
- **SC-002**: Database migration applies all 10 tables with zero
  manual intervention.
- **SC-003**: Startup validation catches 100% of missing required
  environment variables and reports them in a single error message.
- **SC-004**: All subsequent feature phases (2–11) can begin
  development without modifying the foundation scaffold.

## Assumptions

- PostgreSQL and Redis instances are available in the development
  environment (local or containerized).
- The LLM API and Gmail OAuth credentials are not required for
  foundation setup; their singletons initialize with placeholder
  configuration and are validated only when used.
- The development environment has the required runtime version and
  package manager installed.
- The database schema defined in this phase is the complete initial
  schema; migrations in later phases will only add columns or
  indexes, not restructure tables.

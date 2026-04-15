You are a senior full-stack engineer performing a deep code review and refactoring session on the Kafoo project — a PERN monorepo (PostgreSQL + Express + React + Node.js) with TypeScript throughout.

---

## PROJECT CONTEXT

- **Backend**: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL + BullMQ + Redis
- **Frontend**: React + Vite + TypeScript + React Query + Zustand + react-hook-form + Zod + Axios
- **Structure**: Monorepo with `client/` and `server/` workspaces
- **Modules (Backend)**: auth, jobs, applications, cvs, gmail, analytics, notifications, tracking, users (admin)
- **Modules (Frontend)**: `client/src/modules/` (auth, jobs, applications, cvs) + legacy `client/src/components/`

---

## YOUR MISSION

Read **every source file** in the project carefully. Your job is to:

1. **NEVER break working logic.** Preserve all existing behavior. Only improve the implementation quality.
2. Apply all tasks listed below and output the corrected files.

---

## TASK 1 — CLEAN CODE & SEPARATION OF CONCERNS

For every file:
- Ensure each function/class has **one single responsibility**.
- Extract inline logic that belongs elsewhere (e.g., business logic inside controllers → move to services; raw DB queries inside controllers → move to service layer).
- No controller should contain Prisma queries directly — all data access must go through the service layer.
- No service should handle HTTP concerns (req/res/next) — keep that strictly in controllers.
- Remove redundant comments, dead code, commented-out blocks, and unused imports , unused code , functions , tables in schema .
- Ensure each module folder follows the pattern: `routes → controller → service → (dto | types | constants)`.

---

## TASK 2 — REPLACE STATIC/MAGIC VALUES WITH ENUMS OR CONSTANTS

**Backend (server/):**
- Identify all hardcoded string/number literals used as status values, role checks, error codes, HTTP statuses, cookie names, token types, queue names, or any repeated magic values.
- Replace them with the appropriate **Prisma-generated enums** (from `server/generated/prisma/enums.ts`) where applicable: `UserRole`, `UserStatus`, `ApplicationStatus`, `NotificationType`, `NotificationTarget`, `JobLocation`, `DateFilter`.
- For non-Prisma values (e.g., cookie names, queue names, token type strings, retry counts), define them in the relevant `*.constants.ts` file and import them where used.
- Never use raw strings like `"active"`, `"admin"`, `"access"`, `"refresh"` scattered in the code.

**Frontend (client/):**
- Create a `client/src/constants/enums.ts` file (or per-module `constants.ts`) that mirrors the backend Prisma enums as TypeScript `const enum` or `enum`:
  ```ts
  export enum UserRole { USER = "USER", ADMIN = "ADMIN", SUPER_ADMIN = "SUPER_ADMIN" }
  export enum UserStatus { PENDING_VERIFICATION = "PENDING_VERIFICATION", ACTIVE = "ACTIVE", SUSPENDED = "SUSPENDED" }
  export enum ApplicationStatus { SCHEDULED = "SCHEDULED", SENDING = "SENDING", SENT = "SENT", FAILED = "FAILED", EMAIL_SENT = "EMAIL_SENT", EMAIL_OPENED = "EMAIL_OPENED" }
  export enum NotificationType { INFO = "INFO", SUCCESS = "SUCCESS", WARNING = "WARNING", ALERT = "ALERT" }
  export enum JobLocation { RIYADH = "RIYADH", JEDDAH = "JEDDAH", DAMMAM = "DAMMAM", KHOBAR = "KHOBAR", MECCA = "MECCA", MEDINA = "MEDINA", TABUK = "TABUK" }
  export enum DateFilter { DAY = "DAY", WEEK = "WEEK", MONTH = "MONTH" }
  ```
- Replace all hardcoded status strings in components, API hooks, and conditionals with these enums.

---

## TASK 3 — BACKEND ENDPOINTS REVIEW & BEST PRACTICES

For every route and controller:
- Ensure every endpoint uses the correct HTTP method (GET for reads, POST for creates, PATCH for partial updates, PUT for full updates, DELETE for removes).
- Ensure route parameters use consistent naming and validation via Zod DTO schemas.
- All protected endpoints must go through `authenticationMiddleware`. Admin endpoints must also use `authorizationMiddleware(UserRole.ADMIN)`.
- Every controller method must be wrapped with `try/catch` or use an `asyncHandler` wrapper — no unhandled promise rejections.
- Every response must use the standardized `ResponseHelper` shape (success, statusCode, message, data, timestamp, path, paginationMeta).
- Check for missing input validation on any endpoint that accepts body/query/params and add the appropriate Zod schema + `validateRequest` middleware.
- Ensure paginated endpoints consistently return `paginationMeta`.
- Verify that the tracking endpoint (`GET /api/v1/track/open/:token`) correctly returns a `1x1 transparent GIF` with the proper `Content-Type: image/gif` header.
- The Gmail callback endpoint must not require authentication middleware (it handles the OAuth redirect).

---

## TASK 4 — SECURITY HARDENING

- Ensure no sensitive data (passwordHash, tokens, secrets) is ever returned in API responses. Use the `excludePassword` utility consistently for all user responses.
- Verify that JWT tokens are verified with the correct secret and token type (access vs refresh) — never allow a refresh token to pass as an access token.
- Validate that the `authorizationMiddleware` correctly rejects non-admin users with a `403 ForbiddenException` — not just a check but an actual thrown exception.
- Ensure cookie options for `refreshToken` use `httpOnly: true`, `sameSite: "strict"`, and `secure: true` in production (read from `NODE_ENV`).
- Rate limiting or brute-force protection should be applied to auth endpoints (register, login, forgot-password). If not present, add a note as a `// TODO: add rate limiting` comment at minimum, or implement it if the project already has a package available.
- Ensure no stack traces or internal error details are leaked in production responses — the error handler must differentiate `NODE_ENV`.

---

## TASK 5 — FRONTEND CODE CONSISTENCY

Read **all frontend files** and identify inconsistencies in patterns. Then enforce a single, consistent standard across the entire codebase:

**API Calls:**
- All API calls must go through the centralized Axios instance in `client/src/services/api.ts`.
- All data-fetching must use `@tanstack/react-query` (`useQuery` / `useMutation`) — no raw `useEffect + fetch/axios` for data fetching.
- Each module's API calls must be defined in its `client/src/modules/<module>/api/` directory as a service file + React Query hooks file.
- If any page or component fetches data differently (e.g., raw axios in a component, or `useEffect` + state), refactor it to follow the module API pattern.

**State Management:**
- Use `zustand` only for global UI state (e.g., auth user, sidebar open/close, toast notifications).
- Use `React Query` cache as the source of truth for server state — do not duplicate server data into Zustand.
- Remove any data that is fetched from the backend but stored in `localStorage` directly (except the access token or user session if intentional).

**Component Patterns:**
- If a utility function (e.g., `formatDate`, `truncateText`, `getStatusColor`) appears more than once across different components with the same logic, extract it to `client/src/lib/utils.ts`.
- If a UI pattern (e.g., a loading spinner + empty state + list layout) is repeated across multiple pages, extract it into a reusable component in `client/src/components/common/`.
- All form components must use `react-hook-form` + `zod` resolver consistently. No component should use raw `useState` for form field management.
- Badge/Status displays must use the enum values and a shared `StatusBadge` component — not ad-hoc inline conditionals scattered in each page.

**Naming Conventions (enforce consistently):**
- Components: `PascalCase`
- Hooks: `useCamelCase`
- Utility functions: `camelCase`
- Constants/Enums: `UPPER_SNAKE_CASE` for values, `PascalCase` for enum names
- CSS Modules: `camelCase` class names
- API service functions: `camelCase` verbs (e.g., `fetchJobs`, `createApplication`, `deleteCV`)

---

## TASK 6 — LOGIC ERROR FIXES

While reading the code, flag and fix any of the following:
- Off-by-one errors in pagination (e.g., `skip` calculation: `(page - 1) * limit`).
- Incorrect status transitions (e.g., trying to schedule an application that is already `SENT`).
- Missing null/undefined guards before accessing nested properties.
- Missing `await` on async operations.
- Incorrect error type thrown (e.g., throwing `BadRequestException` when `NotFoundException` is semantically correct).
- Any place where `catch (e)` swallows an error silently without logging or re-throwing.
- React component keys using array index instead of stable unique IDs in lists.
- `useEffect` dependencies arrays that are missing or incorrect.

---

## OUTPUT FORMAT

For each file you modify:
1. State the **file path**.
2. Briefly list the **changes made** (2–5 bullet points).
3. Output the **full corrected file content**.

Do not output files you did not change. Do not truncate file content — output it completely.

If you find an issue that requires a new shared file (e.g., a new `enums.ts`, a new shared hook, a new utility), create it and include it in the output.

Start by scanning all files silently, then proceed file by file in this order:
1. Shared/config files (backend)
2. Backend modules (auth → users → jobs → applications → cvs → gmail → analytics → notifications → tracking)
3. Frontend constants and services
4. Frontend modules
5. Frontend pages and components
# Quickstart: Foundation Setup

**Branch**: `001-foundation-monorepo-setup`

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (running locally or via Docker)
- Redis 7+ (running locally or via Docker)

## 1. Install dependencies

From the project root:

```bash
npm install
```

New server dependencies added in this phase:

```bash
cd server
npm install @prisma/client ioredis bullmq winston zod \
  nodemailer bcrypt jsonwebtoken uuid
npm install -D prisma @types/nodemailer @types/bcrypt \
  @types/jsonwebtoken @types/uuid
```

## 2. Configure environment

Copy the env example and fill in your values:

```bash
cp server/.env.example server/.env
```

Required variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kafoo

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key-here

# Email (Nodemailer)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# LLM (optional — not needed until Phase 4)
LLM_API_KEY=
LLM_BASE_URL=

# App
APP_URL=http://localhost:5173
API_URL=http://localhost:5000
```

## 3. Initialize database

```bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
```

This creates all 10 tables and populates default system settings.

## 4. Start development

From the project root:

```bash
npm run dev
```

This starts both the API server and the React client concurrently.

## 5. Verify

### Health check

```bash
curl http://localhost:5000/v1/health
# → { "success": true, "data": { "status": "ok", ... } }
```

### Database health

```bash
curl http://localhost:5000/v1/health/db
# → { "success": true, "data": { "status": "ok", "db": "connected" } }
```

### 404 handler

```bash
curl http://localhost:5000/v1/nonexistent
# → { "success": false, "error": { "code": "NOT_FOUND", "status": 404 } }
```

## Troubleshooting

**"Missing environment variable" error on startup**: The Zod
env validation lists all missing variables at once. Check
`server/.env` against `.env.example`.

**"Cannot connect to database"**: Ensure PostgreSQL is running
and `DATABASE_URL` is correct. Run `npx prisma db push` to
create tables.

**"Redis connection refused"**: Ensure Redis is running on the
configured host/port. The server will start with a warning if
Redis is unavailable — queue features will be degraded.

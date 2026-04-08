# API Contract: Health Check Endpoints

**Module**: health
**Base Path**: `/v1/health`

## GET /v1/health

Basic server liveness check.

**Auth**: None (public)

**Request**: No body, no query parameters.

**Response 200**:

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "ok",
    "uptime": 12345,
    "timestamp": "2026-04-08T12:00:00.000Z"
  }
}
```

## GET /v1/health/db

Database connectivity check.

**Auth**: None (public)

**Request**: No body, no query parameters.

**Response 200** (database connected):

```json
{
  "success": true,
  "message": "Database connected",
  "data": {
    "status": "ok",
    "db": "connected"
  }
}
```

**Response 503** (database unreachable):

```json
{
  "success": false,
  "message": "Database connection failed",
  "error": {
    "code": "DB_CONNECTION_ERROR",
    "status": 503
  }
}
```

## Standard Error Response Format

All error responses across the API follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": {
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

## Standard Success Response Format

All success responses follow this structure:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": {}
}
```

For paginated responses:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 404 Not Found Response

Any unmatched route returns:

```json
{
  "success": false,
  "message": "Route not found: GET /unknown-path",
  "error": {
    "code": "NOT_FOUND",
    "status": 404
  }
}
```

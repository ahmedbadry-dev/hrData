# Data Model: Foundation Setup

**Branch**: `001-foundation-monorepo-setup`
**Date**: 2026-04-08

## Overview

The Kafoo platform requires 10 database tables. All primary keys
are UUIDs. All deletions are hard deletes with cascading.
Timestamps (`created_at`, `updated_at`) are present on every table.

## Entities

### 1. users

The central user account entity.

| Field                         | Type                                          | Constraints                              |
| ----------------------------- | --------------------------------------------- | ---------------------------------------- |
| id                            | UUID                                          | PK, default auto-generated               |
| full_name                     | VARCHAR(255)                                  | NOT NULL                                 |
| email                         | VARCHAR(255)                                  | NOT NULL, UNIQUE                         |
| phone                         | VARCHAR(20)                                   | NULLABLE                                 |
| password_hash                 | VARCHAR(255)                                  | NOT NULL                                 |
| role                          | ENUM(user, admin, super_admin)                | NOT NULL, default 'user'                 |
| status                        | ENUM(pending_verification, active, suspended) | NOT NULL, default 'pending_verification' |
| email_verified                | BOOLEAN                                       | NOT NULL, default false                  |
| verification_token            | VARCHAR(255)                                  | NULLABLE                                 |
| verification_token_expires_at | TIMESTAMP                                     | NULLABLE                                 |
| reset_token                   | VARCHAR(255)                                  | NULLABLE                                 |
| reset_token_expires_at        | TIMESTAMP                                     | NULLABLE                                 |
| refresh_token                 | TEXT                                          | NULLABLE                                 |
| failed_login_attempts         | INTEGER                                       | NOT NULL, default 0                      |
| locked_until                  | TIMESTAMP                                     | NULLABLE                                 |
| created_at                    | TIMESTAMP                                     | NOT NULL, default now()                  |
| updated_at                    | TIMESTAMP                                     | NOT NULL, auto-update                    |

### 2. gmail_tokens

Encrypted Gmail OAuth2 tokens per user.

| Field         | Type         | Constraints                           |
| ------------- | ------------ | ------------------------------------- |
| id            | UUID         | PK                                    |
| user_id       | UUID         | FK → users.id, UNIQUE, CASCADE DELETE |
| access_token  | TEXT         | NOT NULL (AES-256 encrypted)          |
| refresh_token | TEXT         | NOT NULL (AES-256 encrypted)          |
| token_expiry  | TIMESTAMP    | NOT NULL                              |
| email         | VARCHAR(255) | NOT NULL                              |
| created_at    | TIMESTAMP    | NOT NULL, default now()               |
| updated_at    | TIMESTAMP    | NOT NULL, auto-update                 |

### 3. jobs

Scraped job listings from external sources.

| Field        | Type         | Constraints             |
| ------------ | ------------ | ----------------------- |
| id           | UUID         | PK                      |
| title        | VARCHAR(500) | NOT NULL                |
| company_name | VARCHAR(255) | NOT NULL                |
| location     | VARCHAR(255) | NULLABLE                |
| category     | VARCHAR(255) | NULLABLE                |
| description  | TEXT         | NULLABLE                |
| hr_email     | VARCHAR(255) | NULLABLE                |
| source       | VARCHAR(100) | NOT NULL                |
| source_url   | TEXT         | NULLABLE                |
| language     | VARCHAR(10)  | NOT NULL, default 'ar'  |
| posted_at    | TIMESTAMP    | NULLABLE                |
| expires_at   | TIMESTAMP    | NULLABLE                |
| is_expired   | BOOLEAN      | NOT NULL, default false |
| created_at   | TIMESTAMP    | NOT NULL, default now() |
| updated_at   | TIMESTAMP    | NOT NULL, auto-update   |

**Unique constraint**: (title, company_name, location) for
deduplication.

### 4. saved_jobs

Bookmark relationship between users and jobs.

| Field      | Type      | Constraints                   |
| ---------- | --------- | ----------------------------- |
| id         | UUID      | PK                            |
| user_id    | UUID      | FK → users.id, CASCADE DELETE |
| job_id     | UUID      | FK → jobs.id, CASCADE DELETE  |
| created_at | TIMESTAMP | NOT NULL, default now()       |

**Unique constraint**: (user_id, job_id) — no duplicate bookmarks.

### 5. cvs

User-uploaded CV/resume files.

| Field      | Type         | Constraints                   |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK                            |
| user_id    | UUID         | FK → users.id, CASCADE DELETE |
| file_name  | VARCHAR(255) | NOT NULL                      |
| file_url   | TEXT         | NOT NULL                      |
| file_size  | INTEGER      | NOT NULL                      |
| is_default | BOOLEAN      | NOT NULL, default false       |
| created_at | TIMESTAMP    | NOT NULL, default now()       |
| updated_at | TIMESTAMP    | NOT NULL, auto-update         |

### 6. email_templates

Reusable email templates for auto-apply.

| Field      | Type         | Constraints                   |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK                            |
| user_id    | UUID         | FK → users.id, CASCADE DELETE |
| name       | VARCHAR(255) | NOT NULL                      |
| subject    | VARCHAR(500) | NOT NULL                      |
| body       | TEXT         | NOT NULL                      |
| is_default | BOOLEAN      | NOT NULL, default false       |
| created_at | TIMESTAMP    | NOT NULL, default now()       |
| updated_at | TIMESTAMP    | NOT NULL, auto-update         |

### 7. applications

Records of job applications sent on behalf of users.

| Field             | Type                                                 | Constraints                       |
| ----------------- | ---------------------------------------------------- | --------------------------------- |
| id                | UUID                                                 | PK                                |
| user_id           | UUID                                                 | FK → users.id, CASCADE DELETE     |
| job_id            | UUID                                                 | FK → jobs.id, CASCADE DELETE      |
| cv_id             | UUID                                                 | FK → cvs.id, NULLABLE             |
| email_template_id | UUID                                                 | FK → email_templates.id, NULLABLE |
| status            | ENUM(scheduled, sending, sent, failed, email_opened) | NOT NULL, default 'scheduled'     |
| scheduled_at      | TIMESTAMP                                            | NULLABLE                          |
| sent_at           | TIMESTAMP                                            | NULLABLE                          |
| opened_at         | TIMESTAMP                                            | NULLABLE                          |
| tracking_token    | VARCHAR(255)                                         | UNIQUE, NULLABLE                  |
| error_message     | TEXT                                                 | NULLABLE                          |
| retry_count       | INTEGER                                              | NOT NULL, default 0               |
| created_at        | TIMESTAMP                                            | NOT NULL, default now()           |
| updated_at        | TIMESTAMP                                            | NOT NULL, auto-update             |

### 8. notifications

System and admin notifications.

| Field      | Type                                | Constraints                             |
| ---------- | ----------------------------------- | --------------------------------------- |
| id         | UUID                                | PK                                      |
| user_id    | UUID                                | FK → users.id, NULLABLE, CASCADE DELETE |
| title      | VARCHAR(255)                        | NOT NULL                                |
| body       | TEXT                                | NOT NULL                                |
| type       | ENUM(info, success, warning, alert) | NOT NULL, default 'info'                |
| target     | ENUM(all, admin, user)              | NOT NULL, default 'user'                |
| is_read    | BOOLEAN                             | NOT NULL, default false                 |
| created_at | TIMESTAMP                           | NOT NULL, default now()                 |

### 9. activity_logs

Audit trail for significant platform events.

| Field       | Type         | Constraints                                 |
| ----------- | ------------ | ------------------------------------------- |
| id          | UUID         | PK                                          |
| user_id     | UUID         | FK → users.id, NULLABLE, SET NULL on delete |
| action      | VARCHAR(255) | NOT NULL                                    |
| entity_type | VARCHAR(100) | NULLABLE                                    |
| entity_id   | UUID         | NULLABLE                                    |
| metadata    | JSON         | NULLABLE                                    |
| ip_address  | VARCHAR(45)  | NULLABLE                                    |
| created_at  | TIMESTAMP    | NOT NULL, default now()                     |

### 10. system_settings

Key-value store for platform configuration.

| Field       | Type         | Constraints             |
| ----------- | ------------ | ----------------------- |
| id          | UUID         | PK                      |
| key         | VARCHAR(255) | NOT NULL, UNIQUE        |
| value       | TEXT         | NOT NULL                |
| description | VARCHAR(500) | NULLABLE                |
| created_at  | TIMESTAMP    | NOT NULL, default now() |
| updated_at  | TIMESTAMP    | NOT NULL, auto-update   |

## Relationships

```text
users 1──* gmail_tokens      (one user, one Gmail connection)
users 1──* saved_jobs         (one user, many bookmarks)
users 1──* cvs                (one user, many CVs)
users 1──* email_templates    (one user, many templates)
users 1──* applications       (one user, many applications)
users 1──* notifications      (one user, many notifications)
users 1──* activity_logs      (one user, many logs; SET NULL on delete)
jobs  1──* saved_jobs         (one job, many bookmarks)
jobs  1──* applications       (one job, many applications)
cvs   1──* applications       (one CV, many applications; optional)
email_templates 1──* applications (one template, many applications; optional)
```

## State Transitions

### User Status

```text
pending_verification → active       (email verified)
active → suspended                  (admin action)
suspended → active                  (admin action)
```

### Application Status

```text
scheduled → sending → sent → email_opened
                   ↘ failed (after 3 retries)
```

## Seed Data

The seed script MUST populate:

| Key                       | Default Value | Description                   |
| ------------------------- | ------------- | ----------------------------- |
| auto_registration_enabled | true          | Allow new user registration   |
| maintenance_mode          | false         | Block non-admin routes        |
| verbose_logs              | false         | Enable verbose logging        |
| email_sending_enabled     | true          | Enable email sending          |
| max_emails_per_day        | 50            | Daily email limit per user    |
| smtp_sender_email         | (empty)       | SMTP sender address           |
| scraper_enabled           | true          | Enable scrapers               |
| scraper_interval_minutes  | 120           | Scraper run interval          |
| scraper_time_gap_seconds  | 5             | Delay between scraper sources |

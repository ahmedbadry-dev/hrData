# Software Requirements Specification (SRS)

# Kafoo' Platform — كفو

  

**Version:** 1.0.5

**Date:** April 2026

**Status:** Draft

**Language:** English

  

---

  

## Table of Contents

  

1. [Introduction](#1-introduction)

2. [Overall System Description](#2-overall-system-description)

3. [System Architecture Overview](#3-system-architecture-overview)

4. [User Roles & Permissions](#4-user-roles--permissions)

5. [Functional Requirements — User Portal](#5-functional-requirements--user-portal)

   - 5.1 Landing Page

   - 5.2 Authentication

   - 5.3 Dashboard

   - 5.4 Job Discovery

   - 5.5 Saved Jobs

   - 5.6 Auto-Apply

   - 5.7 Analytics & Tracking

   - 5.8 Settings & Gmail Integration

6. [Functional Requirements — Admin Panel](#6-functional-requirements--admin-panel)

   - 6.1 Admin Dashboard

   - 6.2 Scraping Management

   - 6.3 User Management

   - 6.4 Notifications & Announcements

   - 6.5 System Settings

   - 6.6 Advanced Analytics

7. [API Endpoints Specification](#7-api-endpoints-specification)

   - 7.1 Auth Endpoints

   - 7.2 Jobs Endpoints

   - 7.3 Applications Endpoints

   - 7.4 Gmail Integration Endpoints

   - 7.5 Analytics Endpoints

   - 7.6 Admin Endpoints

8. [External Integrations](#8-external-integrations)

   - 8.1 Google Gmail API (OAuth2)

   - 8.2 Web Scrapers

   - 8.3 Email Tracking (Tracking Pixel)

   - 8.4 BullMQ + Redis (Job Queue & Scheduler)

   - 8.5 LLM API (AI-Powered Job Parsing)

9. [Data Models](#9-data-models)

10. [Non-Functional Requirements](#10-non-functional-requirements)

11. [Security Requirements](#11-security-requirements)

12. [Constraints & Assumptions](#12-constraints--assumptions)

13. [Technology Stack](#13-technology-stack)

  

---

  

## 1. Introduction

  

### 1.1 Purpose

  

This document defines the complete software requirements for **Kafoo\'** (كفو), a SaaS-based intelligent job application platform targeting the Saudi Arabian job market. It serves as the single source of truth for the development team, covering all features, screens, API endpoints, data models, and system behavior.

  

### 1.2 Scope

  

Kafoo\' enables job seekers to bypass traditional job portal application pipelines by sending CVs and cover letters **directly** to HR managers\' email addresses using the applicant\'s **own Gmail account**. The platform automates job data collection via web scraping, uses an LLM API to parse raw HTML into structured job objects, and provides both a user-facing portal and an administrative control panel.

  

### 1.3 Intended Audience

  

- Backend & Frontend Engineers

- System Architects

- Product Managers

- QA Engineers

- Stakeholders & Investors

  

### 1.4 Definitions & Acronyms

  

| Term | Definition |

|------|------------|

| SaaS | Software as a Service |

| HR | Human Resources Manager / Recruiter |

| CV | Curriculum Vitae (Resume) |

| Auto-Apply | Bulk automated email sending feature |

| Scraper | Automated bot that collects job data from external sources |

| Open Rate | Percentage of sent emails opened by recipients |

| Tracking Pixel | A 1x1 invisible image embedded in emails to detect open events |

| Gmail API | Google\'s official API for sending emails on behalf of a user |

| OAuth2 | Authorization framework used to connect user Gmail accounts |

| SMTP | Simple Mail Transfer Protocol |

| BullMQ | Node.js queue library built on top of Redis for job scheduling |

| LLM | Large Language Model — AI model used to parse scraped HTML into structured data |

  

### 1.5 References

  

- Google Gmail API Documentation: https://developers.google.com/gmail/api

- Google OAuth2 Documentation: https://developers.google.com/identity/protocols/oauth2

- BullMQ Documentation: https://docs.bullmq.io

- Job Data Sources — see Section 6.2 for full list

  

---

  

## 2. Overall System Description

  

### 2.1 Product Perspective

  

Kafoo\' is a standalone SaaS web application with two main interfaces:

- **User Portal** — for job seekers

- **Admin Panel** — for platform administrators

  

The platform sits between several external systems:

1. **Job Sources** (Arabic & English Saudi job boards) — scraped automatically

2. **LLM API** — used to parse raw scraped HTML into clean structured job objects

3. **Gmail API** — used to send emails on behalf of the user

4. **Email Tracking Service** — embedded tracking pixels for open-rate detection

5. **Redis + BullMQ** — job queue for scheduled and delayed email sending

  

### 2.2 Product Functions Summary

  

- Automated job data collection from major Saudi job boards

- AI-powered HTML parsing via LLM to extract structured job data

- Direct email delivery of CVs to HR contacts

- Scheduled email sending — users choose a specific time for bulk sends

- Gmail OAuth2 integration for sending via user\'s own account

- Email open-rate tracking via tracking pixels

- Job bookmarking and application history tracking

- Real-time admin monitoring and control

  

### 2.3 Target Market

  

- **Primary:** Saudi Arabian job seekers

- **Secondary:** GCC region professionals targeting Saudi companies

  

### 2.4 Operating Environment

  

- Web-based application (responsive for desktop and mobile)

- Cloud-hosted backend with scheduled background jobs

- External dependencies: Google APIs, LLM API provider, Saudi job board websites

  

---

  

## 3. System Architecture Overview

  

```

┌──────────────────────────────────────────────────────────────────┐

│                          Kafoo\' PLATFORM                          │

│                                                                  │

│  ┌──────────────┐         ┌──────────────────────────────┐       │

│  │  User Portal │         │       Admin Panel            │       │

│  │  (Frontend)  │         │       (Frontend)             │       │

│  └──────┬───────┘         └──────────────┬───────────────┘       │

│         │                                │                       │

│  ┌──────▼────────────────────────────────▼───────────────┐       │

│  │                    REST API (Backend)                 │       │

│  │   Auth | Jobs | Applications | Analytics | Admin      │       │

│  └───────┬───────────────────┬───────────────────────────┘       │

│          │                   │                                   │

│  ┌───────▼──────────┐  ┌─────▼──────────────────────┐           │

│  │    Database      │  │   Redis + BullMQ           │           │

│  │  (PostgreSQL)    │  │   - Email Send Queue       │           │

│  └──────────────────┘  │   - Scheduled Jobs         │           │

│                        │   - Scraper Scheduler      │           │

│  ┌───────────────────┐ └─────────────────────────────┘           │

│  │   Job Scraper     │                                           │

│  │   (Scheduler)     │──► LLM API (HTML → Structured Object)    │

│  └───────┬───────────┘                                           │

│          │                                                        │

└──────────┼────────────────────────────────────────────────────── ┘

           │

     ┌─────┴──────────────────────────────────────────┐

     │         Saudi Job Boards (11 Sources)          │

     │  wzayf22 | ewdifh | wdeftksa | jobs-1          │

     │  linkedksa | saudijobs24 | wazaef | jbscv      │

     │  saudia.jobs | wadhefa | saudijobs.in (EN)     │

     └────────────────────────────────────────────────┘

  

External Services:

- Gmail API (OAuth2)    → send emails on behalf of users

- LLM API              → parse raw scraped HTML into structured job objects

- Redis + BullMQ       → queue and schedule email sends

- Tracking Pixel Server → open-rate detection

```

  

---

  

## 4. User Roles & Permissions

  

| Role | Description | Access Level |

|------|-------------|--------------|

| Guest | Unauthenticated visitor | Landing page only |

| User | Registered job seeker | Full user portal access |

| Admin | Platform administrator | Everything + dangerous zone (reset/wipe) |

  

---

  

## 5. Functional Requirements — User Portal

  

---

  

### 5.1 Landing Page

  

**Purpose:** Introduce the platform, communicate value proposition, and convert visitors to registered users.

  

**Sections:**

  

- **Hero Section**

  - Headline explaining the direct-to-HR concept

  - CTA buttons: "Get Started for Free" / "See How It Works"

  

- **Features Section**

  - Free to use

  - Direct contact with HR managers (no middleman)

  - Save and track your applications

  - Powered by your own Gmail (builds trust with recipients)

  

- **How It Works Section** (3-step visual)

  1. Connect your Gmail

  2. Discover jobs & upload your CV

  3. Apply in bulk with one click

  

- **Social Proof / Stats**

  - Number of jobs available

  - Number of successful applications sent

  - Number of registered users

  

- **Footer**

  - Links: Privacy Policy, Terms of Service, Contact Us

  

**Requirements:**

- Must be fully responsive (mobile-first)

- Page load time < 2 seconds

- SEO-optimized meta tags

  

---

  

### 5.2 Authentication

  

**Screens:**

- Register Page

- Login Page

- Forgot Password Page

- Reset Password Page

- Email Verification Page

  

**Registration Fields:**

- Full Name (required)

- Email Address (required, unique)

- Phone Number (required, Saudi format preferred)

- Password (min 8 chars, 1 uppercase, 1 number)

- Confirm Password

  

**Login Fields:**

- Email

- Password

- Remember Me (checkbox)

  

**Business Rules:**

- Email must be verified before accessing the dashboard

- JWT-based session management (Access Token + Refresh Token)

- Access token expiry: 15 minutes

- Refresh token expiry: 7 days

- Account lockout after 5 failed login attempts (unlock after 15 min or via email)

  

---

  

### 5.3 Dashboard (User Home)

  

**Purpose:** Give the user a quick overview of their job application activity.

  

**Empty State:**

- When the user has no activity yet, a centered placeholder icon is shown with the message:

  *"وظيفة بانتظارك — اختر «اكتشف الوظائف» للبدء"*

  (A job is waiting for you — go to Discover Jobs to begin)

  

**KPI Cards (4 cards):**

  

| Card | Description |

|------|-------------|

| الوظائف المتاحة (Available Jobs) | Total number of jobs currently in the platform |

| الوظائف المحفوظة (Saved Jobs) | Number of jobs the user has bookmarked |

| معدل الفتح (Open Rate) | Percentage of sent emails opened by HR recipients |

| إجمالي EMAIL المرسل (Total Emails Sent) | Cumulative count of all application emails sent |

  

**Chart:**

- **Bar Chart — نشاط الإرسال خلال الأسبوع (Weekly Send Activity)**

  - X-axis: Days of the week — الأحد, الاثنين, الثلاثاء, الأربعاء, الخميس (Sun–Thu)

  - Y-axis: Number of emails sent (0–25)

  - Shows how many emails the user sent on each day of the current week

  

---

  

### 5.4 Job Discovery

  

**Purpose:** Allow users to search and browse available jobs aggregated by the scraper.

  

**Screen Layout:**

- Page title: "البحث عن وظيفة" (Search for a Job)

- Search bar with placeholder: *"...مسمى وظيفي، تخصص، مدينة"* (Job title, specialty, city) + **بحث** button

- **كل المدن** dropdown (All Cities) — filter by city

- **كل الأوقات** dropdown (All Times) — filter by posting time

  

**Empty State:**

- Shown before any search is performed:

  *"لا توجد نتائج بحث بعد. استخدم مربع البحث أعلاه للعثور على وظيفتك المثالية."*

  (No search results yet. Use the search box above to find your ideal job.)

  

**Job Card Fields (visible across screens):**

  

| Field | Description |

|-------|-------------|

| Company Name | Displayed in colored text at the top of the card |

| Job Title | Large bold text |

| Date | Posting date with calendar icon |

| Location | City with location pin icon |

| Category Tag | Job category label |

| HR Email | Shown with a blue dot indicator |

| أرسل سيرتك إلى (Send CV link) | Inline link to initiate sending |

  

---

  

### 5.5 Saved Jobs

  

**Purpose:** A personal list of jobs the user has bookmarked.

  

**Screen Layout:**

- Page header: "المحفوظة" (Saved) with total count displayed (e.g., "7 وظيفة")

- **إزالة الكل** button (Remove All) — clears all saved jobs at once

  

**Saved Job Card Fields:**

  

| Field | Description |

|-------|-------------|

| ★ Star Icon | Gold filled star indicating the job is saved |

| Company Name | Displayed in colored text (top right of card) |

| Job Title | Large bold text |

| Date | Posting date with calendar icon |

| Location | City with pin icon |

| Category Tag | Job category label |

| HR Email | Shown with a blue dot indicator |

| أرسل سيرتك إلى | Link to send CV directly to this job |

  

---

  

### 5.6 Auto-Apply

  

**Purpose:** Allows users to compose and send bulk application emails to saved jobs.

  

---

  

#### State 1: Gmail Not Connected (Blocked State)

  

When the user navigates to التقديم الآلي without a connected Gmail account, a **full-page warning** is shown inside a red-bordered box:

  

- **Warning icon** (triangle with !)

- **Title:** "يرجى ربط حساب Gmail أولاً" (Please link your Gmail account first)

- **Description:** "لاستخدام التقديم الآلي وإرسال طلباتك مباشرة من المنصة يجب ربط حساب Gmail الخاص بك من صفحة الإعدادات."

  (To use Auto-Apply and send your applications directly from the platform, you must link your Gmail account from the Settings page.)

- **Button:** "الذهاب إلى الإعدادات" (Go to Settings) — navigates to the Settings page

  

---

  

#### State 2: Gmail Connected — Step 1 of 2

  

**Page header:** "التقديم الآلي — خطوة 1 من 2" (Auto-Apply — Step 1 of 2)

  

**Gmail Status Banner (top of page):**

- Displays: "حساب Gmail مربوط بنجاح" (Gmail account linked successfully)

- Shows connected email address (e.g., user@gmail.com)

- **تغيير** (Change) button to switch to a different Gmail account

  

**Form Fields:**

  

| Field | Label | Details |

|-------|-------|---------|

| Email Subject | عنوان البريد الإلكتروني | Pre-filled with: "طلب الانضمام — [المسمى الوظيفي]" |

| Message Body | نص الرسالة | Pre-filled Arabic cover letter template (editable) |

| CV Upload | السيرة الذاتية | Dashed-border upload area: "اضغط لرفع السيرة الذاتية" |

  

**Selected Jobs List (الوظائف المختارة):**

- Shows all jobs selected from Saved Jobs

- Each entry displays: Company name, job title, HR email, checkbox (checked)

  

**Navigation Buttons (bottom of page):**

- **← المحفوظات** — Go back to Saved Jobs

- **الثاني: جدولة الإرسال ←** — Proceed to Step 2 (Schedule Send)

  

---

  

#### State 2: Step 2 — Schedule Send (جدولة الإرسال)

  

- User selects the date and time to send the emails

- Emails are queued in BullMQ as delayed jobs until the scheduled time

- Confirmation button to finalize the scheduled send

  

---

  

### 5.7 Analytics & Tracking

  

**Purpose:** Let users monitor the status of all their sent applications.

  

**Screen Layout:**

- Page header: "التحليلات والتتبع" (Analytics & Tracking)

- Total count displayed: e.g., "7 طلب مرسل" (7 applications sent)

  

**Application Entry Fields (list view):**

  

| Field | Description |

|-------|-------------|

| Company Name | Colored text, top right of entry |

| Job Title | Large bold text |

| Date | Posting/send date with icon |

| Location | City with pin icon |

| Category Tag | Job category label |

| HR Email | Shown below the job details |

| Status Button | Current status of the application (e.g., "قيد الإرسال" — In Queue) |

| أرسل إلى | Send link |

  

**Application Status Values:**

  

| Status | Color | Meaning |

|--------|-------|---------|

| قيد الإرسال | Orange/Yellow | Email is queued in BullMQ, waiting to be sent |

| مرسل | Green | Email sent successfully |

| فشل | Red | Email failed after retries |

| تم الفتح | Blue | HR recipient opened the email |

  

---

  

### 5.8 Settings

  

**Purpose:** Manage the user's Gmail connection and view platform information.

  

**Screen Layout:** Two sections on the page.

  

---

  

#### Section 1: ربط حساب Gmail (Link Gmail Account)

  

| Element | Description |

|---------|-------------|

| Title | "ربط حساب Gmail" |

| Description | "ربط حساب Gmail يتيح لك إرسال رسائل التقديم مباشرة من المنصة" |

| حالة الاتصال (Connection Status) | Badge showing "متصل ✓" (green) when connected |

| فصل الاتصال (Disconnect) | Red button — disconnects the Gmail account |

| البريد المرتبط (Linked Email) | Displays the connected Gmail address (e.g., user@gmail.com) |

  

**Behavior:**

- When Gmail is connected: shows the linked email + red "Disconnect" button

- When Gmail is not connected: shows a Connect button that initiates the OAuth2 flow

  

---

  

#### Section 2: معلومات (Information)

  

| Element | Value |

|---------|-------|

| Section subtitle | "إعدادات إضافية للتقديم الآلي" (Additional Auto-Apply settings) |

| الوظائف المحفوظة (Saved Jobs) | Count of currently saved jobs (e.g., 7 وظيفة) |

| إصدار المنصة (Platform Version) | e.g., كفؤ 2026 |

  

---

  

## 6. Functional Requirements — Admin Panel

  

---

  

### 6.1 Admin Dashboard

  

**Purpose:** Give administrators a real-time overview of platform health and usage.

  

**KPI Cards:**

  

| Metric | Description |

|--------|-------------|

| Active Users | Users who logged in within the last 7 days (e.g., 1,247) |

| Total Applications Sent | Cumulative all-time applications sent via the platform |

| Success Rate | % of sent emails that did not bounce or fail (e.g., 68%) |

| Total Jobs in DB | Current count of available jobs in the database |

| Scrapers Status | Active / Idle / Error indicator per scraper |

  

**Charts:**

- **Multi-line Chart — Weekly Activity:** 3 lines tracking Application Sends, New User Registrations, Scraper Errors — over the past 7 days

- **Bar Chart — Top Job Categories:** Most searched/applied job titles

  

---

  

### 6.2 Scraping Management

  

**Purpose:** Control and monitor the automated job data collection engine, including the LLM-powered parsing pipeline.

  

**Scraper Sources:**

  

| # | Source Name | URL | Language |

|---|-------------|-----|----------|

| 1 | Wzayf | https://wzayf22.blogspot.com/?m=1 | Arabic |

| 2 | Ewdifh | https://www.ewdifh.com/ | Arabic |

| 3 | Wdeftksa | https://www.wdeftksa.com/ | Arabic |

| 4 | Jobs-1 | https://www.jobs-1.com/ | Arabic |

| 5 | LinkedKSA | https://linkedksa.com/ | Arabic |

| 6 | SaudiJobs24 | https://www.saudijobs24.com/ | Arabic |

| 7 | Wazaef.net | https://wazaef.net/ | Arabic |

| 8 | Jbscv | https://jbscv.com/ | Arabic |

| 9 | Saudia Jobs | https://saudia.jobs | Arabic |

| 10 | Wadhefa | https://www.wadhefa.com | Arabic |

| 11 | SaudiJobs.in | https://saudijobs.in | English |

  

**Scraping + Parsing Pipeline (per source):**

  

```

1. Scraper fetches the job listing page HTML

        ↓

2. Extracts all job listing containers

   (e.g., div.single_job_listing)

        ↓

3. Each container\'s raw HTML is sent to the LLM API

        ↓

4. LLM returns a structured JSON object per listing

        ↓

5. Backend creates one job record per job title

   found in the parsed object

        ↓

6. Deduplication check before inserting

```

  

**Per-Scraper Controls:**

- Enable / Disable toggle

- Run Now button (manual trigger)

- Schedule configuration (default: every 120 minutes, managed via BullMQ)

- Last run timestamp

- Last run status: `Success` / `Failed` / `Running`

- Jobs fetched in last run (count)

  

**Scraper Terminal Log:**

- Real-time text log showing scraper start, pages visited, LLM calls made, jobs parsed, duplicates filtered, new jobs added, and errors

- Log is scrollable and filterable by level: `INFO`, `WARN`, `ERROR`

  

**Deduplication Logic:**

- A job is considered a duplicate if `(job_title + company_name + location)` already exists in the DB

- Duplicate jobs are discarded silently (logged as `INFO`)

  

---

  

### 6.3 User Management

  

**Purpose:** Full CRUD control over user accounts.

  

**Screen Layout:**

- Search bar at the top: search by name, email, or phone number

- Filter tabs: **All** | **Active** | **Suspended**

- Total user count displayed below the filter tabs

- Hint text: *"Press \'Activity\' for user details"* — clicking Activity opens the full user profile

  

**Users Table Columns:**

  

| Column | Description |

|--------|-------------|

| # | Row number (auto-incremented display index) |

| User | User avatar (initials), full name, and registered email |

| Phone | Registered phone number |

| Join Date | Account creation date |

| Status | `Active` (green badge) / `Suspended` (red badge) |

| Actions | Activity \| Suspend \| Edit \| Delete |

  

**Admin Actions per Row:**

  

| Action | Behavior |

|--------|----------|

| Activity | Opens full user profile with application history |

| Suspend | Temporarily disables the account; user sees a suspended message on login |

| Edit | Opens an edit form to modify name, email, or phone |

| Delete | Permanently deletes the account with a confirmation dialog |

  

> **Note:** When a user is already suspended, the "Suspend" button changes to "Activate" to re-enable the account.

  

**Search & Filters:**

- Search by name, email, or phone number

- Filter tabs: All / Active / Suspended

  

---

  

### 6.4 Notifications & Announcements

  

**Purpose:** Admin-to-user communication system for broadcasting system updates, alerts, and announcements.

  

**Screen Layout:**

- "+ Send New Notification" button at the top left

- Total count of sent notifications displayed (e.g., "3 notifications / announcements")

- List of notification cards, each with a color-coded left border indicating type

  

**Notification Card Display:**

  

Each card shows:

- **Title** (bold)

- **Target audience** — e.g., "All Users" or "System Admin"

- **Date sent**

- **Body text** — the notification message

- **Action buttons:** Delete | Type badge

  

**Notification Types (color-coded borders):**

  

| Type | Border Color | Badge Label | Use Case |

|------|-------------|-------------|----------|

| Success | Green | نجاح | Successful system updates, completed actions |

| Warning | Yellow | تحذير | Scheduled maintenance, upcoming downtime |

| Alert | Red | تنبيه | Errors, SMTP failures, critical issues |

  

**Notification Fields (when creating):**

  

| Field | Type | Description |

|-------|------|-------------|

| Title | Text | Short title of the notification |

| Body | Text | Full notification message |

| Type | Enum | `Success` / `Warning` / `Alert` |

| Target | Enum | `All Users` / `System Admin` |

  

**Admin Actions:**

- **Send New Notification:** Opens a form to create and send a new notification

- **Delete:** Removes a notification card from the list (with confirmation)

  

---

  

### 6.5 System Settings

  

**Purpose:** Configure global platform behavior, email delivery, scraper scheduling, and provide access to dangerous administrative actions.

  

---

  

#### General Settings

  

| Setting | Type | Default | Description |

|---------|------|---------|-------------|

| Auto User Registration | Toggle | ON | Allow new accounts to be created automatically |

| Maintenance Mode | Toggle | OFF | Temporarily disable user access to the platform |

| Verbose Logs | Toggle | OFF | Enable detailed debug-level server logging |

  

---

  

#### Email Settings

  

| Setting | Type | Default | Description |

|---------|------|---------|-------------|

| Send Registration Confirmation | Toggle | ON | Send a verification email to newly registered users |

| Auto-Apply Notifications | Toggle | ON | Notify users by email when their application is submitted successfully |

| SMTP Sender Email | Text Input | noreply@kufoo.sa | The sender address used for all outgoing platform emails |

  

- **Save button** to persist email settings changes.

  

---

  

#### Scraper Settings

  

| Setting | Type | Default | Description |

|---------|------|---------|-------------|

| Auto Scheduling | Toggle | ON | Run the scraper automatically every 120 minutes |

| Filter Duplicates | Toggle | ON | Prevent adding jobs that already exist in the database |

| Time Gap Between Cycles (minutes) | Number Input | 120 | Interval in minutes between automatic scraper runs |

  

- **Save button** to persist scraper settings changes.

  

---

  

#### Danger Zone

  

> Actions in this section are **irreversible**. Each action requires confirmation before executing.

  

| Action | Button | Description |

|--------|--------|-------------|

| Clear All Logs | Clear All | Permanently deletes all system activity logs from the database |

| Reset Settings | Reset | Restores all system settings to their factory defaults |

  

---

  

### 6.6 Advanced Analytics

  

**Purpose:** Provide administrators with a detailed, data-driven view of platform performance, user engagement, and application success metrics.

  

**KPI Cards:**

  

| Metric | Example Value | Description |

|--------|---------------|-------------|

| Active Users | 1,084 | Users with active sessions on the platform |

| AI Application Success Rate | 74% | Percentage of auto-apply submissions that completed without error |

| Open Rate | 68% | Percentage of sent emails opened by HR recipients |

| Total Applications | 2,847 | Cumulative total of all applications submitted through the platform |

  

**Charts (2 × 2 grid layout):**

  

**1. User Activity (Bar Chart)**

- X-axis: Days of the week (Sun – Thu)

- Y-axis: Count (0 – 350)

- Two data series: **Active Sessions** and **New Sessions**

  

**2. Most Requested Jobs (Horizontal Bar Chart)**

- Lists the top 5 most applied-for job titles

- X-axis: Application count (0 – 140+)

  

**3. Daily Applications — 30 Days (Line Chart)**

- X-axis: Day of month (1 – 30)

- Y-axis: Number of applications submitted

  

**4. AI Application Success Rate (Chart)**

- Three statuses: **Successful** (green) | **Failed** (red) | **Pending / In Queue** (orange)

  

---

  

## 7. API Endpoints Specification

  

**Base URL:** `https://api.Kafoo.sa/v1`

  

All protected routes require:

```

Authorization: Bearer <access_token>

```

  

---

  

### 7.1 Auth Endpoints

  

| Method | Endpoint | Auth | Description |

|--------|----------|------|-------------|

| `POST` | `/auth/register` | Public | Register a new user |

| `POST` | `/auth/login` | Public | Login and receive tokens |

| `POST` | `/auth/logout` | User | Invalidate refresh token |

| `POST` | `/auth/refresh` | Public | Get new access token using refresh token |

| `POST` | `/auth/forgot-password` | Public | Send password reset email |

| `POST` | `/auth/reset-password` | Public | Reset password using token from email |

| `GET` | `/auth/verify-email/:token` | Public | Verify email address |

| `POST` | `/auth/resend-verification` | User | Resend verification email |

  

**POST /auth/register — Request Body:**

```json

{

  "fullName": "Mohamed Ali",

  "email": "mohamed@example.com",

  "phone": "+966501234567",

  "password": "SecurePass123",

  "confirmPassword": "SecurePass123"

}

```

  

**POST /auth/login — Response:**

```json

{

  "accessToken": "eyJhbGc...",

  "refreshToken": "eyJhbGc...",

  "user": {

    "id": "uuid",

    "fullName": "Mohamed Ali",

    "email": "mohamed@example.com",

    "isGmailConnected": false

  }

}

```

  

---

  

### 7.2 Jobs Endpoints

  

| Method | Endpoint | Auth | Description |

|--------|----------|------|-------------|

| `GET` | `/jobs` | User | Get paginated list of all jobs |

| `GET` | `/jobs/:id` | User | Get single job details |

| `GET` | `/jobs/saved` | User | Get user\'s saved/bookmarked jobs |

| `POST` | `/jobs/:id/save` | User | Bookmark a job |

| `DELETE` | `/jobs/:id/save` | User | Remove job from bookmarks |

| `GET` | `/jobs/search` | User | Search and filter jobs |

  

**GET /jobs — Query Parameters:**

```

?page=1&limit=20&keyword=software+engineer&location=Riyadh

&source=linkedksa&datePosted=7days&category=tech&language=ar

```

  

**GET /jobs — Response:**

```json

{

  "data": [

    {

      "id": "uuid",

      "title": "Software Developer",

      "company": "STC",

      "location": "Riyadh",

      "source": "linkedksa",

      "sourceUrl": "https://linkedksa.com/job/123",

      "postedAt": "2026-04-01T10:00:00Z",

      "scrapedAt": "2026-04-01T10:30:00Z",

      "isExpired": false,

      "isSaved": false

    }

  ],

  "meta": {

    "total": 340,

    "page": 1,

    "limit": 20,

    "totalPages": 17

  }

}

```

  

---

  

### 7.3 Applications Endpoints

  

| Method | Endpoint | Auth | Description |

|--------|----------|------|-------------|

| `POST` | `/applications/send` | User | Send single application email immediately |

| `POST` | `/applications/bulk-send` | User | Trigger bulk Auto-Apply (immediate or scheduled) |

| `GET` | `/applications` | User | Get all applications by this user |

| `GET` | `/applications/:id` | User | Get single application details |

| `DELETE` | `/applications/:id` | User | Remove application from history |

| `PATCH` | `/applications/:id/cancel` | User | Cancel a scheduled application before send time |

| `GET` | `/track/open/:token` | Public | Tracking pixel endpoint (email open event) |

  

**POST /applications/bulk-send — Request Body:**

```json

{

  "jobIds": ["uuid-1", "uuid-2", "uuid-3"],

  "cvId": "uuid-cv",

  "coverLetterTemplate": "Dear {{company_name}} Team,\n\nI am applying for {{job_title}}...",

  "emailSubject": "Application for {{job_title}} — {{user_name}}",

  "scheduledAt": "2026-04-09T09:00:00Z"

}

```

  

> **Note:** `scheduledAt` is optional. If omitted, emails are sent immediately.

  

**POST /applications/bulk-send — Response:**

```json

{

  "message": "3 emails queued for sending",

  "scheduledAt": "2026-04-09T09:00:00Z",

  "queuedApplications": [

    { "id": "uuid", "jobId": "uuid-1", "status": "scheduled" },

    { "id": "uuid", "jobId": "uuid-2", "status": "scheduled" },

    { "id": "uuid", "jobId": "uuid-3", "status": "scheduled" }

  ]

}

```

  

**GET /track/open/:token — Behavior:**

- Returns a 1x1 transparent PNG image

- Backend records: `openedAt = NOW()`, `status = email_opened` for the matching application

- No auth required (email client makes this request automatically)

  

---

  

### 7.4 Gmail Integration Endpoints

  

| Method | Endpoint | Auth | Description |

|--------|----------|------|-------------|

| `GET` | `/gmail/auth-url` | User | Get Google OAuth2 authorization URL |

| `GET` | `/gmail/callback` | Public | OAuth2 callback — exchange code for tokens |

| `GET` | `/gmail/status` | User | Check if Gmail is connected |

| `DELETE` | `/gmail/disconnect` | User | Revoke Gmail access and delete stored tokens |

  

---

  

### 7.5 Analytics Endpoints

  

| Method | Endpoint | Auth | Description |

|--------|----------|------|-------------|

| `GET` | `/analytics/summary` | User | Get dashboard stats for the user |

| `GET` | `/analytics/weekly-activity` | User | Get email send count per day (last 7 days) |

| `GET` | `/analytics/open-rate-trend` | User | Get open rate data for last 30 days |

  

---

  

### 7.6 Admin Endpoints

  

> All endpoints in this section require `Admin` or `Super Admin` role.

  

#### Admin Dashboard

  

| Method | Endpoint | Description |

|--------|----------|-------------|

| `GET` | `/admin/dashboard/stats` | Get KPI cards data |

| `GET` | `/admin/dashboard/weekly-chart` | Get weekly multi-line chart data |

| `GET` | `/admin/dashboard/top-categories` | Get most applied job categories |

  

#### User Management

  

| Method | Endpoint | Description |

|--------|----------|-------------|

| `GET` | `/admin/users` | List all users with filters/search |

| `GET` | `/admin/users/:id` | Get single user full profile |

| `PATCH` | `/admin/users/:id` | Edit user details |

| `PATCH` | `/admin/users/:id/suspend` | Suspend user account |

| `PATCH` | `/admin/users/:id/activate` | Activate suspended account |

| `DELETE` | `/admin/users/:id` | Permanently delete user |

  

#### Scraper Management

  

| Method | Endpoint | Description |

|--------|----------|-------------|

| `GET` | `/admin/scrapers` | List all scrapers and their status |

| `POST` | `/admin/scrapers/:name/run` | Manually trigger a scraper |

| `PATCH` | `/admin/scrapers/:name/toggle` | Enable or disable a scraper |

| `PATCH` | `/admin/scrapers/:name/config` | Update scraper configuration |

| `GET` | `/admin/scrapers/:name/logs` | Stream scraper terminal logs (SSE) |

  

#### Notifications

  

| Method | Endpoint | Description |

|--------|----------|-------------|

| `POST` | `/admin/notifications/send` | Send broadcast or targeted notification |

| `GET` | `/admin/notifications` | List all sent notifications |

| `DELETE` | `/admin/notifications/:id` | Delete a notification |

  

#### Advanced Analytics

  

| Method | Endpoint | Description |

|--------|----------|-------------|

| `GET` | `/admin/analytics/stats` | Get admin-level KPI cards |

| `GET` | `/admin/analytics/user-activity` | Get user activity chart data (sessions by day) |

| `GET` | `/admin/analytics/top-jobs` | Get top requested job titles |

| `GET` | `/admin/analytics/daily-applications` | Get daily applications count over 30 days |

| `GET` | `/admin/analytics/success-rate` | Get auto-apply success/fail/pending distribution |

  

#### System Settings

  

| Method | Endpoint | Description |

|--------|----------|-------------|

| `GET` | `/admin/settings` | Get all system settings |

| `PATCH` | `/admin/settings` | Update system settings |

| `POST` | `/admin/settings/test-smtp` | Send a test email to verify SMTP config |

| `POST` | `/admin/settings/factory-reset` | Reset all settings to default (Super Admin) |

| `DELETE` | `/admin/settings/clear-logs` | Delete all activity logs from DB (Super Admin) |

  

---

  

## 8. External Integrations

  

### 8.1 Google Gmail API (OAuth2)

  

**Purpose:** Send application emails on behalf of users using their own Gmail identity.

  

**OAuth2 Scopes Required:**

- `https://www.googleapis.com/auth/gmail.send`

  

**Flow:**

1. User clicks "Connect Gmail" → backend generates OAuth URL

2. User logs into Google and grants permission

3. Google redirects to callback URL with authorization code

4. Backend exchanges code for `access_token` + `refresh_token`

5. Tokens are encrypted and stored in DB

6. On each email send, backend uses stored token to call `gmail.users.messages.send`

7. If `access_token` is expired, use `refresh_token` to get a new one silently

  

**Token Storage:**

- Tokens are AES-256 encrypted before storing in DB

- Refresh tokens are long-lived (until user disconnects or revokes)

  

---

  

### 8.2 Web Scrapers

  

**Scraper Sources Summary:**

  

| # | Name | URL | Language |

|---|------|-----|----------|

| 1 | Wzayf | https://wzayf22.blogspot.com/?m=1 | Arabic |

| 2 | Ewdifh | https://www.ewdifh.com/ | Arabic |

| 3 | Wdeftksa | https://www.wdeftksa.com/ | Arabic |

| 4 | Jobs-1 | https://www.jobs-1.com/ | Arabic |

| 5 | LinkedKSA | https://linkedksa.com/ | Arabic |

| 6 | SaudiJobs24 | https://www.saudijobs24.com/ | Arabic |

| 7 | Wazaef.net | https://wazaef.net/ | Arabic |

| 8 | Jbscv | https://jbscv.com/ | Arabic |

| 9 | Saudia Jobs | https://saudia.jobs | Arabic |

| 10 | Wadhefa | https://www.wadhefa.com | Arabic |

| 11 | SaudiJobs.in | https://saudijobs.in | English |

  

**Anti-Scraping Handling:**

- Rotate user-agent strings

- Implement rate limiting / delays between requests

- Retry on timeout with exponential backoff

- Headless browser (Playwright) for JavaScript-rendered pages

  

---

  

### 8.3 Email Tracking (Tracking Pixel)

  

**Implementation:**

```html

<img src="https://api.Kafoo.sa/v1/track/open/{unique_token}"

     width="1" height="1" style="display:none;" />

```

  

- `unique_token` is a UUID tied to the specific `application` record in DB

- When email is opened and image is fetched, endpoint updates application status to `email_opened`

- Open timestamp is recorded in `applications.opened_at`

  

---

  

### 8.4 BullMQ + Redis (Job Queue & Scheduler)

  

**Purpose:** Manage the email sending pipeline as a reliable, distributed job queue. Supports both immediate sending and user-defined scheduled sends.

  

**Role in the System:**

  

| Queue Name | Purpose |

|------------|---------|

| `email-send-queue` | Holds all pending application email jobs (immediate + scheduled) |

| `scraper-queue` | Schedules and triggers scraper runs at configured intervals |

  

**Email Send Queue Behavior:**

  

- When a user triggers Auto-Apply (send now), each application is added to `email-send-queue` with `delay = 0`

- When a user schedules a send, each application is added with `delay = scheduledAt - Date.now()`

- BullMQ workers pick up jobs from the queue, call the Gmail API, and update the application status in the DB

- Failed jobs are retried up to **3 times** with exponential backoff:

  - Attempt 1: retry after 30 seconds

  - Attempt 2: retry after 2 minutes

  - Attempt 3: retry after 10 minutes

- After 3 failed attempts, job is moved to the **failed** state and application status is set to `failed`

  

**Scraper Queue Behavior:**

  

- The scraper scheduler is registered as a BullMQ **repeatable job**

- Default repeat interval: every 30 minutes (configurable from admin settings)

- When triggered, the scraper worker fetches job pages and sends HTML to the LLM API

- Admin can manually trigger a scraper run via the "Run Now" button, which adds an immediate job to `scraper-queue`

  

**Redis Configuration:**

- Redis is the backing store for all BullMQ queues

- Stores job state: waiting, active, completed, failed, delayed

- Redis connection uses TLS in production

  

**Key BullMQ Job Payload — Email Send:**

```json

{

  "applicationId": "uuid",

  "userId": "uuid",

  "jobId": "uuid",

  "cvUrl": "https://storage.Kafoo.sa/cvs/uuid.pdf",

  "emailSubject": "Application for Software Developer — Mohamed Ali",

  "emailBody": "Dear STC Team,\n\nI am applying for Software Developer...",

  "recipientEmail": "hr@stc.com.sa",

  "trackingToken": "uuid"

}

```

  

---

  

### 8.5 LLM API (AI-Powered Job Parsing)

  

**Purpose:** After the scraper fetches a job listing page, the raw HTML of each job container is sent to an LLM API. The LLM extracts and returns a clean, structured JSON object containing all job details.

  

**Why LLM Instead of CSS Selectors:**

- Job board HTML structures vary across sources and change over time

- LLM handles Arabic text, inconsistent markup, and varying formats without needing per-source custom parsers

- Single unified parsing pipeline for all 11 sources

  

**Input: Job Listing HTML Container**

  

The scraper extracts the HTML of each individual job listing block. Example structure (from a typical source):

  

```html

<div class="single_job_listing">

  <ul class="job-listing-meta meta">

    <li class="location">

      <a href="...">السعودية</a>

    </li>

    <li class="date-posted">

      <time datetime="2025-12-31">تم نشرها منذ 3 أشهر</time>

    </li>

  </ul>

  

  <div class="company">

    <img class="company_logo" src="https://example.com/logo.jpg" alt="مستشفى دلة">

    <div class="company_header">

      <p class="name"><strong>مستشفى دلة</strong></p>

    </div>

  </div>

  

  <div class="job_description">

    <p>أعلنت مستشفى دلة في السعودية، عن فتح باب التقديم لشغل الوظائف التالية:</p>

    <ul>

      <li>منسق مركز اتصال</li>

      <li>مشرف خدمات التدبير المنزلي</li>

      <li>ممرض/ة في العيادات الخارجية</li>

      <!-- ... more titles ... -->

    </ul>

  </div>

  

  <div class="job_application application">

    <div class="application_details">

      <p>To apply for this job please visit

        <a href="https://careers.dallahhealth.com/jobs">careers.dallahhealth.com</a>.

      </p>

    </div>

  </div>

</div>

```

  

**LLM Prompt Structure:**

  

```

You are a job data extractor. Given the following HTML of a single job listing,

extract the structured data and return a valid JSON object with these fields.

If a field is not found in the HTML, return null for that field.

  

HTML:

<...raw job listing HTML...>

  

Return only valid JSON. No explanation.

```

  

**Expected LLM Output (Structured JSON):**

  

```json

{

  "company_name": "مستشفى دلة",

  "company_logo_url": "https://example.com/logo.jpg",

  "location": "السعودية",

  "posted_at": "2025-12-31",

  "description": "أعلنت مستشفى دلة في السعودية، عن فتح باب التقديم لشغل الوظائف التالية:",

  "job_titles": [

    "منسق مركز اتصال",

    "مشرف خدمات التدبير المنزلي",

    "ممرض/ة في العيادات الخارجية",

    "مسؤول أنظمة أول",

    "مساعد تخطيط وتحليل مالي",

    "مهندس اتصالات أول",

    "منسق التأمين الطبي",

    "مدير بيئي",

    "مشغل بدالة هاتفية",

    "أخصائي مختبر",

    "منسق صيدلية",

    "منسق الرعاية المنزلية",

    "أخصائي مكافحة العدوى",

    "مهندس ميكانيكي",

    "أخصائي علاج طبيعي",

    "مهندس معماري",

    "سائق",

    "أخصائي علاج النطق واللغة"

  ],

  "application_url": "https://careers.dallahhealth.com/jobs",

  "hr_email": null

}

```

  

**Post-Parsing Logic:**

- If `job_titles` contains more than one title, the backend creates **one job record per title** in the `jobs` table, all sharing the same `company_name`, `location`, `description`, and `application_url`

- If `hr_email` is `null`, the job is still stored but the Auto-Apply button is disabled for that job

- LLM call failures are logged as `WARN` and that listing is skipped (not blocking the rest of the scraper run)

  

**LLM Provider Configuration (Admin Settings):**

  

| Setting | Description |

|---------|-------------|

| API Provider | e.g., OpenAI, Gemini, or other compatible API |

| Model | e.g., `gpt-4o-mini`, `gemini-1.5-flash` |

| API Key | Encrypted and stored in system settings |

| Max Tokens | Limit per parsing call (default: 1000 tokens) |

| Timeout | Max wait time per LLM call (default: 15 seconds) |

  

---

  

## 9. Data Models

  

### 9.1 Users Table

```sql

users (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name       VARCHAR(255) NOT NULL,

  email           VARCHAR(255) UNIQUE NOT NULL,

  phone           VARCHAR(20),

  password_hash   TEXT NOT NULL,

  role            ENUM(\'user\', \'admin\', \'super_admin\') DEFAULT \'user\',

  status          ENUM(\'active\', \'suspended\', \'unverified\') DEFAULT \'unverified\',

  email_verified  BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMP DEFAULT NOW(),

  updated_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.2 Gmail Tokens Table

```sql

gmail_tokens (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,

  gmail_email     VARCHAR(255) NOT NULL,

  access_token    TEXT NOT NULL,  -- AES-256 encrypted

  refresh_token   TEXT NOT NULL,  -- AES-256 encrypted

  expires_at      TIMESTAMP,

  created_at      TIMESTAMP DEFAULT NOW(),

  updated_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.3 Jobs Table

```sql

jobs (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title           VARCHAR(255) NOT NULL,

  company_name    VARCHAR(255) NOT NULL,

  company_logo_url TEXT,

  location        VARCHAR(255),

  hr_email        VARCHAR(255),               -- nullable; Auto-Apply disabled if null

  description     TEXT,

  application_url TEXT,                       -- external apply link from LLM output

  source          ENUM(

                    \'wzayf\', \'ewdifh\', \'wdeftksa\', \'jobs1\',

                    \'linkedksa\', \'saudijobs24\', \'wazaef\',

                    \'jbscv\', \'saudiajobs\', \'wadhefa\', \'saudijobsin\'

                  ) NOT NULL,

  source_url      TEXT,

  language        ENUM(\'ar\', \'en\') DEFAULT \'ar\',

  posted_at       TIMESTAMP,

  scraped_at      TIMESTAMP DEFAULT NOW(),

  is_expired      BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.4 Saved Jobs Table

```sql

saved_jobs (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,

  job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,

  saved_at        TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, job_id)

)

```

  

### 9.5 CVs Table

```sql

cvs (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,

  file_name       VARCHAR(255) NOT NULL,

  file_url        TEXT NOT NULL,

  file_size_kb    INTEGER,

  is_default      BOOLEAN DEFAULT FALSE,

  uploaded_at     TIMESTAMP DEFAULT NOW()

)

```

  

### 9.6 Email Templates Table

```sql

email_templates (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,

  name            VARCHAR(255) NOT NULL,

  subject         VARCHAR(255),

  body            TEXT NOT NULL,

  created_at      TIMESTAMP DEFAULT NOW(),

  updated_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.7 Applications Table

```sql

applications (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,

  job_id          UUID REFERENCES jobs(id),

  cv_id           UUID REFERENCES cvs(id),

  tracking_token  UUID UNIQUE DEFAULT gen_random_uuid(),

  status          ENUM(

                    \'scheduled\', \'sending\', \'sent\', \'failed\', \'email_opened\'

                  ) DEFAULT \'scheduled\',

  scheduled_at    TIMESTAMP,                  -- null = send immediately

  sent_at         TIMESTAMP,

  opened_at       TIMESTAMP,

  bullmq_job_id   TEXT,                       -- BullMQ job ID for cancellation

  retry_count     INTEGER DEFAULT 0,

  error_message   TEXT,

  created_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.8 Notifications Table

```sql

notifications (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title           VARCHAR(255) NOT NULL,

  body            TEXT NOT NULL,

  type            ENUM(\'success\', \'warning\', \'alert\') DEFAULT \'success\',

  target          ENUM(\'all\', \'admin\') DEFAULT \'all\',

  target_user_id  UUID REFERENCES users(id),

  is_read         BOOLEAN DEFAULT FALSE,

  sent_by_admin   UUID REFERENCES users(id),

  sent_at         TIMESTAMP,

  created_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.9 Activity Logs Table

```sql

activity_logs (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_type      VARCHAR(100) NOT NULL,

  actor_id        UUID,

  actor_type      ENUM(\'user\', \'admin\', \'system\') DEFAULT \'system\',

  description     TEXT,

  severity        ENUM(\'info\', \'warn\', \'error\') DEFAULT \'info\',

  metadata        JSONB,

  created_at      TIMESTAMP DEFAULT NOW()

)

```

  

### 9.10 System Settings Table

```sql

system_settings (

  key             VARCHAR(100) PRIMARY KEY,

  value           TEXT NOT NULL,

  updated_by      UUID REFERENCES users(id),

  updated_at      TIMESTAMP DEFAULT NOW()

)

```

  

---

  

## 10. Non-Functional Requirements

  

### 10.1 Performance

  

| Metric | Target |

|--------|--------|

| API response time | < 300ms for 95% of requests |

| Scraper full run duration | < 10 minutes per cycle |

| LLM parsing time per listing | < 15 seconds (timeout) |

| Dashboard load time | < 1 second |

| Concurrent users supported | Up to 10,000 |

  

### 10.2 Scalability

- Backend must be horizontally scalable (stateless services)

- BullMQ workers can be scaled horizontally — multiple worker instances process the same queue concurrently

- Redis must be deployed in a persistent, high-availability configuration (e.g., Redis Sentinel or Redis Cluster)

- Database must support read replicas for high-traffic analytics queries

  

### 10.3 Availability

- Target uptime: 99.5% (excluding scheduled maintenance)

- Maintenance windows must trigger the Maintenance Mode setting

- Automated health checks every 60 seconds

  

### 10.4 Data Retention

  

| Data Type | Retention Period |

|-----------|-----------------|

| Application records | 1 year |

| Activity logs | 90 days (configurable) |

| Deleted user data | Purged within 30 days |

| BullMQ completed jobs | Auto-removed after 24 hours |

| BullMQ failed jobs | Kept for 7 days for debugging |

  

---

  

## 11. Security Requirements

  

| Requirement | Detail |

|-------------|--------|

| Password Hashing | bcrypt with salt rounds ≥ 12 |

| Transport Security | HTTPS only, TLS 1.2+ |

| Token Encryption | Gmail OAuth2 tokens AES-256 encrypted in DB |

| LLM API Key | Stored encrypted in system_settings, never exposed in API responses |

| JWT Rotation | JWT secrets rotated every 90 days |

| Input Validation | Whitelist approach on all endpoints |

| SQL Injection | Parameterized queries / ORM enforced |

| CORS Policy | Allow only trusted frontend domains |

| Admin Access | Role-based + optional IP whitelist |

| Tracking Pixel | Endpoint must not expose any user data |

| Redis Security | Password-protected + TLS in production |

  

**Rate Limiting:**

  

| Scope | Limit |

|-------|-------|

| Auth endpoints | 10 requests/minute per IP |

| Email send endpoints | 50 emails/day per user |

| General API | 100 requests/minute per user |

  

---

  

## 12. Constraints & Assumptions

  

### Constraints

  

| Constraint | Detail |

|------------|--------|

| Gmail API daily limit | 500 emails/day per Google account (platform enforces 50/day per user) |

| Scraping legality | Subject to each website\'s Terms of Service — legal review recommended |

| Open rate reliability | Unreliable when email clients block external images — disclosed to users |

| OAuth2 token revocation | Refresh tokens can be revoked by user from Google account at any time |

| LLM API cost | Each scraper run generates one LLM call per job listing — token usage must be monitored |

| LLM accuracy | Parsed output should be validated before insertion; malformed JSON is discarded |

  

### Assumptions

  

- All target companies in the Saudi market have publicly listed or scrapeable HR contact emails

- Users own and control the Gmail accounts they connect

- The platform is not responsible for HR response rates

- Platform operates under Saudi data privacy regulations (**PDPL — Personal Data Protection Law**)

- LLM provider maintains sufficient uptime; scraper runs are not blocked if LLM is temporarily unavailable

  

---

  

---

  

## 13. Technology Stack

  

This section documents all technologies, frameworks, and libraries used across the entire Kafoo' platform. The project is structured as a **monorepo** using **Turborepo** with **pnpm workspaces**.

  

---

  

### 13.1 Monorepo Structure

  

```

Kafoo/

├── apps/

│   ├── api/          → NestJS backend (REST API + BullMQ workers)

│   ├── web/          → React user portal (frontend)

│   └── admin/        → React admin panel (frontend)

├── packages/

│   ├── types/        → Shared TypeScript types and interfaces

│   └── config/       → Shared ESLint, Prettier, and TS config

├── package.json

├── turbo.json

└── pnpm-workspace.yaml

```

  

| Tool | Purpose |

|------|---------|

| **Turborepo** | Monorepo build system — caches and pipelines tasks across apps |

| **pnpm Workspaces** | Package manager for monorepo dependency management |

| **TypeScript** | Primary language across all apps (strict mode enabled) |

  

---

  

### 13.2 Backend — `apps/api`

  

**Runtime & Framework:**

  

| Library | Version | Purpose |

|---------|---------|---------|

| **Node.js** | ≥ 20 | JavaScript runtime |

| **Express.js** | latest | Underlying HTTP server |

  

**Database:**

  

| Library | Purpose |

|---------|---------|

| **PostgreSQL** | Primary relational database |

| **Prisma ORM** | Type-safe database client, schema management, and migrations |

  

**Authentication & Security:**

  

| Library | Purpose |

|---------|---------|

| **passport** | Passport.js integration |

| **passport-jwt** | JWT strategy for protected routes |

| **jwt** | JWT token generation and verification |

| **bcrypt** | Password hashing (salt rounds ≥ 12) |

| **zod** | Request body validation |

  

**Job Queue & Scheduling:**

  

| Library | Purpose |

|---------|---------|

| **BullMQ** | Job queue for email sending and scraper scheduling |

| **ioredis** | Redis client — backing store for BullMQ |

  
  

**Web Scraping:**

  

| Library | Purpose |

|---------|---------|

| **Axios** | HTTP GET requests to job board pages |

| **Cheerio** | Server-side HTML parsing and DOM selection (like jQuery for Node.js) |

| **Playwright** | Headless browser for JavaScript-rendered pages |

  

**AI / LLM Integration:**

  

| Library | Purpose |

|---------|---------|

| **openai** (or compatible SDK) | LLM API client — sends extracted HTML, receives structured JSON |

  

**Email Sending:**

  

| Library | Purpose |

|---------|---------|

| **googleapis** | Google Gmail API client for OAuth2 token exchange and email sending |

| **nodemailer** | Platform SMTP email sending (system notifications, registration confirmation) |

  

**Utilities:**

  

| Library | Purpose |

|---------|---------|

| **uuid** | UUID generation for tokens and IDs |

| **dayjs** | Date/time parsing and formatting |

| **dotenv** | Environment variable management |

  

---

  

### 13.3 Frontend — `apps/web` & `apps/admin`

  

Both the user portal and admin panel share the same frontend stack.

  

**Core:**

  

| Library | Purpose |

|---------|---------|

| **React 18** | UI library |

| **Vite** | Build tool and dev server |

| **TypeScript** | Type-safe frontend code |

| **React Router v6** | Client-side routing and navigation |

  

**Data Fetching & State:**

  

| Library | Purpose |

|---------|---------|

| **TanStack Query (React Query)** | Server state management, caching, and API calls |

| **Axios** | HTTP client for API requests |

| **Zustand** | Lightweight global client-side state management |

  

**Forms & Validation:**

  

| Library | Purpose |

|---------|---------|

| **React Hook Form** | Form state and submission handling |

| **Zod** | Schema validation for form inputs |

| **@hookform/resolvers** | Connects Zod schemas to React Hook Form |

  

**UI & Styling:**

  

| Library | Purpose |

|---------|---------|

| **Tailwind CSS** | Utility-first CSS framework |

| **shadcn/ui** | Accessible UI component library built on Radix UI |

  

**Charts:**

  

| Library | Purpose |

|---------|---------|

| **Recharts** | Chart library for dashboard bar charts, line charts, and status distributions |

  
  

---

  

### 13.4 Environment Variables Summary

  

| Variable | App | Description |

|----------|-----|-------------|

| `DATABASE_URL` | api | PostgreSQL connection string (Prisma) |

| `REDIS_URL` | api | Redis connection string for BullMQ |

| `JWT_SECRET` | api | Secret for signing access tokens |

| `JWT_REFRESH_SECRET` | api | Secret for signing refresh tokens |

| `GOOGLE_CLIENT_ID` | api | Google OAuth2 app client ID |

| `GOOGLE_CLIENT_SECRET` | api | Google OAuth2 app client secret |

| `GOOGLE_REDIRECT_URI` | api | OAuth2 callback URL |

| `SMTP_EMAIL` | api | Sender email for platform system notifications |

| `LLM_API_KEY` | api | API key for the LLM provider (encrypted at rest) |

| `LLM_MODEL` | api | LLM model name (e.g., gpt-4o-mini) |

| `VITE_API_URL` | web/admin | Base URL of the backend API |

  

---

  

*End of SRS Document*

  

*Kafoo\' Platform v1.0.3 — Confidential*

*Generated: April 2026*
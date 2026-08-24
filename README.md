# 🏢 Society Maintenance Tracker

A production-grade, full-stack residential society maintenance management platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. 

Society Maintenance Tracker streamlines the complaint lifecycle from submission to resolution with immutable chronological audit trails, dynamic SLA overdue detection, role-based access control, photo attachments, emergency notice board broadcasting, and automated email dispatch.

---

## 🌟 Key Features

### 👤 Resident Experience
- **Self-Service Registration & Authentication**: Secure registration with unit/flat number, email, and password.
- **Complaint Submission**: File maintenance tickets with predefined categories, detailed descriptions, and supporting photo uploads (up to 5MB, JPG/PNG/WEBP/GIF).
- **Live Ticket Tracker & Timeline**: Track real-time status transitions (`OPEN` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`) and review immutable admin notes.
- **Strict Data Isolation**: Residents can only view, query, and interact with their own maintenance tickets.
- **Notice Board**: Access community announcements, maintenance schedules, and pinned emergency alerts.

### 🛡️ Administrator Operations Console
- **Executive Analytics Dashboard**: Instant visibility into 6 core KPIs (Total Tickets, Open, In Progress, Resolved, Overdue Tickets, High Priority), status distribution bars, and category workload breakdowns.
- **Configurable Overdue Detection**: Dynamically flags aging unresolved tickets exceeding the configurable SLA threshold (default: 3 days). Resolved tickets are automatically cleared from overdue counts.
- **Triage & Status Control**: Transition ticket lifecycles, reassign priorities (`LOW`, `MEDIUM`, `HIGH`), and log mandatory/optional resolution notes.
- **Notice Management & Email Broadcast**: Publish notices with a 1-click option to pin to the top and automatically dispatch email broadcasts to all registered residents.
- **System Policy Configuration**: Adjust overdue SLA thresholds, default new ticket priority, society address, and support desk contact details.

### 📨 Notification & Storage Systems
- **Automated Email Dispatch**: Powered by **Resend** with HTML email templates and an integrated development mock logger that logs formatted previews to console without requiring external API keys.
- **Validated Photo Storage**: Multipart photo uploads with client & server MIME-type validation and storage adapter.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism Theme |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with SQLite (zero-config local) / PostgreSQL compatible |
| **Authentication** | JWT session cookies (`jose`), [bcryptjs](https://github.com/dcodeIO/bcrypt.js) hashing |
| **Email Service** | [Resend](https://resend.com/) API with structured development fallback |
| **Validation** | [Zod](https://zod.dev/) |

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Society-Maintanence-Tracker
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration (ready for local development):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-token-key-for-development-society-tracker-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCIETY_NAME="Greenwood Heights Residents Association"
RESEND_API_KEY=""
EMAIL_FROM="Greenwood Heights Maintenance <notifications@resend.dev>"
STORAGE_PROVIDER="local"
```

### 4. Initialize Database & Seed Demo Data
```bash
# Push schema and generate Prisma client
npx prisma generate
npx prisma db push

# Seed sample users, overdue tickets, audit timelines, and notices
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Credentials

The database seed provides pre-configured demo accounts for both roles:

| Role | Email | Password | Flat / Unit |
|---|---|---|---|
| **Administrator** | `admin@society.com` | `Admin@123` | Admin Office - G01 |
| **Resident 1** | `resident@society.com` | `Resident@123` | Tower A - 402 |
| **Resident 2** | `sarah@society.com` | `Resident@123` | Tower B - 105 |
| **Resident 3** | `robert@society.com` | `Resident@123` | Villa 12 |

> 💡 *Tip: The login page includes quick 1-click demo autofill buttons for Admin and Resident.*

---

## 📁 Project Architecture

```
Society-Maintanence-Tracker/
├── prisma/
│   ├── schema.prisma            # Prisma schema (User, Complaint, ComplaintHistory, Notice, Config)
│   └── seed.ts                  # Database seeding script with overdue tickets & sample data
├── public/
│   └── uploads/                 # Local directory for uploaded complaint photos
├── src/
│   ├── app/
│   │   ├── api/                 # REST API Route Handlers
│   │   │   ├── auth/            # Login, register, logout, me
│   │   │   ├── complaints/      # List, create, get by id, update status/priority, history
│   │   │   ├── notices/         # Notice CRUD & broadcast
│   │   │   ├── settings/        # System configuration & threshold editor
│   │   │   ├── stats/           # Admin & resident KPI telemetry
│   │   │   └── upload/          # Multipart photo upload endpoint
│   │   ├── resident/            # Resident Portal pages (Dashboard, Complaints, New, Notices, Profile)
│   │   ├── admin/               # Admin Console pages (Dashboard, Complaints, Detail, Notices, Settings)
│   │   ├── login/               # Sign In page with 1-click demo autofill
│   │   ├── register/            # Resident Registration page
│   │   ├── layout.tsx           # Root layout with Tailwind fonts
│   │   ├── globals.css          # Design system, glassmorphism, custom scrollbars
│   │   └── page.tsx             # Public landing page
│   ├── components/
│   │   ├── ui/                  # Button, Badge, Card, Input, Modal, StatCard, Spinner
│   │   ├── layout/              # Navbar, Sidebar, Navigation
│   │   ├── complaints/          # HistoryTimeline, PhotoUploadPreview, StatusModal, PriorityModal
│   │   ├── notices/             # NoticeCard, NoticeFormModal
│   │   ├── dashboard/           # AnalyticsOverview, category breakdown
│   │   └── common/              # EmptyState, ConfirmDialog, ImageLightbox
│   ├── lib/
│   │   ├── auth.ts              # Password hashing, JWT cookie sessions, route authorization
│   │   ├── prisma.ts            # Singleton Prisma client instance
│   │   ├── overdue.ts           # Dynamic derived overdue calculation engine
│   │   ├── email.ts             # Resend API integration + dev mock fallback
│   │   ├── storage.ts           # Upload handling & MIME validation
│   │   ├── constants.ts         # Categories, statuses, priorities, default config
│   │   └── utils.ts             # Tailwind merge, date formatting, age helpers
│   ├── middleware.ts            # Route gating & role redirect middleware
│   └── types/                   # TypeScript type definitions & API contracts
├── scripts/
│   ├── test-integration.ts      # Automated unit and business logic test suite
│   └── test-e2e-http.ts         # Live HTTP server end-to-end integration test suite
├── docs/
│   ├── SYSTEM_DESIGN.md         # System design architecture document
│   ├── API_DOCUMENTATION.md     # Complete REST API specifications
│   └── DATABASE_SCHEMA.md       # Relational schema and ER documentation
├── PROJECT_COMPLETION_CHECKLIST.md # Audit verification matrix
└── package.json
```

---

## 🧪 Testing

### 1. Run Automated Unit & Logic Integration Tests
```bash
npm run test:integration
# or
npx tsx scripts/test-integration.ts
```
Verifies:
- Password hashing & authentication validation
- Overdue threshold derivation logic & resolved status immunity
- Complaint lifecycle status transitions & immutable history audit logs
- Notice board pinned sorting
- Email service development fallback
- System configuration persistence

### 2. Run Live HTTP End-to-End Server Tests
Ensure the dev server is running on `http://localhost:3000`, then run:
```bash
npx tsx scripts/test-e2e-http.ts
```
Executes 33 comprehensive API and workflow assertions verifying registration, login, resident isolation, photo uploads, admin status transitions, email triggers, and settings updates.

---

## 🚢 Deployment Guide

### Deploying to Vercel & Supabase PostgreSQL

1. **Database**: Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. **Environment Variables**:
   In your Vercel Project Settings &rarr; Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string (`postgresql://postgres:...@...:5432/postgres?sslmode=require`)
   - `JWT_SECRET`: A secure 32+ character string
   - `NEXT_PUBLIC_APP_URL`: Your production URL (`https://your-domain.vercel.app`)
   - `NEXT_PUBLIC_SOCIETY_NAME`: Name of your residential association
   - `RESEND_API_KEY`: (Optional) Free API key from [resend.com](https://resend.com)
   - `EMAIL_FROM`: Your verified sending domain email (e.g. `notifications@yourdomain.com`)
3. **Database Migration**:
   In `prisma/schema.prisma`, update provider to `postgresql`, then run `npx prisma db push` or `npx prisma migrate deploy`.
4. **Deploy**:
   Push to your GitHub repository and import into Vercel.

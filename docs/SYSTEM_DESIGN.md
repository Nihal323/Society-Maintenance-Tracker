# 📐 System Design Document: Society Maintenance Tracker

## 1. Executive Architecture Overview

Society Maintenance Tracker is a full-stack, multi-tenant residential property management system built on **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. The platform cleanly decouples the resident self-service portal from the administrator resolution console while sharing a centralized relational database, authentication layer, and notification engine.

```
[ Resident Client / Admin Console ]
                 │ (HTTPS / Session Cookies)
                 ▼
     [ Next.js Middleware ] ── (JWT Verification & Role Gating)
                 │
  ┌──────────────┴──────────────┐
  ▼                             ▼
[ Server Actions & API Handlers ] ──── [ Photo Storage Layer ] (public/uploads)
  │             │               │
  ▼             ▼               ▼
[ Prisma ORM ] [ Overdue Engine ] [ Email Dispatcher ] (Resend + Dev Logger)
  │
  ▼
[ Relational Database ] (SQLite / PostgreSQL)
```

---

## 2. Authentication & Server-Side Authorization

The application enforces a dual-role access control model: `RESIDENT` and `ADMIN`.

1. **Session Management**: Session tokens are cryptographically signed using HS256 JWTs (`jose`) with a 7-day expiration and issued over `HttpOnly`, `SameSite=Lax` secure cookies (`society_session`).
2. **Middleware & Route Gating**: `src/middleware.ts` intercepts requests. Unauthenticated users are redirected to `/login`, while residents attempting to access `/admin/*` routes receive immediate redirection or `403 Forbidden` responses.
3. **Data Isolation Layer**: At the database and API layer, every query executing on behalf of a resident explicitly binds `where: { residentId: session.id }`. Even if a malicious user manually requests `/api/complaints/[id]`, the API verifies record ownership before returning payload data.

---

## 3. Complaint State Machine & Immutable History

Complaints follow a strictly governed state transition lifecycle:

```
    ┌──────────┐
    │   OPEN   │ ◄─── Initial Submission (Default: Priority MEDIUM)
    └────┬─────┘
         │
         ├───► [ IN_PROGRESS ] ── (Technician Dispatched / In Review)
         │           │
         ▼           ▼
    ┌──────────────────┐
    │     RESOLVED     │ ── (Sets resolvedAt timestamp; exempt from Overdue)
    └──────────────────┘
```

### Immutable History Model
State changes never overwrite past telemetry. Every status update, priority escalation, or administrative remark atomically commits an immutable row into the `ComplaintHistory` table:
- `complaintId`: Target complaint reference
- `previousStatus` & `newStatus`: Exact transition state
- `actorId`: Administrator or resident who triggered the action
- `note`: Administrative rationale or progress summary
- `timestamp`: High-precision DateTime

Chronological queries reconstruct the entire life history as a continuous visual timeline for both parties.

---

## 4. Dynamic Overdue Detection Engine

Unlike static databases that store stale boolean flags, overdue status is dynamically derived:

$$\text{isOverdue} = (\text{status} \neq \text{'RESOLVED'}) \land \left(\frac{\text{Now} - \text{createdAt}}{86400 \times 1000} \ge \text{OVERDUE\_THRESHOLD\_DAYS}\right)$$

### Key Design Principles:
1. **Zero Data Staleness**: Changing the configuration threshold (e.g. from 3 days to 5 days) instantly updates overdue status across the entire database without running batch updates.
2. **Resolution Immunity**: Once a complaint enters the `RESOLVED` state, its overdue flag is permanently false.
3. **Admin Escalation**: Overdue complaints are automatically flagged with pulsating badges and surfaced on the admin dashboard.

---

## 5. Storage & Multipart Photo Pipeline

To protect relational database performance, binary image blobs are not stored in table records:
- **Validation**: Incoming uploads are validated on the server for MIME type (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and file size ($\le 5\text{MB}$).
- **Disk Storage**: Files are written to `/public/uploads/` using sanitized, collision-resistant unique filenames.
- **Relational Reference**: Only the resulting public URL (`/uploads/complaint_*.webp`) is stored in `Complaint.photoUrl`.
- **Lightbox UI**: Complaint views render photo thumbnails with full-screen lightbox inspection and fallback handling.

---

## 6. Notification Dispatch Architecture

Notifications are decoupled into reusable service functions in `src/lib/email.ts`:
1. **Complaint Status Update**: When an admin modifies complaint status, an email is dispatched to the resident containing old status, new status, society name, admin notes, and a direct deep link.
2. **Important Notice Broadcast**: When an admin publishes an announcement with `isPinned: true`, the system queries all registered resident emails and dispatches an announcement broadcast.
3. **Resilience Fallback**: If `RESEND_API_KEY` is not configured in `.env`, the system logs formatted HTML mock previews to the server log rather than failing or halting execution.

---

## 7. Major Design Decisions & Trade-offs

1. **Prisma ORM with SQLite Default & PostgreSQL Ready**: Enables instant, zero-configuration local development while remaining 100% compatible with production Supabase/Neon PostgreSQL via standard database connection strings.
2. **Derived Overdue vs. Cron Jobs**: Deriving overdue status in real-time eliminates complex cron worker dependencies and prevents timing race conditions.
3. **Custom JWT Sessions vs. External Auth Services**: Self-contained JWT authentication gives 100% control over user roles, seeding, and offline development without third-party rate limits.

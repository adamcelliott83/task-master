# Security & Architecture Notes

This document records security decisions already implemented, outstanding hardening work, and known architectural pitfalls for this application.

---

## Security: What Is Already Implemented

### Authentication & Passwords
- Passwords are hashed with **bcrypt at cost factor 12** via `bcryptjs` before storage — never stored in plaintext.
- Sessions use **JWT** (stateless) via NextAuth.js — no server-side session table needed.
- The `AUTH_SECRET` environment variable signs all JWTs; rotating it immediately invalidates all sessions.

### Authorization & Data Isolation
- Every API route calls `getAuthenticatedUserId()` (`src/lib/api-helpers.ts`) and returns 401 if no valid session exists.
- Every database query includes `userId` in the `WHERE` clause — users can never read or modify another user's data, even if they guess a resource ID.
- Ownership is verified before any update or delete (fetch-then-check pattern).

### Input Validation
- All API inputs are parsed through **Zod schemas** (`src/schemas/`) at the route boundary before touching the database.
- This prevents bad types, oversized strings, invalid enums, and malformed dates from reaching Prisma.
- Prisma uses **parameterized queries** exclusively — no raw SQL, so SQL injection is not possible through normal usage.

### Secrets & Environment
- `.env` is listed in `.gitignore` and never committed.
- `.env.example` is committed with placeholder values only.
- Sensitive fields (`password`) are excluded from `select` in all API responses.

---

## Security: Outstanding Hardening (To Do Before Production)

| Item | Priority | Notes |
|---|---|---|
| **Rate limiting** on `/api/auth/register` and login | High | Prevent brute-force and account enumeration. Use `@upstash/ratelimit` or a middleware solution. |
| **Security headers** | High | Add `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` in `next.config.ts` via `headers()`. |
| **File upload size limit** | High | The Notion import endpoint accepts raw JSON with CSV content. Set a max body size (e.g. 1 MB) to prevent DoS via large payloads. |
| **CSRF protection on custom routes** | Medium | NextAuth handles CSRF for its own routes. Custom `POST` routes that accept cookies should verify the `Origin` header or use a CSRF token. |
| **Account enumeration prevention** | Medium | The register endpoint currently returns a distinct 409 for duplicate emails. Consider a generic "check your email" response in production. |
| **Dependency audit** | Medium | Run `npm audit` regularly; there are currently 6 flagged vulnerabilities (from transitive deps of next-pwa/workbox). Review and upgrade. |
| **OAuth provider hardening** | Low | If Google/GitHub OAuth is enabled, validate `hd` (hosted domain) if you want to restrict to a specific org. |
| **Audit logging** | Low | Log auth events (login, register, failed attempts) to a separate store for forensic purposes. |

---

## Architectural Pitfalls & How We Address Them

### 1. Recurring Task State Explosion
**Problem:** A daily recurring task generates one completion record per day. Over a year that's 365 rows per task — this compounds fast with many users.

**Our approach:** We use a `TaskCompletion` join table with a unique constraint on `(taskId, date)`. Records are only created when a user actually acts on a task (complete/skip/fail), not pre-generated for every future date. This keeps the table sparse.

**Watch out for:** Dashboard queries that scan all completions for a user across a wide date range without an index. Add a DB index on `(userId, date)` on `task_completions` before scaling.

---

### 2. Timezone Bugs
**Problem:** "Show me today's tasks" depends entirely on which timezone "today" is in. Storing everything as UTC and resolving in the API produces wrong results for users in UTC-5 at 11 PM (they're already on the "next day" server-side).

**Our approach:** API routes accept an explicit `date` query parameter (`YYYY-MM-DD`). The client passes the date based on the user's local time. The server never infers "today" from `new Date()` in a date-sensitive context.

**Watch out for:** Server-side `new Date()` calls in stats or completion logic — always prefer the client-supplied date.

---

### 3. Offline Sync Conflicts (PWA)
**Problem:** A user completes a task while offline. The service worker queues the request. When connectivity returns, if the task was also modified server-side (e.g. by another session), there's a conflict.

**Our approach:** We use **last-write-wins** via `upsert` on `TaskCompletion`. This is acceptable for a personal task tracker.

**Watch out for:** If multi-user collaboration on shared tasks is added later (e.g. delegating tasks), last-write-wins will cause data loss. At that point, implement optimistic locking (a `version` field on Task) or event sourcing.

---

### 4. Notification & Consequence Fatigue
**Problem:** If consequence alerts or push notifications fire too aggressively, users disable them or uninstall the app.

**Mitigations to implement:**
- Allow per-task notification mute/snooze
- Only surface consequence alerts at the end of the scheduled time chunk, not constantly
- Respect system Do Not Disturb via the Push/Notifications API `silent` flag

---

### 5. Task Creation Wizard Drop-off
**Problem:** Multi-step wizards with too many steps or no progress saving cause high abandonment rates.

**Our approach:** The wizard is limited to 4 steps. Wizard state is held in React state — if the user closes the modal, progress is lost (acceptable for creation, not for editing). Consider `sessionStorage` persistence if drop-off is a reported issue.

---

### 6. Notion CSV Format Drift
**Problem:** Notion periodically changes its CSV export column names and structure without notice.

**Our approach:** The parser in `src/lib/notion-parser.ts` uses optional chaining (`?.`) and fallbacks throughout. Missing or renamed columns produce `undefined` values that fall back to defaults rather than hard errors. The Zod schema for the import marks most fields as `.optional()`.

**Watch out for:** New required fields in the schema that break the optional-chaining fallback chain silently.

---

### 7. Query Performance at Scale
**Problem:** Loading a dashboard page that joins tasks + completions + time chunks + consequences for a user with thousands of tasks becomes slow without indexes.

**Indexes to add before scaling:**
```sql
-- Already implied by Prisma unique constraints:
--   task_completions(taskId, date)

-- Add these explicitly in a migration:
CREATE INDEX idx_tasks_user_type    ON tasks(userId, type);
CREATE INDEX idx_tasks_user_status  ON tasks(userId, status);
CREATE INDEX idx_completions_user_date ON task_completions(userId, date);
```

---

### 8. Recurrence Rule Complexity Creep
**Problem:** Starting with "pick days of the week" and then incrementally adding "2nd Tuesday of the month", "every 10 days", "weekdays only" leads to a half-implemented `RRULE` engine that's buggy and hard to test.

**Our approach:** Deliberately limited recurrence options — days of week for daily/weekly, week-of-month (1–4) for monthly. Any further recurrence needs should be evaluated holistically before adding, not bolted on.

# Tech Spec — Fitness Member Management Mini-MVP

## 1. Relational Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│   members    │       │  memberships  │       │    plans     │
├──────────────┤       ├───────────────┤       ├──────────────┤
│ id        PK │──┐    │ id         PK │    ┌──│ id        PK │
│ first_name   │  ├───>│ member_id  FK │    │  │ name         │
│ last_name    │  │    │ plan_id    FK │<───┘  │ description  │
│ email (UQ)   │  │    │ start_date    │       │ price_cents  │
│ phone        │  │    │ end_date      │       │ duration_days│
│ is_deleted   │  │    │ cancelled_at  │       │ is_active    │
│ created_at   │  │    │ status        │       │ created_at   │
│ updated_at   │  │    │ created_at    │       │ updated_at   │
└──────────────┘  │    │ updated_at    │       └──────────────┘
                  │    └───────────────┘
                  │    ┌───────────────┐
                  │    │   check_ins   │
                  │    ├───────────────┤
                  └───>│ member_id  FK │
                       │ membership_id │──> memberships.id
                       │ checked_in_at │
                       └───────────────┘
```

### `members`

| Column       | Type                     | Constraints                          |
|--------------|--------------------------|--------------------------------------|
| id           | UUID                     | PK, DEFAULT gen_random_uuid()        |
| first_name   | VARCHAR(100)             | NOT NULL                             |
| last_name    | VARCHAR(100)             | NOT NULL                             |
| email        | VARCHAR(255)             | NOT NULL, UNIQUE                     |
| phone        | VARCHAR(20)              | NULL                                 |
| is_deleted   | BOOLEAN                  | NOT NULL, DEFAULT FALSE              |
| created_at   | TIMESTAMPTZ              | NOT NULL, DEFAULT NOW()              |
| updated_at   | TIMESTAMPTZ              | NOT NULL, DEFAULT NOW()              |

**Triggers:** `trg_members_updated_at` — auto-updates `updated_at` on row changes.

### `plans`

| Column        | Type            | Constraints                          |
|---------------|-----------------|--------------------------------------|
| id            | UUID            | PK, DEFAULT gen_random_uuid()        |
| name          | VARCHAR(100)    | NOT NULL                             |
| description   | TEXT            | NULL                                 |
| price_cents   | INTEGER         | NOT NULL, CHECK (price_cents >= 0)   |
| duration_days | INTEGER         | NOT NULL, CHECK (duration_days > 0)  |
| is_active     | BOOLEAN         | NOT NULL, DEFAULT TRUE               |
| created_at    | TIMESTAMPTZ     | NOT NULL, DEFAULT NOW()              |
| updated_at    | TIMESTAMPTZ     | NOT NULL, DEFAULT NOW()              |

> **Note:** Price stored as integer cents to avoid floating-point precision issues.

**Triggers:** `trg_plans_updated_at` — auto-updates `updated_at` on row changes.

### `memberships`

| Column        | Type                                      | Constraints                                    |
|---------------|-------------------------------------------|------------------------------------------------|
| id            | UUID                                      | PK, DEFAULT gen_random_uuid()                  |
| member_id     | UUID                                      | NOT NULL, FK → members(id)                     |
| plan_id       | UUID                                      | NOT NULL, FK → plans(id)                       |
| start_date    | DATE                                      | NOT NULL                                       |
| end_date      | DATE                                      | NOT NULL (computed: start_date + duration_days) |
| cancelled_at  | DATE                                      | NULL                                           |
| status        | VARCHAR(20)                               | NOT NULL, CHECK IN ('active','cancelled','expired') |
| created_at    | TIMESTAMPTZ                               | NOT NULL, DEFAULT NOW()                        |
| updated_at    | TIMESTAMPTZ                               | NOT NULL, DEFAULT NOW()                        |

**CHECK Constraints:**
- `status_valid` — status must be one of: `'active'`, `'cancelled'`, `'expired'`
- `dates_valid` — `start_date < end_date`

**Indexes:**
- `idx_memberships_member_id` — B-tree on `member_id`
- `idx_memberships_member_active` — **Partial unique index**: `UNIQUE (member_id) WHERE status = 'active'`

**Triggers:** `trg_memberships_updated_at` — auto-updates `updated_at` on row changes.

> The partial unique index is the primary mechanism to enforce the "one active membership per member" business rule at the database level. Even under concurrent writes, Postgres will reject a duplicate.

### `check_ins`

| Column         | Type          | Constraints                          |
|----------------|---------------|--------------------------------------|
| id             | UUID          | PK, DEFAULT gen_random_uuid()        |
| member_id      | UUID          | NOT NULL, FK → members(id)           |
| membership_id  | UUID          | NOT NULL, FK → memberships(id)       |
| checked_in_at  | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()              |

**Indexes:**
- `idx_check_ins_member_id` — B-tree on `member_id`
- `idx_check_ins_checked_in_at` — B-tree on `checked_in_at` (for 30-day range queries)

**Triggers:** `trg_check_ins_validate_member` — validates that `member_id` matches the membership's `member_id` on INSERT.

---

## 2. API Endpoints

### Health

**GET /api/health** — Service health check

```
Response (200):
{ "status": "ok", "timestamp": "2026-02-10T14:30:00Z" }
```

### Members

**POST /api/members** — Create a member

```
Request:
{
  "firstName": "Lucia",
  "lastName": "Rodriguez",
  "email": "lucia@example.com",
  "phone": "+598 99 123 456"      // optional
}

Response (201):
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "firstName": "Lucia",
    "lastName": "Rodriguez",
    "email": "lucia@example.com",
    "phone": "+598 99 123 456",
    "createdAt": "2026-02-10T14:30:00Z"
  }
}

Error (409):
{ "success": false, "error": { "code": "MEMBER_EMAIL_EXISTS", "message": "A member with this email already exists" } }

Error (400):
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [{ "field": "email", "message": "Invalid email", "code": "invalid_string" }] } }
```

**GET /api/members?search=lucia&page=1&pageSize=20** — List/search members

```
Response (200):
{
  "success": true,
  "data": [
    { "id": "...", "firstName": "Lucia", "lastName": "Rodriguez", "email": "...", "phone": "...", "isDeleted": false, "createdAt": "...", "updatedAt": "..." }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 1, "totalPages": 1, "hasNextPage": false, "hasPreviousPage": false }
}
```

> Search uses `ILIKE` against first_name, last_name, and email with a single query parameter. Supports `sortBy` and `sortOrder` params. Soft-deleted members are excluded by default (`includeDeleted=true` to include).

**GET /api/members/:id** — Member profile/summary

```
Response (200):
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "firstName": "Lucia",
    "lastName": "Rodriguez",
    "email": "lucia@example.com",
    "phone": "+598 99 123 456",
    "membership": {
      "id": "m1m2m3-...",
      "planName": "Monthly Premium",
      "status": "active",
      "startDate": "2026-01-15",
      "endDate": "2026-02-14"
    },
    "lastCheckIn": "2026-02-10T08:15:00Z",
    "checkInsLast30Days": 12,
    "createdAt": "2025-12-01T10:00:00Z"
  }
}
```

> `membership` is `null` if no active membership exists. `lastCheckIn` is `null` if no check-ins recorded.

### Plans

**GET /api/plans** — List available plans (paginated)

```
Response (200):
{
  "success": true,
  "data": [
    { "id": "...", "name": "Basic Monthly", "description": "...", "priceCents": 2999, "durationDays": 30, "isActive": true }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 6, "totalPages": 1, "hasNextPage": false, "hasPreviousPage": false }
}
```

> Supports filtering by `isActive`, `search` (name/description), `sortBy`, and `sortOrder`.

**GET /api/plans/:id** — Get plan by ID

```
Response (200):
{ "success": true, "data": { "id": "...", "name": "Basic Monthly", "description": "...", "priceCents": 2999, "durationDays": 30, "isActive": true } }

Error (404):
{ "success": false, "error": { "code": "PLAN_NOT_FOUND", "message": "Plan not found" } }
```

### Memberships

**POST /api/memberships** — Assign a plan to a member

```
Request:
{
  "memberId": "a1b2c3d4-...",
  "planId": "p1p2p3-...",
  "startDate": "2026-02-12"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "m1m2m3-...",
    "memberId": "a1b2c3d4-...",
    "planId": "p1p2p3-...",
    "status": "active",
    "startDate": "2026-02-12",
    "endDate": "2026-03-14"
  }
}

Error (409): { "success": false, "error": { "code": "ACTIVE_MEMBERSHIP_EXISTS", "message": "Member already has an active membership" } }
Error (404): { "success": false, "error": { "code": "PLAN_NOT_FOUND", "message": "Plan not found" } }
Error (422): { "success": false, "error": { "code": "PLAN_INACTIVE", "message": "Plan is not active" } }
```

**PATCH /api/memberships/:id/cancel** — Cancel a membership

```
Request:
{
  "cancelledAt": "2026-02-12"    // optional, defaults to today
}

Response (200):
{
  "success": true,
  "data": {
    "id": "m1m2m3-...",
    "status": "cancelled",
    "cancelledAt": "2026-02-12"
  }
}

Error (404): { "success": false, "error": { "code": "MEMBERSHIP_NOT_FOUND", "message": "Membership not found" } }
Error (409): { "success": false, "error": { "code": "MEMBERSHIP_ALREADY_CANCELLED", "message": "Membership is cancelled" } }
```

**GET /api/memberships** — List memberships (paginated)

> Supports filters: `memberId`, `planId`, `status`, `startDateFrom`, `startDateTo`, `sortBy`, `sortOrder`.

**GET /api/memberships/:id** — Get membership details

### Check-ins

**POST /api/members/:memberId/check-ins** — Record a check-in

```
Request:
{
  "checkedInAt": "2026-02-12T08:30:00Z"    // optional, defaults to NOW()
}

Response (201):
{
  "success": true,
  "data": {
    "id": "c1c2c3-...",
    "memberId": "a1b2c3d4-...",
    "membershipId": "m1m2m3-...",
    "checkedInAt": "2026-02-12T08:30:00Z"
  }
}

Error (403): { "success": false, "error": { "code": "NO_ACTIVE_MEMBERSHIP", "message": "Only members with an active membership can check in" } }
Error (404): { "success": false, "error": { "code": "MEMBER_NOT_FOUND", "message": "Member not found" } }
```

**GET /api/check-ins** — List check-ins (paginated)

> Supports filters: `memberId`, `membershipId`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`.

**GET /api/check-ins/:id** — Get check-in details

---

## 3. Business Rules & Validation

| Rule | Enforcement |
|------|-------------|
| Unique email per member | UNIQUE constraint on `members.email` |
| One active membership per member | Partial unique index + application-level check before insert |
| Only active members can check in | Application-level: query active membership before inserting check-in |
| Membership end_date auto-computed | `start_date + plan.duration_days` computed at insert time |
| Cancellation records effective date | `cancelled_at` stored; status flipped to `'cancelled'` |
| Price stored as cents | CHECK constraint `price_cents >= 0`; no floating-point arithmetic |
| Plan must be active to assign | Application-level: checks `plan.isActive === true` before assignment |
| Soft-delete for members | `is_deleted` boolean flag; deleted members excluded from lists by default |
| Check-in member/membership consistency | DB trigger validates `check_ins.member_id` matches `membership.member_id` |

### Input Validation (Zod)

- `firstName` / `lastName`: non-empty string, max 100 chars, trimmed
- `email`: valid email format, lowercased, max 255 chars
- `phone`: optional, max 20 chars
- `startDate`: valid ISO date string
- `planId` / `memberId`: valid UUID v4
- `cancelledAt`: valid ISO date, optional (defaults to today)
- `checkedInAt`: valid ISO datetime, optional (defaults to NOW())
- Pagination: `page` (min 1, default 1), `pageSize` (min 1, max 100, default 20)

---

## 4. Concurrency: Preventing Race Conditions

**Problem:** Two concurrent requests attempt to assign a membership to the same member who currently has none. Without protection, both could succeed, violating the one-active-membership rule.

**Solution — Belt and suspenders:**

**Layer 1 — Database (partial unique index):**
```sql
CREATE UNIQUE INDEX idx_memberships_member_active
ON memberships (member_id)
WHERE status = 'active';
```
Even if the application layer fails, Postgres rejects the second insert with a unique violation. The application catches this and returns a `409 Conflict`.

**Layer 2 — Application (serialized transaction with row-level lock):**
```sql
BEGIN;
  SELECT id FROM members WHERE id = $1 FOR UPDATE;
  -- Row-level lock acquired on the member row.
  -- Any concurrent transaction targeting the same member blocks here.

  SELECT id FROM memberships WHERE member_id = $1 AND status = 'active';
  -- If found → abort and return 409

  INSERT INTO memberships (...) VALUES (...);
COMMIT;
```

The `FOR UPDATE` lock on the `members` row serializes concurrent membership assignments for the same member. This gives a clean application-level error instead of relying solely on constraint violation handling.

**Why both layers?** The index is the safety net that can never be bypassed. The row lock provides a better developer experience — deterministic behavior and clear error messages instead of retrying on constraint violations.

---

## 5. Backend Architecture

### Layered Pattern (per domain module)

```
Router → Controller → Service → Repository → Database
  │          │            │           │
  │          │            │           └─ Drizzle ORM queries
  │          │            └─ Business logic, cross-service calls
  │          └─ Request/response handling, HTTP status codes
  └─ Express routes, validation middleware, OpenAPI annotations
```

**Domain modules:** `members`, `plans`, `memberships`, `check-ins` — each follows this exact 4-layer structure.

### Tech Stack

| Technology | Purpose |
|---|---|
| Node.js 20 + TypeScript (strict) | Runtime & language |
| Express 4 | HTTP framework |
| PostgreSQL 16 | Database |
| Drizzle ORM + Drizzle Kit | ORM, query builder & migrations |
| Zod | Input validation with type inference |
| Helmet | Security headers |
| Morgan | HTTP request logging |
| swagger-jsdoc + swagger-ui-express | Auto-generated API docs at `/api/docs` |
| Vitest + Supertest | Testing |

### Middleware Pipeline

```
Request → Helmet → Morgan → JSON parser → Routes → 404 handler → Error handler → Response
```

### Error Handling

Centralized `errorHandler` middleware dispatches:
- `HttpError` — application errors with typed `ErrorCode` enum (18 codes)
- `ZodError` — validation failures mapped to field-level details
- Unhandled errors — 500 with generic message

All errors follow a consistent envelope: `{ success: false, error: { code, message, details? } }`

---

## 6. Frontend Architecture

### Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 7 | Build tool + dev server |
| React Router DOM 7 | Client-side routing with lazy loading |
| Tailwind CSS 4 | Utility-first styling |
| focus-trap-react | Accessible modal focus management |
| Vitest + React Testing Library | Component & hook testing |

### Routing

| Route | Page | Description |
|---|---|---|
| `/` | — | Redirects to `/members` |
| `/members` | `MembersPage` | List/search members, create member modal |
| `/members/:id` | `MemberProfilePage` | Profile, membership management, check-ins |

All pages are **lazy-loaded** via `React.lazy()` + `Suspense` for code splitting.

### State Management

No global state library. The app uses:
- **Custom hooks** per API interaction (`useMembersList`, `useMemberProfile`, `useCreateMember`, `useAssignMembership`, `useCancelMembership`, `useCheckIn`, `usePlansList`)
- Each hook manages its own `loading`, `error`, `data` state with `useState`
- **AbortController pattern** for request cancellation on unmount/param changes
- **Prop drilling** with `refetch` callbacks for parent-child data refresh
- `React.memo()` + `useCallback` for search input performance optimization (300ms debounce)

### API Client

Thin `fetch`-based HTTP client (`/src/api/client.ts`) providing:
- `get<T>`, `post<T>`, `patch<T>`, `getPaginated<T>` — typed generic methods
- 15-second timeout via `AbortController`
- Typed `ApiError` class with `code`, `statusCode`, `details`
- Consistent error classification: `SERVER_ERROR`, `TIMEOUT`, `NETWORK_ERROR`, `VALIDATION_ERROR`

**Base URL:** `/api` — proxied to backend by Vite dev server (development) or nginx (production).

### Component Library

| Component | Description |
|---|---|
| `Button` | Primary/secondary/danger variants, sm/md/lg sizes, loading state |
| `Input` | Text input with label and error display |
| `Select` | Dropdown with options and error display |
| `Table<T>` | Generic table with keyboard-navigable clickable rows |
| `Pagination` | Previous/Next with page counter |
| `Modal` | Accessible: focus trap, Escape key, backdrop click, scroll lock |
| `Alert` | Info/success/warning/error color variants |
| `Badge` | Pill-shaped status indicator |
| `LoadingSpinner` | CSS-animated spinner in sm/md/lg |

### Feature Modules

**Members:** `MembersPage`, `MemberProfilePage`, `MembersList`, `MemberSearch` (memo + debounce), `CreateMemberModal`

**Memberships:** `AssignMembershipModal` (plan selector + date), `CancelMembershipModal` (confirmation), `MembershipBadge` (status mapping), `PlanSelector` (API-loaded dropdown)

**Check-ins:** `CheckInButton` (records check-in, 3s auto-dismiss feedback)

---

## 7. Docker & Local Development

### Docker Compose Services

| Service | Image / Build | Port | Purpose |
|---|---|---|---|
| `db` | postgres:16-alpine | 5432 | PostgreSQL with persistent volume |
| `api` | backend (development target) | 3000 | Express API with hot reload (tsx watch) |
| `frontend` | frontend (development target) | 5173 | Vite dev server with HMR |
| `api-prod` | backend (production target) | 3001 | Compiled TypeScript (prod profile) |
| `frontend-prod` | frontend (production target) | 8080 | nginx serving static build (prod profile) |

### Production Frontend (nginx)

- Gzip compression for text assets
- Static asset caching (1 year, immutable headers)
- `/api` reverse proxy to `http://api:3000`
- SPA fallback: `try_files $uri $uri/ /index.html`

### Multi-stage Dockerfiles

Both backend and frontend use multi-stage builds:
- **Backend:** `builder` (compile TS) → `production` (node dist/index.js) / `development` (tsx watch)
- **Frontend:** `development` (vite dev) / `builder` (vite build) → `production` (nginx + static files)

---

## 8. Testing

### Backend (41 tests)

- **Framework:** Vitest + Supertest for HTTP-level integration testing
- **DB Mocking:** Custom chainable Drizzle ORM mock with queue-based results
- **Fixtures:** Factory functions (`createMember`, `createPlan`, `createMembership`, `createCheckIn`)
- **Coverage:** Members (11), Plans (7), Memberships (12), Check-ins (11)

### Frontend (80+ tests)

- **Framework:** Vitest + React Testing Library + jsdom
- **Coverage areas:**
  - API client (12 tests): request formatting, error handling, timeouts, pagination
  - UI components (7 component test files): Button, Modal, Table, Alert, Badge, Input, Select, Pagination
  - Custom hooks (4 hook test files): useMembersList, useMemberProfile, useCreateMember, useCheckIn
  - Components (1 test): MemberSearch debounce and render behavior

### Running Tests

```bash
# With Docker
make test              # Backend tests
make frontend-test     # Frontend tests

# Without Docker
cd backend && npm test
cd frontend && npm run test:run
```

---

## 9. If More Time — Improvements

1. **Membership expiration job:** Background cron/worker to flip `active` → `expired` when `end_date < NOW()`. Currently, the app checks expiration at read time.
2. **Audit trail:** An `events` table logging all state transitions (membership assigned, cancelled, check-in recorded) with actor and timestamp — useful for analytics and debugging.
3. **Rate limiting:** Express rate limiter on check-in endpoint to prevent accidental double-taps and abuse.
4. **E2E tests with Testcontainers:** Spin up a real Postgres in Docker for integration tests, avoiding mocks that hide real SQL issues.
5. **Optimistic UI on frontend:** Immediate feedback on check-in with rollback on error, improving perceived performance.
6. **React Query / SWR:** Replace custom hooks with a data-fetching library for built-in caching, stale-while-revalidate, and deduplication.

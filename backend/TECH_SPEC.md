# Tech Spec — Fitness Member Management Mini-MVP

## 1. Relational Schema

### `members`

| Column       | Type                     | Constraints                          |
|--------------|--------------------------|--------------------------------------|
| id           | UUID                     | PK, DEFAULT gen_random_uuid()        |
| first_name   | VARCHAR(100)             | NOT NULL                             |
| last_name    | VARCHAR(100)             | NOT NULL                             |
| email        | VARCHAR(255)             | NOT NULL, UNIQUE                     |
| phone        | VARCHAR(20)              | NULL                                 |
| created_at   | TIMESTAMPTZ              | NOT NULL, DEFAULT NOW()              |
| updated_at   | TIMESTAMPTZ              | NOT NULL, DEFAULT NOW()              |

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

### `memberships`

| Column        | Type                                      | Constraints                                    |
|---------------|-------------------------------------------|------------------------------------------------|
| id            | UUID                                      | PK, DEFAULT gen_random_uuid()                  |
| member_id     | UUID                                      | NOT NULL, FK → members(id)                     |
| plan_id       | UUID                                      | NOT NULL, FK → plans(id)                       |
| start_date    | DATE                                      | NOT NULL                                       |
| end_date      | DATE                                      | NOT NULL (computed: start_date + duration_days) |
| cancelled_at  | DATE                                      | NULL                                           |
| status        | VARCHAR(20)                               | NOT NULL, CHECK (status IN ('active','cancelled','expired')) |
| created_at    | TIMESTAMPTZ                               | NOT NULL, DEFAULT NOW()                        |
| updated_at    | TIMESTAMPTZ                               | NOT NULL, DEFAULT NOW()                        |

**Indexes:**
- `idx_memberships_member_id` — B-tree on `member_id`
- `idx_memberships_member_active` — **Partial unique index**: `UNIQUE (member_id) WHERE status = 'active'`

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

---

## 2. API Endpoints

### Members

**POST /api/members** — Create a member

```
Request:
{
  "firstName": "Lucía",
  "lastName": "Rodríguez",
  "email": "lucia@example.com",
  "phone": "+598 99 123 456"      // optional
}

Response (201):
{
  "id": "a1b2c3d4-...",
  "firstName": "Lucía",
  "lastName": "Rodríguez",
  "email": "lucia@example.com",
  "phone": "+598 99 123 456",
  "createdAt": "2026-02-10T14:30:00Z"
}

Error (409): { "error": "MEMBER_EMAIL_EXISTS", "message": "A member with this email already exists" }
```

**GET /api/members?q=lucia&page=1&limit=20** — List/search members

```
Response (200):
{
  "data": [ { "id": "...", "firstName": "Lucía", "lastName": "Rodríguez", "email": "...", "activePlan": "Monthly Premium" } ],
  "pagination": { "page": 1, "limit": 20, "total": 1 }
}
```

> Search uses `ILIKE` against first_name, last_name, and email with a single query parameter.

**GET /api/members/:id** — Member profile/summary

```
Response (200):
{
  "id": "a1b2c3d4-...",
  "firstName": "Lucía",
  "lastName": "Rodríguez",
  "email": "lucia@example.com",
  "phone": "+598 99 123 456",
  "membership": {
    "id": "m1m2m3-...",
    "plan": { "id": "p1p2-...", "name": "Monthly Premium" },
    "status": "active",
    "startDate": "2026-01-15",
    "endDate": "2026-02-14"
  },
  "lastCheckIn": "2026-02-10T08:15:00Z",
  "checkInsLast30Days": 12,
  "createdAt": "2025-12-01T10:00:00Z"
}
```

> `membership` is `null` if no active membership exists. `lastCheckIn` is `null` if no check-ins recorded.

### Memberships

**POST /api/members/:memberId/memberships** — Assign a plan

```
Request:
{
  "planId": "p1p2p3-...",
  "startDate": "2026-02-12"
}

Response (201):
{
  "id": "m1m2m3-...",
  "memberId": "a1b2c3d4-...",
  "planId": "p1p2p3-...",
  "status": "active",
  "startDate": "2026-02-12",
  "endDate": "2026-03-14"
}

Error (409): { "error": "MEMBER_HAS_ACTIVE_MEMBERSHIP", "message": "Member already has an active membership. Cancel it first." }
Error (404): { "error": "PLAN_NOT_FOUND", "message": "Plan not found or inactive" }
```

**PATCH /api/members/:memberId/memberships/current/cancel** — Cancel active membership

```
Request:
{
  "effectiveDate": "2026-02-12"    // optional, defaults to today
}

Response (200):
{
  "id": "m1m2m3-...",
  "status": "cancelled",
  "cancelledAt": "2026-02-12"
}

Error (404): { "error": "NO_ACTIVE_MEMBERSHIP", "message": "Member has no active membership to cancel" }
```

> Uses `/current/cancel` instead of requiring the membership ID — the business rule guarantees at most one active membership, so "current" is unambiguous.

### Check-ins

**POST /api/members/:memberId/check-ins** — Record a check-in

```
Response (201):
{
  "id": "c1c2c3-...",
  "memberId": "a1b2c3d4-...",
  "membershipId": "m1m2m3-...",
  "checkedInAt": "2026-02-12T08:30:00Z"
}

Error (403): { "error": "NO_ACTIVE_MEMBERSHIP", "message": "Only members with an active membership can check in" }
```

### Plans (read-only, seeded)

**GET /api/plans** — List available plans

```
Response (200):
{
  "data": [
    { "id": "...", "name": "Monthly Basic", "description": "...", "priceCents": 2999, "durationDays": 30 },
    { "id": "...", "name": "Monthly Premium", "description": "...", "priceCents": 5999, "durationDays": 30 },
    { "id": "...", "name": "Annual Basic", "description": "...", "priceCents": 29999, "durationDays": 365 }
  ]
}
```

---

## 3. Business Rules & Validation

| Rule | Enforcement |
|------|-------------|
| Unique email per member | UNIQUE constraint on `members.email` |
| One active membership per member | Partial unique index + application-level check in transaction |
| Only active members can check in | Application-level: query active membership before inserting check-in |
| Membership end_date auto-computed | `start_date + plan.duration_days` computed at insert time |
| Cancellation records effective date | `cancelled_at` stored; status flipped to `'cancelled'` |
| Price stored as cents | CHECK constraint `price_cents >= 0`; no floats |
| Plan must be active to assign | Application-level: `WHERE is_active = TRUE` |

### Input Validation (Zod)

- `firstName` / `lastName`: non-empty string, max 100 chars, trimmed
- `email`: valid email format, lowercased, max 255 chars
- `phone`: optional, max 20 chars
- `startDate`: valid ISO date, not in the past (configurable)
- `planId`: valid UUID
- `effectiveDate`: valid ISO date, must be ≥ membership start_date

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

## 5. If More Time — Improvements

1. **Membership expiration job:** Background cron/worker to flip `active` → `expired` when `end_date < NOW()`. Currently, the app checks expiration at read time.
2. **Audit trail:** An `events` table logging all state transitions (membership assigned, cancelled, check-in recorded) with actor and timestamp — useful for analytics and debugging.
3. **Rate limiting:** Express rate limiter on check-in endpoint to prevent accidental double-taps and abuse.
4. **E2E tests with Testcontainers:** Spin up a real Postgres in Docker for integration tests, avoiding mocks that hide real SQL issues.
5. **Optimistic UI on frontend:** Immediate feedback on check-in with rollback on error, improving perceived performance.
6. **OpenAPI spec generation:** Auto-generate from Zod schemas using `zod-to-openapi` for living API documentation.

# Backend Development Plan

## Overview

Fitness Member Management API built with:
- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express
- **ORM:** Drizzle
- **Database:** PostgreSQL
- **Validation:** Zod
- **Testing:** Jest + ts-jest
- **Security:** Helmet
- **Logging:** morgan

---

## PR #1: Project Setup & Infrastructure

**Branch:** `feat/be-001-project-setup`

Initialize the project foundation with all tooling configured.

### Deliverables
- `package.json` with dependencies (express, drizzle-orm, pg, zod, helmet, morgan)
- `tsconfig.json` with strict mode enabled
- ESLint + Prettier configuration
- Jest config with ts-jest for TypeScript transform
- Drizzle config with PostgreSQL connection
- `docker-compose.yml` for local PostgreSQL
- `.env.example` with required variables
- npm scripts: `dev`, `build`, `test`, `test:watch`, `db:migrate`, `db:seed`

### File Structure
```
src/
├── index.ts           # Entry point
├── config/
│   └── env.ts         # Environment config with Zod validation
├── db/
│   └── client.ts      # Drizzle client setup
jest.config.js         # Jest configuration
```

---

## PR #2: Database Schemas (Drizzle)

**Branch:** `feat/be-002-database-schemas`

Define all tables with proper constraints and indexes.

### Deliverables
- `members` table schema
- `plans` table schema (with CHECK constraints for price_cents, duration_days)
- `memberships` table schema (with FK relationships)
- `check_ins` table schema
- Partial unique index: `idx_memberships_member_active`
- B-tree indexes on `member_id`, `checked_in_at`
- Initial migration file

### File Structure
```
src/db/
├── schema/
│   ├── members.ts
│   ├── plans.ts
│   ├── memberships.ts
│   ├── check-ins.ts
│   └── index.ts       # Re-exports all schemas
├── migrations/
│   └── 0001_initial.sql
```

---

## PR #3: Zod Validation & TypeScript Types

**Branch:** `feat/be-003-validation-types`

Define all input validation schemas and derive TypeScript types.

### Deliverables

**Member Schemas:**
- `createMemberSchema` (firstName, lastName, email, phone?)
- `searchMembersSchema` (q?, page?, limit?)

**Membership Schemas:**
- `assignMembershipSchema` (planId, startDate)
- `cancelMembershipSchema` (effectiveDate?)

**Common Schemas:**
- `paginationSchema`
- `uuidParamSchema`

**Types:**
- API response types (Member, Plan, Membership, CheckIn)
- Error response type with error codes
- Pagination response wrapper

### File Structure
```
src/
├── schemas/
│   ├── member.schema.ts
│   ├── membership.schema.ts
│   ├── pagination.schema.ts
│   └── index.ts
├── types/
│   ├── api.types.ts
│   ├── error.types.ts
│   └── index.ts
```

---

## PR #4: Express App, Middleware & Error Handling

**Branch:** `feat/be-004-express-middleware`

Setup Express with middleware stack and global error handling.

### Deliverables
- Express app factory (`createApp()`)
- Helmet middleware (security headers)
- Morgan middleware (HTTP request logging)
- JSON body parser
- Request validation middleware (wraps Zod)
- Global error handler with typed `AppError` class
- 404 handler for unknown routes
- Route mounting structure

### Error Codes
```typescript
enum ErrorCode {
  MEMBER_EMAIL_EXISTS = 'MEMBER_EMAIL_EXISTS',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  MEMBER_HAS_ACTIVE_MEMBERSHIP = 'MEMBER_HAS_ACTIVE_MEMBERSHIP',
  NO_ACTIVE_MEMBERSHIP = 'NO_ACTIVE_MEMBERSHIP',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}
```

### Middleware Order
```
1. Helmet (security headers)
2. Morgan (request logging)
3. JSON body parser
4. Routes
5. 404 handler
6. Error handler
```

### File Structure
```
src/
├── app.ts                    # createApp factory
├── middleware/
│   ├── validate.ts           # Zod validation middleware
│   ├── error-handler.ts      # Global error handler
│   └── not-found.ts          # 404 handler
├── errors/
│   └── app-error.ts          # Custom error class
├── routes/
│   └── index.ts              # Route mounting
```

---

## PR #5: Plans API (GET /api/plans)

**Branch:** `feat/be-005-plans-api`

Read-only endpoint to list available plans.

### Endpoint
```
GET /api/plans

Response 200:
{
  "data": [
    { "id": "...", "name": "Monthly Basic", "priceCents": 2999, "durationDays": 30 }
  ]
}
```

### Deliverables
- Plans repository: `listActivePlans()`
- Plans service
- Plans controller
- Plans router
- Seed data for plans (Monthly Basic, Monthly Premium, Annual Basic)
- Unit tests for repository & service
- Integration test for endpoint

### File Structure
```
src/
├── modules/
│   └── plans/
│       ├── plans.repository.ts
│       ├── plans.service.ts
│       ├── plans.controller.ts
│       ├── plans.router.ts
│       └── __tests__/
│           ├── plans.repository.test.ts
│           ├── plans.service.test.ts
│           └── plans.controller.test.ts
├── db/
│   └── seed.ts               # Seed plans data
```

---

## PR #6: Members API - Create & List

**Branch:** `feat/be-006-members-create-list`

Create members and list/search with pagination.

### Endpoints
```
POST /api/members
Request: { firstName, lastName, email, phone? }
Response 201: { id, firstName, lastName, email, phone, createdAt }
Error 409: MEMBER_EMAIL_EXISTS

GET /api/members?q=lucia&page=1&limit=20
Response 200: { data: [...], pagination: { page, limit, total } }
```

### Deliverables
- Members repository: `create()`, `findByEmail()`, `list()`
- ILIKE search across firstName, lastName, email
- Pagination logic
- Members service with email uniqueness check
- Members controller (create, list)
- Members router
- Unit tests

### File Structure
```
src/modules/
└── members/
    ├── members.repository.ts
    ├── members.service.ts
    ├── members.controller.ts
    ├── members.router.ts
    └── __tests__/
```

---

## PR #7: Members API - Get Profile

**Branch:** `feat/be-007-members-profile`

Full member profile with membership and check-in stats.

### Endpoint
```
GET /api/members/:id

Response 200:
{
  "id": "...",
  "firstName": "Lucía",
  "lastName": "Rodríguez",
  "email": "lucia@example.com",
  "membership": {
    "id": "...",
    "plan": { "id": "...", "name": "Monthly Premium" },
    "status": "active",
    "startDate": "2026-01-15",
    "endDate": "2026-02-14"
  },
  "lastCheckIn": "2026-02-10T08:15:00Z",
  "checkInsLast30Days": 12,
  "createdAt": "..."
}

Error 404: MEMBER_NOT_FOUND
```

### Deliverables
- Extend members repository: `findById()` with joins
- Query active membership with plan details
- Query `lastCheckIn` timestamp
- Query `checkInsLast30Days` count
- Service method: `getMemberProfile()`
- Unit tests

---

## PR #8: Memberships API - Assign Plan

**Branch:** `feat/be-008-memberships-assign`

Assign a plan to a member with concurrency handling.

### Endpoint
```
POST /api/members/:memberId/memberships
Request: { planId, startDate }
Response 201: { id, memberId, planId, status, startDate, endDate }
Error 409: MEMBER_HAS_ACTIVE_MEMBERSHIP
Error 404: PLAN_NOT_FOUND | MEMBER_NOT_FOUND
```

### Concurrency Strategy
1. `SELECT ... FOR UPDATE` on members row (row-level lock)
2. Check for existing active membership
3. Insert new membership
4. Partial unique index as safety net

### Deliverables
- Memberships repository: `create()`, `findActiveMembership()`
- Transaction wrapper with FOR UPDATE pattern
- Compute `end_date = start_date + plan.duration_days`
- Memberships service
- Controller & router
- Unit tests including concurrency scenarios

### File Structure
```
src/modules/
└── memberships/
    ├── memberships.repository.ts
    ├── memberships.service.ts
    ├── memberships.controller.ts
    ├── memberships.router.ts
    └── __tests__/
```

---

## PR #9: Memberships API - Cancel

**Branch:** `feat/be-009-memberships-cancel`

Cancel the current active membership.

### Endpoint
```
PATCH /api/members/:memberId/memberships/current/cancel
Request: { effectiveDate? }  // defaults to today
Response 200: { id, status: "cancelled", cancelledAt }
Error 404: NO_ACTIVE_MEMBERSHIP | MEMBER_NOT_FOUND
```

### Deliverables
- Extend memberships repository: `cancel()`
- Validate `effectiveDate >= membership.startDate`
- Update status to `'cancelled'`, set `cancelled_at`
- Service method: `cancelMembership()`
- Unit tests

---

## PR #10: Check-ins API

**Branch:** `feat/be-010-check-ins`

Record member check-ins.

### Endpoint
```
POST /api/members/:memberId/check-ins
Response 201: { id, memberId, membershipId, checkedInAt }
Error 403: NO_ACTIVE_MEMBERSHIP
Error 404: MEMBER_NOT_FOUND
```

### Deliverables
- Check-ins repository: `create()`, `countLast30Days()`, `findLastCheckIn()`
- Verify active membership before allowing check-in
- Check-ins service
- Controller & router
- Unit tests

### File Structure
```
src/modules/
└── check-ins/
    ├── check-ins.repository.ts
    ├── check-ins.service.ts
    ├── check-ins.controller.ts
    ├── check-ins.router.ts
    └── __tests__/
```

---

## Final Project Structure

```
src/
├── index.ts
├── app.ts
├── config/
│   └── env.ts
├── db/
│   ├── client.ts
│   ├── schema/
│   │   ├── members.ts
│   │   ├── plans.ts
│   │   ├── memberships.ts
│   │   ├── check-ins.ts
│   │   └── index.ts
│   ├── migrations/
│   └── seed.ts
├── schemas/
│   ├── member.schema.ts
│   ├── membership.schema.ts
│   ├── pagination.schema.ts
│   └── index.ts
├── types/
│   ├── api.types.ts
│   ├── error.types.ts
│   └── index.ts
├── middleware/
│   ├── validate.ts
│   ├── error-handler.ts
│   └── not-found.ts
├── errors/
│   └── app-error.ts
├── routes/
│   └── index.ts
├── modules/
│   ├── plans/
│   ├── members/
│   ├── memberships/
│   └── check-ins/
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18",
    "drizzle-orm": "^0.30",
    "pg": "^8.11",
    "zod": "^3.22",
    "dotenv": "^16.3",
    "helmet": "^7.1",
    "morgan": "^1.10"
  },
  "devDependencies": {
    "typescript": "^5.3",
    "jest": "^29.7",
    "ts-jest": "^29.1",
    "@types/jest": "^29.5",
    "@types/express": "^4.17",
    "@types/morgan": "^1.9",
    "@types/pg": "^8.10",
    "drizzle-kit": "^0.20",
    "eslint": "^8.56",
    "prettier": "^3.2"
  }
}
```

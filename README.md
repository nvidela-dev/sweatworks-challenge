# Sweatworks Fitness Member Management

A full-stack mini-MVP for managing gym members, memberships, plans, and check-ins.

## Demo Video

> **[Watch the demo video here](VIDEO_LINK_HERE)**

---

## Deliverables

| # | Deliverable | Location |
|---|---|---|
| 1 | **Solution Diagram** | [`docs/solution-diagram.html`](docs/solution-diagram.html) — open in browser, print to PDF |
| 2 | **Tech Spec** | [`TECH_SPEC.md`](TECH_SPEC.md) — schema, endpoints, business rules, concurrency, architecture |
| 3 | **Code** | This repository (backend + frontend + migrations + seed + 120+ tests) |

---

## Quick Start

### Prerequisites

- **Docker** (v20+) and **Docker Compose** (v2+)
- **Make** (optional, but recommended — comes pre-installed on macOS/Linux)
- **Node.js 20+** and **npm** (only needed if running without Docker)

### 1. Clone and start

```bash
git clone <repo-url>
cd sweatworks-challenge

# Start all services (PostgreSQL + API + Frontend)
make start
```

### 2. Set up the database

```bash
# Run migrations (creates tables, indexes, triggers)
make db-migrate

# Seed with sample data (6 plans, sample members)
make db-seed
```

### 3. Open the app

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:3000 |
| **Swagger Docs** | http://localhost:3000/api/docs |

### 4. Verify it's working

```bash
# Health check
curl http://localhost:3000/api/health

# List members (after seeding)
curl http://localhost:3000/api/members

# Or just open http://localhost:5173 in your browser
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `make start` | Start the full stack (API + DB + Frontend) |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View API logs (follow mode) |
| `make frontend-logs` | View Frontend logs (follow mode) |
| `make test` | Run backend unit tests |
| `make frontend-test` | Run frontend unit tests |
| `make lint` | Run backend linter |
| `make build` | Build production Docker images |
| `make db-migrate` | Run database migrations |
| `make db-seed` | Seed database with sample data |
| `make db-reset` | Reset database (drop + migrate + seed) |
| `make shell` | Open shell in API container |
| `make clean` | Remove containers and volumes |
| `make health` | Quick API health check |

---

## Running Without Docker

### Backend

```bash
cd backend
npm install
cp .env.example .env

# Ensure PostgreSQL is running locally, then:
npm run db:migrate
npm run db:seed
npm run dev              # Starts on port 3000 with hot reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on port 5173 with HMR
```

> The Vite dev server proxies `/api` requests to `http://localhost:3000` automatically.

---

## Running Tests

```bash
# With Docker
make test                # Backend: 41 tests (Vitest + Supertest)
make frontend-test       # Frontend: 80+ tests (Vitest + React Testing Library)

# Without Docker
cd backend && npm test
cd frontend && npm run test:run
```

---

## API Endpoints

### Members
- `GET /api/members` — List members (paginated, searchable via `?search=`)
- `GET /api/members/:id` — Member profile with active membership, last check-in, 30-day count
- `POST /api/members` — Create a new member

### Plans
- `GET /api/plans` — List plans (paginated, filterable by `isActive`)
- `GET /api/plans/:id` — Get plan details

### Memberships
- `GET /api/memberships` — List memberships (filterable by member, plan, status, date range)
- `GET /api/memberships/:id` — Get membership details
- `POST /api/memberships` — Assign a plan to a member
- `PATCH /api/memberships/:id/cancel` — Cancel a membership

### Check-ins
- `GET /api/check-ins` — List check-ins (filterable by member, date range)
- `GET /api/check-ins/:id` — Get check-in details
- `POST /api/members/:memberId/check-ins` — Record a check-in

> Full request/response examples in [`TECH_SPEC.md`](TECH_SPEC.md).

---

## Tech Stack

### Backend
- **Runtime**: Node.js 20 with TypeScript (strict mode)
- **Framework**: Express 4
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Validation**: Zod (with type inference)
- **Testing**: Vitest + Supertest
- **API Docs**: Swagger/OpenAPI (auto-generated at `/api/docs`)
- **Security**: Helmet

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7 (lazy-loaded routes)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + React Testing Library
- **Accessibility**: focus-trap-react for modals

### Infrastructure
- **Docker Compose**: 5 services (db, api, frontend, api-prod, frontend-prod)
- **Multi-stage Dockerfiles**: Separate development and production targets
- **Production frontend**: nginx with gzip, caching, SPA fallback, API proxy

---

## Project Structure

```
.
├── TECH_SPEC.md                 # Full-stack technical specification
├── docs/
│   └── solution-diagram.html    # Architecture + AWS deployment diagram
├── backend/
│   ├── src/
│   │   ├── __tests__/           # Integration tests (41 tests)
│   │   ├── members/             # Members module (repo/service/controller/router)
│   │   ├── plans/               # Plans module
│   │   ├── memberships/         # Memberships module
│   │   ├── check-ins/           # Check-ins module
│   │   ├── db/                  # Drizzle schema, migrations, seed
│   │   ├── schemas/             # Zod validation schemas
│   │   ├── middleware/          # Validation + error handling middleware
│   │   ├── types/               # TypeScript types + error codes
│   │   └── utils/               # Date formatting, query filter builders
│   ├── Dockerfile               # Multi-stage (development + production)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Typed fetch-based HTTP client
│   │   ├── components/
│   │   │   ├── ui/              # 9 reusable components (Button, Modal, Table, etc.)
│   │   │   └── layout/          # AppLayout, PageHeader
│   │   ├── features/
│   │   │   ├── members/         # Pages, search, create modal (80+ tests)
│   │   │   ├── memberships/     # Assign/cancel modals, plan selector
│   │   │   └── check-ins/       # CheckInButton with auto-dismiss feedback
│   │   ├── types/               # Frontend TypeScript interfaces
│   │   └── test/                # Test setup and render utilities
│   ├── nginx.conf               # Production SPA config with API proxy
│   ├── Dockerfile               # Multi-stage (development + production)
│   └── package.json
├── docker-compose.yml           # 5 services (dev + prod profiles)
└── Makefile                     # 16 orchestration commands
```

---

## Frontend Routes

| Route | Page | Description |
|---|---|---|
| `/` | — | Redirects to `/members` |
| `/members` | `MembersPage` | List/search members, create member |
| `/members/:id` | `MemberProfilePage` | Profile, membership management, check-ins |

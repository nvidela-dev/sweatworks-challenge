# Sweatworks Fitness Member Management

A full-stack application for managing gym members, memberships, plans, and check-ins.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, but recommended)

### Running the Application

```bash
# Start the full stack (API + DB + Frontend)
make start

# Run database migrations
make db-migrate

# Seed with sample data (optional)
make db-seed
```

**Access Points:**
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs

### Verify It's Working

```bash
# Health check
curl http://localhost:3000/api/health

# List members
curl http://localhost:3000/api/members

# Or open http://localhost:5173 in your browser
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make start` | Start the full stack (API + DB + Frontend) |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View API logs (follow mode) |
| `make frontend-logs` | View Frontend logs (follow mode) |
| `make test` | Run API unit tests |
| `make frontend-test` | Run Frontend unit tests |
| `make lint` | Run API linter |
| `make build` | Build production Docker images |
| `make db-migrate` | Run database migrations |
| `make db-seed` | Seed database with sample data |
| `make db-reset` | Reset database (drop + migrate + seed) |
| `make shell` | Open shell in API container |
| `make clean` | Remove containers and volumes |

## API Endpoints

### Members
- `GET /api/members` - List members (paginated, searchable)
- `GET /api/members/:id` - Get member profile with active membership
- `POST /api/members` - Create a new member

### Plans
- `GET /api/plans` - List plans (paginated, filterable)
- `GET /api/plans/:id` - Get plan details

### Memberships
- `GET /api/memberships` - List memberships (paginated, filterable)
- `GET /api/memberships/:id` - Get membership details
- `POST /api/memberships` - Create a membership
- `PATCH /api/memberships/:id/cancel` - Cancel a membership

### Check-ins
- `GET /api/check-ins` - List check-ins (paginated, filterable)
- `GET /api/check-ins/:id` - Get check-in details
- `POST /api/members/:memberId/check-ins` - Create a check-in

## Running Without Docker

### Backend

```bash
cd backend
npm install
cp .env.example .env

# Start PostgreSQL separately, then:
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Running Tests

```bash
# API tests (with Docker)
make test

# Frontend tests (with Docker)
make frontend-test

# API tests (without Docker)
cd backend && npm test

# Frontend tests (without Docker)
cd frontend && npm run test:run
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── __tests__/     # Unit tests
│   │   ├── members/       # Members module
│   │   ├── plans/         # Plans module
│   │   ├── memberships/   # Memberships module
│   │   ├── check-ins/     # Check-ins module
│   │   ├── db/            # Database schema & migrations
│   │   ├── schemas/       # Zod validation schemas
│   │   └── middleware/    # Express middleware
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           # API client layer
│   │   ├── components/    # Shared UI components
│   │   │   ├── ui/        # Base UI components
│   │   │   └── layout/    # Layout components
│   │   ├── features/      # Feature modules
│   │   │   ├── members/
│   │   │   ├── memberships/
│   │   │   └── check-ins/
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── Makefile
└── README.md
```

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/members` |
| `/members` | List all members with search |
| `/members/:id` | View member profile |

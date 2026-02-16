# Sweatworks Fitness Member Management API

A REST API for managing gym members, memberships, plans, and check-ins.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, but recommended)

### Running the API

```bash
# Start the API and database
make start

# Run database migrations
make db-migrate

# Seed with sample data (optional)
make db-seed
```

The API will be available at **http://localhost:3000**

### Verify It's Working

```bash
# Health check
curl http://localhost:3000/api/health

# List members
curl http://localhost:3000/api/members

# List plans
curl http://localhost:3000/api/plans
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make start` | Start the API and database |
| `make stop` | Stop all services |
| `make restart` | Restart all services |
| `make logs` | View API logs (follow mode) |
| `make test` | Run unit tests |
| `make lint` | Run linter |
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

If you prefer to run locally:

```bash
cd backend
npm install
cp .env.example .env

# Start PostgreSQL separately, then:
npm run db:migrate
npm run db:seed
npm run dev
```

## Running Tests

```bash
# With Docker
make test

# Without Docker
cd backend && npm test
```

## Tech Stack

- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest + Supertest

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
├── docker-compose.yml
├── Makefile
└── README.md
```

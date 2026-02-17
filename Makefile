.PHONY: help start stop restart logs frontend-logs test frontend-test test-local frontend-test-local lint build clean db-migrate db-seed db-reset shell health

# Default target
help:
	@echo "Sweatworks Fitness - Available Commands"
	@echo "========================================"
	@echo ""
	@echo "  make start        Start full stack (API + DB + Frontend)"
	@echo "  make stop         Stop all services"
	@echo "  make restart      Restart all services"
	@echo "  make logs         View API logs (follow mode)"
	@echo "  make frontend-logs View Frontend logs (follow mode)"
	@echo ""
	@echo "  make test         Run API unit tests"
	@echo "  make frontend-test Run Frontend unit tests"
	@echo "  make lint         Run API linter"
	@echo "  make build        Build production Docker images"
	@echo ""
	@echo "  make db-migrate   Run database migrations"
	@echo "  make db-seed      Seed the database with sample data"
	@echo "  make db-reset     Reset database (drop + migrate + seed)"
	@echo ""
	@echo "  make shell        Open shell in API container"
	@echo "  make clean        Remove containers and volumes"
	@echo ""

# Start services
start:
	@echo "Starting services..."
	docker compose up -d
	@echo ""
	@echo "Services started!"
	@echo "  - Frontend: http://localhost:5173"
	@echo "  - API:      http://localhost:3000"
	@echo "  - Swagger:  http://localhost:3000/api/docs"
	@echo ""
	@echo "Run 'make logs' to view API logs or 'make db-migrate' to set up the database"

# Stop services
stop:
	@echo "Stopping services..."
	docker compose down

# Restart services
restart: stop start

# View API logs
logs:
	docker compose logs -f api

# View Frontend logs
frontend-logs:
	docker compose logs -f frontend

# Run API tests
test:
	@echo "Running API tests..."
	docker compose exec api npm test

# Run Frontend tests
frontend-test:
	@echo "Running Frontend tests..."
	docker compose exec frontend npm run test:run

# Run tests locally (without Docker)
test-local:
	cd backend && npm test

# Run Frontend tests locally (without Docker)
frontend-test-local:
	cd frontend && npm run test:run

# Run linter
lint:
	docker compose exec api npm run lint

# Build production images
build:
	docker compose --profile prod build api-prod frontend-prod

# Run database migrations
db-migrate:
	@echo "Running migrations..."
	docker compose exec api npm run db:migrate
	@echo "Migrations complete!"

# Seed database
db-seed:
	@echo "Seeding database..."
	docker compose exec api npm run db:seed
	@echo "Database seeded!"

# Reset database (useful for fresh start)
db-reset:
	@echo "Resetting database..."
	docker compose down -v
	docker compose up -d db
	@echo "Waiting for database to be ready..."
	@sleep 3
	docker compose up -d api
	@sleep 2
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo "Database reset complete!"

# Open shell in API container
shell:
	docker compose exec api sh

# Clean up everything
clean:
	@echo "Cleaning up..."
	docker compose down -v --rmi local
	@echo "Cleanup complete!"

# Quick health check
health:
	@curl -s http://localhost:3000/api/health | jq . || echo "API not responding"

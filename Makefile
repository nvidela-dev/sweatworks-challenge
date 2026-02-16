.PHONY: help start stop restart logs test lint build clean db-migrate db-seed shell

# Default target
help:
	@echo "Sweatworks Fitness API - Available Commands"
	@echo "============================================"
	@echo ""
	@echo "  make start       Start the API and database"
	@echo "  make stop        Stop all services"
	@echo "  make restart     Restart all services"
	@echo "  make logs        View API logs (follow mode)"
	@echo ""
	@echo "  make test        Run unit tests"
	@echo "  make lint        Run linter"
	@echo "  make build       Build production Docker image"
	@echo ""
	@echo "  make db-migrate  Run database migrations"
	@echo "  make db-seed     Seed the database with sample data"
	@echo "  make db-reset    Reset database (drop + migrate + seed)"
	@echo ""
	@echo "  make shell       Open shell in API container"
	@echo "  make clean       Remove containers and volumes"
	@echo ""

# Start services
start:
	@echo "Starting services..."
	docker compose up -d
	@echo ""
	@echo "Services started! API available at http://localhost:3000"
	@echo "Run 'make logs' to view logs or 'make db-migrate' to set up the database"

# Stop services
stop:
	@echo "Stopping services..."
	docker compose down

# Restart services
restart: stop start

# View logs
logs:
	docker compose logs -f api

# Run tests
test:
	@echo "Running tests..."
	docker compose exec api npm test

# Run tests locally (without Docker)
test-local:
	cd backend && npm test

# Run linter
lint:
	docker compose exec api npm run lint

# Build production image
build:
	docker compose build api-prod

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

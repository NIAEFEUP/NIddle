.PHONY: help up down restart logs build build-api build-web build-app check fix format lint seed test test-watch test-cov test-e2e sh-api sh-web

help:
	@echo "NIddle Development Makefile"
	@echo ""
	@echo "Container Management:"
	@echo "  make up          - Start development environment in background"
	@echo "  make down        - Stop development environment"
	@echo "  make restart     - Restart all containers"
	@echo "  make logs        - Follow container logs"
	@echo "  make build       - Rebuild container images"
	@echo ""
	@echo "Application Build:"
	@echo "  make build-api   - Build the API application (npm run build:api)"
	@echo "  make build-web   - Build the Web application (npm run build:web)"
	@echo "  make build-app   - Build both API and Web applications"
	@echo ""
	@echo "Code Quality:"
	@echo "  make check       - Run linting and formatting checks"
	@echo "  make fix         - Automatically fix linting and formatting issues"
	@echo "  make format      - Format codebase with Biome"
	@echo "  make lint        - Lint codebase with Biome"
	@echo ""
	@echo "Database & Testing:"
	@echo "  make seed        - Seed database with initial sample data"
	@echo "  make test        - Run unit tests"
	@echo "  make test-watch  - Run unit tests in watch mode"
	@echo "  make test-cov    - Run unit tests and generate coverage report"
	@echo "  make test-e2e    - Run end-to-end tests"
	@echo ""
	@echo "Shell Access:"
	@echo "  make sh-api      - Open a shell inside the API container"
	@echo "  make sh-web      - Open a shell inside the Web container"

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

build:
	docker compose build

build-api:
	docker compose exec api npm run build:api

build-web:
	docker compose exec web npm run build:web

build-app:
	docker compose exec api npm run build

check:
	docker compose exec api npm run check

fix:
	docker compose exec api npm run check:fix

format:
	docker compose exec api npm run format

lint:
	docker compose exec api npm run lint

seed:
	docker compose exec api npm run seed

test:
	docker compose exec api npm test

test-watch:
	docker compose exec api npm run test:watch

test-cov:
	docker compose exec api npm run test:cov

test-e2e:
	docker compose exec api npm run test:e2e

sh-api:
	docker compose exec api sh

sh-web:
	docker compose exec web sh

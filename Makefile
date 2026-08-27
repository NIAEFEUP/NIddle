UID ?= $(shell id -u 2>/dev/null || echo 1000)
GID ?= $(shell id -g 2>/dev/null || echo 1000)
export UID GID

.PHONY: help up down restart logs build build-api build-web build-app check fix format lint seed test test-watch test-cov test-e2e sh-api sh-web install install-api install-web add-api add-web sync-modules sync_modules fix-perms

help:
	@echo "NIddle Development Makefile"
	@echo ""
	@echo "Container Management:"
	@echo "  make up                     - Start development environment (auto-builds, renews volumes & syncs modules)"
	@echo "  make down                   - Stop development environment"
	@echo "  make restart                - Restart all containers"
	@echo "  make logs                   - Follow container logs"
	@echo "  make build                  - Rebuild container images"
	@echo ""
	@echo "Dependency Management:"
	@echo "  make install                - Install/sync dependencies in all containers & sync to host"
	@echo "  make install-api            - Install/sync dependencies in API container & sync to host"
	@echo "  make install-web            - Install/sync dependencies in Web container & sync to host"
	@echo "  make add-api pkg=<name>     - Add dependency to API container (e.g. make add-api pkg=axios)"
	@echo "  make add-web pkg=<name>     - Add dependency to Web container (e.g. make add-web pkg=lucide-react)"
	@echo "  make sync-modules           - Sync node_modules from containers to host"
	@echo "  make fix-perms              - Ensure node_modules on host has proper user permissions"
	@echo ""
	@echo "Application Build:"
	@echo "  make build-api              - Build the API application (npm run build:api)"
	@echo "  make build-web              - Build the Web application (npm run build:web)"
	@echo "  make build-app              - Build both API and Web applications"
	@echo ""
	@echo "Code Quality:"
	@echo "  make check                  - Run linting and formatting checks"
	@echo "  make fix                    - Automatically fix linting and formatting issues"
	@echo "  make format                 - Format codebase with Biome"
	@echo "  make lint                   - Lint codebase with Biome"
	@echo ""
	@echo "Database & Testing:"
	@echo "  make seed                   - Seed database with initial sample data"
	@echo "  make test                   - Run unit tests"
	@echo "  make test-watch             - Run unit tests in watch mode"
	@echo "  make test-cov               - Run unit tests and generate coverage report"
	@echo "  make test-e2e               - Run end-to-end tests"
	@echo ""
	@echo "Shell Access:"
	@echo "  make sh-api                 - Open a shell inside the API container"
	@echo "  make sh-web                 - Open a shell inside the Web container"

fix-perms:
	@mkdir -p node_modules apps/api/node_modules apps/web/node_modules
	@if { [ -d node_modules ] && [ ! -w node_modules ]; } || \
	   { [ -d apps/api/node_modules ] && [ ! -w apps/api/node_modules ]; } || \
	   { [ -d apps/web/node_modules ] && [ ! -w apps/web/node_modules ]; }; then \
		echo "Fixing node_modules permissions via Docker..."; \
		docker run --rm -v "$$(pwd):/host" alpine chown -R $(UID):$(GID) /host/node_modules /host/apps/api/node_modules /host/apps/web/node_modules 2>/dev/null || true; \
	fi

up: fix-perms
	docker compose up -d --build -V
	@$(MAKE) sync-modules

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

build:
	docker compose build

sync-modules: fix-perms
	@echo "Waiting for containers to be ready..."
	@sh -c 'count=0; until docker compose exec -T api true 2>/dev/null || [ $$count -ge 30 ]; do sleep 1; count=$$((count + 1)); done'
	@echo "Syncing node_modules to host..."
	@docker compose cp api:/app/node_modules ./
	@docker compose cp web:/app/node_modules ./ 2>/dev/null || true
	@docker compose cp api:/app/apps/api/node_modules ./apps/api/ 2>/dev/null || true
	@docker compose cp web:/app/apps/web/node_modules ./apps/web/ 2>/dev/null || true
	@echo "Sync complete!"

sync_modules: sync-modules

build-api:
	docker compose exec api npm run build:api

build-web:
	docker compose exec web npm run build:web

build-app: build-api build-web

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

install:
	docker compose exec api npm install
	docker compose exec web npm install
	@$(MAKE) sync-modules

install-api:
	docker compose exec api npm install
	@$(MAKE) sync-modules

install-web:
	docker compose exec web npm install
	@$(MAKE) sync-modules

add-api:
	@if [ -z "$(pkg)" ]; then echo "Usage: make add-api pkg=<package_name>"; exit 1; fi
	docker compose exec api npm install $(pkg) -w apps/api
	@$(MAKE) sync-modules

add-web:
	@if [ -z "$(pkg)" ]; then echo "Usage: make add-web pkg=<package_name>"; exit 1; fi
	docker compose exec web npm install $(pkg) -w apps/web
	@$(MAKE) sync-modules


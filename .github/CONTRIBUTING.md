# Contributing to NIddle

Thank you for your interest in contributing to **NIddle**! This document provides guidelines and instructions for setting up your development environment, understanding the repository structure, running tests, maintaining code quality, and submitting your contributions.

---

## Table of Contents

- [Monorepo Architecture](#monorepo-architecture)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Development Workflows](#development-workflows)
  - [Option 1: Everything in Docker (Recommended)](#option-1-everything-in-docker-recommended)
  - [Option 2: Local Development (Postgres in Docker)](#option-2-local-development-postgres-in-docker)
  - [Option 3: Nix Development Shell](#option-3-nix-development-shell)
- [Editor & IDE Setup](#editor--ide-setup)
- [Makefile Cheatsheet & Commands](#makefile-cheatsheet--commands)
- [Managing Dependencies](#managing-dependencies)
- [Database Management & Seeding](#database-management--seeding)
- [Code Quality & Standards](#code-quality--standards)
  - [Biome (Linting & Formatting)](#biome-linting--formatting)
  - [Git Hooks (Husky & lint-staged)](#git-hooks-husky--lint-staged)
  - [TypeScript Type Checking](#typescript-type-checking)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [End-to-End (E2E) Tests](#end-to-end-e2e-tests)
  - [Coverage](#coverage)
- [Docker & Container Builds](#docker--container-builds)
- [Git & Pull Request Guidelines](#git--pull-request-guidelines)
  - [Branching Strategy](#branching-strategy)
  - [Commit Conventions](#commit-conventions)

---

## Monorepo Architecture

NIddle is structured as an npm monorepo with multiple workspaces:

```
.
├── apps/
│   ├── api/          # Backend REST API (NestJS, TypeORM, PostgreSQL, Swagger)
│   └── web/          # Frontend Web Application (React 19, Vite, Tailwind CSS, TanStack Query)
├── .github/          # GitHub Actions workflows, issue templates, and contributing guide
├── Makefile          # Unified helper commands for Docker and development
├── docker-compose.yml# Docker Compose services definition (PostgreSQL, API, Web)
├── biome.json        # Biome linting and formatting configuration
├── flake.nix         # Nix flake for reproducible development shell
└── package.json      # Monorepo root configuration & shared scripts
```

---

## Prerequisites

- **[Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)** (Recommended for containerized development)
- **[Node.js](https://nodejs.org/)** (v24.x LTS or higher) and **npm** (Required if running services locally on the host)
- **[Nix](https://nixos.org/)** *(Optional)*: If you prefer using a Nix reproducible development shell.

---

## Environment Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/NIAEFEUP/NIddle.git
   cd NIddle
   ```

2. Create your local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

3. When running services inside Docker containers, create a dedicated `.env.docker` file:
   ```bash
   cp .env.local .env.docker
   ```
   In `.env.docker`, ensure the database host points to the Docker service name `postgres`:
   ```dotenv
   DATABASE_MASTER=postgres
   DATABASE_SLAVE=postgres
   ```

---

## Development Workflows

### Option 1: Everything in Docker (Recommended)

In this setup, PostgreSQL, the NestJS API (with watch mode), and the Vite web application (with Hot Module Replacement) all run inside Docker containers with source code bind-mounted.

```bash
# Start all containers and sync node_modules to host for IDE IntelliSense
make up
```

Services will be accessible at:
- **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Swagger API Docs**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **PostgreSQL Database**: `localhost:5432`

> **Note:** In development, Vite proxies requests from `http://localhost:3000/api` to the backend API (`http://api:3001`), while the API is also directly reachable at port `3001`.

To stop the containers:
```bash
make down
```

To follow container logs in real time:
```bash
make logs
```

### Option 2: Local Development (Postgres in Docker)

If you prefer running the Node.js applications natively on your host machine while running PostgreSQL in Docker:

1. Start only the PostgreSQL database container:
   ```bash
   docker compose up -d postgres
   ```

2. Install dependencies at the monorepo root:
   ```bash
   npm install
   ```

3. *(Optional)* Seed the database with sample data:
   ```bash
   npm run seed
   ```

4. Run the applications in separate terminals:
   ```bash
   # Terminal 1: Backend API (http://localhost:3001)
   npm run dev:api

   # Terminal 2: Frontend Web App (http://localhost:3000)
   npm run dev:web
   ```

### Option 3: Nix Development Shell

If you use [Nix](https://nixos.org/), a `flake.nix` is provided with all necessary development dependencies (Node.js 24, Nest CLI, etc.):

```bash
nix develop
```

---

## Editor & IDE Setup

### VS Code IntelliSense & Biome

When using the containerized workflow (`make up`), dependencies are installed inside containers. The `Makefile` automatically copies `node_modules` back to the host filesystem so that VS Code, language servers, and TypeScript IntelliSense function seamlessly.

If you ever need to manually resync dependencies or fix file permissions:
```bash
make sync-modules
make fix-perms
```

**Recommended Extensions:**
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (Official Biome VS Code extension for formatting and linting)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## Makefile Cheatsheet & Commands

The repository includes a `Makefile` that simplifies common developer operations across containers and native environments:

| Action | Makefile Command | Docker Compose Equivalent | Host / npm Equivalent |
| :--- | :--- | :--- | :--- |
| **Start stack** | `make up` | `docker compose up -d --build -V` | — |
| **Stop stack** | `make down` | `docker compose down` | — |
| **Restart stack** | `make restart` | `docker compose restart` | — |
| **Follow logs** | `make logs` | `docker compose logs -f` | — |
| **Rebuild containers** | `make build` | `docker compose build` | — |
| **Install/Sync deps** | `make install` | `docker compose exec api npm install && ...` | `npm install` |
| **Add API package** | `make add-api pkg=<name>` | `docker compose exec api npm install <pkg> -w apps/api` | `npm i <pkg> -w apps/api` |
| **Add Web package** | `make add-web pkg=<name>` | `docker compose exec web npm install <pkg> -w apps/web` | `npm i <pkg> -w apps/web` |
| **Sync node_modules** | `make sync-modules` | `docker compose cp ...` | — |
| **Fix host permissions**| `make fix-perms` | — | — |
| **Build API** | `make build-api` | `docker compose exec api npm run build:api` | `npm run build:api` |
| **Build Web** | `make build-web` | `docker compose exec web npm run build:web` | `npm run build:web` |
| **Build Both Apps** | `make build-app` | `docker compose exec api npm run build` | `npm run build` |
| **Lint & Format Check**| `make check` | `docker compose exec api npm run check` | `npm run check` |
| **Auto-fix Lint/Format**| `make fix` | `docker compose exec api npm run check:fix` | `npm run check:fix` |
| **Format Only** | `make format` | `docker compose exec api npm run format` | `npm run format` |
| **Lint Only** | `make lint` | `docker compose exec api npm run lint` | `npm run lint` |
| **Seed Database** | `make seed` | `docker compose exec api npm run seed` | `npm run seed` |
| **Run Unit Tests** | `make test` | `docker compose exec api npm test` | `npm test` |
| **Watch Unit Tests** | `make test-watch` | `docker compose exec api npm run test:watch` | `npm run test:watch` |
| **Test Coverage** | `make test-cov` | `docker compose exec api npm run test:cov` | `npm run test:cov` |
| **Run E2E Tests** | `make test-e2e` | `docker compose exec api npm run test:e2e` | `npm run test:e2e` |
| **Shell into API** | `make sh-api` | `docker compose exec api sh` | — |
| **Shell into Web** | `make sh-web` | `docker compose exec web sh` | — |

---

## Managing Dependencies

NIddle uses npm workspaces. Always install packages into their respective workspace:

- **Via Makefile (in Docker):**
  ```bash
  make add-api pkg=<package-name>
  make add-web pkg=<package-name>
  ```

- **Via npm (on Host):**
  ```bash
  # Add to backend API
  npm install <package-name> -w apps/api

  # Add to frontend Web
  npm install <package-name> -w apps/web

  # Add dev dependency to root
  npm install -D <package-name>
  ```

---

## Database Management & Seeding

- **Seed Database:** Populates the database with initial sample data.
  ```bash
  # Docker
  make seed

  # Host
  npm run seed
  ```

- **Generate/Synchronize Schema:**
  ```bash
  npm run schema:create
  ```

---

## Code Quality & Standards

### Biome (Linting & Formatting)

We use [Biome](https://biomejs.dev/) for fast linting and formatting across the entire monorepo.

- **Check for issues:**
  ```bash
  make check       # Docker
  npm run check    # Host
  ```

- **Automatically fix formatting and lint issues:**
  ```bash
  make fix         # Docker
  npm run check:fix # Host
  ```

### Git Hooks (Husky & lint-staged)

Husky runs pre-commit hooks via `lint-staged` automatically whenever you commit changes. This verifies:
1. Biome formatting and linting (`biome check --write`)
2. TypeScript compilation without emit (`npm run typecheck`)

### TypeScript Type Checking

Run type checks manually:
```bash
npm run typecheck -w apps/api
npm run typecheck -w apps/web
```

---

## Testing

### Unit Tests

Unit tests are written using [Jest](https://jestjs.io/).

- **Run all unit tests:**
  ```bash
  make test        # Docker
  npm test         # Host
  ```

- **Run in watch mode:**
  ```bash
  make test-watch  # Docker
  npm run test:watch # Host
  ```

### End-to-End (E2E) Tests

- **Run E2E tests:**
  ```bash
  make test-e2e    # Docker
  npm run test:e2e # Host
  ```

### Coverage

- **Run tests with coverage:**
  ```bash
  make test-cov    # Docker
  npm run test:cov # Host
  ```
Coverage reports are generated under `apps/api/coverage`.

---

## Docker & Container Builds

NIddle uses multi-stage Dockerfiles (`apps/api/Dockerfile` and `apps/web/Dockerfile`) with separate targets for development (`*-dev`) and production (`*-runner`).

### Building Production Images Manually

Always run builds from the monorepo root directory so that the shared context and `package-lock.json` are included:

- **API Image:**
  ```bash
  docker build -f apps/api/Dockerfile --target api-runner -t niddle-api .
  ```

- **Web Image:**
  ```bash
  docker build -f apps/web/Dockerfile --target web-runner -t niddle-web .
  ```

### Running Containers Manually

```bash
# Create shared network if not already present
docker network create niddle-network || true

# Run API container
docker run --name niddle-api --network niddle-network -p 3001:3001 --env-file .env.docker niddle-api

# Run Web container
docker run --name niddle-web --network niddle-network -p 3000:3000 --env-file .env.docker niddle-web
```

---

## Git & Pull Request Guidelines

### Branching Strategy

- `main`: Production-ready branch.
- `develop`: Primary integration branch. All feature branches and pull requests should target `develop`.
- **Branch naming convention:**
  - `feat/<feature-name>`: New features or enhancements
  - `fix/<bug-fix-name>`: Bug fixes
  - `docs/<description>`: Documentation changes
  - `refactor/<description>`: Code refactoring without behavior change
  - `test/<description>`: Adding or fixing tests
  - `chore/<description>`: Build tasks, dependency updates, configs

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add schedule validation endpoint`
- `fix: resolve CORS header mismatch on proxy`
- `docs: update API setup instructions`
- `test: add unit test for events service`
- `chore: update dependencies`

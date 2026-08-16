# NIddle

<p align="center">
    <a href="https://github.com/niaefeup/niddle/actions/workflows/checks.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/niaefeup/niddle/checks.yml?branch=main"></a>
    <a href="https://codecov.io/gh/NIAEFEUP/NIddle" ><img src="https://codecov.io/gh/NIAEFEUP/NIddle/graph/badge.svg?token=GLE6F6JWZK"/></a>
    <a href="https://github.com/biomejs/biome/"><img alt="code style: biome" src="https://img.shields.io/badge/code_style-biome-ff69b4.svg?style=flat-square"></a>
    <a href="https://github.com/niaefeup/niddle/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/niaefeup/niddle"></a>
    <a href="https://github.com/niaefeup/niddle/issues"><img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/niaefeup/niddle"></a>
    <a href="https://github.com/niaefeup/niddle/blob/main/LICENSE"><img alt="GitHub License" src="https://img.shields.io/github/license/niaefeup/niddle"></a>
</p>

## Overview

NIddle is a service dedicated to managing and providing static data for the UNI mobile application. It serves as a central hub for university-related information such as faculty and course events, academic services, and student association content.

The primary goal of NIddle is to provide a reliable and easily maintainable API for the UNI app, ensuring that static resources are kept up-to-date and accessible without the need for frequent application releases.

## Features

- **Stable API**: Provides a consistent and reliable API for faculty events, course information, and student association data.
- **Modern Tech Stack**: Built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [PostgreSQL](https://www.postgresql.org/).
- **API Documentation**: Interactive documentation powered by [Swagger](https://swagger.io/).
- **Database Management**: Easy schema management and data seeding for development.
- **Typescript First**: Fully typed API for better developer experience and reliability.
- **CI/CD Ready**: Automated testing and linting with GitHub Actions.
- **Containerized**: Support for Docker and Nix for consistent environments.

## API Documentation

NIddle comes with built-in API documentation using Swagger. Once the backend application is running, you can access the documentation at:

```
http://localhost:3001/api/docs
```

This provides an interactive interface to explore and test the available endpoints.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v22.x recommended, only needed if you run the Node apps natively on your host)

### Clone & configure

```bash
git clone https://github.com/NIAEFEUP/NIddle
cd NIddle
cp .env.example .env.local
```

Open `.env.local` and fill in the required variables (`DATABASE_MASTER`/`DATABASE_SLAVE` should stay `localhost` here).

From this point, pick one of the two setups below.

### Option 1 — Everything in Docker (recommended)

PostgreSQL, the NestJS API (hot reload via `nest --watch`) and the Vite web app (HMR) all run in containers, with your source code bind-mounted in.

Inside the containers, Postgres is reachable at the `postgres` service name, not `localhost` — so make a Docker-specific copy of your env file and point it there:

```bash
cp .env.local .env.docker
```

Edit `.env.docker` and set `DATABASE_MASTER=postgres` and `DATABASE_SLAVE=postgres`.

```bash
make up   # or: docker compose up -d
```

- **Frontend Web App**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Swagger API Docs**: `http://localhost:3001/api/docs`
- **PostgreSQL Database**: `localhost:5432`

> **Note**: In development, Vite proxies requests from `http://localhost:3000/api` to the backend API, but the API itself runs directly on port `3001`.

### Option 2 — Local development, Postgres in Docker

If you'd rather run the Node.js applications natively (only Postgres in a container):

```bash
docker compose up -d postgres
npm install
npm run seed        # optional, populates sample data
npm run dev:api      # http://localhost:3001
npm run dev:web       # in another terminal, http://localhost:3000
```

### Editor Setup — VSCode IntelliSense

When you run `make up`, `make install`, or `make add-*`, the `Makefile` automatically syncs the container's installed `node_modules` back to the host filesystem. This gives VS Code running on your host machine instant access to all TypeScript type definitions and Biome formatting without needing Node.js or Dev Containers installed on your host.

If you ever need to manually re-sync module definitions:

```bash
make sync-modules
```

## Nix Support

If you use [Nix](https://nixos.org/), this project includes a flake that provides a development shell with all the necessary tools (Node.js 22, Nest CLI, etc.).

```bash
nix develop
```

This ensures a consistent development environment across different machines.

## Docker

NIddle uses two multi-stage Dockerfiles — `apps/api/Dockerfile` and `apps/web/Dockerfile` — to build lightweight, production-ready images. Each has a `deps → builder → *-runner` chain for production and a `deps → *-dev` stage (no build step, source bind-mounted in) used by `docker-compose.yml` for local development.

### Building Images

Build the individual target images from the root of the repository (the build context has to stay the repo root — `apps/*/package.json` alone isn't enough, the shared `package-lock.json` lives at the root):

- **API Image**:
  ```bash
  docker build -f apps/api/Dockerfile --target api-runner -t niddle-api .
  ```

- **Web Image**:
  ```bash
  docker build -f apps/web/Dockerfile --target web-runner -t niddle-web .
  ```

### Running Images Manually

Ensure the `niddle-network` network exists (created automatically by Docker Compose or via `docker network create niddle-network`):

```bash
# Run API container
docker run --name niddle-api --network niddle-network -p 3001:3001 --env-file .env.docker niddle-api

# Run Web container
docker run --name niddle-web --network niddle-network -p 3000:3000 niddle-web
```

Or run and manage all containers simultaneously using Docker Compose:

```bash
docker compose up -d --build
```

## Available Scripts

You can run development and maintenance tasks using **`make`** (simplest for containerized workflow), **`docker compose exec`**, or directly via **`npm`** (if running locally on host).

### Quick Reference (Makefile)

When using the containerized workflow (`make up`):

| Action | Makefile | Docker Compose Equivalent | Host Machine (npm) |
| :--- | :--- | :--- | :--- |
| **Start stack** | `make up` | `docker compose up -d --build -V` | — |
| **Stop stack** | `make down` | `docker compose down` | — |
| **Follow logs** | `make logs` | `docker compose logs -f` | — |
| **Install/Sync dependencies** | `make install` | `docker compose exec api npm install && ...` | `npm install` |
| **Add Web package** | `make add-web pkg=<name>` | `docker compose exec web npm install <pkg> -w apps/web` | `npm i <pkg> -w apps/web` |
| **Add API package** | `make add-api pkg=<name>` | `docker compose exec api npm install <pkg> -w apps/api` | `npm i <pkg> -w apps/api` |
| **Build API App** | `make build-api` | `docker compose exec api npm run build:api` | `npm run build:api` |
| **Build Web App** | `make build-web` | `docker compose exec web npm run build:web` | `npm run build:web` |
| **Build Both Apps** | `make build-app` | `docker compose exec api npm run build` | `npm run build` |
| **Lint & Format Check** | `make check` | `docker compose exec api npm run check` | `npm run check` |
| **Auto-fix Format/Lint** | `make fix` | `docker compose exec api npm run check:fix` | `npm run check:fix` |
| **Format Only** | `make format` | `docker compose exec api npm run format` | `npm run format` |
| **Lint Only** | `make lint` | `docker compose exec api npm run lint` | `npm run lint` |
| **Seed Database** | `make seed` | `docker compose exec api npm run seed` | `npm run seed` |
| **Run Unit Tests** | `make test` | `docker compose exec api npm test` | `npm test` |
| **Watch Unit Tests** | `make test-watch` | `docker compose exec api npm run test:watch` | `npm run test:watch` |
| **Test Coverage** | `make test-cov` | `docker compose exec api npm run test:cov` | `npm run test:cov` |
| **Run E2E Tests** | `make test-e2e` | `docker compose exec api npm run test:e2e` | `npm run test:e2e` |

### Script Reference

#### Development & Build

- `npm run dev:api`: Starts the NestJS backend API in development mode.
- `npm run dev:web`: Starts the Vite frontend web app in development mode.
- `npm run build`: Builds both the API and Frontend web apps for production.
- `npm run build:api`: Builds the NestJS API.
- `npm run build:web`: Builds the Vite frontend.
- `npm run seed`: Seeds the database with sample data (proxied to `@niddle/api`).
- `npm run schema:create`: Generates the database schema (proxied to `@niddle/api`).

#### Quality & Linting

- `npm run check`: Runs both linting and formatting checks.
- `npm run check:fix`: Automatically fixes linting and formatting issues.
- `npm run lint`: Lints the codebase using Biome.
- `npm run format`: Formats the codebase using Biome.

#### Testing

- `npm test`: Runs unit tests.
- `npm run test:watch`: Runs unit tests in watch mode.
- `npm run test:cov`: Runs unit tests and generates coverage reports.
- `npm run test:e2e`: Runs end-to-end tests.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

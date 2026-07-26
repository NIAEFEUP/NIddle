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

NIddle comes with built-in API documentation using Swagger. Once the application is running, you can access the documentation at:

```
http://localhost:3000/api/docs
```

This provides an interactive interface to explore and test the available endpoints.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x recommended)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Local Development

1.  **Clone the repository**

    ```bash
    git clone https://github.com/NIAEFEUP/NIddle
    cd NIddle
    ```

2.  **Set up environment variables**

    Copy the API example environment file to `apps/api/.env.local` for local development.

    ```bash
    cp apps/api/.env.example apps/api/.env.local
    ```

    Open `apps/api/.env.local` and fill in the required variables. Note that for local development without containerizing the app, `DATABASE_MASTER` should be set to `localhost`.

    If you want schema synchronization on a non-production deployment such as staging, set `DATABASE_SYNCHRONIZE=true` there. Leave it unset or `false` for production.

3.  **Start the database**

    NIddle requires a PostgreSQL database. Use Docker Compose to start a local instance:

    ```bash
    docker compose up -d
    ```

4.  **Install dependencies**

    Install the root monorepo dependencies (which also installs dependencies for all sub-workspaces):

    ```bash
    npm install
    ```

5.  **Seed the database (Optional)**

    If you want to populate the database with some initial sample data:

    ```bash
    npm run seed
    ```

6.  **Run the application**

    Run the frontend and backend concurrently in development mode:

    ```bash
    npm run dev
    ```

    The frontend will be running at `http://localhost:3000` and the API backend at `http://localhost:3001`.


## Nix Support

If you use [Nix](https://nixos.org/), this project includes a flake that provides a development shell with all the necessary tools (Node.js 22, Nest CLI, etc.).

```bash
nix develop
```

This ensures a consistent development environment across different machines.

## Docker

NIddle is fully containerized and can be easily built and run as a Docker image. The production image runs both the NestJS API and Next.js frontend standalone server concurrently in a single lightweight container.

### Building the Image

Build the Docker image from the root of the repository:

```bash
docker build -t niddle .
```

### Running the Image

To run the application container on the same network as your Postgres database, pass the environment variables (ensure `DATABASE_MASTER` points to your database container name `niddle-postgres` instead of `localhost`):

```bash
docker run --name niddle --network niddle-network -p 3000:3000 --env-file apps/api/.env.local niddle
```

## Available Scripts

### Development & Build

- `npm run dev`: Starts both the backend API and frontend web apps concurrently in development mode.
- `npm run dev:api`: Starts the NestJS backend API in development mode.
- `npm run dev:web`: Starts the Next.js frontend web app in development mode.
- `npm run build`: Builds both the API and Frontend web apps for production.
- `npm run build:api`: Builds the NestJS API.
- `npm run build:web`: Builds the Next.js frontend.
- `npm run seed`: Seeds the database with sample data (proxied to `@niddle/api`).
- `npm run schema:create`: Generates the database schema (proxied to `@niddle/api`).

### Quality & Linting

- `npm run check`: Runs both linting and formatting checks.
- `npm run check:fix`: Automatically fixes linting and formatting issues.
- `npm run lint`: Lints the codebase using Biome.
- `npm run format`: Formats the codebase using Biome.

### Testing

- `npm test`: Runs unit tests.
- `npm run test:watch`: Runs unit tests in watch mode.
- `npm run test:cov`: Runs unit tests and generates coverage reports.
- `npm run test:e2e`: Runs end-to-end tests.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

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

**NIddle** is a service dedicated to managing and providing static data for the **UNI** mobile application. It serves as a central hub for university-related information such as faculty and course events, academic services, and student association content.

The primary goal of NIddle is to provide a reliable, easily maintainable API and administration interface for the UNI app, ensuring that static resources are kept up-to-date and accessible without requiring frequent mobile application releases.

---

## Features

- **Stable REST API**: Consistent and reliable API for faculty events, course information, and student association data.
- **Admin Web Interface**: Modern web dashboard for managing university data and resources.
- **Interactive API Documentation**: Built-in interactive documentation powered by [Swagger](https://swagger.io/).
- **Database Management & Seeding**: Automated schema synchronization and fixture data seeding.
- **TypeScript First**: End-to-end type safety across backend and frontend services.
- **Containerized & CI/CD Ready**: Dockerized services, reproducible Nix shells, and automated GitHub Actions workflows.

---

## Tech Stack & Architecture

NIddle is organized as an npm monorepo with two main applications:

- **Backend API (`apps/api`)**: [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/), [Swagger](https://swagger.io/)
- **Frontend Web App (`apps/web`)**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [TanStack Query](https://tanstack.com/query)
- **Tooling & Infrastructure**: [Docker](https://www.docker.com/), [Biome](https://biomejs.dev/), [Jest](https://jestjs.io/), [Nix](https://nixos.org/)

---

## Quick Start

Get NIddle up and running locally with Docker Compose:

### 1. Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/) *(optional, but recommended)*

### 2. Clone & Configure

```bash
git clone https://github.com/NIAEFEUP/NIddle.git
cd NIddle
cp .env.example .env.docker
```

> **Note:** In `.env.docker`, ensure `DATABASE_MASTER` and `DATABASE_SLAVE` are set to `postgres`.

### 3. Run the Application

```bash
make up
# Or without make: docker compose up -d --build
```

### 4. Access Services

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Administration Web Interface |
| **Backend API** | [http://localhost:3001](http://localhost:3001) | NestJS REST API |
| **Swagger Docs** | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) | Interactive API Documentation |
| **PostgreSQL** | `localhost:5432` | Database Service |

To shut down the services:
```bash
make down
```

---

## API Documentation

NIddle includes built-in interactive Swagger documentation. When the backend API is running, access the documentation at:

```
http://localhost:3001/api/docs
```

---

## Contributing & Development

We welcome contributions! For detailed instructions on local development setups, native workflows, the Nix development shell, testing, linting/formatting rules, database seeding, and our pull request process, please read our:

👉 **[Contributing Guide](.github/CONTRIBUTING.md)**

---

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.


  # Host
  npm run seed
  ```

- **Database Schema & Migrations:**
  In development (`NODE_ENV=development`), TypeORM automatically synchronizes entities with the database when the backend starts up. Production uses database migrations:
  ```bash
  # Run pending migrations
  npm run migration:run

  # Show status of migrations
  npm run migration:show

  # Generate a new migration based on entity changes (requires running database)
  npm run migration:generate -- src/database/migrations/<MigrationName>

  # Create an empty migration template
  npm run migration:create -- src/database/migrations/<MigrationName>

  # Revert the last applied migration
  npm run migration:revert
  ```

---

## Code Quality & Standards

### Biome (Linting & Formatting)

We use [Biome](https://biomejs.dev/) for fast linting and formatting across the entire monorepo.

- **Check for issues:**
  ```bash
  make check       # Docker

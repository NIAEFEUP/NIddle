# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

NIddle is the static-data backend and admin dashboard for the UNI mobile app (faculties, courses, events, services, student associations). It is an npm workspaces monorepo (Node >= 24):

- `apps/api` (`@niddle/api`) — NestJS 11 + TypeORM + PostgreSQL, Swagger docs at `/api/docs`
- `apps/web` (`@niddle/web`) — React 19 + Vite + Tailwind 4 + TanStack Query/Form + react-router, shadcn/base-ui components

## Dev environment tips

- Use npm (not pnpm/yarn). Root scripts delegate to workspaces; target one with `-w apps/api` or `-w apps/web`.
- Add a dependency to a single workspace with `npm install <pkg> -w apps/api` (or `-w apps/web`). In the Docker workflow use `make add-api pkg=<name>` / `make add-web pkg=<name>`, which also syncs `node_modules` back to the host.
- Environment: copy `.env.example` to `.env.local` for native runs (the API and the TypeORM CLI read `.env.local`), or to `.env.docker` for Docker Compose (set `DATABASE_MASTER`/`DATABASE_SLAVE` to `postgres`).
- On startup, `UsersService.onApplicationBootstrap` creates an admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` if one doesn't exist.
- The `Makefile` wraps the npm scripts in `docker compose exec api ...` (`make up`, `make down`, `make test`, `make check`, `make seed`, `make sh-api`, ...). Run `make help` for the full list.

```bash
npm run dev:api            # NestJS watch mode on :3001
npm run dev:web            # Vite on :3000, proxies /api -> VITE_API_URL (default http://localhost:3001)
npm run build              # build api, then web

npm run seed               # DROPS the schema, then runs seeders in src/database/seeds (numeric prefix = order)
npm run migration:generate -- src/database/migrations/<Name>   # needs a running DB
npm run migration:run      # also: migration:show, migration:revert, migration:create
```

## Testing instructions

- CI is defined in `.github/workflows/checks.yml`: `biome ci ./apps`, then `npm run test:cov` (coverage uploaded to Codecov) and `npm run build`.
- Only the API has tests. They are Jest unit tests in `*.spec.ts` files next to the code in `apps/api/src`; e2e tests live in `apps/api/test/*.e2e-spec.ts`.

```bash
npm test                                                # all API unit tests
npm test -w apps/api -- src/events/events.service.spec.ts   # one file
npm test -w apps/api -- -t "name of test"               # one test by name
npm run test:e2e
npm run typecheck -w apps/api                           # also -w apps/web
npm run check                                           # Biome lint + format check
npm run check:fix                                       # autofix
```

- Fix any test, type, or Biome errors until everything passes.
- Nearly every API file (services, controllers, modules, DTOs, guards, seeders, factories) has a colocated spec. Add or update the spec for code you change.
- Tests build a Nest `TestingModule` and mock repositories via `getRepositoryToken(Entity)`. Under `NODE_ENV=test` the database is in-memory SQLite.
- The pre-commit hook (husky + lint-staged) runs `biome check --write` on staged files and the typecheck of whichever workspace was touched.

## Code conventions (enforced by Biome)

- Imports that reach a parent directory must use the `@/` alias (`@/` → `apps/api/src` or `apps/web/src`); `../` imports are a lint error. Same-directory `./` imports are fine.
- Unused variables are errors. `any` is allowed in TypeScript.
- `apps/web/src/components/ui` is generated shadcn code and is excluded from Biome. Don't hand-edit it for style.

## API architecture

- **Bootstrap** (`src/main.ts`, `src/app.module.ts`): global prefix `api`, global `ValidationPipe({ whitelist, transform })`, global `ClassSerializerInterceptor`, and exception filters that map TypeORM `EntityNotFoundError` and `QueryFailedError` to HTTP errors. Services therefore use `findOneOrFail` / `findOneByOrFail` and let the filter produce the 404 instead of throwing manually. Sentry is initialized in `src/instrument.ts`, which must be imported first.
- **Feature module layout**: each domain (`events`, `services`, `courses`, `faculties`, `associations`, `users`, `requests`, `auth`) has `controller`, `service`, `module`, `dto/`, `entities/` (`entity/` in `services`), and `decorators/<name>.decorators.ts`. The decorators file bundles Swagger docs **and** `UseGuards(...)` per endpoint via `applyDecorators`, so a route's authorization is defined there, not in the controller.
- **Auth and guards**: `JwtAuthGuard` (passport-jwt) populates `req.user`. `AdminOnlyGuard` checks `user.isAdmin`. `ActiveAssociationGuard` requires an `x-active-association` UUID header, checks the user belongs to that association (admins bypass), and sets `req.activeAssociationId`, which controllers pass to services as the creating association. `@OptionalActiveAssociationForAdmin()` makes the header optional for admins.
- **Request/approval workflow** (`src/requests`): association members don't edit events/services directly. They submit a `Request` (type `EVENT`|`SERVICE`, action `CREATE`|`UPDATE_EXISTING`|`DELETE_EXISTING`, JSON payload), which is validated against the target type's DTOs at submission. When an admin approves it, `RequestsService.approve` dispatches to the target service through `RequestRegistry`. Services that support this implement `Requestable` (`createFromRequest`/`updateFromRequest`/`removeFromRequest`). **To add a new requestable resource**: implement `Requestable` in its service, add a `RequestType` value and target relation on `Request`, and register it in `requests-registry.service.ts`.
- **Shared query helpers** in `src/common`: `paginate()` (accepts a repository or query builder, returns `PaginatedResponseDto` with `meta`), `buildOrderClause()` for sorting, and `validateAndGetRelations()` for resolving arrays of related IDs (throws if any is missing). Filter DTOs extend the pagination/sort DTOs; list endpoints use `ApiPaginatedResponse` for Swagger.
- **Database**: `src/database/data-source.ts` is the single source of TypeORM options (used by Nest, the CLI, seeding, and the production migration runner) and holds the `ENTITIES` list. Add new entities there. Supports a read replica via `DATABASE_SLAVE`. `synchronize` is on only when `NODE_ENV=development`; production runs compiled migrations (`dist/database/migrate.js`, invoked from `docker-entrypoint.sh`), so entity changes need a generated migration.

## Web architecture

- `src/lib/api-client.ts` is the only fetch wrapper: it attaches the JWT from `localStorage` (`niddle_auth_token`), sets JSON headers, and throws `ApiError`. Calls use relative `/api/...` paths (proxied by Vite in dev).
- Data access goes through TanStack Query hooks (e.g. `hooks/use-auth.ts`).
- Routing (`src/App.tsx`) uses layout-route guards in `src/routes/` (`ProtectedRoute`, `AdminRoute`, `PublicOnlyRoute`, `SidebarLayoutRoute`). Admin pages live under `/admin/*`; association-scoped pages live under `/:associationUUID/*`, where `useActiveAssociation()` resolves the association from the URL and the user's memberships. That association's ID is what gets sent as `x-active-association`.

## PR instructions

- Branch off `develop` and open PRs against `develop`. `main` is production; pushes to `develop` deploy to staging and pushes to `main` deploy to production.
- Branch names: `<type>/<short-description>` (e.g. `fix/docker-workspace-node-modules`).
- Commit messages and PR titles follow Conventional Commits with a scope: `<type>(<scope>): <summary>`, e.g. `fix(database): add compiled migration runner for production docker container`. Common types: `feat`, `fix`, `refactor`, `docs`, `chore`; scopes are usually a module or area (`api`, `events`, `requests`, `database`, `docker`, `common`).
- Before committing, run `npm run check` and `npm test` (and `npm run typecheck` for the workspace you touched).

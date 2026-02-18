# 🏋️ Gym Planner

> **AI agents:** This file is the single source of truth. Read it fully before performing any task. See also [AGENTS.md](AGENTS.md) for agent-specific rules.

A production-ready monorepo for a **Gym Planner** mobile app.

| Layer       | Stack                                                 |
| ----------- | ----------------------------------------------------- |
| **Mobile**  | React Native (Expo SDK 54) + expo-router + TypeScript |
| **API**     | Node.js + Fastify 5 + Prisma + PostgreSQL             |
| **Shared**  | Zod schemas + TS types                                |
| **Tooling** | pnpm workspaces · Docker Compose · Prettier · Vitest  |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Expo Go / Device                   │
│              apps/mobile (React Native)              │
│           ┌───────────────────────────┐              │
│           │  Expo Router (app/)       │              │
│           │  Components (src/)        │              │
│           │  API Client (src/lib/)    │              │
│           └───────────┬───────────────┘              │
└───────────────────────┼──────────────────────────────┘
                        │ HTTP (fetch)
┌───────────────────────┼──────────────────────────────┐
│              apps/api (Fastify 5)                     │
│           ┌───────────┴───────────────┐              │
│           │  Routes → Zod validation  │              │
│           │  Prisma ORM → PostgreSQL  │              │
│           └───────────────────────────┘              │
└──────────────────────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │   packages/shared           │
         │   Zod schemas + TS types    │
         │   (single source of truth)  │
         └─────────────────────────────┘
```

**Data flow:** Mobile → API client (`request<T>()`) → Fastify routes → Zod validation (shared schemas) → Prisma → PostgreSQL.

**Type safety chain:** Zod schema → `z.infer<>` → DTO type → API response typing → Mobile typed hooks. No manual type duplication.

---

## Repository structure

```
gym-planner/
├── apps/
│   ├── api/                        # Fastify REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema
│   │   │   └── migrations/         # Version-controlled migrations
│   │   └── src/
│   │       ├── app.ts              # Fastify factory (buildApp)
│   │       ├── server.ts           # Entry point (listen)
│   │       ├── lib/
│   │       │   └── prisma.ts       # Prisma singleton
│   │       ├── routes/             # Route modules (prefix-registered)
│   │       │   ├── health.ts
│   │       │   └── workouts.ts
│   │       └── __tests__/          # Vitest integration tests
│   └── mobile/                     # Expo React Native app
│       ├── app/                    # Expo Router file-based screens
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   └── create.tsx
│       ├── src/
│       │   ├── components/         # Reusable UI components
│       │   ├── hooks/              # Custom typed hooks
│       │   ├── lib/
│       │   │   └── api.ts          # Typed API client
│       │   └── features/           # Feature modules
│       └── metro.config.js         # Monorepo Metro resolution
├── packages/
│   └── shared/                     # Shared contracts
│       └── src/
│           ├── index.ts            # Barrel export
│           ├── schemas/            # Zod schemas + z.infer types
│           │   └── workout.ts
│           └── types/              # Pure TS interfaces
│               └── error.ts
├── docker/
│   └── postgres/init.sql
├── .github/
│   └── copilot-instructions.md     # GitHub Copilot context
├── AGENTS.md                       # AI agent instructions
├── CONTRIBUTING.md                 # Contribution guidelines
├── docker-compose.yml
├── pnpm-workspace.yaml
├── tsconfig.base.json              # Shared strict TS config
└── package.json                    # Root scripts
```

---

## Prerequisites

| Tool                                               | Version    |
| -------------------------------------------------- | ---------- |
| [Node.js](https://nodejs.org)                      | ≥ 22 (LTS) |
| [pnpm](https://pnpm.io)                            | ≥ 9        |
| [Docker](https://www.docker.com/) & Docker Compose | latest     |
| [Expo Go](https://expo.dev/go) (mobile)            | latest     |

---

## Quick start

### 1. Clone & install

```bash
git clone <your-repo-url> gym-planner
cd gym-planner
pnpm install
```

### 2. Environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

Defaults work for local development. Edit as needed.

### 3. Start Postgres

```bash
docker compose up -d
```

> **No Docker?** Install [PostgreSQL](https://www.postgresql.org/download/) directly, create user `gym` / password `gym_secret` / database `gym_planner`, then update `apps/api/.env`.

### 4. Initialize the database

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Create tables (name: "init")
```

### 5. Build the shared package

```bash
pnpm --filter @gym-planner/shared build
```

### 6. Start development

```bash
pnpm dev            # API + Mobile in parallel

# — or individually —
pnpm dev:api        # http://localhost:3000
pnpm dev:mobile     # Expo dev server
```

### 7. Verify the API

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}

curl http://localhost:3000/workouts
# → []

curl -X POST http://localhost:3000/workouts \
  -H "Content-Type: application/json" \
  -d '{"name":"Push Day"}'
# → {"id":"...","name":"Push Day","createdAt":"..."}
```

---

## Scripts reference

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Run API + Mobile concurrently |
| `pnpm dev:api`      | Run API in watch mode         |
| `pnpm dev:mobile`   | Start Expo dev server         |
| `pnpm build`        | Build all packages            |
| `pnpm lint`         | Type-check all packages       |
| `pnpm format`       | Format with Prettier          |
| `pnpm format:check` | Check formatting              |
| `pnpm test`         | Run all tests (Vitest)        |
| `pnpm db:generate`  | Regenerate Prisma client      |
| `pnpm db:migrate`   | Apply Prisma migrations       |
| `pnpm db:push`      | Push schema without migration |
| `pnpm db:studio`    | Open Prisma Studio GUI        |

---

## Mobile development

| Device           | `EXPO_PUBLIC_API_URL`                    |
| ---------------- | ---------------------------------------- |
| Android emulator | `http://10.0.2.2:3000`                   |
| iOS simulator    | `http://localhost:3000`                  |
| Physical device  | `http://<YOUR_LAN_IP>:3000` (same Wi-Fi) |

Set in `apps/mobile/.env`. Find your LAN IP: `ipconfig` (Windows) / `ifconfig` (macOS/Linux).

---

## Development rules

### TypeScript — zero tolerance for `any`

- **NEVER** use `any`, `as any`, `unknown as any`, or implicit `any`
- All types derived from Zod schemas via `z.infer<>` — no manual duplication
- Use proper alternatives: `unknown`, generics `<T>`, discriminated unions, utility types
- `tsconfig.base.json` enforces: `strict`, `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`

### Shared package (`packages/shared`)

- **All data contracts** live here as Zod schemas
- Types are inferred: `export type WorkoutDTO = z.infer<typeof WorkoutSchema>`
- Both API and mobile import from `@gym-planner/shared`
- Never define the same type in two places

### API (`apps/api`)

- Fastify 5 with typed route handlers
- Prisma for database access — never raw SQL
- `buildApp()` factory pattern — separates construction from `listen()` (enables testing)
- Error handler: consistent `{ statusCode, error, message }` shape via `FastifyError`
- All request bodies validated with shared Zod schemas
- Routes registered with prefixes: `app.register(routes, { prefix: '/workouts' })`
- Pino logger: `pino-pretty` dev only, JSON in production

### Mobile (`apps/mobile`)

- Expo Router for file-based navigation in `app/`
- Non-route code in `src/` (components, hooks, lib, features)
- `metro.config.js` required for pnpm monorepo resolution
- API client: typed generic `request<T>()` wrapper in `src/lib/api.ts`
- All component props must have interfaces
- All hooks must have typed return values
- All API calls must have typed responses

### Error handling

API errors always return:

```json
{ "statusCode": 400, "error": "ValidationError", "message": "...", "issues": [...] }
```

Mobile: `err instanceof Error ? err.message : 'Unknown error'` — never assume error shape.

---

## Tech decisions

| Decision                      | Rationale                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------- |
| **Fastify** over Express/Nest | Fastest Node.js framework, first-class TS, built-in validation, low overhead |
| **Prisma** over raw SQL/Knex  | Type-safe queries, auto-generated client, migration management               |
| **Zod** for validation        | Schema-first, TS-native, shared between client and server                    |
| **pnpm workspaces**           | Strict hoisting, disk-efficient, prevents phantom dependencies               |
| **expo-router**               | File-based routing for React Native, typed routes, deep linking              |
| **Factory pattern**           | `buildApp()` decouples app creation from server start — enables testing      |
| **UUID primary keys**         | Safe for distributed systems, no sequential enumeration                      |

---

## Git conventions

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

**Branches:** `feature/workout-creation`, `fix/validation-error`, `chore/upgrade-expo-sdk`

**Commits** (Conventional Commits):

```
feat(workout): implement workout creation API
fix(mobile): resolve offline cache hydration
chore(deps): upgrade Expo SDK to 54
refactor(api): extract error handler
test(workout): add schema validation tests
```

---

## Roadmap

### Completed

- [x] Monorepo setup with pnpm workspaces
- [x] Shared Zod schemas package
- [x] PostgreSQL + Docker Compose + Prisma
- [x] Fastify REST API with typed routes
- [x] Expo mobile app with file-based routing
- [x] Strict TypeScript enforcement (zero `any`)

### Next

- [ ] **Testing** — Integration tests with `app.inject()`, mock Prisma
- [ ] **Feature expansion** — Exercises, Sets, workout logging
- [ ] **Offline-first** — TanStack Query + AsyncStorage persistence
- [ ] **Production** — Env validation, rate limiting, helmet, CI/CD, EAS Build

---

## License

See [LICENSE](./LICENSE).

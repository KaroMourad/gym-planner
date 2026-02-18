# AGENTS.md — AI Agent Instructions

## ⚠️ MANDATORY FIRST STEP

**Before performing ANY task in this repository, you MUST read [README.md](README.md) completely.**

README.md is the **single source of truth** for this project's architecture, rules, folder structure, and conventions. Do not skip it. Do not assume you know the project structure.

After reading README.md, review this file for agent-specific behavioral rules.

---

## What this project is

A production-ready **Gym Planner** monorepo with three packages:

| Package           | Purpose            | Technology                |
| ----------------- | ------------------ | ------------------------- |
| `apps/api`        | REST API server    | Fastify 5 + Prisma + Pino |
| `apps/mobile`     | Mobile application | Expo SDK 54 + expo-router |
| `packages/shared` | Shared contracts   | Zod schemas + TS types    |

---

## Rules you MUST follow

### 1. Never use `any`

Zero tolerance. This is non-negotiable.

- **NEVER** use `any`, `as any`, `unknown as any`, or allow implicit `any`
- Use proper alternatives: `unknown`, generics `<T>`, discriminated unions, interfaces, type aliases, Zod-inferred types, utility types (`Partial`, `Pick`, `Record`, `Omit`, etc.)
- Run `pnpm lint` to verify — it must pass with zero errors

### 2. All types come from Zod schemas

- Define Zod schemas in `packages/shared/src/schemas/`
- Infer types: `export type WorkoutDTO = z.infer<typeof WorkoutSchema>`
- **Never manually duplicate types** — if a type exists in shared, import it
- Both `apps/api` and `apps/mobile` import from `@gym-planner/shared`

### 3. Follow existing patterns exactly

Before creating any new file, find an existing file of the same kind and match its structure:

| Creating...             | Reference file                                 |
| ----------------------- | ---------------------------------------------- |
| New Zod schema          | `packages/shared/src/schemas/workout.ts`       |
| New API route           | `apps/api/src/routes/workouts.ts`              |
| New mobile screen       | `apps/mobile/app/index.tsx`, `app/create.tsx`  |
| New API method (mobile) | `apps/mobile/src/lib/api.ts`                   |
| New component           | Match existing components in `src/components/` |
| New test                | `apps/api/src/__tests__/workout.test.ts`       |

**Do not invent new patterns, new folder structures, or new architectural approaches.**

### 4. Never break the architecture

- **Shared package** — all data contracts (Zod schemas, DTO types, error types) live in `packages/shared`. Never define a DTO in `apps/api` or `apps/mobile`
- **API factory pattern** — `buildApp()` in `app.ts` builds the Fastify instance. `server.ts` calls `listen()`. Never merge them
- **Route registration** — routes are separate files registered with `app.register(fn, { prefix })`. Never add routes directly in `app.ts`
- **Prisma singleton** — use `prisma` from `src/lib/prisma.ts`. Never create new `PrismaClient` instances
- **Mobile routing** — screens go in `app/` (Expo Router). Non-route code goes in `src/`. Never put business logic in `app/` files

### 5. API error shape is fixed

All API errors MUST return this exact shape:

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Invalid request body",
  "issues": [{ "path": "name", "message": "Required" }]
}
```

The `issues` field is included only for validation errors.

### 6. Validation is always shared

- Request body validation uses Zod schemas from `@gym-planner/shared`
- Use `Schema.safeParse(request.body)` — never trust unvalidated input
- Client-side validation uses the same schemas before submission

---

## Adding a new feature — step by step

Follow this exact order:

1. **Schema** — Create Zod schema + inferred type in `packages/shared/src/schemas/`
2. **Export** — Add export to `packages/shared/src/index.ts`
3. **Build shared** — Run `pnpm --filter @gym-planner/shared build`
4. **Prisma model** (if new entity) — Add model to `prisma/schema.prisma`, run `pnpm db:migrate`
5. **API route** — Create route file in `apps/api/src/routes/`, register in `app.ts` with prefix
6. **Mobile API method** — Add typed method to `apps/mobile/src/lib/api.ts`
7. **Mobile screen** — Create screen in `apps/mobile/app/`
8. **Test** — Add tests in `apps/api/src/__tests__/`
9. **Update docs** — Update `README.md`, `AGENTS.md`, `.github/copilot-instructions.md`, and `CONTRIBUTING.md` to reflect any new features, patterns, commands, or folder structure changes
10. **Verify** — Run `pnpm lint && pnpm test`

---

## File naming conventions

| Item             | Convention         | Example                                |
| ---------------- | ------------------ | -------------------------------------- |
| Zod schema file  | `kebab-case.ts`    | `workout.ts`, `exercise-set.ts`        |
| API route file   | `kebab-case.ts`    | `workouts.ts`, `exercises.ts`          |
| Route function   | `camelCaseRoutes`  | `workoutRoutes`, `exerciseRoutes`      |
| Mobile screen    | `kebab-case.tsx`   | `index.tsx`, `create.tsx`              |
| Component file   | `PascalCase.tsx`   | `WorkoutCard.tsx`                      |
| Hook file        | `camelCase.ts`     | `useWorkouts.ts`                       |
| Type/DTO         | `PascalCase`       | `WorkoutDTO`, `CreateWorkoutDTO`       |
| Zod schema const | `PascalCaseSchema` | `WorkoutSchema`, `CreateWorkoutSchema` |

---

## Commands you should run

| When                     | Command                                   |
| ------------------------ | ----------------------------------------- |
| After changing shared    | `pnpm --filter @gym-planner/shared build` |
| After changing Prisma    | `pnpm db:generate && pnpm db:migrate`     |
| Before committing        | `pnpm lint && pnpm test`                  |
| To type-check everything | `pnpm lint`                               |
| To format                | `pnpm format`                             |

---

## Documentation — keep it current

Every commit that changes architecture, adds features, introduces new patterns, or modifies folder structure **MUST** also update the relevant documentation files:

- **`README.md`** — project overview, folder structure, setup, scripts, roadmap
- **`AGENTS.md`** — agent rules, patterns table, feature checklist, naming conventions
- **`.github/copilot-instructions.md`** — quick reference, code pattern examples
- **`CONTRIBUTING.md`** — PR checklist, branch/commit conventions

Documentation drift is a bug. Treat these files as code — they must stay in sync with the implementation.

---

## Things you MUST NOT do

- Create files outside the established folder structure
- Add new dependencies without justification
- Use `console.log` in API code (use Fastify's Pino logger)
- Skip Zod validation on any API endpoint
- Use `db push` instead of `db migrate` for schema changes
- Put non-route code in `apps/mobile/app/`
- Create new `PrismaClient` instances
- Add `// @ts-ignore` or `// @ts-expect-error` without a linked issue
- Commit `.env` files or secrets

---

## Git conventions

Follow [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit messages, and PR requirements.

**Commit format:** `type(scope): description`

```
feat(workout): implement workout creation API
fix(mobile): resolve offline cache hydration
test(workout): add schema validation edge cases
```

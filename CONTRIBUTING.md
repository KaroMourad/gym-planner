# Contributing to Gym Planner

## Prerequisites

Read [README.md](README.md) for project setup and architecture. Read [AGENTS.md](AGENTS.md) if you are an AI agent.

---

## Branch naming

Format: `type/short-description`

| Type        | Use case                                | Example                      |
| ----------- | --------------------------------------- | ---------------------------- |
| `feature/`  | New functionality                       | `feature/workout-creation`   |
| `fix/`      | Bug fix                                 | `fix/validation-error`       |
| `chore/`    | Maintenance, deps, config               | `chore/upgrade-expo-sdk`     |
| `refactor/` | Code restructuring (no behavior change) | `refactor/api-error-handler` |
| `test/`     | Adding or updating tests                | `test/workout-schema-edges`  |
| `docs/`     | Documentation only                      | `docs/update-readme`         |

Always branch from `main`. Keep branches short-lived.

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/).

Format: `type(scope): description`

```
feat(workout): implement workout creation API
fix(mobile): resolve offline cache hydration
chore(deps): upgrade Expo SDK to 54
refactor(api): extract error handler middleware
test(workout): add schema validation edge cases
docs(readme): update setup instructions
```

### Rules

- **Type** — `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `ci`, `perf`
- **Scope** — package or feature: `workout`, `mobile`, `api`, `shared`, `deps`, `docker`
- **Description** — imperative mood, lowercase, no period: "add validation" not "Added validation."
- **Breaking changes** — append `!`: `feat(api)!: change error response shape`

---

## Pull request requirements

### Before opening a PR

1. **Type-check passes:** `pnpm lint`
2. **Tests pass:** `pnpm test`
3. **Formatting clean:** `pnpm format:check`
4. **Shared package built** (if changed): `pnpm --filter @gym-planner/shared build`
5. **No `any`** anywhere in the codebase
6. **Docs updated** — if your change adds features, patterns, commands, or alters folder structure, update: `README.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `CONTRIBUTING.md`

### PR description

Include:

- **What** — brief description of the change
- **Why** — motivation or linked issue
- **How** — implementation approach (if non-obvious)
- **Testing** — how it was verified

### PR title

Same format as commit messages:

```
feat(workout): add exercise CRUD endpoints
```

### Review checklist

- [ ] No `any`, `as any`, or implicit `any`
- [ ] Types derived from Zod schemas via `z.infer<>`
- [ ] API routes validate input with shared Zod schemas
- [ ] New files follow existing folder structure and naming conventions
- [ ] Error responses follow the standard `{ statusCode, error, message }` shape
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes

---

## Code quality standards

### TypeScript

- Strict mode — zero tolerance for `any`
- All types inferred from Zod schemas — never duplicate types manually
- All component props typed with interfaces
- All API responses typed with shared DTOs

### Testing

- Schema validation tests for all Zod schemas
- Integration tests using `buildApp()` + `app.inject()` (no network)
- Test both success and error paths

### Error handling

- API: consistent `{ statusCode, error, message, issues? }` shape
- Mobile: `err instanceof Error ? err.message : 'Unknown error'`
- Never expose stack traces

---

## Adding a new feature

Follow the order documented in [AGENTS.md](AGENTS.md#adding-a-new-feature--step-by-step):

1. Schema in `packages/shared`
2. Export in barrel file
3. Build shared package
4. Prisma model + migration (if needed)
5. API route + register
6. Mobile API method
7. Mobile screen
8. Tests
9. `pnpm lint && pnpm test`

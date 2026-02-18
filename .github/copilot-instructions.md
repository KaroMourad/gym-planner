# Gym Planner — Copilot Instructions

## ⚠️ MANDATORY: Read README.md first

Before performing ANY task, read [README.md](../README.md). It is the single source of truth.

For detailed agent behavioral rules, read [AGENTS.md](../AGENTS.md).

**Keep docs updated:** Every commit that changes features, patterns, or structure MUST update `README.md`, `AGENTS.md`, `.github/copilot-instructions.md`, and `CONTRIBUTING.md`.

---

## Quick reference

### TypeScript — zero `any`

- **NEVER** use `any`, `as any`, `unknown as any`, or implicit `any`
- All types derived from Zod schemas via `z.infer<>` — no manual type duplication
- Use: `unknown`, generics `<T>`, discriminated unions, interfaces, utility types
- `tsconfig.base.json` enforces: `strict`, `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`

### Architecture — do not deviate

- **Shared** (`packages/shared`) — Zod schemas + inferred types. Single source of truth for all data contracts
- **API** (`apps/api`) — Fastify 5, `buildApp()` factory, Prisma ORM, route modules registered with prefixes
- **Mobile** (`apps/mobile`) — Expo Router screens in `app/`, business logic in `src/`, Metro config for monorepo

### Patterns — follow what exists

| Task                  | Reference                                |
| --------------------- | ---------------------------------------- |
| New Zod schema        | `packages/shared/src/schemas/workout.ts` |
| New API route         | `apps/api/src/routes/workouts.ts`        |
| New screen            | `apps/mobile/app/index.tsx`              |
| New API client method | `apps/mobile/src/lib/api.ts`             |
| New test              | `apps/api/src/__tests__/workout.test.ts` |

---

## Code Patterns

### Adding a new Zod schema (shared)

```typescript
// packages/shared/src/schemas/exercise.ts
import { z } from 'zod';

export const CreateExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  workoutId: z.string().uuid(),
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  workoutId: z.string().uuid(),
  createdAt: z.coerce.date(),
});

export type CreateExerciseDTO = z.infer<typeof CreateExerciseSchema>;
export type ExerciseDTO = z.infer<typeof ExerciseSchema>;
```

### Adding an API route

```typescript
// apps/api/src/routes/exercises.ts
import type { FastifyInstance } from 'fastify';
import { CreateExerciseSchema } from '@gym-planner/shared';
import { prisma } from '../lib/prisma.js';

export async function exerciseRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const exercises = await prisma.exercise.findMany();
    return reply.send(exercises);
  });

  app.post('/', async (request, reply) => {
    const parsed = CreateExerciseSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'ValidationError',
        message: 'Invalid request body',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    const exercise = await prisma.exercise.create({ data: parsed.data });
    return reply.status(201).send(exercise);
  });
}
```

### Adding a mobile API method

```typescript
// apps/mobile/src/lib/api.ts
export const api = {
  getExercises: (workoutId: string) => request<ExerciseDTO[]>(`/workouts/${workoutId}/exercises`),

  createExercise: (data: CreateExerciseDTO) =>
    request<ExerciseDTO>('/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

### Typed React Native component

```typescript
interface WorkoutCardProps {
  workout: WorkoutDTO;
  onPress: (id: string) => void;
}

export function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  return (
    <Pressable onPress={() => onPress(workout.id)}>
      <Text>{workout.name}</Text>
    </Pressable>
  );
}
```

---

## Error Handling

### API error shape (always)

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Invalid request body",
  "issues": [{ "path": "name", "message": "Required" }]
}
```

### Mobile error handling

- Use `err instanceof Error ? err.message : 'Unknown error'` — never assume error shape
- Display errors in UI banners or `Alert.alert()`

---

## Git Conventions

### Branch naming

```
feature/workout-creation
fix/workout-validation-error
chore/upgrade-expo-sdk
refactor/api-error-handler
```

### Commit messages (Conventional Commits)

```
feat(workout): implement workout creation API
fix(mobile): resolve offline cache hydration
chore(deps): upgrade Expo SDK to 54
refactor(api): extract error handler
test(workout): add schema validation tests
```

---

## Commands Reference

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `pnpm dev`         | Run API + Mobile concurrently |
| `pnpm dev:api`     | Run API in watch mode         |
| `pnpm dev:mobile`  | Start Expo dev server         |
| `pnpm build`       | Build all packages            |
| `pnpm lint`        | Type-check all packages       |
| `pnpm test`        | Run all tests (Vitest)        |
| `pnpm db:generate` | Regenerate Prisma client      |
| `pnpm db:migrate`  | Apply Prisma migrations       |
| `pnpm db:studio`   | Open Prisma Studio GUI        |

---

## Implementation Phases (What's Next)

### Completed (Phases 1–5)

- Monorepo setup with pnpm workspaces
- Shared Zod schemas package
- PostgreSQL + Docker Compose + Prisma
- Fastify REST API with typed routes
- Expo mobile app with file-based routing

### Next Up

- **Phase 6 — Testing**: Integration tests with `app.inject()`, mock Prisma
- **Phase 7 — Feature Expansion**: Exercises, Sets, workout logging (nested Prisma relations, nested routes)
- **Phase 8 — Offline-First**: TanStack Query + AsyncStorage persistence + optimistic updates
- **Phase 9 — Production**: Env validation (Zod), rate limiting, helmet, graceful shutdown, CI/CD, EAS Build

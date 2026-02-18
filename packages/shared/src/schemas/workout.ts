import { z } from 'zod';

// ---------------------------------------------------------------------------
// Workout Zod Schemas
// ---------------------------------------------------------------------------

/** Schema for creating a new workout (request body). */
export const CreateWorkoutSchema = z.object({
  name: z
    .string()
    .min(1, 'Workout name is required')
    .max(120, 'Workout name must be 120 characters or less'),
});

/** Full workout as returned by the API. */
export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
});

/** Array of workouts. */
export const WorkoutsListSchema = z.array(WorkoutSchema);

// ---------------------------------------------------------------------------
// Inferred DTO types
// ---------------------------------------------------------------------------

export type CreateWorkoutDTO = z.infer<typeof CreateWorkoutSchema>;
export type WorkoutDTO = z.infer<typeof WorkoutSchema>;

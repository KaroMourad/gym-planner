import type { FastifyInstance } from 'fastify';
import { CreateWorkoutSchema } from '@gym-planner/shared';
import { prisma } from '../lib/prisma.js';

export async function workoutRoutes(app: FastifyInstance) {
  // ---- GET /workouts ----
  app.get('/', async (_request, reply) => {
    const workouts = await prisma.workout.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(workouts);
  });

  // ---- POST /workouts ----
  app.post('/', async (request, reply) => {
    const parsed = CreateWorkoutSchema.safeParse(request.body);

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

    const workout = await prisma.workout.create({
      data: { name: parsed.data.name },
    });

    return reply.status(201).send(workout);
  });
}

import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { workoutRoutes } from './routes/workouts.js';

export async function buildApp() {
  const isDev = process.env['NODE_ENV'] !== 'production';

  const app = Fastify({
    logger: isDev
      ? {
          level: 'info',
          transport: { target: 'pino-pretty', options: { colorize: true } },
        }
      : { level: 'info' },
  });

  // ------ Plugins ------
  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? '*',
  });

  // ------ Error handler (consistent shape) ------
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    void reply.status(statusCode).send({
      statusCode,
      error: error.name,
      message: error.message,
    });
  });

  // ------ Routes ------
  await app.register(healthRoutes, { prefix: '/' });
  await app.register(workoutRoutes, { prefix: '/workouts' });

  return app;
}

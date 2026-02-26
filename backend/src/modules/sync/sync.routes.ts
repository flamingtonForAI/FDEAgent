import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { syncService } from './sync.service.js';
import { batchSyncSchema, type BatchSyncInput } from './sync.schema.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { syncRateLimitConfig } from '../../middleware/rate-limit.middleware.js';

export async function syncRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', authenticate);

  // POST /api/sync - Batch sync (offline-first)
  app.post<{ Body: BatchSyncInput }>(
    '/',
    {
      config: {
        rateLimit: syncRateLimitConfig.batchSync,
      },
    },
    async (
      request: FastifyRequest<{ Body: BatchSyncInput }>,
      reply: FastifyReply
    ) => {
      const input = batchSyncSchema.parse(request.body);
      const result = await syncService.batchSync(request.user!.userId, input);
      return reply.send(result);
    }
  );

  // GET /api/sync/full - Get full state (initial sync)
  app.get(
    '/full',
    {
      config: {
        rateLimit: syncRateLimitConfig.fullState,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const state = await syncService.getFullState(request.user!.userId);
      return reply.send(state);
    }
  );
}

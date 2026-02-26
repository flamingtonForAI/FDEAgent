import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { preferencesService } from './preferences.service.js';
import {
  updatePreferencesSchema,
  type UpdatePreferencesInput,
} from './preferences.schema.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function preferencesRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', authenticate);

  // GET /api/preferences - Get user preferences
  app.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const preferences = await preferencesService.getPreferences(
        request.user!.userId
      );
      return reply.send(preferences);
    }
  );

  // PUT /api/preferences - Update user preferences
  app.put<{ Body: UpdatePreferencesInput }>(
    '/',
    async (
      request: FastifyRequest<{ Body: UpdatePreferencesInput }>,
      reply: FastifyReply
    ) => {
      const input = updatePreferencesSchema.parse(request.body);
      const preferences = await preferencesService.updatePreferences(
        request.user!.userId,
        input
      );
      return reply.send(preferences);
    }
  );
}

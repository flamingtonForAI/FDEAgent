import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { archetypesService } from './archetypes.service.js';
import {
  createArchetypeSchema,
  updateArchetypeSchema,
  type CreateArchetypeInput,
  type UpdateArchetypeInput,
} from './archetypes.schema.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function archetypeRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', authenticate);

  // GET /api/archetypes - List all archetypes
  app.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const archetypes = await archetypesService.listArchetypes(
        request.user!.userId
      );
      return reply.send(archetypes);
    }
  );

  // POST /api/archetypes - Import/create an archetype
  app.post<{ Body: CreateArchetypeInput }>(
    '/',
    async (
      request: FastifyRequest<{ Body: CreateArchetypeInput }>,
      reply: FastifyReply
    ) => {
      const input = createArchetypeSchema.parse(request.body);
      const archetype = await archetypesService.createArchetype(
        request.user!.userId,
        input
      );
      return reply.status(201).send(archetype);
    }
  );

  // GET /api/archetypes/:id - Get a single archetype
  app.get<{ Params: { id: string } }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const archetype = await archetypesService.getArchetype(
        request.params.id,
        request.user!.userId
      );
      return reply.send(archetype);
    }
  );

  // PUT /api/archetypes/:id - Update an archetype
  app.put<{ Params: { id: string }; Body: UpdateArchetypeInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateArchetypeInput }>,
      reply: FastifyReply
    ) => {
      const input = updateArchetypeSchema.parse(request.body);
      const archetype = await archetypesService.updateArchetype(
        request.params.id,
        request.user!.userId,
        input
      );
      return reply.send(archetype);
    }
  );

  // DELETE /api/archetypes/:id - Delete an archetype
  app.delete<{ Params: { id: string } }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await archetypesService.deleteArchetype(
        request.params.id,
        request.user!.userId
      );
      return reply.status(204).send();
    }
  );
}

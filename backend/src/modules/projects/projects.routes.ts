import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { projectsService } from './projects.service.js';
import {
  createProjectSchema,
  updateProjectSchema,
  chatMessageSchema,
  paginationSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ChatMessageInput,
} from './projects.schema.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { z } from 'zod';

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', authenticate);

  // GET /api/projects - List all projects
  app.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const projects = await projectsService.listProjects(request.user!.userId);
      return reply.send(projects);
    }
  );

  // POST /api/projects - Create a new project
  app.post<{ Body: CreateProjectInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateProjectInput }>, reply: FastifyReply) => {
      const input = createProjectSchema.parse(request.body);
      const project = await projectsService.createProject(request.user!.userId, input);
      return reply.status(201).send(project);
    }
  );

  // GET /api/projects/:id - Get a single project
  app.get<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const project = await projectsService.getProject(
        request.params.id,
        request.user!.userId
      );
      return reply.send(project);
    }
  );

  // PUT /api/projects/:id - Update a project
  app.put<{ Params: { id: string }; Body: UpdateProjectInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateProjectInput }>,
      reply: FastifyReply
    ) => {
      const input = updateProjectSchema.parse(request.body);
      const project = await projectsService.updateProject(
        request.params.id,
        request.user!.userId,
        input
      );
      return reply.send(project);
    }
  );

  // DELETE /api/projects/:id - Delete a project
  app.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      await projectsService.deleteProject(request.params.id, request.user!.userId);
      return reply.status(204).send();
    }
  );

  // GET /api/projects/:id/chat - Get chat messages (paginated)
  app.get<{ Params: { id: string }; Querystring: { page?: string; limit?: string } }>(
    '/:id/chat',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { page?: string; limit?: string };
      }>,
      reply: FastifyReply
    ) => {
      const pagination = paginationSchema.parse(request.query);
      const result = await projectsService.getChatMessages(
        request.params.id,
        request.user!.userId,
        pagination
      );
      return reply.send(result);
    }
  );

  // POST /api/projects/:id/chat - Add a chat message
  app.post<{ Params: { id: string }; Body: ChatMessageInput }>(
    '/:id/chat',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: ChatMessageInput }>,
      reply: FastifyReply
    ) => {
      const input = chatMessageSchema.parse(request.body);
      const message = await projectsService.addChatMessage(
        request.params.id,
        request.user!.userId,
        input
      );
      return reply.status(201).send(message);
    }
  );

  // POST /api/projects/:id/chat/batch - Add multiple chat messages
  app.post<{ Params: { id: string }; Body: ChatMessageInput[] }>(
    '/:id/chat/batch',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: ChatMessageInput[] }>,
      reply: FastifyReply
    ) => {
      const messages = z.array(chatMessageSchema).parse(request.body);
      const result = await projectsService.addChatMessages(
        request.params.id,
        request.user!.userId,
        messages
      );
      return reply.status(201).send(result);
    }
  );

  // GET /api/projects/:id/audit - Get audit logs (paginated)
  app.get<{ Params: { id: string }; Querystring: { page?: string; limit?: string } }>(
    '/:id/audit',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { page?: string; limit?: string };
      }>,
      reply: FastifyReply
    ) => {
      const pagination = paginationSchema.parse(request.query);
      const result = await projectsService.getAuditLogs(
        request.params.id,
        request.user!.userId,
        pagination
      );
      return reply.send(result);
    }
  );
}

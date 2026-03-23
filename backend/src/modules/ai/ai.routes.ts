import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware.js';
import { aiService } from './ai.service.js';
import type { ChatMessage } from './providers/types.js';
import {
  chatRequestSchema,
  designRequestSchema,
  modelsQuerySchema,
  type ChatRequest,
  type DesignRequest,
  type ModelsQuery,
} from './ai.schema.js';

/** Rate limit config for AI endpoints (more restrictive than general API). */
const aiRateLimitConfig = {
  chat: { max: 30, timeWindow: 60 * 1000 },
  design: { max: 10, timeWindow: 60 * 1000 },
  models: { max: 20, timeWindow: 60 * 1000 },
};

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/ai/health — public, no auth
  app.get('/health', async () => ({
    status: 'ok',
    mode: 'proxy',
  }));

  // POST /api/ai/chat — proxy chat request
  app.post<{ Body: ChatRequest }>(
    '/chat',
    {
      preHandler: [authenticate],
      config: { rateLimit: aiRateLimitConfig.chat },
    },
    async (request: FastifyRequest<{ Body: ChatRequest }>, reply: FastifyReply) => {
      const input = chatRequestSchema.parse(request.body);
      const messages = input.messages as ChatMessage[];
      const result = await aiService.chat(
        input.provider,
        input.model,
        messages,
        input.options,
        request.user?.userId,
      );
      return reply.send({ content: result });
    },
  );

  // POST /api/ai/design — proxy ontology design
  app.post<{ Body: DesignRequest }>(
    '/design',
    {
      preHandler: [authenticate],
      config: { rateLimit: aiRateLimitConfig.design },
    },
    async (request: FastifyRequest<{ Body: DesignRequest }>, reply: FastifyReply) => {
      const input = designRequestSchema.parse(request.body);
      const chatHistory = input.chatHistory as ChatMessage[];
      const result = await aiService.design(
        input.provider,
        input.model,
        chatHistory,
        input.options,
        request.user?.userId,
      );
      return reply.send({ content: result });
    },
  );

  // GET /api/ai/models — proxy model discovery
  app.get<{ Querystring: ModelsQuery }>(
    '/models',
    {
      preHandler: [authenticate],
      config: { rateLimit: aiRateLimitConfig.models },
    },
    async (request: FastifyRequest<{ Querystring: ModelsQuery }>, reply: FastifyReply) => {
      const query = modelsQuerySchema.parse(request.query);
      const models = await aiService.listModels(query.provider, request.user?.userId);
      return reply.send({ models });
    },
  );

  // GET /api/ai/audit — return user's recent AI audit logs
  app.get(
    '/audit',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const logs = await aiService.getAuditLogs(request.user!.userId);
      return reply.send({ logs });
    },
  );
}

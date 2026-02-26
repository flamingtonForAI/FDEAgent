import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshInput,
  type LogoutInput,
} from './auth.schema.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authRateLimitConfig } from '../../middleware/rate-limit.middleware.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register - Register a new user
  app.post<{ Body: RegisterInput }>(
    '/register',
    {
      config: {
        rateLimit: authRateLimitConfig.register,
      },
    },
    async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
      const input = registerSchema.parse(request.body);
      const result = await authService.register(input);
      return reply.status(201).send(result);
    }
  );

  // POST /api/auth/login - Login
  app.post<{ Body: LoginInput }>(
    '/login',
    {
      config: {
        rateLimit: authRateLimitConfig.login,
      },
    },
    async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
      const input = loginSchema.parse(request.body);
      const result = await authService.login(input);
      return reply.send(result);
    }
  );

  // POST /api/auth/refresh - Refresh access token
  app.post<{ Body: RefreshInput }>(
    '/refresh',
    async (request: FastifyRequest<{ Body: RefreshInput }>, reply: FastifyReply) => {
      const input = refreshSchema.parse(request.body);
      const result = await authService.refresh(input.refreshToken);
      return reply.send(result);
    }
  );

  // POST /api/auth/logout - Logout
  app.post<{ Body: LogoutInput }>(
    '/logout',
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Body: LogoutInput }>, reply: FastifyReply) => {
      const input = logoutSchema.parse(request.body);
      await authService.logout(input.refreshToken, request.user?.userId);
      return reply.status(204).send();
    }
  );

  // GET /api/auth/me - Get current user
  app.get(
    '/me',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await authService.getCurrentUser(request.user!.userId);
      return reply.send(user);
    }
  );
}

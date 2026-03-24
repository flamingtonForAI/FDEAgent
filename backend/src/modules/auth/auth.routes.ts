import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  changePasswordSchema,
  deleteAccountSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshInput,
  type LogoutInput,
  type ChangePasswordInput,
  type DeleteAccountInput,
} from './auth.schema.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authRateLimitConfig, accountRateLimitConfig } from '../../middleware/rate-limit.middleware.js';

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

  // PUT /api/auth/password - Change password
  app.put<{ Body: ChangePasswordInput }>(
    '/password',
    {
      preHandler: [authenticate],
      config: { rateLimit: accountRateLimitConfig.changePassword },
    },
    async (request, reply) => {
      const input = changePasswordSchema.parse(request.body);
      const result = await authService.changePassword(
        request.user!.userId,
        input.currentPassword,
        input.newPassword
      );
      return reply.send(result);
    }
  );

  // POST /api/auth/logout-all - Logout from all devices
  app.post(
    '/logout-all',
    {
      preHandler: [authenticate],
      config: { rateLimit: accountRateLimitConfig.logoutAll },
    },
    async (request, reply) => {
      await authService.logoutAll(request.user!.userId);
      return reply.status(204).send();
    }
  );

  // GET /api/auth/account/deletion-check - Check if account can be deleted
  app.get(
    '/account/deletion-check',
    {
      preHandler: [authenticate],
      config: { rateLimit: accountRateLimitConfig.deletionCheck },
    },
    async (request, reply) => {
      const result = await authService.getDeletionCheck(request.user!.userId);
      return reply.send(result);
    }
  );

  // POST /api/auth/account/delete - Delete account
  app.post<{ Body: DeleteAccountInput }>(
    '/account/delete',
    {
      preHandler: [authenticate],
      config: { rateLimit: accountRateLimitConfig.deleteAccount },
    },
    async (request, reply) => {
      const input = deleteAccountSchema.parse(request.body);
      await authService.deleteAccount(
        request.user!.userId,
        input.password,
        input.confirmEmail
      );
      return reply.status(204).send();
    }
  );
}

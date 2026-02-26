import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error.middleware.js';
import { registerRateLimit } from './middleware/rate-limit.middleware.js';

// Import routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { projectRoutes } from './modules/projects/projects.routes.js';
import { preferencesRoutes } from './modules/preferences/preferences.routes.js';
import { archetypeRoutes } from './modules/archetypes/archetypes.routes.js';
import { syncRoutes } from './modules/sync/sync.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // We use our own logger
    bodyLimit: 10 * 1024 * 1024, // 10MB max request body size
  });

  // Register security headers via helmet
  await app.register(helmet, {
    // CSP disabled for API-only server (no HTML served)
    contentSecurityPolicy: false,
    // Additional security headers
    crossOriginEmbedderPolicy: false, // Allow embedding
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow CORS
  });

  // Register CORS
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // CSRF protection: Validate Origin header for state-changing requests
  app.addHook('preHandler', async (request, reply) => {
    // Skip for safe methods and health check
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method) || request.url === '/health') {
      return;
    }

    // Get Origin header
    const origin = request.headers.origin;

    // In production, require valid Origin header for state-changing requests
    if (config.server.isProduction && origin) {
      const trustedOrigins = Array.isArray(config.security.trustedOrigins)
        ? config.security.trustedOrigins
        : [config.security.trustedOrigins];

      if (!trustedOrigins.includes(origin)) {
        logger.warn({
          origin,
          trustedOrigins,
          url: request.url,
        }, 'CSRF protection: untrusted origin');
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Origin not allowed',
        });
      }
    }
  });

  // Register rate limiting
  await registerRateLimit(app);

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Health check endpoint
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Register API routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(preferencesRoutes, { prefix: '/api/preferences' });
  await app.register(archetypeRoutes, { prefix: '/api/archetypes' });
  await app.register(syncRoutes, { prefix: '/api/sync' });

  // Log registered routes in development
  if (config.server.nodeEnv === 'development') {
    app.ready(() => {
      logger.info('Registered routes:');
      const routes = app.printRoutes();
      logger.info(routes);
    });
  }

  return app;
}

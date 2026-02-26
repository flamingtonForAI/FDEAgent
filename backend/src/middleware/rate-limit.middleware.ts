import { FastifyInstance, FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { config } from '../config/index.js';
import { authConfig } from '../config/auth.js';

/**
 * Generate rate limit key based on user ID (for authenticated requests) or IP
 * This provides per-user rate limiting for authenticated requests
 */
function generateKey(request: FastifyRequest): string {
  // Check for authenticated user (userId is set by auth middleware)
  const userId = (request as any).userId;
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP for unauthenticated requests
  const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
  return `ip:${Array.isArray(ip) ? ip[0] : ip}`;
}

/**
 * Register rate limiting plugin with user-aware key generation
 */
export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
    keyGenerator: generateKey,
    errorResponseBuilder: (_request, context) => ({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
      statusCode: 429,
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });
}

/**
 * Stricter rate limit configuration for auth endpoints
 */
export const authRateLimitConfig = {
  login: {
    max: authConfig.rateLimit.login.max,
    timeWindow: authConfig.rateLimit.login.windowMs,
  },
  register: {
    max: authConfig.rateLimit.register.max,
    timeWindow: authConfig.rateLimit.register.windowMs,
  },
};

/**
 * Rate limit configuration for sync endpoints
 * More generous than general API limits since sync can be frequent
 */
export const syncRateLimitConfig = {
  batchSync: {
    max: 30,  // 30 requests per minute
    timeWindow: 60 * 1000,
  },
  fullState: {
    max: 10,  // 10 requests per minute
    timeWindow: 60 * 1000,
  },
};

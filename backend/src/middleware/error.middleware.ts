import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  statusCode: number;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Global error handler
 */
export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log the error
  logger.error({
    err: error,
    url: request.url,
    method: request.method,
    userId: request.user?.userId,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      statusCode: 400,
    } satisfies ErrorResponse);
    return;
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    } satisfies ErrorResponse);
    return;
  }

  // Handle Fastify errors (e.g., validation errors)
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    reply.status(error.statusCode).send({
      error: error.name || 'Error',
      message: error.message,
      statusCode: error.statusCode,
    } satisfies ErrorResponse);
    return;
  }

  // Handle unknown errors
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

  reply.status(statusCode).send({
    error: 'Internal Server Error',
    message,
    statusCode,
  } satisfies ErrorResponse);
}

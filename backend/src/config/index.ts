// Validate critical environment variables in production
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

if (isProduction && !jwtSecret) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is required in production. ' +
    'Generate a secure secret with: openssl rand -base64 32'
  );
}

if (isProduction && jwtSecret && jwtSecret.length < 32) {
  throw new Error(
    'FATAL: JWT_SECRET must be at least 32 characters in production for adequate security.'
  );
}

// Validate CORS origin - no wildcards allowed in production
if (isProduction && (corsOrigin === '*' || corsOrigin.includes('*'))) {
  throw new Error(
    'FATAL: CORS_ORIGIN cannot use wildcards (*) in production. ' +
    'Specify explicit origin(s) like "https://example.com"'
  );
}

// Parse allowed origins (comma-separated for multiple origins)
const parseOrigins = (origin: string): string | string[] => {
  if (origin.includes(',')) {
    return origin.split(',').map(o => o.trim()).filter(Boolean);
  }
  return origin;
};

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction,
  },
  jwt: {
    // In development, use a default secret; in production, require explicit configuration
    secret: jwtSecret || 'development-secret-DO-NOT-USE-IN-PRODUCTION',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: parseOrigins(corsOrigin),
  },
  security: {
    // Trusted origins for CSRF protection (Origin header validation)
    trustedOrigins: parseOrigins(corsOrigin),
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },
} as const;

export type Config = typeof config;

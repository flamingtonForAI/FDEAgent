export const authConfig = {
  // Argon2id configuration (PHC winner, memory-hard)
  argon2: {
    memoryCost: 65536, // 64 MB
    timeCost: 3,       // 3 iterations
    parallelism: 4,    // 4 parallel threads
  },

  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
  },

  // Token configuration
  tokens: {
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    refreshTokenExpiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },

  // JWT security configuration
  jwt: {
    algorithm: 'HS256' as const,
    issuer: 'ontology-assistant',
    audience: 'ontology-assistant-api',
  },

  // Rate limiting for auth endpoints
  rateLimit: {
    login: {
      max: 10,
      windowMs: 60 * 1000, // 1 minute
    },
    register: {
      max: 5,
      windowMs: 60 * 1000, // 1 minute
    },
  },
} as const;

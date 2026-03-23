import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Disable rate limiting interference in tests
    env: {
      RATE_LIMIT_MAX: '10000',
    },
    // Each test file gets its own isolated worker to avoid rate limit / app state leakage
    fileParallelism: false,
  },
});

/**
 * Auth flow smoke tests:
 * - register -> login -> refresh -> me -> logout
 * - Invalid credentials, missing auth header
 */
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';

// ── Shared mutable state (hoisted so vi.mock factory can reference it) ──
const { state, mockPrisma } = vi.hoisted(() => {
  const state = {
    users: [] as any[],
    refreshTokens: [] as any[],
    idCounter: 0,
  };

  const mockPrisma: any = {
    user: {
      findUnique: async ({ where }: any) =>
        state.users.find(u => u.email === where.email || u.id === where.id) ?? null,
      create: async ({ data }: any) => {
        const user = { id: `user-${++state.idCounter}`, ...data, emailVerified: false, createdAt: new Date(), updatedAt: new Date() };
        state.users.push(user);
        return user;
      },
      update: async ({ where, data }: any) => {
        const user = state.users.find(u => u.id === where.id);
        if (user) Object.assign(user, data);
        return user;
      },
    },
    refreshToken: {
      findUnique: async ({ where, include }: any) => {
        const rt = state.refreshTokens.find(t => t.token === where.token);
        if (!rt) return null;
        if (include?.user) {
          rt.user = state.users.find(u => u.id === rt.userId);
        }
        return rt;
      },
      create: async ({ data }: any) => {
        const rt = { id: `rt-${++state.idCounter}`, ...data, createdAt: new Date() };
        state.refreshTokens.push(rt);
        return rt;
      },
      delete: async ({ where }: any) => {
        state.refreshTokens = state.refreshTokens.filter(t => t.id !== where.id);
      },
      deleteMany: async ({ where }: any) => {
        if (where?.userId && where?.expiresAt?.lt) {
          state.refreshTokens = state.refreshTokens.filter(
            t => !(t.userId === where.userId && t.expiresAt < where.expiresAt.lt)
          );
        }
        return { count: 0 };
      },
      updateMany: async ({ where, data }: any) => {
        for (const rt of state.refreshTokens) {
          if (rt.token === where.token) Object.assign(rt, data);
        }
        return { count: 1 };
      },
    },
    $transaction: async (fn: any) => fn(mockPrisma),
  };

  return { state, mockPrisma };
});

vi.mock('../src/config/database.js', () => ({
  prisma: mockPrisma,
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
}));

// Must import after mock
const { buildApp } = await import('../src/app.js');

let app: FastifyInstance;

// Rebuild app per test to reset rate limiter state
beforeEach(async () => {
  if (app) await app.close();
  state.users = [];
  state.refreshTokens = [];
  state.idCounter = 0;
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  if (app) await app.close();
});

const EMAIL = 'test@example.com';
const PASS = 'TestPass123';

describe('auth flow', () => {
  it('register creates user and returns tokens', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/auth/register',
      payload: { email: EMAIL, password: PASS },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe(EMAIL);
    expect(body.tokens.accessToken).toBeTruthy();
    expect(body.tokens.refreshToken).toBeTruthy();
  });

  it('register rejects duplicate email', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    const res = await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    expect(res.statusCode).toBe(409);
  });

  it('register rejects weak password', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: 'w@t.com', password: 'short' } });
    expect(res.statusCode).toBe(400);
  });

  it('login succeeds with correct credentials', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: EMAIL, password: PASS } });
    expect(res.statusCode).toBe(200);
    expect(res.json().tokens.accessToken).toBeTruthy();
  });

  it('login rejects wrong password', async () => {
    await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: EMAIL, password: 'Wrong123!' } });
    expect(res.statusCode).toBe(401);
  });

  it('login rejects non-existent user', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'no@one.com', password: PASS } });
    expect(res.statusCode).toBe(401);
  });

  it('refresh rotates tokens', async () => {
    const reg = await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    const { refreshToken } = reg.json().tokens;
    const res = await app.inject({ method: 'POST', url: '/api/auth/refresh', payload: { refreshToken } });
    expect(res.statusCode).toBe(200);
    expect(res.json().tokens.refreshToken).not.toBe(refreshToken);
  });

  it('refresh rejects invalid token', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/refresh', payload: { refreshToken: 'bad' } });
    expect(res.statusCode).toBe(401);
  });

  it('GET /me returns user with valid token', async () => {
    const reg = await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    const { accessToken } = reg.json().tokens;
    const res = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { authorization: `Bearer ${accessToken}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json().email).toBe(EMAIL);
  });

  it('GET /me rejects missing header', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /me rejects invalid token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { authorization: 'Bearer bad.jwt.token' } });
    expect(res.statusCode).toBe(401);
  });

  it('logout succeeds', async () => {
    const reg = await app.inject({ method: 'POST', url: '/api/auth/register', payload: { email: EMAIL, password: PASS } });
    const { accessToken, refreshToken } = reg.json().tokens;
    const res = await app.inject({
      method: 'POST', url: '/api/auth/logout',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { refreshToken },
    });
    expect(res.statusCode).toBe(204);
  });
});

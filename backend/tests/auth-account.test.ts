/**
 * Account management tests:
 * - change password, logout-all, deletion-check, delete account
 */
import { describe, it, expect, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';

// ── Shared mutable state (hoisted so vi.mock factory can reference it) ──
const { state, mockPrisma } = vi.hoisted(() => {
  const state = {
    users: [] as any[],
    refreshTokens: [] as any[],
    projects: [] as any[],
    projectMembers: [] as any[],
    ontologyVersions: [] as any[],
    chatMessages: [] as any[],
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
      delete: async ({ where }: any) => {
        const user = state.users.find(u => u.id === where.id);
        state.users = state.users.filter(u => u.id !== where.id);
        state.refreshTokens = state.refreshTokens.filter(t => t.userId !== where.id);
        state.projectMembers = state.projectMembers.filter(m => m.userId !== where.id);
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
        const before = state.refreshTokens.length;
        if (where?.userId && where?.expiresAt?.lt) {
          state.refreshTokens = state.refreshTokens.filter(
            t => !(t.userId === where.userId && t.expiresAt < where.expiresAt.lt)
          );
        } else if (where?.userId) {
          state.refreshTokens = state.refreshTokens.filter(t => t.userId !== where.userId);
        }
        return { count: before - state.refreshTokens.length };
      },
      updateMany: async ({ where, data }: any) => {
        for (const rt of state.refreshTokens) {
          if (rt.token === where.token) Object.assign(rt, data);
        }
        return { count: 1 };
      },
    },
    project: {
      count: async ({ where }: any) =>
        state.projects.filter(p => p.userId === where.userId).length,
    },
    projectMember: {
      count: async ({ where }: any) =>
        state.projectMembers.filter(m => m.userId === where.userId).length,
    },
    ontologyVersion: {
      count: async ({ where }: any) => {
        const ownerIds = state.projects.filter(p => p.userId === where.project?.userId).map(p => p.id);
        return state.ontologyVersions.filter(v => ownerIds.includes(v.projectId)).length;
      },
    },
    chatMessage: {
      count: async ({ where }: any) => {
        const ownerIds = state.projects.filter(p => p.userId === where.project?.userId).map(p => p.id);
        return state.chatMessages.filter(m => ownerIds.includes(m.projectId)).length;
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

const EMAIL = 'test@example.com';
const PASS = 'TestPass123';
const NEW_PASS = 'NewPass456';

/** Helper: register and return tokens + userId */
async function registerUser(email = EMAIL, password = PASS) {
  const res = await app.inject({
    method: 'POST', url: '/api/auth/register',
    payload: { email, password },
  });
  return res.json();
}

beforeEach(async () => {
  if (app) await app.close();
  state.users = [];
  state.refreshTokens = [];
  state.projects = [];
  state.projectMembers = [];
  state.ontologyVersions = [];
  state.chatMessages = [];
  state.idCounter = 0;
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  if (app) await app.close();
});

describe('change password', () => {
  it('changes password and returns new tokens', async () => {
    const reg = await registerUser();
    const oldRefreshToken = reg.tokens.refreshToken;

    const res = await app.inject({
      method: 'PUT', url: '/api/auth/password',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { currentPassword: PASS, newPassword: NEW_PASS },
    });
    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.tokens.accessToken).toBeTruthy();
    expect(body.tokens.refreshToken).not.toBe(oldRefreshToken);

    // Old refresh token should be gone
    const oldRt = state.refreshTokens.find(t => t.token === oldRefreshToken);
    expect(oldRt).toBeUndefined();

    // Can login with new password
    const login = await app.inject({
      method: 'POST', url: '/api/auth/login',
      payload: { email: EMAIL, password: NEW_PASS },
    });
    expect(login.statusCode).toBe(200);
  });

  it('rejects wrong current password', async () => {
    const reg = await registerUser();
    const res = await app.inject({
      method: 'PUT', url: '/api/auth/password',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { currentPassword: 'WrongPass1', newPassword: NEW_PASS },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('logout-all', () => {
  it('revokes all refresh tokens for user', async () => {
    const reg = await registerUser();
    const userId = reg.user.id;

    // Create a second session via login
    await app.inject({
      method: 'POST', url: '/api/auth/login',
      payload: { email: EMAIL, password: PASS },
    });

    // Should have 2 refresh tokens
    const tokensBefore = state.refreshTokens.filter(t => t.userId === userId);
    expect(tokensBefore.length).toBe(2);

    const res = await app.inject({
      method: 'POST', url: '/api/auth/logout-all',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
    });
    expect(res.statusCode).toBe(204);

    // All refresh tokens should be gone
    const tokensAfter = state.refreshTokens.filter(t => t.userId === userId);
    expect(tokensAfter.length).toBe(0);
  });
});

describe('deletion-check', () => {
  it('returns canDelete=false when user owns projects', async () => {
    const reg = await registerUser();
    state.projects.push({ id: 'proj-1', userId: reg.user.id });
    state.ontologyVersions.push({ id: 'v-1', projectId: 'proj-1' });
    state.chatMessages.push({ id: 'msg-1', projectId: 'proj-1' });

    const res = await app.inject({
      method: 'GET', url: '/api/auth/account/deletion-check',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
    });
    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.canDelete).toBe(false);
    expect(body.blockers.length).toBeGreaterThan(0);
    expect(body.impact.ownedProjects).toBe(1);
    expect(body.impact.versions).toBe(1);
    expect(body.impact.chatMessages).toBe(1);
  });

  it('returns canDelete=true when user owns no projects', async () => {
    const reg = await registerUser();

    const res = await app.inject({
      method: 'GET', url: '/api/auth/account/deletion-check',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
    });
    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.canDelete).toBe(true);
    expect(body.blockers.length).toBe(0);
    expect(body.impact.ownedProjects).toBe(0);
  });
});

describe('delete account', () => {
  it('deletes account when no owned projects', async () => {
    const reg = await registerUser();

    const res = await app.inject({
      method: 'POST', url: '/api/auth/account/delete',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { password: PASS, confirmEmail: EMAIL },
    });
    expect(res.statusCode).toBe(204);

    // User should be gone
    const user = state.users.find(u => u.id === reg.user.id);
    expect(user).toBeUndefined();
  });

  it('rejects wrong password', async () => {
    const reg = await registerUser();

    const res = await app.inject({
      method: 'POST', url: '/api/auth/account/delete',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { password: 'WrongPass1', confirmEmail: EMAIL },
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects mismatched email', async () => {
    const reg = await registerUser();

    const res = await app.inject({
      method: 'POST', url: '/api/auth/account/delete',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { password: PASS, confirmEmail: 'wrong@example.com' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects when user owns projects', async () => {
    const reg = await registerUser();
    state.projects.push({ id: 'proj-1', userId: reg.user.id });

    const res = await app.inject({
      method: 'POST', url: '/api/auth/account/delete',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { password: PASS, confirmEmail: EMAIL },
    });
    expect(res.statusCode).toBe(409);
  });

  it('rejects demo account deletion', async () => {
    const reg = await registerUser('demo@example.com', PASS);

    const res = await app.inject({
      method: 'POST', url: '/api/auth/account/delete',
      headers: { authorization: `Bearer ${reg.tokens.accessToken}` },
      payload: { password: PASS, confirmEmail: 'demo@example.com' },
    });
    expect(res.statusCode).toBe(403);
  });
});

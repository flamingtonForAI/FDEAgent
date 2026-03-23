/**
 * Sync batch smoke tests:
 * - POST /api/sync creates projects
 * - POST /api/sync updates preferences
 * - GET /api/sync/full returns user data
 * - Auth required
 */
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';

const { state, mockPrisma, mockTx } = vi.hoisted(() => {
  const state = {
    users: [] as any[],
    projects: [] as any[],
    refreshTokens: [] as any[],
    chatMessages: [] as any[],
    userPreferences: [] as any[],
    importedArchetypes: [] as any[],
    idCounter: 0,
  };

  // Transaction-level mock (used inside $transaction callback)
  const mockTx: any = {
    project: {
      findMany: async ({ where }: any) =>
        state.projects.filter(p => {
          if (where.userId && p.userId !== where.userId) return false;
          if (where.id?.in && !where.id.in.includes(p.id)) return false;
          return true;
        }),
      create: async ({ data }: any) => {
        const p = { id: `proj-${++state.idCounter}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        state.projects.push(p);
        return p;
      },
      update: async ({ where, data }: any) => {
        const p = state.projects.find(pp => pp.id === where.id);
        if (p) Object.assign(p, data, { updatedAt: new Date() });
        return p;
      },
    },
    chatMessage: {
      createMany: async ({ data }: any) => {
        for (const msg of data) {
          state.chatMessages.push({ id: `msg-${++state.idCounter}`, ...msg, createdAt: new Date() });
        }
        return { count: data.length };
      },
    },
    userPreferences: {
      upsert: async ({ where, create, update }: any) => {
        const existing = state.userPreferences.find(p => p.userId === where.userId);
        if (existing) { Object.assign(existing, update); return existing; }
        const pref = { id: `pref-${++state.idCounter}`, ...create };
        state.userPreferences.push(pref);
        return pref;
      },
    },
    importedArchetype: {
      upsert: async ({ create }: any) => {
        const arch = { id: `arch-${++state.idCounter}`, ...create };
        state.importedArchetypes.push(arch);
        return arch;
      },
    },
    refreshToken: { deleteMany: async () => ({ count: 0 }) },
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
        const u = state.users.find(uu => uu.id === where.id);
        if (u) Object.assign(u, data);
        return u;
      },
    },
    refreshToken: {
      findUnique: async () => null,
      create: async ({ data }: any) => {
        const rt = { id: `rt-${++state.idCounter}`, ...data, createdAt: new Date() };
        state.refreshTokens.push(rt);
        return rt;
      },
      deleteMany: async () => ({ count: 0 }),
      updateMany: async () => ({ count: 0 }),
    },
    project: {
      findMany: async ({ where, include }: any) => {
        const result = state.projects.filter(p => p.userId === where?.userId);
        if (include?.chatMessages) {
          return result.map(p => ({
            ...p,
            chatMessages: state.chatMessages.filter(m => m.projectId === p.id).slice(0, 100),
          }));
        }
        return result;
      },
    },
    userPreferences: {
      findUnique: async ({ where }: any) =>
        state.userPreferences.find(p => p.userId === where.userId) ?? null,
    },
    importedArchetype: {
      findMany: async ({ where }: any) =>
        state.importedArchetypes.filter(a => a.userId === where.userId),
    },
    $transaction: async (fn: any, _opts?: any) => fn(mockTx),
  };

  return { state, mockPrisma, mockTx };
});

vi.mock('../src/config/database.js', () => ({
  prisma: mockPrisma,
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
}));

const { buildApp } = await import('../src/app.js');

let app: FastifyInstance;

beforeEach(async () => {
  if (app) await app.close();
  state.users = [];
  state.projects = [];
  state.refreshTokens = [];
  state.chatMessages = [];
  state.userPreferences = [];
  state.importedArchetypes = [];
  state.idCounter = 0;
  app = await buildApp();
  await app.ready();
});

afterAll(async () => { if (app) await app.close(); });

async function register(email: string) {
  const res = await app.inject({
    method: 'POST', url: '/api/auth/register',
    payload: { email, password: 'TestPass123' },
  });
  return res.json();
}

describe('sync batch', () => {
  it('requires authentication', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/sync', payload: {} });
    expect(res.statusCode).toBe(401);
  });

  it('creates a new project via sync', async () => {
    const { tokens } = await register('sync@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    const res = await app.inject({
      method: 'POST', url: '/api/sync', headers: h,
      payload: {
        projects: [{
          name: 'Synced',
          localId: 'proj-local-1',
          status: 'scouting',
          objects: [{ id: 'o1', name: 'W', description: 'widget' }],
          links: [],
        }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.results.projects.created.length).toBe(1);
    expect(body.results.projects.failed.length).toBe(0);
  });

  it('syncs preferences', async () => {
    const { tokens } = await register('pref@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    const res = await app.inject({
      method: 'POST', url: '/api/sync', headers: h,
      payload: { preferences: { themeId: 'githubDark', language: 'en' } },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().results.preferences.updated).toBe(true);
  });

  it('GET /api/sync/full returns user data', async () => {
    const { tokens } = await register('full@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    const res = await app.inject({ method: 'GET', url: '/api/sync/full', headers: h });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('projects');
    expect(body).toHaveProperty('syncedAt');
    expect(Array.isArray(body.projects)).toBe(true);
  });

  it('GET /api/sync/full requires auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/sync/full' });
    expect(res.statusCode).toBe(401);
  });

  it('empty sync payload succeeds', async () => {
    const { tokens } = await register('empty@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    const res = await app.inject({ method: 'POST', url: '/api/sync', headers: h, payload: {} });
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });
});

/**
 * Project ownership smoke tests:
 * - User can access own projects
 * - User cannot access/update/delete another user's projects (404)
 */
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';

const { state, mockPrisma } = vi.hoisted(() => {
  const state = {
    users: [] as any[],
    projects: [] as any[],
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
    projectMember: {
      findUnique: async () => null,
      findMany: async () => [],
    },
    project: {
      findMany: async ({ where, select }: any) => {
        // Handle OR query from listProjects
        if (where?.OR) {
          const userId = where.OR[0]?.userId;
          return state.projects.filter(p => p.userId === userId).map(p => select?.members ? { ...p, members: [] } : p);
        }
        return state.projects.filter(p => p.userId === where.userId);
      },
      findFirst: async ({ where }: any) => {
        // Handle OR query from getProject
        if (where?.OR) {
          const id = where.id;
          const userId = where.OR[0]?.userId;
          return state.projects.find(p => p.id === id && p.userId === userId) ?? null;
        }
        return state.projects.find(p => p.id === where.id && p.userId === where.userId) ?? null;
      },
      findUnique: async ({ where }: any) =>
        state.projects.find(p => p.id === where.id) ?? null,
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
      delete: async ({ where }: any) => {
        const idx = state.projects.findIndex(p => p.id === where.id);
        if (idx >= 0) state.projects.splice(idx, 1);
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

const { buildApp } = await import('../src/app.js');

let app: FastifyInstance;

beforeEach(async () => {
  if (app) await app.close();
  state.users = [];
  state.projects = [];
  state.refreshTokens = [];
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

describe('project ownership', () => {
  it('user can create and list own projects', async () => {
    const { tokens } = await register('alice@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    const cr = await app.inject({ method: 'POST', url: '/api/projects', headers: h, payload: { name: 'Alice P' } });
    expect(cr.statusCode).toBe(201);

    const ls = await app.inject({ method: 'GET', url: '/api/projects', headers: h });
    expect(ls.json().length).toBe(1);
    expect(ls.json()[0].name).toBe('Alice P');
  });

  it('user cannot GET another user\'s project', async () => {
    const alice = await register('alice@t.com');
    const bob = await register('bob@t.com');

    const cr = await app.inject({
      method: 'POST', url: '/api/projects',
      headers: { authorization: `Bearer ${alice.tokens.accessToken}` },
      payload: { name: 'Secret' },
    });
    const pid = cr.json().id;

    const res = await app.inject({
      method: 'GET', url: `/api/projects/${pid}`,
      headers: { authorization: `Bearer ${bob.tokens.accessToken}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it('user cannot PUT another user\'s project', async () => {
    const alice = await register('alice@t.com');
    const bob = await register('bob@t.com');

    const cr = await app.inject({
      method: 'POST', url: '/api/projects',
      headers: { authorization: `Bearer ${alice.tokens.accessToken}` },
      payload: { name: 'Mine' },
    });

    const res = await app.inject({
      method: 'PUT', url: `/api/projects/${cr.json().id}`,
      headers: { authorization: `Bearer ${bob.tokens.accessToken}` },
      payload: { name: 'Hacked' },
    });
    // requireProjectRole middleware returns 403 for non-members
    expect(res.statusCode).toBe(403);
  });

  it('user cannot DELETE another user\'s project', async () => {
    const alice = await register('alice@t.com');
    const bob = await register('bob@t.com');

    const cr = await app.inject({
      method: 'POST', url: '/api/projects',
      headers: { authorization: `Bearer ${alice.tokens.accessToken}` },
      payload: { name: 'Keep' },
    });

    const res = await app.inject({
      method: 'DELETE', url: `/api/projects/${cr.json().id}`,
      headers: { authorization: `Bearer ${bob.tokens.accessToken}` },
    });
    // requireProjectRole middleware returns 403 for non-members
    expect(res.statusCode).toBe(403);

    // Verify Alice still has it
    const ls = await app.inject({
      method: 'GET', url: '/api/projects',
      headers: { authorization: `Bearer ${alice.tokens.accessToken}` },
    });
    expect(ls.json().length).toBe(1);
  });

  it('project lists are isolated per user', async () => {
    const alice = await register('alice@t.com');
    const bob = await register('bob@t.com');

    await app.inject({ method: 'POST', url: '/api/projects', headers: { authorization: `Bearer ${alice.tokens.accessToken}` }, payload: { name: 'A1' } });
    await app.inject({ method: 'POST', url: '/api/projects', headers: { authorization: `Bearer ${bob.tokens.accessToken}` }, payload: { name: 'B1' } });

    const al = await app.inject({ method: 'GET', url: '/api/projects', headers: { authorization: `Bearer ${alice.tokens.accessToken}` } });
    const bl = await app.inject({ method: 'GET', url: '/api/projects', headers: { authorization: `Bearer ${bob.tokens.accessToken}` } });

    expect(al.json().length).toBe(1);
    expect(al.json()[0].name).toBe('A1');
    expect(bl.json().length).toBe(1);
    expect(bl.json()[0].name).toBe('B1');
  });

  it('unauthenticated request returns 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/projects' });
    expect(res.statusCode).toBe(401);
  });
});

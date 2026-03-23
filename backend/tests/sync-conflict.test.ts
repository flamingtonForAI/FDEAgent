/**
 * Sync conflict detection tests:
 * - LWW: cloud newer than local → conflict, skip update
 * - LWW: local newer than cloud → normal update
 * - No localUpdatedAt → always update (backward compat)
 * - Conflict info returned in response
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
        const p = state.projects.find((pp: any) => pp.id === where.id);
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
        const existing = state.userPreferences.find((p: any) => p.userId === where.userId);
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
        const u = state.users.find((uu: any) => uu.id === where.id);
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
        state.userPreferences.find((p: any) => p.userId === where.userId) ?? null,
    },
    importedArchetype: {
      findMany: async ({ where }: any) =>
        state.importedArchetypes.filter((a: any) => a.userId === where.userId),
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

async function register(email: string) {
  const res = await app.inject({
    method: 'POST', url: '/api/auth/register',
    payload: { email, password: 'TestPass123' },
  });
  return res.json();
}

describe('sync conflict detection (LWW)', () => {
  it('detects conflict when cloud is newer than local', async () => {
    const { tokens, user } = await register('conflict@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    // Seed a project directly in state with a known updatedAt
    const cloudUpdatedAt = new Date('2026-03-22T12:00:00Z');
    state.projects.push({
      id: 'proj-existing',
      userId: user.id,
      name: 'Cloud Project',
      industry: 'tech',
      useCase: 'demo',
      status: 'scouting',
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      createdAt: new Date('2026-03-20T00:00:00Z'),
      updatedAt: cloudUpdatedAt,
    });

    // Sync with a localUpdatedAt older than cloud
    const res = await app.inject({
      method: 'POST', url: '/api/sync', headers: h,
      payload: {
        projects: [{
          id: 'proj-existing',
          name: 'Cloud Project (edited locally)',
          status: 'scouting',
          objects: [],
          links: [],
          localUpdatedAt: '2026-03-22T11:00:00.000Z', // 1 hour before cloud
        }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.results.projects.updated.length).toBe(0);
    expect(body.results.projects.conflicts.length).toBe(1);
    expect(body.results.projects.conflicts[0]).toMatchObject({
      projectId: 'proj-existing',
      projectName: 'Cloud Project',
      resolution: 'cloud_wins',
    });

    // Verify the project was NOT updated
    const project = state.projects.find(p => p.id === 'proj-existing');
    expect(project!.name).toBe('Cloud Project'); // unchanged
  });

  it('allows update when local is newer than cloud', async () => {
    const { tokens, user } = await register('newer@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    // Seed a project with older updatedAt
    state.projects.push({
      id: 'proj-old',
      userId: user.id,
      name: 'Old Cloud Version',
      industry: 'tech',
      useCase: 'demo',
      status: 'scouting',
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      createdAt: new Date('2026-03-20T00:00:00Z'),
      updatedAt: new Date('2026-03-22T10:00:00Z'),
    });

    const res = await app.inject({
      method: 'POST', url: '/api/sync', headers: h,
      payload: {
        projects: [{
          id: 'proj-old',
          name: 'Locally Updated',
          status: 'scouting',
          objects: [],
          links: [],
          localUpdatedAt: '2026-03-22T12:00:00.000Z', // 2 hours after cloud
        }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.results.projects.updated).toContain('proj-old');
    expect(body.results.projects.conflicts.length).toBe(0);

    // Verify project was updated
    const project = state.projects.find(p => p.id === 'proj-old');
    expect(project!.name).toBe('Locally Updated');
  });

  it('allows update when no localUpdatedAt is provided (backward compat)', async () => {
    const { tokens, user } = await register('compat@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    state.projects.push({
      id: 'proj-compat',
      userId: user.id,
      name: 'Compat Project',
      industry: 'tech',
      useCase: 'demo',
      status: 'scouting',
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      createdAt: new Date('2026-03-20T00:00:00Z'),
      updatedAt: new Date('2026-03-22T12:00:00Z'),
    });

    // Sync without localUpdatedAt
    const res = await app.inject({
      method: 'POST', url: '/api/sync', headers: h,
      payload: {
        projects: [{
          id: 'proj-compat',
          name: 'Updated Without Timestamp',
          status: 'scouting',
          objects: [],
          links: [],
        }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.results.projects.updated).toContain('proj-compat');
    expect(body.results.projects.conflicts.length).toBe(0);
  });

  it('returns empty conflicts array when creating new projects', async () => {
    const { tokens } = await register('create@t.com');
    const h = { authorization: `Bearer ${tokens.accessToken}` };

    const res = await app.inject({
      method: 'POST', url: '/api/sync', headers: h,
      payload: {
        projects: [{
          name: 'Brand New',
          status: 'scouting',
          objects: [],
          links: [],
        }],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.results.projects.created.length).toBe(1);
    expect(body.results.projects.conflicts.length).toBe(0);
  });
});

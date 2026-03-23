import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectState, ProjectListItem } from '../types';

// Mock localStorage before importing storage
const localStorageMap = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageMap.set(key, value); }),
  removeItem: vi.fn((key: string) => { localStorageMap.delete(key); }),
  clear: vi.fn(() => { localStorageMap.clear(); }),
  get length() { return localStorageMap.size; },
  key: vi.fn((index: number) => [...localStorageMap.keys()][index] ?? null),
};

const sessionStorageMap = new Map<string, string>();
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { sessionStorageMap.set(key, value); }),
  removeItem: vi.fn((key: string) => { sessionStorageMap.delete(key); }),
  clear: vi.fn(() => { sessionStorageMap.clear(); }),
  get length() { return sessionStorageMap.size; },
  key: vi.fn((index: number) => [...sessionStorageMap.keys()][index] ?? null),
};

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock service imports that storage.ts pulls in (they require network)
vi.mock('../services/syncService', () => ({
  syncService: { queueSync: vi.fn(), getFullState: vi.fn() },
}));
vi.mock('../services/projectService', () => ({
  projectService: { listProjects: vi.fn(), getProject: vi.fn(), createProject: vi.fn(), addChatMessages: vi.fn() },
}));

// Now import the module under test
const { storage } = await import('../lib/storage');

function setAuthUser(userId: string) {
  localStorageMap.set('ontology-auth-session', JSON.stringify({ user: { id: userId, email: `${userId}@test.com` } }));
}

const sampleState: ProjectState = {
  projectName: 'Test Project',
  industry: 'Retail',
  useCase: 'Inventory Management',
  objects: [
    {
      id: 'obj-1',
      name: 'Product',
      description: 'A retail product',
      properties: [{ name: 'sku', type: 'string' }],
      actions: [{ name: 'restock', description: 'Restock product' }],
    },
  ],
  links: [
    { id: 'link-1', source: 'obj-1', target: 'obj-2', type: 'contains' },
  ],
  integrations: [],
  aiRequirements: [],
  status: 'scouting',
};

describe('storage facade — project CRUD', () => {
  beforeEach(() => {
    localStorageMap.clear();
    sessionStorageMap.clear();
    vi.clearAllMocks();
    // Set up a logged-in user so scoped keys work deterministically
    setAuthUser('test-user-123');
  });

  it('createProject returns a project with generated id', () => {
    const project = storage.createProject({
      name: 'My Project',
      industry: 'Healthcare',
      useCase: 'Patient Tracking',
    });

    expect(project.id).toMatch(/^proj-/);
    expect(project.name).toBe('My Project');
    expect(project.industry).toBe('Healthcare');
    expect(project.status).toBe('draft');
    expect(project.version).toBe(1);
  });

  it('listProjectsLocal returns created projects', () => {
    storage.createProject({ name: 'P1', industry: 'A', useCase: 'U1' });
    storage.createProject({ name: 'P2', industry: 'B', useCase: 'U2' });

    const list = storage.listProjectsLocal();
    expect(list.length).toBe(2);
    // Newest first
    expect(list[0].name).toBe('P2');
    expect(list[1].name).toBe('P1');
  });

  it('getProjectStateById retrieves saved state', () => {
    const project = storage.createProject({
      name: 'State Test',
      industry: 'Retail',
      useCase: 'Test',
      initialState: sampleState,
    });

    const retrieved = storage.getProjectStateById(project.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.projectName).toBe('Test Project');
    expect(retrieved!.objects.length).toBe(1);
    expect(retrieved!.objects[0].name).toBe('Product');
    expect(retrieved!.links.length).toBe(1);
  });

  it('saveProjectStateById updates state and index', () => {
    const project = storage.createProject({
      name: 'Update Test',
      industry: 'Tech',
      useCase: 'Test',
    });

    // Save with richer state
    storage.saveProjectStateById(project.id, sampleState);

    const state = storage.getProjectStateById(project.id);
    expect(state!.objects.length).toBe(1);

    // Index should reflect updated progress
    const list = storage.listProjectsLocal();
    const item = list.find((p: ProjectListItem) => p.id === project.id);
    expect(item!.progress.objectCount).toBe(1);
    expect(item!.progress.linkCount).toBe(1);
  });

  it('deleteProject removes project from index and storage', () => {
    const p1 = storage.createProject({ name: 'Keep', industry: 'A', useCase: 'U' });
    const p2 = storage.createProject({ name: 'Delete', industry: 'B', useCase: 'U' });

    storage.deleteProject(p2.id);

    const list = storage.listProjectsLocal();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(p1.id);

    // State should be gone
    expect(storage.getProjectStateById(p2.id)).toBeNull();
  });

  it('deleteProject switches active project when deleting active one', () => {
    const p1 = storage.createProject({ name: 'First', industry: 'A', useCase: 'U' });
    const p2 = storage.createProject({ name: 'Second', industry: 'B', useCase: 'U' });

    // p2 is active (latest created)
    expect(storage.getActiveProjectId()).toBe(p2.id);

    storage.deleteProject(p2.id);

    // Should fall back to p1
    expect(storage.getActiveProjectId()).toBe(p1.id);
  });

  it('getProjectById returns metadata for a known project', () => {
    const project = storage.createProject({ name: 'Meta', industry: 'X', useCase: 'Y' });
    const meta = storage.getProjectById(project.id);
    expect(meta).not.toBeNull();
    expect(meta!.name).toBe('Meta');
  });

  it('getProjectById returns null for unknown id', () => {
    expect(storage.getProjectById('nonexistent')).toBeNull();
  });

  it('chat messages round-trip per project', () => {
    const project = storage.createProject({ name: 'Chat Test', industry: 'A', useCase: 'U' });
    const messages = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi there' },
    ];

    storage.saveChatMessagesById(project.id, messages);
    const loaded = storage.getChatMessagesById(project.id);
    expect(loaded.length).toBe(2);
    expect(loaded[0].content).toBe('Hello');
    expect(loaded[1].content).toBe('Hi there');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectState } from '../types';

// Mock localStorage/sessionStorage before importing storage
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

vi.mock('../services/syncService', () => ({
  syncService: { queueSync: vi.fn(), getFullState: vi.fn() },
}));
vi.mock('../services/projectService', () => ({
  projectService: { listProjects: vi.fn(), getProject: vi.fn(), createProject: vi.fn(), addChatMessages: vi.fn() },
}));

const { storage } = await import('../lib/storage');

function setAuthUser(userId: string) {
  localStorageMap.set('ontology-auth-session', JSON.stringify({ user: { id: userId, email: `${userId}@test.com` } }));
}

const stateA: ProjectState = {
  projectName: 'Project A',
  industry: 'Retail',
  useCase: 'Inventory',
  objects: [{ id: 'a1', name: 'ProductA', description: 'Product for A', properties: [], actions: [] }],
  links: [],
  integrations: [],
  aiRequirements: [],
  status: 'designing',
};

const stateB: ProjectState = {
  projectName: 'Project B',
  industry: 'Healthcare',
  useCase: 'Patient Tracking',
  objects: [{ id: 'b1', name: 'PatientB', description: 'Patient for B', properties: [], actions: [] }],
  links: [{ id: 'bl1', source: 'b1', target: 'b2', label: 'treats' }],
  integrations: [],
  aiRequirements: [],
  status: 'scouting',
};

describe('project data isolation', () => {
  beforeEach(() => {
    localStorageMap.clear();
    sessionStorageMap.clear();
    vi.clearAllMocks();
    setAuthUser('iso-user');
  });

  it('saving state to project A does not affect project B', () => {
    const pA = storage.createProject({ name: 'A', industry: 'Retail', useCase: 'Inv', initialState: stateA });
    const pB = storage.createProject({ name: 'B', industry: 'Health', useCase: 'PT', initialState: stateB });

    // Verify A has its own state
    const loadedA = storage.getProjectStateById(pA.id);
    expect(loadedA!.objects[0].name).toBe('ProductA');
    expect(loadedA!.links.length).toBe(0);

    // Verify B has its own state
    const loadedB = storage.getProjectStateById(pB.id);
    expect(loadedB!.objects[0].name).toBe('PatientB');
    expect(loadedB!.links.length).toBe(1);
  });

  it('updating project A state does not mutate project B state', () => {
    const pA = storage.createProject({ name: 'A', industry: 'R', useCase: 'U', initialState: stateA });
    const pB = storage.createProject({ name: 'B', industry: 'H', useCase: 'P', initialState: stateB });

    // Update A with more objects
    const updatedA: ProjectState = {
      ...stateA,
      objects: [
        ...stateA.objects,
        { id: 'a2', name: 'WarehouseA', description: 'Warehouse', properties: [], actions: [] },
      ],
    };
    storage.saveProjectStateById(pA.id, updatedA);

    // A should have 2 objects now
    const reloadA = storage.getProjectStateById(pA.id);
    expect(reloadA!.objects.length).toBe(2);

    // B should still have exactly 1 object
    const reloadB = storage.getProjectStateById(pB.id);
    expect(reloadB!.objects.length).toBe(1);
    expect(reloadB!.objects[0].name).toBe('PatientB');
  });

  it('chat messages are isolated between projects', () => {
    const pA = storage.createProject({ name: 'A', industry: 'R', useCase: 'U' });
    const pB = storage.createProject({ name: 'B', industry: 'H', useCase: 'P' });

    storage.saveChatMessagesById(pA.id, [
      { role: 'user', content: 'Hello from A' },
    ]);
    storage.saveChatMessagesById(pB.id, [
      { role: 'user', content: 'Hello from B' },
      { role: 'assistant', content: 'Hi from B' },
    ]);

    const chatA = storage.getChatMessagesById(pA.id);
    const chatB = storage.getChatMessagesById(pB.id);

    expect(chatA.length).toBe(1);
    expect(chatA[0].content).toBe('Hello from A');
    expect(chatB.length).toBe(2);
    expect(chatB[0].content).toBe('Hello from B');
  });

  it('deleting project A does not affect project B data', () => {
    const pA = storage.createProject({ name: 'A', industry: 'R', useCase: 'U', initialState: stateA });
    const pB = storage.createProject({ name: 'B', industry: 'H', useCase: 'P', initialState: stateB });

    storage.deleteProject(pA.id);

    // A should be gone
    expect(storage.getProjectStateById(pA.id)).toBeNull();

    // B should be intact
    const loadedB = storage.getProjectStateById(pB.id);
    expect(loadedB).not.toBeNull();
    expect(loadedB!.objects[0].name).toBe('PatientB');
  });

  it('different users have isolated storage scopes', () => {
    setAuthUser('user-alpha');
    const pAlpha = storage.createProject({ name: 'Alpha Project', industry: 'X', useCase: 'Y', initialState: stateA });

    // Switch user
    setAuthUser('user-beta');
    const pBeta = storage.createProject({ name: 'Beta Project', industry: 'Z', useCase: 'W', initialState: stateB });

    // Beta should only see their project
    const betaList = storage.listProjectsLocal();
    expect(betaList.length).toBe(1);
    expect(betaList[0].name).toBe('Beta Project');

    // Switch back to alpha
    setAuthUser('user-alpha');
    const alphaList = storage.listProjectsLocal();
    expect(alphaList.length).toBe(1);
    expect(alphaList[0].name).toBe('Alpha Project');
  });
});

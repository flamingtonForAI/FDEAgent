import { describe, it, expect } from 'vitest';
import { diffProjectStates } from '../src/domain/diff.js';
import type { ProjectState } from '../src/domain/types.js';

function makeState(overrides: Partial<ProjectState> = {}): ProjectState {
  return {
    schemaVersion: 1,
    industry: 'test',
    useCase: 'test',
    objects: [],
    links: [],
    integrations: [],
    aiRequirements: [],
    status: 'scouting',
    ...overrides,
  };
}

describe('diffProjectStates — advanced scenarios', () => {
  it('handles multiple objects with mixed changes', () => {
    const before = makeState({
      objects: [
        { id: 'o1', name: 'Order', description: 'v1', properties: [], actions: [] },
        { id: 'o2', name: 'Customer', description: '', properties: [], actions: [] },
        { id: 'o3', name: 'Product', description: '', properties: [], actions: [] },
      ],
    });
    const after = makeState({
      objects: [
        { id: 'o1', name: 'Order', description: 'v2', properties: [], actions: [] },
        { id: 'o3', name: 'Product', description: '', properties: [], actions: [] },
        { id: 'o4', name: 'Invoice', description: '', properties: [], actions: [] },
      ],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects.filter(i => i.type === 'removed')).toHaveLength(1); // o2 removed
    expect(result.objects.filter(i => i.type === 'added')).toHaveLength(1); // o4 added
    expect(result.objects.filter(i => i.type === 'modified')).toHaveLength(1); // o1 modified
  });

  it('detects link target change', () => {
    const before = makeState({
      links: [{ id: 'l1', name: 'relation', sourceObject: 'A', targetObject: 'B' }],
    });
    const after = makeState({
      links: [{ id: 'l1', name: 'relation', sourceObject: 'A', targetObject: 'C' }],
    });
    const result = diffProjectStates(before, after);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].type).toBe('modified');
    expect(result.links[0].details).toContain('target changed');
  });

  it('detects link source change', () => {
    const before = makeState({
      links: [{ id: 'l1', name: 'rel', source: 'X', target: 'Y' }],
    });
    const after = makeState({
      links: [{ id: 'l1', name: 'rel', source: 'Z', target: 'Y' }],
    });
    const result = diffProjectStates(before, after);
    expect(result.links[0].details).toContain('source changed');
  });

  it('detects link name change', () => {
    const before = makeState({
      links: [{ id: 'l1', name: 'oldName' }],
    });
    const after = makeState({
      links: [{ id: 'l1', name: 'newName' }],
    });
    const result = diffProjectStates(before, after);
    expect(result.links[0].details).toContain('name changed');
  });

  it('detects action type change', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Obj', description: '', properties: [], actions: [
          { name: 'act', description: 'desc', type: 'traditional' },
        ],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Obj', description: '', properties: [], actions: [
          { name: 'act', description: 'desc', type: 'generative' },
        ],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('modified');
    expect(result.actions[0].details).toContain('type');
  });

  it('detects action governance change', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Obj', description: '', properties: [], actions: [
          {
            name: 'act', description: 'desc',
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true },
          },
        ],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Obj', description: '', properties: [], actions: [
          {
            name: 'act', description: 'desc',
            governance: { permissionTier: 2, requiresHumanApproval: true, auditLog: true },
          },
        ],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.actions[0].details).toContain('governance changed');
  });

  it('handles actions moved between objects', () => {
    const before = makeState({
      objects: [
        {
          id: 'o1', name: 'A', description: '', properties: [], actions: [
            {
              name: 'doThing', description: 'd',
              businessLayer: { description: 'd', targetObject: 'A', executorRole: 'u' },
            },
          ],
        },
        { id: 'o2', name: 'B', description: '', properties: [], actions: [] },
      ],
    });
    const after = makeState({
      objects: [
        { id: 'o1', name: 'A', description: '', properties: [], actions: [] },
        {
          id: 'o2', name: 'B', description: '', properties: [], actions: [
            {
              name: 'doThing', description: 'd',
              businessLayer: { description: 'd', targetObject: 'B', executorRole: 'u' },
            },
          ],
        },
      ],
    });
    const result = diffProjectStates(before, after);
    // Action moved: key changes from doThing::A to doThing::B
    const removed = result.actions.filter(a => a.type === 'removed');
    const added = result.actions.filter(a => a.type === 'added');
    expect(removed.length).toBe(1);
    expect(added.length).toBe(1);
  });

  it('unchanged links produce no diff items', () => {
    const state = makeState({
      links: [
        { id: 'l1', name: 'A-B', cardinality: '1:N' as const },
        { id: 'l2', name: 'B-C' },
      ],
    });
    const result = diffProjectStates(state, state);
    expect(result.links).toHaveLength(0);
  });

  it('summary counts are accurate for complex changes', () => {
    const before = makeState({
      objects: [
        { id: 'o1', name: 'A', description: '', properties: [], actions: [] },
        { id: 'o2', name: 'B', description: '', properties: [], actions: [] },
      ],
      links: [{ id: 'l1', name: 'link1' }],
    });
    const after = makeState({
      objects: [
        { id: 'o1', name: 'A', description: 'modified', properties: [], actions: [] },
        { id: 'o3', name: 'C', description: '', properties: [], actions: [] },
        { id: 'o4', name: 'D', description: '', properties: [], actions: [] },
      ],
      links: [],
    });
    const result = diffProjectStates(before, after);
    // o2 removed, o3+o4 added, o1 modified, l1 removed
    expect(result.summary).toMatch(/added 2.*modified 1.*object/);
    expect(result.summary).toMatch(/removed 1.*link/);
  });
});

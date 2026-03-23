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

describe('diffProjectStates', () => {
  it('returns no changes for identical states', () => {
    const state = makeState({
      objects: [{ id: 'o1', name: 'Order', description: '', properties: [], actions: [] }],
    });
    const result = diffProjectStates(state, state);
    expect(result.objects).toHaveLength(0);
    expect(result.links).toHaveLength(0);
    expect(result.actions).toHaveLength(0);
    expect(result.summary).toBe('No changes');
  });

  it('detects added objects', () => {
    const before = makeState();
    const after = makeState({
      objects: [{ id: 'o1', name: 'Order', description: '', properties: [], actions: [] }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0]).toEqual({ type: 'added', id: 'o1', name: 'Order' });
    expect(result.summary).toContain('added 1 object');
  });

  it('detects removed objects', () => {
    const before = makeState({
      objects: [{ id: 'o1', name: 'Order', description: '', properties: [], actions: [] }],
    });
    const after = makeState();
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].type).toBe('removed');
  });

  it('detects modified objects (property added)', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: 'desc', properties: [
          { name: 'id', type: 'string' },
        ], actions: [],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: 'desc', properties: [
          { name: 'id', type: 'string' },
          { name: 'total', type: 'number' },
        ], actions: [],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].type).toBe('modified');
    expect(result.objects[0].details).toContain('1 properties added');
  });

  it('detects added links', () => {
    const before = makeState();
    const after = makeState({
      links: [{ id: 'l1', name: 'OrderToCustomer', source: 'Order', target: 'Customer' }],
    });
    const result = diffProjectStates(before, after);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].type).toBe('added');
  });

  it('detects modified links (cardinality change)', () => {
    const before = makeState({
      links: [{ id: 'l1', name: 'OrderToCustomer', cardinality: '1:N' as const }],
    });
    const after = makeState({
      links: [{ id: 'l1', name: 'OrderToCustomer', cardinality: 'N:N' as const }],
    });
    const result = diffProjectStates(before, after);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].type).toBe('modified');
    expect(result.links[0].details).toContain('cardinality');
  });

  it('detects added actions (matched by name+targetObject)', () => {
    const before = makeState({
      objects: [{ id: 'o1', name: 'Order', description: '', properties: [], actions: [] }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [], actions: [
          {
            name: 'submitOrder',
            description: 'Submit',
            businessLayer: { description: 'Submit', targetObject: 'Order', executorRole: 'user' },
          },
        ],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('added');
    expect(result.actions[0].name).toBe('Order.submitOrder');
  });

  it('detects removed actions', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [], actions: [
          { name: 'cancel', description: 'Cancel order' },
        ],
      }],
    });
    const after = makeState({
      objects: [{ id: 'o1', name: 'Order', description: '', properties: [], actions: [] }],
    });
    const result = diffProjectStates(before, after);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('removed');
  });

  it('detects modified actions (description change)', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [], actions: [
          { name: 'submit', description: 'Submit order v1' },
        ],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [], actions: [
          { name: 'submit', description: 'Submit order v2' },
        ],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('modified');
    expect(result.actions[0].details).toContain('description changed');
  });

  it('produces a readable summary for mixed changes', () => {
    const before = makeState({
      objects: [
        { id: 'o1', name: 'Order', description: '', properties: [], actions: [] },
        { id: 'o2', name: 'Customer', description: '', properties: [], actions: [] },
      ],
      links: [{ id: 'l1', name: 'OC' }],
    });
    const after = makeState({
      objects: [
        { id: 'o1', name: 'Order', description: 'updated', properties: [], actions: [] },
        { id: 'o3', name: 'Product', description: '', properties: [], actions: [] },
      ],
      links: [],
    });
    const result = diffProjectStates(before, after);
    expect(result.summary).toContain('object');
    expect(result.summary).toContain('link');
  });

  it('handles empty states gracefully', () => {
    const result = diffProjectStates(makeState(), makeState());
    expect(result.objects).toHaveLength(0);
    expect(result.links).toHaveLength(0);
    expect(result.actions).toHaveLength(0);
    expect(result.summary).toBe('No changes');
  });

  it('detects multiple property changes (added + removed)', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'oldProp', type: 'string' },
          { name: 'kept', type: 'string' },
        ], actions: [],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'kept', type: 'string' },
          { name: 'newProp', type: 'number' },
        ], actions: [],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].details).toContain('1 properties added');
    expect(result.objects[0].details).toContain('1 properties removed');
  });

  it('detects property type change', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'amount', type: 'string' },
        ], actions: [],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'amount', type: 'number' },
        ], actions: [],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].type).toBe('modified');
    expect(result.objects[0].details).toContain('1 properties modified');
  });

  it('detects property required change', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'id', type: 'string', required: false },
        ], actions: [],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'id', type: 'string', required: true },
        ], actions: [],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].details).toContain('1 properties modified');
  });

  it('detects property description change', () => {
    const before = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'id', type: 'string', description: 'old desc' },
        ], actions: [],
      }],
    });
    const after = makeState({
      objects: [{
        id: 'o1', name: 'Order', description: '', properties: [
          { name: 'id', type: 'string', description: 'new desc' },
        ], actions: [],
      }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].details).toContain('1 properties modified');
  });

  it('detects object name change', () => {
    const before = makeState({
      objects: [{ id: 'o1', name: 'Order', description: 'd', properties: [], actions: [] }],
    });
    const after = makeState({
      objects: [{ id: 'o1', name: 'SalesOrder', description: 'd', properties: [], actions: [] }],
    });
    const result = diffProjectStates(before, after);
    expect(result.objects).toHaveLength(1);
    expect(result.objects[0].type).toBe('modified');
    expect(result.objects[0].details).toContain('name changed');
  });
});

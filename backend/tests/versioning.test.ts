import { describe, it, expect } from 'vitest';
import type { ProjectState } from '../src/domain/types.js';

/**
 * Unit tests for versioning domain logic.
 * These test the pure functions and data structures without database access.
 * The createVersion/getVersions functions require DB and are tested in integration tests.
 */

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

describe('versioning domain types', () => {
  it('ProjectState can be serialized to JSON', () => {
    const state = makeState({
      objects: [{ id: 'o1', name: 'Order', description: '', properties: [], actions: [] }],
      links: [{ id: 'l1', name: 'OC', source: 'Order', target: 'Customer' }],
    });
    const json = JSON.stringify(state);
    const parsed = JSON.parse(json);
    expect(parsed.objects).toHaveLength(1);
    expect(parsed.links).toHaveLength(1);
    expect(parsed.schemaVersion).toBe(1);
  });

  it('handles complex nested state', () => {
    const state = makeState({
      objects: [{
        id: 'o1',
        name: 'Order',
        description: 'Test order',
        properties: [
          { name: 'id', type: 'string', required: true },
          { name: 'amount', type: 'number' },
        ],
        actions: [{
          name: 'submit',
          description: 'Submit order',
          type: 'traditional',
          businessLayer: {
            description: 'Submit',
            targetObject: 'Order',
            executorRole: 'user',
          },
          logicLayer: {
            preconditions: ['order exists'],
            parameters: [],
            postconditions: ['order submitted'],
          },
          governance: {
            permissionTier: 1,
            requiresHumanApproval: false,
            auditLog: true,
          },
        }],
        stateMachine: {
          statusProperty: 'status',
          states: [
            { name: 'draft', isInitial: true },
            { name: 'submitted' },
            { name: 'completed', isFinal: true },
          ],
          transitions: [
            { from: 'draft', to: 'submitted', trigger: 'submit' },
            { from: 'submitted', to: 'completed', trigger: 'complete' },
          ],
        },
      }],
    });
    const roundTripped = JSON.parse(JSON.stringify(state));
    expect(roundTripped.objects[0].stateMachine.states).toHaveLength(3);
    expect(roundTripped.objects[0].actions[0].governance.permissionTier).toBe(1);
  });

  it('default state has all required fields', () => {
    const state = makeState();
    expect(state.schemaVersion).toBe(1);
    expect(state.objects).toEqual([]);
    expect(state.links).toEqual([]);
    expect(state.integrations).toEqual([]);
    expect(state.aiRequirements).toEqual([]);
    expect(state.status).toBe('scouting');
  });
});

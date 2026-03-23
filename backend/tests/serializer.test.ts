import { describe, it, expect } from 'vitest';
import {
  serializeProjectState,
  deserializeProjectState,
} from '../src/domain/serializer.js';
import { CURRENT_SCHEMA_VERSION } from '../src/domain/types.js';
import type { ProjectState } from '../src/domain/types.js';

const minimalState: ProjectState = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  industry: 'manufacturing',
  useCase: 'MES',
  objects: [],
  links: [],
  integrations: [],
  aiRequirements: [],
  status: 'scouting',
};

const fullState: ProjectState = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  projectName: 'Test Project',
  industry: 'retail',
  useCase: 'Inventory',
  objects: [
    {
      id: 'obj-1',
      name: 'Product',
      nameCn: '产品',
      description: 'A product entity',
      properties: [
        { name: 'sku', type: 'string', required: true },
        { name: 'price', type: 'number', isAIDerived: false },
      ],
      actions: [
        {
          name: 'restock',
          description: 'Restock inventory',
          businessLayer: {
            description: 'Restock product inventory',
            targetObject: 'Product',
            executorRole: 'Warehouse Manager',
          },
          governance: {
            permissionTier: 2,
            requiresHumanApproval: false,
            auditLog: true,
          },
        },
      ],
      aiFeatures: [{ type: 'SMART_PROPERTY', description: 'Demand forecast' }],
    },
  ],
  links: [
    { id: 'link-1', source: 'obj-1', target: 'obj-2', label: 'contains', cardinality: '1:N' },
  ],
  integrations: [
    { systemName: 'SAP', dataPoints: ['inventory_level'], mechanism: 'REST API' },
  ],
  aiRequirements: [
    { id: 'ai-1', description: 'Demand prediction', extractedFrom: 'chat', status: 'identified' },
  ],
  status: 'designing',
};

describe('serializeProjectState', () => {
  it('stamps current schemaVersion', () => {
    const json = serializeProjectState(minimalState);
    expect((json as Record<string, unknown>)['schemaVersion']).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('preserves all fields in full state', () => {
    const json = serializeProjectState(fullState) as Record<string, unknown>;
    expect(json['projectName']).toBe('Test Project');
    expect(json['industry']).toBe('retail');
    const objects = json['objects'] as unknown[];
    expect(objects).toHaveLength(1);
  });
});

describe('deserializeProjectState', () => {
  it('round-trips a full state', () => {
    const json = serializeProjectState(fullState);
    const restored = deserializeProjectState(json);
    expect(restored.projectName).toBe('Test Project');
    expect(restored.objects).toHaveLength(1);
    expect(restored.objects[0].name).toBe('Product');
    expect(restored.objects[0].properties).toHaveLength(2);
    expect(restored.objects[0].actions).toHaveLength(1);
    expect(restored.links).toHaveLength(1);
    expect(restored.integrations).toHaveLength(1);
    expect(restored.aiRequirements).toHaveLength(1);
    expect(restored.status).toBe('designing');
  });

  it('handles null input with defaults', () => {
    const result = deserializeProjectState(null);
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.objects).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.status).toBe('scouting');
  });

  it('handles undefined input with defaults', () => {
    const result = deserializeProjectState(undefined);
    expect(result.industry).toBe('');
    expect(result.useCase).toBe('');
  });

  it('handles empty object with defaults', () => {
    const result = deserializeProjectState({});
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.objects).toEqual([]);
    expect(result.status).toBe('scouting');
  });

  it('migrates v0 (no schemaVersion) to current', () => {
    const v0Data = {
      industry: 'logistics',
      useCase: 'delivery',
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      status: 'scouting',
    };
    const result = deserializeProjectState(v0Data);
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('fills missing arrays with defaults', () => {
    const partial = { industry: 'finance', useCase: 'lending' };
    const result = deserializeProjectState(partial);
    expect(result.objects).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.integrations).toEqual([]);
    expect(result.aiRequirements).toEqual([]);
    expect(result.status).toBe('scouting');
  });

  it('preserves extra fields via passthrough', () => {
    const withExtra = {
      industry: 'energy',
      useCase: 'grid',
      objects: [{ id: 'x', name: 'Grid', description: 'Power grid', properties: [], actions: [], customField: 42 }],
      links: [],
      integrations: [],
      aiRequirements: [],
      status: 'designing',
    };
    const result = deserializeProjectState(withExtra);
    expect((result.objects[0] as unknown as Record<string, unknown>)['customField']).toBe(42);
  });

  it('rejects non-object input', () => {
    expect(() => deserializeProjectState('string')).toThrow('Expected object');
    expect(() => deserializeProjectState(42)).toThrow('Expected object');
    expect(() => deserializeProjectState([1, 2])).toThrow('Expected object');
  });

  it('validates action governance tiers', () => {
    const data = {
      objects: [{
        id: 'a', name: 'A', description: 'd', properties: [],
        actions: [{
          name: 'act', description: 'desc',
          governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' },
        }],
      }],
    };
    const result = deserializeProjectState(data);
    expect(result.objects[0].actions[0].governance?.permissionTier).toBe(3);
  });
});

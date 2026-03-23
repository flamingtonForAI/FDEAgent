import { describe, it, expect } from 'vitest';
import { deserializeProjectState, serializeProjectState } from '../src/domain/serializer.js';

describe('serializer round-trip for versioning', () => {
  it('serializes and deserializes a full project state', () => {
    const input = {
      schemaVersion: 1,
      industry: 'healthcare',
      useCase: 'patient management',
      objects: [{
        id: 'o1',
        name: 'Patient',
        description: 'A patient record',
        properties: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string' },
        ],
        actions: [{
          name: 'admit',
          description: 'Admit patient',
          businessLayer: {
            description: 'Admit a patient',
            targetObject: 'Patient',
            executorRole: 'nurse',
          },
        }],
      }],
      links: [{ id: 'l1', name: 'PatientToDoctor', source: 'Patient', target: 'Doctor', cardinality: '1:N' }],
      integrations: [],
      aiRequirements: [],
      status: 'designing' as const,
    };

    const serialized = serializeProjectState(input);
    const deserialized = deserializeProjectState(serialized);

    expect(deserialized.industry).toBe('healthcare');
    expect(deserialized.objects).toHaveLength(1);
    expect(deserialized.objects[0].name).toBe('Patient');
    expect(deserialized.objects[0].properties).toHaveLength(2);
    expect(deserialized.objects[0].actions).toHaveLength(1);
    expect(deserialized.links).toHaveLength(1);
    expect(deserialized.status).toBe('designing');
  });

  it('deserializes null to empty state', () => {
    const state = deserializeProjectState(null);
    expect(state.objects).toEqual([]);
    expect(state.links).toEqual([]);
    expect(state.status).toBe('scouting');
  });

  it('migrates v0 data (no schemaVersion) to current version', () => {
    const raw = {
      industry: 'retail',
      useCase: 'inventory',
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      status: 'scouting',
    };
    const state = deserializeProjectState(raw);
    expect(state.schemaVersion).toBe(1);
  });

  it('preserves extra fields via passthrough', () => {
    const raw = {
      schemaVersion: 1,
      industry: 'test',
      useCase: 'test',
      objects: [{
        id: 'o1',
        name: 'Obj',
        description: '',
        properties: [],
        actions: [],
        customField: 'preserved',
      }],
      links: [],
      integrations: [],
      aiRequirements: [],
      status: 'scouting',
    };
    const state = deserializeProjectState(raw);
    expect((state.objects[0] as Record<string, unknown>).customField).toBe('preserved');
  });
});

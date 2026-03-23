import { describe, it, expect } from 'vitest';
import { extractJSON } from '../lib/jsonUtils';
import type { OntologyObject, OntologyLink, ExternalIntegration, ProjectState } from '../types';

describe('extractJSON', () => {
  it('returns raw JSON when input starts with {', () => {
    const input = '{"key": "value"}';
    expect(extractJSON(input)).toBe('{"key": "value"}');
  });

  it('extracts JSON from ```json fences', () => {
    const input = 'Here is the result:\n```json\n{"objects": []}\n```\nDone.';
    expect(extractJSON(input)).toBe('{"objects": []}');
  });

  it('extracts JSON from ``` fences without language tag', () => {
    const input = '```\n{"a": 1}\n```';
    expect(extractJSON(input)).toBe('{"a": 1}');
  });

  it('extracts first { ... } block as fallback', () => {
    const input = 'The answer is {"x": 42} and that is it.';
    expect(extractJSON(input)).toBe('{"x": 42}');
  });

  it('returns original trimmed text when no JSON found', () => {
    const input = '  no json here  ';
    expect(extractJSON(input)).toBe('no json here');
  });

  it('handles nested braces correctly', () => {
    const input = 'prefix {"a": {"b": [1,2,3]}} suffix';
    const result = extractJSON(input);
    expect(JSON.parse(result)).toEqual({ a: { b: [1, 2, 3] } });
  });
});

describe('AI designOntology output schema validation', () => {
  // Simulate a typical AI response for designOntology
  const sampleAIResponse = `\`\`\`json
{
  "objects": [
    {
      "id": "obj-product",
      "name": "Product",
      "description": "A retail product in inventory",
      "properties": [
        { "name": "sku", "type": "string", "required": true },
        { "name": "price", "type": "number" }
      ],
      "actions": [
        {
          "name": "restock",
          "description": "Restock product inventory"
        }
      ]
    },
    {
      "id": "obj-order",
      "name": "Order",
      "description": "Customer purchase order",
      "properties": [
        { "name": "orderId", "type": "string" },
        { "name": "total", "type": "number" }
      ],
      "actions": []
    }
  ],
  "links": [
    {
      "id": "link-1",
      "source": "obj-product",
      "target": "obj-order",
      "type": "contains",
      "cardinality": "1:N"
    }
  ],
  "integrations": [
    {
      "id": "int-1",
      "name": "ERP System",
      "type": "import",
      "description": "Import product data from ERP"
    }
  ]
}
\`\`\``;

  function parseDesignOutput(raw: string): { objects: OntologyObject[]; links: OntologyLink[]; integrations: ExternalIntegration[] } {
    const json = extractJSON(raw);
    return JSON.parse(json);
  }

  it('parses to valid structure with objects, links, integrations', () => {
    const result = parseDesignOutput(sampleAIResponse);
    expect(result).toHaveProperty('objects');
    expect(result).toHaveProperty('links');
    expect(result).toHaveProperty('integrations');
    expect(Array.isArray(result.objects)).toBe(true);
    expect(Array.isArray(result.links)).toBe(true);
    expect(Array.isArray(result.integrations)).toBe(true);
  });

  it('objects have required fields: id, name, description, properties, actions', () => {
    const result = parseDesignOutput(sampleAIResponse);
    for (const obj of result.objects) {
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('name');
      expect(obj).toHaveProperty('description');
      expect(obj).toHaveProperty('properties');
      expect(obj).toHaveProperty('actions');
      expect(typeof obj.id).toBe('string');
      expect(typeof obj.name).toBe('string');
      expect(Array.isArray(obj.properties)).toBe(true);
      expect(Array.isArray(obj.actions)).toBe(true);
    }
  });

  it('properties have name and type', () => {
    const result = parseDesignOutput(sampleAIResponse);
    for (const obj of result.objects) {
      for (const prop of obj.properties) {
        expect(prop).toHaveProperty('name');
        expect(prop).toHaveProperty('type');
        expect(typeof prop.name).toBe('string');
        expect(typeof prop.type).toBe('string');
      }
    }
  });

  it('actions have name and description', () => {
    const result = parseDesignOutput(sampleAIResponse);
    for (const obj of result.objects) {
      for (const action of obj.actions) {
        expect(action).toHaveProperty('name');
        expect(action).toHaveProperty('description');
      }
    }
  });

  it('links have id, source, and target', () => {
    const result = parseDesignOutput(sampleAIResponse);
    for (const link of result.links) {
      expect(link).toHaveProperty('id');
      expect(typeof link.id).toBe('string');
      // Links may use source/target or sourceObject/targetObject
      const hasSource = link.source || link.sourceObject || link.sourceObjectId || link.sourceId;
      const hasTarget = link.target || link.targetObject || link.targetObjectId || link.targetId;
      expect(hasSource).toBeTruthy();
      expect(hasTarget).toBeTruthy();
    }
  });

  it('integrations have at minimum id or name', () => {
    const result = parseDesignOutput(sampleAIResponse);
    for (const integration of result.integrations) {
      const hasIdentifier = integration.id || integration.name || integration.systemName;
      expect(hasIdentifier).toBeTruthy();
    }
  });

  it('parsed result can populate a ProjectState', () => {
    const result = parseDesignOutput(sampleAIResponse);
    const state: ProjectState = {
      industry: 'Retail',
      useCase: 'Inventory',
      objects: result.objects,
      links: result.links,
      integrations: result.integrations,
      aiRequirements: [],
      status: 'designing',
    };
    expect(state.objects.length).toBe(2);
    expect(state.links.length).toBe(1);
    expect(state.integrations.length).toBe(1);
  });
});

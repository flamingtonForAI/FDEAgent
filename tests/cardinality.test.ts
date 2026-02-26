import assert from 'node:assert/strict';
import {
  normalizeCardinality,
  normalizeLink,
  normalizeLinks,
  normalizeProjectState,
} from '../lib/cardinality.js';

const run = () => {
  assert.equal(normalizeCardinality('manyToOne'), 'N:1');
  assert.equal(normalizeCardinality('many-to-many'), 'N:N');
  assert.equal(normalizeCardinality('1:N'), '1:N');
  assert.equal(normalizeCardinality(undefined), undefined);

  const normalized = normalizeLink({
    id: 'l1',
    name: 'owns',
    sourceObject: 'order',
    targetObjectId: 'customer',
    cardinality: 'manyToOne',
  });
  assert.equal(normalized.source, 'order');
  assert.equal(normalized.target, 'customer');
  assert.equal(normalized.label, 'owns');
  assert.equal(normalized.cardinality, 'N:1');

  const normalizedTwice = normalizeLink(normalized);
  assert.deepEqual(normalizedTwice, normalized);

  const links = normalizeLinks([
    {
      id: 'l2',
      source: 'a',
      target: 'b',
      label: 'rel',
      cardinality: 'one-to-many',
    },
  ]);
  assert.equal(links[0].cardinality, '1:N');

  const state = normalizeProjectState({
    industry: 'retail',
    useCase: 'inventory',
    status: 'scouting',
    objects: [],
    integrations: [],
    aiRequirements: [],
    links: [
      {
        id: 'l3',
        sourceObjectId: 'sku',
        targetObjectId: 'warehouse',
        name: 'stored_in',
        cardinality: 'manyToMany',
      },
    ],
  });
  assert.equal(state.links[0].cardinality, 'N:N');
  assert.equal(state.links[0].source, 'sku');
  assert.equal(state.links[0].target, 'warehouse');
};

run();
console.log('cardinality tests passed');

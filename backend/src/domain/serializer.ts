/**
 * Domain Serializer — ProjectState ↔ JSONB for Prisma.
 *
 * - serializeProjectState: domain → plain JSON value safe for Prisma JSONB
 * - deserializeProjectState: unknown JSONB → validated domain ProjectState
 *
 * Deserialization is lenient: missing fields get defaults, unknown fields
 * are stripped. Schema version migration is handled transparently.
 */

import { z } from 'zod';
import { CURRENT_SCHEMA_VERSION } from './types.js';
import type { ProjectState } from './types.js';

// ─── Zod schemas (lenient, with defaults) ──────────────────────

const propertySchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  isAIDerived: z.boolean().optional(),
  logicDescription: z.string().optional(),
}).passthrough();

const actionParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'date', 'datetime', 'timestamp', 'object', 'array']),
  required: z.boolean(),
  description: z.string(),
}).passthrough();

const rollbackStrategySchema = z.object({
  type: z.enum(['compensating_action', 'manual', 'none']),
  compensatingAction: z.string().optional(),
  timeoutMinutes: z.number().optional(),
  requiresApproval: z.boolean().optional(),
}).passthrough();

const actionSchema = z.object({
  name: z.string(),
  nameCn: z.string().optional(),
  type: z.enum(['traditional', 'generative', 'ai-assisted', 'automated']).optional(),
  description: z.string().default(''),
  descriptionCn: z.string().optional(),
  aiLogic: z.string().optional(),
  aiCapability: z.unknown().optional(),
  businessLayer: z.object({
    description: z.string(),
    targetObject: z.string(),
    executorRole: z.string(),
    triggerCondition: z.string().optional(),
  }).passthrough().optional(),
  logicLayer: z.object({
    preconditions: z.array(z.string()).default([]),
    parameters: z.array(actionParameterSchema).default([]),
    postconditions: z.array(z.string()).default([]),
    sideEffects: z.array(z.string()).optional(),
  }).passthrough().optional(),
  implementationLayer: z.object({
    apiEndpoint: z.string().optional(),
    apiMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    requestPayload: z.record(z.unknown()).optional(),
    agentToolSpec: z.object({
      name: z.string(),
      description: z.string(),
      parameters: z.record(z.unknown()),
    }).optional(),
  }).passthrough().optional(),
  governance: z.object({
    permissionTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    requiresHumanApproval: z.boolean(),
    auditLog: z.boolean(),
    riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  }).passthrough().optional(),
  rollbackStrategy: rollbackStrategySchema.optional(),
}).passthrough();

const aiFeatureSchema = z.object({
  type: z.string(),
  name: z.string().optional(),
  description: z.string(),
}).passthrough();

const stateDefinitionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isInitial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
  allowedActions: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
}).passthrough();

const stateTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  trigger: z.string(),
  guard: z.string().optional(),
  description: z.string().optional(),
}).passthrough();

const stateMachineSchema = z.object({
  statusProperty: z.string(),
  states: z.array(stateDefinitionSchema).default([]),
  transitions: z.array(stateTransitionSchema).default([]),
  description: z.string().optional(),
}).passthrough();

const ontologyObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameCn: z.string().optional(),
  description: z.string().default(''),
  descriptionCn: z.string().optional(),
  primaryKey: z.string().optional(),
  objectType: z.enum(['entity', 'event', 'document', 'reference']).optional(),
  properties: z.array(propertySchema).default([]),
  actions: z.array(actionSchema).default([]),
  aiFeatures: z.array(aiFeatureSchema).optional(),
  stateMachine: stateMachineSchema.optional(),
}).passthrough();

const ontologyLinkSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  nameCn: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  target: z.string().optional(),
  sourceObject: z.string().optional(),
  targetObject: z.string().optional(),
  sourceObjectId: z.string().optional(),
  targetObjectId: z.string().optional(),
  sourceId: z.string().optional(),
  targetId: z.string().optional(),
  label: z.string().optional(),
  type: z.string().optional(),
  isSemantic: z.boolean().optional(),
  cardinality: z.string().optional(),
}).passthrough();

const integrationSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  nameCn: z.string().optional(),
  type: z.string().optional(),
  systemName: z.string().optional(),
  sourceSystem: z.string().optional(),
  dataPoints: z.array(z.string()).optional(),
  syncedObjects: z.array(z.string()).optional(),
  mechanism: z.string().optional(),
  frequency: z.string().optional(),
  targetObjectId: z.string().optional(),
  description: z.string().optional(),
  direction: z.enum(['import', 'export', 'bidirectional']).optional(),
  syncPolicy: z.object({
    mode: z.enum(['realtime', 'batch', 'event-driven', 'manual']),
    frequency: z.string().optional(),
    retryPolicy: z.string().optional(),
    conflictStrategy: z.enum(['source-wins', 'target-wins', 'manual-review', 'last-write-wins']).optional(),
  }).optional(),
  fieldMappings: z.array(z.object({
    sourceField: z.string(),
    targetPropertyId: z.string().optional(),
    targetPropertyName: z.string(),
    transform: z.enum(['direct', 'concat', 'unit-conversion', 'lookup', 'date-format', 'custom']).optional(),
    transformNote: z.string().optional(),
    required: z.boolean().optional(),
  })).optional(),
}).passthrough();

const aiRequirementSchema = z.object({
  id: z.string(),
  description: z.string(),
  extractedFrom: z.string(),
  relatedObjects: z.array(z.string()).optional(),
  relatedActions: z.array(z.string()).optional(),
  status: z.enum(['identified', 'validated', 'implemented', 'blocked']).default('identified'),
  blockedReason: z.string().optional(),
}).passthrough();

/** Top-level ProjectState schema for deserialization */
const projectStateSchema = z.object({
  schemaVersion: z.number().default(CURRENT_SCHEMA_VERSION),
  projectName: z.string().optional(),
  industry: z.string().default(''),
  useCase: z.string().default(''),
  objects: z.array(ontologyObjectSchema).default([]),
  links: z.array(ontologyLinkSchema).default([]),
  integrations: z.array(integrationSchema).default([]),
  aiRequirements: z.array(aiRequirementSchema).default([]),
  status: z.enum(['scouting', 'designing', 'completed']).default('scouting'),
});

// ─── Schema Migration ──────────────────────────────────────────

/**
 * Migrate raw data from older schema versions to CURRENT_SCHEMA_VERSION.
 * Mutates in place for efficiency (called on a freshly-parsed object).
 */
function migrateRaw(raw: Record<string, unknown>): void {
  const version = typeof raw['schemaVersion'] === 'number' ? raw['schemaVersion'] : 0;

  if (version < 1) {
    // v0 → v1: add schemaVersion field (no structural changes)
    raw['schemaVersion'] = CURRENT_SCHEMA_VERSION;
  }

  // Future migrations go here:
  // if (version < 2) { ... }
}

// ─── Public API ────────────────────────────────────────────────

export type JsonValue =
  | string | number | boolean | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Serialize a domain ProjectState into a plain JSON value for Prisma JSONB.
 * Stamps the current schemaVersion.
 */
export function serializeProjectState(state: ProjectState): JsonValue {
  return {
    ...state,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  } as unknown as JsonValue;
}

/**
 * Deserialize raw JSONB (from Prisma) into a validated ProjectState.
 * Lenient: missing fields get defaults, extra fields are preserved via passthrough.
 */
export function deserializeProjectState(raw: unknown): ProjectState {
  if (raw === null || raw === undefined) {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      industry: '',
      useCase: '',
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      status: 'scouting',
    };
  }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Expected object for ProjectState, got ${typeof raw}`);
  }

  const mutable = { ...raw } as Record<string, unknown>;
  migrateRaw(mutable);

  return projectStateSchema.parse(mutable) as ProjectState;
}

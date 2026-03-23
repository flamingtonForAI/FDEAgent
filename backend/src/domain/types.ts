/**
 * Domain Types — Backend-independent ontology model.
 *
 * These mirror the frontend types.ts shapes but are defined independently
 * so the backend never imports from the frontend bundle.
 */

export const CURRENT_SCHEMA_VERSION = 1;

// ─── Property ──────────────────────────────────────────────────

export interface Property {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  isAIDerived?: boolean;
  logicDescription?: string;
}

// ─── Action ────────────────────────────────────────────────────

export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'timestamp' | 'object' | 'array';
  required: boolean;
  description: string;
}

export interface RollbackStrategy {
  type: 'compensating_action' | 'manual' | 'none';
  compensatingAction?: string;
  timeoutMinutes?: number;
  requiresApproval?: boolean;
}

export interface AIPAction {
  name: string;
  nameCn?: string;
  type?: 'traditional' | 'generative' | 'ai-assisted' | 'automated';
  description: string;
  descriptionCn?: string;
  aiLogic?: string;
  aiCapability?: unknown;

  businessLayer?: {
    description: string;
    targetObject: string;
    executorRole: string;
    triggerCondition?: string;
  };

  logicLayer?: {
    preconditions: string[];
    parameters: ActionParameter[];
    postconditions: string[];
    sideEffects?: string[];
  };

  implementationLayer?: {
    apiEndpoint?: string;
    apiMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requestPayload?: Record<string, unknown>;
    agentToolSpec?: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  };

  governance?: {
    permissionTier: 1 | 2 | 3 | 4;
    requiresHumanApproval: boolean;
    auditLog: boolean;
    riskLevel?: 'low' | 'medium' | 'high';
  };

  rollbackStrategy?: RollbackStrategy;
}

// ─── Ontology Object ───────────────────────────────────────────

export interface AIFeature {
  type: string;
  name?: string;
  description: string;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  guard?: string;
  description?: string;
}

export interface StateDefinition {
  name: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  allowedActions?: string[];
  metadata?: Record<string, unknown>;
}

export interface StateMachine {
  statusProperty: string;
  states: StateDefinition[];
  transitions: StateTransition[];
  description?: string;
}

export interface OntologyObject {
  id: string;
  name: string;
  nameCn?: string;
  description: string;
  descriptionCn?: string;
  primaryKey?: string;
  objectType?: 'entity' | 'event' | 'document' | 'reference';
  properties: Property[];
  actions: AIPAction[];
  aiFeatures?: AIFeature[];
  stateMachine?: StateMachine;
}

// ─── Ontology Link ─────────────────────────────────────────────

export type Cardinality =
  | '1:1' | '1:N' | 'N:1' | 'N:N'
  | 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
  | 'manyToOne' | 'oneToMany' | 'manyToMany' | 'oneToOne';

export interface OntologyLink {
  id: string;
  name?: string;
  nameCn?: string;
  description?: string;
  source?: string;
  target?: string;
  sourceObject?: string;
  targetObject?: string;
  sourceObjectId?: string;
  targetObjectId?: string;
  sourceId?: string;
  targetId?: string;
  label?: string;
  type?: string;
  isSemantic?: boolean;
  cardinality?: Cardinality;
}

// ─── External Integration ──────────────────────────────────────

export interface FieldMapping {
  sourceField: string;
  targetPropertyId?: string;
  targetPropertyName: string;
  transform?: 'direct' | 'concat' | 'unit-conversion' | 'lookup' | 'date-format' | 'custom';
  transformNote?: string;
  required?: boolean;
}

export interface ExternalIntegration {
  id?: string;
  name?: string;
  nameCn?: string;
  type?: string;
  systemName?: string;
  sourceSystem?: string;
  dataPoints?: string[];
  syncedObjects?: string[];
  mechanism?: string;
  frequency?: string;
  targetObjectId?: string;
  description?: string;
  direction?: 'import' | 'export' | 'bidirectional';
  syncPolicy?: {
    mode: 'realtime' | 'batch' | 'event-driven' | 'manual';
    frequency?: string;
    retryPolicy?: string;
    conflictStrategy?: 'source-wins' | 'target-wins' | 'manual-review' | 'last-write-wins';
  };
  fieldMappings?: FieldMapping[];
  [key: string]: unknown;
}

// ─── AI Requirement ────────────────────────────────────────────

export interface AIRequirement {
  id: string;
  description: string;
  extractedFrom: string;
  relatedObjects?: string[];
  relatedActions?: string[];
  status: 'identified' | 'validated' | 'implemented' | 'blocked';
  blockedReason?: string;
}

// ─── Project State ─────────────────────────────────────────────

export interface ProjectState {
  schemaVersion: number;
  projectName?: string;
  industry: string;
  useCase: string;
  objects: OntologyObject[];
  links: OntologyLink[];
  integrations: ExternalIntegration[];
  aiRequirements: AIRequirement[];
  status: 'scouting' | 'designing' | 'completed';
}

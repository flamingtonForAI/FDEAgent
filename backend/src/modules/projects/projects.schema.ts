import { z } from 'zod';

// ============= Base Schema Definitions =============

// Property schema for OntologyObject
const propertySchema = z.object({
  name: z.string().max(100),
  type: z.string().max(50),
  isAIDerived: z.boolean().optional(),
  logicDescription: z.string().max(1000).optional(),
  description: z.string().max(500).optional(),
}).passthrough(); // Allow additional fields for flexibility

// Action parameter schema
const actionParameterSchema = z.object({
  name: z.string().max(100),
  type: z.enum(['string', 'number', 'boolean', 'date', 'object', 'array']),
  required: z.boolean(),
  description: z.string().max(500),
}).passthrough();

// Action business layer schema
const businessLayerSchema = z.object({
  description: z.string().max(2000),
  targetObject: z.string().max(100),
  executorRole: z.string().max(200),
  triggerCondition: z.string().max(500).optional(),
}).passthrough().optional();

// Action logic layer schema
const logicLayerSchema = z.object({
  preconditions: z.array(z.string().max(500)).max(20),
  parameters: z.array(actionParameterSchema).max(30),
  postconditions: z.array(z.string().max(500)).max(20),
  sideEffects: z.array(z.string().max(500)).max(20).optional(),
}).passthrough().optional();

// Action implementation layer schema
const implementationLayerSchema = z.object({
  apiEndpoint: z.string().max(500).optional(),
  apiMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  requestPayload: z.record(z.unknown()).optional(),
  agentToolSpec: z.object({
    name: z.string().max(100),
    description: z.string().max(1000),
    parameters: z.record(z.unknown()),
  }).optional(),
}).passthrough().optional();

// Action governance schema
const governanceSchema = z.object({
  permissionTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  requiresHumanApproval: z.boolean(),
  auditLog: z.boolean(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
}).passthrough().optional();

// Action schema (AIPAction)
const actionSchema = z.object({
  name: z.string().max(200),
  type: z.enum(['traditional', 'generative']).optional(),
  description: z.string().max(2000),
  aiLogic: z.string().max(2000).optional(),
  businessLayer: businessLayerSchema,
  logicLayer: logicLayerSchema,
  implementationLayer: implementationLayerSchema,
  governance: governanceSchema,
}).passthrough();

// AI Feature schema
const aiFeatureSchema = z.object({
  type: z.string().max(100),
  description: z.string().max(1000),
}).passthrough();

// OntologyObject schema
const ontologyObjectSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200),
  description: z.string().max(2000),
  properties: z.array(propertySchema).max(100).default([]),
  actions: z.array(actionSchema).max(50).default([]),
  aiFeatures: z.array(aiFeatureSchema).max(20).default([]),
  // Allow bilingual fields
  nameCn: z.string().max(200).optional(),
  descriptionCn: z.string().max(2000).optional(),
  primaryKey: z.string().max(100).optional(),
}).passthrough();

// OntologyLink schema
const ontologyLinkSchema = z.object({
  id: z.string().max(100),
  source: z.string().max(100),
  target: z.string().max(100),
  label: z.string().max(200),
  isSemantic: z.boolean().optional(),
}).passthrough();

// ExternalIntegration schema
const integrationSchema = z.object({
  systemName: z.string().max(200),
  dataPoints: z.array(z.string().max(200)).max(100).default([]),
  mechanism: z.string().max(500),
  targetObjectId: z.string().max(100),
}).passthrough();

// AIRequirement schema
const aiRequirementSchema = z.object({
  id: z.string().max(100),
  description: z.string().max(2000),
  extractedFrom: z.string().max(2000),
  relatedObjects: z.array(z.string().max(100)).max(50).optional(),
  relatedActions: z.array(z.string().max(100)).max(50).optional(),
  status: z.enum(['identified', 'validated', 'implemented', 'blocked']),
  blockedReason: z.string().max(1000).optional(),
}).passthrough();

// ============= Project Schemas =============

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  industry: z.string().max(100).optional(),
  useCase: z.string().max(500).optional(),
  status: z.enum(['scouting', 'designing', 'completed']).default('scouting'),
  objects: z.array(ontologyObjectSchema).max(200).default([]),
  links: z.array(ontologyLinkSchema).max(500).default([]),
  integrations: z.array(integrationSchema).max(100).default([]),
  aiRequirements: z.array(aiRequirementSchema).max(100).default([]),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  industry: z.string().max(100).optional(),
  useCase: z.string().max(500).optional(),
  status: z.enum(['scouting', 'designing', 'completed']).optional(),
  objects: z.array(ontologyObjectSchema).max(200).optional(),
  links: z.array(ontologyLinkSchema).max(500).optional(),
  integrations: z.array(integrationSchema).max(100).optional(),
  aiRequirements: z.array(aiRequirementSchema).max(100).optional(),
});

// Chat message schema with size limits
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(50000, 'Message content too long (max 50000 characters)'),
  metadata: z.object({
    type: z.enum(['archetype_import', 'session_start', 'context_boundary']).optional(),
    archetypeId: z.string().max(100).optional(),
    archetypeName: z.string().max(200).optional(),
    timestamp: z.string().max(50).optional(),
  }).passthrough().optional(),
});

// Pagination schema with bounds
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(10000, 'Page number too large').default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(50),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

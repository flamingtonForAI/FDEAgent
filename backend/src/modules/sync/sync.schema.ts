import { z } from 'zod';

// ============= Reusable Schema Components =============
// (Duplicated from projects.schema.ts for sync purposes with more lenient validation)

const propertySchema = z.object({
  name: z.string().max(100),
  type: z.string().max(50),
  isAIDerived: z.boolean().optional(),
  logicDescription: z.string().max(1000).optional(),
  description: z.string().max(500).optional(),
}).passthrough();

const actionParameterSchema = z.object({
  name: z.string().max(100),
  type: z.enum(['string', 'number', 'boolean', 'date', 'object', 'array']).optional(),
  required: z.boolean().optional(),
  description: z.string().max(500).optional(),
}).passthrough();

const actionSchema = z.object({
  name: z.string().max(200),
  type: z.enum(['traditional', 'generative']).optional(),
  description: z.string().max(2000).optional(),
  aiLogic: z.string().max(2000).optional(),
  businessLayer: z.record(z.unknown()).optional(),
  logicLayer: z.record(z.unknown()).optional(),
  implementationLayer: z.record(z.unknown()).optional(),
  governance: z.record(z.unknown()).optional(),
}).passthrough();

const aiFeatureSchema = z.object({
  type: z.string().max(100),
  description: z.string().max(1000),
}).passthrough();

const ontologyObjectSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200),
  description: z.string().max(2000).optional(),
  properties: z.array(propertySchema).max(100).default([]),
  actions: z.array(actionSchema).max(50).default([]),
  aiFeatures: z.array(aiFeatureSchema).max(20).default([]),
  nameCn: z.string().max(200).optional(),
  descriptionCn: z.string().max(2000).optional(),
  primaryKey: z.string().max(100).optional(),
}).passthrough();

const ontologyLinkSchema = z.object({
  id: z.string().max(100),
  source: z.string().max(100),
  target: z.string().max(100),
  label: z.string().max(200),
  isSemantic: z.boolean().optional(),
}).passthrough();

const integrationSchema = z.object({
  systemName: z.string().max(200),
  dataPoints: z.array(z.string().max(200)).max(100).default([]),
  mechanism: z.string().max(500).optional(),
  targetObjectId: z.string().max(100).optional(),
}).passthrough();

const aiRequirementSchema = z.object({
  id: z.string().max(100),
  description: z.string().max(2000),
  extractedFrom: z.string().max(2000).optional(),
  relatedObjects: z.array(z.string().max(100)).max(50).optional(),
  relatedActions: z.array(z.string().max(100)).max(50).optional(),
  status: z.enum(['identified', 'validated', 'implemented', 'blocked']).optional(),
  blockedReason: z.string().max(1000).optional(),
}).passthrough();

// ============= Sync Schemas =============

// Schema for syncing a complete project state
const projectSyncSchema = z.object({
  id: z.string().max(100).optional(), // Optional - if provided, updates existing; if not, creates new
  localId: z.string().max(100).optional(), // Client local project ID for local->cloud mapping
  name: z.string().max(255),
  industry: z.string().max(100).optional(),
  useCase: z.string().max(500).optional(),
  status: z.enum(['scouting', 'designing', 'completed']).default('scouting'),
  objects: z.array(ontologyObjectSchema).max(200).default([]),
  links: z.array(ontologyLinkSchema).max(500).default([]),
  integrations: z.array(integrationSchema).max(100).default([]),
  aiRequirements: z.array(aiRequirementSchema).max(100).default([]),
  localUpdatedAt: z.string().datetime().optional(), // For conflict detection
});

// Chat message metadata schema
const chatMessageMetadataSchema = z.object({
  type: z.enum(['archetype_import', 'session_start', 'context_boundary']).optional(),
  archetypeId: z.string().max(100).optional(),
  archetypeName: z.string().max(200).optional(),
  timestamp: z.string().max(50).optional(),
}).passthrough().optional();

const chatMessageSyncSchema = z.object({
  projectId: z.string().max(100),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().max(50000, 'Message content too long'),
      metadata: chatMessageMetadataSchema,
      localCreatedAt: z.string().datetime().optional(),
    })
  ).max(500, 'Too many messages in batch'),
});

const preferenceSyncSchema = z.object({
  themeId: z.string().max(50).optional(),
  language: z.enum(['en', 'cn']).optional(),
  aiProvider: z.string().max(50).nullable().optional(),
  aiModel: z.string().max(100).nullable().optional(),
  customBaseUrl: z.string().max(500).nullable().optional(),
  sidebarCollapsed: z.boolean().optional(),
  defaultTab: z.string().max(50).optional(),
});

// Archetype schema for sync (more lenient - archetype validation happens in storage service)
const archetypeSyncSchema = z.object({
  archetypeId: z.string().max(100),
  archetype: z.object({
    metadata: z.object({
      id: z.string().max(100),
      name: z.union([
        z.string().max(200),
        z.object({
          en: z.string().max(200),
          cn: z.string().max(200),
        }),
      ]),
      industry: z.string().max(100).optional(),
      domain: z.string().max(100).optional(),
    }).passthrough(),
    ontology: z.object({
      objects: z.array(z.unknown()).max(200),
      links: z.array(z.unknown()).max(500).optional(),
    }).passthrough(),
  }).passthrough(),
  originType: z.enum(['reference', 'ai-generated']),
  originData: z.record(z.unknown()).optional(),
});

// Main batch sync schema with size limits
export const batchSyncSchema = z.object({
  // Projects to sync (upsert) - limit batch size
  projects: z.array(projectSyncSchema).max(50, 'Too many projects in batch').optional(),

  // Chat messages to append - limit batch size
  chatMessages: z.array(chatMessageSyncSchema).max(50, 'Too many message batches').optional(),

  // Preferences to update
  preferences: preferenceSyncSchema.optional(),

  // Archetypes to import - limit batch size
  archetypes: z.array(archetypeSyncSchema).max(20, 'Too many archetypes in batch').optional(),

  // Client timestamp for conflict detection
  clientTimestamp: z.string().datetime().optional(),
});

export type BatchSyncInput = z.infer<typeof batchSyncSchema>;
export type ProjectSyncInput = z.infer<typeof projectSyncSchema>;
export type ChatMessageSyncInput = z.infer<typeof chatMessageSyncSchema>;

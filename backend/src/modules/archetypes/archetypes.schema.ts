import { z } from 'zod';

// Archetype metadata schema
const archetypeMetadataSchema = z.object({
  id: z.string().max(100),
  name: z.union([
    z.string().max(200),
    z.object({
      en: z.string().max(200),
      cn: z.string().max(200),
    }),
  ]),
  description: z.union([
    z.string().max(2000),
    z.object({
      en: z.string().max(2000),
      cn: z.string().max(2000),
    }),
  ]).optional(),
  industry: z.string().max(100).optional(),
  domain: z.string().max(100).optional(),
  version: z.string().max(20).optional(),
}).passthrough();

// Archetype ontology schema (basic validation - full validation in storage service)
const archetypeOntologySchema = z.object({
  objects: z.array(z.unknown()).max(200),
  links: z.array(z.unknown()).max(500).optional(),
}).passthrough();

// Full archetype schema
const archetypeSchema = z.object({
  metadata: archetypeMetadataSchema,
  ontology: archetypeOntologySchema,
  connectors: z.array(z.unknown()).max(100).optional(),
  workflows: z.array(z.unknown()).max(50).optional(),
  rules: z.array(z.unknown()).max(100).optional(),
  aiCapabilities: z.array(z.unknown()).max(50).optional(),
  dashboards: z.array(z.unknown()).max(20).optional(),
  views: z.array(z.unknown()).max(50).optional(),
  deployment: z.unknown().optional(),
  documentation: z.unknown().optional(),
}).passthrough();

// Origin data schema
const originDataSchema = z.object({
  sourceUrl: z.string().max(2000).optional(),
  sourceName: z.string().max(200).optional(),
  fetchDate: z.string().max(50).optional(),
  generationDate: z.string().max(50).optional(),
  modelUsed: z.string().max(100).optional(),
  confidence: z.number().min(0).max(1).optional(),
  promptVersion: z.string().max(50).optional(),
  userInput: z.record(z.unknown()).optional(),
}).passthrough().optional();

export const createArchetypeSchema = z.object({
  archetypeId: z.string().min(1, 'Archetype ID is required').max(100),
  archetype: archetypeSchema,
  originType: z.enum(['reference', 'ai-generated']),
  originData: originDataSchema,
});

export const updateArchetypeSchema = z.object({
  archetype: archetypeSchema.optional(),
  originData: originDataSchema,
});

export type CreateArchetypeInput = z.infer<typeof createArchetypeSchema>;
export type UpdateArchetypeInput = z.infer<typeof updateArchetypeSchema>;

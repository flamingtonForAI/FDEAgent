import { z } from 'zod';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

const chatOptionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  lang: z.string().max(10).optional(),
}).optional();

export const chatRequestSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  messages: z.array(messageSchema).min(1),
  options: chatOptionsSchema,
});

export const designRequestSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  chatHistory: z.array(messageSchema).min(1),
  options: chatOptionsSchema,
});

export const modelsQuerySchema = z.object({
  provider: z.string().min(1),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type DesignRequest = z.infer<typeof designRequestSchema>;
export type ModelsQuery = z.infer<typeof modelsQuerySchema>;

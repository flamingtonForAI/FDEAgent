import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  themeId: z.string().optional(),
  language: z.enum(['en', 'cn']).optional(),
  aiProvider: z.string().nullable().optional(),
  aiModel: z.string().nullable().optional(),
  customBaseUrl: z.string().nullable().optional(),
  sidebarCollapsed: z.boolean().optional(),
  defaultTab: z.string().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

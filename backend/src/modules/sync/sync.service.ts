import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import type { BatchSyncInput, ProjectSyncInput, ChatMessageSyncInput } from './sync.schema.js';

export interface SyncResult {
  success: boolean;
  syncedAt: Date;
  results: {
    projects?: {
      created: string[];
      updated: string[];
      failed: string[];
      mappings?: Array<{
        localId: string;
        cloudId: string;
      }>;
    };
    chatMessages?: {
      added: number;
    };
    preferences?: {
      updated: boolean;
    };
    archetypes?: {
      synced: number;
    };
  };
}

export class SyncService {
  /**
   * Batch sync - handles offline-first sync strategy
   * Uses transaction with Serializable isolation to prevent race conditions
   */
  async batchSync(userId: string, input: BatchSyncInput): Promise<SyncResult> {
    const results: SyncResult['results'] = {};
    const syncedAt = new Date();

    // Use a transaction with explicit isolation level for atomicity
    await prisma.$transaction(
      async (tx) => {
        // 1. Sync projects
        if (input.projects && input.projects.length > 0) {
          results.projects = await this.syncProjects(tx, userId, input.projects);
        }

        // 2. Sync chat messages
        if (input.chatMessages && input.chatMessages.length > 0) {
          results.chatMessages = await this.syncChatMessages(tx, userId, input.chatMessages);
        }

        // 3. Sync preferences
        if (input.preferences) {
          await tx.userPreferences.upsert({
            where: { userId },
            create: {
              userId,
              ...input.preferences,
            },
            update: input.preferences,
          });
          results.preferences = { updated: true };
        }

        // 4. Sync archetypes
        if (input.archetypes && input.archetypes.length > 0) {
          let syncedCount = 0;
          for (const archetype of input.archetypes) {
            await tx.importedArchetype.upsert({
              where: {
                userId_archetypeId: {
                  userId,
                  archetypeId: archetype.archetypeId,
                },
              },
              create: {
                userId,
                archetypeId: archetype.archetypeId,
                archetype: archetype.archetype as Prisma.InputJsonValue,
                originType: archetype.originType,
                originData: (archetype.originData ?? undefined) as Prisma.InputJsonValue | undefined,
              },
              update: {
                archetype: archetype.archetype as Prisma.InputJsonValue,
                originType: archetype.originType,
                originData: (archetype.originData ?? undefined) as Prisma.InputJsonValue | undefined,
              },
            });
            syncedCount++;
          }
          results.archetypes = { synced: syncedCount };
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 30000, // 30 second timeout
      }
    );

    return {
      success: true,
      syncedAt,
      results,
    };
  }

  /**
   * Sync projects - create or update based on ID presence
   * Optimized: Batch load existing projects to avoid N+1 queries
   */
  private async syncProjects(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    userId: string,
    projects: ProjectSyncInput[]
  ): Promise<{
    created: string[];
    updated: string[];
    failed: string[];
    mappings: Array<{ localId: string; cloudId: string }>;
  }> {
    const created: string[] = [];
    const updated: string[] = [];
    const failed: string[] = [];
    const mappings: Array<{ localId: string; cloudId: string }> = [];

    // Extract project IDs that need to be checked
    const projectIds = projects
      .map(p => p.id)
      .filter((id): id is string => id !== undefined && id !== null);

    // Batch load all existing projects in a single query (fixes N+1)
    const existingProjects = projectIds.length > 0
      ? await tx.project.findMany({
          where: {
            id: { in: projectIds },
            userId,
          },
          select: { id: true },
        })
      : [];

    // Create a Set for O(1) lookup
    const existingProjectIds = new Set(existingProjects.map(p => p.id));

    for (const project of projects) {
      try {
        if (project.id && existingProjectIds.has(project.id)) {
          // Update existing project
          await tx.project.update({
            where: { id: project.id },
            data: {
              name: project.name,
              industry: project.industry,
              useCase: project.useCase,
              status: project.status,
              objects: (project.objects ?? []) as Prisma.InputJsonValue,
              links: (project.links ?? []) as Prisma.InputJsonValue,
              integrations: (project.integrations ?? []) as Prisma.InputJsonValue,
              aiRequirements: (project.aiRequirements ?? []) as Prisma.InputJsonValue,
            },
          });
          updated.push(project.id);
        } else {
          // Create new project (no ID or ID doesn't exist for this user)
          const newProject = await tx.project.create({
            data: {
              userId,
              name: project.name,
              industry: project.industry,
              useCase: project.useCase,
              status: project.status,
              objects: (project.objects ?? []) as Prisma.InputJsonValue,
              links: (project.links ?? []) as Prisma.InputJsonValue,
              integrations: (project.integrations ?? []) as Prisma.InputJsonValue,
              aiRequirements: (project.aiRequirements ?? []) as Prisma.InputJsonValue,
            },
          });
          created.push(newProject.id);

          const localId = project.localId || (project.id?.startsWith('proj-') ? project.id : undefined);
          if (localId) {
            mappings.push({
              localId,
              cloudId: newProject.id,
            });
          }
        }
      } catch (error) {
        // Log the error for debugging
        logger.error({
          projectId: project.id,
          projectName: project.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, 'Project sync failed');
        failed.push(project.id || project.name);
      }
    }

    return { created, updated, failed, mappings };
  }

  /**
   * Sync chat messages - append new messages
   * Optimized: Batch verify project ownership to avoid N+1 queries
   */
  private async syncChatMessages(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    userId: string,
    chatMessages: ChatMessageSyncInput[]
  ): Promise<{ added: number }> {
    let added = 0;

    // Extract unique project IDs
    const projectIds = [...new Set(chatMessages.map(batch => batch.projectId))];

    // Batch verify all project ownership in a single query (fixes N+1)
    const ownedProjects = await tx.project.findMany({
      where: {
        id: { in: projectIds },
        userId,
      },
      select: { id: true },
    });

    // Create a Set for O(1) lookup
    const ownedProjectIds = new Set(ownedProjects.map(p => p.id));

    for (const batch of chatMessages) {
      // Skip if project doesn't exist or doesn't belong to user
      if (!ownedProjectIds.has(batch.projectId)) {
        logger.warn({
          projectId: batch.projectId,
          userId,
        }, 'Chat message sync skipped - project not owned');
        continue;
      }

      // Add messages
      if (batch.messages.length > 0) {
        await tx.chatMessage.createMany({
          data: batch.messages.map((msg) => ({
            projectId: batch.projectId,
            role: msg.role,
            content: msg.content,
            metadata: (msg.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
          })),
        });
        added += batch.messages.length;
      }
    }

    return { added };
  }

  /**
   * Get full sync state for a user (for initial load)
   */
  async getFullState(userId: string) {
    const [projects, preferences, archetypes] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          chatMessages: {
            orderBy: { createdAt: 'asc' },
            take: 100, // Limit initial load
          },
        },
      }),
      prisma.userPreferences.findUnique({
        where: { userId },
      }),
      prisma.importedArchetype.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return {
      projects,
      preferences,
      archetypes,
      syncedAt: new Date(),
    };
  }
}

export const syncService = new SyncService();

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { deserializeProjectState } from '../../domain/serializer.js';
import { createVersion } from '../../domain/versioning.js';
import type { ProjectState } from '../../domain/types.js';
import type { BatchSyncInput, ProjectSyncInput, ChatMessageSyncInput } from './sync.schema.js';

export interface SyncConflict {
  projectId: string;
  projectName: string;
  cloudUpdatedAt: string;
  localUpdatedAt: string;
  resolution: 'cloud_wins';
}

export interface SyncResult {
  success: boolean;
  syncedAt: Date;
  results: {
    projects?: {
      created: string[];
      updated: string[];
      failed: string[];
      conflicts: SyncConflict[];
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
    conflicts: SyncConflict[];
    mappings: Array<{ localId: string; cloudId: string }>;
  }> {
    const created: string[] = [];
    const updated: string[] = [];
    const failed: string[] = [];
    const conflicts: SyncConflict[] = [];
    const mappings: Array<{ localId: string; cloudId: string }> = [];

    // Extract project IDs that need to be checked
    const projectIds = projects
      .map(p => p.id)
      .filter((id): id is string => id !== undefined && id !== null);

    // Batch load all existing projects where user is owner OR member (with updatedAt for conflict detection)
    const existingProjects = projectIds.length > 0
      ? await tx.project.findMany({
          where: {
            id: { in: projectIds },
            OR: [
              { userId },
              { members: { some: { userId } } },
            ],
          },
          select: { id: true, userId: true, name: true, updatedAt: true, members: { where: { userId }, select: { role: true }, take: 1 } },
        })
      : [];

    // Create Maps for O(1) lookup
    const existingProjectMap = new Map(existingProjects.map(p => [p.id, p]));

    for (const project of projects) {
      try {
        // Validate/migrate JSONB data through the domain serializer
        const state = deserializeProjectState({
          industry: project.industry ?? '',
          useCase: project.useCase ?? '',
          status: project.status,
          objects: project.objects ?? [],
          links: project.links ?? [],
          integrations: project.integrations ?? [],
          aiRequirements: project.aiRequirements ?? [],
        });

        const jsonbData = {
          objects: state.objects as unknown as Prisma.InputJsonValue,
          links: state.links as unknown as Prisma.InputJsonValue,
          integrations: state.integrations as unknown as Prisma.InputJsonValue,
          aiRequirements: state.aiRequirements as unknown as Prisma.InputJsonValue,
        };

        const existing = project.id ? existingProjectMap.get(project.id) : undefined;

        if (project.id && existing) {
          // Write permission check: only owner or editor can update via sync
          const isOwner = existing.userId === userId;
          const memberRole = existing.members?.[0]?.role;
          if (!isOwner && memberRole !== 'editor') {
            logger.warn({ projectId: project.id, userId, role: memberRole }, 'Sync skipped — insufficient permissions');
            failed.push(project.id);
            continue;
          }

          // Conflict detection: compare timestamps (LWW — cloud wins)
          if (project.localUpdatedAt) {
            const localTime = new Date(project.localUpdatedAt);
            const cloudTime = existing.updatedAt;
            if (cloudTime > localTime) {
              // Cloud is newer — record conflict, skip update
              conflicts.push({
                projectId: project.id,
                projectName: existing.name ?? project.name,
                cloudUpdatedAt: cloudTime.toISOString(),
                localUpdatedAt: project.localUpdatedAt,
                resolution: 'cloud_wins',
              });
              logger.warn({
                projectId: project.id,
                cloudUpdatedAt: cloudTime.toISOString(),
                localUpdatedAt: project.localUpdatedAt,
              }, 'Sync conflict detected — cloud wins (LWW)');
              continue;
            }
          }

          // Update existing project (local is newer or no timestamp provided)
          await tx.project.update({
            where: { id: project.id },
            data: {
              name: project.name,
              industry: project.industry,
              useCase: project.useCase,
              status: project.status,
              ...jsonbData,
            },
          });
          updated.push(project.id);

          // Auto-version: compute change summary and create a version snapshot
          try {
            const changeSummary = this.computeChangeSummary(existing, state);
            await createVersion(project.id, state, userId, changeSummary, tx);
          } catch (versionError) {
            logger.warn({
              projectId: project.id,
              error: versionError instanceof Error ? versionError.message : 'Unknown',
            }, 'Auto-versioning failed (non-fatal)');
          }
        } else {
          // Create new project (no ID or ID doesn't exist for this user)
          const newProject = await tx.project.create({
            data: {
              userId,
              name: project.name,
              industry: project.industry,
              useCase: project.useCase,
              status: project.status,
              ...jsonbData,
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

    return { created, updated, failed, conflicts, mappings };
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

    // Batch verify project access (owner OR editor member) in a single query
    const accessibleProjects = await tx.project.findMany({
      where: {
        id: { in: projectIds },
        OR: [
          { userId },
          { members: { some: { userId, role: 'editor' } } },
        ],
      },
      select: { id: true },
    });

    // Create a Set for O(1) lookup
    const accessibleProjectIds = new Set(accessibleProjects.map(p => p.id));

    for (const batch of chatMessages) {
      // Skip if project doesn't exist or user lacks write access
      if (!accessibleProjectIds.has(batch.projectId)) {
        logger.warn({
          projectId: batch.projectId,
          userId,
        }, 'Chat message sync skipped - no write access');
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
   * Compute a human-readable change summary by comparing old project metadata
   * with the new state.
   */
  private computeChangeSummary(
    _existing: { id: string; name: string; updatedAt: Date },
    newState: ProjectState,
  ): string {
    const parts: string[] = [];
    const objCount = newState.objects?.length ?? 0;
    const linkCount = newState.links?.length ?? 0;
    const actionCount = newState.objects?.reduce(
      (sum, o) => sum + (o.actions?.length ?? 0), 0,
    ) ?? 0;

    if (objCount > 0) parts.push(`${objCount} objects`);
    if (linkCount > 0) parts.push(`${linkCount} links`);
    if (actionCount > 0) parts.push(`${actionCount} actions`);

    return parts.length > 0
      ? `Synced: ${parts.join(', ')}`
      : 'Synced (no entities)';
  }

  /**
   * Get full sync state for a user (for initial load).
   * JSONB columns are validated/migrated through the domain deserializer.
   */
  async getFullState(userId: string) {
    const [rawProjects, preferences, archetypes] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { userId },
            { members: { some: { userId } } },
          ],
        },
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

    // Validate/migrate JSONB columns on each project
    const projects = rawProjects.map(project => {
      const state = deserializeProjectState({
        industry: project.industry ?? '',
        useCase: project.useCase ?? '',
        status: project.status,
        objects: project.objects,
        links: project.links,
        integrations: project.integrations,
        aiRequirements: project.aiRequirements,
      });
      return {
        ...project,
        objects: state.objects,
        links: state.links,
        integrations: state.integrations,
        aiRequirements: state.aiRequirements,
      };
    });

    return {
      projects,
      preferences,
      archetypes,
      syncedAt: new Date(),
    };
  }
}

export const syncService = new SyncService();

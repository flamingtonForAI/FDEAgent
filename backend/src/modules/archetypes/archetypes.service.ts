import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';
import type { CreateArchetypeInput, UpdateArchetypeInput } from './archetypes.schema.js';

export class ArchetypesService {
  /**
   * List all imported archetypes for a user
   */
  async listArchetypes(userId: string) {
    return prisma.importedArchetype.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get a single archetype
   */
  async getArchetype(id: string, userId: string) {
    const archetype = await prisma.importedArchetype.findFirst({
      where: { id, userId },
    });

    if (!archetype) {
      throw new AppError(404, 'Archetype not found');
    }

    return archetype;
  }

  /**
   * Import/create an archetype
   */
  async createArchetype(userId: string, input: CreateArchetypeInput) {
    // Check if archetype with same archetypeId already exists for this user
    const existing = await prisma.importedArchetype.findUnique({
      where: {
        userId_archetypeId: {
          userId,
          archetypeId: input.archetypeId,
        },
      },
    });

    if (existing) {
      // Update existing archetype
      return prisma.importedArchetype.update({
        where: { id: existing.id },
        data: {
          archetype: input.archetype as Prisma.InputJsonValue,
          originType: input.originType,
          originData: (input.originData ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    }

    // Create new archetype
    return prisma.importedArchetype.create({
      data: {
        userId,
        archetypeId: input.archetypeId,
        archetype: input.archetype as Prisma.InputJsonValue,
        originType: input.originType,
        originData: (input.originData ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  /**
   * Update an archetype
   */
  async updateArchetype(id: string, userId: string, input: UpdateArchetypeInput) {
    // Verify ownership
    await this.getArchetype(id, userId);

    return prisma.importedArchetype.update({
      where: { id },
      data: {
        ...(input.archetype !== undefined && { archetype: input.archetype as Prisma.InputJsonValue }),
        ...(input.originData !== undefined && { originData: input.originData as Prisma.InputJsonValue }),
      },
    });
  }

  /**
   * Delete an archetype
   */
  async deleteArchetype(id: string, userId: string) {
    // Verify ownership
    await this.getArchetype(id, userId);

    await prisma.importedArchetype.delete({
      where: { id },
    });
  }
}

export const archetypesService = new ArchetypesService();

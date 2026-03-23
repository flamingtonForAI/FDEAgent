/**
 * Domain Versioning — create, list, and retrieve ontology version snapshots.
 */

import { prisma } from '../config/database.js';
import type { ProjectState } from './types.js';
import type { Prisma } from '@prisma/client';

/** Prisma client or transaction client — both support ontologyVersion queries. */
type PrismaLike = {
  ontologyVersion: typeof prisma.ontologyVersion;
};

/**
 * Check if an error is a Prisma unique constraint violation (P2002).
 */
function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  );
}

/**
 * Create a new version snapshot for a project.
 * Auto-increments version number based on latest existing version.
 * Uses retry loop to handle concurrent inserts (unique constraint on projectId+version).
 *
 * @param client — optional Prisma transaction client; defaults to global prisma.
 */
export async function createVersion(
  projectId: string,
  state: ProjectState,
  userId?: string,
  changeSummary?: string,
  client?: PrismaLike,
): Promise<{ id: string; version: number }> {
  const db = client ?? prisma;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const latest = await db.ontologyVersion.findFirst({
        where: { projectId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = (latest?.version ?? 0) + 1;

      const record = await db.ontologyVersion.create({
        data: {
          projectId,
          version: nextVersion,
          snapshot: state as unknown as Prisma.InputJsonValue,
          changeSummary,
          createdBy: userId,
        },
        select: { id: true, version: true },
      });

      return record;
    } catch (err) {
      if (isPrismaUniqueViolation(err) && attempt < 2) continue;
      throw err;
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error('createVersion: max retries exceeded');
}

/**
 * List versions for a project, newest first.
 */
export async function getVersions(
  projectId: string,
  limit = 50,
) {
  return prisma.ontologyVersion.findMany({
    where: { projectId },
    orderBy: { version: 'desc' },
    take: limit,
    select: {
      id: true,
      version: true,
      changeSummary: true,
      createdBy: true,
      createdAt: true,
    },
  });
}

/**
 * Get a specific version snapshot.
 */
export async function getVersion(projectId: string, versionNumber: number) {
  return prisma.ontologyVersion.findUnique({
    where: {
      projectId_version: { projectId, version: versionNumber },
    },
  });
}

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware.js';
import { getVersions, getVersion, createVersion } from '../../domain/versioning.js';
import { diffProjectStates } from '../../domain/diff.js';
import { deserializeProjectState } from '../../domain/serializer.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/error.middleware.js';
import type { Prisma } from '@prisma/client';

/**
 * Verify the requesting user owns or has access to the project.
 */
async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
  });
  if (!project) throw new AppError(404, 'Project not found');
  return project;
}

export async function versionRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // GET /api/projects/:projectId/versions — list versions
  app.get<{ Params: { projectId: string }; Querystring: { limit?: string } }>(
    '/',
    async (
      request: FastifyRequest<{ Params: { projectId: string }; Querystring: { limit?: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId } = request.params;
      await verifyProjectAccess(projectId, request.user!.userId);
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 50;
      const versions = await getVersions(projectId, limit);
      return reply.send(versions);
    },
  );

  // GET /api/projects/:projectId/versions/:version — get specific version snapshot
  app.get<{ Params: { projectId: string; version: string } }>(
    '/:version',
    async (
      request: FastifyRequest<{ Params: { projectId: string; version: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId, version: vStr } = request.params;
      await verifyProjectAccess(projectId, request.user!.userId);
      const versionNum = parseInt(vStr, 10);
      if (isNaN(versionNum)) throw new AppError(400, 'Invalid version number');
      const ver = await getVersion(projectId, versionNum);
      if (!ver) throw new AppError(404, 'Version not found');
      return reply.send(ver);
    },
  );

  // GET /api/projects/:projectId/versions/:v1/diff/:v2 — compute diff
  app.get<{ Params: { projectId: string; v1: string; v2: string } }>(
    '/:v1/diff/:v2',
    async (
      request: FastifyRequest<{ Params: { projectId: string; v1: string; v2: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId, v1, v2 } = request.params;
      await verifyProjectAccess(projectId, request.user!.userId);

      const ver1Num = parseInt(v1, 10);
      const ver2Num = parseInt(v2, 10);
      if (isNaN(ver1Num) || isNaN(ver2Num)) throw new AppError(400, 'Invalid version numbers');

      const [ver1, ver2] = await Promise.all([
        getVersion(projectId, ver1Num),
        getVersion(projectId, ver2Num),
      ]);
      if (!ver1 || !ver2) throw new AppError(404, 'One or both versions not found');

      const state1 = deserializeProjectState(ver1.snapshot);
      const state2 = deserializeProjectState(ver2.snapshot);

      const diff = diffProjectStates(state1, state2);
      return reply.send({
        before: ver1Num,
        after: ver2Num,
        ...diff,
      });
    },
  );

  // POST /api/projects/:projectId/versions/:version/restore — restore a version
  app.post<{ Params: { projectId: string; version: string } }>(
    '/:version/restore',
    async (
      request: FastifyRequest<{ Params: { projectId: string; version: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId, version: vStr } = request.params;
      const project = await verifyProjectAccess(projectId, request.user!.userId);

      // Only owner or editor can restore
      if (project.userId !== request.user!.userId) {
        const member = await prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId, userId: request.user!.userId } },
        });
        if (!member || member.role === 'viewer') {
          throw new AppError(403, 'Insufficient permissions to restore');
        }
      }

      const versionNum = parseInt(vStr, 10);
      if (isNaN(versionNum)) throw new AppError(400, 'Invalid version number');
      const ver = await getVersion(projectId, versionNum);
      if (!ver) throw new AppError(404, 'Version not found');

      const state = deserializeProjectState(ver.snapshot);

      // Update the project with the restored state
      await prisma.project.update({
        where: { id: projectId },
        data: {
          industry: state.industry,
          useCase: state.useCase,
          status: state.status,
          objects: state.objects as unknown as Prisma.InputJsonValue,
          links: state.links as unknown as Prisma.InputJsonValue,
          integrations: state.integrations as unknown as Prisma.InputJsonValue,
          aiRequirements: state.aiRequirements as unknown as Prisma.InputJsonValue,
        },
      });

      // Create a new version marking the restore
      await createVersion(
        projectId,
        state,
        request.user!.userId,
        `Restored from version ${versionNum}`,
      );

      return reply.send({ restored: true, fromVersion: versionNum });
    },
  );
}

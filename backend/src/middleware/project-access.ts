/**
 * Project access middleware factory.
 * Usage: app.addHook('preHandler', requireProjectRole('editor'))
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';

type ProjectRole = 'viewer' | 'editor' | 'owner';

const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  viewer: 0,
  editor: 1,
  owner: 2,
};

/**
 * Factory that returns a Fastify preHandler checking that the current user
 * has at least the required role on the project identified by :projectId param.
 *
 * The legacy owner (project.userId) is treated as 'owner' role.
 */
export function requireProjectRole(minimumRole: ProjectRole) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user?.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const params = request.params as Record<string, string>;
    const projectId = params.projectId || params.id;
    if (!projectId) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Missing projectId' });
    }

    // Check if user is the legacy owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Not Found', message: 'Project not found' });
    }

    let effectiveRole: ProjectRole;

    if (project.userId === userId) {
      effectiveRole = 'owner';
    } else {
      // Check ProjectMember table
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });

      if (!membership) {
        return reply.status(403).send({ error: 'Forbidden', message: 'No access to this project' });
      }

      effectiveRole = membership.role as ProjectRole;
    }

    if (ROLE_HIERARCHY[effectiveRole] < ROLE_HIERARCHY[minimumRole]) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Requires ${minimumRole} role, you have ${effectiveRole}`,
      });
    }

    // Attach role to request for downstream handlers
    (request as unknown as Record<string, unknown>).projectRole = effectiveRole;
  };
}

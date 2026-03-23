import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/error.middleware.js';
import { z } from 'zod';

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['viewer', 'editor']).default('viewer'),
});

const updateRoleSchema = z.object({
  role: z.enum(['viewer', 'editor']),
});

/**
 * Verify the requesting user is the project owner.
 */
async function requireOwner(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new AppError(403, 'Only project owner can perform this action');
  return project;
}

export async function memberRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // GET /api/projects/:projectId/members — list members
  app.get<{ Params: { projectId: string } }>(
    '/',
    async (
      request: FastifyRequest<{ Params: { projectId: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId } = request.params;

      // Verify access (owner or member)
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { userId: request.user!.userId },
            { members: { some: { userId: request.user!.userId } } },
          ],
        },
        select: { id: true, userId: true },
      });
      if (!project) throw new AppError(404, 'Project not found');

      const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Include the owner info
      const owner = await prisma.user.findUnique({
        where: { id: project.userId },
        select: { id: true, email: true },
      });

      return reply.send({
        owner: owner ? { ...owner, role: 'owner' } : null,
        members: members.map((m) => ({
          userId: m.userId,
          email: m.user.email,
          role: m.role,
          invitedBy: m.invitedBy,
          createdAt: m.createdAt,
        })),
      });
    },
  );

  // POST /api/projects/:projectId/members — add member (owner only)
  app.post<{ Params: { projectId: string }; Body: z.infer<typeof addMemberSchema> }>(
    '/',
    async (
      request: FastifyRequest<{ Params: { projectId: string }; Body: z.infer<typeof addMemberSchema> }>,
      reply: FastifyReply,
    ) => {
      const { projectId } = request.params;
      await requireOwner(projectId, request.user!.userId);

      const { email, role } = addMemberSchema.parse(request.body);

      // Find user by email
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) throw new AppError(404, 'User not found');
      if (targetUser.id === request.user!.userId) {
        throw new AppError(400, 'Cannot add yourself as a member');
      }

      // Check if already a member
      const existing = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: targetUser.id } },
      });
      if (existing) throw new AppError(409, 'User is already a member');

      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId: targetUser.id,
          role,
          invitedBy: request.user!.userId,
        },
      });

      return reply.status(201).send({
        userId: member.userId,
        email: targetUser.email,
        role: member.role,
        createdAt: member.createdAt,
      });
    },
  );

  // PUT /api/projects/:projectId/members/:userId — change role (owner only)
  app.put<{ Params: { projectId: string; userId: string }; Body: z.infer<typeof updateRoleSchema> }>(
    '/:userId',
    async (
      request: FastifyRequest<{ Params: { projectId: string; userId: string }; Body: z.infer<typeof updateRoleSchema> }>,
      reply: FastifyReply,
    ) => {
      const { projectId, userId } = request.params;
      await requireOwner(projectId, request.user!.userId);

      const { role } = updateRoleSchema.parse(request.body);

      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!member) throw new AppError(404, 'Member not found');

      const updated = await prisma.projectMember.update({
        where: { projectId_userId: { projectId, userId } },
        data: { role },
      });

      return reply.send({ userId: updated.userId, role: updated.role });
    },
  );

  // DELETE /api/projects/:projectId/members/:userId — remove member (owner only)
  app.delete<{ Params: { projectId: string; userId: string } }>(
    '/:userId',
    async (
      request: FastifyRequest<{ Params: { projectId: string; userId: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId, userId } = request.params;
      await requireOwner(projectId, request.user!.userId);

      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!member) throw new AppError(404, 'Member not found');

      await prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId } },
      });

      return reply.status(204).send();
    },
  );
}

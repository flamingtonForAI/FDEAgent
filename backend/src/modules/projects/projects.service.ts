import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ChatMessageInput,
  PaginationInput,
} from './projects.schema.js';

export class ProjectsService {
  /**
   * List all projects for a user
   */
  async listProjects(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        industry: true,
        useCase: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get a single project with full data
   */
  async getProject(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return project;
  }

  /**
   * Create a new project
   */
  async createProject(userId: string, input: CreateProjectInput) {
    return prisma.project.create({
      data: {
        userId,
        name: input.name,
        industry: input.industry,
        useCase: input.useCase,
        status: input.status,
        objects: (input.objects ?? []) as Prisma.InputJsonValue,
        links: (input.links ?? []) as Prisma.InputJsonValue,
        integrations: (input.integrations ?? []) as Prisma.InputJsonValue,
        aiRequirements: (input.aiRequirements ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ) {
    // Verify ownership
    const project = await this.getProject(projectId, userId);

    return prisma.project.update({
      where: { id: project.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.useCase !== undefined && { useCase: input.useCase }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.objects !== undefined && { objects: input.objects as Prisma.InputJsonValue }),
        ...(input.links !== undefined && { links: input.links as Prisma.InputJsonValue }),
        ...(input.integrations !== undefined && { integrations: input.integrations as Prisma.InputJsonValue }),
        ...(input.aiRequirements !== undefined && { aiRequirements: input.aiRequirements as Prisma.InputJsonValue }),
      },
    });
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string, userId: string) {
    // Verify ownership
    await this.getProject(projectId, userId);

    await prisma.project.delete({
      where: { id: projectId },
    });
  }

  /**
   * Get chat messages for a project (paginated)
   */
  async getChatMessages(
    projectId: string,
    userId: string,
    pagination: PaginationInput
  ) {
    // Verify ownership
    await this.getProject(projectId, userId);

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({ where: { projectId } }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add a chat message to a project
   */
  async addChatMessage(
    projectId: string,
    userId: string,
    input: ChatMessageInput
  ) {
    // Verify ownership
    await this.getProject(projectId, userId);

    return prisma.chatMessage.create({
      data: {
        projectId,
        role: input.role,
        content: input.content,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  /**
   * Add multiple chat messages (batch)
   */
  async addChatMessages(
    projectId: string,
    userId: string,
    messages: ChatMessageInput[]
  ) {
    // Verify ownership
    await this.getProject(projectId, userId);

    return prisma.chatMessage.createMany({
      data: messages.map((msg) => ({
        projectId,
        role: msg.role,
        content: msg.content,
        metadata: (msg.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      })),
    });
  }

  /**
   * Get audit logs for a project (paginated)
   */
  async getAuditLogs(
    projectId: string,
    userId: string,
    pagination: PaginationInput
  ) {
    // Verify ownership
    await this.getProject(projectId, userId);

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: { projectId } }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add an audit log entry
   */
  async addAuditLog(
    projectId: string,
    userId: string,
    log: {
      changeType: string;
      entityType: string;
      entityId: string;
      entityName: string;
      parentId?: string;
      parentName?: string;
      beforeState?: unknown;
      afterState?: unknown;
      description: string;
      source?: string;
    }
  ) {
    // Verify ownership
    await this.getProject(projectId, userId);

    return prisma.auditLog.create({
      data: {
        projectId,
        source: log.source || 'user',
        changeType: log.changeType,
        entityType: log.entityType,
        entityId: log.entityId,
        entityName: log.entityName,
        parentId: log.parentId,
        parentName: log.parentName,
        beforeState: (log.beforeState ?? undefined) as Prisma.InputJsonValue | undefined,
        afterState: (log.afterState ?? undefined) as Prisma.InputJsonValue | undefined,
        description: log.description,
      },
    });
  }
}

export const projectsService = new ProjectsService();

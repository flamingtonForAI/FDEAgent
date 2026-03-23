import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware.js';
import { deserializeProjectState, serializeProjectState } from '../../domain/serializer.js';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ChatMessageInput,
  PaginationInput,
} from './projects.schema.js';

/**
 * Reconstruct a ProjectState from separate Prisma JSONB columns,
 * then validate/migrate via the domain deserializer.
 */
function deserializeColumns(row: {
  industry?: string | null;
  useCase?: string | null;
  status?: string | null;
  objects: unknown;
  links: unknown;
  integrations: unknown;
  aiRequirements: unknown;
}) {
  return deserializeProjectState({
    industry: row.industry ?? '',
    useCase: row.useCase ?? '',
    status: row.status ?? 'scouting',
    objects: row.objects,
    links: row.links,
    integrations: row.integrations,
    aiRequirements: row.aiRequirements,
  });
}

/**
 * Serialize validated domain arrays back to Prisma InputJsonValue columns.
 * Accepts partial input for update operations.
 */
function serializeColumns(input: {
  objects?: unknown[];
  links?: unknown[];
  integrations?: unknown[];
  aiRequirements?: unknown[];
}): Record<string, Prisma.InputJsonValue> {
  const cols: Record<string, Prisma.InputJsonValue> = {};
  if (input.objects !== undefined) cols.objects = input.objects as Prisma.InputJsonValue;
  if (input.links !== undefined) cols.links = input.links as Prisma.InputJsonValue;
  if (input.integrations !== undefined) cols.integrations = input.integrations as Prisma.InputJsonValue;
  if (input.aiRequirements !== undefined) cols.aiRequirements = input.aiRequirements as Prisma.InputJsonValue;
  return cols;
}

export class ProjectsService {
  /**
   * List all projects for a user
   */
  async listProjects(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        name: true,
        industry: true,
        useCase: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
    });
  }

  /**
   * Get a single project with full data.
   * JSONB columns are validated through the domain deserializer.
   */
  async getProject(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Validate/migrate JSONB columns through the domain serializer
    const state = deserializeColumns(project);
    const serialized = serializeProjectState(state);
    const stateObj = serialized as Record<string, unknown>;

    return {
      ...project,
      objects: stateObj['objects'],
      links: stateObj['links'],
      integrations: stateObj['integrations'],
      aiRequirements: stateObj['aiRequirements'],
    };
  }

  /**
   * Create a new project.
   * Incoming JSONB arrays are validated through the domain deserializer.
   */
  async createProject(userId: string, input: CreateProjectInput) {
    // Validate incoming data through the domain layer
    const state = deserializeProjectState({
      industry: input.industry ?? '',
      useCase: input.useCase ?? '',
      status: input.status,
      objects: input.objects ?? [],
      links: input.links ?? [],
      integrations: input.integrations ?? [],
      aiRequirements: input.aiRequirements ?? [],
    });

    return prisma.project.create({
      data: {
        userId,
        name: input.name,
        industry: input.industry,
        useCase: input.useCase,
        status: input.status,
        ...serializeColumns(state),
      },
    });
  }

  /**
   * Update a project.
   * Only JSONB fields that are present in the input are validated.
   */
  async updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ) {
    // Verify ownership
    const project = await this.getProject(projectId, userId);

    // Validate any JSONB arrays present in the update
    const jsonbUpdate = serializeColumns({
      objects: input.objects,
      links: input.links,
      integrations: input.integrations,
      aiRequirements: input.aiRequirements,
    });

    return prisma.project.update({
      where: { id: project.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.useCase !== undefined && { useCase: input.useCase }),
        ...(input.status !== undefined && { status: input.status }),
        ...jsonbUpdate,
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

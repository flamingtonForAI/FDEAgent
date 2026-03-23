/**
 * Project Service
 * Handles project CRUD operations and chat messages
 */

import { apiClient } from './apiClient';
import type { ProjectState, ChatMessage } from '../types';

export interface ProjectSummary {
  id: string;
  name: string;
  industry?: string;
  useCase?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project extends ProjectSummary {
  userId?: string;
  version?: number;
  objects: ProjectState['objects'];
  links: ProjectState['links'];
  integrations: ProjectState['integrations'];
  aiRequirements: ProjectState['aiRequirements'];
}

export interface PaginatedMessages {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    metadata?: unknown;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLog {
  id: string;
  changeType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  parentId?: string;
  parentName?: string;
  beforeState?: unknown;
  afterState?: unknown;
  description: string;
  source: string;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ProjectService {
  /**
   * List all projects
   */
  async listProjects(): Promise<ProjectSummary[]> {
    return apiClient.get<ProjectSummary[]>('/projects');
  }

  /**
   * Get a single project
   */
  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  }

  /**
   * Create a new project
   */
  async createProject(data: {
    name: string;
    industry?: string;
    useCase?: string;
    status?: string;
    objects?: ProjectState['objects'];
    links?: ProjectState['links'];
    integrations?: ProjectState['integrations'];
    aiRequirements?: ProjectState['aiRequirements'];
  }): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  }

  /**
   * Update a project
   */
  async updateProject(
    id: string,
    data: Partial<{
      name: string;
      industry: string;
      useCase: string;
      status: string;
      objects: ProjectState['objects'];
      links: ProjectState['links'];
      integrations: ProjectState['integrations'];
      aiRequirements: ProjectState['aiRequirements'];
    }>
  ): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, data);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
  }

  /**
   * Get chat messages for a project
   */
  async getChatMessages(
    projectId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedMessages> {
    return apiClient.get<PaginatedMessages>(
      `/projects/${projectId}/chat?page=${page}&limit=${limit}`
    );
  }

  /**
   * Add a chat message to a project
   */
  async addChatMessage(
    projectId: string,
    message: { role: 'user' | 'assistant' | 'system'; content: string; metadata?: unknown }
  ): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(`/projects/${projectId}/chat`, message);
  }

  /**
   * Add multiple chat messages (batch)
   */
  async addChatMessages(
    projectId: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; metadata?: unknown }>
  ): Promise<{ count: number }> {
    return apiClient.post<{ count: number }>(
      `/projects/${projectId}/chat/batch`,
      messages
    );
  }

  /**
   * Get audit logs for a project
   */
  async getAuditLogs(
    projectId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedAuditLogs> {
    return apiClient.get<PaginatedAuditLogs>(
      `/projects/${projectId}/audit?page=${page}&limit=${limit}`
    );
  }

  // ─── Version History ─────────────────────────────────────────

  /**
   * List versions for a project
   */
  async listVersions(
    projectId: string,
    limit = 50,
  ): Promise<Array<{
    id: string;
    version: number;
    changeSummary: string | null;
    createdBy: string | null;
    createdAt: string;
  }>> {
    return apiClient.get(`/projects/${projectId}/versions?limit=${limit}`);
  }

  /**
   * Get a specific version snapshot
   */
  async getVersion(
    projectId: string,
    version: number,
  ): Promise<{
    id: string;
    version: number;
    snapshot: unknown;
    changeSummary: string | null;
    createdAt: string;
  }> {
    return apiClient.get(`/projects/${projectId}/versions/${version}`);
  }

  /**
   * Compute diff between two versions
   */
  async diffVersions(
    projectId: string,
    v1: number,
    v2: number,
  ): Promise<{
    before: number;
    after: number;
    objects: Array<{ type: string; id: string; name: string; details?: string }>;
    links: Array<{ type: string; id: string; name: string; details?: string }>;
    actions: Array<{ type: string; id: string; name: string; details?: string }>;
    summary: string;
  }> {
    return apiClient.get(`/projects/${projectId}/versions/${v1}/diff/${v2}`);
  }

  /**
   * Restore a version
   */
  async restoreVersion(
    projectId: string,
    version: number,
  ): Promise<{ restored: boolean; fromVersion: number }> {
    return apiClient.post(`/projects/${projectId}/versions/${version}/restore`);
  }

  // ─── Members ────────────────────────────────────────────────

  /**
   * List project members
   */
  async listMembers(projectId: string): Promise<{
    owner: { id: string; email: string; role: string } | null;
    members: Array<{
      userId: string;
      email: string;
      role: string;
      invitedBy?: string;
      createdAt: string;
    }>;
  }> {
    return apiClient.get(`/projects/${projectId}/members`);
  }

  /**
   * Add a member
   */
  async addMember(
    projectId: string,
    data: { email: string; role?: string },
  ): Promise<{ userId: string; email: string; role: string }> {
    return apiClient.post(`/projects/${projectId}/members`, data);
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    role: string,
  ): Promise<{ userId: string; role: string }> {
    return apiClient.put(`/projects/${projectId}/members/${userId}`, { role });
  }

  /**
   * Remove a member
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/members/${userId}`);
  }
}

export const projectService = new ProjectService();

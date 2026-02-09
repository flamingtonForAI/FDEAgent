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
    message: { role: 'user' | 'assistant'; content: string; metadata?: unknown }
  ): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(`/projects/${projectId}/chat`, message);
  }

  /**
   * Add multiple chat messages (batch)
   */
  async addChatMessages(
    projectId: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; metadata?: unknown }>
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
}

export const projectService = new ProjectService();

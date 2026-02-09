/**
 * Sync Service
 * Handles offline-first synchronization with cloud storage
 */

import { apiClient } from './apiClient';
import type { ProjectState, ChatMessage } from '../types';

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  results: {
    projects?: {
      created: string[];
      updated: string[];
      failed: string[];
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

export interface FullSyncState {
  projects: Array<{
    id: string;
    name: string;
    industry?: string;
    useCase?: string;
    status: string;
    objects: ProjectState['objects'];
    links: ProjectState['links'];
    integrations: ProjectState['integrations'];
    aiRequirements: ProjectState['aiRequirements'];
    chatMessages: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: unknown;
      createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  preferences: {
    themeId: string;
    language: 'en' | 'cn';
    aiProvider?: string;
    aiModel?: string;
    customBaseUrl?: string;
    sidebarCollapsed: boolean;
    defaultTab: string;
  } | null;
  archetypes: Array<{
    id: string;
    archetypeId: string;
    archetype: unknown;
    originType: 'reference' | 'ai-generated';
    originData?: unknown;
    createdAt: string;
    updatedAt: string;
  }>;
  syncedAt: string;
}

export interface BatchSyncInput {
  projects?: Array<{
    id?: string;
    name: string;
    industry?: string;
    useCase?: string;
    status?: string;
    objects?: ProjectState['objects'];
    links?: ProjectState['links'];
    integrations?: ProjectState['integrations'];
    aiRequirements?: ProjectState['aiRequirements'];
  }>;
  chatMessages?: Array<{
    projectId: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      metadata?: unknown;
    }>;
  }>;
  preferences?: {
    themeId?: string;
    language?: 'en' | 'cn';
    aiProvider?: string | null;
    aiModel?: string | null;
    customBaseUrl?: string | null;
    sidebarCollapsed?: boolean;
    defaultTab?: string;
  };
  archetypes?: Array<{
    archetypeId: string;
    archetype: unknown;
    originType: 'reference' | 'ai-generated';
    originData?: unknown;
  }>;
}

class SyncService {
  private syncQueue: BatchSyncInput | null = null;
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly SYNC_DEBOUNCE_MS = 2000;

  /**
   * Get full sync state from server (initial load)
   */
  async getFullState(): Promise<FullSyncState> {
    return apiClient.get<FullSyncState>('/sync/full');
  }

  /**
   * Batch sync data to server
   */
  async batchSync(input: BatchSyncInput): Promise<SyncResult> {
    return apiClient.post<SyncResult>('/sync', input);
  }

  /**
   * Queue data for sync (debounced)
   */
  queueSync(data: BatchSyncInput): void {
    // Merge with existing queue
    if (this.syncQueue) {
      this.mergeSyncData(data);
    } else {
      this.syncQueue = data;
    }

    // Clear existing timeout
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    // Set new timeout
    this.syncTimeout = setTimeout(() => {
      this.flushSyncQueue();
    }, this.SYNC_DEBOUNCE_MS);
  }

  /**
   * Merge new data into existing queue
   */
  private mergeSyncData(data: BatchSyncInput): void {
    if (!this.syncQueue) return;

    // Merge projects (replace by id or name)
    if (data.projects) {
      if (!this.syncQueue.projects) {
        this.syncQueue.projects = [];
      }
      for (const project of data.projects) {
        const existingIndex = this.syncQueue.projects.findIndex(
          (p) => (project.id && p.id === project.id) || p.name === project.name
        );
        if (existingIndex >= 0) {
          this.syncQueue.projects[existingIndex] = project;
        } else {
          this.syncQueue.projects.push(project);
        }
      }
    }

    // Merge chat messages (append to project)
    if (data.chatMessages) {
      if (!this.syncQueue.chatMessages) {
        this.syncQueue.chatMessages = [];
      }
      for (const batch of data.chatMessages) {
        const existingBatch = this.syncQueue.chatMessages.find(
          (b) => b.projectId === batch.projectId
        );
        if (existingBatch) {
          existingBatch.messages.push(...batch.messages);
        } else {
          this.syncQueue.chatMessages.push(batch);
        }
      }
    }

    // Merge preferences (replace)
    if (data.preferences) {
      this.syncQueue.preferences = {
        ...this.syncQueue.preferences,
        ...data.preferences,
      };
    }

    // Merge archetypes (replace by archetypeId)
    if (data.archetypes) {
      if (!this.syncQueue.archetypes) {
        this.syncQueue.archetypes = [];
      }
      for (const archetype of data.archetypes) {
        const existingIndex = this.syncQueue.archetypes.findIndex(
          (a) => a.archetypeId === archetype.archetypeId
        );
        if (existingIndex >= 0) {
          this.syncQueue.archetypes[existingIndex] = archetype;
        } else {
          this.syncQueue.archetypes.push(archetype);
        }
      }
    }
  }

  /**
   * Flush the sync queue to server
   */
  async flushSyncQueue(): Promise<SyncResult | null> {
    if (!this.syncQueue) return null;

    const dataToSync = this.syncQueue;
    this.syncQueue = null;
    this.syncTimeout = null;

    try {
      return await this.batchSync(dataToSync);
    } catch (error) {
      // Re-queue on failure (will retry after debounce)
      console.error('Sync failed, re-queuing:', error);
      this.queueSync(dataToSync);
      return null;
    }
  }

  /**
   * Force immediate sync (e.g., before logout)
   */
  async forceSync(): Promise<SyncResult | null> {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    return this.flushSyncQueue();
  }

  /**
   * Check if there's pending sync data
   */
  hasPendingSync(): boolean {
    return this.syncQueue !== null;
  }
}

export const syncService = new SyncService();

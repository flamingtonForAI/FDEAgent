/**
 * Storage Facade — Unified interface for all storage operations.
 *
 * All components should import `storage` from this module instead of
 * directly from `./storage`. This decouples consumers from the
 * HybridStorage implementation, enabling future refactoring
 * (Phase 2.2: local-store / user-scope / migration / sync-orchestrator).
 *
 * The interface below captures every public method used by the app.
 * The implementation is still HybridStorage — this layer adds no
 * runtime overhead, only a type contract.
 */

import type { ProjectState, ChatMessage, Project, ProjectListItem } from '../types';

export type AuthCheckFn = () => boolean;

export interface IStorageFacade {
  // ─── Auth & lifecycle ───────────────────────────────────────
  setAuthCheck(fn: AuthCheckFn): void;
  migrateToUserScoped(): void;
  migrateLocalToCloud(): Promise<string | null>;
  needsMigration(): boolean;
  migrateOldData(): string | null;
  cleanupLegacyData(): void;
  clearAll(): void;

  // ─── Active project ─────────────────────────────────────────
  getActiveProjectId(): string | null;
  setActiveProjectId(projectId: string | null): void;

  // ─── Project CRUD ───────────────────────────────────────────
  listProjectsLocal(): ProjectListItem[];
  createProject(params: {
    name: string;
    industry: string;
    useCase: string;
    description?: string;
    baseArchetypeId?: string;
    baseArchetypeName?: string;
    initialState?: ProjectState;
  }): Project;
  getProjectById(projectId: string): ProjectListItem | null;
  updateProject(projectId: string, updates: Partial<Pick<ProjectListItem, 'name' | 'description' | 'industry' | 'status' | 'tags'>>): void;
  deleteProject(projectId: string): void;

  // ─── Per-project data ───────────────────────────────────────
  getProjectStateById(projectId: string): ProjectState | null;
  saveProjectStateById(projectId: string, state: ProjectState): void;
  getChatMessagesById(projectId: string): ChatMessage[];
  saveChatMessagesById(projectId: string, messages: ChatMessage[]): void;
  getAnalysisResultById(projectId: string): unknown | null;
  saveAnalysisResultById(projectId: string, analysis: unknown): void;

  // ─── Cloud sync ID mapping ──────────────────────────────────
  getCloudProjectId(): string | null;
  setCloudProjectId(id: string | null): void;
  getCloudProjectIdByLocalId(localProjectId: string): string | null;
  setCloudProjectIdByLocalId(localProjectId: string, cloudProjectId: string | null): void;
}

// Import the concrete implementation and re-export it typed as IStorageFacade.
// Consumers only see interface methods, not HybridStorage implementation details.
// Phase 2.2 can swap the implementation without touching any consumer code.
import { storage as _rawStorage, STORAGE_KEYS } from './storage';
export const storage: IStorageFacade = _rawStorage;
export { STORAGE_KEYS };

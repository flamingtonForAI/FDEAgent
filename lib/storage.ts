/**
 * Hybrid Storage — Offline-first storage with cloud sync.
 *
 * This file is the facade/composer that delegates to sub-modules:
 * - storage/user-scope.ts   — user-scoped key management
 * - storage/local-store.ts  — pure localStorage R/W
 * - storage/migration.ts    — legacy data migration
 * - storage/sync-orchestrator.ts — cloud sync queue & scheduling
 *
 * The public API is unchanged — all consumers import via storageFacade.ts.
 */

import type { ProjectState, ChatMessage, Project, ProjectListItem } from '../types';

// Sub-modules
import * as localStore from './storage/local-store';
import * as migration from './storage/migration';
import * as sync from './storage/sync-orchestrator';

export type AuthCheckFn = () => boolean;

class HybridStorage {
  private migrationDoneForUserId: string | null = null;

  // ── Auth & lifecycle ─────────────────────────────────────

  setAuthCheck(fn: AuthCheckFn): void {
    sync.setAuthCheck(fn);
  }

  migrateToUserScoped(): void {
    const result = migration.migrateToUserScoped(this.migrationDoneForUserId);
    if (result) this.migrationDoneForUserId = result;
  }

  // ── Cloud sync delegates ─────────────────────────────────

  async saveProjectState(state: ProjectState, options?: { skipCloud?: boolean }): Promise<void> {
    return sync.saveProjectStateWithSync(state, options);
  }

  async loadProjectState(options?: { isAuthenticated: boolean; forceCloud?: boolean }): Promise<ProjectState | null> {
    this.migrateToUserScoped();
    return sync.loadProjectStateWithSync(options);
  }

  async saveChatMessages(messages: ChatMessage[], options?: { skipCloud?: boolean }): Promise<void> {
    return sync.saveChatMessagesWithSync(messages, options);
  }

  async loadChatMessages(): Promise<ChatMessage[]> {
    this.migrateToUserScoped();
    return sync.loadChatMessagesFromLocal();
  }

  async savePreferences(prefs: {
    themeId?: string;
    language?: 'en' | 'cn';
    aiProvider?: string;
    aiModel?: string;
    customBaseUrl?: string;
    sidebarCollapsed?: boolean;
    defaultTab?: string;
  }): Promise<void> {
    return sync.savePreferencesWithSync(prefs);
  }

  async fullSync() {
    return sync.fullSync();
  }

  async migrateLocalToCloud(): Promise<string | null> {
    return sync.migrateLocalToCloud();
  }

  // ── Active project ───────────────────────────────────────

  getActiveProjectId(): string | null {
    this.migrateToUserScoped();
    return localStore.readActiveProjectId();
  }

  setActiveProjectId(projectId: string | null): void {
    localStore.writeActiveProjectId(projectId);
  }

  // ── Project CRUD ─────────────────────────────────────────

  listProjectsLocal(): ProjectListItem[] {
    this.migrateToUserScoped();
    return localStore.readProjectsIndex();
  }

  createProject(params: {
    name: string;
    industry: string;
    useCase: string;
    description?: string;
    baseArchetypeId?: string;
    baseArchetypeName?: string;
    initialState?: ProjectState;
  }): Project {
    const now = new Date().toISOString();
    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const project: Project = {
      id: projectId,
      name: params.name,
      description: params.description,
      industry: params.industry,
      useCase: params.useCase,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      version: 1,
      baseArchetypeId: params.baseArchetypeId,
      baseArchetypeName: params.baseArchetypeName,
    };

    const initialState: ProjectState = params.initialState || {
      projectName: params.name,
      industry: params.industry,
      useCase: params.useCase,
      objects: [],
      links: [],
      integrations: [],
      aiRequirements: [],
      status: 'scouting',
    };

    const progress = calculateProgress(initialState);

    const listItem: ProjectListItem = {
      id: projectId,
      name: params.name,
      description: params.description,
      industry: params.industry,
      status: 'draft',
      baseArchetypeName: params.baseArchetypeName,
      createdAt: now,
      updatedAt: now,
      version: 1,
      progress,
    };

    const projects = this.listProjectsLocal();
    projects.unshift(listItem);
    localStore.writeProjectsIndex(projects);

    this.saveProjectStateById(projectId, initialState);
    this.saveChatMessagesById(projectId, []);
    this.setActiveProjectId(projectId);

    return project;
  }

  getProjectById(projectId: string): ProjectListItem | null {
    const projects = this.listProjectsLocal();
    return projects.find(p => p.id === projectId) || null;
  }

  updateProject(projectId: string, updates: Partial<Pick<ProjectListItem, 'name' | 'description' | 'industry' | 'status' | 'tags'>>): void {
    const now = new Date().toISOString();
    this.updateProjectInIndex(projectId, { ...updates, updatedAt: now });

    if (updates.name) {
      const state = this.getProjectStateById(projectId);
      if (state) {
        state.projectName = updates.name;
        this.saveProjectStateById(projectId, state);
      }
    }
  }

  deleteProject(projectId: string): void {
    const projects = this.listProjectsLocal();
    const filtered = projects.filter(p => p.id !== projectId);
    localStore.writeProjectsIndex(filtered);

    localStore.removeProjectState(projectId);
    localStore.removeChatMessages(projectId);
    localStore.removeAnalysisResult(projectId);
    this.setCloudProjectIdByLocalId(projectId, null);

    if (this.getActiveProjectId() === projectId) {
      this.setActiveProjectId(filtered.length > 0 ? filtered[0].id : null);
    }
  }

  // ── Per-project data ─────────────────────────────────────

  getProjectStateById(projectId: string): ProjectState | null {
    return localStore.readProjectState(projectId);
  }

  saveProjectStateById(projectId: string, state: ProjectState): void {
    localStore.writeProjectState(projectId, state);

    const normalizedState = localStore.readProjectState(projectId);
    if (normalizedState) {
      this.updateProjectInIndex(projectId, {
        updatedAt: new Date().toISOString(),
        progress: calculateProgress(normalizedState),
      });
    }
  }

  getChatMessagesById(projectId: string): ChatMessage[] {
    return localStore.readChatMessages(projectId);
  }

  saveChatMessagesById(projectId: string, messages: ChatMessage[]): void {
    localStore.writeChatMessages(projectId, messages);
  }

  getAnalysisResultById(projectId: string): unknown | null {
    return localStore.readAnalysisResult(projectId);
  }

  saveAnalysisResultById(projectId: string, analysis: unknown): void {
    localStore.writeAnalysisResult(projectId, analysis);
  }

  // ── Cloud ID mapping ─────────────────────────────────────

  getCloudProjectId(): string | null {
    this.migrateToUserScoped();
    return localStore.readCloudProjectId();
  }

  setCloudProjectId(id: string | null): void {
    localStore.writeCloudProjectId(id);
  }

  getCloudProjectIdByLocalId(localProjectId: string): string | null {
    this.migrateToUserScoped();
    const map = localStore.readCloudProjectMap();
    return map[localProjectId] || null;
  }

  setCloudProjectIdByLocalId(localProjectId: string, cloudProjectId: string | null): void {
    this.migrateToUserScoped();
    const map = localStore.readCloudProjectMap();
    if (cloudProjectId) {
      map[localProjectId] = cloudProjectId;
    } else {
      delete map[localProjectId];
    }
    localStore.writeCloudProjectMap(map);
  }

  // ── Migration (v1 → v2) ──────────────────────────────────

  needsMigration(): boolean {
    return migration.needsV2Migration();
  }

  migrateOldData(): string | null {
    return migration.migrateOldData(
      (params) => this.createProject(params),
      (pid, msgs) => this.saveChatMessagesById(pid, msgs),
    );
  }

  cleanupLegacyData(): void {
    migration.cleanupLegacyData();
  }

  // ── Bulk clear ───────────────────────────────────────────

  clearAll(): void {
    localStore.clearAllForCurrentUser();
  }

  // ── Backward compatibility ───────────────────────────────

  async getCurrentProjectState(): Promise<{ projectId: string; state: ProjectState; chat: ChatMessage[] } | null> {
    let activeId = this.getActiveProjectId();
    if (!activeId && this.needsMigration()) {
      activeId = this.migrateOldData();
    }

    this.cleanupLegacyData();

    if (!activeId) return null;

    const state = this.getProjectStateById(activeId);
    const chat = this.getChatMessagesById(activeId);

    if (!state) return null;

    return { projectId: activeId, state, chat };
  }

  // ── Private helpers ──────────────────────────────────────

  private updateProjectInIndex(projectId: string, updates: Partial<ProjectListItem>): void {
    const projects = this.listProjectsLocal();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      localStore.writeProjectsIndex(projects);
    }
  }
}

// ── Progress calculation (shared) ────────────────────────────

function calculateProgress(state: ProjectState): ProjectListItem['progress'] {
  const objectCount = state.objects?.length || 0;
  const linkCount = state.links?.length || 0;
  const actionCount = state.objects?.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0) || 0;

  const objectScore = Math.min(objectCount / 3, 1) * 30;
  const linkScore = Math.min(linkCount / 2, 1) * 30;
  const actionScore = Math.min(actionCount / 3, 1) * 40;
  const completeness = Math.round(objectScore + linkScore + actionScore);

  return { objectCount, linkCount, actionCount, completeness };
}

// Export singleton instance
export const storage = new HybridStorage();
export { STORAGE_KEYS } from './storage/local-store';

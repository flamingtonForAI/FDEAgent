/**
 * Hybrid Storage - Offline-first storage with cloud sync
 *
 * Strategy:
 * 1. Always save to localStorage immediately (fast response)
 * 2. Queue cloud sync with debounce when authenticated
 * 3. On load: read local first, then merge with cloud if newer
 */

import { syncService, type BatchSyncInput, type FullSyncState } from '../services/syncService';
import { projectService, type Project as CloudProject } from '../services/projectService';
import type { ProjectState, ChatMessage, Project, ProjectListItem } from '../types';

// Storage keys
const STORAGE_KEYS = {
  // Legacy single-project keys (for migration)
  PROJECT_STATE: 'ontology-project-state',
  CHAT_MESSAGES: 'ontology-chat-messages',
  CLOUD_PROJECT_ID: 'ontology-cloud-project-id',

  // Multi-project keys
  PROJECTS_INDEX: 'ontology-projects-index',      // ProjectListItem[]
  ACTIVE_PROJECT_ID: 'ontology-active-project',   // 当前活跃项目ID
  PROJECT_PREFIX: 'ontology-project-',            // 项目数据前缀

  // Other settings
  LAST_TAB: 'ontology-last-tab',
  AI_SETTINGS: 'ai-settings',
  THEME: 'ontology-theme',
  ARCHETYPES: 'ontology-imported-archetypes',
  LAST_SYNC: 'ontology-last-sync',
  MIGRATION_DONE: 'ontology-migration-v2-done',   // 迁移标记
} as const;

// Generate per-project storage keys
const getProjectStateKey = (projectId: string) => `${STORAGE_KEYS.PROJECT_PREFIX}${projectId}-state`;
const getProjectChatKey = (projectId: string) => `${STORAGE_KEYS.PROJECT_PREFIX}${projectId}-chat`;

// Maximum chat messages to store locally
const MAX_LOCAL_MESSAGES = 200;
const MAX_MESSAGE_LENGTH = 4000;

interface LocalProjectData {
  state: ProjectState;
  updatedAt: string;
  cloudProjectId?: string;
}

interface LocalChatData {
  messages: ChatMessage[];
  updatedAt: string;
}

interface SyncOptions {
  isAuthenticated: boolean;
  forceCloud?: boolean;
}

type AuthCheckFn = () => boolean;

class HybridStorage {
  private authCheck: AuthCheckFn = () => false;
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly SYNC_DEBOUNCE_MS = 2000;

  /**
   * Set the authentication check function
   */
  setAuthCheck(fn: AuthCheckFn): void {
    this.authCheck = fn;
  }

  /**
   * Check if authenticated
   */
  private isAuthenticated(): boolean {
    return this.authCheck();
  }

  // ============================================
  // PROJECT STATE
  // ============================================

  /**
   * Save project state (local + cloud)
   */
  async saveProjectState(
    state: ProjectState,
    options?: { skipCloud?: boolean }
  ): Promise<void> {
    const now = new Date().toISOString();
    const cloudProjectId = localStorage.getItem(STORAGE_KEYS.CLOUD_PROJECT_ID);

    // 1. Save to localStorage immediately
    const localData: LocalProjectData = {
      state,
      updatedAt: now,
      cloudProjectId: cloudProjectId || undefined,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.PROJECT_STATE, JSON.stringify(localData));
    } catch (error) {
      // Handle QuotaExceededError or other localStorage errors
      console.error('Failed to save to localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to clear old data and retry
        this.clearOldLocalData();
        try {
          localStorage.setItem(STORAGE_KEYS.PROJECT_STATE, JSON.stringify(localData));
        } catch {
          console.error('localStorage quota exceeded even after cleanup');
        }
      }
    }

    // 2. Queue cloud sync if authenticated
    if (!options?.skipCloud && this.isAuthenticated()) {
      this.queueCloudSync({
        projects: [
          {
            id: cloudProjectId || undefined,
            name: state.projectName || 'Untitled Project',
            industry: state.industry,
            useCase: state.useCase,
            status: state.status,
            objects: state.objects,
            links: state.links,
            integrations: state.integrations,
            aiRequirements: state.aiRequirements,
          },
        ],
      });
    }
  }

  /**
   * Load project state (local first, then cloud if newer)
   */
  async loadProjectState(options?: SyncOptions): Promise<ProjectState | null> {
    // 1. Load from localStorage
    const localData = this.getLocalProjectData();

    // 2. If authenticated, check cloud for newer data
    if (options?.isAuthenticated || this.isAuthenticated()) {
      try {
        const cloudData = await this.fetchCloudProjectState(
          localData?.cloudProjectId
        );
        if (cloudData) {
          const cloudUpdatedAt = new Date(cloudData.updatedAt);
          const localUpdatedAt = localData?.updatedAt
            ? new Date(localData.updatedAt)
            : new Date(0);

          // Use cloud data if newer
          if (cloudUpdatedAt > localUpdatedAt) {
            // Update local with cloud data
            const mergedState = this.cloudProjectToState(cloudData);
            await this.saveProjectState(mergedState, { skipCloud: true });
            return mergedState;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch cloud project state:', error);
      }
    }

    return localData?.state || null;
  }

  /**
   * Get local project data with runtime validation
   */
  private getLocalProjectData(): LocalProjectData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Runtime type validation
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.state ||
        typeof parsed.state !== 'object' ||
        !parsed.updatedAt ||
        typeof parsed.updatedAt !== 'string'
      ) {
        console.warn('Invalid local project data structure, clearing...');
        localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
        return null;
      }

      // Validate required ProjectState fields exist
      const state = parsed.state;
      if (!Array.isArray(state.objects) || !Array.isArray(state.links)) {
        console.warn('Invalid ProjectState structure, clearing...');
        localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
        return null;
      }

      return parsed as LocalProjectData;
    } catch {
      // Invalid data - clear corrupt entry
      localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
      return null;
    }
  }

  /**
   * Fetch project state from cloud
   */
  private async fetchCloudProjectState(
    projectId?: string
  ): Promise<Project | null> {
    if (!projectId) {
      // Try to get the most recent project
      const projects = await projectService.listProjects();
      if (projects.length > 0) {
        const fullProject = await projectService.getProject(projects[0].id);
        // Store the cloud project ID for future syncs
        localStorage.setItem(STORAGE_KEYS.CLOUD_PROJECT_ID, fullProject.id);
        return fullProject;
      }
      return null;
    }

    try {
      return await projectService.getProject(projectId);
    } catch {
      return null;
    }
  }

  /**
   * Convert cloud project to local state
   */
  private cloudProjectToState(project: Project): ProjectState {
    return {
      projectName: project.name,
      industry: project.industry || '',
      useCase: project.useCase || '',
      status: (project.status as ProjectState['status']) || 'scouting',
      objects: project.objects || [],
      links: project.links || [],
      integrations: project.integrations || [],
      aiRequirements: project.aiRequirements || [],
    };
  }

  // ============================================
  // CHAT MESSAGES
  // ============================================

  /**
   * Save chat messages
   */
  async saveChatMessages(
    messages: ChatMessage[],
    options?: { skipCloud?: boolean }
  ): Promise<void> {
    const now = new Date().toISOString();

    // Truncate messages for local storage
    const truncatedMessages = messages.slice(-MAX_LOCAL_MESSAGES).map((msg) => ({
      ...msg,
      content:
        msg.content.length > MAX_MESSAGE_LENGTH
          ? msg.content.slice(0, MAX_MESSAGE_LENGTH) + '...'
          : msg.content,
    }));

    // 1. Save to localStorage
    const localData: LocalChatData = {
      messages: truncatedMessages,
      updatedAt: now,
    };
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(localData));

    // 2. Queue cloud sync if authenticated
    if (!options?.skipCloud && this.isAuthenticated()) {
      const cloudProjectId = localStorage.getItem(STORAGE_KEYS.CLOUD_PROJECT_ID);
      if (cloudProjectId) {
        // Only sync the most recent messages that haven't been synced
        const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        const lastSyncTime = lastSync ? new Date(lastSync) : new Date(0);

        // For simplicity, we sync all messages (in production, track which are synced)
        this.queueCloudSync({
          chatMessages: [
            {
              projectId: cloudProjectId,
              messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            },
          ],
        });
      }
    }
  }

  /**
   * Load chat messages
   */
  async loadChatMessages(): Promise<ChatMessage[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (stored) {
        const data: LocalChatData = JSON.parse(stored);
        return data.messages;
      }
    } catch {
      // Invalid data
    }
    return [];
  }

  // ============================================
  // PREFERENCES
  // ============================================

  /**
   * Save preferences
   */
  async savePreferences(prefs: {
    themeId?: string;
    language?: 'en' | 'cn';
    aiProvider?: string;
    aiModel?: string;
    customBaseUrl?: string;
    sidebarCollapsed?: boolean;
    defaultTab?: string;
  }): Promise<void> {
    // Save individual preferences locally
    if (prefs.themeId) {
      localStorage.setItem(STORAGE_KEYS.THEME, prefs.themeId);
    }

    // Queue cloud sync (excluding API key)
    if (this.isAuthenticated()) {
      this.queueCloudSync({
        preferences: {
          themeId: prefs.themeId,
          language: prefs.language,
          aiProvider: prefs.aiProvider || null,
          aiModel: prefs.aiModel || null,
          customBaseUrl: prefs.customBaseUrl || null,
          sidebarCollapsed: prefs.sidebarCollapsed,
          defaultTab: prefs.defaultTab,
        },
      });
    }
  }

  // ============================================
  // CLOUD SYNC
  // ============================================

  /**
   * Queue data for cloud sync (debounced)
   */
  private queueCloudSync(data: BatchSyncInput): void {
    if (!this.isAuthenticated()) return;

    // Clear existing timer
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    // Queue the sync
    syncService.queueSync(data);

    // Set new timer to mark sync complete
    this.syncDebounceTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }, this.SYNC_DEBOUNCE_MS + 1000);
  }

  /**
   * Perform full sync with cloud
   */
  async fullSync(): Promise<FullSyncState | null> {
    if (!this.isAuthenticated()) return null;

    try {
      const cloudState = await syncService.getFullState();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return cloudState;
    } catch (error) {
      console.error('Full sync failed:', error);
      return null;
    }
  }

  /**
   * Migrate local data to cloud on first login
   */
  async migrateLocalToCloud(): Promise<string | null> {
    if (!this.isAuthenticated()) return null;

    const localProject = this.getLocalProjectData();
    if (!localProject) return null;

    // Check if we already have a cloud project ID
    if (localProject.cloudProjectId) {
      return localProject.cloudProjectId;
    }

    try {
      // Create new cloud project from local data
      const newProject = await projectService.createProject({
        name: localProject.state.projectName || 'Imported Project',
        industry: localProject.state.industry,
        useCase: localProject.state.useCase,
        status: localProject.state.status,
        objects: localProject.state.objects,
        links: localProject.state.links,
        integrations: localProject.state.integrations,
        aiRequirements: localProject.state.aiRequirements,
      });

      // Update local storage with cloud project ID
      localStorage.setItem(STORAGE_KEYS.CLOUD_PROJECT_ID, newProject.id);
      localProject.cloudProjectId = newProject.id;
      localStorage.setItem(
        STORAGE_KEYS.PROJECT_STATE,
        JSON.stringify(localProject)
      );

      // Migrate chat messages
      const localMessages = await this.loadChatMessages();
      if (localMessages.length > 0) {
        await projectService.addChatMessages(
          newProject.id,
          localMessages.map((m) => ({
            role: m.role,
            content: m.content,
          }))
        );
      }

      return newProject.id;
    } catch (error) {
      console.error('Failed to migrate local data to cloud:', error);
      return null;
    }
  }

  /**
   * Clear old/stale local data to free up storage space
   * Called when QuotaExceededError is encountered
   */
  private clearOldLocalData(): void {
    try {
      // Remove chat messages first (usually the largest)
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
      // Remove old sync timestamp
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
      console.info('Cleared old local data to free storage space');
    } catch (error) {
      console.error('Failed to clear old local data:', error);
    }
  }

  /**
   * Clear all local storage
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get current cloud project ID
   */
  getCloudProjectId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CLOUD_PROJECT_ID);
  }

  /**
   * Set cloud project ID
   */
  setCloudProjectId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CLOUD_PROJECT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLOUD_PROJECT_ID);
    }
  }

  // ============================================
  // MULTI-PROJECT MANAGEMENT
  // ============================================

  /**
   * Generate a unique project ID
   */
  private generateProjectId(): string {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the active project ID
   */
  getActiveProjectId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  }

  /**
   * Set the active project ID
   */
  setActiveProjectId(projectId: string | null): void {
    if (projectId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, projectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    }
  }

  /**
   * List all local projects
   */
  listProjectsLocal(): ProjectListItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS_INDEX);
      if (!stored) return [];
      const projects = JSON.parse(stored);
      if (!Array.isArray(projects)) return [];
      return projects;
    } catch {
      return [];
    }
  }

  /**
   * Save the projects index
   */
  private saveProjectsIndex(projects: ProjectListItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS_INDEX, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects index:', error);
    }
  }

  /**
   * Create a new project
   */
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
    const projectId = this.generateProjectId();

    // Create project metadata
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

    // Create initial ontology state
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

    // Calculate progress
    const progress = this.calculateProgress(initialState);

    // Create project list item
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

    // Save to localStorage
    const projects = this.listProjectsLocal();
    projects.unshift(listItem); // Add to beginning
    this.saveProjectsIndex(projects);

    // Save project state
    this.saveProjectStateById(projectId, initialState);

    // Save empty chat history
    this.saveChatMessagesById(projectId, []);

    // Set as active project
    this.setActiveProjectId(projectId);

    return project;
  }

  /**
   * Calculate project progress
   */
  private calculateProgress(state: ProjectState): ProjectListItem['progress'] {
    const objectCount = state.objects?.length || 0;
    const linkCount = state.links?.length || 0;
    const actionCount = state.objects?.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0) || 0;

    // Calculate completeness (0-100)
    // Simple heuristic: need at least 3 objects, 2 links, and 3 actions for 100%
    const objectScore = Math.min(objectCount / 3, 1) * 30;
    const linkScore = Math.min(linkCount / 2, 1) * 30;
    const actionScore = Math.min(actionCount / 3, 1) * 40;
    const completeness = Math.round(objectScore + linkScore + actionScore);

    return {
      objectCount,
      linkCount,
      actionCount,
      completeness,
    };
  }

  /**
   * Get project state by ID
   */
  getProjectStateById(projectId: string): ProjectState | null {
    try {
      const key = getProjectStateKey(projectId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      // Handle both old format (direct state) and new format (wrapped with updatedAt)
      if (data.state) {
        return data.state;
      }
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Save project state by ID
   */
  saveProjectStateById(projectId: string, state: ProjectState): void {
    const now = new Date().toISOString();
    const key = getProjectStateKey(projectId);

    try {
      localStorage.setItem(key, JSON.stringify({
        state,
        updatedAt: now,
      }));

      // Update projects index
      this.updateProjectInIndex(projectId, {
        updatedAt: now,
        progress: this.calculateProgress(state),
      });
    } catch (error) {
      console.error('Failed to save project state:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldLocalData();
        try {
          localStorage.setItem(key, JSON.stringify({ state, updatedAt: now }));
        } catch {
          console.error('localStorage quota exceeded even after cleanup');
        }
      }
    }
  }

  /**
   * Get chat messages by project ID
   */
  getChatMessagesById(projectId: string): ChatMessage[] {
    try {
      const key = getProjectChatKey(projectId);
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const data = JSON.parse(stored);
      // Handle both formats
      if (data.messages) {
        return data.messages;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Save chat messages by project ID
   */
  saveChatMessagesById(projectId: string, messages: ChatMessage[]): void {
    const now = new Date().toISOString();
    const key = getProjectChatKey(projectId);

    // Truncate messages
    const truncatedMessages = messages.slice(-MAX_LOCAL_MESSAGES).map((msg) => ({
      ...msg,
      content:
        msg.content.length > MAX_MESSAGE_LENGTH
          ? msg.content.slice(0, MAX_MESSAGE_LENGTH) + '...'
          : msg.content,
    }));

    try {
      localStorage.setItem(key, JSON.stringify({
        messages: truncatedMessages,
        updatedAt: now,
      }));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }
  }

  /**
   * Update a project in the index
   */
  private updateProjectInIndex(projectId: string, updates: Partial<ProjectListItem>): void {
    const projects = this.listProjectsLocal();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      this.saveProjectsIndex(projects);
    }
  }

  /**
   * Delete a project
   */
  deleteProject(projectId: string): void {
    // Remove from index
    const projects = this.listProjectsLocal();
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveProjectsIndex(filtered);

    // Remove project data
    localStorage.removeItem(getProjectStateKey(projectId));
    localStorage.removeItem(getProjectChatKey(projectId));

    // If this was the active project, clear it
    if (this.getActiveProjectId() === projectId) {
      this.setActiveProjectId(filtered.length > 0 ? filtered[0].id : null);
    }
  }

  /**
   * Get project metadata by ID
   */
  getProjectById(projectId: string): ProjectListItem | null {
    const projects = this.listProjectsLocal();
    return projects.find(p => p.id === projectId) || null;
  }

  /**
   * Update project metadata
   */
  updateProject(projectId: string, updates: Partial<Pick<ProjectListItem, 'name' | 'description' | 'industry' | 'status' | 'tags'>>): void {
    const now = new Date().toISOString();
    this.updateProjectInIndex(projectId, {
      ...updates,
      updatedAt: now,
    });

    // Also update the state's projectName if name changed
    if (updates.name) {
      const state = this.getProjectStateById(projectId);
      if (state) {
        state.projectName = updates.name;
        this.saveProjectStateById(projectId, state);
      }
    }
  }

  // ============================================
  // DATA MIGRATION (v1 → v2)
  // ============================================

  /**
   * Check if migration is needed
   */
  needsMigration(): boolean {
    // Already migrated
    if (localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE)) {
      return false;
    }
    // Has old data to migrate
    const hasOldData = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE) ||
                       localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return !!hasOldData;
  }

  /**
   * Migrate old single-project data to multi-project format
   */
  migrateOldData(): string | null {
    if (!this.needsMigration()) {
      return this.getActiveProjectId();
    }

    console.info('Migrating old data to multi-project format...');

    try {
      // Get old project state
      const oldStateRaw = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
      const oldChatRaw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);

      let oldState: ProjectState | null = null;
      let oldChat: ChatMessage[] = [];

      if (oldStateRaw) {
        const parsed = JSON.parse(oldStateRaw);
        oldState = parsed.state || parsed;
      }

      if (oldChatRaw) {
        const parsed = JSON.parse(oldChatRaw);
        oldChat = parsed.messages || parsed || [];
      }

      if (!oldState && oldChat.length === 0) {
        // No data to migrate
        localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');
        return null;
      }

      // Create a migrated project
      const project = this.createProject({
        name: oldState?.projectName || '迁移项目',
        industry: oldState?.industry || '',
        useCase: oldState?.useCase || '',
        description: '从旧版本迁移的项目数据',
        initialState: oldState || undefined,
      });

      // Save chat messages
      if (oldChat.length > 0) {
        this.saveChatMessagesById(project.id, oldChat);
      }

      // Mark migration as done
      localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');

      // Keep old data for safety (can be cleaned up later)
      // localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
      // localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);

      console.info(`Migration complete. Created project: ${project.id}`);
      return project.id;
    } catch (error) {
      console.error('Migration failed:', error);
      localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true'); // Prevent retry loop
      return null;
    }
  }

  /**
   * Get current project state (for backward compatibility)
   * Uses active project or migrates old data
   */
  async getCurrentProjectState(): Promise<{ projectId: string; state: ProjectState; chat: ChatMessage[] } | null> {
    // Try migration first
    let activeId = this.getActiveProjectId();
    if (!activeId && this.needsMigration()) {
      activeId = this.migrateOldData();
    }

    if (!activeId) {
      return null;
    }

    const state = this.getProjectStateById(activeId);
    const chat = this.getChatMessagesById(activeId);

    if (!state) {
      return null;
    }

    return {
      projectId: activeId,
      state,
      chat,
    };
  }
}

// Export singleton instance
export const storage = new HybridStorage();
export { STORAGE_KEYS };

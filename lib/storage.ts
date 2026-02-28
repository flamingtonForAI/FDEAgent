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
import { normalizeProjectState } from './cardinality';

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

// Generate per-project storage keys (user-scoped)
const getProjectStateKey = (projectId: string) => getScopedKey(`project:${projectId}:state`);
const getProjectChatKey = (projectId: string) => getScopedKey(`project:${projectId}:chat`);
const getProjectAnalysisKey = (projectId: string) => getScopedKey(`project:${projectId}:analysis`);

// Maximum chat messages to store locally
const MAX_LOCAL_MESSAGES = 200;
const MAX_MESSAGE_LENGTH = 4000;

// Anonymous user session ID for non-authenticated users
const getAnonymousId = (): string => {
  let anonId = sessionStorage.getItem('ontology-anon-id');
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ontology-anon-id', anonId);
  }
  return anonId;
};

// Get current user ID from auth storage
const getCurrentUserId = (): string | null => {
  try {
    const authData = localStorage.getItem('ontology-auth-session');
    if (authData) {
      const parsed = JSON.parse(authData);
      const userId = parsed.user?.id || null;
      const email = String(parsed.user?.email || '').toLowerCase();
      // Keep demo account storage scope stable across backend/offline mode differences.
      if (email === 'demo@example.com') {
        return 'demo-user-001';
      }
      return userId;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

const getAuthSessionUser = (): { id: string | null; rawId: string | null; email: string | null } => {
  try {
    const authData = localStorage.getItem('ontology-auth-session');
    if (!authData) return { id: null, rawId: null, email: null };
    const parsed = JSON.parse(authData);
    return {
      id: parsed.user?.id || null,
      rawId: parsed.user?.rawId || null,
      email: parsed.user?.email ? String(parsed.user.email).toLowerCase() : null,
    };
  } catch {
    return { id: null, rawId: null, email: null };
  }
};

const getScopedKeyByUserId = (userId: string, key: string): string => `u:${userId}:${key}`;

// Generate user-scoped storage key
const getScopedKey = (key: string): string => {
  const userId = getCurrentUserId();
  if (userId) {
    return `u:${userId}:${key}`;
  }
  return `${getAnonymousId()}:${key}`;
};

// Legacy keys for migration
const LEGACY_KEYS = {
  PROJECTS_INDEX: 'ontology-projects-index',
  ACTIVE_PROJECT_ID: 'ontology-active-project',
  CHAT_MESSAGES: 'ontology-chat-messages',
  PROJECT_PREFIX: 'ontology-project-',
};

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
  private migrationDoneForUserId: string | null = null;

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

  /**
   * Migrate legacy data to user-scoped keys
   * SECURITY: Only migrates data when a user is logged in
   * Anonymous users get fresh data to prevent cross-user contamination
   */
  migrateToUserScoped(): void {
    const userId = getCurrentUserId();
    if (!userId) {
      // Anonymous sessions are isolated by session key and should not lock migration permanently.
      return;
    }

    if (this.migrationDoneForUserId === userId) return;
    const scopedIndexKey = getScopedKey('projects-index');

    // Demo rescue: backend may return varying IDs for demo@example.com.
    // If canonical demo scope is empty but raw backend scope has data, copy it once.
    const authUser = getAuthSessionUser();
    if (userId === 'demo-user-001' && authUser.email === 'demo@example.com' && authUser.rawId && authUser.rawId !== userId) {
      const demoIndex = localStorage.getItem(getScopedKeyByUserId(userId, 'projects-index'));
      const rawIndex = localStorage.getItem(getScopedKeyByUserId(authUser.rawId, 'projects-index'));
      if (!demoIndex && rawIndex) {
        localStorage.setItem(getScopedKeyByUserId(userId, 'projects-index'), rawIndex);
        const rawActive = localStorage.getItem(getScopedKeyByUserId(authUser.rawId, 'active-project'));
        if (rawActive) {
          localStorage.setItem(getScopedKeyByUserId(userId, 'active-project'), rawActive);
        }
        const rawCloud = localStorage.getItem(getScopedKeyByUserId(authUser.rawId, 'cloud-project-id'));
        if (rawCloud) {
          localStorage.setItem(getScopedKeyByUserId(userId, 'cloud-project-id'), rawCloud);
        }
        try {
          const projects = JSON.parse(rawIndex) as ProjectListItem[];
          for (const project of projects) {
            const rawState = localStorage.getItem(getScopedKeyByUserId(authUser.rawId, `project:${project.id}:state`));
            const rawChat = localStorage.getItem(getScopedKeyByUserId(authUser.rawId, `project:${project.id}:chat`));
            if (rawState) localStorage.setItem(getScopedKeyByUserId(userId, `project:${project.id}:state`), rawState);
            if (rawChat) localStorage.setItem(getScopedKeyByUserId(userId, `project:${project.id}:chat`), rawChat);
          }
        } catch {
          // Ignore malformed legacy index.
        }
      }
    }

    // Check if already migrated for this user
    if (localStorage.getItem(scopedIndexKey)) {
      this.migrationDoneForUserId = userId;
      return;
    }
    
    // Check for legacy data
    const legacyIndex = localStorage.getItem(LEGACY_KEYS.PROJECTS_INDEX);
    if (legacyIndex) {
      try {
        // Migrate projects index
        localStorage.setItem(scopedIndexKey, legacyIndex);
        
        // Migrate active project ID
        const legacyActive = localStorage.getItem(LEGACY_KEYS.ACTIVE_PROJECT_ID);
        if (legacyActive) {
          localStorage.setItem(getScopedKey('active-project'), legacyActive);
        }
        
        // Migrate cloud project ID
        const legacyCloudId = localStorage.getItem(STORAGE_KEYS.CLOUD_PROJECT_ID);
        if (legacyCloudId) {
          localStorage.setItem(getScopedKey('cloud-project-id'), legacyCloudId);
        }
        
        // Migrate chat messages
        const legacyChat = localStorage.getItem(LEGACY_KEYS.CHAT_MESSAGES);
        if (legacyChat) {
          localStorage.setItem(getScopedKey('chat-messages'), legacyChat);
        }
        
        // Migrate individual project data
        const projects = JSON.parse(legacyIndex) as ProjectListItem[];
        for (const project of projects) {
          const legacyStateKey = `${LEGACY_KEYS.PROJECT_PREFIX}${project.id}-state`;
          const legacyChatKey = `${LEGACY_KEYS.PROJECT_PREFIX}${project.id}-chat`;
          
          const stateData = localStorage.getItem(legacyStateKey);
          const chatData = localStorage.getItem(legacyChatKey);
          
          if (stateData) {
            localStorage.setItem(getScopedKey(`project:${project.id}:state`), stateData);
          }
          if (chatData) {
            localStorage.setItem(getScopedKey(`project:${project.id}:chat`), chatData);
          }
        }
        
        console.log(`[Security] Migrated ${projects.length} projects to user-scoped storage for user ${userId}`);
        
        // Clear legacy keys after successful migration to prevent re-migration
        this.clearLegacyKeys();
      } catch (error) {
        console.error('[Security] Migration failed:', error);
      }
    }
    
    this.migrationDoneForUserId = userId;
  }

  /**
   * Clear legacy storage keys (call after confirming migration success)
   */
  private clearLegacyKeys(): void {
    localStorage.removeItem(LEGACY_KEYS.PROJECTS_INDEX);
    localStorage.removeItem(LEGACY_KEYS.ACTIVE_PROJECT_ID);
    // Note: Individual project keys are not cleared to allow rollback
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
    const cloudProjectId = localStorage.getItem(getScopedKey('cloud-project-id'));

    // 1. Save to localStorage immediately (user-scoped)
    const localData: LocalProjectData = {
      state,
      updatedAt: now,
      cloudProjectId: cloudProjectId || undefined,
    };

    try {
      localStorage.setItem(getScopedKey('project-state'), JSON.stringify(localData));
    } catch (error) {
      // Handle QuotaExceededError or other localStorage errors
      console.error('Failed to save to localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to clear old data and retry
        this.clearOldLocalData();
        try {
          localStorage.setItem(getScopedKey('project-state'), JSON.stringify(localData));
        } catch {
          console.error('localStorage quota exceeded even after cleanup');
        }
      }
    }

    // 2. Queue cloud sync if authenticated
    if (!options?.skipCloud && this.isAuthenticated() && cloudProjectId) {
      // SECURITY: Verify ownership before cloud sync
      const isOwner = await this.verifyProjectOwnership(cloudProjectId);
      if (!isOwner) {
        console.warn('[Security] Rejecting cloud sync: ownership verification failed');
        return;
      }
      
      this.queueCloudSync({
        projects: [
          {
            id: cloudProjectId,
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
   * Verify cloud project ownership before using data
   */
  private async verifyProjectOwnership(cloudProjectId: string): Promise<boolean> {
    try {
      const project = await projectService.getProject(cloudProjectId);
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        console.warn('[Security] Cannot verify ownership: no current user');
        return false;
      }
      
      if (project.userId && project.userId !== currentUserId) {
        console.warn(`[Security] Ownership mismatch: project.userId=${project.userId}, current=${currentUserId}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('[Security] Failed to verify project ownership:', error);
      return false;
    }
  }

  /**
   * Load project state (local first, then cloud if newer and owned)
   * SECURITY: Ownership is always verified in fetchCloudProjectState
   */
  async loadProjectState(options?: SyncOptions): Promise<ProjectState | null> {
    // 1. Load from localStorage
    const localData = this.getLocalProjectData();

    // 2. If authenticated, check cloud for newer data
    // Note: fetchCloudProjectState now always verifies ownership
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
   * Get local project data with runtime validation (user-scoped)
   */
  private getLocalProjectData(): LocalProjectData | null {
    this.migrateToUserScoped();
    try {
      const stored = localStorage.getItem(getScopedKey('project-state'));
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
        localStorage.removeItem(getScopedKey('project-state'));
        return null;
      }

      // Validate required ProjectState fields exist
      const state = parsed.state;
      if (!Array.isArray(state.objects) || !Array.isArray(state.links)) {
        console.warn('Invalid ProjectState structure, clearing...');
        localStorage.removeItem(getScopedKey('project-state'));
        return null;
      }

      return parsed as LocalProjectData;
    } catch {
      // Invalid data - clear corrupt entry
      localStorage.removeItem(getScopedKey('project-state'));
      return null;
    }
  }

  /**
   * Fetch project state from cloud
   * SECURITY: Always verifies ownership before storing cloud project ID
   */
  private async fetchCloudProjectState(
    projectId?: string
  ): Promise<CloudProject | null> {
    if (!projectId) {
      // Try to get the most recent project
      const projects = await projectService.listProjects();
      if (projects.length > 0) {
        const fullProject = await projectService.getProject(projects[0].id);
        
        // SECURITY: Verify ownership before storing cloud project ID
        const isOwner = await this.verifyProjectOwnership(fullProject.id);
        if (!isOwner) {
          console.warn('[Security] Rejecting cloud project: ownership verification failed');
          return null;
        }
        
        // Store the cloud project ID for future syncs (user-scoped)
        localStorage.setItem(getScopedKey('cloud-project-id'), fullProject.id);
        return fullProject;
      }
      return null;
    }

    try {
      const project = await projectService.getProject(projectId);
      // SECURITY: Verify ownership even when projectId is provided
      const isOwner = await this.verifyProjectOwnership(projectId);
      if (!isOwner) {
        console.warn('[Security] Rejecting cloud project: ownership verification failed');
        return null;
      }
      return project;
    } catch {
      return null;
    }
  }

  /**
   * Convert cloud project to local state
   */
  private cloudProjectToState(project: CloudProject): ProjectState {
    return normalizeProjectState({
      projectName: project.name,
      industry: project.industry || '',
      useCase: project.useCase || '',
      status: (project.status as ProjectState['status']) || 'scouting',
      objects: project.objects || [],
      links: project.links || [],
      integrations: project.integrations || [],
      aiRequirements: project.aiRequirements || [],
    });
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

    // 1. Save to localStorage (user-scoped)
    const localData: LocalChatData = {
      messages: truncatedMessages,
      updatedAt: now,
    };
    localStorage.setItem(getScopedKey('chat-messages'), JSON.stringify(localData));

    // 2. Queue cloud sync if authenticated
    if (!options?.skipCloud && this.isAuthenticated()) {
      const cloudProjectId = localStorage.getItem(getScopedKey('cloud-project-id'));
      if (cloudProjectId) {
        // SECURITY: Verify ownership before cloud sync
        const isOwner = await this.verifyProjectOwnership(cloudProjectId);
        if (!isOwner) {
          console.warn('[Security] Rejecting chat cloud sync: ownership verification failed');
          return;
        }

        // Only sync the most recent messages that haven't been synced
        const lastSync = localStorage.getItem(getScopedKey('last-sync'));
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
   * Load chat messages (user-scoped)
   */
  async loadChatMessages(): Promise<ChatMessage[]> {
    this.migrateToUserScoped();
    try {
      const stored = localStorage.getItem(getScopedKey('chat-messages'));
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

    // Set new timer to mark sync complete (user-scoped)
    this.syncDebounceTimer = setTimeout(() => {
      localStorage.setItem(getScopedKey('last-sync'), new Date().toISOString());
    }, this.SYNC_DEBOUNCE_MS + 1000);
  }

  /**
   * Perform full sync with cloud
   */
  async fullSync(): Promise<FullSyncState | null> {
    if (!this.isAuthenticated()) return null;

    try {
      const cloudState = await syncService.getFullState();
      localStorage.setItem(getScopedKey('last-sync'), new Date().toISOString());
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

      // Update local storage with cloud project ID (user-scoped)
      localStorage.setItem(getScopedKey('cloud-project-id'), newProject.id);
      localProject.cloudProjectId = newProject.id;
      localStorage.setItem(
        getScopedKey('project-state'),
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
      // Remove chat messages first (usually the largest) - user-scoped
      localStorage.removeItem(getScopedKey('chat-messages'));
      // Remove old sync timestamp - user-scoped
      localStorage.removeItem(getScopedKey('last-sync'));
      console.info('Cleared old local data to free storage space');
    } catch (error) {
      console.error('Failed to clear old local data:', error);
    }
  }

  /**
   * Clear all local storage for current user
   */
  clearAll(): void {
    // Clear user-scoped keys
    const scopedKeys = [
      'projects-index',
      'active-project',
      'project-state',
      'chat-messages',
      'cloud-project-id',
      'project-cloud-map',
      'last-sync',
    ];
    scopedKeys.forEach(key => {
      localStorage.removeItem(getScopedKey(key));
    });
    
    // Also clear legacy keys for backward compatibility
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get current cloud project ID (user-scoped)
   */
  getCloudProjectId(): string | null {
    this.migrateToUserScoped();
    return localStorage.getItem(getScopedKey('cloud-project-id'));
  }

  /**
   * Set cloud project ID (user-scoped)
   * SECURITY: This should only be called after verifying project ownership
   */
  setCloudProjectId(id: string | null): void {
    if (id) {
      localStorage.setItem(getScopedKey('cloud-project-id'), id);
    } else {
      localStorage.removeItem(getScopedKey('cloud-project-id'));
    }
  }

  /**
   * Get cloud project ID mapped from a local project ID (user-scoped)
   */
  getCloudProjectIdByLocalId(localProjectId: string): string | null {
    this.migrateToUserScoped();
    try {
      const raw = localStorage.getItem(getScopedKey('project-cloud-map'));
      if (!raw) return null;
      const map = JSON.parse(raw) as Record<string, string>;
      return map[localProjectId] || null;
    } catch {
      return null;
    }
  }

  /**
   * Persist local -> cloud project ID mapping (user-scoped)
   */
  setCloudProjectIdByLocalId(localProjectId: string, cloudProjectId: string | null): void {
    this.migrateToUserScoped();
    try {
      const raw = localStorage.getItem(getScopedKey('project-cloud-map'));
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      if (cloudProjectId) {
        map[localProjectId] = cloudProjectId;
      } else {
        delete map[localProjectId];
      }
      localStorage.setItem(getScopedKey('project-cloud-map'), JSON.stringify(map));
    } catch (error) {
      console.error('Failed to save project cloud mapping:', error);
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
   * Get the active project ID (user-scoped)
   */
  getActiveProjectId(): string | null {
    this.migrateToUserScoped();
    return localStorage.getItem(getScopedKey('active-project'));
  }

  /**
   * Set the active project ID (user-scoped)
   */
  setActiveProjectId(projectId: string | null): void {
    if (projectId) {
      localStorage.setItem(getScopedKey('active-project'), projectId);
    } else {
      localStorage.removeItem(getScopedKey('active-project'));
    }
  }

  /**
   * List all local projects (user-scoped)
   */
  listProjectsLocal(): ProjectListItem[] {
    this.migrateToUserScoped();
    try {
      const stored = localStorage.getItem(getScopedKey('projects-index'));
      if (!stored) return [];
      const projects = JSON.parse(stored);
      if (!Array.isArray(projects)) return [];
      return projects;
    } catch {
      return [];
    }
  }

  /**
   * Save the projects index (user-scoped)
   */
  private saveProjectsIndex(projects: ProjectListItem[]): void {
    try {
      localStorage.setItem(getScopedKey('projects-index'), JSON.stringify(projects));
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
        return normalizeProjectState(data.state);
      }
      return normalizeProjectState(data);
    } catch {
      return null;
    }
  }

  /**
   * Save project state by ID
   */
  saveProjectStateById(projectId: string, state: ProjectState): void {
    const normalizedState = normalizeProjectState(state);
    const now = new Date().toISOString();
    const key = getProjectStateKey(projectId);

    try {
      localStorage.setItem(key, JSON.stringify({
        state: normalizedState,
        updatedAt: now,
      }));

      // Update projects index
      this.updateProjectInIndex(projectId, {
        updatedAt: now,
        progress: this.calculateProgress(normalizedState),
      });
    } catch (error) {
      console.error('Failed to save project state:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldLocalData();
        try {
          localStorage.setItem(key, JSON.stringify({ state: normalizedState, updatedAt: now }));
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
   * Get AI analysis result by project ID
   */
  getAnalysisResultById(projectId: string): unknown | null {
    try {
      const key = getProjectAnalysisKey(projectId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return data.analysis ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Save AI analysis result by project ID
   */
  saveAnalysisResultById(projectId: string, analysis: unknown): void {
    const key = getProjectAnalysisKey(projectId);
    try {
      localStorage.setItem(key, JSON.stringify({
        analysis,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save analysis result:', error);
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
    localStorage.removeItem(getProjectAnalysisKey(projectId));
    this.setCloudProjectIdByLocalId(projectId, null);

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
   * Clean up legacy global data after migration is complete
   * This removes old single-project storage keys that are no longer used
   */
  cleanupLegacyData(): void {
    // Only cleanup if migration is already done
    if (!localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE)) {
      return;
    }

    // Remove legacy global chat messages key
    const oldChat = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (oldChat) {
      console.info('Cleaning up legacy global chat messages...');
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    }

    // Remove legacy project state if we have multi-project data
    const hasMultiProjectData = this.listProjectsLocal().length > 0;
    if (hasMultiProjectData) {
      const oldState = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
      if (oldState) {
        console.info('Cleaning up legacy project state...');
        localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
      }
    }
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

    // Clean up legacy data after migration
    this.cleanupLegacyData();

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

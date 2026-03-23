/**
 * Sync Orchestrator — Cloud sync queue, scheduling, and ownership verification.
 *
 * Handles:
 * - Debounced cloud sync queue
 * - Full cloud state pull
 * - Project ownership verification
 * - Cloud project state fetching
 * - Local-to-cloud migration on first login
 */

import { syncService, type BatchSyncInput, type FullSyncState } from '../../services/syncService';
import { projectService, type Project as CloudProject } from '../../services/projectService';
import type { ProjectState, ChatMessage } from '../../types';
import { normalizeProjectState } from '../cardinality';
import { getCurrentUserId, getScopedKey } from './user-scope';
import {
  readLocalProjectData,
  writeLocalProjectData,
  readCloudProjectId,
  writeCloudProjectId,
  MAX_LOCAL_MESSAGES,
  MAX_MESSAGE_LENGTH,
  clearOldLocalData,
  type LocalProjectData,
} from './local-store';

export type AuthCheckFn = () => boolean;

// ── Sync state ───────────────────────────────────────────────

let authCheck: AuthCheckFn = () => false;
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 2000;

export function setAuthCheck(fn: AuthCheckFn): void {
  authCheck = fn;
}

export function isAuthenticated(): boolean {
  return authCheck();
}

// ── Ownership verification ───────────────────────────────────

export async function verifyProjectOwnership(cloudProjectId: string): Promise<boolean> {
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

// ── Debounced cloud sync ─────────────────────────────────────

export function queueCloudSync(data: BatchSyncInput): void {
  if (!isAuthenticated()) return;

  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }

  syncService.queueSync(data);

  syncDebounceTimer = setTimeout(() => {
    localStorage.setItem(getScopedKey('last-sync'), new Date().toISOString());
  }, SYNC_DEBOUNCE_MS + 1000);
}

// ── Full sync ────────────────────────────────────────────────

export async function fullSync(): Promise<FullSyncState | null> {
  if (!isAuthenticated()) return null;

  try {
    const cloudState = await syncService.getFullState();
    localStorage.setItem(getScopedKey('last-sync'), new Date().toISOString());
    return cloudState;
  } catch (error) {
    console.error('Full sync failed:', error);
    return null;
  }
}

// ── Cloud project operations ─────────────────────────────────

function cloudProjectToState(project: CloudProject): ProjectState {
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

/**
 * Fetch project state from cloud.
 * SECURITY: Always verifies ownership before storing cloud project ID.
 */
export async function fetchCloudProjectState(projectId?: string): Promise<CloudProject | null> {
  if (!projectId) {
    const projects = await projectService.listProjects();
    if (projects.length > 0) {
      const fullProject = await projectService.getProject(projects[0].id);

      const isOwner = await verifyProjectOwnership(fullProject.id);
      if (!isOwner) {
        console.warn('[Security] Rejecting cloud project: ownership verification failed');
        return null;
      }

      localStorage.setItem(getScopedKey('cloud-project-id'), fullProject.id);
      return fullProject;
    }
    return null;
  }

  try {
    const project = await projectService.getProject(projectId);
    const isOwner = await verifyProjectOwnership(projectId);
    if (!isOwner) {
      console.warn('[Security] Rejecting cloud project: ownership verification failed');
      return null;
    }
    return project;
  } catch {
    return null;
  }
}

// ── Save project state with cloud sync ───────────────────────

export async function saveProjectStateWithSync(
  state: ProjectState,
  options?: { skipCloud?: boolean },
): Promise<void> {
  const now = new Date().toISOString();
  const cloudProjectId = readCloudProjectId();

  const localData: LocalProjectData = {
    state,
    updatedAt: now,
    cloudProjectId: cloudProjectId || undefined,
  };

  try {
    writeLocalProjectData(localData);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldLocalData();
      try { writeLocalProjectData(localData); } catch { /* quota exceeded even after cleanup */ }
    }
  }

  if (!options?.skipCloud && isAuthenticated() && cloudProjectId) {
    const isOwner = await verifyProjectOwnership(cloudProjectId);
    if (!isOwner) {
      console.warn('[Security] Rejecting cloud sync: ownership verification failed');
      return;
    }

    queueCloudSync({
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
          localUpdatedAt: now,
        },
      ],
    });
  }
}

// ── Load project state (local first, cloud if newer) ─────────

interface SyncOptions {
  isAuthenticated: boolean;
  forceCloud?: boolean;
}

export async function loadProjectStateWithSync(options?: SyncOptions): Promise<ProjectState | null> {
  const localData = readLocalProjectData();

  if (options?.isAuthenticated || isAuthenticated()) {
    try {
      const cloudData = await fetchCloudProjectState(localData?.cloudProjectId);
      if (cloudData) {
        const cloudUpdatedAt = new Date(cloudData.updatedAt);
        const localUpdatedAt = localData?.updatedAt
          ? new Date(localData.updatedAt)
          : new Date(0);

        if (cloudUpdatedAt > localUpdatedAt) {
          const mergedState = cloudProjectToState(cloudData);
          await saveProjectStateWithSync(mergedState, { skipCloud: true });
          return mergedState;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch cloud project state:', error);
    }
  }

  return localData?.state || null;
}

// ── Save chat messages with cloud sync ───────────────────────

export async function saveChatMessagesWithSync(
  messages: ChatMessage[],
  options?: { skipCloud?: boolean },
): Promise<void> {
  const now = new Date().toISOString();

  const truncatedMessages = messages.slice(-MAX_LOCAL_MESSAGES).map((msg) => ({
    ...msg,
    content:
      msg.content.length > MAX_MESSAGE_LENGTH
        ? msg.content.slice(0, MAX_MESSAGE_LENGTH) + '...'
        : msg.content,
  }));

  localStorage.setItem(getScopedKey('chat-messages'), JSON.stringify({
    messages: truncatedMessages,
    updatedAt: now,
  }));

  if (!options?.skipCloud && isAuthenticated()) {
    const cloudProjectId = readCloudProjectId();
    if (cloudProjectId) {
      const isOwner = await verifyProjectOwnership(cloudProjectId);
      if (!isOwner) {
        console.warn('[Security] Rejecting chat cloud sync: ownership verification failed');
        return;
      }

      queueCloudSync({
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

// ── Load chat messages (user-scoped) ─────────────────────────

export async function loadChatMessagesFromLocal(): Promise<ChatMessage[]> {
  try {
    const stored = localStorage.getItem(getScopedKey('chat-messages'));
    if (stored) {
      const data = JSON.parse(stored);
      return data.messages || [];
    }
  } catch {
    // Invalid data
  }
  return [];
}

// ── Save preferences with cloud sync ─────────────────────────

export async function savePreferencesWithSync(prefs: {
  themeId?: string;
  language?: 'en' | 'cn';
  aiProvider?: string;
  aiModel?: string;
  customBaseUrl?: string;
  sidebarCollapsed?: boolean;
  defaultTab?: string;
}): Promise<void> {
  if (prefs.themeId) {
    localStorage.setItem('ontology-theme', prefs.themeId);
  }

  if (isAuthenticated()) {
    queueCloudSync({
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

// ── Migrate local to cloud (first login) ─────────────────────

export async function migrateLocalToCloud(): Promise<string | null> {
  if (!isAuthenticated()) return null;

  const localProject = readLocalProjectData();
  if (!localProject) return null;

  if (localProject.cloudProjectId) {
    return localProject.cloudProjectId;
  }

  try {
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

    writeCloudProjectId(newProject.id);
    localProject.cloudProjectId = newProject.id;
    writeLocalProjectData(localProject);

    const localMessages = await loadChatMessagesFromLocal();
    if (localMessages.length > 0) {
      await projectService.addChatMessages(
        newProject.id,
        localMessages.map((m) => ({ role: m.role, content: m.content })),
      );
    }

    return newProject.id;
  } catch (error) {
    console.error('Failed to migrate local data to cloud:', error);
    return null;
  }
}

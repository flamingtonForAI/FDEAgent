/**
 * Local Store — Pure localStorage read/write operations for project data.
 *
 * All reads/writes go through user-scoped keys (from user-scope.ts).
 * No cloud sync logic — that lives in sync-orchestrator.ts.
 */

import type { ProjectState, ChatMessage, ProjectListItem } from '../../types';
import { normalizeProjectState } from '../cardinality';
import { getScopedKey, getProjectStateKey, getProjectChatKey, getProjectAnalysisKey } from './user-scope';

// ── Constants ────────────────────────────────────────────────

export const MAX_LOCAL_MESSAGES = 200;
export const MAX_MESSAGE_LENGTH = 4000;

export const STORAGE_KEYS = {
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

// Legacy keys referenced by migration
export const LEGACY_KEYS = {
  PROJECTS_INDEX: 'ontology-projects-index',
  ACTIVE_PROJECT_ID: 'ontology-active-project',
  CHAT_MESSAGES: 'ontology-chat-messages',
  PROJECT_PREFIX: 'ontology-project-',
};

// ── Internal data shapes ─────────────────────────────────────

export interface LocalProjectData {
  state: ProjectState;
  updatedAt: string;
  cloudProjectId?: string;
}

interface LocalChatData {
  messages: ChatMessage[];
  updatedAt: string;
}

// ── Quota recovery ───────────────────────────────────────────

export function clearOldLocalData(): void {
  try {
    localStorage.removeItem(getScopedKey('chat-messages'));
    localStorage.removeItem(getScopedKey('last-sync'));
    console.info('Cleared old local data to free storage space');
  } catch (error) {
    console.error('Failed to clear old local data:', error);
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldLocalData();
      try {
        localStorage.setItem(key, value);
      } catch {
        console.error('localStorage quota exceeded even after cleanup');
      }
    }
  }
}

// ── Projects index ───────────────────────────────────────────

export function readProjectsIndex(): ProjectListItem[] {
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

export function writeProjectsIndex(projects: ProjectListItem[]): void {
  try {
    localStorage.setItem(getScopedKey('projects-index'), JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects index:', error);
  }
}

// ── Active project ID ────────────────────────────────────────

export function readActiveProjectId(): string | null {
  return localStorage.getItem(getScopedKey('active-project'));
}

export function writeActiveProjectId(projectId: string | null): void {
  if (projectId) {
    localStorage.setItem(getScopedKey('active-project'), projectId);
  } else {
    localStorage.removeItem(getScopedKey('active-project'));
  }
}

// ── Per-project state ────────────────────────────────────────

export function readProjectState(projectId: string): ProjectState | null {
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

export function writeProjectState(projectId: string, state: ProjectState): void {
  const normalizedState = normalizeProjectState(state);
  const now = new Date().toISOString();
  const key = getProjectStateKey(projectId);
  safeSetItem(key, JSON.stringify({ state: normalizedState, updatedAt: now }));
}

export function removeProjectState(projectId: string): void {
  localStorage.removeItem(getProjectStateKey(projectId));
}

// ── Per-project chat messages ────────────────────────────────

export function readChatMessages(projectId: string): ChatMessage[] {
  try {
    const key = getProjectChatKey(projectId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const data = JSON.parse(stored);
    if (data.messages) return data.messages;
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

export function writeChatMessages(projectId: string, messages: ChatMessage[]): void {
  const now = new Date().toISOString();
  const key = getProjectChatKey(projectId);

  const truncatedMessages = messages.slice(-MAX_LOCAL_MESSAGES).map((msg) => ({
    ...msg,
    content:
      msg.content.length > MAX_MESSAGE_LENGTH
        ? msg.content.slice(0, MAX_MESSAGE_LENGTH) + '...'
        : msg.content,
  }));

  try {
    localStorage.setItem(key, JSON.stringify({ messages: truncatedMessages, updatedAt: now }));
  } catch (error) {
    console.error('Failed to save chat messages:', error);
  }
}

export function removeChatMessages(projectId: string): void {
  localStorage.removeItem(getProjectChatKey(projectId));
}

// ── Per-project analysis ─────────────────────────────────────

export function readAnalysisResult(projectId: string): unknown | null {
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

export function writeAnalysisResult(projectId: string, analysis: unknown): void {
  const key = getProjectAnalysisKey(projectId);
  try {
    localStorage.setItem(key, JSON.stringify({ analysis, updatedAt: new Date().toISOString() }));
  } catch (error) {
    console.error('Failed to save analysis result:', error);
  }
}

export function removeAnalysisResult(projectId: string): void {
  localStorage.removeItem(getProjectAnalysisKey(projectId));
}

// ── Cloud project ID mapping ─────────────────────────────────

export function readCloudProjectId(): string | null {
  return localStorage.getItem(getScopedKey('cloud-project-id'));
}

export function writeCloudProjectId(id: string | null): void {
  if (id) {
    localStorage.setItem(getScopedKey('cloud-project-id'), id);
  } else {
    localStorage.removeItem(getScopedKey('cloud-project-id'));
  }
}

export function readCloudProjectMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(getScopedKey('project-cloud-map'));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function writeCloudProjectMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(getScopedKey('project-cloud-map'), JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save project cloud mapping:', error);
  }
}

// ── Legacy single-project data (used by cloud sync) ──────────

export function readLocalProjectData(): LocalProjectData | null {
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

    const state = parsed.state;
    if (!Array.isArray(state.objects) || !Array.isArray(state.links)) {
      console.warn('Invalid ProjectState structure, clearing...');
      localStorage.removeItem(getScopedKey('project-state'));
      return null;
    }

    return parsed as LocalProjectData;
  } catch {
    localStorage.removeItem(getScopedKey('project-state'));
    return null;
  }
}

export function writeLocalProjectData(data: LocalProjectData): void {
  safeSetItem(getScopedKey('project-state'), JSON.stringify(data));
}

// ── Bulk clear ───────────────────────────────────────────────

export function clearAllForCurrentUser(): void {
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

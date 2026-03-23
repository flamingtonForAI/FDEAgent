/**
 * Migration — Legacy data migration logic.
 *
 * Handles:
 * - User-scoped key migration (legacy global keys → u:{userId}:* keys)
 * - Demo account data rescue (backend may return varying IDs)
 * - v1 → v2 single-project → multi-project migration
 * - Legacy data cleanup
 */

import type { ProjectState, ChatMessage, ProjectListItem } from '../../types';
import { getCurrentUserId, getAuthSessionUser, getScopedKey, getScopedKeyByUserId } from './user-scope';
import {
  STORAGE_KEYS,
  LEGACY_KEYS,
  readProjectsIndex,
  readActiveProjectId,
} from './local-store';

// ── User-scoped migration ────────────────────────────────────

/**
 * Migrate legacy data to user-scoped keys.
 * SECURITY: Only migrates data when a user is logged in.
 * Anonymous users get fresh data to prevent cross-user contamination.
 *
 * @param migrationDoneForUserId — cached user ID from previous run (avoids repeat work)
 * @returns the user ID migration was performed for (or null if skipped)
 */
export function migrateToUserScoped(migrationDoneForUserId: string | null): string | null {
  const userId = getCurrentUserId();
  if (!userId) {
    // Anonymous sessions are isolated by session key and should not lock migration permanently.
    return null;
  }

  if (migrationDoneForUserId === userId) return userId;
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
    return userId;
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
      localStorage.removeItem(LEGACY_KEYS.PROJECTS_INDEX);
      localStorage.removeItem(LEGACY_KEYS.ACTIVE_PROJECT_ID);
    } catch (error) {
      console.error('[Security] Migration failed:', error);
    }
  }

  return userId;
}

// ── v1 → v2 migration ────────────────────────────────────────

/**
 * Check if v1 → v2 migration is needed.
 */
export function needsV2Migration(): boolean {
  if (localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE)) {
    return false;
  }
  const hasOldData = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE) ||
                     localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
  return !!hasOldData;
}

/**
 * Migrate old single-project data to multi-project format.
 * Returns the new project ID, or null if nothing to migrate.
 *
 * @param createProjectFn — callback to create a project (avoids circular dep with HybridStorage)
 * @param saveChatFn — callback to save chat messages by project ID
 */
export function migrateOldData(
  createProjectFn: (params: { name: string; industry: string; useCase: string; description?: string; initialState?: ProjectState }) => { id: string },
  saveChatFn: (projectId: string, messages: ChatMessage[]) => void,
): string | null {
  if (!needsV2Migration()) {
    return readActiveProjectId();
  }

  console.info('Migrating old data to multi-project format...');

  try {
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
      localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');
      return null;
    }

    const project = createProjectFn({
      name: oldState?.projectName || '迁移项目',
      industry: oldState?.industry || '',
      useCase: oldState?.useCase || '',
      description: '从旧版本迁移的项目数据',
      initialState: oldState || undefined,
    });

    if (oldChat.length > 0) {
      saveChatFn(project.id, oldChat);
    }

    localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');
    console.info(`Migration complete. Created project: ${project.id}`);
    return project.id;
  } catch (error) {
    console.error('Migration failed:', error);
    localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true'); // Prevent retry loop
    return null;
  }
}

/**
 * Clean up legacy global data after migration is complete.
 */
export function cleanupLegacyData(): void {
  if (!localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE)) {
    return;
  }

  const oldChat = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
  if (oldChat) {
    console.info('Cleaning up legacy global chat messages...');
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  }

  const hasMultiProjectData = readProjectsIndex().length > 0;
  if (hasMultiProjectData) {
    const oldState = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
    if (oldState) {
      console.info('Cleaning up legacy project state...');
      localStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
    }
  }
}

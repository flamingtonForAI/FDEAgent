/**
 * User Scope — User-scoped key management for localStorage isolation.
 *
 * Handles:
 * - Current user ID resolution (from auth session)
 * - Anonymous session ID generation
 * - Scoped key generation (user-prefixed or anon-prefixed)
 */

// ── Auth session helpers ─────────────────────────────────────

/**
 * Get current user ID from auth storage.
 * Returns 'demo-user-001' for demo accounts to ensure isolation.
 */
export function getCurrentUserId(): string | null {
  try {
    const authData = localStorage.getItem('ontology-auth-session');
    if (authData) {
      const parsed = JSON.parse(authData);
      const userId = parsed.user?.id || null;
      const email = String(parsed.user?.email || '').toLowerCase();
      // SECURITY NOTE: Fixed demo scope ID ensures demo data is isolated and
      // predictable across backend/offline mode. This is intentional — demo data
      // is non-sensitive by design. Do not use this pattern for real user scoping.
      if (email === 'demo@example.com') {
        return 'demo-user-001';
      }
      return userId;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function getAuthSessionUser(): { id: string | null; rawId: string | null; email: string | null } {
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
}

// ── Anonymous session ────────────────────────────────────────

export function getAnonymousId(): string {
  let anonId = sessionStorage.getItem('ontology-anon-id');
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ontology-anon-id', anonId);
  }
  return anonId;
}

// ── Scoped key generation ────────────────────────────────────

export function getScopedKeyByUserId(userId: string, key: string): string {
  return `u:${userId}:${key}`;
}

/**
 * Generate a user-scoped storage key.
 * Uses the current user ID if authenticated, otherwise the anonymous session ID.
 */
export function getScopedKey(key: string): string {
  const userId = getCurrentUserId();
  if (userId) {
    return `u:${userId}:${key}`;
  }
  return `${getAnonymousId()}:${key}`;
}

// ── Per-project scoped keys ──────────────────────────────────

export const getProjectStateKey = (projectId: string): string => getScopedKey(`project:${projectId}:state`);
export const getProjectChatKey = (projectId: string): string => getScopedKey(`project:${projectId}:chat`);
export const getProjectAnalysisKey = (projectId: string): string => getScopedKey(`project:${projectId}:analysis`);

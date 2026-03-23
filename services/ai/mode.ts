export type AIMode = 'proxy' | 'direct';

let cachedMode: AIMode | null = null;

/** API base URL — same fallback as apiClient.ts */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Detect whether the backend AI proxy is available.
 * Caches the result so the health check only runs once per session.
 */
export async function getAIMode(): Promise<AIMode> {
  if (cachedMode) return cachedMode;
  try {
    // VITE_API_URL already includes /api, so append /ai/health directly
    const resp = await fetch(`${API_BASE}/ai/health`, { signal: AbortSignal.timeout(2000) });
    if (resp.ok) {
      cachedMode = 'proxy';
      return 'proxy';
    }
  } catch {
    // Health check failed — backend proxy not available
  }
  cachedMode = 'direct';
  return 'direct';
}

/** Force proxy mode via environment variable. */
export function isForceProxy(): boolean {
  return import.meta.env.VITE_FORCE_PROXY === 'true';
}

/** Reset cached mode (e.g. after settings change). */
export function resetAIMode(): void {
  cachedMode = null;
}

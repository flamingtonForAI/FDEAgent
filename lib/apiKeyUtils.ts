/**
 * apiKeyUtils.ts - Shared provider API key resolution
 *
 * Resolves the correct API key for the active AI provider,
 * supporting both the per-provider `apiKeys` map and the legacy `apiKey` field.
 */

import type { AISettings } from '../types';

/**
 * Get the API key for the currently selected provider.
 * When the per-provider `apiKeys` map exists, returns only the key for
 * `settings.provider`. Falls back to the legacy `apiKey` field when the
 * map is absent (old persisted data).
 */
export function getProviderApiKey(settings: AISettings): string {
  if (settings.apiKeys) {
    return (settings.apiKeys[settings.provider] || '').trim();
  }
  return (settings.apiKey || '').trim();
}

/**
 * Same as `getProviderApiKey` but throws when the key is empty.
 */
export function requireProviderApiKey(settings: AISettings): string {
  const key = getProviderApiKey(settings);
  if (!key) {
    throw new Error(`Missing API key for provider: ${settings.provider}`);
  }
  return key;
}

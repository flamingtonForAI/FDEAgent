import { AIProvider, AI_PROVIDERS } from '../types';
import { AIService, EnrichedModelInfo } from '../services/aiService';

type RegistryStatus = 'hardcoded' | 'api';

interface CacheEntry {
  ts: number;
  models: EnrichedModelInfo[];
  status: RegistryStatus;
}

const STORAGE_PREFIX = 'oa:model-registry:v1:';
const DEFAULT_TTL_MS = 10 * 60 * 1000;
const OPENROUTER_TTL_MS = 30 * 60 * 1000;

function getProviderTTL(provider: AIProvider): number {
  return provider === 'openrouter' ? OPENROUTER_TTL_MS : DEFAULT_TTL_MS;
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashApiKey(apiKey: string): Promise<string> {
  if (!apiKey) return 'no-key';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
  return toHex(digest).slice(0, 12);
}

function providerFallbackModels(provider: AIProvider): EnrichedModelInfo[] {
  const preset = AI_PROVIDERS.find((p) => p.id === provider);
  return (preset?.models || []).map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    source: 'hardcoded',
  }));
}

function isCacheExpired(entry: CacheEntry, provider: AIProvider): boolean {
  return Date.now() - entry.ts > getProviderTTL(provider);
}

class ModelRegistryService {
  private memoryCache = new Map<string, CacheEntry>();

  private getStorageKey(provider: AIProvider, apiKeyHash: string): string {
    return `${STORAGE_PREFIX}${provider}:${apiKeyHash}`;
  }

  private readSessionCache(key: string): CacheEntry | null {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry;
      if (!Array.isArray(parsed.models)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private writeSessionCache(key: string, entry: CacheEntry): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // Ignore storage quota or private mode failures.
    }
  }

  async listModels(params: {
    provider: AIProvider;
    apiKey?: string;
    customBaseUrl?: string;
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<{ models: EnrichedModelInfo[]; status: RegistryStatus; fallback: boolean }> {
    const { provider, apiKey = '', customBaseUrl, forceRefresh = false, signal } = params;
    const apiKeyHash = await hashApiKey(apiKey);
    const cacheKey = this.getStorageKey(provider, apiKeyHash);

    if (!forceRefresh) {
      const memory = this.memoryCache.get(cacheKey);
      if (memory && !isCacheExpired(memory, provider)) {
        return { models: memory.models, status: memory.status, fallback: memory.status === 'hardcoded' };
      }

      const sessionEntry = this.readSessionCache(cacheKey);
      if (sessionEntry && !isCacheExpired(sessionEntry, provider)) {
        this.memoryCache.set(cacheKey, sessionEntry);
        return {
          models: sessionEntry.models,
          status: sessionEntry.status,
          fallback: sessionEntry.status === 'hardcoded',
        };
      }
    }

    if (!apiKey.trim()) {
      const fallbackModels = providerFallbackModels(provider);
      const entry: CacheEntry = { ts: Date.now(), models: fallbackModels, status: 'hardcoded' };
      this.memoryCache.set(cacheKey, entry);
      this.writeSessionCache(cacheKey, entry);
      return { models: fallbackModels, status: 'hardcoded', fallback: true };
    }

    const aiService = new AIService({
      provider,
      apiKey,
      model: '',
      customBaseUrl,
    });
    const apiModels = await aiService.fetchAvailableModels(signal);
    const normalized = apiModels.map((model) => ({ ...model, source: model.source || 'api' as const }));
    const entry: CacheEntry = { ts: Date.now(), models: normalized, status: 'api' };
    this.memoryCache.set(cacheKey, entry);
    this.writeSessionCache(cacheKey, entry);
    return { models: normalized, status: 'api', fallback: false };
  }
}

export const modelRegistry = new ModelRegistryService();


import { AppError } from '../../../middleware/error.middleware.js';
import type { AIProviderAdapter } from './types.js';
import { OpenAICompatibleAdapter } from './openai-compatible.js';
import { GeminiAdapter } from './gemini.js';

/** Supported provider names — must match the frontend AI_PROVIDERS ids. */
export type ProviderName = 'openai' | 'openrouter' | 'gemini' | 'zhipu' | 'moonshot' | 'custom';

/** Base URLs per provider (mirrors frontend AI_PROVIDERS). */
const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  moonshot: 'https://api.moonshot.cn/v1',
};

/** Environment variable names for each provider's API key. */
const ENV_KEY_MAP: Record<string, string> = {
  openai: 'AI_OPENAI_KEY',
  openrouter: 'AI_OPENROUTER_KEY',
  gemini: 'AI_GEMINI_KEY',
  zhipu: 'AI_ZHIPU_KEY',
  moonshot: 'AI_MOONSHOT_KEY',
  custom: 'AI_CUSTOM_KEY',
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AppError(400, `API key not configured for provider (missing ${name})`);
  }
  return value;
}

/**
 * Factory: returns the appropriate provider adapter for the given provider name.
 */
export function getProvider(providerName: string): AIProviderAdapter {
  const envKey = ENV_KEY_MAP[providerName];
  if (!envKey) {
    throw new AppError(400, `Unknown AI provider: ${providerName}`);
  }

  if (providerName === 'gemini') {
    return new GeminiAdapter(requireEnv(envKey));
  }

  if (providerName === 'custom') {
    const baseUrl = process.env['AI_CUSTOM_BASE_URL'];
    if (!baseUrl) {
      throw new AppError(400, 'Custom provider requires AI_CUSTOM_BASE_URL');
    }
    return new OpenAICompatibleAdapter({
      apiKey: requireEnv(envKey),
      baseUrl,
      providerName: 'custom',
    });
  }

  const baseUrl = PROVIDER_BASE_URLS[providerName];
  if (!baseUrl) {
    throw new AppError(400, `No base URL for provider: ${providerName}`);
  }

  const extraHeaders: Record<string, string> = {};
  if (providerName === 'openrouter') {
    extraHeaders['X-Title'] = 'Ontology Architect';
  }

  return new OpenAICompatibleAdapter({
    apiKey: requireEnv(envKey),
    baseUrl,
    providerName,
    extraHeaders,
  });
}

export type { AIProviderAdapter, ChatMessage, ChatOptions, ModelInfo } from './types.js';

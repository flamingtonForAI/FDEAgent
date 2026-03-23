import { AISettings } from '../../types';

/** Default AI settings */
export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openrouter',
  apiKey: '',
  model: 'anthropic/claude-3.5-sonnet',
};

/** Load config from local API endpoint (async) */
export async function loadLocalConfig(): Promise<AISettings | null> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      if (!config) return null;
      const hasApiKeys = config.apiKeys && Object.values(config.apiKeys).some((v: unknown) => typeof v === 'string' && v.length > 0);
      const hasLegacyKey = !!config.apiKey;
      if (hasApiKeys || hasLegacyKey) {
        console.log('已从本地文件加载 API 配置');
        return config;
      }
    }
  } catch (e) {
    console.log('本地配置文件不可用，使用内存/sessionStorage');
  }
  return null;
}

/** Save config to local API endpoint (async) */
export async function saveLocalConfig(settings: AISettings): Promise<boolean> {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      console.log('API 配置已保存到本地文件 api-config.local.json');
      return true;
    }
  } catch (e) {
    console.log('无法保存到本地文件:', e);
  }
  return false;
}

/** Load AI settings synchronously from sessionStorage (for initialization) */
export function loadAISettings(): AISettings {
  try {
    const sessionSaved = sessionStorage.getItem('ontology-ai-settings');
    if (sessionSaved) {
      return JSON.parse(sessionSaved);
    }

    // Backward compat: migrate from localStorage (one-time)
    const localSaved = localStorage.getItem('ontology-ai-settings');
    if (localSaved) {
      const settings = JSON.parse(localSaved);
      sessionStorage.setItem('ontology-ai-settings', localSaved);
      const safeSettings = { ...settings, apiKey: '' };
      localStorage.setItem('ontology-ai-settings', JSON.stringify(safeSettings));
      console.log('API设置已迁移到sessionStorage');
      return settings;
    }
  } catch (e) {
    console.error('加载设置失败:', e);
  }
  return DEFAULT_AI_SETTINGS;
}

/** Load AI settings asynchronously (prefers local file, then sessionStorage) */
export async function loadAISettingsAsync(): Promise<AISettings> {
  const localConfig = await loadLocalConfig();
  if (localConfig) {
    sessionStorage.setItem('ontology-ai-settings', JSON.stringify(localConfig));
    return localConfig;
  }
  return loadAISettings();
}

/** Save settings to sessionStorage + localStorage + local file */
export async function saveAISettings(settings: AISettings): Promise<void> {
  try {
    sessionStorage.setItem('ontology-ai-settings', JSON.stringify(settings));

    const safeSettings = {
      provider: settings.provider,
      model: settings.model,
      customBaseUrl: settings.customBaseUrl,
      apiKey: '',
    };
    localStorage.setItem('ontology-ai-settings', JSON.stringify(safeSettings));

    await saveLocalConfig(settings);
  } catch (e) {
    console.error('保存设置失败:', e);
  }
}

/** Clear all sensitive settings (for logout) */
export function clearAISettings(): void {
  try {
    sessionStorage.removeItem('ontology-ai-settings');
  } catch (e) {
    console.error('清除设置失败:', e);
  }
}

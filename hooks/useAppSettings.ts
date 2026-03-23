import { useState, useEffect, useRef, useCallback } from 'react';
import { AISettings, AIProvider, AI_PROVIDERS } from '../types';
import { AIService, loadAISettings, loadAISettingsAsync, saveAISettings } from '../services/aiService';
import { Theme, loadSavedTheme, applyThemeMode, getSavedThemeMode, setupSystemThemeListener } from '../lib/themes';

/**
 * Manages AI settings, the AIService instance, and theme state.
 */
export function useAppSettings() {
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(loadSavedTheme);

  const aiService = useRef(new AIService(aiSettings));

  // Update AI service when settings change
  useEffect(() => {
    aiService.current.updateSettings(aiSettings);
  }, [aiSettings]);

  // Async load local config file (api-config.local.json)
  useEffect(() => {
    loadAISettingsAsync().then(settings => {
      const hasKey = settings.apiKeys
        ? Object.values(settings.apiKeys).some(v => !!v)
        : !!settings.apiKey;
      if (hasKey) {
        setAiSettings(settings);
        aiService.current.updateSettings(settings);
        console.log('已从本地文件加载 API 配置');
      }
    });
  }, []);

  // Apply theme on mount and setup system theme listener
  useEffect(() => {
    const savedMode = getSavedThemeMode();
    applyThemeMode(savedMode);

    const cleanup = setupSystemThemeListener(() => {
      setCurrentTheme(loadSavedTheme());
    });

    return cleanup;
  }, []);

  const handleSettingsChange = useCallback((newSettings: AISettings) => {
    setAiSettings(newSettings);
    saveAISettings(newSettings);
    aiService.current.updateSettings(newSettings);
  }, []);

  const getCurrentModelName = useCallback(() => {
    const provider = AI_PROVIDERS.find(p => p.id === aiSettings.provider);
    const model = provider?.models.find(m => m.id === aiSettings.model);
    return model?.name || aiSettings.model;
  }, [aiSettings.provider, aiSettings.model]);

  const activeProviderApiKey = aiSettings.apiKeys
    ? aiSettings.apiKeys[aiSettings.provider as AIProvider]
    : aiSettings.apiKey;

  return {
    aiSettings,
    aiService,
    showSettings,
    setShowSettings,
    currentTheme,
    setCurrentTheme,
    handleSettingsChange,
    getCurrentModelName,
    activeProviderApiKey,
  };
}

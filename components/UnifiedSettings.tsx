/**
 * Unified Settings Panel
 * 统一设置面板 - 整合 AI 设置、主题、语言等
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Language, AISettings, AI_PROVIDERS, AIProvider } from '../types';
import { Theme, ThemeMode, themeOptions, applyThemeMode, getSavedThemeMode, getThemeForMode } from '../lib/themes';
import { getProviderCompatibility } from './FileUpload';
import { useModelRegistry } from '../hooks/useModelRegistry';
import { EnrichedModelInfo } from '../services/aiService';
import {
  getModelCapabilities,
} from '../lib/llmCapabilities';
import {
  X, Settings, Cpu, Palette, Globe, RotateCcw, AlertTriangle,
  Check, Moon, Sun, Monitor, Key, Search, RefreshCw, Loader2
} from 'lucide-react';

interface Props {
  lang: Language;
  aiSettings: AISettings;
  currentTheme: Theme;
  onAISettingsChange: (settings: AISettings) => void;
  onThemeChange: (theme: Theme) => void;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
  onClose: () => void;
}

type QuickFilter = 'all' | 'recommended' | 'vision' | 'office' | 'longContext';

const translations = {
  en: {
    title: 'Settings',
    aiSettings: 'AI Model',
    aiSettingsDesc: 'Configure AI provider and model',
    provider: 'Provider',
    model: 'Model',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your API key...',
    apiKeyHint: 'Your API key is stored locally and never sent to our servers.',
    theme: 'Theme',
    themeDesc: 'Choose your preferred appearance',
    language: 'Language',
    languageDesc: 'Interface language',
    chinese: 'Chinese',
    english: 'English',
    reset: 'Reset All Data',
    resetDesc: 'Clear all local data and start fresh',
    resetConfirm: 'Are you sure? This will clear all your projects, chat history, and settings.',
    resetButton: 'Reset Everything',
    cancel: 'Cancel',
    connected: 'Connected',
    notConfigured: 'Not configured',
    officeWarningTitle: 'Office document compatibility warning',
    officeWarningDesc: 'The selected model may not support Office files (.docx/.xlsx/.pptx). Please switch model.',
    searchModel: 'Search model by name or ID',
    noSearchResult: 'No model matches current keyword',
    recommended: 'Recommended',
    capabilityOffice: 'Office',
    capabilityPdf: 'PDF',
    capabilityImage: 'Vision',
    capabilityContext: 'Context',
    capabilityTools: 'Tools',
    full: 'Full',
    partial: 'Partial',
    none: 'None',
    refresh: 'Refresh',
    refreshing: 'Refreshing models...',
    loadedCount: 'models loaded',
    fallbackHint: 'Enter API Key to load full model list',
    sourceFallback: 'Using built-in model list',
    sourceApi: 'Using real-time model list',
    filterAll: 'All',
    filterRecommended: 'Recommended',
    filterVision: 'Vision',
    filterOffice: 'Office',
    filterLongContext: 'Long Context',
    openrouterCollapsedHint: 'Showing recommended + search matches only',
    showAll: 'Show all',
    hideAll: 'Collapse',
  },
  cn: {
    title: '设置',
    aiSettings: 'AI 模型',
    aiSettingsDesc: '配置 AI 服务商和模型',
    provider: '服务商',
    model: '模型',
    apiKey: 'API 密钥',
    apiKeyPlaceholder: '输入你的 API Key...',
    apiKeyHint: '密钥仅保存在本地，不会上传到服务器。',
    theme: '主题',
    themeDesc: '选择界面外观',
    language: '语言',
    languageDesc: '界面语言',
    chinese: '中文',
    english: 'English',
    reset: '重置所有数据',
    resetDesc: '清除所有本地数据，重新开始',
    resetConfirm: '确定吗？这将清除所有项目、聊天记录和设置。',
    resetButton: '重置一切',
    cancel: '取消',
    connected: '已连接',
    notConfigured: '未配置',
    officeWarningTitle: 'Office 文档兼容性提示',
    officeWarningDesc: '当前模型可能不支持 Office 文件（.docx/.xlsx/.pptx），请切换模型。',
    searchModel: '按模型名称或 ID 搜索',
    noSearchResult: '没有匹配的模型',
    recommended: '推荐',
    capabilityOffice: 'Office',
    capabilityPdf: 'PDF',
    capabilityImage: '视觉',
    capabilityContext: '上下文',
    capabilityTools: '工具调用',
    full: '完整',
    partial: '部分',
    none: '不支持',
    refresh: '刷新',
    refreshing: '刷新模型中...',
    loadedCount: '个模型已加载',
    fallbackHint: '输入 API Key 获取完整模型列表',
    sourceFallback: '当前为内置模型列表',
    sourceApi: '当前为实时模型列表',
    filterAll: '全部',
    filterRecommended: '推荐',
    filterVision: '视觉',
    filterOffice: 'Office',
    filterLongContext: '长上下文',
    openrouterCollapsedHint: '当前仅展示推荐模型和搜索命中的模型',
    showAll: '显示全部',
    hideAll: '收起',
  }
};

type SettingsTab = 'ai' | 'appearance' | 'reset';

function capabilityText(level: 'full' | 'partial' | 'none', t: (typeof translations)['en'] | (typeof translations)['cn']): string {
  if (level === 'full') return t.full;
  if (level === 'partial') return t.partial;
  return t.none;
}

export default function UnifiedSettings({
  lang,
  aiSettings,
  currentTheme,
  onAISettingsChange,
  onThemeChange,
  onLanguageChange,
  onReset,
  onClose,
}: Props) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(aiSettings.apiKey);
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(getSavedThemeMode);
  const [modelSearch, setModelSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [showAllOpenRouterModels, setShowAllOpenRouterModels] = useState(false);

  const {
    models,
    status: modelStatus,
    error: modelError,
    isUsingFallback,
    refreshModels,
    getCapabilities,
    isRecommended,
  } = useModelRegistry({
    provider: aiSettings.provider as AIProvider,
    apiKey: localApiKey,
    customBaseUrl: aiSettings.customBaseUrl,
  });

  useEffect(() => {
    setLocalApiKey(aiSettings.apiKey);
  }, [aiSettings.apiKey]);

  useEffect(() => {
    setModelSearch('');
    setQuickFilter('all');
    setShowAllOpenRouterModels(false);
  }, [aiSettings.provider]);

  const selectedModelInfo = useMemo(() => models.find((m) => m.id === aiSettings.model), [models, aiSettings.model]);
  const selectedCapabilities = getCapabilities(aiSettings.model, selectedModelInfo);

  const officeMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const officeUnsupported = officeMimeTypes.some((mimeType) =>
    getProviderCompatibility(
      mimeType,
      aiSettings.provider as AIProvider,
      aiSettings.model,
      selectedModelInfo
    ).blockSend
  );

  const modelList = useMemo(() => {
    const keyword = modelSearch.trim().toLowerCase();
    const keywordMatched = (model: EnrichedModelInfo) => (
      !keyword ||
      model.name.toLowerCase().includes(keyword) ||
      model.id.toLowerCase().includes(keyword) ||
      (model.description || '').toLowerCase().includes(keyword)
    );

    const filtered = models.filter((model) => {
      if (!keywordMatched(model)) return false;
      const cap = getCapabilities(model.id, model);
      if (quickFilter === 'recommended') return isRecommended(model.id, model);
      if (quickFilter === 'vision') return cap.image === 'full';
      if (quickFilter === 'office') return cap.office === 'full';
      if (quickFilter === 'longContext') return cap.longContext === 'full';
      return true;
    });

    if (aiSettings.provider !== 'openrouter' || showAllOpenRouterModels || keyword) {
      return filtered;
    }

    return filtered.filter((model) => isRecommended(model.id, model));
  }, [models, modelSearch, quickFilter, aiSettings.provider, showAllOpenRouterModels, getCapabilities, isRecommended]);

  const handleThemeModeChange = (mode: ThemeMode) => {
    setCurrentThemeMode(mode);
    applyThemeMode(mode);
    onThemeChange(getThemeForMode(mode));
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'dark': return <Moon size={18} />;
      case 'light': return <Sun size={18} />;
      case 'system': return <Monitor size={18} />;
    }
  };

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;
    onAISettingsChange({
      ...aiSettings,
      provider: provider.id,
      model: provider.models[0]?.id || '',
    });
  };

  const handleModelChange = (modelId: string) => {
    onAISettingsChange({ ...aiSettings, model: modelId });
  };

  const handleApiKeyBlur = () => {
    if (localApiKey !== aiSettings.apiKey) {
      onAISettingsChange({ ...aiSettings, apiKey: localApiKey });
    }
  };

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
    onClose();
  };

  const tabs = [
    { id: 'ai' as const, icon: <Cpu size={16} />, label: t.aiSettings },
    { id: 'appearance' as const, icon: <Palette size={16} />, label: t.theme },
    { id: 'reset' as const, icon: <RotateCcw size={16} />, label: t.reset },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <Settings size={20} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 p-2 flex flex-col gap-1" style={{ borderRight: '1px solid var(--color-border)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'font-medium' : 'text-muted hover:text-primary'}`}
                style={activeTab === tab.id ? { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' } : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.aiSettings}</h3>
                  <p className="text-xs text-muted mb-4">{t.aiSettingsDesc}</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">{t.provider}</label>
                      <select
                        value={aiSettings.provider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        {AI_PROVIDERS.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name} - {provider.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">{t.apiKey}</label>
                      <div className="relative">
                        <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="password"
                          value={localApiKey}
                          onChange={(e) => setLocalApiKey(e.target.value)}
                          onBlur={handleApiKeyBlur}
                          placeholder={t.apiKeyPlaceholder}
                          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                      </div>
                      <p className="text-[10px] text-muted mt-1.5">{t.apiKeyHint}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-muted">{t.model}</label>
                        <div className="flex items-center gap-2">
                          {modelStatus === 'fetching' ? (
                            <span className="text-[10px] text-muted flex items-center gap-1">
                              <Loader2 size={11} className="animate-spin" />
                              {t.refreshing}
                            </span>
                          ) : modelStatus === 'success' ? (
                            <span className="text-[10px] text-muted">{models.length} {t.loadedCount}</span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => void refreshModels()}
                            className="text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
                          >
                            <RefreshCw size={11} />
                            {t.refresh}
                          </button>
                        </div>
                      </div>

                      <div className="relative mb-2">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          placeholder={t.searchModel}
                          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {[
                          { id: 'all' as const, label: t.filterAll },
                          { id: 'recommended' as const, label: t.filterRecommended },
                          { id: 'vision' as const, label: t.filterVision },
                          { id: 'office' as const, label: t.filterOffice },
                          { id: 'longContext' as const, label: t.filterLongContext },
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => setQuickFilter(chip.id)}
                            className="text-[10px] px-2 py-1 rounded border"
                            style={{
                              borderColor: quickFilter === chip.id ? 'var(--color-accent)' : 'var(--color-border)',
                              color: quickFilter === chip.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                              backgroundColor: quickFilter === chip.id ? 'var(--color-bg-hover)' : 'transparent',
                            }}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      {modelError && (
                        <div className="text-xs mb-2 px-3 py-2 rounded-lg" style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
                          {modelError}
                        </div>
                      )}
                      {!localApiKey && (
                        <div className="text-xs mb-2 px-3 py-2 rounded-lg" style={{ color: 'var(--color-warning)', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                          {t.fallbackHint}
                        </div>
                      )}
                      <div className="text-[10px] text-muted mb-2">
                        {isUsingFallback ? t.sourceFallback : t.sourceApi}
                      </div>

                      <div className="rounded-lg max-h-56 overflow-auto" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                        {modelList.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-muted">{t.noSearchResult}</div>
                        ) : (
                          modelList.map((model) => {
                            const active = aiSettings.model === model.id;
                            const capability = getCapabilities(model.id, model);
                            const recommended = isRecommended(model.id, model);
                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => handleModelChange(model.id)}
                                className="w-full text-left px-3 py-2.5"
                                style={{ backgroundColor: active ? 'var(--color-bg-hover)' : 'transparent', borderBottom: '1px solid var(--color-border)' }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-sm truncate" style={{ color: 'var(--color-text-primary)', fontWeight: recommended ? 700 : 500 }}>
                                      {recommended ? `★ ${model.name}` : model.name}
                                    </div>
                                    <div className="text-micro text-muted truncate">{model.id}</div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {recommended && (
                                      <span className="text-micro px-1.5 py-0.5 rounded" style={{ color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.16)' }}>
                                        {t.recommended}
                                      </span>
                                    )}
                                    <span className="text-micro px-1.5 py-0.5 rounded" style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(59, 130, 246, 0.14)' }}>
                                      {t.capabilityOffice}:{capabilityText(capability.office, t)}
                                    </span>
                                    <span className="text-micro px-1.5 py-0.5 rounded" style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.14)' }}>
                                      {t.capabilityImage}:{capabilityText(capability.image, t)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-micro text-muted mt-1 flex items-center gap-2">
                                  {model.description && <span className="truncate">{model.description}</span>}
                                  <span>{t.capabilityContext}:{capabilityText(capability.longContext, t)}</span>
                                  <span>{t.capabilityTools}:{capabilityText(capability.toolUse, t)}</span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {aiSettings.provider === 'openrouter' && !modelSearch && (
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[10px] text-muted">{t.openrouterCollapsedHint}</p>
                          <button
                            type="button"
                            onClick={() => setShowAllOpenRouterModels((v) => !v)}
                            className="text-[10px] px-2 py-1 rounded border"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
                          >
                            {showAllOpenRouterModels ? t.hideAll : `${t.showAll} ${models.length}`}
                          </button>
                        </div>
                      )}
                    </div>

                    {aiSettings.model && (
                      <div className="text-xs px-3 py-2 rounded-lg flex flex-wrap items-center gap-2" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                        <span>{t.capabilityOffice}: <strong>{capabilityText(selectedCapabilities.office, t)}</strong></span>
                        <span>{t.capabilityPdf}: <strong>{capabilityText(selectedCapabilities.pdf, t)}</strong></span>
                        <span>{t.capabilityImage}: <strong>{capabilityText(selectedCapabilities.image, t)}</strong></span>
                        <span>{t.capabilityContext}: <strong>{capabilityText(selectedCapabilities.longContext, t)}</strong></span>
                        <span>{t.capabilityTools}: <strong>{capabilityText(selectedCapabilities.toolUse, t)}</strong></span>
                      </div>
                    )}

                    {officeUnsupported && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                        <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--color-warning)' }}>{t.officeWarningTitle}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.officeWarningDesc}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: aiSettings.apiKey ? 'var(--color-success)' : 'var(--color-warning)' }} />
                      <span className="text-xs text-muted">{aiSettings.apiKey ? t.connected : t.notConfigured}</span>
                      {selectedModelInfo && (
                        <>
                          <span className="text-muted">•</span>
                          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>{selectedModelInfo.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.theme}</h3>
                  <p className="text-xs text-muted mb-4">{t.themeDesc}</p>

                  <div className="flex flex-col gap-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleThemeModeChange(option.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all"
                        style={{
                          backgroundColor: currentThemeMode === option.id ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                          border: currentThemeMode === option.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        }}
                      >
                        <span style={{ color: currentThemeMode === option.id ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                          {getThemeIcon(option.id)}
                        </span>
                        <span className="flex-1 text-left font-medium" style={{ color: currentThemeMode === option.id ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                          {option.name[lang]}
                        </span>
                        {currentThemeMode === option.id && <Check size={16} style={{ color: 'var(--color-accent)' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.language}</h3>
                  <p className="text-xs text-muted mb-4">{t.languageDesc}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onLanguageChange('cn')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${lang === 'cn' ? 'ring-2' : ''}`}
                      style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', ringColor: 'var(--color-accent)' }}
                    >
                      <Globe size={14} />
                      {t.chinese}
                      {lang === 'cn' && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                    </button>
                    <button
                      onClick={() => onLanguageChange('en')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${lang === 'en' ? 'ring-2' : ''}`}
                      style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', ringColor: 'var(--color-accent)' }}
                    >
                      <Globe size={14} />
                      {t.english}
                      {lang === 'en' && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reset' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-error)' }}>{t.reset}</h3>
                  <p className="text-xs text-muted mb-4">{t.resetDesc}</p>
                </div>

                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-error)' }}
                  >
                    {t.resetButton}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <p className="text-xs" style={{ color: 'var(--color-error)' }}>{t.resetConfirm}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm"
                        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                      >
                        {t.resetButton}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unified Settings Panel
 * 统一设置面板 - 整合 AI 设置、主题、语言等
 */

import React, { useState } from 'react';
import { Language, AISettings, AI_PROVIDERS } from '../types';
import { Theme, themes } from '../lib/themes';
import {
  X, Settings, Cpu, Palette, Globe, RotateCcw, AlertTriangle,
  Check, ChevronDown, ExternalLink, Key
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
    close: 'Close',
    testConnection: 'Test Connection',
    connected: 'Connected',
    notConfigured: 'Not configured',
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
    close: '关闭',
    testConnection: '测试连接',
    connected: '已连接',
    notConfigured: '未配置',
  }
};

type SettingsTab = 'ai' | 'appearance' | 'reset';

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

  const currentProvider = AI_PROVIDERS.find(p => p.id === aiSettings.provider);
  const currentModel = currentProvider?.models.find(m => m.id === aiSettings.model);

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      onAISettingsChange({
        ...aiSettings,
        provider: provider.id,
        model: provider.models[0]?.id || '',
      });
    }
  };

  const handleModelChange = (modelId: string) => {
    onAISettingsChange({
      ...aiSettings,
      model: modelId,
    });
  };

  const handleApiKeyChange = (key: string) => {
    setLocalApiKey(key);
  };

  const handleApiKeyBlur = () => {
    if (localApiKey !== aiSettings.apiKey) {
      onAISettingsChange({
        ...aiSettings,
        apiKey: localApiKey,
      });
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
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <Settings size={20} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div
            className="w-48 p-2 flex flex-col gap-1"
            style={{ borderRight: '1px solid var(--color-border)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'font-medium'
                    : 'text-muted hover:text-primary'
                }`}
                style={
                  activeTab === tab.id
                    ? {
                        backgroundColor: 'var(--color-bg-hover)',
                        color: 'var(--color-text-primary)',
                      }
                    : undefined
                }
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* AI Settings Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t.aiSettings}
                  </h3>
                  <p className="text-xs text-muted mb-4">{t.aiSettingsDesc}</p>

                  {/* Provider Select */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.provider}
                      </label>
                      <select
                        value={aiSettings.provider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {AI_PROVIDERS.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name} - {provider.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Select */}
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.model}
                      </label>
                      <select
                        value={aiSettings.model}
                        onChange={(e) => handleModelChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {currentProvider?.models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} {model.description ? `- ${model.description}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.apiKey}
                      </label>
                      <div className="relative">
                        <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="password"
                          value={localApiKey}
                          onChange={(e) => handleApiKeyChange(e.target.value)}
                          onBlur={handleApiKeyBlur}
                          placeholder={t.apiKeyPlaceholder}
                          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted mt-1.5">{t.apiKeyHint}</p>
                    </div>

                    {/* Status */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-surface)' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: aiSettings.apiKey
                            ? 'var(--color-success)'
                            : 'var(--color-warning)',
                        }}
                      />
                      <span className="text-xs text-muted">
                        {aiSettings.apiKey ? t.connected : t.notConfigured}
                      </span>
                      {currentModel && (
                        <>
                          <span className="text-muted">•</span>
                          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>
                            {currentModel.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t.theme}
                  </h3>
                  <p className="text-xs text-muted mb-4">{t.themeDesc}</p>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(themes).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => onThemeChange(theme)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          currentTheme.id === theme.id ? 'ring-2' : ''
                        }`}
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          ringColor: 'var(--color-accent)',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {theme.name}
                        </span>
                        {currentTheme.id === theme.id && (
                          <Check size={14} style={{ color: 'var(--color-accent)' }} className="ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t.language}
                  </h3>
                  <p className="text-xs text-muted mb-4">{t.languageDesc}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onLanguageChange('cn')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        lang === 'cn' ? 'ring-2' : ''
                      }`}
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        ringColor: 'var(--color-accent)',
                      }}
                    >
                      <Globe size={14} />
                      {t.chinese}
                      {lang === 'cn' && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                    </button>
                    <button
                      onClick={() => onLanguageChange('en')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        lang === 'en' ? 'ring-2' : ''
                      }`}
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        ringColor: 'var(--color-accent)',
                      }}
                    >
                      <Globe size={14} />
                      {t.english}
                      {lang === 'en' && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reset Tab */}
            {activeTab === 'reset' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t.reset}
                  </h3>
                  <p className="text-xs text-muted mb-4">{t.resetDesc}</p>

                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <AlertTriangle size={16} />
                      {t.resetButton}
                    </button>
                  ) : (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{t.resetConfirm}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors"
                          style={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {lang === 'cn' ? '取消' : 'Cancel'}
                        </button>
                        <button
                          onClick={handleReset}
                          className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors bg-red-500 hover:bg-red-600 text-white"
                        >
                          {t.resetButton}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

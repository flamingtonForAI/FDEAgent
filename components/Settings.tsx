import React, { useState, useEffect, useCallback } from 'react';
import { AISettings, AIProvider, AI_PROVIDERS, Language } from '../types';
import { AIService, saveAISettings } from '../services/aiService';
import { Settings as SettingsIcon, Key, Server, Cpu, Check, X, Loader2, Eye, EyeOff, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { getProviderCompatibility } from './FileUpload';
import { getModelCapabilities, isRecommendedModel } from '../lib/llmCapabilities';

// 动态获取的模型类型
interface FetchedModel {
  id: string;
  name: string;
  description?: string;
}

interface SettingsProps {
  lang: Language;
  settings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
  onClose: () => void;
}

const translations = {
  en: {
    title: 'AI Settings',
    subtitle: 'Configure your AI model provider',
    provider: 'Provider',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your API key',
    model: 'Model',
    customUrl: 'Custom Base URL',
    customUrlPlaceholder: 'https://api.example.com/v1',
    customModel: 'Custom Model ID',
    customModelPlaceholder: 'e.g., gpt-4',
    testConnection: 'Test Connection',
    testing: 'Testing...',
    testSuccess: 'Connection successful!',
    testFailed: 'Connection failed',
    save: 'Save Settings',
    cancel: 'Cancel',
    getKey: 'Get API Key',
    showKey: 'Show',
    hideKey: 'Hide',
    noApiKey: 'Please enter API key',
    fetchModels: 'Fetch Models',
    fetchingModels: 'Validating...',
    modelsLoaded: 'models loaded',
    fetchFailed: 'Failed to fetch models',
    selectModel: 'Select a model',
    noModels: 'No models available',
    refresh: 'Refresh',
    apiKeyValid: 'API Key valid',
    apiKeyInvalid: 'API Key invalid',
    officeWarning: 'Selected model may not support Office files (.docx/.xlsx/.pptx). Consider switching model or converting files to PDF/text.',
    searchModel: 'Search model by name or ID',
    noSearchResult: 'No model matches current keyword',
    recommended: 'Recommended',
    capabilityOffice: 'Office',
    capabilityPdf: 'PDF',
    capabilityImage: 'Image',
    full: 'Full',
    partial: 'Partial',
    none: 'None',
  },
  cn: {
    title: 'AI 设置',
    subtitle: '配置你的AI模型提供商',
    provider: '服务商',
    apiKey: 'API 密钥',
    apiKeyPlaceholder: '输入你的API密钥',
    model: '模型',
    customUrl: '自定义接口地址',
    customUrlPlaceholder: 'https://api.example.com/v1',
    customModel: '自定义模型ID',
    customModelPlaceholder: '例如：gpt-4',
    testConnection: '测试连接',
    testing: '测试中...',
    testSuccess: '连接成功！',
    testFailed: '连接失败',
    save: '保存设置',
    cancel: '取消',
    getKey: '获取密钥',
    showKey: '显示',
    hideKey: '隐藏',
    noApiKey: '请输入API密钥',
    fetchModels: '获取模型列表',
    fetchingModels: '验证中...',
    modelsLoaded: '个模型已加载',
    fetchFailed: '获取模型列表失败',
    selectModel: '请选择模型',
    noModels: '暂无可用模型',
    refresh: '刷新',
    apiKeyValid: '密钥有效',
    apiKeyInvalid: '密钥无效',
    officeWarning: '当前模型可能不支持 Office 文件（.docx/.xlsx/.pptx），建议切换模型或先转为 PDF/文本。',
    searchModel: '按模型名称或 ID 搜索',
    noSearchResult: '没有匹配的模型',
    recommended: '推荐',
    capabilityOffice: 'Office',
    capabilityPdf: 'PDF',
    capabilityImage: '图像',
    full: '完整',
    partial: '部分',
    none: '不支持',
  }
};

const providerLinks: Record<AIProvider, string> = {
  gemini: 'https://aistudio.google.com/apikey',
  openrouter: 'https://openrouter.ai/keys',
  zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
  moonshot: 'https://platform.moonshot.cn/console/api-keys',
  openai: 'https://platform.openai.com/api-keys',
  custom: '',
};

const Settings: React.FC<SettingsProps> = ({ lang, settings, onSettingsChange, onClose }) => {
  const t = translations[lang];

  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // 动态模型列表状态
  const [fetchedModels, setFetchedModels] = useState<FetchedModel[]>([]);
  const [modelFetchStatus, setModelFetchStatus] = useState<'idle' | 'fetching' | 'success' | 'failed'>('idle');
  const [modelFetchError, setModelFetchError] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const currentProvider = AI_PROVIDERS.find(p => p.id === localSettings.provider);
  const officeMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const officeUnsupported = officeMimeTypes.some((mimeType) =>
    getProviderCompatibility(mimeType, localSettings.provider, localSettings.model).blockSend
  );
  const selectedCapabilities = getModelCapabilities(localSettings.provider, localSettings.model);
  const searchableModels = fetchedModels.filter((model) => {
    const keyword = modelSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      model.name.toLowerCase().includes(keyword) ||
      model.id.toLowerCase().includes(keyword) ||
      (model.description || '').toLowerCase().includes(keyword)
    );
  });

  // 获取模型列表
  const fetchModels = useCallback(async () => {
    if (!localSettings.apiKey) {
      setModelFetchStatus('failed');
      setModelFetchError(t.noApiKey);
      return;
    }

    // 对于 custom provider，需要先填写 baseUrl
    if (localSettings.provider === 'custom' && !localSettings.customBaseUrl) {
      setFetchedModels([{ id: 'custom', name: '自定义模型', description: '请先输入接口地址' }]);
      setModelFetchStatus('success');
      return;
    }

    setModelFetchStatus('fetching');
    setModelFetchError('');

    try {
      const aiService = new AIService(localSettings);
      const models = await aiService.fetchAvailableModels();
      setFetchedModels(models);
      setModelFetchStatus('success');

      // 如果当前选中的模型不在列表中，自动选择第一个
      if (models.length > 0 && !models.find(m => m.id === localSettings.model)) {
        setLocalSettings(prev => ({ ...prev, model: models[0].id }));
      }
    } catch (error) {
      setModelFetchStatus('failed');
      setModelFetchError(error instanceof Error ? error.message : t.fetchFailed);
    }
  }, [localSettings.apiKey, localSettings.provider, localSettings.customBaseUrl, t]);

  // 当 provider 改变时，重置模型列表状态
  useEffect(() => {
    setFetchedModels([]);
    setModelFetchStatus('idle');
    setModelFetchError('');
    setTestStatus('idle');
    setLocalSettings(prev => ({ ...prev, model: '' }));
    setModelSearch('');
  }, [localSettings.provider]);

  // 当 API Key 输入后自动获取模型列表（延迟验证，避免每次按键都请求）
  useEffect(() => {
    if (!localSettings.apiKey || localSettings.apiKey.length < 10) {
      return;
    }

    // 防抖：用户停止输入 800ms 后自动获取模型
    const timer = setTimeout(() => {
      if (modelFetchStatus === 'idle' || modelFetchStatus === 'failed') {
        fetchModels();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [localSettings.apiKey]);

  const handleProviderChange = (provider: AIProvider) => {
    setLocalSettings(prev => ({
      ...prev,
      provider,
      model: '',
      customBaseUrl: provider === 'custom' ? prev.customBaseUrl : undefined,
    }));
    setTestStatus('idle');
    setFetchedModels([]);
    setModelFetchStatus('idle');
  };

  const handleTestConnection = async () => {
    if (!localSettings.apiKey) {
      setTestStatus('failed');
      setTestMessage(t.noApiKey);
      return;
    }

    setTestStatus('testing');
    const aiService = new AIService(localSettings);
    const result = await aiService.testConnection();

    if (result.success) {
      setTestStatus('success');
      setTestMessage(result.message);
    } else {
      setTestStatus('failed');
      setTestMessage(result.message);
    }
  };

  const handleSave = async () => {
    await saveAISettings(localSettings);
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-bg-base)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ backgroundColor: 'var(--color-bg-elevated)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div className="p-6" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
              <SettingsIcon size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
              <p className="text-xs text-muted">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">
              <Server size={12} className="inline mr-1" />
              {t.provider}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AI_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className="p-3 rounded-lg border text-left transition-all"
                  style={{
                    backgroundColor: localSettings.provider === provider.id ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                    borderColor: localSettings.provider === provider.id ? 'var(--color-accent)' : 'var(--color-border)',
                    color: localSettings.provider === provider.id ? 'var(--color-accent)' : 'var(--color-text-muted)'
                  }}
                >
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-micro text-muted mt-0.5">{provider.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                <Key size={12} className="inline mr-1" />
                {t.apiKey}
              </label>
              <div className="flex items-center gap-2">
                {/* API Key 验证状态 */}
                {localSettings.apiKey && localSettings.apiKey.length >= 10 && (
                  <span className="text-micro flex items-center gap-1">
                    {modelFetchStatus === 'fetching' && (
                      <>
                        <Loader2 size={10} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>{t.fetchingModels}</span>
                      </>
                    )}
                    {modelFetchStatus === 'success' && (
                      <>
                        <Check size={10} style={{ color: 'var(--color-success)' }} />
                        <span style={{ color: 'var(--color-success)' }}>{t.apiKeyValid}</span>
                      </>
                    )}
                    {modelFetchStatus === 'failed' && (
                      <>
                        <X size={10} style={{ color: 'var(--color-error)' }} />
                        <span style={{ color: 'var(--color-error)' }}>{t.apiKeyInvalid}</span>
                      </>
                    )}
                  </span>
                )}
                {providerLinks[localSettings.provider] && (
                  <a
                    href={providerLinks[localSettings.provider]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-micro flex items-center gap-1"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {t.getKey}
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localSettings.apiKey}
                onChange={e => {
                  setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }));
                  // 重置验证状态
                  if (modelFetchStatus !== 'idle') {
                    setModelFetchStatus('idle');
                    setFetchedModels([]);
                  }
                }}
                placeholder={t.apiKeyPlaceholder}
                className="w-full rounded-lg px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-1 pr-20"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: modelFetchStatus === 'success' ? 'var(--color-success)' : modelFetchStatus === 'failed' ? 'var(--color-error)' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary text-xs flex items-center gap-1"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                {showApiKey ? t.hideKey : t.showKey}
              </button>
            </div>
          </div>

          {/* Custom URL (for custom provider) */}
          {localSettings.provider === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">
                {t.customUrl}
              </label>
              <input
                type="text"
                value={localSettings.customBaseUrl || ''}
                onChange={e => setLocalSettings(prev => ({ ...prev, customBaseUrl: e.target.value }))}
                placeholder={t.customUrlPlaceholder}
                className="w-full rounded-lg px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          )}

          {/* Model Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                <Cpu size={12} className="inline mr-1" />
                {t.model}
              </label>
              <div className="flex items-center gap-2">
                {modelFetchStatus === 'success' && fetchedModels.length > 0 && (
                  <span className="text-micro" style={{ color: 'var(--color-success)' }}>
                    {fetchedModels.length} {t.modelsLoaded}
                  </span>
                )}
                {/* 刷新按钮 - OpenRouter 除外（模型太多） */}
                {localSettings.provider !== 'openrouter' && localSettings.apiKey && modelFetchStatus !== 'fetching' && (
                  <button
                    onClick={fetchModels}
                    className="flex items-center gap-1 px-2 py-1 rounded text-micro transition-all hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-accent)' }}
                    title={t.refresh}
                  >
                    <RefreshCw size={12} />
                    {lang === 'cn' ? '刷新' : 'Refresh'}
                  </button>
                )}
              </div>
            </div>

            {/* 未获取模型列表时显示获取按钮 */}
            {modelFetchStatus === 'idle' && (
              <button
                onClick={fetchModels}
                disabled={!localSettings.apiKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
              >
                <RefreshCw size={14} />
                {t.fetchModels}
              </button>
            )}

            {/* 获取中 */}
            {modelFetchStatus === 'fetching' && (
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm text-muted" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                <Loader2 size={14} className="animate-spin" />
                {t.fetchingModels}
              </div>
            )}

            {/* 获取失败 */}
            {modelFetchStatus === 'failed' && (
              <div className="space-y-2">
                <div className="text-xs mb-2" style={{ color: 'var(--color-error)' }}>{modelFetchError}</div>
                <button
                  onClick={fetchModels}
                  disabled={!localSettings.apiKey}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                >
                  <RefreshCw size={14} />
                  {t.refresh}
                </button>
              </div>
            )}

            {/* 获取成功，显示模型选择 */}
            {modelFetchStatus === 'success' && (
              <div className="space-y-2">
                {localSettings.provider === 'custom' && fetchedModels.length === 1 && fetchedModels[0].id === 'custom' ? (
                  // 自定义 provider 且无法获取模型列表时，允许手动输入
                  <input
                    type="text"
                    value={localSettings.model}
                    onChange={e => setLocalSettings(prev => ({ ...prev, model: e.target.value }))}
                    placeholder={t.customModelPlaceholder}
                    className="w-full rounded-lg px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-1"
                    style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                ) : fetchedModels.length > 0 ? (
                  <>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder={t.searchModel}
                        className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-1"
                        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <div
                      className="rounded-lg overflow-auto max-h-64"
                      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
                    >
                      {searchableModels.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-muted">{t.noSearchResult}</div>
                      ) : (
                        searchableModels.map((model) => {
                          const active = localSettings.model === model.id;
                          const recommended = isRecommendedModel(localSettings.provider, model.id);
                          const capability = getModelCapabilities(localSettings.provider, model.id);

                          const officeText = capability.office === 'full'
                            ? t.full
                            : capability.office === 'partial'
                              ? t.partial
                              : t.none;
                          const pdfText = capability.pdf === 'full'
                            ? t.full
                            : capability.pdf === 'partial'
                              ? t.partial
                              : t.none;

                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => setLocalSettings(prev => ({ ...prev, model: model.id }))}
                              className="w-full text-left px-3 py-2.5 transition-colors"
                              style={{
                                backgroundColor: active ? 'var(--color-bg-hover)' : 'transparent',
                                borderBottom: '1px solid var(--color-border)',
                              }}
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
                                    {t.capabilityOffice}:{officeText}
                                  </span>
                                  <span className="text-micro px-1.5 py-0.5 rounded" style={{ color: 'var(--color-warning)', backgroundColor: 'rgba(245, 158, 11, 0.14)' }}>
                                    {t.capabilityPdf}:{pdfText}
                                  </span>
                                </div>
                              </div>
                              {model.description && <div className="text-micro text-muted mt-1 truncate">{model.description}</div>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted py-3">{t.noModels}</div>
                )}
                {localSettings.model && (
                  <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-2" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                    <span>{t.capabilityOffice}: <strong>{selectedCapabilities.office === 'full' ? t.full : selectedCapabilities.office === 'partial' ? t.partial : t.none}</strong></span>
                    <span>{t.capabilityPdf}: <strong>{selectedCapabilities.pdf === 'full' ? t.full : selectedCapabilities.pdf === 'partial' ? t.partial : t.none}</strong></span>
                    <span>{t.capabilityImage}: <strong>{selectedCapabilities.image === 'full' ? t.full : selectedCapabilities.image === 'partial' ? t.partial : t.none}</strong></span>
                  </div>
                )}
                {officeUnsupported && (
                  <div className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--color-warning)', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                    {t.officeWarning}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !localSettings.apiKey}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
            >
              {testStatus === 'testing' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : testStatus === 'success' ? (
                <Check size={14} style={{ color: 'var(--color-success)' }} />
              ) : testStatus === 'failed' ? (
                <X size={14} style={{ color: 'var(--color-error)' }} />
              ) : null}
              {testStatus === 'testing' ? t.testing : t.testConnection}
            </button>
            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <span className="text-xs" style={{ color: testStatus === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}>
                {testStatus === 'success' ? t.testSuccess : testMessage}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-end gap-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!localSettings.apiKey || !localSettings.model}
            className="px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all btn-gradient"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect, useCallback } from 'react';
import { AISettings, AIProvider, AI_PROVIDERS, Language } from '../types';
import { AIService, saveAISettings } from '../services/aiService';
import { Settings as SettingsIcon, Key, Server, Cpu, Check, X, Loader2, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';

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
    fetchingModels: 'Fetching...',
    modelsLoaded: 'models loaded',
    fetchFailed: 'Failed to fetch models',
    selectModel: 'Select a model',
    noModels: 'No models available',
    refresh: 'Refresh',
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
    fetchingModels: '获取中...',
    modelsLoaded: '个模型已加载',
    fetchFailed: '获取模型列表失败',
    selectModel: '请选择模型',
    noModels: '暂无可用模型',
    refresh: '刷新',
  }
};

const providerLinks: Record<AIProvider, string> = {
  gemini: 'https://aistudio.google.com/apikey',
  openrouter: 'https://openrouter.ai/keys',
  zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
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

  const currentProvider = AI_PROVIDERS.find(p => p.id === localSettings.provider);

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

  // 当 provider 或 apiKey 改变时，重置模型列表状态
  useEffect(() => {
    setFetchedModels([]);
    setModelFetchStatus('idle');
    setModelFetchError('');
    setLocalSettings(prev => ({ ...prev, model: '' }));
  }, [localSettings.provider]);

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

  const handleSave = () => {
    saveAISettings(localSettings);
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-bg-base)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
              <SettingsIcon size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{t.title}</h2>
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
                  className={`p-3 rounded-lg border text-left transition-all ${localSettings.provider === provider.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
                    }`}
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
              {providerLinks[localSettings.provider] && (
                <a
                  href={providerLinks[localSettings.provider]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-micro text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {t.getKey}
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localSettings.apiKey}
                onChange={e => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-[#1c2128] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-20"
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
                className="w-full bg-[#1c2128] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              {modelFetchStatus === 'success' && fetchedModels.length > 0 && (
                <span className="text-micro text-green-400">
                  {fetchedModels.length} {t.modelsLoaded}
                </span>
              )}
            </div>

            {/* 未获取模型列表时显示获取按钮 */}
            {modelFetchStatus === 'idle' && (
              <button
                onClick={fetchModels}
                disabled={!localSettings.apiKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-sm text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw size={14} />
                {t.fetchModels}
              </button>
            )}

            {/* 获取中 */}
            {modelFetchStatus === 'fetching' && (
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1c2128] border border-white/10 rounded-lg text-sm text-muted">
                <Loader2 size={14} className="animate-spin" />
                {t.fetchingModels}
              </div>
            )}

            {/* 获取失败 */}
            {modelFetchStatus === 'failed' && (
              <div className="space-y-2">
                <div className="text-xs text-red-400 mb-2">{modelFetchError}</div>
                <button
                  onClick={fetchModels}
                  disabled={!localSettings.apiKey}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 border border-red-500/30 rounded-lg text-sm text-red-300 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    className="w-full bg-[#1c2128] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ) : fetchedModels.length > 0 ? (
                  <div className="relative">
                    <select
                      value={localSettings.model}
                      onChange={e => setLocalSettings(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full bg-[#1c2128] border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className="bg-[#1c2128] text-muted">{t.selectModel}</option>
                      {fetchedModels.map(model => (
                        <option key={model.id} value={model.id} className="bg-[#1c2128] text-white">
                          {model.name} {model.description && `- ${model.description}`}
                        </option>
                      ))}
                    </select>
                    {/* 刷新按钮 */}
                    <button
                      onClick={fetchModels}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-secondary transition-colors"
                      title={t.refresh}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-muted py-3">{t.noModels}</div>
                )}
              </div>
            )}
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !localSettings.apiKey}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-secondary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {testStatus === 'testing' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : testStatus === 'success' ? (
                <Check size={14} className="text-green-400" />
              ) : testStatus === 'failed' ? (
                <X size={14} className="text-red-400" />
              ) : null}
              {testStatus === 'testing' ? t.testing : t.testConnection}
            </button>
            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <span className={`text-xs ${testStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {testStatus === 'success' ? t.testSuccess : testMessage}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!localSettings.apiKey || !localSettings.model}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

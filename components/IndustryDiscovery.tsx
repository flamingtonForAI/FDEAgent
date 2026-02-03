/**
 * Industry Discovery Component
 * 行业发现组件
 *
 * 智能行业原型导入引擎的主界面
 * 支持用户输入行业名称，自动搜索和 AI 生成原型
 */

import React, { useState, useCallback } from 'react';
import {
  Search, Loader2, CheckCircle, Circle, AlertCircle, X,
  Package, Database, Zap, Layers, Bot, RefreshCw
} from 'lucide-react';
import { Language, AISettings } from '../types';
import { Archetype, ArchetypeOrigin } from '../types/archetype';
import {
  ArchetypeGeneratorService,
  GenerationProgress,
  GenerationStep,
  createArchetypeGeneratorService
} from '../services/archetypeGeneratorService';
import { archetypeStorageService } from '../services/archetypeStorageService';
import { SourceBadge } from './SourceBadge';

interface Props {
  lang: Language;
  aiSettings: AISettings;
  onClose: () => void;
  onImported: (archetypeId: string) => void;
}

const translations = {
  en: {
    title: 'Explore New Industry',
    subtitle: 'Generate industry archetype with AI',
    industryName: 'Industry Name',
    industryNamePlaceholder: 'e.g., Smart Pig Farming',
    description: 'Description (Optional)',
    descriptionPlaceholder: 'Include breeding, feeding, slaughtering...',
    generate: 'Generate Archetype',
    generating: 'Generating...',
    cancel: 'Cancel',
    import: 'Import Archetype',
    retry: 'Retry',
    preview: 'Preview',
    objects: 'Objects',
    actions: 'Actions',
    workflows: 'Workflows',
    connectors: 'Connectors',
    coreObjects: 'Core Objects',
    source: 'Source',
    model: 'Model',
    progress: {
      searching: 'Searching web references...',
      fetching: 'Fetching content...',
      generating: 'AI generating archetype...',
      validating: 'Validating structure...',
      completed: 'Generation completed!',
      error: 'Generation failed',
    },
    errors: {
      noIndustryName: 'Please enter an industry name',
      generationFailed: 'Failed to generate archetype',
      saveFailed: 'Failed to save archetype',
    },
    success: {
      imported: 'Archetype imported successfully!',
    },
    methodology: {
      hint: 'Importing an archetype accelerates discovery and takes you directly to the Model phase',
      postImport: 'Archetype imported! You are now in the Model phase to customize.',
    },
  },
  cn: {
    title: '探索新行业',
    subtitle: '使用 AI 生成行业原型',
    industryName: '行业名称',
    industryNamePlaceholder: '例如：智能养猪行业',
    description: '描述说明（可选）',
    descriptionPlaceholder: '包括育种、饲养、屠宰等环节...',
    generate: '生成原型',
    generating: '生成中...',
    cancel: '取消',
    import: '导入原型',
    retry: '重试',
    preview: '预览',
    objects: '对象',
    actions: '动作',
    workflows: '工作流',
    connectors: '连接器',
    coreObjects: '核心对象',
    source: '来源',
    model: '模型',
    progress: {
      searching: '搜索网络参考资料...',
      fetching: '获取内容...',
      generating: 'AI 生成原型...',
      validating: '验证结构...',
      completed: '生成完成！',
      error: '生成失败',
    },
    errors: {
      noIndustryName: '请输入行业名称',
      generationFailed: '原型生成失败',
      saveFailed: '原型保存失败',
    },
    success: {
      imported: '原型导入成功！',
    },
    methodology: {
      hint: '导入原型是发现阶段的加速器，将直接进入建模阶段',
      postImport: '原型已导入！现在进入建模阶段进行定制。',
    },
  }
};

const stepOrder: GenerationStep[] = ['searching', 'fetching', 'generating', 'validating', 'completed'];

const IndustryDiscovery: React.FC<Props> = ({
  lang,
  aiSettings,
  onClose,
  onImported
}) => {
  const t = translations[lang];

  // 表单状态
  const [industryName, setIndustryName] = useState('');
  const [description, setDescription] = useState('');

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressDetails, setProgressDetails] = useState('');

  // 结果状态
  const [generatedArchetype, setGeneratedArchetype] = useState<Archetype | null>(null);
  const [generatedOrigin, setGeneratedOrigin] = useState<ArchetypeOrigin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  // 导入状态
  const [isImporting, setIsImporting] = useState(false);

  /**
   * 处理进度更新
   */
  const handleProgress = useCallback((progressInfo: GenerationProgress) => {
    setCurrentStep(progressInfo.step);
    setProgress(progressInfo.progress);
    setProgressMessage(progressInfo.message);
    setProgressDetails(progressInfo.details || '');
  }, []);

  /**
   * 生成原型
   */
  const handleGenerate = async () => {
    if (!industryName.trim()) {
      setError(t.errors.noIndustryName);
      return;
    }

    setError(null);
    setWarnings([]);
    setIsGenerating(true);
    setGeneratedArchetype(null);
    setGeneratedOrigin(null);
    setCurrentStep('searching');
    setProgress(0);

    try {
      const service = createArchetypeGeneratorService(aiSettings);
      const result = await service.generateArchetype(
        industryName.trim(),
        description.trim(),
        handleProgress
      );

      if (result.success && result.archetype && result.origin) {
        setGeneratedArchetype(result.archetype);
        setGeneratedOrigin(result.origin);
        if (result.warnings) {
          setWarnings(result.warnings);
        }
      } else {
        setError(result.error || t.errors.generationFailed);
        setCurrentStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generationFailed);
      setCurrentStep('error');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 导入生成的原型
   */
  const handleImport = async () => {
    if (!generatedArchetype || !generatedOrigin) return;

    setIsImporting(true);
    setError(null);

    try {
      await archetypeStorageService.initialize();
      const id = await archetypeStorageService.saveArchetype(generatedArchetype, generatedOrigin);
      onImported(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.saveFailed);
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * 重置状态
   */
  const handleRetry = () => {
    setGeneratedArchetype(null);
    setGeneratedOrigin(null);
    setError(null);
    setWarnings([]);
    setCurrentStep(null);
    setProgress(0);
  };

  /**
   * 渲染进度步骤
   */
  const renderProgressStep = (step: GenerationStep, index: number) => {
    const currentIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;
    const stepIndex = stepOrder.indexOf(step);

    let status: 'pending' | 'active' | 'completed' | 'error' = 'pending';
    if (currentStep === 'error' && stepIndex <= currentIndex) {
      status = stepIndex === currentIndex ? 'error' : 'completed';
    } else if (stepIndex < currentIndex) {
      status = 'completed';
    } else if (stepIndex === currentIndex) {
      status = 'active';
    }

    const stepLabels = {
      searching: t.progress.searching,
      fetching: t.progress.fetching,
      generating: t.progress.generating,
      validating: t.progress.validating,
      completed: t.progress.completed,
      error: t.progress.error,
    };

    return (
      <div key={step} className="flex items-center gap-2">
        {status === 'completed' && (
          <CheckCircle size={16} className="text-green-500" />
        )}
        {status === 'active' && (
          <Loader2 size={16} className="text-amber-500 animate-spin" />
        )}
        {status === 'pending' && (
          <Circle size={16} className="text-muted" />
        )}
        {status === 'error' && (
          <AlertCircle size={16} className="text-red-500" />
        )}
        <span
          className={`text-sm ${
            status === 'active' ? 'text-primary font-medium' :
            status === 'completed' ? 'text-green-500' :
            status === 'error' ? 'text-red-500' :
            'text-muted'
          }`}
        >
          {index + 1}. {stepLabels[step]}
        </span>
      </div>
    );
  };

  /**
   * 渲染预览面板
   */
  const renderPreview = () => {
    if (!generatedArchetype) return null;

    const stats = {
      objects: generatedArchetype.ontology.objects.length,
      actions: generatedArchetype.ontology.objects.reduce(
        (sum, obj) => sum + (obj.actions?.length || 0), 0
      ),
      workflows: generatedArchetype.workflows.length,
      connectors: generatedArchetype.connectors.length,
    };

    const coreObjects = generatedArchetype.ontology.objects
      .slice(0, 5)
      .map(obj => obj.name)
      .join('、');

    return (
      <div
        className="mt-4 p-4 rounded-xl"
        style={{
          backgroundColor: 'var(--color-bg-hover)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* 标题和来源 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={20} style={{ color: 'var(--color-accent)' }} />
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {generatedArchetype.metadata.name}
              </h3>
              <p className="text-xs text-muted">
                {generatedArchetype.metadata.description[lang === 'cn' ? 'cn' : 'en']}
              </p>
            </div>
          </div>
        </div>

        {/* 来源信息 */}
        {generatedOrigin && (
          <div className="mb-3">
            <SourceBadge origin={generatedOrigin} lang={lang} showDetails />
          </div>
        )}

        {/* 统计 */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <StatItem icon={<Database size={14} />} value={stats.objects} label={t.objects} />
          <StatItem icon={<Zap size={14} />} value={stats.actions} label={t.actions} />
          <StatItem icon={<Layers size={14} />} value={stats.workflows} label={t.workflows} />
          <StatItem icon={<Search size={14} />} value={stats.connectors} label={t.connectors} />
        </div>

        {/* 核心对象 */}
        <div className="text-xs">
          <span className="text-muted">{t.coreObjects}: </span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{coreObjects}...</span>
        </div>

        {/* 警告 */}
        {warnings.length > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="text-xs text-amber-400">
              {warnings.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg-hover)' }}
            >
              <Search size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t.title}
              </h2>
              <p className="text-xs text-muted">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* 方法论提示 */}
          <div
            className="mb-4 px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
            style={{
              backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
              color: 'var(--color-accent)',
            }}
          >
            <Layers size={14} />
            <span>{t.methodology.hint}</span>
          </div>

          {/* 输入表单 */}
          <div className="space-y-4">
            {/* 行业名称 */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                {t.industryName} *
              </label>
              <input
                type="text"
                value={industryName}
                onChange={(e) => setIndustryName(e.target.value)}
                placeholder={t.industryNamePlaceholder}
                disabled={isGenerating}
                className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 disabled:opacity-50"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                {t.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                disabled={isGenerating}
                rows={3}
                className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 disabled:opacity-50 resize-none"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* 进度显示 */}
          {(isGenerating || currentStep) && (
            <div
              className="mt-5 p-4 rounded-xl"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="space-y-2">
                {stepOrder.slice(0, 4).map((step, index) => renderProgressStep(step, index))}
              </div>

              {/* 进度条 */}
              <div className="mt-3">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: currentStep === 'error' ? 'rgb(239, 68, 68)' : 'var(--color-accent)',
                    }}
                  />
                </div>
                {progressDetails && (
                  <p className="text-xs text-muted mt-1.5">{progressDetails}</p>
                )}
              </div>
            </div>
          )}

          {/* 错误显示 */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* 预览面板 */}
          {generatedArchetype && renderPreview()}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg glass-surface text-sm text-secondary hover:text-primary transition-colors"
          >
            {t.cancel}
          </button>

          {generatedArchetype ? (
            <>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-surface text-sm text-secondary hover:text-primary transition-colors"
              >
                <RefreshCw size={14} />
                {t.retry}
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg btn-gradient text-sm font-medium disabled:opacity-50"
              >
                {isImporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Package size={14} />
                )}
                {t.import}
              </button>
            </>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !industryName.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg btn-gradient text-sm font-medium disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Bot size={14} />
                  {t.generate}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 统计项组件
 */
const StatItem: React.FC<{
  icon: React.ReactNode;
  value: number;
  label: string;
}> = ({ icon, value, label }) => (
  <div
    className="text-center p-2 rounded-lg"
    style={{ backgroundColor: 'var(--color-bg-base)' }}
  >
    <div className="flex items-center justify-center gap-1 text-muted mb-0.5">
      {icon}
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </span>
    </div>
    <span className="text-[10px] text-muted uppercase tracking-wide">{label}</span>
  </div>
);

export default IndustryDiscovery;

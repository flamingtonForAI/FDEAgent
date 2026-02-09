/**
 * Archetype Browser Component
 * 原型浏览器组件
 *
 * 展示可用的行业原型，支持筛选、搜索和应用
 * 支持静态原型和导入的原型（AI 生成 / 参考资料）
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Language, AISettings } from '../types';
import { Archetype, ArchetypeIndex, ArchetypeOriginType, ArchetypeOrigin } from '../types/archetype';
import {
  getArchetypeIndexList,
  getMergedArchetypeIndexList,
  getMergedArchetypeById,
  deleteImportedArchetype
} from '../content/archetypes';
import { archetypeStorageService } from '../services/archetypeStorageService';
import {
  Package, Search, Filter, Factory, ShoppingCart, Truck,
  Database, Zap, Clock, ChevronRight,
  GitBranch, LayoutDashboard, ArrowRight, Plus, Trash2,
  Heart, Plane, Stethoscope, Wheat, Loader2, Layers, CheckCircle,
  Download, Upload
} from 'lucide-react';
import { SourceIndicator } from './SourceBadge';
import IndustryDiscovery from './IndustryDiscovery';

interface Props {
  lang: Language;
  aiSettings?: AISettings;
  onSelectArchetype: (archetypeId: string) => void;
  onApplyArchetype: (archetypeId: string, skipConfirm?: boolean) => void;
}

const translations = {
  en: {
    title: 'Template Library',
    subtitle: 'Production-ready industry solutions from FDE experience',
    search: 'Search templates...',
    filter: 'Filter',
    allIndustries: 'All Industries',
    allSources: 'All Sources',
    sourceBuiltin: 'Built-in',
    sourceAI: 'AI Generated',
    sourceRef: 'Reference',
    objects: 'Objects',
    actions: 'Actions',
    connectors: 'Connectors',
    workflows: 'Workflows',
    dashboards: 'Dashboards',
    deployTime: 'Deploy Time',
    deployments: 'Deployments',
    viewDetails: 'View Details',
    useArchetype: 'Use This Template',
    noResults: 'No templates match your search',
    features: 'Features',
    aiEnabled: 'AI-Enabled',
    erpIntegration: 'ERP Integration',
    iotEnabled: 'IoT Enabled',
    aiGenerated: 'AI Generated',
    fromReference: 'From Reference',
    exploreNew: 'Explore New Industry',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this template?',
    loading: 'Loading templates...',
    importSuccess: 'Template imported! You are now in the Model phase to customize.',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    exportSuccess: 'Template exported successfully!',
    importError: 'Failed to import template',
    invalidJson: 'Invalid JSON file format',
    validationMissingId: 'Missing template ID',
    validationMissingName: 'Missing template name',
    validationMissingOntology: 'Missing ontology definition',
    validationEmptyObjects: 'Ontology must contain at least one object',
    validationInvalidObjects: 'Invalid object structure in ontology',
  },
  cn: {
    title: '模板库',
    subtitle: '来自FDE实战经验的可部署行业方案',
    search: '搜索模板...',
    filter: '筛选',
    allIndustries: '所有行业',
    allSources: '所有来源',
    sourceBuiltin: '内置',
    sourceAI: 'AI 生成',
    sourceRef: '参考资料',
    objects: '对象',
    actions: '动作',
    connectors: '连接器',
    workflows: '工作流',
    dashboards: '仪表盘',
    deployTime: '部署周期',
    deployments: '部署案例',
    viewDetails: '查看详情',
    useArchetype: '使用此模板',
    noResults: '没有匹配的模板',
    features: '特性',
    aiEnabled: 'AI赋能',
    erpIntegration: 'ERP集成',
    iotEnabled: 'IoT支持',
    aiGenerated: 'AI 生成',
    fromReference: '参考资料',
    exploreNew: '探索新行业',
    delete: '删除',
    deleteConfirm: '确定要删除这个模板吗？',
    loading: '加载模板中...',
    importSuccess: '模板已导入！现在进入建模阶段进行定制。',
    exportJson: '导出 JSON',
    importJson: '导入 JSON',
    exportSuccess: '模板导出成功！',
    importError: '导入失败',
    invalidJson: 'JSON 文件格式无效',
    validationMissingId: '缺少模板 ID',
    validationMissingName: '缺少模板名称',
    validationMissingOntology: '缺少本体定义',
    validationEmptyObjects: '本体必须至少包含一个对象',
    validationInvalidObjects: '本体中对象结构无效',
  }
};

const industryConfig: Record<string, { icon: React.ReactNode; color: string; label: { en: string; cn: string } }> = {
  manufacturing: {
    icon: <Factory size={16} />,
    color: 'blue',
    label: { en: 'Manufacturing', cn: '制造业' }
  },
  retail: {
    icon: <ShoppingCart size={16} />,
    color: 'emerald',
    label: { en: 'Retail', cn: '零售业' }
  },
  logistics: {
    icon: <Truck size={16} />,
    color: 'amber',
    label: { en: 'Logistics', cn: '物流业' }
  },
  healthcare: {
    icon: <Stethoscope size={16} />,
    color: 'red',
    label: { en: 'Healthcare', cn: '医疗健康' }
  },
  agriculture: {
    icon: <Wheat size={16} />,
    color: 'green',
    label: { en: 'Agriculture', cn: '农业' }
  },
  aviation: {
    icon: <Plane size={16} />,
    color: 'sky',
    label: { en: 'Aviation', cn: '航空' }
  },
  // New industries based on Palantir case studies
  defense: {
    icon: <Package size={16} />,
    color: 'slate',
    label: { en: 'Defense', cn: '国防' }
  },
  energy: {
    icon: <Zap size={16} />,
    color: 'yellow',
    label: { en: 'Energy', cn: '能源' }
  },
  'financial-services': {
    icon: <Database size={16} />,
    color: 'violet',
    label: { en: 'Financial Services', cn: '金融服务' }
  },
  automotive: {
    icon: <Truck size={16} />,
    color: 'orange',
    label: { en: 'Automotive', cn: '汽车' }
  },
  insurance: {
    icon: <Heart size={16} />,
    color: 'pink',
    label: { en: 'Insurance', cn: '保险' }
  }
};

const ArchetypeBrowser: React.FC<Props> = ({ lang, aiSettings, onSelectArchetype, onApplyArchetype }) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<ArchetypeOriginType | 'all'>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

  // 异步加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [archetypes, setArchetypes] = useState<ArchetypeIndex[]>([]);

  // IndustryDiscovery 对话框
  const [showDiscovery, setShowDiscovery] = useState(false);

  // 导入成功提示
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // 加载原型列表（合并静态 + 导入）
  const loadArchetypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const merged = await getMergedArchetypeIndexList();
      setArchetypes(merged);
    } catch (error) {
      console.error('Failed to load archetypes:', error);
      // 降级到静态列表
      setArchetypes(getArchetypeIndexList());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchetypes();
  }, [loadArchetypes]);

  const filteredArchetypes = useMemo(() => {
    return archetypes.filter(a => {
      // Industry filter
      if (selectedIndustry && a.industry !== selectedIndustry) return false;

      // Source filter
      if (selectedSource !== 'all') {
        const originType = a.origin?.type || 'static';
        if (originType !== selectedSource) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(query) ||
          a.description.en.toLowerCase().includes(query) ||
          a.description.cn.includes(searchQuery) ||
          a.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [archetypes, selectedIndustry, selectedSource, searchQuery]);

  const industries = useMemo(() => {
    const set = new Set(archetypes.map(a => a.industry));
    return Array.from(set);
  }, [archetypes]);

  // 删除导入的原型
  const handleDelete = async (archetypeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t.deleteConfirm)) return;

    const success = await deleteImportedArchetype(archetypeId);
    if (success) {
      await loadArchetypes();
      if (selectedArchetype === archetypeId) {
        setSelectedArchetype(null);
      }
    }
  };

  // 导出原型为 JSON 文件
  const handleExportJson = async (archetypeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const archetype = await getMergedArchetypeById(archetypeId);
      if (!archetype) return;

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        archetype: archetype
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${archetype.metadata.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setImportSuccessMessage(t.exportSuccess);
      setTimeout(() => setImportSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to export archetype:', error);
    }
  };

  // 导入 JSON 文件
  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t.invalidJson);
      }

      // 支持两种格式：直接的 Archetype 或包装的 { archetype: ... }
      const archetype: Archetype = data.archetype || data;

      // Comprehensive field validation with specific error messages
      const validationErrors: string[] = [];

      // Check metadata
      if (!archetype.metadata?.id) {
        validationErrors.push(t.validationMissingId);
      }
      if (!archetype.metadata?.name) {
        validationErrors.push(t.validationMissingName);
      }

      // Check ontology
      if (!archetype.ontology) {
        validationErrors.push(t.validationMissingOntology);
      } else {
        // Check that ontology.objects exists and is non-empty
        if (!Array.isArray(archetype.ontology.objects) || archetype.ontology.objects.length === 0) {
          validationErrors.push(t.validationEmptyObjects);
        } else {
          // Validate object structure (each object must have id and name)
          const invalidObjects = archetype.ontology.objects.filter(
            (obj: unknown) => !obj || typeof obj !== 'object' || !('id' in obj) || !('name' in obj)
          );
          if (invalidObjects.length > 0) {
            validationErrors.push(t.validationInvalidObjects);
          }
        }
      }

      // Throw with all validation errors if any
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // 创建 origin 信息
      const origin: ArchetypeOrigin = {
        type: 'reference',
        importedAt: new Date().toISOString(),
        fileName: file.name
      };

      // 保存到 IndexedDB
      await archetypeStorageService.initialize();
      await archetypeStorageService.saveArchetype(archetype, origin);

      // 刷新列表
      await loadArchetypes();

      // 显示成功提示
      setImportSuccessMessage(t.importSuccess);
      setTimeout(() => setImportSuccessMessage(null), 5000);

      // 自动应用导入的原型
      onApplyArchetype(archetype.metadata.id, true);
    } catch (error) {
      console.error('Failed to import JSON:', error);
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : t.importError;
      alert(`${t.importError}: ${errorMessage}`);
    }

    // 清空 input 以便重复导入同一文件
    event.target.value = '';
  };

  // 处理导入完成
  const handleImported = (archetypeId: string) => {
    setShowDiscovery(false);
    loadArchetypes();

    // 显示成功提示（包含方法论引导）
    setImportSuccessMessage(t.importSuccess);
    setTimeout(() => setImportSuccessMessage(null), 5000);

    // 自动应用原型，进入建模阶段（跳过确认，因为用户已在导入流程中确认）
    // 延迟一点确保列表已刷新
    setTimeout(() => {
      onApplyArchetype(archetypeId, true);  // skipConfirm=true
    }, 500);
  };

  const renderArchetypeCard = (archetype: ArchetypeIndex) => {
    const industry = industryConfig[archetype.industry];
    const isSelected = selectedArchetype === archetype.id;
    const isImported = archetype.origin?.type !== 'static' && archetype.origin?.type !== undefined;

    return (
      <div
        key={archetype.id}
        className={`glass-card rounded-xl p-5 transition-all cursor-pointer relative ${
          isSelected ? 'ring-2 ring-amber-500/50' : 'hover:bg-white/[0.02]'
        }`}
        onClick={() => setSelectedArchetype(isSelected ? null : archetype.id)}
      >
        {/* Source Indicator (corner badge) - hover shows full origin details */}
        <div className="absolute top-3 right-3">
          <SourceIndicator origin={archetype.origin} size={14} lang={lang} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-accent)' }}>
              {industry?.icon || <Package size={20} />}
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{archetype.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-accent)' }}>
                {industry?.label[lang] || archetype.industry}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock size={12} />
            {archetype.estimatedDeploymentTime}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted mb-4 line-clamp-2">
          {archetype.description[lang === 'cn' ? 'cn' : 'en']}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <StatBadge icon={<Database size={12} />} value={archetype.stats.objectCount} label={t.objects} />
          <StatBadge icon={<Zap size={12} />} value={archetype.stats.actionCount} label={t.actions} />
          <StatBadge icon={<GitBranch size={12} />} value={archetype.stats.connectorCount} label={t.connectors} />
          <StatBadge icon={<Layers size={12} />} value={archetype.stats.workflowCount} label={t.workflows} />
          <StatBadge icon={<LayoutDashboard size={12} />} value={archetype.stats.dashboardCount} label={t.dashboards} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {archetype.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-micro px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                color: tag === 'ai-enabled' ? 'var(--color-accent-secondary)' :
                       tag === 'erp-integration' ? 'var(--color-accent-secondary)' :
                       tag === 'iot-enabled' ? 'var(--color-success)' :
                       tag === 'ai-generated' ? 'rgb(192, 132, 252)' :
                       tag === 'from-reference' ? 'rgb(96, 165, 250)' :
                       'var(--color-text-muted)'
              }}
            >
              {tag === 'ai-enabled' ? t.aiEnabled :
               tag === 'erp-integration' ? t.erpIntegration :
               tag === 'iot-enabled' ? t.iotEnabled :
               tag === 'ai-generated' ? t.aiGenerated :
               tag === 'from-reference' ? t.fromReference :
               tag}
            </span>
          ))}
        </div>

        {/* Actions - shown when selected */}
        {isSelected && (
          <div className="flex gap-2 pt-3 animate-fadeIn" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
            {/* Export JSON button */}
            <button
              onClick={(e) => handleExportJson(archetype.id, e)}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg glass-surface text-sm text-muted hover:text-primary transition-colors"
              title={t.exportJson}
            >
              <Download size={14} />
            </button>
            {/* Delete button for imported archetypes */}
            {isImported && (
              <button
                onClick={(e) => handleDelete(archetype.id, e)}
                className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg glass-surface text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title={t.delete}
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectArchetype(archetype.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass-surface text-sm text-secondary hover:text-primary transition-colors"
            >
              {t.viewDetails}
              <ChevronRight size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApplyArchetype(archetype.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg btn-gradient text-sm font-medium"
            >
              {t.useArchetype}
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)]">
      {/* 导入成功提示 Toast */}
      {importSuccessMessage && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn"
          style={{
            backgroundColor: 'var(--color-success)',
            color: 'white',
            maxWidth: '400px',
          }}
        >
          <Layers size={18} />
          <span className="text-sm">{importSuccessMessage}</span>
          <button
            onClick={() => setImportSuccessMessage(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
              <Package size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h1>
              <p className="text-sm text-muted">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Import JSON Button */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass-surface text-sm font-medium cursor-pointer hover:bg-white/[0.05] transition-colors">
              <Upload size={16} />
              {t.importJson}
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>

            {/* Explore New Industry Button */}
            {aiSettings && aiSettings.apiKey && (
              <button
                onClick={() => setShowDiscovery(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-gradient text-sm font-medium"
              >
                <Plus size={16} />
                {t.exploreNew}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full glass-surface rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Industry Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <select
            value={selectedIndustry || ''}
            onChange={(e) => setSelectedIndustry(e.target.value || null)}
            className="glass-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <option value="">{t.allIndustries}</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>
                {industryConfig[ind]?.label[lang] || ind}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as ArchetypeOriginType | 'all')}
            className="glass-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <option value="all">{t.allSources}</option>
            <option value="static">{t.sourceBuiltin}</option>
            <option value="ai-generated">{t.sourceAI}</option>
            <option value="reference">{t.sourceRef}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <Loader2 size={48} className="mb-4 animate-spin opacity-30" />
            <p>{t.loading}</p>
          </div>
        ) : filteredArchetypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <Package size={48} className="mb-4 opacity-30" />
            <p>{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredArchetypes.map(renderArchetypeCard)}
          </div>
        )}
      </div>

      {/* Industry Discovery Dialog */}
      {showDiscovery && aiSettings && (
        <IndustryDiscovery
          lang={lang}
          aiSettings={aiSettings}
          onClose={() => setShowDiscovery(false)}
          onImported={handleImported}
        />
      )}
    </div>
  );
};

// Stat Badge Component
const StatBadge: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-1 text-muted mb-0.5">
      {icon}
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
    <span className="text-micro text-muted uppercase tracking-wide">{label}</span>
  </div>
);

export default ArchetypeBrowser;

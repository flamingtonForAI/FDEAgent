import React, { useState, useMemo, useCallback } from 'react';
import { Language, ProjectState, OntologyObject, OntologyLink, AIPAction } from '../types';
import {
  Box,
  Zap,
  Link2,
  Database,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Copy,
  Download,
  Eye,
  Code,
  Briefcase,
  MessageSquare,
  Package,
  ArrowRight
} from 'lucide-react';
import LinkRecommender from './LinkRecommender';
import ObjectEditor from './ObjectEditor';
import LinkEditor from './LinkEditor';
import ActionDesigner from './ActionDesigner';

interface StructuringWorkbenchProps {
  lang: Language;
  project: ProjectState;
  setProject?: React.Dispatch<React.SetStateAction<ProjectState>>;
  chatMessages?: Array<{ role: string; content: string }>;
  onNavigateToOntology?: () => void;
  onNavigateToScouting?: () => void;
  onNavigateToArchetypes?: () => void;
  onEditObject?: (objectId: string) => void;
  onAddObject?: () => void;
  onAddAction?: (objectId: string) => void;
}

type ViewMode = 'cards' | 'business' | 'technical';
type FilterType = 'objects' | 'actions' | 'links' | null;

const translations = {
  cn: {
    title: '结构化工作台',
    subtitle: '对话信息转化为可交付设计',
    viewCards: '概览',
    viewBusiness: '业务',
    viewTechnical: '技术',
    viewCardsDesc: '全部要素',
    viewBusinessDesc: '业务语义',
    viewTechnicalDesc: 'API实现',
    clickToFilter: '点击筛选',
    showAll: '显示全部',
    objects: '业务对象',
    actions: '业务操作',
    links: '对象关联',
    integrations: '数据集成',
    noObjects: '暂无业务对象',
    noActions: '暂无业务操作',
    noLinks: '暂无对象关联',
    noIntegrations: '暂无数据集成',
    addObject: '添加对象',
    addAction: '添加操作',
    properties: '属性',
    description: '描述',
    complete: '完整',
    incomplete: '待完善',
    missing: '缺失',
    businessLayer: '业务层',
    logicLayer: '逻辑层',
    implLayer: '实现层',
    exportJson: '导出 JSON',
    exportMarkdown: '导出文档',
    copied: '已复制',
    completeness: '完整度',
    tip: '点击卡片查看详情，点击 + 添加新元素',
    executor: '执行者',
    trigger: '触发条件',
    apiEndpoint: 'API端点',
    parameters: '参数',
    emptyStateTitle: '暂无数据可整理',
    emptyStateDesc: '结构化工作台需要从对话或模板中获取数据。请先完成以下步骤之一：',
    goToScouting: '开始需求勘察',
    goToScoutingDesc: '通过对话探索业务需求，AI 将帮助您提取业务对象',
    goToArchetypes: '使用行业模板',
    goToArchetypesDesc: '从预置的行业模板快速开始，获得完整的对象结构'
  },
  en: {
    title: 'Structuring Workbench',
    subtitle: 'Transform conversations into deliverable designs',
    viewCards: 'Overview',
    viewBusiness: 'Business',
    viewTechnical: 'Technical',
    viewCardsDesc: 'All elements',
    viewBusinessDesc: 'Semantics',
    viewTechnicalDesc: 'API impl',
    clickToFilter: 'Click to filter',
    showAll: 'Show all',
    objects: 'Objects',
    actions: 'Actions',
    links: 'Links',
    integrations: 'Integrations',
    noObjects: 'No objects defined',
    noActions: 'No actions defined',
    noLinks: 'No links defined',
    noIntegrations: 'No integrations defined',
    addObject: 'Add Object',
    addAction: 'Add Action',
    properties: 'Properties',
    description: 'Description',
    complete: 'Complete',
    incomplete: 'Incomplete',
    missing: 'Missing',
    businessLayer: 'Business',
    logicLayer: 'Logic',
    implLayer: 'Implementation',
    exportJson: 'Export JSON',
    exportMarkdown: 'Export Docs',
    copied: 'Copied',
    completeness: 'Completeness',
    tip: 'Click cards for details, + to add new elements',
    executor: 'Executor',
    trigger: 'Trigger',
    apiEndpoint: 'API Endpoint',
    parameters: 'Parameters',
    emptyStateTitle: 'No data to structure',
    emptyStateDesc: 'The Structuring Workbench needs data from conversations or templates. Please complete one of the following steps first:',
    goToScouting: 'Start Requirement Scouting',
    goToScoutingDesc: 'Explore business requirements through conversation, AI will help extract objects',
    goToArchetypes: 'Use Industry Templates',
    goToArchetypesDesc: 'Quick start from pre-built industry templates with complete object structures'
  }
};

// 计算对象完整度
function calculateObjectCompleteness(obj: OntologyObject): {
  score: number;
  missing: string[];
} {
  const missing: string[] = [];
  let total = 5;
  let completed = 0;

  if (obj.name) completed++;
  else missing.push('名称');

  if (obj.description && obj.description.length > 10) completed++;
  else missing.push('描述');

  if (obj.properties && obj.properties.length > 0) completed++;
  else missing.push('属性');

  if (obj.actions && obj.actions.length > 0) completed++;
  else missing.push('操作');

  // Check if any property looks like a primary key
  const pkPatterns = ['id', 'key', 'pk', 'uuid', 'guid', 'code', '编号', '编码', '主键'];
  const hasPrimaryKey = obj.properties?.some(p =>
    pkPatterns.some(pattern => p.name.toLowerCase().includes(pattern))
  );
  if (hasPrimaryKey) completed++;
  else missing.push('主键');

  return {
    score: Math.round((completed / total) * 100),
    missing
  };
}

// 计算 Action 三层完整度
function calculateActionCompleteness(action: any): {
  business: boolean;
  logic: boolean;
  impl: boolean;
  score: number;
} {
  // Business Layer: description + targetObject from businessLayer
  const bl = action.businessLayer;
  const business = !!(action.description && bl?.targetObject);

  // Logic Layer: preconditions, postconditions, parameters from logicLayer
  const ll = action.logicLayer;
  const logic = !!(ll?.preconditions?.length || ll?.postconditions?.length || ll?.parameters?.length);

  // Implementation Layer: apiEndpoint, agentToolSpec from implementationLayer
  const il = action.implementationLayer;
  const impl = !!(il?.apiEndpoint || il?.agentToolSpec);

  let score = 0;
  if (business) score += 40;
  if (logic) score += 35;
  if (impl) score += 25;

  return { business, logic, impl, score };
}

const StructuringWorkbench: React.FC<StructuringWorkbenchProps> = ({
  lang,
  project,
  setProject,
  chatMessages,
  onNavigateToOntology,
  onNavigateToScouting,
  onNavigateToArchetypes,
  onEditObject,
  onAddObject,
  onAddAction
}) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['objects', 'actions'])
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing state
  const [editingObject, setEditingObject] = useState<OntologyObject | null>(null);
  const [editingLink, setEditingLink] = useState<OntologyLink | null>(null);
  const [showActionDesigner, setShowActionDesigner] = useState(false);
  const [selectedActionInfo, setSelectedActionInfo] = useState<{ objectId: string; actionIndex: number } | null>(null);

  // 点击统计栏切换筛选
  const handleFilterClick = (filter: FilterType) => {
    if (activeFilter === filter) {
      setActiveFilter(null); // 再次点击取消筛选
    } else {
      setActiveFilter(filter);
      // 在概览模式下，筛选会高亮对应类型
      // 在其他模式下，展开对应区块
      if (viewMode !== 'cards') {
        setExpandedSections(new Set([filter || 'objects']));
      }
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // 统计信息
  const stats = useMemo(() => {
    const objects = project.objects || [];
    const allActions = objects.flatMap(o => o.actions || []);
    const links = project.links || [];

    return {
      objectCount: objects.length,
      actionCount: allActions.length,
      linkCount: links.length,
    };
  }, [project]);

  // 导出为 JSON
  const exportJson = () => {
    const data = {
      objects: project.objects,
      links: project.links,
      integrations: project.integrations,
      metadata: {
        industry: project.industry,
        useCase: project.useCase,
        exportedAt: new Date().toISOString()
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontology-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出为 Markdown
  const exportMarkdown = () => {
    let md = `# Ontology Design\n\n`;
    md += `> Exported: ${new Date().toLocaleString()}\n\n`;

    if (project.industry) md += `**Industry:** ${project.industry}\n\n`;

    md += `## Objects (${project.objects?.length || 0})\n\n`;
    (project.objects || []).forEach(obj => {
      md += `### ${obj.name}\n`;
      md += `${obj.description || '_No description_'}\n\n`;
      if (obj.properties?.length) {
        md += `**Properties:**\n`;
        obj.properties.forEach(p => md += `- ${p.name}: ${p.type}\n`);
        md += '\n';
      }
      if (obj.actions?.length) {
        md += `**Actions:**\n`;
        obj.actions.forEach(a => md += `- ${a.name}: ${a.description || ''}\n`);
        md += '\n';
      }
    });

    md += `## Links (${project.links?.length || 0})\n\n`;
    (project.links || []).forEach(link => {
      const sourceName = project.objects?.find(o => o.id === link.source)?.name || link.source;
      const targetName = project.objects?.find(o => o.id === link.target)?.name || link.target;
      md += `- ${sourceName} → ${targetName} (${link.label})\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontology-design-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle applying a recommended link
  const handleApplyLink = (link: Omit<OntologyLink, 'id'>) => {
    if (!setProject) return;
    const newLink: OntologyLink = {
      id: `link_${Date.now()}`,
      source: link.sourceId,
      target: link.targetId,
      sourceId: link.sourceId,
      targetId: link.targetId,
      type: link.type || 'reference',
      label: link.label || ''
    };
    setProject(prev => ({
      ...prev,
      links: [...(prev.links || []), newLink]
    }));
  };

  // Track dismissed link recommendations (state for UI only)
  const [dismissedLinks, setDismissedLinks] = useState<Set<string>>(new Set());
  const handleDismissLink = (sourceId: string, targetId: string) => {
    setDismissedLinks(prev => new Set([...prev, `${sourceId}-${targetId}`]));
  };

  // === Object Editing ===
  const handleEditObject = useCallback((objectId: string) => {
    const obj = project.objects?.find(o => o.id === objectId);
    if (obj) {
      setEditingObject({ ...obj });
    }
  }, [project.objects]);

  const handleAddObject = useCallback(() => {
    const newObject: OntologyObject = {
      id: `obj_${Date.now()}`,
      name: '',
      description: '',
      properties: [],
      actions: [],
    };
    setEditingObject(newObject);
  }, []);

  const handleSaveObject = useCallback((updated: OntologyObject) => {
    if (!setProject) return;
    setProject(prev => {
      const exists = prev.objects.some(o => o.id === updated.id);
      if (exists) {
        return {
          ...prev,
          objects: prev.objects.map(o => o.id === updated.id ? updated : o)
        };
      } else {
        return {
          ...prev,
          objects: [...prev.objects, updated]
        };
      }
    });
    setEditingObject(null);
  }, [setProject]);

  // === Link Editing ===
  const handleEditLink = useCallback((link: OntologyLink) => {
    setEditingLink({ ...link });
  }, []);

  const handleAddLink = useCallback(() => {
    const newLink: OntologyLink = {
      id: '',
      source: '',
      target: '',
      label: '',
      isSemantic: true,
    };
    setEditingLink(newLink);
  }, []);

  const handleSaveLink = useCallback((updated: OntologyLink) => {
    if (!setProject) return;
    setProject(prev => {
      const exists = prev.links.some(l => l.id === updated.id);
      if (exists) {
        return {
          ...prev,
          links: prev.links.map(l => l.id === updated.id ? updated : l)
        };
      } else {
        return {
          ...prev,
          links: [...prev.links, updated]
        };
      }
    });
    setEditingLink(null);
  }, [setProject]);

  const handleDeleteLink = useCallback((linkId: string) => {
    if (!setProject) return;
    setProject(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== linkId)
    }));
    setEditingLink(null);
  }, [setProject]);

  // === Action Editing ===
  const handleEditAction = useCallback((objectId: string, actionIndex: number) => {
    setSelectedActionInfo({ objectId, actionIndex });
    setShowActionDesigner(true);
  }, []);

  const handleUpdateAction = useCallback((objectId: string, actionIndex: number, updatedAction: AIPAction) => {
    if (!setProject) return;
    setProject(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === objectId
          ? {
              ...obj,
              actions: obj.actions.map((action, idx) =>
                idx === actionIndex ? updatedAction : action
              )
            }
          : obj
      )
    }));
  }, [setProject]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
            >
              <FileText className="w-3.5 h-3.5" />
              MD
            </button>
          </div>
        </div>

        {/* Stats bar - clickable to filter */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Box, label: t.objects, value: stats.objectCount, color: 'var(--color-accent)', filter: 'objects' as FilterType },
            { icon: Zap, label: t.actions, value: stats.actionCount, color: 'var(--color-success)', filter: 'actions' as FilterType },
            { icon: Link2, label: t.links, value: stats.linkCount, color: 'var(--color-warning)', filter: 'links' as FilterType },
          ].map((stat, i) => (
            <button
              key={i}
              onClick={() => stat.filter && handleFilterClick(stat.filter)}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${stat.filter ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
              style={{
                backgroundColor: activeFilter === stat.filter ? `${stat.color}20` : 'var(--color-bg-surface)',
                border: activeFilter === stat.filter ? `1px solid ${stat.color}` : '1px solid transparent'
              }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <div className="text-left">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            </button>
          ))}
        </div>
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="mt-2 text-xs px-2 py-1 rounded"
            style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-bg-surface)' }}
          >
            ← {t.showAll}
          </button>
        )}

        {/* View mode tabs */}
        <div className="flex gap-1 mt-3 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
          {[
            { mode: 'cards' as ViewMode, label: t.viewCards, desc: t.viewCardsDesc, icon: Eye },
            { mode: 'business' as ViewMode, label: t.viewBusiness, desc: t.viewBusinessDesc, icon: Briefcase },
            { mode: 'technical' as ViewMode, label: t.viewTechnical, desc: t.viewTechnicalDesc, icon: Code }
          ].map(tab => (
            <button
              key={tab.mode}
              onClick={() => { setViewMode(tab.mode); setActiveFilter(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                viewMode === tab.mode ? '' : 'hover:bg-white/5'
              }`}
              style={{
                backgroundColor: viewMode === tab.mode ? 'var(--color-accent)' : 'transparent',
                color: viewMode === tab.mode ? '#fff' : 'var(--color-text-secondary)'
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <div className="flex flex-col items-start">
                <span>{tab.label}</span>
                <span className="text-[9px] opacity-70">{tab.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty State Guidance - show when no objects and no meaningful chat */}
        {(project.objects?.length || 0) === 0 && (!chatMessages || chatMessages.length < 2) && (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-warning)15' }}
            >
              <AlertCircle size={28} style={{ color: 'var(--color-warning)' }} />
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.emptyStateTitle}
            </h3>
            <p
              className="text-sm mb-6 max-w-md mx-auto"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t.emptyStateDesc}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {onNavigateToScouting && (
                <button
                  onClick={onNavigateToScouting}
                  className="group p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
                  >
                    <MessageSquare size={20} />
                  </div>
                  <div
                    className="font-medium text-sm mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t.goToScouting}
                  </div>
                  <div className="text-xs text-muted mb-2">{t.goToScoutingDesc}</div>
                  <div
                    className="flex items-center gap-1 text-xs font-medium transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <ArrowRight size={12} />
                  </div>
                </button>
              )}
              {onNavigateToArchetypes && (
                <button
                  onClick={onNavigateToArchetypes}
                  className="group p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'var(--color-success)15', color: 'var(--color-success)' }}
                  >
                    <Package size={20} />
                  </div>
                  <div
                    className="font-medium text-sm mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t.goToArchetypes}
                  </div>
                  <div className="text-xs text-muted mb-2">{t.goToArchetypesDesc}</div>
                  <div
                    className="flex items-center gap-1 text-xs font-medium transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--color-success)' }}
                  >
                    <ArrowRight size={12} />
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Objects Section */}
        {(!activeFilter || activeFilter === 'objects') && (
        <Section
          title={t.objects}
          icon={Box}
          count={stats.objectCount}
          isExpanded={expandedSections.has('objects') || activeFilter === 'objects'}
          onToggle={() => toggleSection('objects')}
          onAdd={setProject ? handleAddObject : undefined}
          color="var(--color-accent)"
          lang={lang}
        >
          {(project.objects?.length || 0) === 0 ? (
            <EmptyState message={t.noObjects} onAdd={onAddObject} addLabel={t.addObject} />
          ) : (
            <div className={viewMode === 'cards' ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'space-y-2'}>
              {project.objects?.map(obj => {
                const completeness = calculateObjectCompleteness(obj);
                return (
                  <ObjectCard
                    key={obj.id}
                    object={obj}
                    completeness={completeness}
                    viewMode={viewMode}
                    lang={lang}
                    onEdit={() => handleEditObject(obj.id)}
                    onClick={() => handleEditObject(obj.id)}
                    onCopy={() => copyToClipboard(JSON.stringify(obj, null, 2), obj.id)}
                    isCopied={copiedId === obj.id}
                    t={t}
                  />
                );
              })}
            </div>
          )}
        </Section>
        )}

        {/* Actions Section */}
        {(!activeFilter || activeFilter === 'actions') && (
        <Section
          title={t.actions}
          icon={Zap}
          count={stats.actionCount}
          isExpanded={expandedSections.has('actions') || activeFilter === 'actions'}
          onToggle={() => toggleSection('actions')}
          color="var(--color-success)"
          lang={lang}
        >
          {stats.actionCount === 0 ? (
            <EmptyState message={t.noActions} />
          ) : (
            <div className={viewMode === 'cards' ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'space-y-2'}>
              {project.objects?.flatMap(obj =>
                (obj.actions || []).map((action, idx) => {
                  const completeness = calculateActionCompleteness(action);
                  return (
                    <ActionCard
                      key={`${obj.id}-${idx}`}
                      action={action}
                      parentObject={obj.name}
                      objectId={obj.id}
                      actionIndex={idx}
                      completeness={completeness}
                      viewMode={viewMode}
                      lang={lang}
                      onClick={() => handleEditAction(obj.id, idx)}
                      t={t}
                    />
                  );
                })
              )}
            </div>
          )}
        </Section>
        )}

        {/* Links Section */}
        {(!activeFilter || activeFilter === 'links') && viewMode !== 'business' && (
          <Section
            title={t.links}
            icon={Link2}
            count={stats.linkCount}
            isExpanded={expandedSections.has('links') || activeFilter === 'links'}
            onToggle={() => toggleSection('links')}
            onAdd={setProject ? handleAddLink : undefined}
            color="var(--color-warning)"
            lang={lang}
          >
            {stats.linkCount === 0 ? (
              <EmptyState message={t.noLinks} onAdd={setProject ? handleAddLink : undefined} addLabel={lang === 'cn' ? '添加关联' : 'Add Link'} />
            ) : (
              <div className="space-y-1">
                {project.links?.map((link, i) => {
                  const sourceName = project.objects.find(o => o.id === link.source)?.name || link.source;
                  const targetName = project.objects.find(o => o.id === link.target)?.name || link.target;
                  return (
                    <button
                      key={link.id || i}
                      onClick={() => handleEditLink(link)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                      style={{ backgroundColor: 'var(--color-bg-surface)' }}
                    >
                      <span style={{ color: 'var(--color-text-primary)' }}>{sourceName}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{targetName}</span>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
                      >
                        {link.label || '-'}
                      </span>
                      <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* Link Recommender - show when there are at least 2 objects */}
        {(project.objects?.length || 0) >= 2 && setProject && viewMode !== 'business' && (
          <LinkRecommender
            lang={lang}
            project={project}
            onApplyLink={handleApplyLink}
            onDismissRecommendation={handleDismissLink}
          />
        )}
      </div>

      {/* Object Editor Modal */}
      {editingObject && (
        <ObjectEditor
          lang={lang}
          object={editingObject}
          onSave={handleSaveObject}
          onClose={() => setEditingObject(null)}
        />
      )}

      {/* Link Editor Modal */}
      {editingLink && (
        <LinkEditor
          lang={lang}
          link={editingLink}
          objects={project.objects || []}
          onSave={handleSaveLink}
          onClose={() => setEditingLink(null)}
          onDelete={editingLink.id ? () => handleDeleteLink(editingLink.id) : undefined}
        />
      )}

      {/* Action Designer Modal */}
      {showActionDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
            style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {lang === 'cn' ? 'Action 三层设计' : 'Action Designer'}
              </h2>
              <button
                onClick={() => setShowActionDesigner(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ActionDesigner
                lang={lang}
                objects={project.objects || []}
                onUpdateAction={handleUpdateAction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section component
const Section: React.FC<{
  title: string;
  icon: React.FC<any>;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  color: string;
  lang: Language;
  children: React.ReactNode;
}> = ({ title, icon: Icon, count, isExpanded, onToggle, onAdd, color, children }) => (
  <div
    className="rounded-xl border overflow-hidden"
    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
      >
        {count}
      </span>
      <div className="flex-1" />
      {onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
      {isExpanded ? (
        <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
      ) : (
        <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
      )}
    </button>
    {isExpanded && <div className="p-3 pt-0">{children}</div>}
  </div>
);

// Empty state
const EmptyState: React.FC<{ message: string; onAdd?: () => void; addLabel?: string }> = ({
  message,
  onAdd,
  addLabel
}) => (
  <div className="text-center py-6">
    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
    {onAdd && addLabel && (
      <button
        onClick={onAdd}
        className="mt-2 flex items-center gap-1 mx-auto px-3 py-1.5 rounded-lg text-xs transition-colors"
        style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
      >
        <Plus className="w-3 h-3" />
        {addLabel}
      </button>
    )}
  </div>
);

// Object card - renders differently based on viewMode
const ObjectCard: React.FC<{
  object: OntologyObject;
  completeness: { score: number; missing: string[] };
  viewMode: ViewMode;
  lang: Language;
  onEdit?: () => void;
  onClick?: () => void;
  onCopy: () => void;
  isCopied: boolean;
  t: typeof translations.cn;
}> = ({ object, completeness, viewMode, onEdit, onClick, onCopy, isCopied, t }) => {
  // Cards view: compact summary
  if (viewMode === 'cards') {
    return (
      <button
        onClick={onClick}
        className="p-3 rounded-lg border text-center w-full transition-all hover:scale-[1.02] hover:border-[var(--color-accent)]"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <Box className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
        <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {object.name}
        </div>
        <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {object.properties?.length || 0} {t.properties} · {object.actions?.length || 0} {t.actions}
        </div>
        <div
          className={`text-[10px] px-2 py-0.5 rounded mt-2 inline-block ${
            completeness.score >= 80 ? 'bg-green-500/20 text-green-400' :
            completeness.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}
        >
          {completeness.score}%
        </div>
      </button>
    );
  }

  return (
    <div
      className="p-3 rounded-lg border transition-colors hover:border-[var(--color-border-hover)]"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {object.name}
            </span>
            {viewMode !== 'cards' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  completeness.score >= 80 ? 'bg-green-500/20 text-green-400' :
                  completeness.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}
              >
                {completeness.score}%
              </span>
            )}
          </div>
          {object.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
              {object.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onCopy}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: isCopied ? 'var(--color-success)' : 'var(--color-text-muted)' }}
          >
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Technical view: Show property details with types */}
      {viewMode === 'technical' && object.properties && object.properties.length > 0 && (
        <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
          <div className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            {t.properties}
          </div>
          <div className="space-y-1">
            {object.properties.slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                <span className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}>
                  {p.type}
                </span>
              </div>
            ))}
            {object.properties.length > 6 && (
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                +{object.properties.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* All view: Show property tags */}
      {viewMode === 'all' && (
        <div className="flex flex-wrap gap-1 mt-2">
          {object.properties?.slice(0, 5).map((p, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
            >
              {p.name}
            </span>
          ))}
          {(object.properties?.length || 0) > 5 && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              +{(object.properties?.length || 0) - 5}
            </span>
          )}
        </div>
      )}

      {/* Business view: No property details, just description */}

      {completeness.missing.length > 0 && viewMode !== 'cards' && (
        <div className="flex items-center gap-1 mt-2 text-[10px]" style={{ color: 'var(--color-warning)' }}>
          <AlertCircle className="w-3 h-3" />
          <span>{t.missing}: {completeness.missing.join(', ')}</span>
        </div>
      )}
    </div>
  );
};

// Action card - renders differently based on viewMode
const ActionCard: React.FC<{
  action: any;
  parentObject: string;
  objectId?: string;
  actionIndex?: number;
  completeness: { business: boolean; logic: boolean; impl: boolean; score: number };
  viewMode: ViewMode;
  lang: Language;
  onClick?: () => void;
  t: typeof translations.cn;
}> = ({ action, parentObject, objectId, actionIndex, completeness, viewMode, onClick, t }) => {
  // Cards view: compact summary
  if (viewMode === 'cards') {
    return (
      <button
        onClick={onClick}
        className="p-3 rounded-lg border text-center w-full transition-all hover:scale-[1.02] hover:border-[var(--color-success)]"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
        <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {action.name}
        </div>
        <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          → {parentObject}
        </div>
        <div
          className={`text-[10px] px-2 py-0.5 rounded mt-2 inline-block ${
            completeness.score >= 70 ? 'bg-green-500/20 text-green-400' :
            completeness.score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}
        >
          {completeness.score}%
        </div>
      </button>
    );
  }

  // Business view: focus on who does what
  if (viewMode === 'business') {
    const bl = action.businessLayer;
    return (
      <div
        className="p-3 rounded-lg border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {action.name}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
          >
            → {parentObject}
          </span>
        </div>
        {action.description && (
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {action.description}
          </p>
        )}
        {(bl?.executor || bl?.trigger) && (
          <div className="mt-2 pt-2 border-t space-y-1" style={{ borderColor: 'var(--color-border)' }}>
            {bl?.executor && (
              <div className="flex items-center gap-2 text-[10px]">
                <Users className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{t.executor}:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{bl.executor}</span>
              </div>
            )}
            {bl?.trigger && (
              <div className="flex items-center gap-2 text-[10px]">
                <Zap className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{t.trigger}:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{bl.trigger}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Technical view: focus on API and implementation
  if (viewMode === 'technical') {
    const il = action.implementationLayer;
    const ll = action.logicLayer;
    return (
      <div
        className="p-3 rounded-lg border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {action.name}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
            >
              → {parentObject}
            </span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              completeness.score >= 70 ? 'bg-green-500/20 text-green-400' :
              completeness.score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}
          >
            {completeness.score}%
          </span>
        </div>

        {/* API Endpoint */}
        {il?.apiEndpoint && (
          <div className="mt-2 p-2 rounded font-mono text-[10px]" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div className="flex items-center gap-2">
              <span className="px-1 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>
                {il.apiEndpoint.method || 'POST'}
              </span>
              <span style={{ color: 'var(--color-text-primary)' }}>{il.apiEndpoint.path}</span>
            </div>
          </div>
        )}

        {/* Parameters */}
        {ll?.parameters && ll.parameters.length > 0 && (
          <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              {t.parameters}
            </div>
            <div className="space-y-1">
              {ll.parameters.slice(0, 4).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                  <span className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}>
                    {p.type}
                  </span>
                  {p.required && (
                    <span className="text-[9px]" style={{ color: 'var(--color-error)' }}>*</span>
                  )}
                </div>
              ))}
              {ll.parameters.length > 4 && (
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  +{ll.parameters.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Layer completion */}
        <div className="flex gap-2 mt-2">
          <LayerBadge label={t.businessLayer} active={completeness.business} />
          <LayerBadge label={t.logicLayer} active={completeness.logic} />
          <LayerBadge label={t.implLayer} active={completeness.impl} />
        </div>
      </div>
    );
  }

  // All view: show everything
  return (
    <div
      className="p-3 rounded-lg border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {action.name}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
          >
            → {parentObject}
          </span>
        </div>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            completeness.score >= 70 ? 'bg-green-500/20 text-green-400' :
            completeness.score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}
        >
          {completeness.score}%
        </span>
      </div>

      {action.description && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {action.description}
        </p>
      )}

      <div className="flex gap-2 mt-2">
        <LayerBadge label={t.businessLayer} active={completeness.business} />
        <LayerBadge label={t.logicLayer} active={completeness.logic} />
        <LayerBadge label={t.implLayer} active={completeness.impl} />
      </div>
    </div>
  );
};

// Layer badge
const LayerBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span
    className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
      active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-muted'
    }`}
  >
    {active ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
    {label}
  </span>
);

export default StructuringWorkbench;

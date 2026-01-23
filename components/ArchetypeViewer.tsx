/**
 * Archetype Viewer Component
 * 原型详情查看器
 *
 * 展示 Archetype 的完整四层架构详情
 */

import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { Archetype } from '../types/archetype';
import { getArchetypeById } from '../content/archetypes';
import {
  ArrowLeft, Package, Database, GitBranch, Zap, Bot, LayoutDashboard,
  Layers, FileJson, Clock, Users, CheckCircle, AlertTriangle,
  ChevronDown, ChevronRight, Settings, Server, Shield, Workflow
} from 'lucide-react';

interface Props {
  lang: Language;
  archetypeId: string;
  onBack: () => void;
  onApply: () => void;
}

const translations = {
  en: {
    back: 'Back to Library',
    useArchetype: 'Use This Archetype',
    overview: 'Overview',
    semanticLayer: 'Semantic Layer',
    kineticLayer: 'Kinetic Layer',
    dynamicLayer: 'Dynamic Layer',
    aiLayer: 'AI Layer',
    uiLayer: 'UI Templates',
    deployment: 'Deployment',
    // Overview
    version: 'Version',
    industry: 'Industry',
    domain: 'Domain',
    deployTime: 'Avg Deploy Time',
    deployments: 'Deployments',
    origin: 'Origin',
    contributors: 'Contributors',
    // Semantic
    objects: 'Objects',
    links: 'Links',
    properties: 'Properties',
    actions: 'Actions',
    aiFeatures: 'AI Features',
    // Kinetic
    connectors: 'Data Connectors',
    sourceSystem: 'Source System',
    syncFrequency: 'Sync',
    mappedObjects: 'Mapped Objects',
    // Dynamic
    workflows: 'Workflows',
    rules: 'Business Rules',
    trigger: 'Trigger',
    steps: 'Steps',
    // AI
    aiCapabilities: 'AI Capabilities',
    modelType: 'Model Type',
    enabledActions: 'Enabled Actions',
    // UI
    dashboards: 'Dashboards',
    views: 'Views',
    widgets: 'Widgets',
    targetRole: 'For Role',
    // Deployment
    requirements: 'Requirements',
    envVariables: 'Environment Variables',
    documentation: 'Documentation',
    quickStart: 'Quick Start Guide',
    notFound: 'Archetype not found',
  },
  cn: {
    back: '返回原型库',
    useArchetype: '使用此原型',
    overview: '概览',
    semanticLayer: '语义层',
    kineticLayer: '动力层',
    dynamicLayer: '动态层',
    aiLayer: 'AI 层',
    uiLayer: '界面模板',
    deployment: '部署配置',
    // Overview
    version: '版本',
    industry: '行业',
    domain: '领域',
    deployTime: '平均部署周期',
    deployments: '部署数量',
    origin: '来源',
    contributors: '贡献者',
    // Semantic
    objects: '对象',
    links: '关系',
    properties: '属性',
    actions: '动作',
    aiFeatures: 'AI特性',
    // Kinetic
    connectors: '数据连接器',
    sourceSystem: '源系统',
    syncFrequency: '同步频率',
    mappedObjects: '映射对象',
    // Dynamic
    workflows: '工作流',
    rules: '业务规则',
    trigger: '触发条件',
    steps: '步骤',
    // AI
    aiCapabilities: 'AI 能力',
    modelType: '模型类型',
    enabledActions: '启用的动作',
    // UI
    dashboards: '仪表盘',
    views: '视图',
    widgets: '组件',
    targetRole: '目标角色',
    // Deployment
    requirements: '部署要求',
    envVariables: '环境变量',
    documentation: '文档',
    quickStart: '快速启动指南',
    notFound: '未找到原型',
  }
};

type TabId = 'overview' | 'semantic' | 'kinetic' | 'dynamic' | 'ai' | 'ui' | 'deployment';

const ArchetypeViewer: React.FC<Props> = ({ lang, archetypeId, onBack, onApply }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['objects', 'connectors', 'workflows']));

  const archetype = useMemo(() => getArchetypeById(archetypeId), [archetypeId]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  if (!archetype) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center text-gray-500">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p>{t.notFound}</p>
          <button onClick={onBack} className="mt-4 text-cyan-400 hover:underline">
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t.overview, icon: <Package size={14} /> },
    { id: 'semantic', label: t.semanticLayer, icon: <Database size={14} /> },
    { id: 'kinetic', label: t.kineticLayer, icon: <GitBranch size={14} /> },
    { id: 'dynamic', label: t.dynamicLayer, icon: <Workflow size={14} /> },
    { id: 'ai', label: t.aiLayer, icon: <Bot size={14} /> },
    { id: 'ui', label: t.uiLayer, icon: <LayoutDashboard size={14} /> },
    { id: 'deployment', label: t.deployment, icon: <Server size={14} /> },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              {t.back}
            </button>
            <div className="h-6 w-px bg-white/[0.1]" />
            <div>
              <h1 className="text-lg font-semibold text-white">{archetype.metadata.name}</h1>
              <p className="text-xs text-gray-500">{archetype.metadata.description[lang === 'cn' ? 'cn' : 'en']}</p>
            </div>
          </div>
          <button
            onClick={onApply}
            className="flex items-center gap-2 btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            {t.useArchetype}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-white/[0.06]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t.version} value={archetype.metadata.version} icon={<FileJson size={16} />} />
              <StatCard label={t.industry} value={archetype.metadata.industry} icon={<Package size={16} />} />
              <StatCard label={t.deployTime} value={archetype.metadata.usage?.avgDeploymentTime || 'N/A'} icon={<Clock size={16} />} />
              <StatCard label={t.deployments} value={String(archetype.metadata.usage?.deployments || 0)} icon={<CheckCircle size={16} />} />
            </div>

            {/* Origin */}
            {archetype.metadata.origin && (
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Users size={14} className="text-cyan-400" />
                  {t.origin}
                </h3>
                <div className="text-sm text-gray-400 space-y-2">
                  {archetype.metadata.origin.sourceEngagement && (
                    <p><span className="text-gray-500">Source:</span> {archetype.metadata.origin.sourceEngagement}</p>
                  )}
                  {archetype.metadata.origin.fdeContributors && (
                    <p><span className="text-gray-500">{t.contributors}:</span> {archetype.metadata.origin.fdeContributors.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-4">
              <MiniStatCard label={t.objects} value={archetype.ontology.objects.length} color="blue" />
              <MiniStatCard label={t.connectors} value={archetype.connectors.length} color="emerald" />
              <MiniStatCard label={t.workflows} value={archetype.workflows.length} color="purple" />
              <MiniStatCard label={t.aiCapabilities} value={archetype.aiCapabilities.length} color="amber" />
              <MiniStatCard label={t.dashboards} value={archetype.dashboards.length} color="cyan" />
            </div>
          </div>
        )}

        {/* Semantic Layer Tab */}
        {activeTab === 'semantic' && (
          <div className="space-y-4 animate-fadeIn">
            {archetype.ontology.objects.map(obj => (
              <CollapsibleSection
                key={obj.id}
                title={obj.name}
                subtitle={obj.nameCn || obj.description}
                isExpanded={expandedSections.has(obj.id)}
                onToggle={() => toggleSection(obj.id)}
                badge={`${obj.properties?.length || 0} ${t.properties} · ${obj.actions?.length || 0} ${t.actions}`}
              >
                <div className="space-y-4">
                  {/* Properties */}
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase mb-2">{t.properties}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {obj.properties?.slice(0, 8).map(prop => (
                        <div key={prop.name} className="glass-surface rounded-lg px-3 py-2 text-xs">
                          <span className="text-cyan-400 font-mono">{prop.name}</span>
                          <span className="text-gray-600 ml-2">{prop.type}</span>
                          {prop.isAIDerived && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">AI</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {obj.actions && obj.actions.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 uppercase mb-2">{t.actions}</h4>
                      <div className="space-y-2">
                        {obj.actions.map((action, idx) => (
                          <div key={idx} className="glass-surface rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Zap size={12} className={action.type === 'generative' ? 'text-purple-400' : 'text-cyan-400'} />
                              <span className="text-sm text-white">{action.name}</span>
                              {action.type === 'generative' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">AI</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            ))}

            {/* Links */}
            {archetype.ontology.links.length > 0 && (
              <CollapsibleSection
                title={t.links}
                isExpanded={expandedSections.has('links')}
                onToggle={() => toggleSection('links')}
                badge={`${archetype.ontology.links.length} relationships`}
              >
                <div className="space-y-2">
                  {archetype.ontology.links.map(link => (
                    <div key={link.id} className="glass-surface rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                      <span className="text-cyan-400">{link.source}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-emerald-400">{link.label}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-cyan-400">{link.target}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* Kinetic Layer Tab */}
        {activeTab === 'kinetic' && (
          <div className="space-y-4 animate-fadeIn">
            {archetype.connectors.map(connector => (
              <CollapsibleSection
                key={connector.id}
                title={connector.name}
                subtitle={connector.description[lang === 'cn' ? 'cn' : 'en']}
                isExpanded={expandedSections.has(connector.id)}
                onToggle={() => toggleSection(connector.id)}
                badge={`${connector.sourceType} · ${connector.sync.frequency}`}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">{t.sourceSystem}:</span>
                      <span className="text-white ml-2">{connector.sourceSystem}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t.syncFrequency}:</span>
                      <span className="text-white ml-2">{connector.sync.frequency}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500 mb-2">{t.mappedObjects}</h4>
                    <div className="space-y-1">
                      {connector.mappedObjects.map((mapping, idx) => (
                        <div key={idx} className="glass-surface rounded px-2 py-1.5 text-xs">
                          <span className="text-gray-400">{mapping.sourceEntity}</span>
                          <span className="text-gray-600 mx-2">→</span>
                          <span className="text-cyan-400">{mapping.objectId}</span>
                          <span className="text-gray-600 ml-2">({mapping.fieldMappings.length} fields)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            ))}
          </div>
        )}

        {/* Dynamic Layer Tab */}
        {activeTab === 'dynamic' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Workflows */}
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Workflow size={14} className="text-purple-400" />
              {t.workflows}
            </h3>
            {archetype.workflows.map(workflow => (
              <CollapsibleSection
                key={workflow.id}
                title={workflow.name}
                subtitle={workflow.description[lang === 'cn' ? 'cn' : 'en']}
                isExpanded={expandedSections.has(workflow.id)}
                onToggle={() => toggleSection(workflow.id)}
                badge={`${workflow.steps.length} ${t.steps}`}
              >
                <div className="space-y-3">
                  <div className="text-xs">
                    <span className="text-gray-500">{t.trigger}:</span>
                    <span className="text-white ml-2">{workflow.trigger.type}</span>
                  </div>
                  <div className="space-y-1">
                    {workflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-white">{step.name}</span>
                        <span className="text-gray-600">({step.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>
            ))}

            {/* Rules */}
            {archetype.rules.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-white flex items-center gap-2 mt-6">
                  <Shield size={14} className="text-amber-400" />
                  {t.rules}
                </h3>
                {archetype.rules.map(rule => (
                  <div key={rule.id} className="glass-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span className="text-sm text-white">{rule.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">{rule.type}</span>
                    </div>
                    <p className="text-xs text-gray-400">{rule.description[lang === 'cn' ? 'cn' : 'en']}</p>
                    <code className="block mt-2 text-[10px] text-cyan-400 font-mono bg-black/30 rounded px-2 py-1">
                      {rule.expression}
                    </code>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* AI Layer Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-fadeIn">
            {archetype.aiCapabilities.map(cap => (
              <div key={cap.id} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Bot size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{cap.name}</h3>
                    <span className="text-xs text-purple-400">{cap.type}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">{cap.description[lang === 'cn' ? 'cn' : 'en']}</p>
                {cap.modelConfig && (
                  <div className="text-xs space-y-1">
                    <div><span className="text-gray-500">{t.modelType}:</span> <span className="text-white">{cap.modelConfig.modelType}</span></div>
                    {cap.modelConfig.trainingDataRequirements && (
                      <div><span className="text-gray-500">Training Data:</span> <span className="text-gray-400">{cap.modelConfig.trainingDataRequirements}</span></div>
                    )}
                  </div>
                )}
                {cap.enabledActions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cap.enabledActions.map(action => (
                      <span key={action} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">{action}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* UI Layer Tab */}
        {activeTab === 'ui' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <LayoutDashboard size={14} className="text-cyan-400" />
              {t.dashboards}
            </h3>
            {archetype.dashboards.map(dashboard => (
              <div key={dashboard.id} className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{dashboard.name}</h4>
                  <span className="text-xs text-gray-500">{t.targetRole}: {dashboard.targetRole}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{dashboard.description[lang === 'cn' ? 'cn' : 'en']}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{dashboard.widgets.length} {t.widgets}</span>
                  <span>{dashboard.gridColumns}x{dashboard.gridRows} grid</span>
                </div>
              </div>
            ))}

            {archetype.views.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-white flex items-center gap-2 mt-6">
                  <Layers size={14} className="text-emerald-400" />
                  {t.views}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {archetype.views.map(view => (
                    <div key={view.id} className="glass-surface rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-white">{view.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{view.type}</span>
                      </div>
                      <p className="text-xs text-gray-500">{view.fields.length} fields · {view.objectId}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Deployment Tab */}
        {activeTab === 'deployment' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Requirements */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Server size={14} className="text-cyan-400" />
                {t.requirements}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Platform:</span>
                  <span className="text-white ml-2">{archetype.deployment.requirements.platform.join(', ')}</span>
                </div>
                {archetype.deployment.requirements.resources && (
                  <>
                    <div>
                      <span className="text-gray-500">CPU:</span>
                      <span className="text-white ml-2">{archetype.deployment.requirements.resources.cpu}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Memory:</span>
                      <span className="text-white ml-2">{archetype.deployment.requirements.resources.memory}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Storage:</span>
                      <span className="text-white ml-2">{archetype.deployment.requirements.resources.storage}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Environment Variables */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Settings size={14} className="text-amber-400" />
                {t.envVariables}
              </h3>
              <div className="space-y-2">
                {archetype.deployment.environmentVariables.map(env => (
                  <div key={env.name} className="glass-surface rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <code className="text-cyan-400 font-mono">{env.name}</code>
                      {env.required && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">required</span>}
                    </div>
                    <p className="text-gray-500 mt-1">{env.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <FileJson size={14} className="text-emerald-400" />
                {t.quickStart}
              </h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="bg-black/30 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {archetype.documentation.quickStart[lang === 'cn' ? 'cn' : 'en']}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="glass-card rounded-xl p-4">
    <div className="flex items-center gap-2 text-gray-500 mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-lg font-semibold text-white">{value}</span>
  </div>
);

const MiniStatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="glass-surface rounded-lg p-3 text-center">
    <span className={`text-2xl font-bold text-${color}-400`}>{value}</span>
    <p className="text-[10px] text-gray-500 uppercase mt-1">{label}</p>
  </div>
);

const CollapsibleSection: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, badge, isExpanded, onToggle, children }) => (
  <div className="glass-card rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-center gap-3">
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <div className="text-left">
          <span className="text-white font-medium">{title}</span>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && <span className="text-xs text-gray-500">{badge}</span>}
    </button>
    {isExpanded && (
      <div className="px-5 pb-5 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

export default ArchetypeViewer;

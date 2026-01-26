/**
 * Archetype Viewer Component
 * 原型详情查看器
 *
 * 展示 Archetype 的完整三层架构（Semantic/Kinetic/Dynamic）+ AI 能力叠加详情
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
      <div className="h-full flex items-center justify-center bg-[var(--color-bg-elevated)]">
        <div className="text-center text-muted">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p>{t.notFound}</p>
          <button onClick={onBack} className="mt-4 text-amber-400 hover:underline">
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
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              {t.back}
            </button>
            <div className="h-6 w-px bg-white/[0.1]" />
            <div>
              <h1 className="text-lg font-semibold text-white">{archetype.metadata.name}</h1>
              <p className="text-xs text-muted">{archetype.metadata.description[lang === 'cn' ? 'cn' : 'en']}</p>
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
                  <Users size={14} className="text-amber-400" />
                  {t.origin}
                </h3>
                <div className="text-sm text-muted space-y-2">
                  {archetype.metadata.origin.sourceEngagement && (
                    <p><span className="text-muted">Source:</span> {archetype.metadata.origin.sourceEngagement}</p>
                  )}
                  {archetype.metadata.origin.fdeContributors && (
                    <p><span className="text-muted">{t.contributors}:</span> {archetype.metadata.origin.fdeContributors.join(', ')}</p>
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
              <MiniStatCard label={t.dashboards} value={archetype.dashboards.length} color="amber" />
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
                    <h4 className="text-xs text-muted uppercase mb-2">{t.properties}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {obj.properties?.slice(0, 8).map(prop => (
                        <div key={prop.name} className="glass-surface rounded-lg px-3 py-2 text-xs">
                          <span className="text-amber-400 font-mono">{prop.name}</span>
                          <span className="text-muted ml-2">{prop.type}</span>
                          {prop.isAIDerived && (
                            <span className="ml-2 text-micro px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">AI</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {obj.actions && obj.actions.length > 0 && (
                    <div>
                      <h4 className="text-xs text-muted uppercase mb-2">{t.actions}</h4>
                      <div className="space-y-2">
                        {obj.actions.map((action, idx) => (
                          <div key={idx} className="glass-surface rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Zap size={12} className={action.type === 'generative' ? 'text-purple-400' : 'text-amber-400'} />
                              <span className="text-sm text-white">{action.name}</span>
                              {action.type === 'generative' && (
                                <span className="text-micro px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">AI</span>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-1">{action.description}</p>
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
                  {archetype.ontology.links.map((link, idx) => {
                    // Handle both old and new link structures
                    const linkAny = link as any;
                    const source = linkAny.source || linkAny.sourceId || 'unknown';
                    const target = linkAny.target || linkAny.targetId || 'unknown';
                    const label = linkAny.label || linkAny.relation || 'relates to';

                    return (
                      <div key={linkAny.id || idx} className="glass-surface rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                        <span className="text-amber-400">{source}</span>
                        <span className="text-muted">→</span>
                        <span className="text-emerald-400">{label}</span>
                        <span className="text-muted">→</span>
                        <span className="text-amber-400">{target}</span>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* Kinetic Layer Tab */}
        {activeTab === 'kinetic' && (
          <div className="space-y-4 animate-fadeIn">
            {archetype.connectors.map(connector => {
              // Handle both old and new connector structures
              const connectorAny = connector as any;
              const description = connectorAny.description?.cn || connectorAny.description?.en || '';
              const syncFrequency = connectorAny.sync?.frequency || connectorAny.syncFrequency || 'N/A';
              const sourceSystem = connectorAny.sourceSystem || connectorAny.configuration?.supportedSystems?.join(', ') || 'N/A';
              const mappedObjects = connectorAny.mappedObjects || [];
              const targetObjects = connectorAny.targetObjects || [];
              const fieldMapping = connectorAny.fieldMapping || [];

              return (
                <CollapsibleSection
                  key={connector.id}
                  title={connector.name}
                  subtitle={description}
                  isExpanded={expandedSections.has(connector.id)}
                  onToggle={() => toggleSection(connector.id)}
                  badge={`${connector.sourceType} · ${syncFrequency}`}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted">{t.sourceSystem}:</span>
                        <span className="text-white ml-2">{sourceSystem}</span>
                      </div>
                      <div>
                        <span className="text-muted">{t.syncFrequency}:</span>
                        <span className="text-white ml-2">{syncFrequency}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs text-muted mb-2">{t.mappedObjects}</h4>
                      <div className="space-y-1">
                        {/* Old structure: mappedObjects */}
                        {mappedObjects.length > 0 && mappedObjects.map((mapping: any, idx: number) => (
                          <div key={idx} className="glass-surface rounded px-2 py-1.5 text-xs">
                            <span className="text-muted">{mapping.sourceEntity}</span>
                            <span className="text-muted mx-2">→</span>
                            <span className="text-amber-400">{mapping.objectId}</span>
                            <span className="text-muted ml-2">({mapping.fieldMappings?.length || 0} fields)</span>
                          </div>
                        ))}
                        {/* New structure: targetObjects + fieldMapping */}
                        {mappedObjects.length === 0 && targetObjects.length > 0 && (
                          <>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {targetObjects.map((obj: string, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">{obj}</span>
                              ))}
                            </div>
                            {fieldMapping.length > 0 && (
                              <div className="space-y-1 mt-2">
                                <h5 className="text-xs text-muted">Field Mappings:</h5>
                                {fieldMapping.slice(0, 5).map((fm: any, idx: number) => (
                                  <div key={idx} className="glass-surface rounded px-2 py-1.5 text-xs">
                                    <span className="text-muted font-mono">{fm.source}</span>
                                    <span className="text-muted mx-2">→</span>
                                    <span className="text-amber-400 font-mono">{fm.target}</span>
                                  </div>
                                ))}
                                {fieldMapping.length > 5 && (
                                  <p className="text-xs text-muted">...and {fieldMapping.length - 5} more</p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              );
            })}
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
            {archetype.workflows.map(workflow => {
              // Handle both old and new workflow structures
              const workflowAny = workflow as any;
              const description = workflowAny.description?.cn || workflowAny.description?.en || workflowAny.descriptionCn || workflowAny.nameCn || '';
              const triggerType = workflowAny.trigger?.type || workflowAny.triggerType || 'N/A';
              const triggerCondition = workflowAny.trigger?.config || workflowAny.triggerCondition || '';

              return (
                <CollapsibleSection
                  key={workflow.id}
                  title={workflow.name}
                  subtitle={description}
                  isExpanded={expandedSections.has(workflow.id)}
                  onToggle={() => toggleSection(workflow.id)}
                  badge={`${workflow.steps.length} ${t.steps}`}
                >
                  <div className="space-y-3">
                    <div className="text-xs">
                      <span className="text-muted">{t.trigger}:</span>
                      <span className="text-white ml-2">{triggerType}</span>
                      {triggerCondition && typeof triggerCondition === 'string' && (
                        <span className="text-muted ml-2">({triggerCondition})</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {workflow.steps.map((step: any, idx: number) => (
                        <div key={step.id || idx} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-micro">
                            {step.order || idx + 1}
                          </span>
                          <span className="text-white">{step.name}</span>
                          <span className="text-muted">({step.type || step.action || 'action'})</span>
                        </div>
                      ))}
                    </div>
                    {/* SLA info */}
                    {workflowAny.sla && (
                      <div className="text-xs mt-2 pt-2 border-t border-white/[0.05]">
                        <span className="text-muted">SLA:</span>
                        <span className="text-emerald-400 ml-2">{workflowAny.sla.targetTime || workflowAny.sla.maxDuration}</span>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              );
            })}

            {/* Rules - handle both 'rules' and 'businessRules' */}
            {(() => {
              const archetypeAny = archetype as any;
              const rules = archetypeAny.rules || archetypeAny.businessRules || [];
              if (rules.length === 0) return null;

              return (
                <>
                  <h3 className="text-sm font-medium text-white flex items-center gap-2 mt-6">
                    <Shield size={14} className="text-amber-400" />
                    {t.rules}
                  </h3>
                  {rules.map((rule: any) => {
                    const ruleDescription = rule.description?.cn || rule.description?.en || rule.action || '';
                    const ruleType = rule.type || rule.category || 'rule';
                    const ruleExpression = rule.expression || rule.condition || '';

                    return (
                      <div key={rule.id} className="glass-card rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={14} className="text-amber-400" />
                          <span className="text-sm text-white">{rule.name}</span>
                          <span className="text-micro px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">{ruleType}</span>
                        </div>
                        <p className="text-xs text-muted">{ruleDescription}</p>
                        {ruleExpression && (
                          <code className="block mt-2 text-micro text-amber-400 font-mono bg-[var(--color-bg-base)]/30 rounded px-2 py-1">
                            {ruleExpression}
                          </code>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}

        {/* AI Layer Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-fadeIn">
            {archetype.aiCapabilities.map(cap => {
              // Handle both old and new AI capability structures
              const capAny = cap as any;
              const description = capAny.description?.cn || capAny.description?.en || capAny.description || capAny.descriptionCn || '';
              const modelConfig = capAny.modelConfig || capAny.modelDetails || null;
              const enabledActions = capAny.enabledActions || [];
              const inputObjects = capAny.inputObjects || [];
              const outputProperties = capAny.outputProperties || [];

              return (
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
                  <p className="text-sm text-muted mb-4">{description}</p>

                  {/* Model details */}
                  {modelConfig && (
                    <div className="text-xs space-y-1 mb-3">
                      <div>
                        <span className="text-muted">{t.modelType}:</span>
                        <span className="text-white ml-2">{modelConfig.modelType || modelConfig.algorithm || 'N/A'}</span>
                      </div>
                      {(modelConfig.trainingDataRequirements || modelConfig.trainingFrequency) && (
                        <div>
                          <span className="text-muted">Training:</span>
                          <span className="text-muted ml-2">{modelConfig.trainingDataRequirements || modelConfig.trainingFrequency}</span>
                        </div>
                      )}
                      {modelConfig.accuracy && (
                        <div>
                          <span className="text-muted">Accuracy:</span>
                          <span className="text-emerald-400 ml-2">{modelConfig.accuracy}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input objects */}
                  {inputObjects.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-muted">Input Objects:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {inputObjects.map((obj: string) => (
                          <span key={obj} className="text-micro px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{obj}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output properties */}
                  {outputProperties.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-muted">Output Properties:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {outputProperties.map((prop: string) => (
                          <span key={prop} className="text-micro px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">{prop}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enabled actions */}
                  {enabledActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {enabledActions.map((action: string) => (
                        <span key={action} className="text-micro px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">{action}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* UI Layer Tab */}
        {activeTab === 'ui' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <LayoutDashboard size={14} className="text-amber-400" />
              {t.dashboards}
            </h3>
            {archetype.dashboards.map(dashboard => {
              // Handle both old and new dashboard structures
              const dashboardAny = dashboard as any;
              const description = dashboardAny.description?.cn || dashboardAny.description?.en || dashboardAny.description || dashboardAny.nameCn || '';
              const targetRole = dashboardAny.targetRole || (dashboardAny.targetAudience ? dashboardAny.targetAudience.join(', ') : 'N/A');
              const layout = dashboardAny.gridColumns && dashboardAny.gridRows
                ? `${dashboardAny.gridColumns}x${dashboardAny.gridRows} grid`
                : dashboardAny.layout || 'flexible';

              return (
                <div key={dashboard.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{dashboard.name}</h4>
                    <span className="text-xs text-muted">{t.targetRole}: {targetRole}</span>
                  </div>
                  <p className="text-sm text-muted mb-4">{description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span>{dashboardAny.widgets?.length || 0} {t.widgets}</span>
                    <span>{layout}</span>
                    {dashboardAny.refreshInterval && (
                      <span>Refresh: {dashboardAny.refreshInterval}s</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Views - handle optional views array */}
            {(() => {
              const archetypeAny = archetype as any;
              const views = archetypeAny.views || [];
              if (views.length === 0) return null;

              return (
                <>
                  <h3 className="text-sm font-medium text-white flex items-center gap-2 mt-6">
                    <Layers size={14} className="text-emerald-400" />
                    {t.views}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {views.map((view: any) => (
                      <div key={view.id} className="glass-surface rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-white">{view.name}</span>
                          <span className="text-micro px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{view.type}</span>
                        </div>
                        <p className="text-xs text-muted">{view.fields?.length || 0} fields · {view.objectId}</p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Deployment Tab */}
        {activeTab === 'deployment' && (
          <div className="space-y-6 animate-fadeIn">
            {(() => {
              const deploymentAny = archetype.deployment as any;
              const archetypeAny = archetype as any;

              // Handle different deployment structures
              const prerequisites = deploymentAny.prerequisites || [];
              const requirements = deploymentAny.requirements || {};
              const envVars = deploymentAny.environmentVariables || [];
              const phases = deploymentAny.phases || [];
              const roleConfig = deploymentAny.roleConfig || [];
              const integrationPoints = deploymentAny.integrationPoints || [];
              const documentation = archetypeAny.documentation || {};

              return (
                <>
                  {/* Prerequisites (new structure) */}
                  {prerequisites.length > 0 && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-400" />
                        Prerequisites
                      </h3>
                      <ul className="space-y-2">
                        {prerequisites.map((prereq: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements (old structure) */}
                  {requirements.platform && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Server size={14} className="text-amber-400" />
                        {t.requirements}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted">Platform:</span>
                          <span className="text-white ml-2">{requirements.platform?.join(', ') || 'N/A'}</span>
                        </div>
                        {requirements.resources && (
                          <>
                            {requirements.resources.cpu && (
                              <div>
                                <span className="text-muted">CPU:</span>
                                <span className="text-white ml-2">{requirements.resources.cpu}</span>
                              </div>
                            )}
                            {requirements.resources.memory && (
                              <div>
                                <span className="text-muted">Memory:</span>
                                <span className="text-white ml-2">{requirements.resources.memory}</span>
                              </div>
                            )}
                            {requirements.resources.storage && (
                              <div>
                                <span className="text-muted">Storage:</span>
                                <span className="text-white ml-2">{requirements.resources.storage}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deployment Phases (new structure) */}
                  {phases.length > 0 && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Workflow size={14} className="text-purple-400" />
                        Deployment Phases
                      </h3>
                      <div className="space-y-4">
                        {phases.map((phase: any) => (
                          <div key={phase.phase} className="glass-surface rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium">
                                  {phase.phase}
                                </span>
                                <span className="text-white font-medium">{phase.name}</span>
                              </div>
                              <span className="text-xs text-muted">{phase.duration}</span>
                            </div>
                            <ul className="space-y-1 ml-8">
                              {phase.deliverables?.map((d: string, idx: number) => (
                                <li key={idx} className="text-xs text-muted">• {d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environment Variables */}
                  {envVars.length > 0 && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Settings size={14} className="text-amber-400" />
                        {t.envVariables}
                      </h3>
                      <div className="space-y-2">
                        {envVars.map((env: any) => (
                          <div key={env.name} className="glass-surface rounded-lg px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <code className="text-amber-400 font-mono">{env.name}</code>
                              {env.required && <span className="text-micro px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">required</span>}
                            </div>
                            <p className="text-muted mt-1">{env.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Role Configuration (new structure) */}
                  {roleConfig.length > 0 && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <Users size={14} className="text-blue-400" />
                        Role Configuration
                      </h3>
                      <div className="space-y-2">
                        {roleConfig.map((role: any) => (
                          <div key={role.role} className="glass-surface rounded-lg px-3 py-2 text-xs">
                            <span className="text-white font-medium">{role.role}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {role.permissions?.map((perm: string, idx: number) => (
                                <span key={idx} className="text-micro px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{perm}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integration Points (new structure) */}
                  {integrationPoints.length > 0 && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <GitBranch size={14} className="text-amber-400" />
                        Integration Points
                      </h3>
                      <div className="space-y-2">
                        {integrationPoints.map((point: any, idx: number) => (
                          <div key={idx} className="glass-surface rounded-lg px-3 py-2 text-xs flex items-center justify-between">
                            <span className="text-white">{point.system}</span>
                            <div className="flex items-center gap-3 text-muted">
                              <span>{point.direction}</span>
                              <span>{point.frequency}</span>
                              {point.dataVolume && <span className="text-muted">{point.dataVolume}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Start (old structure with documentation) */}
                  {documentation.quickStart && (
                    <div className="glass-card rounded-xl p-5">
                      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        <FileJson size={14} className="text-emerald-400" />
                        {t.quickStart}
                      </h3>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="bg-[var(--color-bg-base)]/30 rounded-lg p-4 text-xs text-secondary overflow-x-auto whitespace-pre-wrap">
                          {documentation.quickStart[lang === 'cn' ? 'cn' : 'en'] || documentation.quickStart}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="glass-card rounded-xl p-4">
    <div className="flex items-center gap-2 text-muted mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-lg font-semibold text-white">{value}</span>
  </div>
);

const MiniStatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="glass-surface rounded-lg p-3 text-center">
    <span className={`text-2xl font-bold text-${color}-400`}>{value}</span>
    <p className="text-micro text-muted uppercase mt-1">{label}</p>
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
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && <span className="text-xs text-muted">{badge}</span>}
    </button>
    {isExpanded && (
      <div className="px-5 pb-5 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

export default ArchetypeViewer;


import React, { useState } from 'react';
import { OntologyObject, OntologyLink, Language, AIPAction } from '../types';
import { Database, Link as LinkIcon, Zap, ChevronRight, ChevronDown, Binary, Briefcase, GitBranch, Code, Shield, HelpCircle, Sparkles } from 'lucide-react';

interface Props {
  lang: Language;
  objects: OntologyObject[];
  links: OntologyLink[];
}

const translations = {
  en: {
    title: "Logical Ontology",
    subtitle: "Objects, properties, and their linked semantic relationships.",
    objCount: "Objects",
    linkCount: "Links",
    augmented: "AI Augmented",
    attributes: "Attributes",
    actions: "Actions",
    details: "Details",
    relationships: "Ontology Relationships",
    legend: "Legend",
    legendTip: "Click Action to expand details",
    // Three-layer definition labels
    businessLayer: "Business Layer",
    logicLayer: "Logic Layer",
    implementationLayer: "Implementation Layer",
    governance: "Governance",
    targetObject: "Target",
    executor: "Executor",
    trigger: "Trigger",
    preconditions: "Preconditions",
    parameters: "Parameters",
    postconditions: "Postconditions",
    sideEffects: "Side Effects",
    apiEndpoint: "API Endpoint",
    agentTool: "Agent Tool",
    permissionTier: "Permission Tier",
    humanApproval: "Human Approval",
    riskLevel: "Risk Level",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No",
    // Legend descriptions
    businessDesc: "Who, What, When",
    logicDesc: "Pre/Post conditions",
    implDesc: "API & Tools",
    govDesc: "Permissions & Risk",
    aiProp: "AI Derived",
    aiAction: "AI Generated"
  },
  cn: {
    title: "逻辑本体模型",
    subtitle: "定义核心对象、属性及其语义关联关系。",
    objCount: "对象数量",
    linkCount: "关联数量",
    augmented: "AI 增强",
    attributes: "实体属性",
    actions: "业务操作",
    details: "详情",
    relationships: "本体关联关系图",
    legend: "图例说明",
    legendTip: "点击 Action 展开详情",
    // 三层定义标签
    businessLayer: "业务层",
    logicLayer: "逻辑层",
    implementationLayer: "实现层",
    governance: "治理",
    targetObject: "目标对象",
    executor: "执行角色",
    trigger: "触发条件",
    preconditions: "前置条件",
    parameters: "输入参数",
    postconditions: "后置状态",
    sideEffects: "副作用",
    apiEndpoint: "API 端点",
    agentTool: "Agent 工具",
    permissionTier: "权限等级",
    humanApproval: "人工审批",
    riskLevel: "风险等级",
    required: "必填",
    optional: "可选",
    yes: "是",
    no: "否",
    // 图例描述
    businessDesc: "谁、做什么、何时",
    logicDesc: "前置/后置条件",
    implDesc: "API与工具",
    govDesc: "权限与风险",
    aiProp: "AI派生属性",
    aiAction: "AI生成动作"
  }
};

const OntologyVisualizer: React.FC<Props> = ({ lang, objects, links }) => {
  const t = translations[lang];
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [showLegend, setShowLegend] = useState(false);

  const toggleAction = (actionKey: string) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionKey)) {
        newSet.delete(actionKey);
      } else {
        newSet.add(actionKey);
      }
      return newSet;
    });
  };

  const renderActionDetails = (action: AIPAction) => {
    const hasBusinessLayer = action.businessLayer;
    const hasLogicLayer = action.logicLayer;
    const hasImplementationLayer = action.implementationLayer;
    const hasGovernance = action.governance;

    if (!hasBusinessLayer && !hasLogicLayer && !hasImplementationLayer && !hasGovernance) {
      return (
        <div className="text-xs text-muted italic p-3 bg-[var(--color-bg-base)]/20 rounded-lg">
          {lang === 'cn' ? '暂无详细定义' : 'No detailed definition yet'}
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-2">
        {/* 业务层 */}
        {hasBusinessLayer && (
          <div className="p-3 layer-business border rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 text-micro font-medium mb-2">
              <Briefcase size={11} />
              {t.businessLayer}
            </div>
            <div className="space-y-1.5 text-xs">
              {action.businessLayer!.description && (
                <p className="text-secondary">{action.businessLayer!.description}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
                {action.businessLayer!.targetObject && (
                  <span><span className="text-muted">{t.targetObject}:</span> {action.businessLayer!.targetObject}</span>
                )}
                {action.businessLayer!.executorRole && (
                  <span><span className="text-muted">{t.executor}:</span> {action.businessLayer!.executorRole}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 逻辑层 */}
        {hasLogicLayer && (
          <div className="p-3 layer-logic border rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400 text-micro font-medium mb-2">
              <GitBranch size={11} />
              {t.logicLayer}
            </div>
            <div className="space-y-2 text-xs">
              {action.logicLayer!.preconditions?.length > 0 && (
                <div>
                  <span className="text-muted text-micro">{t.preconditions}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {action.logicLayer!.preconditions.map((pre, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-micro">{pre}</span>
                    ))}
                  </div>
                </div>
              )}
              {action.logicLayer!.parameters?.length > 0 && (
                <div>
                  <span className="text-muted text-micro">{t.parameters}:</span>
                  <div className="mt-1 space-y-1">
                    {action.logicLayer!.parameters.map((param, i) => (
                      <div key={i} className="flex items-center gap-2 text-micro">
                        <span className="text-secondary font-mono">{param.name}</span>
                        <span className="text-muted">({param.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {action.logicLayer!.postconditions?.length > 0 && (
                <div>
                  <span className="text-muted text-micro">{t.postconditions}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {action.logicLayer!.postconditions.map((post, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded text-micro">{post}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 实现层 */}
        {hasImplementationLayer && (
          <div className="p-3 layer-impl border rounded-lg">
            <div className="flex items-center gap-2 text-micro font-medium mb-2" style={{ color: 'var(--color-accent-secondary)' }}>
              <Code size={11} />
              {t.implementationLayer}
            </div>
            <div className="space-y-1 text-xs">
              {action.implementationLayer!.apiEndpoint && (
                <code className="block px-2 py-1 bg-[var(--color-bg-base)]/30 text-purple-300 rounded font-mono text-micro">
                  {action.implementationLayer!.apiMethod || 'POST'} {action.implementationLayer!.apiEndpoint}
                </code>
              )}
              {action.implementationLayer!.agentToolSpec && (
                <code className="block text-purple-300 font-mono text-micro">
                  {action.implementationLayer!.agentToolSpec.name}()
                </code>
              )}
            </div>
          </div>
        )}

        {/* 治理 */}
        {hasGovernance && (
          <div className="p-3 layer-gov border rounded-lg">
            <div className="flex items-center gap-2 text-orange-400 text-micro font-medium mb-2">
              <Shield size={11} />
              {t.governance}
            </div>
            <div className="flex flex-wrap gap-3 text-micro text-muted">
              {action.governance!.permissionTier && (
                <span>Tier {action.governance!.permissionTier}</span>
              )}
              {action.governance!.requiresHumanApproval && (
                <span style={{ color: 'var(--color-accent)' }}>{t.humanApproval}</span>
              )}
              {action.governance!.riskLevel && (
                <span style={{
                  color: action.governance!.riskLevel === 'high' ? 'var(--color-error)' :
                  action.governance!.riskLevel === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'
                }}>
                  {action.governance!.riskLevel} risk
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 h-full bg-[var(--color-bg-elevated)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
          <p className="text-muted text-sm">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs text-muted">
            <span>{t.objCount}: <span style={{ color: 'var(--color-accent)' }}>{objects.length}</span></span>
            <span>{t.linkCount}: <span style={{ color: 'var(--color-accent-secondary)' }}>{links.length}</span></span>
          </div>
          {/* Legend Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-secondary transition-colors"
            >
              <HelpCircle size={14} />
              {t.legend}
            </button>
            {showLegend && (
              <div className="absolute right-0 top-full mt-2 p-4 glass-card rounded-xl z-10 w-80 animate-fadeIn">
                <div className="space-y-3">
                  <div className="text-micro text-muted mb-2">{t.legendTip}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-blue-500/60"></span>
                      <span className="text-micro text-muted">{t.businessLayer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-emerald-500/60"></span>
                      <span className="text-micro text-muted">{t.logicLayer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-purple-500/60"></span>
                      <span className="text-micro text-muted">{t.implementationLayer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-orange-500/60"></span>
                      <span className="text-micro text-muted">{t.governance}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} style={{ color: 'var(--color-accent)' }} />
                      <span className="text-micro text-muted">{t.aiAction}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={10} style={{ color: 'var(--color-accent)' }} />
                      <span className="text-micro text-muted">{t.aiProp}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="masonry-grid">
        {objects.map((obj) => (
          <div key={obj.id} className="masonry-item glass-card rounded-xl p-5 contain-layout">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                  <Database size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{obj.name}</h3>
                  <p className="text-micro text-muted font-mono">{obj.id}</p>
                </div>
              </div>
              {obj.aiFeatures.length > 0 && (
                <span className="px-2 py-0.5 text-micro rounded" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-bg-hover)' }}>
                  AI
                </span>
              )}
            </div>

            {/* Description */}
            {obj.description && (
              <p className="text-xs text-muted mb-4 line-clamp-2 leading-relaxed">
                {obj.description}
              </p>
            )}

            {/* Attributes */}
            <div className="mb-4">
              <span className="text-micro text-muted block mb-2">{t.attributes}</span>
              <div className="flex flex-wrap gap-1.5">
                {obj.properties.slice(0, 6).map((prop, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-micro"
                    style={{
                      backgroundColor: prop.isAIDerived ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                      color: prop.isAIDerived ? 'var(--color-accent)' : 'var(--color-text-muted)'
                    }}
                  >
                    {prop.name}
                  </span>
                ))}
                {obj.properties.length > 6 && (
                  <span className="px-2 py-1 text-micro text-muted">
                    +{obj.properties.length - 6}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <span className="text-micro text-muted block mb-2">{t.actions}</span>
              <div className="space-y-1.5">
                {obj.actions.map((action, idx) => {
                  const actionKey = `${obj.id}-${idx}`;
                  const isExpanded = expandedActions.has(actionKey);
                  const hasDetails = action.businessLayer || action.logicLayer || action.implementationLayer || action.governance;

                  return (
                    <div key={idx} className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                      <div
                        onClick={() => hasDetails && toggleAction(actionKey)}
                        className={`flex items-center justify-between text-xs px-3 py-2 transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
                        style={{ backgroundColor: isExpanded ? 'var(--color-bg-hover)' : 'transparent' }}
                      >
                        <div className="flex items-center gap-2">
                          {action.type === 'generative' ? (
                            <Zap size={12} style={{ color: 'var(--color-accent)' }} />
                          ) : (
                            <ChevronRight size={12} className="text-muted" />
                          )}
                          <span style={{ color: action.type === 'generative' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                            {action.name}
                          </span>
                        </div>
                        {hasDetails && (
                          <ChevronDown
                            size={14}
                            className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                      {isExpanded && (
                        <div className="px-3 pb-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
                          {renderActionDetails(action)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Links Section */}
      {links.length > 0 && (
        <div className="mt-8 glass-card rounded-xl p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <LinkIcon size={16} style={{ color: 'var(--color-accent-secondary)' }} />
            {t.relationships}
          </h3>
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
              >
                <span className="text-xs" style={{ color: 'var(--color-accent)' }}>{link.source}</span>
                <span className="text-micro text-muted px-2">
                  {link.isSemantic ? '—•—' : '———'}
                </span>
                <span className="text-micro text-muted">{link.label}</span>
                <span className="text-micro text-muted px-2">→</span>
                <span className="text-xs" style={{ color: 'var(--color-accent)' }}>{link.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
  </svg>
);

export default OntologyVisualizer;

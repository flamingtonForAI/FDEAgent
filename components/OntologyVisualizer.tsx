
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
        <div className="text-xs text-gray-500 italic p-3 bg-[var(--color-bg-base)]/20 rounded-lg">
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
                <p className="text-gray-300">{action.businessLayer!.description}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-400">
                {action.businessLayer!.targetObject && (
                  <span><span className="text-gray-500">{t.targetObject}:</span> {action.businessLayer!.targetObject}</span>
                )}
                {action.businessLayer!.executorRole && (
                  <span><span className="text-gray-500">{t.executor}:</span> {action.businessLayer!.executorRole}</span>
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
                  <span className="text-gray-500 text-micro">{t.preconditions}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {action.logicLayer!.preconditions.map((pre, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-micro">{pre}</span>
                    ))}
                  </div>
                </div>
              )}
              {action.logicLayer!.parameters?.length > 0 && (
                <div>
                  <span className="text-gray-500 text-micro">{t.parameters}:</span>
                  <div className="mt-1 space-y-1">
                    {action.logicLayer!.parameters.map((param, i) => (
                      <div key={i} className="flex items-center gap-2 text-micro">
                        <span className="text-gray-300 font-mono">{param.name}</span>
                        <span className="text-gray-500">({param.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {action.logicLayer!.postconditions?.length > 0 && (
                <div>
                  <span className="text-gray-500 text-micro">{t.postconditions}:</span>
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
            <div className="flex items-center gap-2 text-purple-400 text-micro font-medium mb-2">
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
            <div className="flex flex-wrap gap-3 text-micro text-gray-400">
              {action.governance!.permissionTier && (
                <span>Tier {action.governance!.permissionTier}</span>
              )}
              {action.governance!.requiresHumanApproval && (
                <span className="text-amber-400">{t.humanApproval}</span>
              )}
              {action.governance!.riskLevel && (
                <span className={
                  action.governance!.riskLevel === 'high' ? 'text-red-400' :
                  action.governance!.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                }>
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
          <h2 className="text-xl font-medium text-white mb-1">{t.title}</h2>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs text-gray-500">
            <span>{t.objCount}: <span className="text-amber-400">{objects.length}</span></span>
            <span>{t.linkCount}: <span className="text-purple-400">{links.length}</span></span>
          </div>
          {/* Legend Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
            >
              <HelpCircle size={14} />
              {t.legend}
            </button>
            {showLegend && (
              <div className="absolute right-0 top-full mt-2 p-4 glass-card rounded-xl z-10 w-80 animate-fadeIn">
                <div className="space-y-3">
                  <div className="text-micro text-gray-500 mb-2">{t.legendTip}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-blue-500/60"></span>
                      <span className="text-micro text-gray-400">{t.businessLayer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-emerald-500/60"></span>
                      <span className="text-micro text-gray-400">{t.logicLayer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-purple-500/60"></span>
                      <span className="text-micro text-gray-400">{t.implementationLayer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded bg-orange-500/60"></span>
                      <span className="text-micro text-gray-400">{t.governance}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} className="text-amber-400" />
                      <span className="text-micro text-gray-400">{t.aiAction}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={10} className="text-amber-400" />
                      <span className="text-micro text-gray-400">{t.aiProp}</span>
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
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <Database size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{obj.name}</h3>
                  <p className="text-micro text-gray-500 font-mono">{obj.id}</p>
                </div>
              </div>
              {obj.aiFeatures.length > 0 && (
                <span className="px-2 py-0.5 text-micro text-amber-400 bg-amber-500/10 rounded">
                  AI
                </span>
              )}
            </div>

            {/* Description */}
            {obj.description && (
              <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                {obj.description}
              </p>
            )}

            {/* Attributes */}
            <div className="mb-4">
              <span className="text-micro text-gray-500 block mb-2">{t.attributes}</span>
              <div className="flex flex-wrap gap-1.5">
                {obj.properties.slice(0, 6).map((prop, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-micro ${
                      prop.isAIDerived
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-white/[0.04] text-gray-400'
                    }`}
                  >
                    {prop.name}
                  </span>
                ))}
                {obj.properties.length > 6 && (
                  <span className="px-2 py-1 text-micro text-gray-500">
                    +{obj.properties.length - 6}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <span className="text-micro text-gray-500 block mb-2">{t.actions}</span>
              <div className="space-y-1.5">
                {obj.actions.map((action, idx) => {
                  const actionKey = `${obj.id}-${idx}`;
                  const isExpanded = expandedActions.has(actionKey);
                  const hasDetails = action.businessLayer || action.logicLayer || action.implementationLayer || action.governance;

                  return (
                    <div key={idx} className="rounded-lg bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                      <div
                        onClick={() => hasDetails && toggleAction(actionKey)}
                        className={`flex items-center justify-between text-xs px-3 py-2 transition-colors ${
                          hasDetails ? 'hover:bg-white/[0.04] cursor-pointer' : ''
                        } ${isExpanded ? 'bg-white/[0.04]' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {action.type === 'generative' ? (
                            <Zap size={12} className="text-amber-400" />
                          ) : (
                            <ChevronRight size={12} className="text-gray-500" />
                          )}
                          <span className={action.type === 'generative' ? 'text-amber-300' : 'text-gray-300'}>
                            {action.name}
                          </span>
                        </div>
                        {hasDetails && (
                          <ChevronDown
                            size={14}
                            className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-white/[0.04]">
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
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <LinkIcon size={16} className="text-purple-400" />
            {t.relationships}
          </h3>
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="text-xs text-amber-400">{link.source}</span>
                <span className="text-micro text-gray-500 px-2">
                  {link.isSemantic ? '—•—' : '———'}
                </span>
                <span className="text-micro text-gray-500">{link.label}</span>
                <span className="text-micro text-gray-500 px-2">→</span>
                <span className="text-xs text-amber-400">{link.target}</span>
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

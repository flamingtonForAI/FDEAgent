import React, { useMemo, useState } from 'react';
import { Language, ProjectState } from '../types';
import { checkActionThreeLayers, ActionLayerStatus, ThreeLayerReport } from '../utils/qualityChecker';
import {
  Layers, Briefcase, Cpu, Code,
  CheckCircle2, AlertCircle, XCircle,
  ChevronDown, ChevronRight, Info, Zap
} from 'lucide-react';

interface ActionThreeLayerPanelProps {
  lang: Language;
  project: ProjectState;
  compact?: boolean;
}

const translations = {
  en: {
    title: 'Action Three-Layer Check',
    subtitle: 'Business → Logic → Implementation completeness',
    noActions: 'No actions defined yet',
    businessLayer: 'Business Layer',
    logicLayer: 'Logic Layer',
    implLayer: 'Implementation',
    complete: 'Complete',
    partial: 'Partial',
    minimal: 'Minimal',
    avgScore: 'Avg Score',
    totalActions: 'Total Actions',
    // Business layer items
    description: 'Description',
    targetObject: 'Target Object',
    executorRole: 'Executor Role',
    triggerCondition: 'Trigger',
    // Logic layer items
    preconditions: 'Preconditions',
    parameters: 'Parameters',
    postconditions: 'Postconditions',
    sideEffects: 'Side Effects',
    // Implementation layer items
    apiEndpoint: 'API Endpoint',
    apiMethod: 'HTTP Method',
    agentToolSpec: 'Agent Tool Spec',
    // Tips
    tip: 'Tip',
    businessTip: 'Define WHO can execute, WHAT it does, and WHEN it triggers',
    logicTip: 'Define input parameters, preconditions, and state changes',
    implTip: 'Define the API endpoint for system integration'
  },
  cn: {
    title: 'Action 三层完整性检查',
    subtitle: '业务层 → 逻辑层 → 实现层 完整度',
    noActions: '尚未定义 Action',
    businessLayer: '业务层',
    logicLayer: '逻辑层',
    implLayer: '实现层',
    complete: '完整',
    partial: '部分',
    minimal: '待补充',
    avgScore: '平均分',
    totalActions: '总数',
    // Business layer items
    description: '业务描述',
    targetObject: '目标对象',
    executorRole: '执行角色',
    triggerCondition: '触发条件',
    // Logic layer items
    preconditions: '前置条件',
    parameters: '输入参数',
    postconditions: '后置状态',
    sideEffects: '副作用',
    // Implementation layer items
    apiEndpoint: 'API 端点',
    apiMethod: 'HTTP 方法',
    agentToolSpec: 'Agent Tool',
    // Tips
    tip: '提示',
    businessTip: '定义谁可以执行、做什么、什么时候触发',
    logicTip: '定义输入参数、前置条件和状态变更',
    implTip: '定义 API 端点以便系统集成'
  }
};

const StatusIcon: React.FC<{ status: 'complete' | 'partial' | 'minimal' }> = ({ status }) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />;
    case 'partial':
      return <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />;
    case 'minimal':
      return <XCircle className="w-4 h-4" style={{ color: 'var(--color-error)' }} />;
  }
};

const LayerBadge: React.FC<{ complete: boolean; score: number }> = ({ complete, score }) => (
  <div
    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
    style={{
      backgroundColor: complete
        ? 'rgba(var(--color-success-rgb, 63, 185, 80), 0.15)'
        : score > 0
          ? 'rgba(var(--color-warning-rgb, 210, 153, 34), 0.15)'
          : 'rgba(var(--color-error-rgb, 248, 81, 73), 0.15)',
      color: complete
        ? 'var(--color-success)'
        : score > 0
          ? 'var(--color-warning)'
          : 'var(--color-error)'
    }}
  >
    {complete ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : score > 0 ? (
      <AlertCircle className="w-3 h-3" />
    ) : (
      <XCircle className="w-3 h-3" />
    )}
    {score}%
  </div>
);

const ActionThreeLayerPanel: React.FC<ActionThreeLayerPanelProps> = ({
  lang,
  project,
  compact = false
}) => {
  const t = translations[lang];
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  const report = useMemo(() => {
    return checkActionThreeLayers(project);
  }, [project]);

  const toggleAction = (key: string) => {
    setExpandedActions(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (report.totalActions === 0) {
    return (
      <div
        className="p-6 rounded-xl text-center"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <Layers className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>{t.noActions}</p>
      </div>
    );
  }

  // Compact mode for embedding
  if (compact) {
    return (
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </span>
          </div>
          <div
            className="px-2 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: report.averageScore >= 70
                ? 'rgba(var(--color-success-rgb, 63, 185, 80), 0.15)'
                : report.averageScore >= 40
                  ? 'rgba(var(--color-warning-rgb, 210, 153, 34), 0.15)'
                  : 'rgba(var(--color-error-rgb, 248, 81, 73), 0.15)',
              color: report.averageScore >= 70
                ? 'var(--color-success)'
                : report.averageScore >= 40
                  ? 'var(--color-warning)'
                  : 'var(--color-error)'
            }}
          >
            {report.averageScore}/100
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Business Layer */}
          <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              <Briefcase className="w-3 h-3" />
              {t.businessLayer}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: 'var(--color-success)' }}>
                {report.byLayer.business.complete}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>/</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{report.totalActions}</span>
            </div>
          </div>

          {/* Logic Layer */}
          <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              <Cpu className="w-3 h-3" />
              {t.logicLayer}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: 'var(--color-success)' }}>
                {report.byLayer.logic.complete}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>/</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{report.totalActions}</span>
            </div>
          </div>

          {/* Implementation Layer */}
          <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              <Code className="w-3 h-3" />
              {t.implLayer}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: 'var(--color-success)' }}>
                {report.byLayer.implementation.complete}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>/</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{report.totalActions}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)' }}
            >
              <Layers className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                {report.completeActions}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.complete}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--color-warning)' }}>
                {report.partialActions}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.partial}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--color-error)' }}>
                {report.minimalActions}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.minimal}</div>
            </div>
            <div
              className="px-3 py-2 rounded-lg text-center"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}
            >
              <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {report.averageScore}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.avgScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer summary bar */}
      <div
        className="grid grid-cols-3 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <div className="p-3 border-r" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.businessLayer}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--color-success)' }}>{report.byLayer.business.complete} ✓</span>
            <span style={{ color: 'var(--color-warning)' }}>{report.byLayer.business.partial} ~</span>
            <span style={{ color: 'var(--color-error)' }}>{report.byLayer.business.missing} ✗</span>
          </div>
        </div>
        <div className="p-3 border-r" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.logicLayer}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--color-success)' }}>{report.byLayer.logic.complete} ✓</span>
            <span style={{ color: 'var(--color-warning)' }}>{report.byLayer.logic.partial} ~</span>
            <span style={{ color: 'var(--color-error)' }}>{report.byLayer.logic.missing} ✗</span>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.implLayer}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--color-success)' }}>{report.byLayer.implementation.complete} ✓</span>
            <span style={{ color: 'var(--color-warning)' }}>{report.byLayer.implementation.partial} ~</span>
            <span style={{ color: 'var(--color-error)' }}>{report.byLayer.implementation.missing} ✗</span>
          </div>
        </div>
      </div>

      {/* Actions list */}
      <div className="max-h-96 overflow-y-auto">
        {report.actions.map((action, idx) => {
          const key = `${action.objectName}-${action.actionName}`;
          const isExpanded = expandedActions.has(key);

          return (
            <div
              key={idx}
              className="border-b last:border-b-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {/* Action header */}
              <button
                onClick={() => toggleAction(key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                  <StatusIcon status={action.overallStatus} />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {action.actionName}
                      </span>
                      {action.actionType === 'generative' && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)', color: 'var(--color-accent)' }}
                        >
                          AI
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {action.objectName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <LayerBadge complete={action.businessLayer.complete} score={action.businessLayer.score} />
                  <LayerBadge complete={action.logicLayer.complete} score={action.logicLayer.score} />
                  <LayerBadge complete={action.implementationLayer.complete} score={action.implementationLayer.score} />
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Business Layer Detail */}
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-surface)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {t.businessLayer}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <CheckItem checked={action.businessLayer.hasDescription} label={t.description} />
                        <CheckItem checked={action.businessLayer.hasTargetObject} label={t.targetObject} />
                        <CheckItem checked={action.businessLayer.hasExecutorRole} label={t.executorRole} />
                        <CheckItem checked={action.businessLayer.hasTriggerCondition} label={t.triggerCondition} />
                      </div>
                      <div
                        className="mt-2 pt-2 border-t text-xs"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        <Info className="inline w-3 h-3 mr-1" />
                        {t.businessTip}
                      </div>
                    </div>

                    {/* Logic Layer Detail */}
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-surface)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {t.logicLayer}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <CheckItem checked={action.logicLayer.hasPreconditions} label={t.preconditions} />
                        <CheckItem checked={action.logicLayer.hasParameters} label={t.parameters} />
                        <CheckItem checked={action.logicLayer.hasPostconditions} label={t.postconditions} />
                        <CheckItem checked={action.logicLayer.hasSideEffects} label={t.sideEffects} optional />
                      </div>
                      <div
                        className="mt-2 pt-2 border-t text-xs"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        <Info className="inline w-3 h-3 mr-1" />
                        {t.logicTip}
                      </div>
                    </div>

                    {/* Implementation Layer Detail */}
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-surface)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {t.implLayer}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <CheckItem checked={action.implementationLayer.hasApiEndpoint} label={t.apiEndpoint} />
                        <CheckItem checked={action.implementationLayer.hasApiMethod} label={t.apiMethod} />
                        <CheckItem checked={action.implementationLayer.hasAgentToolSpec} label={t.agentToolSpec} optional />
                      </div>
                      <div
                        className="mt-2 pt-2 border-t text-xs"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                      >
                        <Info className="inline w-3 h-3 mr-1" />
                        {t.implTip}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ checked: boolean; label: string; optional?: boolean }> = ({
  checked,
  label,
  optional
}) => (
  <div className="flex items-center gap-2 text-xs">
    {checked ? (
      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
    ) : (
      <XCircle
        className="w-3.5 h-3.5"
        style={{ color: optional ? 'var(--color-text-muted)' : 'var(--color-error)' }}
      />
    )}
    <span style={{ color: checked ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
      {label}
      {optional && <span style={{ color: 'var(--color-text-muted)' }}> (opt)</span>}
    </span>
  </div>
);

export default ActionThreeLayerPanel;

/**
 * SystemDNACard - Displays detected enterprise system knowledge
 *
 * When a system like SAP, Salesforce, etc. is detected in conversation,
 * this card shows relevant objects, actions, and integration patterns
 * that can be applied to the project with one click.
 */

import React, { useState } from 'react';
import { Language } from '../types';
import {
  DetectedSystem,
  SystemDNA,
  SystemObject,
  SystemAction,
  IntegrationPattern,
  getLocalizedText,
  getCategoryName,
  generateIntegrationDraft
} from '../lib/systemDNA';
import {
  Database,
  Zap,
  Link2,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Server,
  ArrowRight
} from 'lucide-react';

interface SystemDNACardProps {
  lang: Language;
  detectedSystem: DetectedSystem;
  onApplyObjects: (objects: Array<{ name: string; description: string; properties: string[] }>) => void;
  onApplyActions: (actions: Array<{ name: string; targetObject: string; description: string }>) => void;
  onApplyIntegration: (integration: { systemName: string; dataPoints: string[]; mechanism: string }) => void;
  onDismiss: () => void;
}

const translations = {
  en: {
    detected: 'System Detected',
    suggestedObjects: 'Suggested Objects',
    suggestedActions: 'Suggested Actions',
    integrationPatterns: 'Integration Patterns',
    commonChallenges: 'Common Challenges',
    applyAll: 'Apply All to Project',
    applySelected: 'Apply Selected',
    dismiss: 'Dismiss',
    complexity: 'Complexity',
    syncType: 'Sync Type',
    realtime: 'Real-time',
    batch: 'Batch',
    cdc: 'CDC',
    event: 'Event-driven',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    properties: 'Properties',
    targetObject: 'Target',
    recommended: 'Recommended',
    applied: 'Applied!',
    selectItems: 'Select items to apply'
  },
  cn: {
    detected: '检测到系统',
    suggestedObjects: '建议对象',
    suggestedActions: '建议动作',
    integrationPatterns: '集成模式',
    commonChallenges: '常见挑战',
    applyAll: '全部应用到项目',
    applySelected: '应用选中项',
    dismiss: '忽略',
    complexity: '复杂度',
    syncType: '同步方式',
    realtime: '实时',
    batch: '批量',
    cdc: '变更捕获',
    event: '事件驱动',
    low: '低',
    medium: '中',
    high: '高',
    properties: '属性',
    targetObject: '目标',
    recommended: '推荐',
    applied: '已应用!',
    selectItems: '选择要应用的项目'
  }
};

const SystemDNACard: React.FC<SystemDNACardProps> = ({
  lang,
  detectedSystem,
  onApplyObjects,
  onApplyActions,
  onApplyIntegration,
  onDismiss
}) => {
  const t = translations[lang];
  const { system } = detectedSystem;

  // Selection state
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set(system.objects.map(o => o.id)));
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set(system.actions.map(a => a.id)));
  const [selectedPattern, setSelectedPattern] = useState<string>(
    system.integrationPatterns.find(p => p.complexity === 'low')?.id || system.integrationPatterns[0]?.id || ''
  );

  // Expand/collapse state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['objects', 'patterns']));
  const [applied, setApplied] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const toggleObject = (id: string) => {
    setSelectedObjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAction = (id: string) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSyncTypeLabel = (syncType: IntegrationPattern['syncType']): string => {
    const labels = { realtime: t.realtime, batch: t.batch, cdc: t.cdc, event: t.event };
    return labels[syncType];
  };

  const getComplexityLabel = (complexity: IntegrationPattern['complexity']): string => {
    const labels = { low: t.low, medium: t.medium, high: t.high };
    return labels[complexity];
  };

  const getComplexityColor = (complexity: IntegrationPattern['complexity']): string => {
    const colors = { low: 'var(--color-success)', medium: 'var(--color-warning)', high: 'var(--color-error)' };
    return colors[complexity];
  };

  const handleApplyAll = () => {
    const draft = generateIntegrationDraft(system, lang);

    // Filter by selection
    const objectsToApply = draft.suggestedObjects.filter((_, i) =>
      selectedObjects.has(system.objects[i]?.id)
    );
    const actionsToApply = draft.suggestedActions.filter((_, i) =>
      selectedActions.has(system.actions[i]?.id)
    );

    if (objectsToApply.length > 0) {
      onApplyObjects(objectsToApply);
    }
    if (actionsToApply.length > 0) {
      onApplyActions(actionsToApply);
    }
    if (selectedPattern) {
      const pattern = system.integrationPatterns.find(p => p.id === selectedPattern);
      if (pattern) {
        onApplyIntegration({
          systemName: lang === 'cn' ? system.nameCn : system.name,
          dataPoints: objectsToApply.map(o => o.name),
          mechanism: lang === 'cn' ? pattern.nameCn : pattern.name
        });
      }
    }

    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div
      className="rounded-xl overflow-hidden animate-slideUp"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-accent)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'var(--color-accent)15' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            <Server size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                {t.detected}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}
              >
                {getCategoryName(system.category, lang)}
              </span>
            </div>
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'cn' ? system.nameCn : system.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Description */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {lang === 'cn' ? system.descriptionCn : system.description}
        </p>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {/* Suggested Objects */}
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => toggleSection('objects')}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.has('objects') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Database size={14} style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.suggestedObjects}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}>
                {selectedObjects.size}/{system.objects.length}
              </span>
            </div>
          </button>
          {expandedSections.has('objects') && (
            <div className="px-4 pb-3 space-y-2">
              {system.objects.map(obj => (
                <label
                  key={obj.id}
                  className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                  style={{ backgroundColor: selectedObjects.has(obj.id) ? 'var(--color-bg-hover)' : 'transparent' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedObjects.has(obj.id)}
                    onChange={() => toggleObject(obj.id)}
                    className="mt-1 accent-[var(--color-accent)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {lang === 'cn' ? obj.nameCn : obj.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {lang === 'cn' ? obj.descriptionCn : obj.description}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {obj.typicalProperties.slice(0, 4).map(prop => (
                        <span
                          key={prop}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                        >
                          {prop}
                        </span>
                      ))}
                      {obj.typicalProperties.length > 4 && (
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          +{obj.typicalProperties.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Actions */}
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => toggleSection('actions')}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.has('actions') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Zap size={14} style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.suggestedActions}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}>
                {selectedActions.size}/{system.actions.length}
              </span>
            </div>
          </button>
          {expandedSections.has('actions') && (
            <div className="px-4 pb-3 space-y-2">
              {system.actions.map(action => (
                <label
                  key={action.id}
                  className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                  style={{ backgroundColor: selectedActions.has(action.id) ? 'var(--color-bg-hover)' : 'transparent' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedActions.has(action.id)}
                    onChange={() => toggleAction(action.id)}
                    className="mt-1 accent-[var(--color-success)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {lang === 'cn' ? action.nameCn : action.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                        style={{ backgroundColor: 'var(--color-accent-secondary)20', color: 'var(--color-accent-secondary)' }}
                      >
                        <ArrowRight size={10} />
                        {action.targetObject}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {lang === 'cn' ? action.descriptionCn : action.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Integration Patterns */}
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => toggleSection('patterns')}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.has('patterns') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Link2 size={14} style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.integrationPatterns}
              </span>
            </div>
          </button>
          {expandedSections.has('patterns') && (
            <div className="px-4 pb-3 space-y-2">
              {system.integrationPatterns.map(pattern => (
                <label
                  key={pattern.id}
                  className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                  style={{ backgroundColor: selectedPattern === pattern.id ? 'var(--color-bg-hover)' : 'transparent' }}
                >
                  <input
                    type="radio"
                    name="integration-pattern"
                    checked={selectedPattern === pattern.id}
                    onChange={() => setSelectedPattern(pattern.id)}
                    className="mt-1 accent-[var(--color-warning)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {lang === 'cn' ? pattern.nameCn : pattern.name}
                      </span>
                      {pattern.complexity === 'low' && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--color-success)20', color: 'var(--color-success)' }}
                        >
                          {t.recommended}
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {lang === 'cn' ? pattern.descriptionCn : pattern.description}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {t.syncType}: <span style={{ color: 'var(--color-text-secondary)' }}>{getSyncTypeLabel(pattern.syncType)}</span>
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {t.complexity}: <span style={{ color: getComplexityColor(pattern.complexity) }}>{getComplexityLabel(pattern.complexity)}</span>
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Common Challenges */}
        <div>
          <button
            onClick={() => toggleSection('challenges')}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.has('challenges') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.commonChallenges}
              </span>
            </div>
          </button>
          {expandedSections.has('challenges') && (
            <div className="px-4 pb-3">
              <ul className="space-y-1">
                {system.commonChallenges.map((challenge, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <span style={{ color: 'var(--color-warning)' }}>•</span>
                    {lang === 'cn' ? challenge.cn : challenge.en}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t.selectItems}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.dismiss}
          </button>
          <button
            onClick={handleApplyAll}
            disabled={selectedObjects.size === 0 && selectedActions.size === 0}
            className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            style={{
              backgroundColor: applied ? 'var(--color-success)' : 'var(--color-accent)',
              color: '#fff'
            }}
          >
            {applied ? (
              <>
                <CheckCircle2 size={14} />
                {t.applied}
              </>
            ) : (
              <>
                <Plus size={14} />
                {t.applySelected}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemDNACard;

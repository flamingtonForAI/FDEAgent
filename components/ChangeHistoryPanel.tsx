/**
 * ChangeHistoryPanel - Displays project change audit log
 *
 * Shows a timeline of all changes made to the ontology design,
 * with filtering and search capabilities.
 */

import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import {
  loadAuditLog,
  getChangeSummary,
  getChangeTypeLabel,
  getChangeTypeColor,
  ChangeRecord,
  ChangeType,
  clearAuditLog,
  exportAuditLogToJSON
} from '../lib/changeAuditTracker';
import {
  History,
  Filter,
  Download,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Minus,
  Box,
  Zap,
  Link2,
  Database,
  Settings,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ChangeHistoryPanelProps {
  lang: Language;
  onRefresh?: () => void;
}

const translations = {
  en: {
    title: 'Change History',
    subtitle: 'Track all modifications to your design',
    summary: 'Summary',
    added: 'Added',
    updated: 'Updated',
    deleted: 'Deleted',
    total: 'Total Changes',
    filter: 'Filter',
    all: 'All',
    objects: 'Objects',
    actions: 'Actions',
    links: 'Links',
    integrations: 'Integrations',
    noChanges: 'No changes recorded yet',
    noChangesDesc: 'Changes will appear here as you modify your ontology design.',
    export: 'Export',
    clear: 'Clear History',
    clearConfirm: 'Are you sure you want to clear all history?',
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
    source: 'Source',
    user: 'User',
    ai: 'AI',
    import: 'Import',
    system: 'System',
    viewDetails: 'View Details',
    before: 'Before',
    after: 'After'
  },
  cn: {
    title: '变更历史',
    subtitle: '追踪设计的所有修改',
    summary: '摘要',
    added: '新增',
    updated: '更新',
    deleted: '删除',
    total: '总变更数',
    filter: '筛选',
    all: '全部',
    objects: '对象',
    actions: '动作',
    links: '关系',
    integrations: '集成',
    noChanges: '暂无变更记录',
    noChangesDesc: '当您修改 Ontology 设计时，变更将显示在这里。',
    export: '导出',
    clear: '清除历史',
    clearConfirm: '确定要清除所有历史记录吗？',
    today: '今天',
    yesterday: '昨天',
    earlier: '更早',
    source: '来源',
    user: '用户',
    ai: 'AI',
    import: '导入',
    system: '系统',
    viewDetails: '查看详情',
    before: '修改前',
    after: '修改后'
  }
};

type FilterType = 'all' | 'object' | 'action' | 'link' | 'integration';

const ChangeHistoryPanel: React.FC<ChangeHistoryPanelProps> = ({
  lang,
  onRefresh
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const log = loadAuditLog();
  const changes = log.changes;
  const summary = getChangeSummary(changes);

  // Filter changes
  const filteredChanges = useMemo(() => {
    if (filter === 'all') return changes;
    return changes.filter(c => c.entityType === filter);
  }, [changes, filter]);

  // Group changes by date
  const groupedChanges = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string; changes: ChangeRecord[] }[] = [
      { label: t.today, changes: [] },
      { label: t.yesterday, changes: [] },
      { label: t.earlier, changes: [] }
    ];

    // Sort by timestamp descending
    const sorted = [...filteredChanges].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sorted.forEach(change => {
      const changeDate = new Date(change.timestamp);
      changeDate.setHours(0, 0, 0, 0);

      if (changeDate.getTime() === today.getTime()) {
        groups[0].changes.push(change);
      } else if (changeDate.getTime() === yesterday.getTime()) {
        groups[1].changes.push(change);
      } else {
        groups[2].changes.push(change);
      }
    });

    return groups.filter(g => g.changes.length > 0);
  }, [filteredChanges, t]);

  const toggleExpand = (id: string) => {
    setExpandedChanges(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const json = exportAuditLogToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    clearAuditLog();
    setShowClearConfirm(false);
    onRefresh?.();
  };

  const getEntityIcon = (entityType: ChangeRecord['entityType']) => {
    switch (entityType) {
      case 'object': return Box;
      case 'action': return Zap;
      case 'link': return Link2;
      case 'integration': return Database;
      case 'property': return Settings;
      default: return Box;
    }
  };

  const getChangeIcon = (type: ChangeType) => {
    if (type.includes('added')) return Plus;
    if (type.includes('updated')) return Edit3;
    if (type.includes('deleted')) return Minus;
    return RefreshCw;
  };

  const getSourceLabel = (source: ChangeRecord['source']): string => {
    const labels = { user: t.user, ai: t.ai, import: t.import, system: t.system };
    return labels[source];
  };

  const filters: Array<{ id: FilterType; label: string; icon: React.FC<any> }> = [
    { id: 'all', label: t.all, icon: History },
    { id: 'object', label: t.objects, icon: Box },
    { id: 'action', label: t.actions, icon: Zap },
    { id: 'link', label: t.links, icon: Link2 },
    { id: 'integration', label: t.integrations, icon: Database }
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-info)20', color: 'var(--color-info)' }}
          >
            <History size={16} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
            title={t.export}
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
            title={t.clear}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {changes.length > 0 && (
        <div
          className="px-4 py-3 grid grid-cols-4 gap-2"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
              {summary.added}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {t.added}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-warning)' }}>
              {summary.updated}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {t.updated}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-error)' }}>
              {summary.deleted}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {t.deleted}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {changes.length}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {t.total}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-2 flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.id ? '' : 'hover:bg-white/5'
            }`}
            style={{
              backgroundColor: filter === f.id ? 'var(--color-accent)' : 'transparent',
              color: filter === f.id ? '#fff' : 'var(--color-text-muted)'
            }}
          >
            <f.icon size={12} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Changes List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredChanges.length === 0 ? (
          <div className="p-8 text-center">
            <History size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
            <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {t.noChanges}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {t.noChangesDesc}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {groupedChanges.map(group => (
              <div key={group.label}>
                <div
                  className="text-xs font-medium mb-2 sticky top-0 py-1"
                  style={{
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-bg-surface)'
                  }}
                >
                  {group.label}
                </div>
                <div className="space-y-2">
                  {group.changes.map(change => {
                    const EntityIcon = getEntityIcon(change.entityType);
                    const ChangeIcon = getChangeIcon(change.type);
                    const isExpanded = expandedChanges.has(change.id);
                    const hasDetails = change.before || change.after;

                    return (
                      <div
                        key={change.id}
                        className="rounded-lg overflow-hidden"
                        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                      >
                        <button
                          onClick={() => hasDetails && toggleExpand(change.id)}
                          className={`w-full p-3 flex items-start gap-3 text-left ${hasDetails ? 'cursor-pointer hover:bg-white/5' : ''}`}
                        >
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              backgroundColor: `${getChangeTypeColor(change.type)}20`,
                              color: getChangeTypeColor(change.type)
                            }}
                          >
                            <ChangeIcon size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <EntityIcon size={12} style={{ color: 'var(--color-text-muted)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {change.entityName}
                              </span>
                              {change.parentName && (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                  in {change.parentName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${getChangeTypeColor(change.type)}15`,
                                  color: getChangeTypeColor(change.type)
                                }}
                              >
                                {getChangeTypeLabel(change.type, lang)}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                {new Date(change.timestamp).toLocaleTimeString()}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
                              >
                                {getSourceLabel(change.source)}
                              </span>
                            </div>
                          </div>
                          {hasDetails && (
                            <div style={{ color: 'var(--color-text-muted)' }}>
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                          )}
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && hasDetails && (
                          <div
                            className="px-3 pb-3 pt-0 text-xs"
                            style={{ borderTop: '1px solid var(--color-border)' }}
                          >
                            {change.before && (
                              <div className="mt-2">
                                <div className="font-medium mb-1" style={{ color: 'var(--color-error)' }}>
                                  {t.before}:
                                </div>
                                <pre
                                  className="p-2 rounded overflow-auto"
                                  style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-muted)' }}
                                >
                                  {JSON.stringify(change.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {change.after && (
                              <div className="mt-2">
                                <div className="font-medium mb-1" style={{ color: 'var(--color-success)' }}>
                                  {t.after}:
                                </div>
                                <pre
                                  className="p-2 rounded overflow-auto"
                                  style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-muted)' }}
                                >
                                  {JSON.stringify(change.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="rounded-xl p-4 max-w-sm w-full"
            style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.clear}
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {t.clearConfirm}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: '#fff'
                }}
              >
                {t.clear}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeHistoryPanel;

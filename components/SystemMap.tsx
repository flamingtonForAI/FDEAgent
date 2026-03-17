/**
 * SystemMap — Integration architecture view with editable cards.
 * Displays integration flows (source → mechanism → target) and provides
 * entry points into IntegrationEditor for add/edit/delete.
 */
import React, { useState, useMemo } from 'react';
import {
  Server, ArrowRight, Database, Zap, Activity,
  Plus, Pencil, ArrowUpDown, ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react';
import type { ProjectState, ExternalIntegration } from '../types';
import {
  normalizeIntegration,
  denormalizeIntegration,
  computeIntegrationStats,
  createEmptyNormalized,
  type NormalizedIntegration,
} from '../lib/integrationNormalizer';
import { useAppTranslation } from '../hooks/useAppTranslation';
import IntegrationEditor from './IntegrationEditor';

interface Props {
  project: ProjectState;
  setProject: (update: ProjectState | ((prev: ProjectState) => ProjectState)) => void;
}

const SystemMap: React.FC<Props> = ({ project, setProject }) => {
  const { t } = useAppTranslation('integration');

  // Editor state
  const [editingIntegration, setEditingIntegration] = useState<NormalizedIntegration | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<ExternalIntegration | undefined>(undefined);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isNew, setIsNew] = useState(false);

  // Stats
  const stats = useMemo(
    () => computeIntegrationStats(project.integrations),
    [project.integrations],
  );

  // Open editor for existing integration
  const openEdit = (idx: number) => {
    const raw = project.integrations[idx];
    setEditingOriginal(raw);
    setEditingIntegration(normalizeIntegration(raw));
    setEditingIndex(idx);
    setIsNew(false);
  };

  // Open editor for new integration
  const openNew = () => {
    setEditingOriginal(undefined);
    setEditingIntegration(createEmptyNormalized());
    setEditingIndex(-1);
    setIsNew(true);
  };

  // Save handler
  const handleSave = (updated: ExternalIntegration) => {
    setProject(prev => {
      const integrations = [...prev.integrations];
      if (isNew) {
        integrations.push(updated);
      } else {
        integrations[editingIndex] = updated;
      }
      return { ...prev, integrations };
    });
  };

  // Delete handler
  const handleDelete = () => {
    if (editingIndex < 0) return;
    setProject(prev => ({
      ...prev,
      integrations: prev.integrations.filter((_, i) => i !== editingIndex),
    }));
    setEditingIntegration(null);
  };

  return (
    <div className="p-8 pb-24 h-full bg-[var(--color-bg-elevated)] space-y-8 overflow-y-auto">
      {/* Title + Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('systemMap.title')}
          </h2>
          <p className="text-muted text-sm">{t('systemMap.subtitle')}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
          }}
        >
          <Plus size={16} />
          {t('systemMap.addIntegration')}
        </button>
      </div>

      {/* Stats bar */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <StatCard label={t('stats.total')} value={stats.total} />
          <StatCard label={t('stats.realtime')} value={stats.realtime} />
          <StatCard label={t('stats.batch')} value={stats.batch} />
          <StatCard
            label={t('stats.unconfigured')}
            value={stats.unconfigured}
            warn={stats.unconfigured > 0}
          />
        </div>
      )}

      {/* Column headers */}
      {project.integrations.length > 0 && (
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <span className="text-micro uppercase tracking-widest font-mono text-muted">
              {t('systemMap.source')}
            </span>
          </div>
          <div className="text-center">
            <span className="text-micro uppercase tracking-widest font-mono text-muted">
              {t('systemMap.logic')}
            </span>
          </div>
          <div className="text-center">
            <span className="text-micro uppercase tracking-widest font-mono text-muted">
              {t('systemMap.target')}
            </span>
          </div>
        </div>
      )}

      {/* Integration flow cards */}
      <div className="space-y-4">
        {project.integrations.map((raw, idx) => {
          const n = normalizeIntegration(raw);
          const targetObj = project.objects.find(o => o.id === n.targetObjectId);
          return (
            <IntegrationCard
              key={n.id}
              normalized={n}
              targetName={targetObj?.name}
              targetId={targetObj?.id}
              mappingCount={n.fieldMappings.length}
              targetPropCount={targetObj?.properties?.length || 0}
              onClick={() => openEdit(idx)}
              t={t}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {project.integrations.length === 0 && (
        <div
          className="p-12 border-2 border-dashed rounded-3xl text-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Activity className="mx-auto mb-4 text-muted" size={32} />
          <p className="text-muted text-sm mb-4">{t('systemMap.emptyState')}</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            <Plus size={16} />
            {t('systemMap.addIntegration')}
          </button>
        </div>
      )}

      {/* Editor modal */}
      {editingIntegration && (
        <IntegrationEditor
          integration={editingIntegration}
          original={editingOriginal}
          objects={project.objects}
          onSave={handleSave}
          onClose={() => setEditingIntegration(null)}
          onDelete={isNew ? undefined : handleDelete}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const DirectionIcon: React.FC<{ direction: NormalizedIntegration['direction'] }> = ({ direction }) => {
  if (direction === 'export') return <ArrowUpFromLine size={12} />;
  if (direction === 'bidirectional') return <ArrowUpDown size={12} />;
  return <ArrowDownToLine size={12} />;
};

interface IntegrationCardProps {
  normalized: NormalizedIntegration;
  targetName?: string;
  targetId?: string;
  mappingCount: number;
  targetPropCount: number;
  onClick: () => void;
  t: (key: string) => string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  normalized: n,
  targetName,
  targetId,
  mappingCount,
  targetPropCount,
  onClick,
  t,
}) => (
  <div
    onClick={onClick}
    className="grid grid-cols-3 gap-8 items-center relative cursor-pointer group"
    role="button"
    tabIndex={0}
    onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
  >
    {/* Source node */}
    <div
      className="rounded-xl p-4 flex items-center gap-4 shadow-lg transition-all group-hover:shadow-xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-bg-hover)',
          border: '1px solid var(--color-accent-secondary)',
        }}
      >
        <Server size={20} style={{ color: 'var(--color-accent-secondary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {n.systemName || t('systemMap.untitled')}
          </h4>
          <Pencil
            size={12}
            className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
        {/* Direction + frequency badges */}
        <div className="flex flex-wrap items-center gap-1 mt-1">
          <span
            className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--color-accent)10',
              color: 'var(--color-accent)',
            }}
          >
            <DirectionIcon direction={n.direction} />
            {t(`editor.direction_${n.direction}`)}
          </span>
          {n.syncPolicy.mode === 'batch' && n.syncPolicy.frequency && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              {n.syncPolicy.frequency}
            </span>
          )}
        </div>
        {/* Data points */}
        {n.dataPoints.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {n.dataPoints.slice(0, 4).map((dp, i) => (
              <span
                key={i}
                className="text-[8px] px-1.5 py-0.5 rounded text-muted"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {dp}
              </span>
            ))}
            {n.dataPoints.length > 4 && (
              <span className="text-[8px] text-muted">+{n.dataPoints.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Connection logic (center) */}
    <div className="flex flex-col items-center justify-center relative">
      <div
        className="h-px w-full absolute top-1/2 -translate-y-1/2"
        style={{ backgroundColor: 'var(--color-border)' }}
      />
      <div
        className="bg-[var(--color-bg-elevated)] px-3 py-1.5 rounded-full flex flex-col items-center gap-0.5 z-10 shadow-xl"
        style={{ border: '1px solid var(--color-accent-secondary)' }}
      >
        <span
          className="text-micro font-mono uppercase font-bold"
          style={{ color: 'var(--color-accent-secondary)' }}
        >
          {n.mechanism}
        </span>
        {n.mechanism === 'AI Parsing' && (
          <Zap size={10} className="animate-pulse" style={{ color: 'var(--color-accent)' }} />
        )}
      </div>
      {/* Mapping badge */}
      {mappingCount > 0 && (
        <span className="text-[9px] mt-1 text-muted">
          {mappingCount}/{targetPropCount} {t('systemMap.mapped')}
        </span>
      )}
    </div>

    {/* Target node */}
    <div
      className="rounded-xl p-4 flex items-center gap-4 shadow-lg transition-all group-hover:shadow-xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-bg-hover)',
          border: '1px solid var(--color-accent-secondary)',
        }}
      >
        <Database size={20} style={{ color: 'var(--color-accent-secondary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {targetName || t('systemMap.unknownObject')}
        </h4>
        <p className="text-micro text-muted font-mono mt-1 italic">
          {targetId || ''}
        </p>
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: number; warn?: boolean }> = ({
  label,
  value,
  warn,
}) => (
  <div
    className="rounded-lg p-3 text-center"
    style={{
      backgroundColor: 'var(--color-bg-surface)',
      border: `1px solid ${warn ? 'var(--color-warning, #e6a700)' : 'var(--color-border)'}`,
    }}
  >
    <div
      className="text-lg font-bold"
      style={{ color: warn ? 'var(--color-warning, #e6a700)' : 'var(--color-text-primary)' }}
    >
      {value}
    </div>
    <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
  </div>
);

export default SystemMap;

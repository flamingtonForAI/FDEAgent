import React, { useMemo } from 'react';
import { ProjectState } from '../types';
import { checkReadiness, ReadinessReport, ReadinessMessage } from '../utils/readinessChecker';
import {
  Box, Zap, Link2, Database, Brain, ShieldCheck,
  AlertCircle, ArrowRight, ExternalLink, Target, TrendingUp
} from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface ReadinessPanelProps {
  project: ProjectState;
  onNavigate?: (tab: string) => void;
}

const ReadinessPanel: React.FC<ReadinessPanelProps> = ({ project, onNavigate }) => {
  const { t } = useAppTranslation('common');

  const report = useMemo<ReadinessReport>(() => checkReadiness(project), [project]);

  /** Resolve a ReadinessMessage to a display string */
  const rm = (msg: ReadinessMessage): string => t(msg.key, msg.params);

  // Progress bar color based on percentage
  const progressColor = report.phaseProgress >= 80 ? 'var(--color-success)'
    : report.phaseProgress >= 40 ? 'var(--color-warning)'
    : 'var(--color-accent)';

  const snapshotItems = [
    { icon: <Box size={16} />, labelKey: 'objects', value: report.snapshot.objects, color: 'var(--color-accent)' },
    { icon: <Zap size={16} />, labelKey: 'actions', value: report.snapshot.actions, color: 'var(--color-success)' },
    { icon: <Link2 size={16} />, labelKey: 'links', value: report.snapshot.links, color: 'var(--color-accent-secondary)' },
    { icon: <Database size={16} />, labelKey: 'integrations', value: report.snapshot.integrations, color: 'var(--color-warning)' },
    { icon: <Brain size={16} />, labelKey: 'readiness.aiAnalysis', value: report.snapshot.aiAnalysisComplete ? '✓' : '-', color: 'var(--color-accent-secondary)' },
    { icon: <ShieldCheck size={16} />, labelKey: 'readiness.quality', value: report.snapshot.qualityGrade, color: report.snapshot.qualityGrade === 'A' ? 'var(--color-success)' : report.snapshot.qualityGrade === 'F' ? 'var(--color-error)' : 'var(--color-warning)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Current Stage */}
      <div className="glass-surface rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} style={{ color: 'var(--color-accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {t(report.currentPhaseKey)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}>
            {report.phaseProgress}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${report.phaseProgress}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Progress Snapshot */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {t('readiness.progressSnapshot')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {snapshotItems.map((item, idx) => (
            <div key={idx} className="glass-surface rounded-lg p-3 text-center">
              <div className="flex justify-center mb-1" style={{ color: item.color }}>
                {item.icon}
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {item.value}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {t(item.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocking Issues */}
      {report.blockers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} style={{ color: 'var(--color-error)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>
              {t('readiness.blockingIssues')}
            </span>
          </div>
          <div className="space-y-2">
            {report.blockers.map((blocker, idx) => (
              <div key={idx} className="glass-surface rounded-lg p-3 flex items-start gap-2"
                style={{ borderLeft: '2px solid var(--color-error)' }}>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {rm(blocker.message)}
                  </p>
                </div>
                {onNavigate && blocker.targetTab && (
                  <button
                    onClick={() => onNavigate(blocker.targetTab!)}
                    className="flex-shrink-0 p-1 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Actions */}
      {report.nextActions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
              {t('readiness.recommendedActions')}
            </span>
          </div>
          <div className="space-y-2">
            {report.nextActions.map((action, idx) => (
              <div key={idx} className="glass-surface rounded-lg p-3 flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {rm(action.message)}
                  </p>
                </div>
                {onNavigate && action.targetTab && (
                  <button
                    onClick={() => onNavigate(action.targetTab!)}
                    className="flex-shrink-0 p-1 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {report.blockers.length === 0 && report.nextActions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--color-success)' }}>
          <ShieldCheck size={32} className="mb-2" />
          <p className="text-sm">{t('readiness.allClear')}</p>
        </div>
      )}
    </div>
  );
};

export default ReadinessPanel;

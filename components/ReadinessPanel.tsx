import React, { useMemo } from 'react';
import { Language, ProjectState, ChatMessage } from '../types';
import { checkReadiness, getReadinessDisplay, ReadinessIssue, ReadinessReport } from '../lib/readinessChecker';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface ReadinessPanelProps {
  project: ProjectState;
  chatMessages: ChatMessage[];
  onProceed?: () => void;
  onCancel?: () => void;
  compact?: boolean;  // 紧凑模式用于嵌入
}

const ReadinessPanel: React.FC<ReadinessPanelProps> = ({
  project,
  chatMessages,
  onProceed,
  onCancel,
  compact = false
}) => {
  const { t, lang } = useAppTranslation(['common', 'modeling']);
  const report = useMemo(() => {
    return checkReadiness(project, chatMessages, lang);
  }, [project, chatMessages, lang]);

  const display = getReadinessDisplay(report.level, lang);

  const getIssueIcon = (type: ReadinessIssue['type']) => {
    switch (type) {
      case 'blocker':
        return <XCircle className="w-4 h-4" style={{ color: 'var(--color-error)' }} />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />;
    }
  };

  const getCategoryLabel = (category: ReadinessIssue['category']) => {
    return t(`readinessPanel.${category}`);
  };

  // 紧凑模式 - 用于嵌入到其他组件
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ backgroundColor: display.bgColor }}
      >
        <div className="flex items-center gap-2">
          {report.canProceed ? (
            <CheckCircle2 className="w-5 h-5" style={{ color: display.color }} />
          ) : (
            <XCircle className="w-5 h-5" style={{ color: display.color }} />
          )}
          <span className="font-medium" style={{ color: display.color }}>
            {display.label}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {report.summary.risks > 0 && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />
              {report.summary.risks} {t('readinessPanel.risks')}
            </span>
          )}
          {report.summary.warnings > 0 && (
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
              {report.summary.warnings} {t('readinessPanel.warnings')}
            </span>
          )}
        </div>

        <div
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
        >
          {report.score}/100
        </div>
      </div>
    );
  }

  // 完整模式 - 用于生成前确认
  return (
    <div className="rounded-xl border overflow-hidden" style={{
      borderColor: 'var(--color-border)',
      backgroundColor: 'var(--color-bg-elevated)'
    }}>
      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)', backgroundColor: display.bgColor }}
      >
        <div className="flex items-center gap-3">
          {report.canProceed ? (
            <CheckCircle2 className="w-6 h-6" style={{ color: display.color }} />
          ) : (
            <XCircle className="w-6 h-6" style={{ color: display.color }} />
          )}
          <div>
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t('readinessPanel.title')}
            </h3>
            <p className="text-sm" style={{ color: display.color }}>
              {display.label}
              {report.canProceed && report.level !== 'excellent' && (
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {' - '}{t('readinessPanel.canProceedWithImprovements')}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: display.color }}>
            {report.score}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            /100
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { key: 'blockers', label: t('readinessPanel.blockers'), color: 'var(--color-error)' },
          { key: 'risks', label: t('readinessPanel.risksLabel'), color: 'var(--color-warning)' },
          { key: 'warnings', label: t('readinessPanel.warningsLabel'), color: 'var(--color-accent)' },
          { key: 'suggestions', label: t('readinessPanel.suggestions'), color: 'var(--color-text-muted)' }
        ].map(item => (
          <div key={item.key} className="p-3 text-center border-r last:border-r-0" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-lg font-bold" style={{ color: item.color }}>
              {report.summary[item.key as keyof typeof report.summary]}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Issues list */}
      {report.issues.length > 0 && (
        <div className="p-4 max-h-64 overflow-y-auto space-y-2">
          {/* Blockers first */}
          {report.issues.filter(i => i.type === 'blocker').map(issue => (
            <IssueItem key={issue.id} issue={issue} lang={lang} t={t} getIcon={getIssueIcon} getCategory={getCategoryLabel} />
          ))}
          {/* Then risks */}
          {report.issues.filter(i => i.type === 'risk').map(issue => (
            <IssueItem key={issue.id} issue={issue} lang={lang} t={t} getIcon={getIssueIcon} getCategory={getCategoryLabel} />
          ))}
          {/* Then warnings */}
          {report.issues.filter(i => i.type === 'warning').map(issue => (
            <IssueItem key={issue.id} issue={issue} lang={lang} t={t} getIcon={getIssueIcon} getCategory={getCategoryLabel} />
          ))}
          {/* Suggestions collapsed by default */}
          {report.issues.filter(i => i.type === 'suggestion').length > 0 && (
            <details className="group">
              <summary
                className="flex items-center gap-2 text-sm cursor-pointer py-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                {t('readinessPanel.suggestions')} ({report.issues.filter(i => i.type === 'suggestion').length})
              </summary>
              <div className="pl-6 space-y-2 mt-2">
                {report.issues.filter(i => i.type === 'suggestion').map(issue => (
                  <IssueItem key={issue.id} issue={issue} lang={lang} t={t} getIcon={getIssueIcon} getCategory={getCategoryLabel} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Excellent state */}
      {report.level === 'excellent' && (
        <div className="p-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {t('readinessPanel.wellPrepared')}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {t('readinessPanel.infoComplete')}
          </p>
        </div>
      )}

      {/* Actions */}
      {(onProceed || onCancel) && (
        <div
          className="p-4 border-t flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {report.canProceed
              ? t('readinessPanel.canProceedIterate')
              : t('readinessPanel.provideInfoFirst')}
          </p>
          <div className="flex gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {t('cancel')}
              </button>
            )}
            {onProceed && (
              <button
                onClick={onProceed}
                disabled={!report.canProceed}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: report.canProceed ? 'var(--color-accent)' : 'var(--color-bg-hover)',
                  color: report.canProceed ? '#fff' : 'var(--color-text-muted)'
                }}
              >
                {report.canProceed
                  ? (report.level === 'risky'
                      ? t('readinessPanel.acknowledgeRisks')
                      : t('readinessPanel.generateDesign'))
                  : t('readinessPanel.cannotProceed')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Issue item component
const IssueItem: React.FC<{
  issue: ReadinessIssue;
  lang: Language;
  t: (key: string, options?: Record<string, unknown>) => string;
  getIcon: (type: ReadinessIssue['type']) => React.ReactNode;
  getCategory: (category: ReadinessIssue['category']) => string;
}> = ({ issue, lang, t, getIcon, getCategory }) => (
  <div
    className="flex items-start gap-3 p-3 rounded-lg"
    style={{ backgroundColor: 'var(--color-bg-surface)' }}
  >
    <div className="flex-shrink-0 mt-0.5">
      {getIcon(issue.type)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {issue.message}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
        >
          {getCategory(issue.category)}
        </span>
      </div>
      {issue.detail && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {issue.detail}
        </p>
      )}
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        <AlertTriangle className="inline w-3 h-3 mr-1" />
        {t('readinessPanel.impact')}{issue.impact}
      </p>
      {issue.suggestion && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
          <Lightbulb className="inline w-3 h-3 mr-1" />
          {issue.suggestion}
        </p>
      )}
    </div>
  </div>
);

export default ReadinessPanel;

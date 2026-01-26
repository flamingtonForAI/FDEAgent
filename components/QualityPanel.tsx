
import React, { useState, useMemo } from 'react';
import { Language, ProjectState } from '../types';
import {
  runQualityCheck,
  QualityReport,
  QualityIssue,
  Severity,
  Category,
  checkActionThreeLayers
} from '../utils/qualityChecker';
import ActionThreeLayerPanel from './ActionThreeLayerPanel';
import MilestonePlanner from './MilestonePlanner';
import DeliverableGenerator from './DeliverableGenerator';
import {
  ShieldCheck, AlertTriangle, AlertCircle, Info,
  ChevronDown, ChevronRight, X, RefreshCw,
  Box, Zap, Link2, Database, Layers, Flag, Download
} from 'lucide-react';

interface QualityPanelProps {
  lang: Language;
  project: ProjectState;
  onClose?: () => void;
}

type TabType = 'quality' | 'threelayer' | 'milestones' | 'deliverables';

const translations = {
  en: {
    title: 'Quality Check',
    subtitle: 'Ontology design quality assessment',
    tabQuality: 'Quality',
    tabThreeLayer: '3-Layer',
    tabMilestones: 'Milestones',
    tabDeliverables: 'Export',
    score: 'Score',
    grade: 'Grade',
    checks: 'checks',
    passed: 'passed',
    issues: 'issues',
    runCheck: 'Run Check',
    noIssues: 'No issues found!',
    errors: 'Errors',
    warnings: 'Warnings',
    info: 'Info',
    suggestion: 'Suggestion',
    categories: {
      object: 'Objects',
      action: 'Actions',
      link: 'Links',
      integration: 'Integrations',
      architecture: 'Architecture'
    },
    severity: {
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    }
  },
  cn: {
    title: '质量检查',
    subtitle: 'Ontology 设计质量评估',
    tabQuality: '质量检查',
    tabThreeLayer: '三层检查',
    tabMilestones: '里程碑',
    tabDeliverables: '导出',
    score: '得分',
    grade: '等级',
    checks: '项检查',
    passed: '项通过',
    issues: '个问题',
    runCheck: '运行检查',
    noIssues: '未发现问题！',
    errors: '错误',
    warnings: '警告',
    info: '提示',
    suggestion: '建议',
    categories: {
      object: '对象',
      action: '动作',
      link: '关系',
      integration: '集成',
      architecture: '架构'
    },
    severity: {
      error: '错误',
      warning: '警告',
      info: '提示'
    }
  }
};

const severityConfig: Record<Severity, { icon: React.ReactNode; colorVar: string; bgVar: string }> = {
  error: {
    icon: <AlertCircle size={14} />,
    colorVar: 'var(--color-error)',
    bgVar: 'var(--color-bg-hover)'
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    colorVar: 'var(--color-warning)',
    bgVar: 'var(--color-bg-hover)'
  },
  info: {
    icon: <Info size={14} />,
    colorVar: 'var(--color-accent-secondary)',
    bgVar: 'var(--color-bg-hover)'
  }
};

const categoryConfig: Record<Category, { icon: React.ReactNode; colorVar: string }> = {
  object: { icon: <Box size={12} />, colorVar: 'var(--color-accent)' },
  action: { icon: <Zap size={12} />, colorVar: 'var(--color-success)' },
  link: { icon: <Link2 size={12} />, colorVar: 'var(--color-accent-secondary)' },
  integration: { icon: <Database size={12} />, colorVar: 'var(--color-warning)' },
  architecture: { icon: <Layers size={12} />, colorVar: 'var(--color-accent-secondary)' }
};

const gradeColorVars: Record<string, { color: string; bg: string }> = {
  A: { color: 'var(--color-success)', bg: 'var(--color-bg-hover)' },
  B: { color: 'var(--color-warning)', bg: 'var(--color-bg-hover)' },
  C: { color: 'var(--color-warning)', bg: 'var(--color-bg-hover)' },
  D: { color: 'var(--color-warning)', bg: 'var(--color-bg-hover)' },
  F: { color: 'var(--color-error)', bg: 'var(--color-bg-hover)' }
};

const QualityPanel: React.FC<QualityPanelProps> = ({
  lang,
  project,
  onClose
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<TabType>('quality');
  const [report, setReport] = useState<QualityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');

  // Run check when project changes
  React.useEffect(() => {
    if (project.objects.length > 0) {
      setReport(runQualityCheck(project));
    } else {
      setReport(null);
    }
  }, [project]);

  const handleRunCheck = () => {
    setIsChecking(true);
    // Simulate async check
    setTimeout(() => {
      setReport(runQualityCheck(project));
      setIsChecking(false);
      // Auto-expand categories with issues
      const newExpanded = new Set<Category>();
      const newReport = runQualityCheck(project);
      newReport.issues.forEach(issue => newExpanded.add(issue.category));
      setExpandedCategories(newExpanded);
    }, 300);
  };

  const toggleCategory = (category: Category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Filter issues by severity
  const filteredIssues = useMemo(() => {
    if (!report) return [];
    if (filterSeverity === 'all') return report.issues;
    return report.issues.filter(i => i.severity === filterSeverity);
  }, [report, filterSeverity]);

  // Group issues by category
  const issuesByCategory = useMemo(() => {
    const grouped: Record<Category, QualityIssue[]> = {
      object: [],
      action: [],
      link: [],
      integration: [],
      architecture: []
    };
    filteredIssues.forEach(issue => {
      grouped[issue.category].push(issue);
    });
    return grouped;
  }, [filteredIssues]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
            <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h3>
            <p className="text-xs text-muted">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'quality' && (
            <button
              onClick={handleRunCheck}
              disabled={isChecking}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium btn-gradient disabled:opacity-50 transition-all"
            >
              <RefreshCw size={12} className={isChecking ? 'animate-spin' : ''} />
              {t.runCheck}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted hover:text-primary transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex px-4" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('quality')}
          className="px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={{ color: activeTab === 'quality' ? 'var(--color-success)' : 'var(--color-text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            {t.tabQuality}
          </div>
          {activeTab === 'quality' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-success)' }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('threelayer')}
          className="px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={{ color: activeTab === 'threelayer' ? 'var(--color-accent-secondary)' : 'var(--color-text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <Layers size={14} />
            {t.tabThreeLayer}
          </div>
          {activeTab === 'threelayer' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-accent-secondary)' }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className="px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={{ color: activeTab === 'milestones' ? 'var(--color-accent-secondary)' : 'var(--color-text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <Flag size={14} />
            {t.tabMilestones}
          </div>
          {activeTab === 'milestones' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-accent-secondary)' }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('deliverables')}
          className="px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={{ color: activeTab === 'deliverables' ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <Download size={14} />
            {t.tabDeliverables}
          </div>
          {activeTab === 'deliverables' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-warning)' }} />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'deliverables' ? (
        <DeliverableGenerator lang={lang} project={project} />
      ) : activeTab === 'milestones' ? (
        <MilestonePlanner lang={lang} project={project} />
      ) : activeTab === 'threelayer' ? (
        <div className="flex-1 overflow-y-auto p-4">
          <ActionThreeLayerPanel lang={lang} project={project} />
        </div>
      ) : (
        <>
      {/* Score Display */}
      {report && (
        <div className="px-5 py-4" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
          <div className="flex items-center justify-between">
            {/* Score */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{report.score}</div>
                <div className="text-micro text-muted">{t.score}</div>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold" style={{ color: gradeColorVars[report.grade].color, backgroundColor: gradeColorVars[report.grade].bg }}>
                {report.grade}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{report.totalChecks}</div>
                <div className="text-micro text-muted">{t.checks}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium" style={{ color: 'var(--color-success)' }}>{report.passed}</div>
                <div className="text-micro text-muted">{t.passed}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium" style={{ color: 'var(--color-warning)' }}>{report.issues.length}</div>
                <div className="text-micro text-muted">{t.issues}</div>
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="flex items-center gap-3">
              {(['error', 'warning', 'info'] as Severity[]).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all glass-surface"
                  style={{
                    backgroundColor: filterSeverity === sev ? severityConfig[sev].bgVar : undefined,
                    color: filterSeverity === sev ? severityConfig[sev].colorVar : 'var(--color-text-muted)'
                  }}
                >
                  {severityConfig[sev].icon}
                  <span>{report.bySeverity[sev]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4">
        {!report ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <ShieldCheck size={40} className="mb-4 opacity-30" />
            <p className="text-sm">{t.runCheck}</p>
          </div>
        ) : report.issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-success)' }}>
            <ShieldCheck size={40} className="mb-4" />
            <p className="text-sm">{t.noIssues}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(Object.keys(issuesByCategory) as Category[]).map(category => {
              const categoryIssues = issuesByCategory[category];
              if (categoryIssues.length === 0) return null;

              const config = categoryConfig[category];
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="glass-surface rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span style={{ color: config.colorVar }}>{config.icon}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {t.categories[category]}
                      </span>
                      <span className="text-xs text-muted">({categoryIssues.length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {['error', 'warning', 'info'].map(sev => {
                        const count = categoryIssues.filter(i => i.severity === sev).length;
                        if (count === 0) return null;
                        return (
                          <span
                            key={sev}
                            className="px-1.5 py-0.5 rounded text-micro"
                            style={{ backgroundColor: severityConfig[sev as Severity].bgVar, color: severityConfig[sev as Severity].colorVar }}
                          >
                            {count}
                          </span>
                        );
                      })}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {categoryIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="glass-card rounded-lg p-3"
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5" style={{ color: severityConfig[issue.severity].colorVar }}>
                              {severityConfig[issue.severity].icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                {issue.message[lang]}
                              </p>
                              {issue.target && (
                                <p className="text-xs text-muted mt-1">
                                  → {issue.target.name}
                                </p>
                              )}
                              {issue.suggestion && (
                                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)', borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: 'var(--color-accent)' }}>
                                  <p className="text-xs text-muted">
                                    <span style={{ color: 'var(--color-accent)' }}>{t.suggestion}:</span> {issue.suggestion[lang]}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default QualityPanel;

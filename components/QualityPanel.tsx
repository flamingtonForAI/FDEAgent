
import React, { useState, useMemo } from 'react';
import { Language, ProjectState } from '../types';
import {
  runQualityCheck,
  QualityReport,
  QualityIssue,
  Severity,
  Category
} from '../utils/qualityChecker';
import {
  ShieldCheck, AlertTriangle, AlertCircle, Info,
  ChevronDown, ChevronRight, X, RefreshCw,
  Box, Zap, Link2, Database, Layers
} from 'lucide-react';

interface QualityPanelProps {
  lang: Language;
  project: ProjectState;
  onClose?: () => void;
}

const translations = {
  en: {
    title: 'Quality Check',
    subtitle: 'Ontology design quality assessment',
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

const severityConfig: Record<Severity, { icon: React.ReactNode; color: string; bg: string }> = {
  error: {
    icon: <AlertCircle size={14} />,
    color: 'text-red-400',
    bg: 'bg-red-500/20'
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20'
  },
  info: {
    icon: <Info size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20'
  }
};

const categoryConfig: Record<Category, { icon: React.ReactNode; color: string }> = {
  object: { icon: <Box size={12} />, color: 'text-amber-400' },
  action: { icon: <Zap size={12} />, color: 'text-emerald-400' },
  link: { icon: <Link2 size={12} />, color: 'text-purple-400' },
  integration: { icon: <Database size={12} />, color: 'text-orange-400' },
  architecture: { icon: <Layers size={12} />, color: 'text-pink-400' }
};

const gradeColors: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/20',
  B: 'text-amber-400 bg-amber-500/20',
  C: 'text-amber-400 bg-amber-500/20',
  D: 'text-orange-400 bg-orange-500/20',
  F: 'text-red-400 bg-red-500/20'
};

const QualityPanel: React.FC<QualityPanelProps> = ({
  lang,
  project,
  onClose
}) => {
  const t = translations[lang];
  const [report, setReport] = useState<QualityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');

  // Run initial check
  useMemo(() => {
    if (project.objects.length > 0) {
      setReport(runQualityCheck(project));
    }
  }, []);

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
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{t.title}</h3>
            <p className="text-xs text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCheck}
            disabled={isChecking}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium btn-gradient disabled:opacity-50 transition-all"
          >
            <RefreshCw size={12} className={isChecking ? 'animate-spin' : ''} />
            {t.runCheck}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Score Display */}
      {report && (
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between">
            {/* Score */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{report.score}</div>
                <div className="text-micro text-gray-500">{t.score}</div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${gradeColors[report.grade]}`}>
                {report.grade}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-medium text-white">{report.totalChecks}</div>
                <div className="text-micro text-gray-500">{t.checks}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-emerald-400">{report.passed}</div>
                <div className="text-micro text-gray-500">{t.passed}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-amber-400">{report.issues.length}</div>
                <div className="text-micro text-gray-500">{t.issues}</div>
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="flex items-center gap-3">
              {(['error', 'warning', 'info'] as Severity[]).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    filterSeverity === sev
                      ? severityConfig[sev].bg + ' ' + severityConfig[sev].color
                      : 'glass-surface text-gray-400 hover:text-white'
                  }`}
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
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShieldCheck size={40} className="mb-4 opacity-30" />
            <p className="text-sm">{t.runCheck}</p>
          </div>
        ) : report.issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-emerald-400">
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
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className={config.color}>{config.icon}</span>
                      <span className="text-sm font-medium text-white">
                        {t.categories[category]}
                      </span>
                      <span className="text-xs text-gray-500">({categoryIssues.length})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {['error', 'warning', 'info'].map(sev => {
                        const count = categoryIssues.filter(i => i.severity === sev).length;
                        if (count === 0) return null;
                        return (
                          <span
                            key={sev}
                            className={`px-1.5 py-0.5 rounded text-micro ${severityConfig[sev as Severity].bg} ${severityConfig[sev as Severity].color}`}
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
                            <div className={`mt-0.5 ${severityConfig[issue.severity].color}`}>
                              {severityConfig[issue.severity].icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white">
                                {issue.message[lang]}
                              </p>
                              {issue.target && (
                                <p className="text-xs text-gray-500 mt-1">
                                  → {issue.target.name}
                                </p>
                              )}
                              {issue.suggestion && (
                                <div className="mt-2 p-2 rounded-lg bg-white/[0.03] border-l-2 border-amber-500/50">
                                  <p className="text-xs text-gray-400">
                                    <span className="text-amber-400">{t.suggestion}:</span> {issue.suggestion[lang]}
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
    </div>
  );
};

export default QualityPanel;

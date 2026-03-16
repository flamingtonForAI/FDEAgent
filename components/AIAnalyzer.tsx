/**
 * AIAnalyzer - AI 驱动的智能化分析组件
 * 分析 Ontology 设计，识别 AI 增强机会，提供可操作的建议
 */
import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Bot,
  Cpu,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle,
  Target,
  Settings2
} from 'lucide-react';
import { OntologyObject, OntologyLink, AISettings, ProjectState } from '../types';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  AIAnalysisService,
  AnalysisResult,
  AISuggestion,
  SuggestionCategory,
  SuggestionPriority,
  applySuggestionToOntology
} from '../services/aiAnalysisService';

interface AIAnalyzerProps {
  objects: OntologyObject[];
  links: OntologyLink[];
  aiSettings: AISettings;
  // State lifted to App.tsx for persistence across tab switches
  analysisResult: AnalysisResult | null;
  onAnalysisResult: (result: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  onIsAnalyzingChange: (v: boolean) => void;
  analysisError: string | null;
  onAnalysisError: (e: string | null) => void;
  // For applying suggestions to Ontology
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const categoryIcons: Record<SuggestionCategory, React.ReactNode> = {
  smart_property: <Sparkles size={16} />,
  ai_action: <Zap size={16} />,
  automation: <Cpu size={16} />,
  agent_capability: <Bot size={16} />
};

const categoryColors: Record<SuggestionCategory, string> = {
  smart_property: '#8b5cf6',
  ai_action: '#f59e0b',
  automation: '#10b981',
  agent_capability: '#3b82f6'
};

const priorityColors: Record<SuggestionPriority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280'
};

const AIAnalyzer: React.FC<AIAnalyzerProps> = ({
  objects,
  links,
  aiSettings,
  analysisResult,
  onAnalysisResult,
  isAnalyzing,
  onIsAnalyzingChange,
  analysisError,
  onAnalysisError,
  project,
  setProject
}) => {
  const { t, lang } = useAppTranslation('ai');
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Use the lifted state from App.tsx (persists across tab switches)
  const result = analysisResult;
  const setResult = onAnalysisResult;
  const setIsAnalyzing = onIsAnalyzingChange;
  const error = analysisError;
  const setError = onAnalysisError;

  const hasData = objects.length > 0;
  const hasApiKey = !!(
    (aiSettings.apiKey && aiSettings.apiKey.length > 0) ||
    (aiSettings.apiKeys && aiSettings.apiKeys[aiSettings.provider as keyof typeof aiSettings.apiKeys])
  );

  const runAnalysis = useCallback(async () => {
    if (!hasData || !hasApiKey) return;

    setIsAnalyzing(true);
    setError(null);
    setShowConfirmDialog(false);

    try {
      const service = new AIAnalysisService(aiSettings);
      const newResult = await service.analyzeOntology(objects, links, lang);
      setResult(newResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [objects, links, aiSettings, lang, hasData, hasApiKey, setResult, setIsAnalyzing, setError]);

  // Handle analyze button click - show confirmation if result exists
  const handleAnalyzeClick = useCallback(() => {
    if (result) {
      setShowConfirmDialog(true);
    } else {
      runAnalysis();
    }
  }, [result, runAnalysis]);

  const toggleExpand = (id: string) => {
    setExpandedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateSuggestionStatus = (id: string, status: 'accepted' | 'rejected') => {
    if (!result) return;

    const suggestion = result.suggestions.find(s => s.id === id);
    if (!suggestion) return;

    // If accepting, apply the suggestion to Ontology
    if (status === 'accepted') {
      const updatedObjects = applySuggestionToOntology(suggestion, project.objects);
      setProject(prev => ({
        ...prev,
        objects: updatedObjects
      }));
    }

    // Update suggestion status
    setResult({
      ...result,
      suggestions: result.suggestions.map(s =>
        s.id === id ? { ...s, status } : s
      )
    });
  };

  // Empty state - no data
  if (!hasData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-bg-surface)' }}
          >
            <AlertCircle size={32} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {t('aiAnalyzer.noData')}
          </h3>
        </div>
      </div>
    );
  }

  // Empty state - no API key
  if (!hasApiKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-bg-surface)' }}
          >
            <Settings2 size={32} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {t('aiAnalyzer.noApiKey')}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Sparkles size={20} style={{ color: '#8b5cf6' }} />
              {t('aiAnalyzer.title')}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {t('aiAnalyzer.subtitle')}
            </p>
          </div>

          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: isAnalyzing ? 'var(--color-bg-surface)' : '#8b5cf6',
              color: isAnalyzing ? 'var(--color-text-muted)' : 'white',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer'
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('aiAnalyzer.analyzing')}
              </>
            ) : (
              <>
                <Target size={16} />
                {result ? t('aiAnalyzer.reanalyze') : t('aiAnalyzer.analyze')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            style={{ backgroundColor: 'var(--color-bg-elevated)' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <AlertCircle size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {t('aiAnalyzer.confirmTitle')}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('aiAnalyzer.confirmMessage')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
              >
                {t('aiAnalyzer.confirmNo')}
              </button>
              <button
                onClick={runAnalysis}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: '#8b5cf6', color: 'white' }}
              >
                {t('aiAnalyzer.confirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {error && (
          <div
            className="p-4 rounded-lg mb-4 flex items-start gap-3"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}
            >
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {t('aiAnalyzer.summary')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Total */}
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                    {result.summary.totalSuggestions}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('aiAnalyzer.total')}
                  </div>
                </div>

                {/* By Category */}
                <div>
                  <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {t('aiAnalyzer.byCategory')}
                  </div>
                  <div className="space-y-1">
                    {(Object.entries(result.summary.byCategory) as [SuggestionCategory, number][])
                      .filter(([, count]) => count > 0)
                      .map(([cat, count]) => (
                        <div key={cat} className="flex items-center gap-2 text-xs">
                          <span style={{ color: categoryColors[cat] }}>{categoryIcons[cat]}</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{t(`aiAnalyzer.${cat}`)}: {count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* By Priority */}
                <div>
                  <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {t('aiAnalyzer.byPriority')}
                  </div>
                  <div className="space-y-1">
                    {(Object.entries(result.summary.byPriority) as [SuggestionPriority, number][])
                      .filter(([, count]) => count > 0)
                      .map(([pri, count]) => (
                        <div key={pri} className="flex items-center gap-2 text-xs">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: priorityColors[pri] }}
                          />
                          <span style={{ color: 'var(--color-text-secondary)' }}>{t(`aiAnalyzer.${pri}`)}: {count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
              >
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#8b5cf6' }}>
                  <Lightbulb size={16} />
                  {t('aiAnalyzer.insights')}
                </h3>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions List */}
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {t('aiAnalyzer.suggestions')} ({result.suggestions.length})
              </h3>
              <div className="space-y-3">
                {result.suggestions.map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    expanded={expandedSuggestions.has(suggestion.id)}
                    onToggleExpand={() => toggleExpand(suggestion.id)}
                    onAccept={() => updateSuggestionStatus(suggestion.id, 'accepted')}
                    onReject={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                    objects={objects}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Initial state - prompt to analyze */}
        {!result && !isAnalyzing && !error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              >
                <Sparkles size={40} style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {t('aiAnalyzer.readyTitle')}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                {t('aiAnalyzer.readyDesc', { objectCount: objects.length, linkCount: links.length })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: AISuggestion;
  expanded: boolean;
  onToggleExpand: () => void;
  onAccept: () => void;
  onReject: () => void;
  objects: OntologyObject[];
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  expanded,
  onToggleExpand,
  onAccept,
  onReject,
  objects
}) => {
  const { t } = useAppTranslation('ai');
  const targetObject = suggestion.targetObjectId
    ? objects.find(o => o.id === suggestion.targetObjectId)
    : null;

  const isProcessed = suggestion.status !== 'pending';

  return (
    <div
      className="rounded-lg transition-all"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: `1px solid ${isProcessed
          ? suggestion.status === 'accepted' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'
          : 'var(--color-border)'
        }`,
        opacity: suggestion.status === 'rejected' ? 0.6 : 1
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-start gap-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Category Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryColors[suggestion.category]}20` }}
        >
          <span style={{ color: categoryColors[suggestion.category] }}>
            {categoryIcons[suggestion.category]}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${categoryColors[suggestion.category]}20`,
                color: categoryColors[suggestion.category]
              }}
            >
              {t(`aiAnalyzer.${suggestion.category}`)}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${priorityColors[suggestion.priority]}20`,
                color: priorityColors[suggestion.priority]
              }}
            >
              {t(`aiAnalyzer.${suggestion.priority}`)}
            </span>
            {isProcessed && (
              <span
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: suggestion.status === 'accepted'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(107, 114, 128, 0.1)',
                  color: suggestion.status === 'accepted' ? '#10b981' : '#6b7280'
                }}
              >
                {suggestion.status === 'accepted' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {suggestion.status === 'accepted' ? t('aiAnalyzer.accepted') : t('aiAnalyzer.rejected')}
              </span>
            )}
          </div>

          <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {suggestion.title}
          </h4>

          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
            {suggestion.description}
          </p>
        </div>

        {/* Expand Toggle */}
        <div style={{ color: 'var(--color-text-muted)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-0 space-y-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="pt-3" />

          {/* Target Info */}
          {(targetObject || suggestion.targetActionName) && (
            <div className="flex gap-4 text-xs">
              {targetObject && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('aiAnalyzer.targetObject')}: </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{targetObject.name}</span>
                </div>
              )}
              {suggestion.targetActionName && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t('aiAnalyzer.targetAction')}: </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{suggestion.targetActionName}</span>
                </div>
              )}
            </div>
          )}

          {/* Rationale */}
          {suggestion.rationale && (
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('aiAnalyzer.rationale')}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {suggestion.rationale}
              </p>
            </div>
          )}

          {/* Implementation */}
          {suggestion.implementation && (
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('aiAnalyzer.implementation')}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {suggestion.implementation}
              </p>
            </div>
          )}

          {/* Impact */}
          {suggestion.estimatedImpact && (
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('aiAnalyzer.impact')}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {suggestion.estimatedImpact}
              </p>
            </div>
          )}

          {/* Actions */}
          {!isProcessed && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
              >
                <CheckCircle2 size={14} />
                {t('aiAnalyzer.accept')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}
              >
                <XCircle size={14} />
                {t('aiAnalyzer.reject')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAnalyzer;

/**
 * CopilotBubble - Smart contextual suggestions for ontology design
 *
 * This component displays AI-powered suggestions based on the current
 * design stage, project state, and conversation context.
 */

import React, { useState, useEffect } from 'react';
import { Language, ProjectState, ChatMessage } from '../types';
import {
  checkMethodology,
  MethodologyCheckResult,
  CopilotSuggestion,
  getStageInfo,
  getAllStages,
  MethodologyStage
} from '../lib/methodologyEngine';
import {
  Lightbulb,
  MessageCircle,
  AlertTriangle,
  Zap,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  HelpCircle
} from 'lucide-react';

type NavigableTab = 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview';

interface CopilotBubbleProps {
  lang: Language;
  project: ProjectState;
  messages: ChatMessage[];
  onNavigate: (tab: NavigableTab) => void;
  onInsertPrompt?: (prompt: string) => void;
  compact?: boolean;
}

const translations = {
  en: {
    copilot: 'Design Copilot',
    currentStage: 'Current Stage',
    progress: 'Progress',
    suggestions: 'Suggestions',
    warnings: 'Attention',
    noSuggestions: 'Looking good! Continue with your design.',
    stageTip: 'Stage',
    askQuestion: 'Ask',
    goTo: 'Go to',
    dismiss: 'Dismiss',
    showMore: 'Show more',
    showLess: 'Show less'
  },
  cn: {
    copilot: '设计助手',
    currentStage: '当前阶段',
    progress: '进度',
    suggestions: '建议',
    warnings: '注意',
    noSuggestions: '进展顺利，请继续设计。',
    stageTip: '阶段',
    askQuestion: '提问',
    goTo: '前往',
    dismiss: '忽略',
    showMore: '显示更多',
    showLess: '收起'
  }
};

const CopilotBubble: React.FC<CopilotBubbleProps> = ({
  lang,
  project,
  messages,
  onNavigate,
  onInsertPrompt,
  compact = false
}) => {
  const t = translations[lang];
  const [methodologyResult, setMethodologyResult] = useState<MethodologyCheckResult | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(!compact);

  // Run methodology check whenever project or messages change
  useEffect(() => {
    const result = checkMethodology(project, messages, lang);
    setMethodologyResult(result);
  }, [project, messages, lang]);

  if (!methodologyResult) return null;

  const { currentStage, stageProgress, activeWarnings, copilotSuggestions, missingRequirements } = methodologyResult;
  const stageInfo = getStageInfo(currentStage, lang);
  const allStages = getAllStages(lang);

  // Filter out dismissed suggestions
  const visibleSuggestions = copilotSuggestions.filter(s => !dismissedSuggestions.has(s.id));
  const topSuggestions = expanded ? visibleSuggestions : visibleSuggestions.slice(0, 2);

  const handleDismiss = (id: string) => {
    setDismissedSuggestions(prev => new Set([...prev, id]));
  };

  const handleAction = (suggestion: CopilotSuggestion) => {
    if (suggestion.action?.tab) {
      onNavigate(suggestion.action.tab as NavigableTab);
    } else if (suggestion.action?.prompt && onInsertPrompt) {
      onInsertPrompt(suggestion.action.prompt);
    }
  };

  const getSuggestionIcon = (type: CopilotSuggestion['type']) => {
    switch (type) {
      case 'question': return <HelpCircle size={14} />;
      case 'tip': return <Lightbulb size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'action': return <Zap size={14} />;
      default: return <Lightbulb size={14} />;
    }
  };

  const getSuggestionColor = (type: CopilotSuggestion['type']) => {
    switch (type) {
      case 'question': return 'var(--color-info)';
      case 'tip': return 'var(--color-accent)';
      case 'warning': return 'var(--color-warning)';
      case 'action': return 'var(--color-success)';
      default: return 'var(--color-accent)';
    }
  };

  // Compact mode - just show a small indicator
  if (compact && visibleSuggestions.length === 0 && activeWarnings.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)20', color: 'var(--color-accent)' }}
          >
            <Lightbulb size={16} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.copilot}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t.stageTip}: {stageInfo.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(visibleSuggestions.length > 0 || activeWarnings.length > 0) && (
            <span
              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{
                backgroundColor: activeWarnings.length > 0 ? 'var(--color-warning)' : 'var(--color-accent)',
                color: '#fff'
              }}
            >
              {visibleSuggestions.length + activeWarnings.length}
            </span>
          )}
          <ChevronRight
            size={16}
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      </div>

      {expanded && (
        <>
          {/* Stage Progress */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t.currentStage}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                {stageProgress}%
              </span>
            </div>
            {/* Stage indicators */}
            <div className="flex items-center gap-1">
              {allStages.map((stage, index) => {
                const stageIndex = allStages.findIndex(s => s.id === currentStage);
                const isCompleted = index < stageIndex;
                const isCurrent = index === stageIndex;

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div
                      className="w-full h-1.5 rounded-full transition-colors"
                      style={{
                        backgroundColor: isCompleted
                          ? 'var(--color-success)'
                          : isCurrent
                            ? `var(--color-accent)`
                            : 'var(--color-border)'
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {allStages.map((stage, index) => {
                const stageIndex = allStages.findIndex(s => s.id === currentStage);
                const isCurrent = index === stageIndex;
                return (
                  <span
                    key={stage.id}
                    className="text-[10px]"
                    style={{
                      color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontWeight: isCurrent ? 500 : 400
                    }}
                  >
                    {stage.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Warnings */}
          {activeWarnings.length > 0 && (
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
                <AlertTriangle size={12} />
                {t.warnings}
              </div>
              <div className="space-y-2">
                {activeWarnings.map(warning => (
                  <div
                    key={warning.id}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--color-warning)10' }}
                  >
                    <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {warning.message}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {warning.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="px-4 py-3">
            {topSuggestions.length > 0 ? (
              <div className="space-y-2">
                {topSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-3 rounded-lg flex items-start gap-3 group"
                    style={{ backgroundColor: 'var(--color-bg-hover)' }}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${getSuggestionColor(suggestion.type)}15`,
                        color: getSuggestionColor(suggestion.type)
                      }}
                    >
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
                        {suggestion.message}
                      </p>
                      {suggestion.action && (
                        <button
                          onClick={() => handleAction(suggestion)}
                          className="mt-2 text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                          style={{ color: getSuggestionColor(suggestion.type) }}
                        >
                          {suggestion.action.prompt ? t.askQuestion : t.goTo}
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDismiss(suggestion.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
                {t.noSuggestions}
              </div>
            )}

            {/* Show more/less */}
            {visibleSuggestions.length > 2 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full mt-2 text-xs text-center py-1 rounded transition-colors hover:bg-white/5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {expanded ? t.showLess : `${t.showMore} (${visibleSuggestions.length - 2})`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CopilotBubble;

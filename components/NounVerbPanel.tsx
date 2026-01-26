
import React from 'react';
import { Language } from '../types';
import { Box, Zap, Plus, X, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

interface ExtractedNoun {
  name: string;
  description: string;
  confidence: number;
}

interface ExtractedVerb {
  name: string;
  targetObject?: string;
  description: string;
  confidence: number;
}

interface NounVerbPanelProps {
  lang: Language;
  nouns: ExtractedNoun[];
  verbs: ExtractedVerb[];
  isExtracting: boolean;
  onAddNoun: (noun: ExtractedNoun) => void;
  onAddVerb: (verb: ExtractedVerb) => void;
  onDismissNoun: (name: string) => void;
  onDismissVerb: (name: string) => void;
  onClose: () => void;
}

const translations = {
  en: {
    title: 'Extracted Elements',
    objects: 'Objects (Nouns)',
    actions: 'Actions (Verbs)',
    noItems: 'No items extracted yet',
    extracting: 'Analyzing...',
    addToOntology: 'Add to Ontology',
    confidence: 'Confidence',
    target: 'Target',
    tip: 'Click + to add to your Ontology design'
  },
  cn: {
    title: '提取的元素',
    objects: '对象（名词）',
    actions: '动作（动词）',
    noItems: '暂未提取到元素',
    extracting: '正在分析...',
    addToOntology: '添加到 Ontology',
    confidence: '置信度',
    target: '目标',
    tip: '点击 + 添加到您的 Ontology 设计'
  }
};

const NounVerbPanel: React.FC<NounVerbPanelProps> = ({
  lang,
  nouns,
  verbs,
  isExtracting,
  onAddNoun,
  onAddVerb,
  onDismissNoun,
  onDismissVerb,
  onClose
}) => {
  const t = translations[lang];
  const [expandedNouns, setExpandedNouns] = React.useState(true);
  const [expandedVerbs, setExpandedVerbs] = React.useState(true);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-400';
    if (confidence >= 0.5) return 'text-amber-400';
    return 'text-muted';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-500/10';
    if (confidence >= 0.5) return 'bg-amber-500/10';
    return 'bg-gray-500/10';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">{t.title}</h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-primary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isExtracting ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted">
            <Loader2 size={24} className="animate-spin mb-2" />
            <span className="text-sm">{t.extracting}</span>
          </div>
        ) : nouns.length === 0 && verbs.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            {t.noItems}
          </div>
        ) : (
          <>
            {/* Objects Section */}
            <div>
              <button
                onClick={() => setExpandedNouns(!expandedNouns)}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedNouns ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Box size={14} className="text-amber-400" />
                <span className="text-xs font-medium text-muted">
                  {t.objects} ({nouns.length})
                </span>
              </button>

              {expandedNouns && (
                <div className="space-y-2 ml-6">
                  {nouns.map((noun, i) => (
                    <div
                      key={i}
                      className="glass-surface rounded-lg p-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {noun.name}
                            </span>
                            <span className={`text-micro px-1.5 py-0.5 rounded ${getConfidenceBg(noun.confidence)} ${getConfidenceColor(noun.confidence)}`}>
                              {Math.round(noun.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            {noun.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onAddNoun(noun)}
                            className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                            title={t.addToOntology}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => onDismissNoun(noun.name)}
                            className="p-1.5 rounded-lg bg-gray-500/20 text-muted hover:bg-gray-500/30 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div>
              <button
                onClick={() => setExpandedVerbs(!expandedVerbs)}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedVerbs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Zap size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-muted">
                  {t.actions} ({verbs.length})
                </span>
              </button>

              {expandedVerbs && (
                <div className="space-y-2 ml-6">
                  {verbs.map((verb, i) => (
                    <div
                      key={i}
                      className="glass-surface rounded-lg p-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">
                              {verb.name}
                            </span>
                            {verb.targetObject && (
                              <span className="text-micro px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                → {verb.targetObject}
                              </span>
                            )}
                            <span className={`text-micro px-1.5 py-0.5 rounded ${getConfidenceBg(verb.confidence)} ${getConfidenceColor(verb.confidence)}`}>
                              {Math.round(verb.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            {verb.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onAddVerb(verb)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title={t.addToOntology}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => onDismissVerb(verb.name)}
                            className="p-1.5 rounded-lg bg-gray-500/20 text-muted hover:bg-gray-500/30 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer tip */}
      {(nouns.length > 0 || verbs.length > 0) && (
        <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.02]">
          <p className="text-micro text-muted text-center">{t.tip}</p>
        </div>
      )}
    </div>
  );
};

export default NounVerbPanel;

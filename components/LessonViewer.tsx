import React, { useState } from 'react';
import { Language } from '../types';
import { LessonContent } from '../content/lessons/level1';
import {
  ArrowLeft, CheckCircle, ChevronRight, Lightbulb,
  BookOpen, Table2, GitCompare, HelpCircle, X
} from 'lucide-react';

interface Props {
  lang: Language;
  lesson: LessonContent;
  onBack: () => void;
  onComplete: (lessonId: string) => void;
  isCompleted: boolean;
}

const LessonViewer: React.FC<Props> = ({ lang, lesson, onBack, onComplete, isCompleted }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const t = (obj: { en: string; cn: string }) => obj[lang];
  const sections = lesson.sections;
  const quiz = lesson.quiz?.[0];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else if (quiz && !showQuiz) {
      setShowQuiz(true);
    }
  };

  const handlePrev = () => {
    if (showQuiz) {
      setShowQuiz(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === quiz?.correctIndex && !isCompleted) {
      onComplete(lesson.id);
    }
  };

  const renderSection = (section: typeof sections[0]) => {
    switch (section.type) {
      case 'keypoint':
        return (
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-amber-400 font-medium mb-2">{t(section.title)}</h4>
                <p className="text-secondary leading-relaxed">{t(section.content)}</p>
              </div>
            </div>
          </div>
        );

      case 'comparison':
        const compData = section.data;
        return (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
              <Table2 size={16} className="text-purple-400" />
              <h4 className="text-white font-medium">{t(section.title)}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {compData.headers[lang].map((header: string, i: number) => (
                      <th key={i} className="px-4 py-3 text-left text-xs text-muted font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compData.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0">
                      {row[lang].map((cell: string, j: number) => (
                        <td key={j} className={`px-4 py-3 text-sm ${j === 0 ? 'text-muted' : 'text-secondary'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'example':
        const exData = section.data;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GitCompare size={16} className="text-emerald-400" />
              <h4 className="text-white font-medium">{t(section.title)}</h4>
            </div>

            {exData.input && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xs text-muted mb-2">{t(exData.input.title)}</div>
                <p className="text-secondary leading-relaxed" dangerouslySetInnerHTML={{
                  __html: t(exData.input.text).replace(/\*\*(.*?)\*\*/g, '<span class="text-amber-400 font-medium">$1</span>')
                }} />
              </div>
            )}

            {exData.output && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-xs text-amber-400 mb-2">{lang === 'cn' ? '提取的对象' : 'Objects'}</div>
                  <div className="flex flex-wrap gap-2">
                    {exData.output.objects[lang].map((obj: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-sm">{obj}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 mb-2">{lang === 'cn' ? '提取的动作' : 'Actions'}</div>
                  <div className="flex flex-wrap gap-2">
                    {exData.output.actions[lang].map((action: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-sm">{action}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exData.knowledgeGraph && exData.ontology && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-500/5 border border-gray-500/20">
                  <div className="text-xs text-muted mb-3">{t(exData.knowledgeGraph.title)}</div>
                  <div className="space-y-2">
                    {exData.knowledgeGraph.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm text-muted font-mono">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-xs text-amber-400 mb-3">{t(exData.ontology.title)}</div>
                  <div className="space-y-2">
                    {exData.ontology.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm text-amber-300 font-mono">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exData.traditional && exData.decisionFirst && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-500/5 border border-gray-500/20">
                  <div className="text-xs text-muted mb-3">{t(exData.traditional.title)}</div>
                  <div className="space-y-2">
                    {exData.traditional.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm text-muted">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-xs text-amber-400 mb-3">{t(exData.decisionFirst.title)}</div>
                  <div className="space-y-2">
                    {exData.decisionFirst.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm text-amber-300">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Level 2: Perspectives (Triple Identity) */}
            {exData.perspectives && (
              <div className="space-y-4">
                {exData.title && (
                  <h5 className="text-sm font-medium text-white">{t(exData.title)}</h5>
                )}
                {exData.perspectives.map((perspective: any, i: number) => {
                  const colors = ['amber', 'emerald', 'purple'];
                  const color = colors[i % colors.length];
                  return (
                    <div key={i} className={`p-4 rounded-xl bg-${color}-500/5 border border-${color}-500/20`}
                      style={{
                        background: color === 'amber' ? 'rgba(212, 166, 86, 0.05)' :
                                   color === 'emerald' ? 'rgba(16, 185, 129, 0.05)' :
                                   'rgba(168, 85, 247, 0.05)',
                        borderColor: color === 'amber' ? 'rgba(212, 166, 86, 0.2)' :
                                     color === 'emerald' ? 'rgba(16, 185, 129, 0.2)' :
                                     'rgba(168, 85, 247, 0.2)'
                      }}
                    >
                      <div className={`text-xs mb-2 ${
                        color === 'amber' ? 'text-amber-400' :
                        color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'
                      }`}>{t(perspective.name)}</div>
                      <div className="space-y-1">
                        {perspective.items[lang].map((item: string, j: number) => (
                          <div key={j} className="text-sm text-secondary">• {item}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Level 2: API Mappings */}
            {exData.mappings && (
              <div className="space-y-3">
                {exData.title && (
                  <h5 className="text-sm font-medium text-white mb-4">{t(exData.title)}</h5>
                )}
                {exData.mappings.map((mapping: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs font-mono">
                      {mapping.action}
                    </span>
                    <span className="text-muted">→</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mapping.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' :
                      mapping.method === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {mapping.method}
                    </span>
                    <span className="text-muted font-mono text-sm flex-1">{mapping.url}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Level 2: Code example */}
            {exData.code && (
              <div className="space-y-3">
                {exData.title && (
                  <h5 className="text-sm font-medium text-white">{t(exData.title)}</h5>
                )}
                <div className="rounded-xl bg-[#0d0d0d] border border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="text-xs text-muted ml-2">tool-definition.json</span>
                  </div>
                  <pre className="p-4 text-sm text-secondary font-mono overflow-x-auto whitespace-pre">
                    {exData.code[lang]}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );

      case 'diagram':
        const diagData = section.data;

        // State Machine diagram type (Level 2)
        if (diagData.type === 'stateMachine') {
          const colorMap: Record<string, { bg: string; border: string; text: string }> = {
            gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-muted' },
            yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
            blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
            purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
            red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
          };

          return (
            <div className="space-y-6">
              {/* States */}
              <div>
                <div className="text-xs text-muted mb-3">{lang === 'cn' ? '状态' : 'States'}</div>
                <div className="flex flex-wrap gap-2">
                  {diagData.states.map((state: any, i: number) => {
                    const colors = colorMap[state.color] || colorMap.gray;
                    return (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} text-sm font-medium`}
                      >
                        {t(state.name)}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Transitions */}
              <div>
                <div className="text-xs text-muted mb-3">{lang === 'cn' ? '转换' : 'Transitions'}</div>
                <div className="space-y-2">
                  {diagData.transitions.map((trans: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-white/[0.04] rounded text-muted font-mono text-xs">
                        {trans.from}
                      </span>
                      <span className="text-muted">→</span>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs font-medium">
                        {lang === 'cn' ? trans.cn_action : trans.action}
                      </span>
                      <span className="text-muted">→</span>
                      <span className="px-2 py-1 bg-white/[0.04] rounded text-muted font-mono text-xs">
                        {trans.to}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Default layers diagram (Level 1)
        return (
          <div className="space-y-3">
            {diagData.layers.map((layer: any, i: number) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all ${
                  layer.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' :
                  layer.color === 'purple' ? 'bg-purple-500/5 border-purple-500/20' :
                  layer.color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className={`font-medium ${
                    layer.color === 'amber' ? 'text-amber-400' :
                    layer.color === 'purple' ? 'text-purple-400' :
                    layer.color === 'emerald' ? 'text-emerald-400' :
                    'text-blue-400'
                  }`}>{t(layer.name)}</h5>
                  <span className="text-xs text-muted">Layer {diagData.layers.length - i}</span>
                </div>
                <p className="text-sm text-muted mb-2">{t(layer.description)}</p>
                <div className="flex flex-wrap gap-2">
                  {layer.examples[lang].map((ex: string, j: number) => (
                    <span key={j} className="px-2 py-0.5 bg-white/[0.04] text-muted rounded text-xs">{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="prose prose-invert max-w-none">
            <h4 className="text-white font-medium mb-3">{t(section.title)}</h4>
            <div className="text-secondary leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{
              __html: t(section.content)
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/\n/g, '<br/>')
            }} />
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-muted hover:text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-base font-medium text-white">{t(lesson.title)}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted">
                {showQuiz ? (lang === 'cn' ? '测验' : 'Quiz') : `${currentSection + 1} / ${sections.length}`}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle size={12} />
                  {lang === 'cn' ? '已完成' : 'Completed'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSection && !showQuiz
                  ? 'bg-amber-400'
                  : i < currentSection || showQuiz
                  ? 'bg-amber-400/40'
                  : 'bg-white/10'
              }`}
            />
          ))}
          {quiz && (
            <div className={`w-2 h-2 rounded-full ml-1 ${showQuiz ? 'bg-purple-400' : 'bg-white/10'}`} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {!showQuiz ? (
            <div className="animate-fadeIn">
              {renderSection(sections[currentSection])}
            </div>
          ) : quiz && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle size={20} className="text-purple-400" />
                <h3 className="text-lg font-medium text-white">{lang === 'cn' ? '课后测验' : 'Quiz'}</h3>
              </div>

              <div className="glass-card rounded-xl p-6 mb-6">
                <p className="text-secondary mb-6">{t(quiz.question)}</p>
                <div className="space-y-3">
                  {quiz.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerSelect(i)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedAnswer === null
                          ? 'border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]'
                          : i === quiz.correctIndex
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : selectedAnswer === i
                          ? 'border-red-500/50 bg-red-500/10'
                          : 'border-white/[0.06] opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                          selectedAnswer === null
                            ? 'border-white/20 text-muted'
                            : i === quiz.correctIndex
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : selectedAnswer === i
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-white/10 text-muted'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className={
                          selectedAnswer !== null && i === quiz.correctIndex
                            ? 'text-emerald-300'
                            : selectedAnswer === i
                            ? 'text-red-300'
                            : 'text-secondary'
                        }>
                          {t(option)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {showExplanation && (
                <div className={`p-5 rounded-xl border animate-slideUp ${
                  selectedAnswer === quiz.correctIndex
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === quiz.correctIndex ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    }`}>
                      {selectedAnswer === quiz.correctIndex ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : (
                        <Lightbulb size={16} className="text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-medium mb-1 ${
                        selectedAnswer === quiz.correctIndex ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {selectedAnswer === quiz.correctIndex
                          ? (lang === 'cn' ? '正确!' : 'Correct!')
                          : (lang === 'cn' ? '解释' : 'Explanation')}
                      </h4>
                      <p className="text-secondary text-sm">{t(quiz.explanation)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentSection === 0 && !showQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted hover:text-primary hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={16} />
          {lang === 'cn' ? '上一步' : 'Previous'}
        </button>

        {(!showQuiz || !showExplanation) && (
          <button
            onClick={handleNext}
            disabled={showQuiz && !showExplanation}
            className="flex items-center gap-2 btn-gradient px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {showQuiz
              ? (lang === 'cn' ? '完成' : 'Finish')
              : currentSection === sections.length - 1
              ? (quiz ? (lang === 'cn' ? '开始测验' : 'Start Quiz') : (lang === 'cn' ? '完成' : 'Finish'))
              : (lang === 'cn' ? '下一步' : 'Next')}
            <ChevronRight size={16} />
          </button>
        )}

        {showQuiz && showExplanation && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 btn-gradient px-5 py-2 rounded-lg text-sm font-medium"
          >
            {lang === 'cn' ? '返回课程列表' : 'Back to Lessons'}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;

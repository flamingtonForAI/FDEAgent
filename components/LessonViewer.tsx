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
          <div className="p-5 rounded-xl" style={{ background: 'linear-gradient(to bottom right, rgba(var(--color-accent-rgb), 0.1), rgba(var(--color-accent-rgb), 0.05))', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(var(--color-accent-rgb), 0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.2)' }}>
                <Lightbulb size={16} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-accent)' }}>{t(section.title)}</h4>
                <p className="text-secondary leading-relaxed">{t(section.content)}</p>
              </div>
            </div>
          </div>
        );

      case 'comparison':
        const compData = section.data;
        return (
          <div className="rounded-xl overflow-hidden" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: 'var(--color-bg-hover)', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
              <Table2 size={16} style={{ color: 'var(--color-accent-secondary)' }} />
              <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t(section.title)}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
                    {compData.headers[lang].map((header: string, i: number) => (
                      <th key={i} className="px-4 py-3 text-left text-xs text-muted font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compData.rows.map((row: any, i: number) => (
                    <tr key={i} className="last:border-0" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border-subtle)' }}>
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
              <GitCompare size={16} style={{ color: 'var(--color-success)' }} />
              <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t(section.title)}</h4>
            </div>

            {exData.input && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                <div className="text-xs text-muted mb-2">{t(exData.input.title)}</div>
                <p className="text-secondary leading-relaxed" dangerouslySetInnerHTML={{
                  __html: t(exData.input.text).replace(/\*\*(.*?)\*\*/g, '<span style="color: var(--color-accent); font-weight: 500;">$1</span>')
                }} />
              </div>
            )}

            {exData.output && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.05)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(var(--color-accent-rgb), 0.2)' }}>
                  <div className="text-xs mb-2" style={{ color: 'var(--color-accent)' }}>{lang === 'cn' ? '提取的对象' : 'Objects'}</div>
                  <div className="flex flex-wrap gap-2">
                    {exData.output.objects[lang].map((obj: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.2)', color: 'var(--color-accent)' }}>{obj}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <div className="text-xs mb-2" style={{ color: 'var(--color-success)' }}>{lang === 'cn' ? '提取的动作' : 'Actions'}</div>
                  <div className="flex flex-wrap gap-2">
                    {exData.output.actions[lang].map((action: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>{action}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exData.knowledgeGraph && exData.ontology && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                  <div className="text-xs text-muted mb-3">{t(exData.knowledgeGraph.title)}</div>
                  <div className="space-y-2">
                    {exData.knowledgeGraph.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm text-muted font-mono">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.05)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(var(--color-accent-rgb), 0.2)' }}>
                  <div className="text-xs mb-3" style={{ color: 'var(--color-accent)' }}>{t(exData.ontology.title)}</div>
                  <div className="space-y-2">
                    {exData.ontology.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm font-mono" style={{ color: 'var(--color-accent)' }}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exData.traditional && exData.decisionFirst && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                  <div className="text-xs text-muted mb-3">{t(exData.traditional.title)}</div>
                  <div className="space-y-2">
                    {exData.traditional.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm text-muted">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.05)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(var(--color-accent-rgb), 0.2)' }}>
                  <div className="text-xs mb-3" style={{ color: 'var(--color-accent)' }}>{t(exData.decisionFirst.title)}</div>
                  <div className="space-y-2">
                    {exData.decisionFirst.items[lang].map((item: string, i: number) => (
                      <div key={i} className="text-sm" style={{ color: 'var(--color-accent)' }}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Level 2: Perspectives (Triple Identity) */}
            {exData.perspectives && (
              <div className="space-y-4">
                {exData.title && (
                  <h5 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t(exData.title)}</h5>
                )}
                {exData.perspectives.map((perspective: any, i: number) => {
                  const colorStyles = [
                    { bg: 'rgba(var(--color-accent-rgb), 0.05)', border: 'rgba(var(--color-accent-rgb), 0.2)', text: 'var(--color-accent)' },
                    { bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--color-success)' },
                    { bg: 'rgba(var(--color-accent-secondary-rgb), 0.05)', border: 'rgba(var(--color-accent-secondary-rgb), 0.2)', text: 'var(--color-accent-secondary)' }
                  ];
                  const colorStyle = colorStyles[i % colorStyles.length];
                  return (
                    <div key={i} className="p-4 rounded-xl"
                      style={{
                        backgroundColor: colorStyle.bg,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: colorStyle.border
                      }}
                    >
                      <div className="text-xs mb-2" style={{ color: colorStyle.text }}>{t(perspective.name)}</div>
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
                  <h5 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>{t(exData.title)}</h5>
                )}
                {exData.mappings.map((mapping: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                    <span className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.2)', color: 'var(--color-accent)' }}>
                      {mapping.action}
                    </span>
                    <span className="text-muted">-&gt;</span>
                    <span className="px-2 py-1 rounded text-xs font-medium" style={{
                      backgroundColor: mapping.method === 'POST' ? 'rgba(16, 185, 129, 0.2)' :
                        mapping.method === 'DELETE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: mapping.method === 'POST' ? 'var(--color-success)' :
                        mapping.method === 'DELETE' ? 'var(--color-error)' : 'var(--color-warning)'
                    }}>
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
                  <h5 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t(exData.title)}</h5>
                )}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-base)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.6)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(245, 158, 11, 0.6)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.6)' }} />
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
            gray: { bg: 'var(--color-bg-hover)', border: 'var(--color-border)', text: 'var(--color-text-muted)' },
            yellow: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--color-warning)' },
            blue: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: 'var(--color-info)' },
            purple: { bg: 'rgba(var(--color-accent-secondary-rgb), 0.1)', border: 'rgba(var(--color-accent-secondary-rgb), 0.3)', text: 'var(--color-accent-secondary)' },
            emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--color-success)' },
            red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'var(--color-error)' },
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
                        className="px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: colors.bg, borderWidth: '1px', borderStyle: 'solid', borderColor: colors.border, color: colors.text }}
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
                      <span className="px-2 py-1 rounded text-muted font-mono text-xs" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                        {trans.from}
                      </span>
                      <span className="text-muted">-&gt;</span>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.2)', color: 'var(--color-accent)' }}>
                        {lang === 'cn' ? trans.cn_action : trans.action}
                      </span>
                      <span className="text-muted">-&gt;</span>
                      <span className="px-2 py-1 rounded text-muted font-mono text-xs" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
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
        const layerColorStyles: Record<string, { bg: string; border: string; text: string }> = {
          amber: { bg: 'rgba(var(--color-accent-rgb), 0.05)', border: 'rgba(var(--color-accent-rgb), 0.2)', text: 'var(--color-accent)' },
          purple: { bg: 'rgba(var(--color-accent-secondary-rgb), 0.05)', border: 'rgba(var(--color-accent-secondary-rgb), 0.2)', text: 'var(--color-accent-secondary)' },
          emerald: { bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--color-success)' },
          blue: { bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.2)', text: 'var(--color-info)' }
        };
        return (
          <div className="space-y-3">
            {diagData.layers.map((layer: any, i: number) => {
              const colorStyle = layerColorStyles[layer.color] || layerColorStyles.blue;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl transition-all"
                  style={{ backgroundColor: colorStyle.bg, borderWidth: '1px', borderStyle: 'solid', borderColor: colorStyle.border }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium" style={{ color: colorStyle.text }}>{t(layer.name)}</h5>
                    <span className="text-xs text-muted">Layer {diagData.layers.length - i}</span>
                  </div>
                  <p className="text-sm text-muted mb-2">{t(layer.description)}</p>
                  <div className="flex flex-wrap gap-2">
                    {layer.examples[lang].map((ex: string, j: number) => (
                      <span key={j} className="px-2 py-0.5 text-muted rounded text-xs" style={{ backgroundColor: 'var(--color-bg-hover)' }}>{ex}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="prose prose-invert max-w-none">
            <h4 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>{t(section.title)}</h4>
            <div className="text-secondary leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{
              __html: t(section.content)
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-text-primary);">$1</strong>')
                .replace(/\n/g, '<br/>')
            }} />
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors text-muted hover:text-primary"
            style={{ backgroundColor: 'transparent' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{t(lesson.title)}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted">
                {showQuiz ? (lang === 'cn' ? '测验' : 'Quiz') : `${currentSection + 1} / ${sections.length}`}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-success)' }}>
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
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: i === currentSection && !showQuiz
                  ? 'var(--color-accent)'
                  : i < currentSection || showQuiz
                  ? 'rgba(var(--color-accent-rgb), 0.4)'
                  : 'var(--color-border)'
              }}
            />
          ))}
          {quiz && (
            <div className="w-2 h-2 rounded-full ml-1" style={{ backgroundColor: showQuiz ? 'var(--color-accent-secondary)' : 'var(--color-border)' }} />
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
                <HelpCircle size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{lang === 'cn' ? '课后测验' : 'Quiz'}</h3>
              </div>

              <div className="glass-card rounded-xl p-6 mb-6">
                <p className="text-secondary mb-6">{t(quiz.question)}</p>
                <div className="space-y-3">
                  {quiz.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerSelect(i)}
                      disabled={selectedAnswer !== null}
                      className="w-full text-left p-4 rounded-lg transition-all"
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: selectedAnswer === null
                          ? 'var(--color-border)'
                          : i === quiz.correctIndex
                          ? 'rgba(16, 185, 129, 0.5)'
                          : selectedAnswer === i
                          ? 'rgba(239, 68, 68, 0.5)'
                          : 'var(--color-border)',
                        backgroundColor: selectedAnswer === null
                          ? 'transparent'
                          : i === quiz.correctIndex
                          ? 'rgba(16, 185, 129, 0.1)'
                          : selectedAnswer === i
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                        opacity: selectedAnswer !== null && i !== quiz.correctIndex && selectedAnswer !== i ? 0.5 : 1
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                          style={{
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: selectedAnswer === null
                              ? 'var(--color-border)'
                              : i === quiz.correctIndex
                              ? 'var(--color-success)'
                              : selectedAnswer === i
                              ? 'var(--color-error)'
                              : 'var(--color-border-subtle)',
                            backgroundColor: selectedAnswer === null
                              ? 'transparent'
                              : i === quiz.correctIndex
                              ? 'var(--color-success)'
                              : selectedAnswer === i
                              ? 'var(--color-error)'
                              : 'transparent',
                            color: (selectedAnswer !== null && (i === quiz.correctIndex || selectedAnswer === i))
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-muted)'
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{
                          color: selectedAnswer !== null && i === quiz.correctIndex
                            ? 'var(--color-success)'
                            : selectedAnswer === i
                            ? 'var(--color-error)'
                            : 'var(--color-text-secondary)'
                        }}>
                          {t(option)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {showExplanation && (
                <div className="p-5 rounded-xl animate-slideUp"
                  style={{
                    backgroundColor: selectedAnswer === quiz.correctIndex
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(var(--color-accent-rgb), 0.1)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: selectedAnswer === quiz.correctIndex
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(var(--color-accent-rgb), 0.2)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: selectedAnswer === quiz.correctIndex
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(var(--color-accent-rgb), 0.2)'
                      }}
                    >
                      {selectedAnswer === quiz.correctIndex ? (
                        <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <Lightbulb size={16} style={{ color: 'var(--color-accent)' }} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1"
                        style={{ color: selectedAnswer === quiz.correctIndex ? 'var(--color-success)' : 'var(--color-accent)' }}
                      >
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
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
        <button
          onClick={handlePrev}
          disabled={currentSection === 0 && !showQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: 'transparent' }}
          onMouseOver={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

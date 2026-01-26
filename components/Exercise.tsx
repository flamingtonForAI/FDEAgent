import React, { useState } from 'react';
import { Language } from '../types';
import {
  ArrowLeft, CheckCircle, XCircle, Lightbulb, Target,
  Zap, RefreshCw, Award, ChevronRight
} from 'lucide-react';

interface Props {
  lang: Language;
  exerciseType: 'noun-verb' | 'action-design';
  exerciseId: string;
  onBack: () => void;
  onComplete: (exerciseId: string, score: number) => void;
}

// Noun-Verb extraction exercise data
interface NounVerbExercise {
  id: string;
  scenario: { en: string; cn: string };
  correctNouns: string[];
  correctVerbs: string[];
  distractors: { nouns: string[]; verbs: string[] };
}

// Action design exercise data
interface ActionDesignExercise {
  id: string;
  actionName: { en: string; cn: string };
  context: { en: string; cn: string };
  blanks: {
    field: string;
    label: { en: string; cn: string };
    correctAnswers: string[];
    hint: { en: string; cn: string };
  }[];
}

const nounVerbExercises: NounVerbExercise[] = [
  {
    id: 'nv_1',
    scenario: {
      en: 'When a customer places an order, the warehouse manager needs to verify inventory levels. If stock is sufficient, the system reserves the items and notifies the shipping department to prepare the package.',
      cn: '当客户下订单时，仓库经理需要验证库存水平。如果库存充足，系统预留商品并通知配送部门准备包裹。'
    },
    correctNouns: ['Customer', 'Order', 'Warehouse Manager', 'Inventory', 'Shipping Department', 'Package'],
    correctVerbs: ['Place Order', 'Verify Inventory', 'Reserve Items', 'Notify', 'Prepare Package'],
    distractors: {
      nouns: ['Database', 'API', 'Button', 'Screen'],
      verbs: ['Click', 'Load', 'Render', 'Cache']
    }
  },
  {
    id: 'nv_2',
    scenario: {
      en: 'The procurement officer submits a purchase request for office supplies. The department head reviews and approves the request if the budget allows. Once approved, the finance team processes the payment to the supplier.',
      cn: '采购专员提交办公用品的采购申请。部门主管审核并在预算允许的情况下批准申请。一旦批准，财务团队向供应商处理付款。'
    },
    correctNouns: ['Procurement Officer', 'Purchase Request', 'Office Supplies', 'Department Head', 'Budget', 'Finance Team', 'Payment', 'Supplier'],
    correctVerbs: ['Submit Request', 'Review', 'Approve', 'Process Payment'],
    distractors: {
      nouns: ['Server', 'Email', 'Report', 'Dashboard'],
      verbs: ['Login', 'Export', 'Filter', 'Sort']
    }
  }
];

const actionDesignExercises: ActionDesignExercise[] = [
  {
    id: 'ad_1',
    actionName: { en: 'Approve Purchase Request', cn: '审批采购申请' },
    context: {
      en: 'A manager needs to approve purchase requests from team members. Only pending requests can be approved, and the manager must have approval authority for the request amount.',
      cn: '经理需要审批团队成员的采购申请。只有待审批的申请可以被批准，且经理必须具有该金额的审批权限。'
    },
    blanks: [
      {
        field: 'targetObject',
        label: { en: 'Target Object', cn: '目标对象' },
        correctAnswers: ['Purchase Request', 'PurchaseRequest', '采购申请'],
        hint: { en: 'What entity is being acted upon?', cn: '哪个实体被操作？' }
      },
      {
        field: 'executorRole',
        label: { en: 'Executor Role', cn: '执行角色' },
        correctAnswers: ['Manager', 'Department Head', 'Approver', '经理', '部门主管', '审批人'],
        hint: { en: 'Who performs this action?', cn: '谁执行这个操作？' }
      },
      {
        field: 'precondition',
        label: { en: 'Precondition (status)', cn: '前置条件（状态）' },
        correctAnswers: ['Pending', 'Pending Approval', 'Submitted', '待审批', '已提交'],
        hint: { en: 'What status must the request be in?', cn: '申请必须处于什么状态？' }
      },
      {
        field: 'postcondition',
        label: { en: 'Postcondition (new status)', cn: '后置状态（新状态）' },
        correctAnswers: ['Approved', '已批准', '已审批'],
        hint: { en: 'What status after approval?', cn: '审批后是什么状态？' }
      }
    ]
  },
  {
    id: 'ad_2',
    actionName: { en: 'Ship Order', cn: '发货' },
    context: {
      en: 'The warehouse staff ships an order to the customer. The order must be paid and packed before shipping. After shipping, a tracking number is generated.',
      cn: '仓库人员将订单发货给客户。订单必须已付款且已打包才能发货。发货后生成物流单号。'
    },
    blanks: [
      {
        field: 'targetObject',
        label: { en: 'Target Object', cn: '目标对象' },
        correctAnswers: ['Order', '订单'],
        hint: { en: 'What is being shipped?', cn: '发什么？' }
      },
      {
        field: 'executorRole',
        label: { en: 'Executor Role', cn: '执行角色' },
        correctAnswers: ['Warehouse Staff', 'Warehouse', 'Shipping Staff', '仓库人员', '配送员'],
        hint: { en: 'Who handles shipping?', cn: '谁处理发货？' }
      },
      {
        field: 'precondition',
        label: { en: 'Precondition (status)', cn: '前置条件（状态）' },
        correctAnswers: ['Paid', 'Packed', 'Ready to Ship', '已付款', '已打包', '待发货'],
        hint: { en: 'What status before shipping?', cn: '发货前是什么状态？' }
      },
      {
        field: 'sideEffect',
        label: { en: 'Side Effect', cn: '副作用' },
        correctAnswers: ['Generate Tracking Number', 'Send Notification', 'Tracking', '生成物流单号', '发送通知'],
        hint: { en: 'What else happens?', cn: '还会发生什么？' }
      }
    ]
  }
];

const translations = {
  en: {
    nounVerbTitle: 'Noun-Verb Extraction',
    nounVerbDesc: 'Identify Objects (nouns) and Actions (verbs) from the business description',
    actionDesignTitle: 'Action Design',
    actionDesignDesc: 'Complete the Action definition based on the context',
    scenario: 'Business Scenario',
    selectNouns: 'Select all Objects (Nouns)',
    selectVerbs: 'Select all Actions (Verbs)',
    checkAnswer: 'Check Answer',
    nextExercise: 'Next Exercise',
    tryAgain: 'Try Again',
    correct: 'Correct!',
    incorrect: 'Not quite right',
    score: 'Score',
    hint: 'Hint',
    showHint: 'Show Hint',
    actionContext: 'Context',
    fillBlanks: 'Fill in the blanks for',
    yourAnswer: 'Your answer',
    completed: 'Exercise Complete!',
    accuracy: 'Accuracy',
    backToAcademy: 'Back to Academy'
  },
  cn: {
    nounVerbTitle: 'Noun-Verb 提取',
    nounVerbDesc: '从业务描述中识别对象（名词）和动作（动词）',
    actionDesignTitle: 'Action 设计',
    actionDesignDesc: '根据上下文完成 Action 定义',
    scenario: '业务场景',
    selectNouns: '选择所有对象（名词）',
    selectVerbs: '选择所有动作（动词）',
    checkAnswer: '检查答案',
    nextExercise: '下一题',
    tryAgain: '再试一次',
    correct: '正确！',
    incorrect: '不太对',
    score: '得分',
    hint: '提示',
    showHint: '显示提示',
    actionContext: '上下文',
    fillBlanks: '填写以下内容',
    yourAnswer: '你的答案',
    completed: '练习完成！',
    accuracy: '正确率',
    backToAcademy: '返回学习中心'
  }
};

const Exercise: React.FC<Props> = ({ lang, exerciseType, exerciseId, onBack, onComplete }) => {
  const t = translations[lang];

  // Noun-Verb state
  const [selectedNouns, setSelectedNouns] = useState<Set<string>>(new Set());
  const [selectedVerbs, setSelectedVerbs] = useState<Set<string>>(new Set());

  // Action Design state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Set<string>>(new Set());

  // Common state
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);

  const exercises = exerciseType === 'noun-verb' ? nounVerbExercises : actionDesignExercises;
  const currentExercise = exercises[currentIndex];

  const resetState = () => {
    setSelectedNouns(new Set());
    setSelectedVerbs(new Set());
    setAnswers({});
    setShowHints(new Set());
    setSubmitted(false);
  };

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    } else {
      // All exercises completed
      const finalScore = Math.round((totalScore / exercises.length) * 100);
      onComplete(exerciseId, finalScore);
    }
  };

  // Noun-Verb specific logic
  const renderNounVerbExercise = () => {
    const exercise = currentExercise as NounVerbExercise;
    const allNouns = [...exercise.correctNouns, ...exercise.distractors.nouns].sort();
    const allVerbs = [...exercise.correctVerbs, ...exercise.distractors.verbs].sort();

    const checkNounVerbAnswer = () => {
      const nounScore = exercise.correctNouns.filter(n => selectedNouns.has(n)).length / exercise.correctNouns.length;
      const nounPenalty = exercise.distractors.nouns.filter(n => selectedNouns.has(n)).length * 0.1;
      const verbScore = exercise.correctVerbs.filter(v => selectedVerbs.has(v)).length / exercise.correctVerbs.length;
      const verbPenalty = exercise.distractors.verbs.filter(v => selectedVerbs.has(v)).length * 0.1;

      const score = Math.max(0, (nounScore + verbScore) / 2 - nounPenalty - verbPenalty);
      setTotalScore(totalScore + score);
      setExercisesCompleted(exercisesCompleted + 1);
      setSubmitted(true);
    };

    const isNounCorrect = (noun: string) => exercise.correctNouns.includes(noun);
    const isVerbCorrect = (verb: string) => exercise.correctVerbs.includes(verb);

    return (
      <div className="space-y-6">
        {/* Scenario */}
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-muted mb-2">{t.scenario}</div>
          <p className="text-secondary leading-relaxed">{exercise.scenario[lang]}</p>
        </div>

        {/* Nouns Selection */}
        <div>
          <div className="text-sm mb-3" style={{ color: 'var(--color-accent)' }}>{t.selectNouns}</div>
          <div className="flex flex-wrap gap-2">
            {allNouns.map(noun => {
              const isSelected = selectedNouns.has(noun);
              const showResult = submitted;
              const correct = isNounCorrect(noun);

              return (
                <button
                  key={noun}
                  onClick={() => {
                    if (submitted) return;
                    const newSet = new Set(selectedNouns);
                    if (isSelected) newSet.delete(noun);
                    else newSet.add(noun);
                    setSelectedNouns(newSet);
                  }}
                  disabled={submitted}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
                  style={{
                    backgroundColor: showResult
                      ? correct
                        ? 'var(--color-bg-hover)'
                        : isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)'
                      : isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                    color: showResult
                      ? correct
                        ? 'var(--color-success)'
                        : isSelected ? 'var(--color-error)' : 'var(--color-text-muted)'
                      : isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    borderColor: showResult
                      ? correct
                        ? 'var(--color-success)'
                        : isSelected ? 'var(--color-error)' : 'var(--color-border)'
                      : isSelected ? 'var(--color-accent)' : 'var(--color-border)'
                  }}
                >
                  {noun}
                  {showResult && correct && <CheckCircle size={12} className="inline ml-1" />}
                  {showResult && !correct && isSelected && <XCircle size={12} className="inline ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Verbs Selection */}
        <div>
          <div className="text-sm mb-3" style={{ color: 'var(--color-success)' }}>{t.selectVerbs}</div>
          <div className="flex flex-wrap gap-2">
            {allVerbs.map(verb => {
              const isSelected = selectedVerbs.has(verb);
              const showResult = submitted;
              const correct = isVerbCorrect(verb);

              return (
                <button
                  key={verb}
                  onClick={() => {
                    if (submitted) return;
                    const newSet = new Set(selectedVerbs);
                    if (isSelected) newSet.delete(verb);
                    else newSet.add(verb);
                    setSelectedVerbs(newSet);
                  }}
                  disabled={submitted}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
                  style={{
                    backgroundColor: showResult
                      ? correct
                        ? 'var(--color-bg-hover)'
                        : isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)'
                      : isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                    color: showResult
                      ? correct
                        ? 'var(--color-success)'
                        : isSelected ? 'var(--color-error)' : 'var(--color-text-muted)'
                      : isSelected ? 'var(--color-success)' : 'var(--color-text-muted)',
                    borderColor: showResult
                      ? correct
                        ? 'var(--color-success)'
                        : isSelected ? 'var(--color-error)' : 'var(--color-border)'
                      : isSelected ? 'var(--color-success)' : 'var(--color-border)'
                  }}
                >
                  {verb}
                  {showResult && correct && <CheckCircle size={12} className="inline ml-1" />}
                  {showResult && !correct && isSelected && <XCircle size={12} className="inline ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {!submitted ? (
            <button
              onClick={checkNounVerbAnswer}
              disabled={selectedNouns.size === 0 && selectedVerbs.size === 0}
              className="btn-gradient px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Target size={16} />
              {t.checkAnswer}
            </button>
          ) : (
            <button
              onClick={handleNextExercise}
              className="btn-gradient px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {currentIndex < exercises.length - 1 ? t.nextExercise : t.backToAcademy}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Action Design specific logic
  const renderActionDesignExercise = () => {
    const exercise = currentExercise as ActionDesignExercise;

    const checkActionDesignAnswer = () => {
      let correctCount = 0;
      exercise.blanks.forEach(blank => {
        const userAnswer = (answers[blank.field] || '').trim().toLowerCase();
        const isCorrect = blank.correctAnswers.some(
          correct => correct.toLowerCase() === userAnswer
        );
        if (isCorrect) correctCount++;
      });

      const score = correctCount / exercise.blanks.length;
      setTotalScore(totalScore + score);
      setExercisesCompleted(exercisesCompleted + 1);
      setSubmitted(true);
    };

    const isFieldCorrect = (field: string) => {
      const blank = exercise.blanks.find(b => b.field === field);
      if (!blank) return false;
      const userAnswer = (answers[field] || '').trim().toLowerCase();
      return blank.correctAnswers.some(correct => correct.toLowerCase() === userAnswer);
    };

    return (
      <div className="space-y-6">
        {/* Context */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} style={{ color: 'var(--color-accent-secondary)' }} />
            <span className="font-medium" style={{ color: 'var(--color-accent-secondary)' }}>{exercise.actionName[lang]}</span>
          </div>
          <div className="text-xs text-muted mb-2">{t.actionContext}</div>
          <p className="text-secondary leading-relaxed">{exercise.context[lang]}</p>
        </div>

        {/* Fill in blanks */}
        <div className="space-y-4">
          <div className="text-sm text-muted">{t.fillBlanks}:</div>
          {exercise.blanks.map(blank => {
            const showResult = submitted;
            const correct = isFieldCorrect(blank.field);
            const showHint = showHints.has(blank.field);

            return (
              <div key={blank.field} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-secondary">{blank.label[lang]}</label>
                  {!submitted && !showHint && (
                    <button
                      onClick={() => setShowHints(new Set([...showHints, blank.field]))}
                      className="text-xs text-muted flex items-center gap-1"
                    >
                      <Lightbulb size={12} />
                      {t.showHint}
                    </button>
                  )}
                </div>

                {showHint && !submitted && (
                  <div className="text-xs px-3 py-1.5 rounded" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-bg-hover)' }}>
                    {t.hint}: {blank.hint[lang]}
                  </div>
                )}

                <input
                  type="text"
                  value={answers[blank.field] || ''}
                  onChange={e => setAnswers({ ...answers, [blank.field]: e.target.value })}
                  disabled={submitted}
                  placeholder={t.yourAnswer}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: showResult
                      ? correct ? 'var(--color-success)' : 'var(--color-error)'
                      : 'var(--color-border)',
                    color: showResult
                      ? correct ? 'var(--color-success)' : 'var(--color-error)'
                      : 'var(--color-text-primary)'
                  }}
                />

                {showResult && !correct && (
                  <div className="text-xs text-muted">
                    {lang === 'cn' ? '参考答案：' : 'Accepted: '}{blank.correctAnswers.slice(0, 2).join(' / ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {!submitted ? (
            <button
              onClick={checkActionDesignAnswer}
              disabled={Object.keys(answers).length === 0}
              className="btn-gradient px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Target size={16} />
              {t.checkAnswer}
            </button>
          ) : (
            <button
              onClick={handleNextExercise}
              className="btn-gradient px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {currentIndex < exercises.length - 1 ? t.nextExercise : t.backToAcademy}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors text-muted hover:text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {exerciseType === 'noun-verb' ? t.nounVerbTitle : t.actionDesignTitle}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {exerciseType === 'noun-verb' ? t.nounVerbDesc : t.actionDesignDesc}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted">
            {currentIndex + 1} / {exercises.length}
          </div>
          <div className="flex gap-1">
            {exercises.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i < currentIndex
                    ? 'var(--color-success)'
                    : i === currentIndex
                    ? 'var(--color-accent)'
                    : 'var(--color-bg-hover)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {exerciseType === 'noun-verb' ? renderNounVerbExercise() : renderActionDesignExercise()}
        </div>
      </div>

      {/* Result overlay when all done */}
      {exercisesCompleted === exercises.length && submitted && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(var(--color-bg-base), 0.8)' }}>
          <div className="glass-card rounded-2xl p-8 text-center max-w-sm mx-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
              <Award size={32} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{t.completed}</h3>
            <div className="text-3xl font-bold text-gradient mb-1">
              {Math.round((totalScore / exercises.length) * 100)}%
            </div>
            <div className="text-sm text-muted mb-6">{t.accuracy}</div>
            <button
              onClick={() => onComplete(exerciseId, Math.round((totalScore / exercises.length) * 100))}
              className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-medium"
            >
              {t.backToAcademy}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercise;

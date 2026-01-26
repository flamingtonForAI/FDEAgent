import React, { useState, useCallback } from 'react';
import { Language } from '../types';
import {
  MessageSquare,
  Target,
  Database,
  Users,
  Workflow,
  Shield,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Copy,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface InterviewGuideProps {
  lang: Language;
  onInsertQuestion?: (question: string) => void;
  completedQuestions: Set<string>;
  onToggleQuestion: (questionId: string) => void;
}

// 访谈脚本库 - 按阶段组织
const interviewScripts = {
  cn: {
    phases: [
      {
        id: 'business-context',
        name: '业务背景',
        icon: Target,
        description: '理解业务目标和痛点',
        color: '#58a6ff',
        questions: [
          {
            id: 'bc-1',
            question: '您希望通过这个系统解决什么核心业务问题？',
            purpose: '明确项目价值主张',
            followUp: '这个问题如果不解决，会带来什么后果？',
            priority: 'critical'
          },
          {
            id: 'bc-2',
            question: '目前这个业务流程是怎么运作的？有哪些关键步骤？',
            purpose: '理解现状（As-Is）',
            followUp: '每个步骤大概需要多长时间？涉及哪些人？',
            priority: 'critical'
          },
          {
            id: 'bc-3',
            question: '您期望的理想状态是什么样的？',
            purpose: '定义目标状态（To-Be）',
            followUp: '如何衡量是否达到了理想状态？有什么KPI吗？',
            priority: 'high'
          },
          {
            id: 'bc-4',
            question: '这个项目的成功标准是什么？如何量化？',
            purpose: '建立可衡量的目标',
            followUp: '有没有时间节点的要求？',
            priority: 'high'
          }
        ]
      },
      {
        id: 'data-sources',
        name: '数据源盘点',
        icon: Database,
        description: '识别数据来源和质量',
        color: '#3fb950',
        questions: [
          {
            id: 'ds-1',
            question: '目前有哪些系统在支撑这个业务？（ERP、CRM、MES等）',
            purpose: '识别源系统',
            followUp: '这些系统之间有数据交互吗？',
            priority: 'critical'
          },
          {
            id: 'ds-2',
            question: '关键业务数据存储在哪里？格式是什么？',
            purpose: '定位核心数据',
            followUp: '数据量大概有多大？更新频率如何？',
            priority: 'critical'
          },
          {
            id: 'ds-3',
            question: '数据质量如何？有没有缺失、重复或不一致的问题？',
            purpose: '评估数据质量风险',
            followUp: '有没有主数据管理（MDM）或数据治理流程？',
            priority: 'high'
          },
          {
            id: 'ds-4',
            question: '有哪些数据是敏感的，需要特别的权限控制？',
            purpose: '识别数据安全要求',
            followUp: '有没有合规要求？（GDPR、等保等）',
            priority: 'high'
          }
        ]
      },
      {
        id: 'users-roles',
        name: '用户与角色',
        icon: Users,
        description: '明确使用者和权限',
        color: '#a371f7',
        questions: [
          {
            id: 'ur-1',
            question: '谁会使用这个系统？有哪些不同的角色？',
            purpose: '识别用户群体',
            followUp: '每个角色大概有多少人？使用频率如何？',
            priority: 'critical'
          },
          {
            id: 'ur-2',
            question: '不同角色需要看到/操作哪些数据？',
            purpose: '定义权限边界',
            followUp: '有没有审批流程？谁有最终决策权？',
            priority: 'high'
          },
          {
            id: 'ur-3',
            question: '用户目前最大的痛点是什么？最希望改善什么？',
            purpose: '理解用户需求',
            followUp: '有没有收集过用户反馈？',
            priority: 'high'
          },
          {
            id: 'ur-4',
            question: '用户的技术水平如何？需要什么程度的培训？',
            purpose: '评估采用难度',
            followUp: '有没有类似系统的使用经验？',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'workflows',
        name: '操作流程',
        icon: Workflow,
        description: '梳理核心操作和自动化',
        color: '#f0883e',
        questions: [
          {
            id: 'wf-1',
            question: '日常最频繁的操作是什么？',
            purpose: '识别核心 Action',
            followUp: '这个操作需要哪些输入？会产生什么结果？',
            priority: 'critical'
          },
          {
            id: 'wf-2',
            question: '有哪些操作是可以自动化的？哪些必须人工处理？',
            purpose: '定义自动化边界',
            followUp: '自动化的触发条件是什么？',
            priority: 'high'
          },
          {
            id: 'wf-3',
            question: '操作之间有什么依赖关系？执行顺序是怎样的？',
            purpose: '理解流程编排',
            followUp: '如果某个步骤失败了，应该怎么处理？',
            priority: 'high'
          },
          {
            id: 'wf-4',
            question: '有没有需要 AI 辅助决策的场景？',
            purpose: '识别 AI 增强点',
            followUp: 'AI 的建议需要人工确认吗？',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'governance',
        name: '治理与合规',
        icon: Shield,
        description: '确保安全和可追溯',
        color: '#f85149',
        questions: [
          {
            id: 'gv-1',
            question: '有哪些操作需要审批？审批流程是怎样的？',
            purpose: '定义治理规则',
            followUp: '审批超时怎么处理？有没有升级机制？',
            priority: 'high'
          },
          {
            id: 'gv-2',
            question: '需要记录哪些操作日志？保留多长时间？',
            purpose: '审计追溯要求',
            followUp: '有没有定期审计的要求？',
            priority: 'medium'
          },
          {
            id: 'gv-3',
            question: '有没有行业法规或内部合规要求需要遵守？',
            purpose: '合规风险识别',
            followUp: '不合规的后果是什么？',
            priority: 'high'
          },
          {
            id: 'gv-4',
            question: '系统出问题时，有什么应急预案？',
            purpose: '业务连续性',
            followUp: '可以接受的最长停机时间是多少？',
            priority: 'medium'
          }
        ]
      }
    ]
  },
  en: {
    phases: [
      {
        id: 'business-context',
        name: 'Business Context',
        icon: Target,
        description: 'Understand business goals and pain points',
        color: '#58a6ff',
        questions: [
          {
            id: 'bc-1',
            question: 'What core business problem do you want to solve with this system?',
            purpose: 'Define value proposition',
            followUp: 'What are the consequences if this problem remains unsolved?',
            priority: 'critical'
          },
          {
            id: 'bc-2',
            question: 'How does the current business process work? What are the key steps?',
            purpose: 'Understand As-Is state',
            followUp: 'How long does each step take? Who is involved?',
            priority: 'critical'
          },
          {
            id: 'bc-3',
            question: 'What does your ideal state look like?',
            purpose: 'Define To-Be state',
            followUp: 'How would you measure success? Any KPIs?',
            priority: 'high'
          },
          {
            id: 'bc-4',
            question: 'What are the success criteria? How can they be quantified?',
            purpose: 'Establish measurable goals',
            followUp: 'Are there any timeline requirements?',
            priority: 'high'
          }
        ]
      },
      {
        id: 'data-sources',
        name: 'Data Sources',
        icon: Database,
        description: 'Identify data sources and quality',
        color: '#3fb950',
        questions: [
          {
            id: 'ds-1',
            question: 'What systems currently support this business? (ERP, CRM, MES, etc.)',
            purpose: 'Identify source systems',
            followUp: 'Do these systems exchange data with each other?',
            priority: 'critical'
          },
          {
            id: 'ds-2',
            question: 'Where is key business data stored? What format?',
            purpose: 'Locate core data',
            followUp: 'How large is the dataset? How often is it updated?',
            priority: 'critical'
          },
          {
            id: 'ds-3',
            question: 'How is the data quality? Any missing, duplicate, or inconsistent data?',
            purpose: 'Assess data quality risks',
            followUp: 'Is there MDM or data governance in place?',
            priority: 'high'
          },
          {
            id: 'ds-4',
            question: 'Which data is sensitive and requires special access control?',
            purpose: 'Identify security requirements',
            followUp: 'Any compliance requirements? (GDPR, etc.)',
            priority: 'high'
          }
        ]
      },
      {
        id: 'users-roles',
        name: 'Users & Roles',
        icon: Users,
        description: 'Define users and permissions',
        color: '#a371f7',
        questions: [
          {
            id: 'ur-1',
            question: 'Who will use this system? What different roles are there?',
            purpose: 'Identify user groups',
            followUp: 'How many people per role? How often will they use it?',
            priority: 'critical'
          },
          {
            id: 'ur-2',
            question: 'What data should different roles see/operate on?',
            purpose: 'Define permission boundaries',
            followUp: 'Is there an approval workflow? Who has final authority?',
            priority: 'high'
          },
          {
            id: 'ur-3',
            question: 'What are the biggest pain points for users? What do they want improved?',
            purpose: 'Understand user needs',
            followUp: 'Has user feedback been collected?',
            priority: 'high'
          },
          {
            id: 'ur-4',
            question: 'What is the technical proficiency of users? How much training is needed?',
            purpose: 'Assess adoption difficulty',
            followUp: 'Any experience with similar systems?',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'workflows',
        name: 'Workflows',
        icon: Workflow,
        description: 'Map core operations and automation',
        color: '#f0883e',
        questions: [
          {
            id: 'wf-1',
            question: 'What are the most frequent daily operations?',
            purpose: 'Identify core Actions',
            followUp: 'What inputs are needed? What outputs are produced?',
            priority: 'critical'
          },
          {
            id: 'wf-2',
            question: 'Which operations can be automated? Which must be manual?',
            purpose: 'Define automation boundaries',
            followUp: 'What triggers the automation?',
            priority: 'high'
          },
          {
            id: 'wf-3',
            question: 'What dependencies exist between operations? What is the sequence?',
            purpose: 'Understand orchestration',
            followUp: 'What happens if a step fails?',
            priority: 'high'
          },
          {
            id: 'wf-4',
            question: 'Are there scenarios requiring AI-assisted decision making?',
            purpose: 'Identify AI enhancement points',
            followUp: 'Do AI suggestions need human confirmation?',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'governance',
        name: 'Governance',
        icon: Shield,
        description: 'Ensure security and traceability',
        color: '#f85149',
        questions: [
          {
            id: 'gv-1',
            question: 'Which operations require approval? What is the approval process?',
            purpose: 'Define governance rules',
            followUp: 'What happens on timeout? Is there an escalation mechanism?',
            priority: 'high'
          },
          {
            id: 'gv-2',
            question: 'What operation logs need to be recorded? How long to retain?',
            purpose: 'Audit trail requirements',
            followUp: 'Are there periodic audit requirements?',
            priority: 'medium'
          },
          {
            id: 'gv-3',
            question: 'Are there industry regulations or internal compliance requirements?',
            purpose: 'Compliance risk identification',
            followUp: 'What are the consequences of non-compliance?',
            priority: 'high'
          },
          {
            id: 'gv-4',
            question: 'What is the contingency plan if the system fails?',
            purpose: 'Business continuity',
            followUp: 'What is the maximum acceptable downtime?',
            priority: 'medium'
          }
        ]
      }
    ]
  }
};

const InterviewGuide: React.FC<InterviewGuideProps> = ({
  lang,
  onInsertQuestion,
  completedQuestions,
  onToggleQuestion
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['business-context']));
  const scripts = interviewScripts[lang];

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const getPhaseProgress = (phase: typeof scripts.phases[0]) => {
    const total = phase.questions.length;
    const completed = phase.questions.filter(q => completedQuestions.has(q.id)).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const getOverallProgress = () => {
    const allQuestions = scripts.phases.flatMap(p => p.questions);
    const total = allQuestions.length;
    const completed = allQuestions.filter(q => completedQuestions.has(q.id)).length;
    const critical = allQuestions.filter(q => q.priority === 'critical');
    const criticalCompleted = critical.filter(q => completedQuestions.has(q.id)).length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      criticalCompleted,
      criticalTotal: critical.length
    };
  };

  const copyQuestion = useCallback((question: string) => {
    navigator.clipboard.writeText(question);
  }, []);

  const overall = getOverallProgress();
  const readinessLevel = overall.criticalCompleted === overall.criticalTotal
    ? 'ready'
    : overall.criticalCompleted >= overall.criticalTotal * 0.5
      ? 'partial'
      : 'insufficient';

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
      {/* Header with overall progress */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            <MessageSquare className="inline-block mr-2 w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            {lang === 'cn' ? '访谈向导' : 'Interview Guide'}
          </h2>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            readinessLevel === 'ready'
              ? 'bg-green-500/20 text-green-400'
              : readinessLevel === 'partial'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {readinessLevel === 'ready'
              ? (lang === 'cn' ? '信息充足' : 'Ready')
              : readinessLevel === 'partial'
                ? (lang === 'cn' ? '信息部分完整' : 'Partial')
                : (lang === 'cn' ? '信息不足' : 'Insufficient')}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span>{lang === 'cn' ? '整体进度' : 'Overall Progress'}</span>
            <span>{overall.completed}/{overall.total} ({overall.percentage}%)</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${overall.percentage}%`,
                backgroundColor: 'var(--color-accent)'
              }}
            />
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <AlertTriangle className="w-3 h-3" style={{ color: 'var(--color-warning)' }} />
            <span>
              {lang === 'cn'
                ? `关键问题: ${overall.criticalCompleted}/${overall.criticalTotal}`
                : `Critical: ${overall.criticalCompleted}/${overall.criticalTotal}`}
            </span>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {scripts.phases.map(phase => {
          const Icon = phase.icon;
          const progress = getPhaseProgress(phase);
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <div
              key={phase.id}
              className="rounded-xl border"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)'
              }}
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors rounded-t-xl"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${phase.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: phase.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {phase.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      backgroundColor: 'var(--color-bg-hover)',
                      color: 'var(--color-text-muted)'
                    }}>
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {phase.description}
                  </p>
                </div>
                {/* Mini progress */}
                <div className="w-16 h-1.5 rounded-full mr-2" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress.percentage}%`, backgroundColor: phase.color }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                )}
              </button>

              {/* Questions */}
              {isExpanded && (
                <div className="border-t px-4 pb-4 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                  {phase.questions.map(q => {
                    const isCompleted = completedQuestions.has(q.id);
                    return (
                      <div
                        key={q.id}
                        className={`mt-3 p-3 rounded-lg border transition-all ${
                          isCompleted ? 'opacity-60' : ''
                        }`}
                        style={{
                          borderColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                          backgroundColor: isCompleted ? 'rgba(63, 185, 80, 0.05)' : 'var(--color-bg-elevated)'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleQuestion(q.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                            ) : (
                              <Circle className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${isCompleted ? 'line-through' : ''}`}
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {q.question}
                              </p>
                              {q.priority === 'critical' && (
                                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                  {lang === 'cn' ? '必问' : 'Critical'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              <Lightbulb className="inline w-3 h-3 mr-1" />
                              {q.purpose}
                            </p>
                            {q.followUp && (
                              <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>
                                <ArrowRight className="inline w-3 h-3 mr-1" />
                                {lang === 'cn' ? '追问：' : 'Follow-up: '}{q.followUp}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => copyQuestion(q.question)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                <Copy className="w-3 h-3" />
                                {lang === 'cn' ? '复制' : 'Copy'}
                              </button>
                              {onInsertQuestion && (
                                <button
                                  onClick={() => onInsertQuestion(q.question)}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors"
                                  style={{ color: 'var(--color-accent)' }}
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  {lang === 'cn' ? '插入对话' : 'Insert'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Risk warning footer */}
      {readinessLevel !== 'ready' && (
        <div
          className="p-4 border-t"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: readinessLevel === 'partial' ? 'rgba(210, 153, 34, 0.1)' : 'rgba(248, 81, 73, 0.1)'
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: readinessLevel === 'partial' ? 'var(--color-warning)' : 'var(--color-error)' }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {lang === 'cn'
                  ? (readinessLevel === 'partial' ? '部分信息缺失' : '关键信息不足')
                  : (readinessLevel === 'partial' ? 'Some information missing' : 'Critical information missing')}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {lang === 'cn'
                  ? '可以继续生成设计，但交付物可能需要后续迭代补充'
                  : 'You can proceed with design, but deliverables may need iteration'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewGuide;

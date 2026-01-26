import React, { useState, useMemo } from 'react';
import { Language, ProjectState } from '../types';
import { checkActionThreeLayers } from '../utils/qualityChecker';
import {
  Flag,
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
  Users,
  Database,
  Zap,
  Box,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Lightbulb
} from 'lucide-react';

interface MilestonePlannerProps {
  lang: Language;
  project: ProjectState;
}

interface Milestone {
  id: string;
  title: { cn: string; en: string };
  description: { cn: string; en: string };
  category: 'discovery' | 'design' | 'validation' | 'delivery';
  deliverables: { cn: string; en: string }[];
  status: 'completed' | 'in_progress' | 'pending' | 'blocked';
  blockers?: { cn: string; en: string }[];
  progress: number; // 0-100
}

const translations = {
  cn: {
    title: '交付里程碑',
    subtitle: '从发现到交付的完整路径',
    discovery: '发现阶段',
    design: '设计阶段',
    validation: '验证阶段',
    delivery: '交付阶段',
    completed: '已完成',
    inProgress: '进行中',
    pending: '待开始',
    blocked: '受阻',
    deliverables: '交付物',
    blockers: '阻塞项',
    exportPlan: '导出计划',
    tip: '根据当前进度自动评估各阶段状态',
    nextSteps: '建议下一步',
    currentPhase: '当前阶段',
    overallProgress: '整体进度'
  },
  en: {
    title: 'Delivery Milestones',
    subtitle: 'Complete path from discovery to delivery',
    discovery: 'Discovery',
    design: 'Design',
    validation: 'Validation',
    delivery: 'Delivery',
    completed: 'Completed',
    inProgress: 'In Progress',
    pending: 'Pending',
    blocked: 'Blocked',
    deliverables: 'Deliverables',
    blockers: 'Blockers',
    exportPlan: 'Export Plan',
    tip: 'Auto-evaluates phase status based on current progress',
    nextSteps: 'Next Steps',
    currentPhase: 'Current Phase',
    overallProgress: 'Overall Progress'
  }
};

const categoryConfig = {
  discovery: { icon: Lightbulb, color: 'var(--color-accent)' },
  design: { icon: Box, color: 'var(--color-success)' },
  validation: { icon: CheckCircle2, color: 'var(--color-warning)' },
  delivery: { icon: Flag, color: 'var(--color-accent-secondary, #a371f7)' }
};

// Evaluate milestones based on project state
function evaluateMilestones(project: ProjectState, lang: Language): Milestone[] {
  const objectCount = project.objects?.length || 0;
  const linkCount = project.links?.length || 0;
  const integrationCount = project.integrations?.length || 0;
  const actionCount = project.objects?.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0) || 0;

  // Get action three-layer status
  const threeLayerReport = objectCount > 0 ? checkActionThreeLayers(project) : null;
  const businessLayerComplete = threeLayerReport?.byLayer.business.complete || 0;
  const logicLayerComplete = threeLayerReport?.byLayer.logic.complete || 0;
  const implLayerComplete = threeLayerReport?.byLayer.implementation.complete || 0;

  // Discovery Phase
  const discoveryProgress = Math.min(100,
    (objectCount > 0 ? 40 : 0) +
    (project.industry ? 20 : 0) +
    (project.useCase ? 20 : 0) +
    (actionCount > 0 ? 20 : 0)
  );

  // Design Phase - Support lightweight bootcamp (1 object is enough to start)
  const designProgress = Math.min(100,
    (objectCount >= 1 ? 25 : 0) +
    (linkCount > 0 ? 20 : 0) +
    (businessLayerComplete > 0 ? 30 : 0) +
    (actionCount >= 1 ? 25 : 0)
  );

  // Validation Phase
  const validationProgress = Math.min(100,
    (logicLayerComplete > 0 ? 40 : 0) +
    (integrationCount > 0 ? 30 : 0) +
    ((threeLayerReport?.averageScore || 0) >= 50 ? 30 : 0)
  );

  // Delivery Phase
  const deliveryProgress = Math.min(100,
    (implLayerComplete > 0 ? 50 : 0) +
    ((threeLayerReport?.averageScore || 0) >= 70 ? 30 : 0) +
    (integrationCount > 0 && logicLayerComplete > 0 ? 20 : 0)
  );

  const milestones: Milestone[] = [
    {
      id: 'discovery',
      title: { cn: '业务发现', en: 'Business Discovery' },
      description: {
        cn: '理解业务场景、识别核心实体和操作流程',
        en: 'Understand business scenarios, identify core entities and workflows'
      },
      category: 'discovery',
      deliverables: [
        { cn: '业务场景描述', en: 'Business scenario description' },
        { cn: '核心业务对象列表', en: 'Core business objects list' },
        { cn: '主要操作流程', en: 'Main workflow processes' },
        { cn: '数据源识别', en: 'Data source identification' }
      ],
      status: discoveryProgress >= 80 ? 'completed' : discoveryProgress > 0 ? 'in_progress' : 'pending',
      progress: discoveryProgress,
      blockers: objectCount === 0 ? [
        { cn: '需要至少定义一个业务对象', en: 'At least one business object required' }
      ] : undefined
    },
    {
      id: 'design',
      title: { cn: 'Ontology 设计', en: 'Ontology Design' },
      description: {
        cn: '定义完整的对象模型、关系和 Action 业务层',
        en: 'Define complete object models, relationships, and Action business layer'
      },
      category: 'design',
      deliverables: [
        { cn: '完整的对象定义（属性、描述）', en: 'Complete object definitions (properties, descriptions)' },
        { cn: '对象间关系图', en: 'Object relationship diagram' },
        { cn: 'Action 业务层定义', en: 'Action business layer definitions' },
        { cn: '数据治理规则', en: 'Data governance rules' }
      ],
      status: discoveryProgress < 60 ? 'blocked' : designProgress >= 80 ? 'completed' : designProgress > 0 ? 'in_progress' : 'pending',
      progress: designProgress,
      blockers: discoveryProgress < 60 ? [
        { cn: '请先完成发现阶段', en: 'Complete discovery phase first' }
      ] : undefined
    },
    {
      id: 'validation',
      title: { cn: '逻辑验证', en: 'Logic Validation' },
      description: {
        cn: '完善 Action 逻辑层，定义前置条件、参数和状态变更',
        en: 'Complete Action logic layer, define preconditions, parameters, and state changes'
      },
      category: 'validation',
      deliverables: [
        { cn: 'Action 逻辑层完整定义', en: 'Complete Action logic layer definitions' },
        { cn: '前置条件和后置状态', en: 'Preconditions and postconditions' },
        { cn: '参数规范', en: 'Parameter specifications' },
        { cn: '集成点定义', en: 'Integration point definitions' }
      ],
      status: designProgress < 60 ? 'blocked' : validationProgress >= 80 ? 'completed' : validationProgress > 0 ? 'in_progress' : 'pending',
      progress: validationProgress,
      blockers: designProgress < 60 ? [
        { cn: '请先完成设计阶段', en: 'Complete design phase first' }
      ] : actionCount === 0 ? [
        { cn: '需要定义 Action 才能进行逻辑验证', en: 'Define Actions to proceed with validation' }
      ] : undefined
    },
    {
      id: 'delivery',
      title: { cn: '交付准备', en: 'Delivery Preparation' },
      description: {
        cn: '完成实现层定义，准备 API 规范和技术文档',
        en: 'Complete implementation layer, prepare API specs and technical documentation'
      },
      category: 'delivery',
      deliverables: [
        { cn: 'Action 实现层（API 端点）', en: 'Action implementation layer (API endpoints)' },
        { cn: 'API 规范文档', en: 'API specification document' },
        { cn: '集成配置', en: 'Integration configuration' },
        { cn: '部署检查清单', en: 'Deployment checklist' }
      ],
      status: validationProgress < 60 ? 'blocked' : deliveryProgress >= 80 ? 'completed' : deliveryProgress > 0 ? 'in_progress' : 'pending',
      progress: deliveryProgress,
      blockers: validationProgress < 60 ? [
        { cn: '请先完成验证阶段', en: 'Complete validation phase first' }
      ] : implLayerComplete === 0 ? [
        { cn: '需要为 Action 定义 API 端点', en: 'Define API endpoints for Actions' }
      ] : undefined
    }
  ];

  return milestones;
}

// Get next recommended steps
function getNextSteps(milestones: Milestone[], lang: Language): { cn: string; en: string }[] {
  const steps: { cn: string; en: string }[] = [];

  const currentMilestone = milestones.find(m => m.status === 'in_progress');
  const blockedMilestone = milestones.find(m => m.status === 'blocked');

  if (blockedMilestone?.blockers?.[0]) {
    steps.push(blockedMilestone.blockers[0]);
  }

  if (currentMilestone) {
    if (currentMilestone.progress < 50) {
      steps.push({
        cn: `继续完善${currentMilestone.title.cn}的交付物`,
        en: `Continue working on ${currentMilestone.title.en} deliverables`
      });
    }
  }

  // Add specific recommendations
  const discovery = milestones.find(m => m.id === 'discovery');
  if (discovery?.status === 'in_progress' && discovery.progress < 50) {
    steps.push({
      cn: '在需求勘察中与 AI 对话，收集更多业务信息',
      en: 'Chat with AI in Requirement Scouting to collect more business info'
    });
  }

  const design = milestones.find(m => m.id === 'design');
  if (design?.status === 'in_progress' && design.progress < 50) {
    steps.push({
      cn: '在结构化工作台中整理和完善对象定义',
      en: 'Organize and complete object definitions in Structuring Workbench'
    });
  }

  return steps.slice(0, 3);
}

const MilestonePlanner: React.FC<MilestonePlannerProps> = ({
  lang,
  project
}) => {
  const t = translations[lang];
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>('discovery');

  const milestones = useMemo(() => evaluateMilestones(project, lang), [project, lang]);
  const nextSteps = useMemo(() => getNextSteps(milestones, lang), [milestones, lang]);

  const overallProgress = Math.round(
    milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length
  );

  const currentPhase = milestones.find(m => m.status === 'in_progress') || milestones[0];

  const getStatusStyle = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(var(--color-success-rgb, 63, 185, 80), 0.15)', color: 'var(--color-success)' };
      case 'in_progress':
        return { bg: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)', color: 'var(--color-accent)' };
      case 'blocked':
        return { bg: 'rgba(var(--color-error-rgb, 248, 81, 73), 0.15)', color: 'var(--color-error)' };
      default:
        return { bg: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' };
    }
  };

  const getStatusLabel = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return t.completed;
      case 'in_progress': return t.inProgress;
      case 'blocked': return t.blocked;
      default: return t.pending;
    }
  };

  const exportPlan = () => {
    let md = `# ${t.title}\n\n`;
    md += `> ${t.overallProgress}: ${overallProgress}%\n`;
    md += `> ${t.currentPhase}: ${currentPhase.title[lang]}\n\n`;

    milestones.forEach(milestone => {
      const status = getStatusLabel(milestone.status);
      md += `## ${milestone.title[lang]} (${status} - ${milestone.progress}%)\n`;
      md += `${milestone.description[lang]}\n\n`;
      md += `### ${t.deliverables}\n`;
      milestone.deliverables.forEach(d => {
        md += `- ${d[lang]}\n`;
      });
      if (milestone.blockers?.length) {
        md += `\n### ${t.blockers}\n`;
        milestone.blockers.forEach(b => {
          md += `- ${b[lang]}\n`;
        });
      }
      md += '\n';
    });

    if (nextSteps.length > 0) {
      md += `## ${t.nextSteps}\n`;
      nextSteps.forEach((step, i) => {
        md += `${i + 1}. ${step[lang]}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milestone-plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="rounded-xl overflow-hidden h-full flex flex-col"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)' }}
            >
              <Flag className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={exportPlan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
          >
            <Download className="w-3.5 h-3.5" />
            {t.exportPlan}
          </button>
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {t.overallProgress}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {overallProgress}%
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${overallProgress}%`,
                    backgroundColor: overallProgress >= 70 ? 'var(--color-success)' : 'var(--color-accent)'
                  }}
                />
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {t.currentPhase}
            </div>
            <div className="flex items-center gap-2">
              {React.createElement(categoryConfig[currentPhase.category].icon, {
                className: 'w-5 h-5',
                style: { color: categoryConfig[currentPhase.category].color }
              })}
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {currentPhase.title[lang]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        {milestones.map((milestone, idx) => {
          const config = categoryConfig[milestone.category];
          const Icon = config.icon;
          return (
            <div
              key={milestone.id}
              className="flex-1 p-3 flex flex-col items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--color-bg-hover)]"
              onClick={() => setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)}
              style={{
                borderRight: idx < milestones.length - 1 ? '1px solid var(--color-border)' : undefined,
                backgroundColor: expandedMilestone === milestone.id ? 'var(--color-bg-surface)' : undefined
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={getStatusStyle(milestone.status)}
              >
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {t[milestone.category]}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {milestone.progress}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {milestones.map(milestone => {
          const isExpanded = expandedMilestone === milestone.id;
          const statusStyle = getStatusStyle(milestone.status);
          const config = categoryConfig[milestone.category];
          const Icon = config.icon;

          return (
            <div
              key={milestone.id}
              className="rounded-lg border overflow-hidden"
              style={{
                borderColor: isExpanded ? config.color : 'var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)'
              }}
            >
              <button
                onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                className="w-full p-3 flex items-center gap-3 transition-colors hover:bg-[var(--color-bg-hover)]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {milestone.title[lang]}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={statusStyle}
                    >
                      {getStatusLabel(milestone.status)}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {milestone.description[lang]}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {milestone.progress}%
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  {/* Progress bar */}
                  <div className="mt-3 mb-4">
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${milestone.progress}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-3">
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {t.deliverables}
                    </div>
                    <div className="space-y-1.5">
                      {milestone.deliverables.map((deliverable, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Circle className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {deliverable[lang]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blockers */}
                  {milestone.blockers && milestone.blockers.length > 0 && (
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(var(--color-error-rgb, 248, 81, 73), 0.1)' }}
                    >
                      <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: 'var(--color-error)' }}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t.blockers}
                      </div>
                      {milestone.blockers.map((blocker, idx) => (
                        <div key={idx} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {blocker[lang]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.1)' }}
          >
            <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: 'var(--color-accent)' }}>
              <Lightbulb className="w-4 h-4" />
              {t.nextSteps}
            </div>
            <div className="space-y-2">
              {nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {step[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div
        className="px-4 py-2 text-xs border-t"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <Lightbulb className="inline w-3 h-3 mr-1" />
        {t.tip}
      </div>
    </div>
  );
};

export default MilestonePlanner;

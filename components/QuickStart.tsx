import React, { useState } from 'react';
import { ProjectState } from '../types';
import { useProject } from '../contexts/ProjectContext';
import {
  GraduationCap, Package, MessageSquare, ArrowRight, Database, Zap, Link2,
  ClipboardList, CheckCircle2, FolderPlus, FolderOpen, Rocket, Sparkles
} from 'lucide-react';
import NewProjectDialog from './NewProjectDialog';

type NavigableTab = 'projects' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aiEnhancement' | 'overview';

interface QuickStartProps {
  lang: 'en' | 'cn';
  project: ProjectState;
  onNavigate: (tab: NavigableTab) => void;
}

const translations = {
  en: {
    // Welcome - No Project
    welcomeNew: "Welcome to Ontology Architect",
    subtitleNew: "Let's start by creating your first project",
    createFirstProject: "Create Your First Project",
    createFirstDesc: "Each project contains its own ontology design, chat history, and settings",
    createProjectBtn: "Create Project",
    orBrowseTemplates: "Or browse industry templates first",
    browseTemplates: "Browse Templates",

    // Welcome - Has Project
    welcome: "Welcome to Ontology Architect",
    subtitle: "Your Intelligent Operating System Design Assistant",
    currentProjectLabel: "Current Project",
    switchProject: "Switch Project",

    // Paths
    choosePath: "Choose Your Path",
    learnFirst: "Learn First",
    learnDesc: "Recommended for beginners",
    learnAction: "Go to Academy",
    fromTemplate: "Start from Template",
    templateDesc: "Quick start with industry templates",
    templateAction: "Browse Templates",
    conversational: "Conversational Exploration",
    conversationalDesc: "Flexible customization",
    conversationalAction: "Start Scouting",

    // Workflow
    designFlow: "Ontology Design Flow",
    stepDiscovery: "Discovery",
    stepModeling: "Modeling",
    stepIntegration: "Integration",
    stepAIDesign: "AI Design",
    phaseDiscovery: "Requirement Scouting",
    phaseModeling: "Ontology Modeling",
    phaseIntegration: "Data Sources",
    phaseAIDesign: "AI Enhancement",
    clickToNavigate: "Click to navigate",

    // Project Status
    currentProject: "Project Progress",
    objects: "Objects",
    actions: "Actions",
    links: "Links",
    continueDesign: "Continue Design",
    noProject: "No data yet",
    noProjectDesc: "Start by choosing a path above to begin your ontology design journey.",
    nextStep: "Recommended Next Step",
    goToWorkbench: "Model your ontology",
    goToIntegration: "Plan data integration",
    goToAIDesign: "Design AI capabilities",
    goToOntology: "View ontology diagram",
  },
  cn: {
    // Welcome - No Project
    welcomeNew: "欢迎使用 Ontology Architect",
    subtitleNew: "让我们从创建第一个项目开始",
    createFirstProject: "创建你的第一个项目",
    createFirstDesc: "每个项目包含独立的本体设计、聊天记录和设置",
    createProjectBtn: "创建项目",
    orBrowseTemplates: "或者先浏览行业模板",
    browseTemplates: "浏览模板",

    // Welcome - Has Project
    welcome: "欢迎来到 Ontology Architect",
    subtitle: "您的智能操作系统设计助手",
    currentProjectLabel: "当前项目",
    switchProject: "切换项目",

    // Paths
    choosePath: "选择您的路径",
    learnFirst: "先学习",
    learnDesc: "新手推荐",
    learnAction: "进入学习中心",
    fromTemplate: "从模板开始",
    templateDesc: "快速启动行业模板",
    templateAction: "浏览行业模板",
    conversational: "对话探索",
    conversationalDesc: "灵活定制",
    conversationalAction: "开始勘察",

    // Workflow
    designFlow: "Ontology 设计流程",
    stepDiscovery: "发现",
    stepModeling: "建模",
    stepIntegration: "集成",
    stepAIDesign: "智能化",
    phaseDiscovery: "需求勘察",
    phaseModeling: "本体建模",
    phaseIntegration: "数据源对接",
    phaseAIDesign: "AI 增强设计",
    clickToNavigate: "点击跳转",

    // Project Status
    currentProject: "项目进度",
    objects: "对象",
    actions: "动作",
    links: "关联",
    continueDesign: "继续设计",
    noProject: "暂无数据",
    noProjectDesc: "从上方选择一条路径，开始您的 Ontology 设计之旅。",
    nextStep: "建议下一步",
    goToWorkbench: "本体建模",
    goToIntegration: "规划数据集成",
    goToAIDesign: "设计 AI 能力",
    goToOntology: "查看本体图",
  }
};

const QuickStart: React.FC<QuickStartProps> = ({ lang, project, onNavigate }) => {
  const t = translations[lang];
  const { projects, activeProject, isInitialized } = useProject();
  const [showNewProject, setShowNewProject] = useState(false);

  // Calculate project stats from the current project state
  const objectCount = project.objects.length;
  const actionCount = project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0);
  const linkCount = project.links.length;
  const hasProjectData = objectCount > 0;

  // Check if objects need more structure
  const objectsNeedStructure = project.objects.some(obj =>
    !obj.description || obj.description.length < 10 ||
    !obj.properties || obj.properties.length === 0
  );

  // Determine current phase
  const getCurrentPhase = (): number => {
    if (!hasProjectData) return 0;
    if (objectsNeedStructure) return 1;
    if (actionCount === 0) return 1;
    if (linkCount === 0) return 2;
    return 3;
  };

  const getNextStepInfo = (): { tab: NavigableTab; label: string; icon: React.ReactNode } => {
    const phase = getCurrentPhase();
    if (phase === 0) {
      return { tab: 'scouting', label: t.conversationalAction, icon: <MessageSquare size={16} /> };
    }
    if (phase === 1) {
      return { tab: 'workbench', label: t.goToWorkbench, icon: <ClipboardList size={16} /> };
    }
    if (phase === 2) {
      return { tab: 'systemMap', label: t.goToIntegration, icon: <Database size={16} /> };
    }
    return { tab: 'aiEnhancement', label: t.goToAIDesign, icon: <Zap size={16} /> };
  };

  const currentPhase = getCurrentPhase();
  const nextStep = getNextStepInfo();

  const pathCards = [
    {
      id: 'learn',
      icon: <GraduationCap size={28} />,
      title: t.learnFirst,
      desc: t.learnDesc,
      action: t.learnAction,
      onClick: () => onNavigate('academy'),
      color: 'var(--color-info)',
    },
    {
      id: 'template',
      icon: <Package size={28} />,
      title: t.fromTemplate,
      desc: t.templateDesc,
      action: t.templateAction,
      onClick: () => onNavigate('archetypes'),
      color: 'var(--color-success)',
    },
    {
      id: 'scouting',
      icon: <MessageSquare size={28} />,
      title: t.conversational,
      desc: t.conversationalDesc,
      action: t.conversationalAction,
      onClick: () => onNavigate('scouting'),
      color: 'var(--color-accent)',
    },
  ];

  const flowSteps: Array<{ label: string; phase: string; tab: NavigableTab; icon: React.ReactNode }> = [
    { label: t.stepDiscovery, phase: t.phaseDiscovery, tab: 'scouting', icon: <MessageSquare size={14} /> },
    { label: t.stepModeling, phase: t.phaseModeling, tab: 'workbench', icon: <ClipboardList size={14} /> },
    { label: t.stepIntegration, phase: t.phaseIntegration, tab: 'systemMap', icon: <Database size={14} /> },
    { label: t.stepAIDesign, phase: t.phaseAIDesign, tab: 'aiEnhancement', icon: <Zap size={14} /> },
  ];

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  // ============================================
  // STATE 1: No projects at all - Onboarding
  // ============================================
  if (projects.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center py-12">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-base)' }}
            >
              <Rocket size={40} />
            </div>
            <h1
              className="text-3xl font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.welcomeNew}
            </h1>
            <p className="text-muted text-base">{t.subtitleNew}</p>
          </div>

          {/* Create First Project Card */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
            >
              <FolderPlus size={32} />
            </div>
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.createFirstProject}
            </h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              {t.createFirstDesc}
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="px-8 py-3 rounded-xl font-medium text-base transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-base)'
              }}
            >
              {t.createProjectBtn}
            </button>
          </div>

          {/* Or browse templates */}
          <div className="text-center">
            <p className="text-sm text-muted mb-3">{t.orBrowseTemplates}</p>
            <button
              onClick={() => onNavigate('archetypes')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
              style={{ color: 'var(--color-accent)' }}
            >
              <Package size={16} />
              {t.browseTemplates}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* New Project Dialog */}
        {showNewProject && (
          <NewProjectDialog
            lang={lang}
            onClose={() => setShowNewProject(false)}
            onCreated={() => {
              setShowNewProject(false);
              onNavigate('scouting');
            }}
          />
        )}
      </div>
    );
  }

  // ============================================
  // STATE 2: Has projects - Normal Quick Start
  // ============================================
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section with Current Project */}
        <div className="text-center py-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-base)' }}
          >
            <Sparkles size={32} />
          </div>
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.welcome}
          </h1>
          <p className="text-muted text-sm mb-4">{t.subtitle}</p>

          {/* Current Project Badge */}
          {activeProject && (
            <div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="text-xs text-muted">{t.currentProjectLabel}:</span>
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-accent)' }}
              >
                {activeProject.name}
              </span>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                {t.switchProject}
              </button>
            </div>
          )}
        </div>

        {/* Path Selection Cards */}
        <div
          className="glass-card rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.choosePath}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pathCards.map((card) => (
              <button
                key={card.id}
                onClick={card.onClick}
                className="group p-5 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <h3
                  className="font-medium mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {card.title}
                </h3>
                <p className="text-xs text-muted mb-3">{card.desc}</p>
                <div
                  className="flex items-center gap-1 text-xs font-medium transition-transform group-hover:translate-x-1"
                  style={{ color: card.color }}
                >
                  {card.action}
                  <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Timeline */}
        <div
          className="glass-card rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-lg font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.designFlow}
            </h2>
            <span className="text-xs text-muted">{t.clickToNavigate}</span>
          </div>
          <div className="relative">
            {/* Progress line */}
            <div
              className="absolute top-4 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            {/* Completed progress line */}
            {currentPhase > 0 && (
              <div
                className="absolute top-4 left-0 h-0.5 transition-all duration-500"
                style={{
                  backgroundColor: 'var(--color-success)',
                  width: `${((currentPhase) / (flowSteps.length - 1)) * 100}%`
                }}
              />
            )}
            <div className="relative flex justify-between">
              {flowSteps.map((step, index) => {
                const isCompleted = index < currentPhase;
                const isCurrent = index === currentPhase;

                return (
                  <button
                    key={index}
                    onClick={() => onNavigate(step.tab)}
                    className="flex flex-col items-center text-center w-1/4 cursor-pointer hover:scale-105 transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-3 relative z-10 transition-all"
                      style={{
                        backgroundColor: isCompleted
                          ? 'var(--color-success)'
                          : isCurrent
                            ? 'var(--color-accent)'
                            : 'var(--color-bg-elevated)',
                        border: `2px solid ${isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        color: isCompleted || isCurrent ? '#fff' : 'var(--color-text-muted)'
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                    </div>
                    <div
                      className="text-sm font-medium mb-1 flex items-center gap-1"
                      style={{ color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                    >
                      {step.icon}
                      {step.label}
                    </div>
                    <div className="text-xs text-muted">{step.phase}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Project Status */}
        <div
          className="glass-card rounded-xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.currentProject}
          </h2>

          {hasProjectData ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div
                  className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Database size={16} style={{ color: 'var(--color-info)' }} />
                  </div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {objectCount}
                  </div>
                  <div className="text-xs text-muted">{t.objects}</div>
                </div>
                <div
                  className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap size={16} style={{ color: 'var(--color-success)' }} />
                  </div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {actionCount}
                  </div>
                  <div className="text-xs text-muted">{t.actions}</div>
                </div>
                <div
                  className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Link2 size={16} style={{ color: 'var(--color-warning)' }} />
                  </div>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {linkCount}
                  </div>
                  <div className="text-xs text-muted">{t.links}</div>
                </div>
              </div>

              {/* Next Step Recommendation */}
              <div
                className="mb-4 p-3 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-accent)10', border: '1px solid var(--color-accent)30' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                    {t.nextStep}:
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {nextStep.label}
                  </span>
                </div>
                {nextStep.icon}
              </div>

              <button
                onClick={() => onNavigate(nextStep.tab)}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-bg-base)'
                }}
              >
                {t.continueDesign} →
              </button>
            </>
          ) : (
            <div
              className="py-8 text-center rounded-xl"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <div className="text-muted mb-2">{t.noProject}</div>
              <div className="text-xs text-muted">{t.noProjectDesc}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStart;

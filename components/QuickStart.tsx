import React, { useState } from 'react';
import { ProjectState } from '../types';
import { useProject } from '../contexts/ProjectContext';
import {
  GraduationCap, Package, MessageSquare, ArrowRight, Database, Zap, Link2,
  ClipboardList, CheckCircle2, FolderPlus, Rocket, Sparkles, Play,
  Target, Layers, Cpu, FileText, Users, ShoppingCart, Building2,
  ChevronRight, BookOpen, Lightbulb, MousePointerClick
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
    // Hero
    heroTitle: "Build Intelligent Operating Systems",
    heroSubtitle: "Transform your business logic into AI-powered operational systems using the Ontology-First methodology",

    // What is Ontology
    whatIsOntology: "What is Ontology?",
    ontologyDesc: "An Ontology is a structured representation of your business domain - the core entities (Objects), their relationships (Links), and the operations (Actions) that drive your business. It's the foundation for building intelligent systems that truly understand your business.",

    // Core Concepts
    coreConceptsTitle: "Core Concepts",
    conceptObject: "Objects",
    conceptObjectDesc: "Business entities like Customer, Order, Product",
    conceptAction: "Actions",
    conceptActionDesc: "Operations like Create Order, Approve Request",
    conceptLink: "Links",
    conceptLinkDesc: "Relationships like Customer places Order",
    conceptAI: "AI Enhancement",
    conceptAIDesc: "Smart automation and predictions",

    // 4 Phases
    fourPhasesTitle: "4-Phase Design Workflow",
    phase1Title: "Discover",
    phase1Desc: "Chat with AI to explore your business requirements and extract key entities",
    phase2Title: "Model",
    phase2Desc: "Structure your Objects, define Properties and design Actions",
    phase3Title: "Integrate",
    phase3Desc: "Connect data sources and plan system integrations",
    phase4Title: "AI Design",
    phase4Desc: "Identify AI opportunities and design intelligent automations",

    // Quick Start Steps
    quickStartTitle: "Get Started in 3 Steps",
    step1Title: "Create a Project",
    step1Desc: "Start fresh or use an industry template",
    step2Title: "Describe Your Business",
    step2Desc: "Chat with AI to extract your business logic",
    step3Title: "Refine & Export",
    step3Desc: "Model, integrate, and generate code",

    // Learning Paths
    pathsTitle: "Choose Your Learning Path",
    pathBeginner: "New to Ontology?",
    pathBeginnerDesc: "Start with our interactive tutorial",
    pathBeginnerAction: "Start Tutorial",
    pathTemplate: "Learn by Example",
    pathTemplateDesc: "Explore industry templates",
    pathTemplateAction: "Browse Templates",
    pathDive: "Ready to Build",
    pathDiveDesc: "Jump straight into creation",
    pathDiveAction: "Create Project",

    // Examples
    examplesTitle: "Industry Examples",
    exampleRetail: "Retail Operations",
    exampleRetailDesc: "Customer, Order, Product, Inventory management",
    exampleManufacturing: "Manufacturing",
    exampleManufacturingDesc: "Equipment, WorkOrder, QualityControl",
    exampleHealthcare: "Healthcare",
    exampleHealthcareDesc: "Patient, Appointment, MedicalRecord",

    // CTA
    ctaTitle: "Ready to Build Your Intelligent System?",
    ctaCreate: "Create New Project",
    ctaExplore: "Explore Templates",
    ctaLearn: "Learn More",

    // Tips
    tipsTitle: "Pro Tips",
    tip1: "Start with 3-5 core Objects that represent your main business entities",
    tip2: "Focus on decision-making: What decisions do users need to make?",
    tip3: "Use industry templates as inspiration, then customize for your needs",
  },
  cn: {
    // Hero
    heroTitle: "构建智能操作系统",
    heroSubtitle: "使用 Ontology-First 方法论，将您的业务逻辑转化为 AI 驱动的智能运营系统",

    // What is Ontology
    whatIsOntology: "什么是 Ontology（本体）?",
    ontologyDesc: "Ontology 是对您业务领域的结构化表示 —— 包括核心实体（对象）、它们之间的关系（关联）、以及驱动业务的操作（动作）。它是构建真正理解您业务的智能系统的基础。",

    // Core Concepts
    coreConceptsTitle: "核心概念",
    conceptObject: "对象 Objects",
    conceptObjectDesc: "业务实体，如客户、订单、产品",
    conceptAction: "动作 Actions",
    conceptActionDesc: "业务操作，如创建订单、审批请求",
    conceptLink: "关联 Links",
    conceptLinkDesc: "关系，如客户下单、订单包含商品",
    conceptAI: "AI 增强",
    conceptAIDesc: "智能自动化和预测能力",

    // 4 Phases
    fourPhasesTitle: "4 阶段设计流程",
    phase1Title: "发现",
    phase1Desc: "与 AI 对话，探索业务需求，提取关键实体",
    phase2Title: "建模",
    phase2Desc: "结构化对象，定义属性，设计动作",
    phase3Title: "集成",
    phase3Desc: "连接数据源，规划系统集成",
    phase4Title: "智能化",
    phase4Desc: "识别 AI 机会，设计智能自动化",

    // Quick Start Steps
    quickStartTitle: "3 步快速开始",
    step1Title: "创建项目",
    step1Desc: "从零开始或使用行业模板",
    step2Title: "描述业务",
    step2Desc: "与 AI 对话，提取业务逻辑",
    step3Title: "完善导出",
    step3Desc: "建模、集成、生成代码",

    // Learning Paths
    pathsTitle: "选择您的学习路径",
    pathBeginner: "初次接触 Ontology?",
    pathBeginnerDesc: "从交互式教程开始",
    pathBeginnerAction: "开始教程",
    pathTemplate: "通过案例学习",
    pathTemplateDesc: "探索行业模板",
    pathTemplateAction: "浏览模板",
    pathDive: "准备好开始",
    pathDiveDesc: "直接开始创建",
    pathDiveAction: "创建项目",

    // Examples
    examplesTitle: "行业示例",
    exampleRetail: "零售运营",
    exampleRetailDesc: "客户、订单、产品、库存管理",
    exampleManufacturing: "智能制造",
    exampleManufacturingDesc: "设备、工单、质量控制",
    exampleHealthcare: "医疗健康",
    exampleHealthcareDesc: "患者、预约、病历记录",

    // CTA
    ctaTitle: "准备好构建您的智能系统了吗？",
    ctaCreate: "创建新项目",
    ctaExplore: "探索模板",
    ctaLearn: "深入学习",

    // Tips
    tipsTitle: "专业建议",
    tip1: "从 3-5 个代表主要业务实体的核心对象开始",
    tip2: "聚焦决策：用户需要做出什么决策？",
    tip3: "以行业模板为灵感，然后根据需求定制",
  }
};

const QuickStart: React.FC<QuickStartProps> = ({ lang, project, onNavigate }) => {
  const t = translations[lang];
  const { projects, activeProject, isInitialized } = useProject();
  const [showNewProject, setShowNewProject] = useState(false);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  const concepts = [
    { id: 'object', icon: <Database size={24} />, title: t.conceptObject, desc: t.conceptObjectDesc, color: '#3b82f6' },
    { id: 'action', icon: <Zap size={24} />, title: t.conceptAction, desc: t.conceptActionDesc, color: '#10b981' },
    { id: 'link', icon: <Link2 size={24} />, title: t.conceptLink, desc: t.conceptLinkDesc, color: '#f59e0b' },
    { id: 'ai', icon: <Sparkles size={24} />, title: t.conceptAI, desc: t.conceptAIDesc, color: '#8b5cf6' },
  ];

  const phases = [
    { num: 1, title: t.phase1Title, desc: t.phase1Desc, icon: <MessageSquare size={20} />, color: '#3b82f6' },
    { num: 2, title: t.phase2Title, desc: t.phase2Desc, icon: <ClipboardList size={20} />, color: '#8b5cf6' },
    { num: 3, title: t.phase3Title, desc: t.phase3Desc, icon: <Layers size={20} />, color: '#10b981' },
    { num: 4, title: t.phase4Title, desc: t.phase4Desc, icon: <Cpu size={20} />, color: '#f59e0b' },
  ];

  const examples = [
    { id: 'retail', icon: <ShoppingCart size={20} />, title: t.exampleRetail, desc: t.exampleRetailDesc },
    { id: 'manufacturing', icon: <Building2 size={20} />, title: t.exampleManufacturing, desc: t.exampleManufacturingDesc },
    { id: 'healthcare', icon: <Users size={20} />, title: t.exampleHealthcare, desc: t.exampleHealthcareDesc },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <div
        className="relative py-16 px-8"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            <Rocket size={32} />
          </div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.heroTitle}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t.heroSubtitle}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12 space-y-16">

        {/* What is Ontology */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
            >
              <Lightbulb size={20} />
            </div>
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.whatIsOntology}
            </h2>
          </div>
          <p
            className="text-base leading-relaxed pl-13"
            style={{ color: 'var(--color-text-secondary)', paddingLeft: '52px' }}
          >
            {t.ontologyDesc}
          </p>
        </section>

        {/* Core Concepts - 4 cards */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.coreConceptsTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concepts.map(concept => (
              <div
                key={concept.id}
                className="p-5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)'
                }}
                onClick={() => setExpandedConcept(expandedConcept === concept.id ? null : concept.id)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${concept.color}15`, color: concept.color }}
                >
                  {concept.icon}
                </div>
                <h3
                  className="font-medium mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {concept.title}
                </h3>
                <p className="text-xs text-muted">{concept.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Phase Workflow */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.fourPhasesTitle}
          </h2>
          <div className="relative">
            {/* Connection line */}
            <div
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {phases.map((phase, index) => (
                <div
                  key={phase.num}
                  className="relative p-5 rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {/* Phase number circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4 relative z-10"
                    style={{ backgroundColor: phase.color, color: '#fff' }}
                  >
                    {phase.num}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: phase.color }}>{phase.icon}</span>
                    <h3
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {phase.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start Steps */}
        <section
          className="p-8 rounded-2xl"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h2
            className="text-xl font-semibold mb-6 text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.quickStartTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: 1, title: t.step1Title, desc: t.step1Desc, icon: <FolderPlus size={24} /> },
              { num: 2, title: t.step2Title, desc: t.step2Desc, icon: <MessageSquare size={24} /> },
              { num: 3, title: t.step3Title, desc: t.step3Desc, icon: <FileText size={24} /> },
            ].map((step, index) => (
              <div key={step.num} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                  {step.num}
                </div>
                <div>
                  <h3
                    className="font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Paths */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.pathsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Beginner Path */}
            <button
              onClick={() => onNavigate('academy')}
              className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-info)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-info)15', color: 'var(--color-info)' }}
              >
                <GraduationCap size={24} />
              </div>
              <h3
                className="font-medium mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t.pathBeginner}
              </h3>
              <p className="text-sm text-muted mb-4">{t.pathBeginnerDesc}</p>
              <div
                className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--color-info)' }}
              >
                {t.pathBeginnerAction}
                <ChevronRight size={16} />
              </div>
            </button>

            {/* Template Path */}
            <button
              onClick={() => onNavigate('archetypes')}
              className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-success)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-success)15', color: 'var(--color-success)' }}
              >
                <Package size={24} />
              </div>
              <h3
                className="font-medium mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t.pathTemplate}
              </h3>
              <p className="text-sm text-muted mb-4">{t.pathTemplateDesc}</p>
              <div
                className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--color-success)' }}
              >
                {t.pathTemplateAction}
                <ChevronRight size={16} />
              </div>
            </button>

            {/* Direct Path */}
            <button
              onClick={() => setShowNewProject(true)}
              className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-accent)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
              >
                <Rocket size={24} />
              </div>
              <h3
                className="font-medium mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t.pathDive}
              </h3>
              <p className="text-sm text-muted mb-4">{t.pathDiveDesc}</p>
              <div
                className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--color-accent)' }}
              >
                {t.pathDiveAction}
                <ChevronRight size={16} />
              </div>
            </button>
          </div>
        </section>

        {/* Industry Examples */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.examplesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {examples.map(example => (
              <div
                key={example.id}
                onClick={() => onNavigate('archetypes')}
                className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ color: 'var(--color-accent)' }}>{example.icon}</span>
                  <h3
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {example.title}
                  </h3>
                </div>
                <p className="text-xs text-muted">{example.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips */}
        <section
          className="p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--color-warning)08',
            border: '1px solid var(--color-warning)30'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} style={{ color: 'var(--color-warning)' }} />
            <h3
              className="font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.tipsTitle}
            </h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              {t.tip1}
            </li>
            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              {t.tip2}
            </li>
            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              {t.tip3}
            </li>
          </ul>
        </section>

        {/* Final CTA */}
        <section
          className="text-center py-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent)10 0%, var(--color-accent)05 100%)',
            border: '1px solid var(--color-accent)30'
          }}
        >
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.ctaTitle}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowNewProject(true)}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
            >
              {t.ctaCreate}
            </button>
            <button
              onClick={() => onNavigate('archetypes')}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              {t.ctaExplore}
            </button>
            <button
              onClick={() => onNavigate('academy')}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-accent)'
              }}
            >
              {t.ctaLearn} →
            </button>
          </div>
        </section>

        {/* Spacer for bottom chat bar */}
        <div className="h-24" />
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
};

export default QuickStart;

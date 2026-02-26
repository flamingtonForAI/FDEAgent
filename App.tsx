
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIService, loadAISettings, loadAISettingsAsync, saveAISettings } from './services/aiService';
import { AnalysisResult } from './services/aiAnalysisService';
import { ProjectState, ChatMessage, Language, AISettings, AI_PROVIDERS } from './types';
// Page components - refactored for better maintainability
import {
  ProjectsPage,
  QuickStartPage,
  AcademyPage,
  ArchetypesPage,
  ScoutingPage,
  ModelingPage,
  IntegrationPage,
  AIEnhancementPage,
} from './pages';
// Components (only those still used directly in App.tsx)
import ArchetypeViewer from './components/ArchetypeViewer';
import GlobalChatBar from './components/GlobalChatBar';
import ErrorBoundary from './components/ErrorBoundary';
import QualityPanel from './components/QualityPanel';
import { getMergedArchetypeById } from './content/archetypes';
import { MessageSquare, Database, Network, Settings as SettingsIcon, Sparkles, GraduationCap, ShieldCheck, Package, Rocket, LogIn, FolderOpen } from 'lucide-react';
import { Theme, loadSavedTheme, applyThemeMode, getSavedThemeMode, setupSystemThemeListener } from './lib/themes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider, useSync } from './contexts/SyncContext';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { AuthModal, UserMenu } from './components/auth';
import { storage } from './lib/storage';
import ProjectDashboard from './components/ProjectDashboard';
import UnifiedSettings from './components/UnifiedSettings';

const translations = {
  en: {
    title: "Ontology Architect",
    subtitle: "Intelligent OS Studio",
    projects: "Projects",
    quickStart: "Quick Start",
    academy: "Learning Center",
    archetypes: "Templates",
    // 4 Core Phases
    phase1: "1. Discover",
    phase1Desc: "Requirement Scouting",
    phase2: "2. Model",
    phase2Desc: "Ontology Modeling",
    phase3: "3. Integrate",
    phase3Desc: "Data Sources",
    phase4: "4. AI Design",
    phase4Desc: "AI Enhancement",
    // Legacy tabs (keep for backward compatibility)
    scouting: "Requirement Scouting",
    workbench: "Structuring Workbench",
    ontology: "Logical Ontology",
    actionDesigner: "Action Designer",
    systemMap: "Architecture Map",
    augmentation: "AI Augmentation",
    blueprint: "System Blueprint",
    sectionGettingStarted: "Getting Started",
    sectionResources: "Resources",
    sectionCoreWorkflow: "Design Workflow",
    status: "Engine Status",
    ready: "Standby",
    synthesizing: "Synthesizing System Architecture...",
    mapping: "Mapping Entities, Relations & Intelligence",
    newSession: "New Session",
    confirmNewSession: "Start a new session? Current conversation and design will be cleared.",
    applyArchetype: "Apply template to current project? This will replace existing ontology design.",
  },
  cn: {
    title: "本体架构师",
    subtitle: "智能操作系统工作室",
    projects: "项目管理",
    quickStart: "快速开始",
    academy: "学习中心",
    archetypes: "行业模板",
    // 4 Core Phases
    phase1: "1. 发现",
    phase1Desc: "需求勘察",
    phase2: "2. 建模",
    phase2Desc: "本体建模",
    phase3: "3. 集成",
    phase3Desc: "数据源对接",
    phase4: "4. 智能化",
    phase4Desc: "AI 增强设计",
    // Legacy tabs (keep for backward compatibility)
    scouting: "需求勘察",
    workbench: "结构化工作台",
    ontology: "逻辑本体",
    actionDesigner: "Action 设计",
    systemMap: "架构拓扑图",
    augmentation: "AI 能力增强",
    blueprint: "系统蓝图",
    sectionGettingStarted: "入门",
    sectionResources: "参考资源",
    sectionCoreWorkflow: "设计流程",
    status: "引擎状态",
    ready: "待命",
    synthesizing: "正在合成系统架构...",
    mapping: "映射实体、关系与智能逻辑",
    newSession: "新建会话",
    confirmNewSession: "确定要开始新会话吗？当前的对话和设计将被清除。",
    applyArchetype: "应用此模板到当前项目？这将替换现有的本体设计。",
  }
};

const MAX_SAVED_MESSAGES = 200;
const MAX_MESSAGE_CHARS = 4000;

const normalizeMessagesForStorage = (messages: ChatMessage[]): ChatMessage[] => {
  const recent = messages.slice(-MAX_SAVED_MESSAGES);
  return recent.map((message) => {
    if (message.content.length <= MAX_MESSAGE_CHARS) {
      return message;
    }
    return {
      ...message,
      content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}...`,
    };
  });
};

const parseStoredMessages = (raw: string): ChatMessage[] => {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  const safe = parsed.filter((message) =>
    message && typeof message.role === 'string' && typeof message.content === 'string'
  );
  return normalizeMessagesForStorage(safe as ChatMessage[]);
};

// Chat messages are now loaded by ProjectContext per-project
// Keeping parseStoredMessages for potential compatibility

// 有效的工作流标签页（用于恢复上次位置）
type WorkflowTab = 'projects' | 'quickStart' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview' | 'aiEnhancement';
const validWorkflowTabs: WorkflowTab[] = ['projects', 'quickStart', 'academy', 'archetypes', 'scouting', 'workbench', 'ontology', 'actionDesigner', 'systemMap', 'aip', 'overview', 'aiEnhancement'];

// 从localStorage加载上次活跃的标签页
// Note: Workflow tabs requiring a project will be redirected by useEffect if no project exists
const loadLastActiveTab = (): WorkflowTab => {
  try {
    const saved = localStorage.getItem('ontology-last-tab');
    if (saved && validWorkflowTabs.includes(saved as WorkflowTab)) {
      return saved as WorkflowTab;
    }
  } catch (e) {
    console.error('加载上次标签失败:', e);
  }
  return 'quickStart';
};

// Default empty project state
const emptyProjectState: ProjectState = {
  industry: '',
  useCase: '',
  objects: [],
  links: [],
  integrations: [],
  aiRequirements: [],
  status: 'scouting'
};

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('cn');
  const [activeTab, setActiveTab] = useState<'projects' | 'quickStart' | 'academy' | 'archetypes' | 'archetypeViewer' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview' | 'aiEnhancement'>(loadLastActiveTab);
  const [isDesigning, setIsDesigning] = useState(false);

  // Use ProjectContext for both chat and ontology (per-project storage)
  const { currentChat: chatMessages, setChatMessages, activeProjectId, currentOntology, setCurrentOntology } = useProject();
  const chatHistoryRef = useRef<ChatMessage[]>(chatMessages);

  // Derive project from context (with fallback for null)
  const project = currentOntology || emptyProjectState;

  // Create setProject wrapper for backward compatibility with child components
  // Fixed: Avoid stale closure by using functional update pattern
  const setProject = useCallback((update: ProjectState | ((prev: ProjectState) => ProjectState)) => {
    if (typeof update === 'function') {
      // Use functional update to always get latest state, avoiding stale closure
      setCurrentOntology(prev => update(prev || emptyProjectState));
    } else {
      setCurrentOntology(update);
    }
  }, [setCurrentOntology]);

  // Sync chatHistoryRef with chatMessages from context
  useEffect(() => {
    chatHistoryRef.current = chatMessages;
  }, [chatMessages]);

  // AI设置状态
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);

  // Theme state - using new simplified theme mode
  const [currentTheme, setCurrentTheme] = useState<Theme>(loadSavedTheme);

  // Archetype状态
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null);

  // AI 分析结果状态（持久化跨标签页）
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalysisResult | null>(null);

  // 全局聊天栏状态
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Auth state
  const { isAuthenticated, user } = useAuth();
  const { sync, status: syncStatus } = useSync();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Set auth check for storage
  useEffect(() => {
    storage.setAuthCheck(() => isAuthenticated);
  }, [isAuthenticated]);

  // Migrate local data to cloud on first login
  useEffect(() => {
    if (isAuthenticated) {
      storage.migrateLocalToCloud().then((projectId) => {
        if (projectId) {
          console.log('Migrated local project to cloud:', projectId);
        }
      });
    }
  }, [isAuthenticated]);

  // 将 activeTab 映射到 phase 类型
  const getCurrentPhase = useCallback((): 'discover' | 'model' | 'integrate' | 'enhance' => {
    switch (activeTab) {
      case 'scouting':
      case 'quickStart':
      case 'academy':
      case 'archetypes':
      case 'projects':
        return 'discover';
      case 'workbench':
      case 'ontology':
      case 'actionDesigner':
        return 'model';
      case 'systemMap':
      case 'overview':
        return 'integrate';
      case 'aiEnhancement':
      case 'aip':
        return 'enhance';
      default:
        return 'discover';
    }
  }, [activeTab]);

  // Apply theme on mount and setup system theme listener
  useEffect(() => {
    // Apply saved theme mode
    const savedMode = getSavedThemeMode();
    applyThemeMode(savedMode);

    // Listen for system theme changes
    const cleanup = setupSystemThemeListener(() => {
      setCurrentTheme(loadSavedTheme());
    });

    return cleanup;
  }, []);

  // 异步加载本地配置文件（api-config.local.json）
  useEffect(() => {
    loadAISettingsAsync().then(settings => {
      if (settings.apiKey) {
        setAiSettings(settings);
        aiService.current.updateSettings(settings);
        console.log('已从本地文件加载 API 配置');
      }
    });
  }, []);

  const t = translations[lang];
  const aiService = useRef(new AIService(aiSettings));

  // 当设置变化时更新AI服务
  useEffect(() => {
    aiService.current.updateSettings(aiSettings);
  }, [aiSettings]);

  // Chat messages are now saved by ProjectContext automatically
  // No need for manual save here

  // Redirect to projects page when no active project and on workflow tab
  useEffect(() => {
    const workflowTabs = ['scouting', 'workbench', 'ontology', 'actionDesigner', 'systemMap', 'overview', 'aiEnhancement', 'aip'];
    if (!activeProjectId && workflowTabs.includes(activeTab)) {
      setActiveTab('projects');
    }
  }, [activeProjectId, activeTab]);

  // Project state is now saved automatically by ProjectContext
  // Cloud sync for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !activeProjectId || !currentOntology) return;

    const hasData = currentOntology.objects.length > 0 ||
                    currentOntology.industry ||
                    currentOntology.useCase;

    if (!hasData) return;

    // Queue cloud sync
    sync({
      projects: [{
        id: activeProjectId,
        name: currentOntology.projectName || 'Untitled Project',
        industry: currentOntology.industry,
        useCase: currentOntology.useCase,
        status: currentOntology.status,
        objects: currentOntology.objects,
        links: currentOntology.links,
        integrations: currentOntology.integrations,
        aiRequirements: currentOntology.aiRequirements,
      }],
    });
  }, [currentOntology, isAuthenticated, activeProjectId, sync]);

  // 保存当前标签页到localStorage（用于恢复上次工作位置）
  useEffect(() => {
    // 不保存临时标签（如 archetypeViewer）
    if (activeTab !== 'archetypeViewer') {
      try {
        localStorage.setItem('ontology-last-tab', activeTab);
      } catch (e) {
        console.error('保存标签页失败:', e);
      }
    }
  }, [activeTab]);

  // 获取当前模型显示名称
  const getCurrentModelName = () => {
    const provider = AI_PROVIDERS.find(p => p.id === aiSettings.provider);
    const model = provider?.models.find(m => m.id === aiSettings.model);
    return model?.name || aiSettings.model;
  };

  const handleSettingsChange = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    saveAISettings(newSettings);
    aiService.current.updateSettings(newSettings);
  };

  const handleDesignComplete = useCallback((data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;

      // 验证必要结构
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('AI返回的数据格式无效');
      }

      // 验证objects数组
      const objects = Array.isArray(parsed.objects) ? parsed.objects : [];
      const links = Array.isArray(parsed.links) ? parsed.links : [];
      const integrations = Array.isArray(parsed.integrations) ? parsed.integrations : [];

      // 如果没有objects，提示用户
      if (objects.length === 0) {
        console.warn('AI未能识别出业务对象，可能需要更多对话信息');
        alert(lang === 'cn'
          ? 'AI未能识别出业务对象。请在对话中提供更多业务细节后重试。'
          : 'AI could not identify business objects. Please provide more business details in the conversation and try again.');
        return;
      }

      // 验证每个object的基本结构
      const validObjects = objects.filter((obj: any) =>
        obj && typeof obj === 'object' && obj.id && obj.name
      );

      if (validObjects.length === 0) {
        throw new Error('AI返回的对象结构无效');
      }

      // 确保每个object有actions数组
      const normalizedObjects = validObjects.map((obj: any) => ({
        ...obj,
        properties: Array.isArray(obj.properties) ? obj.properties : [],
        actions: Array.isArray(obj.actions) ? obj.actions : [],
        aiFeatures: Array.isArray(obj.aiFeatures) ? obj.aiFeatures : [],
      }));

      setCurrentOntology({
        ...project,
        objects: normalizedObjects,
        links: links,
        integrations: integrations,
        status: 'designing'
      });
      setActiveTab('ontology');
    } catch (e) {
      console.error("Failed to parse ontology design", e);
      alert(lang === 'cn'
        ? `解析AI结果失败: ${e instanceof Error ? e.message : '未知错误'}。请重试或检查API设置。`
        : `Failed to parse AI result: ${e instanceof Error ? e.message : 'Unknown error'}. Please retry or check API settings.`);
    }
  }, [lang]);

  const triggerAutoDesign = useCallback(async () => {
    console.log('triggerAutoDesign called');
    console.log('aiSettings:', aiSettings);
    console.log('chatHistoryRef.current:', chatHistoryRef.current);

    // 检查是否配置了模型
    if (!aiSettings.model) {
      alert(lang === 'cn' ? '请先在设置中选择一个模型' : 'Please select a model in settings first');
      setShowSettings(true);
      return;
    }

    // 检查是否有聊天记录
    if (!chatHistoryRef.current || chatHistoryRef.current.length === 0) {
      alert(lang === 'cn' ? '没有对话记录，请先进行对话' : 'No chat history, please chat first');
      return;
    }

    setIsDesigning(true);
    try {
      console.log('Calling designOntology...');
      const result = await aiService.current.designOntology(chatHistoryRef.current);
      console.log('designOntology result:', result);
      handleDesignComplete(result);
    } catch (error) {
      console.error('Design failed:', error);
      alert(lang === 'cn'
        ? `生成失败: ${error instanceof Error ? error.message : '未知错误'}`
        : `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDesigning(false);
    }
  }, [lang, aiSettings.model, handleDesignComplete]);

  const handleNewSession = () => {
    if (window.confirm(t.confirmNewSession)) {
      // Reset current project's state via context
      setChatMessages([]);
      setCurrentOntology({
        ...emptyProjectState,
        projectName: project.projectName, // Keep project name
      });
      chatHistoryRef.current = [];
      setActiveTab('quickStart');
    }
  };

  // Archetype handlers
  const handleSelectArchetype = useCallback((archetypeId: string) => {
    setSelectedArchetypeId(archetypeId);
    setActiveTab('archetypeViewer');
  }, []);

  const handleApplyArchetype = useCallback(async (archetypeId: string, skipConfirm = false) => {
    // 跳过确认（用于导入后自动应用）或显示确认对话框
    if (!skipConfirm && !window.confirm(t.applyArchetype)) return;

    // 使用异步方法获取原型（支持静态和导入的原型）
    const archetype = await getMergedArchetypeById(archetypeId);
    if (!archetype) {
      console.error('Archetype not found:', archetypeId);
      return;
    }

    // Convert archetype ontology to project format
    const objects = archetype.ontology.objects.map(obj => ({
      ...obj,
      actions: obj.actions || [],
      properties: obj.properties || [],
      aiFeatures: obj.aiFeatures || [],
    }));

    const links = archetype.ontology.links.map(link => ({
      ...link,
    }));

    // Create integrations from connectors
    const integrations = archetype.connectors.map(connector => ({
      systemName: connector.sourceSystem,
      dataPoints: connector.mappedObjects.map(m => m.sourceEntity),
      mechanism: connector.sync.frequency === 'realtime' ? 'Webhook' as const : 'API' as const,
      targetObjectId: connector.mappedObjects[0]?.objectId || '',
    }));

    // Add a system message marking the context boundary (instead of clearing everything)
    const systemMessage: ChatMessage = {
      role: 'system',
      content: lang === 'cn'
        ? `📦 **已导入行业原型：${archetype.metadata.name}**\n\n` +
          `• 行业：${archetype.metadata.industry}\n` +
          `• 领域：${archetype.metadata.domain}\n` +
          `• 包含：${objects.length} 个对象类型\n\n` +
          `_以下对话将基于此原型展开，之前的对话上下文已归档。_`
        : `📦 **Imported Archetype: ${archetype.metadata.name}**\n\n` +
          `• Industry: ${archetype.metadata.industry}\n` +
          `• Domain: ${archetype.metadata.domain}\n` +
          `• Contains: ${objects.length} object types\n\n` +
          `_Conversations below will be based on this archetype. Previous context has been archived._`,
      metadata: {
        type: 'archetype_import',
        archetypeId: archetypeId,
        archetypeName: archetype.metadata.name,
        timestamp: new Date().toISOString()
      }
    };

    // Keep chat history but add context boundary
    setChatMessages(prev => [...prev, systemMessage]);
    chatHistoryRef.current = [...chatHistoryRef.current, systemMessage];

    // Clear AI analysis result (it's no longer relevant to the new ontology)
    setAiAnalysisResult(null);

    setCurrentOntology({
      ...project,
      projectName: archetype.metadata.name,
      industry: archetype.metadata.industry,
      useCase: archetype.metadata.domain,
      objects,
      links,
      integrations,
      status: 'designing'
    });

    setActiveTab('ontology');
  }, [t.applyArchetype, project]);

  return (
    <div className="flex h-screen overflow-hidden text-secondary" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-64 glass-surface flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-base)' }}>
              <Sparkles size={14} />
            </div>
            <h1 className="font-medium tracking-tight text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h1>
          </div>
          <p className="text-[10px] text-muted font-mono tracking-wide">{t.subtitle}</p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Getting Started Section - For beginners */}
          <NavSection label={t.sectionGettingStarted} />
          <NavItem
            active={activeTab === 'projects'}
            onClick={() => setActiveTab('projects')}
            icon={<FolderOpen size={16} />}
            label={t.projects}
          />
          <NavItem
            active={activeTab === 'quickStart'}
            onClick={() => setActiveTab('quickStart')}
            icon={<Rocket size={16} />}
            label={t.quickStart}
          />

          {/* Core Workflow - 4 Phases (requires project) */}
          <NavSection label={t.sectionCoreWorkflow} />

          {/* Phase 1: Discover */}
          <NavItem
            active={activeTab === 'scouting'}
            onClick={() => setActiveTab('scouting')}
            icon={<MessageSquare size={16} />}
            label={t.phase1}
            sublabel={t.phase1Desc}
            disabled={!activeProjectId}
          />

          {/* Phase 2: Model */}
          <NavItem
            active={activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner'}
            onClick={() => setActiveTab('workbench')}
            icon={<Database size={16} />}
            label={t.phase2}
            sublabel={t.phase2Desc}
            disabled={!activeProjectId}
          />

          {/* Phase 3: Integrate */}
          <NavItem
            active={activeTab === 'systemMap' || activeTab === 'overview'}
            onClick={() => setActiveTab('systemMap')}
            icon={<Network size={16} />}
            label={t.phase3}
            sublabel={t.phase3Desc}
            disabled={!activeProjectId || project.objects.length === 0}
          />

          {/* Phase 4: AI Enhancement */}
          <NavItem
            active={activeTab === 'aiEnhancement' || activeTab === 'aip'}
            onClick={() => setActiveTab('aiEnhancement')}
            icon={<Sparkles size={16} />}
            label={t.phase4}
            sublabel={t.phase4Desc}
            disabled={!activeProjectId || project.objects.length === 0}
          />

          {/* Resources Section - Reference for all users */}
          <NavSection label={t.sectionResources} />
          <NavItem
            active={activeTab === 'academy'}
            onClick={() => setActiveTab('academy')}
            icon={<GraduationCap size={16} />}
            label={t.academy}
          />
          <NavItem
            active={activeTab === 'archetypes' || activeTab === 'archetypeViewer'}
            onClick={() => { setActiveTab('archetypes'); setSelectedArchetypeId(null); }}
            icon={<Package size={16} />}
            label={t.archetypes}
          />
        </nav>

        {/* Sidebar Footer - Simplified */}
        <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* 用户账号区域 */}
          {isAuthenticated ? (
            <UserMenu lang={lang} />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-white/[0.04] transition-colors text-muted"
            >
              <div className="flex items-center gap-2">
                <LogIn size={14} />
                <span>{lang === 'cn' ? '登录 / 注册' : 'Sign In'}</span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--color-accent)' }}>
                {lang === 'cn' ? '云同步' : 'Cloud Sync'}
              </span>
            </button>
          )}

          {/* 统一设置入口 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-white/[0.04] transition-colors text-muted"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={14} />
              <span>{lang === 'cn' ? '设置' : 'Settings'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] truncate max-w-[60px]" style={{ color: 'var(--color-accent)' }}>
                {getCurrentModelName()}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: aiSettings.apiKey ? 'var(--color-success)' : 'var(--color-warning)' }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--color-bg-elevated)]">
        {isDesigning && (
          <div className="absolute inset-0 bg-[var(--color-bg-base)]/80 z-50 flex flex-col items-center justify-center">
            <div
              className="w-12 h-12 border-2 rounded-full animate-spin mb-4"
              style={{
                borderColor: 'var(--color-border)',
                borderTopColor: 'var(--color-accent)'
              }}
            />
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.synthesizing}</h2>
            <p className="text-muted mt-2 text-sm">{t.mapping}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <ErrorBoundary onReset={() => setActiveTab('projects')}>
            {activeTab === 'projects' && (
              <ProjectsPage
                lang={lang}
                onOpenProject={() => setActiveTab('scouting')}
              />
            )}
            {activeTab === 'quickStart' && (
              <QuickStartPage lang={lang} project={project} onNavigate={setActiveTab} />
            )}
            {activeTab === 'academy' && (
              <AcademyPage lang={lang} />
            )}
            {activeTab === 'archetypes' && (
              <ArchetypesPage
                lang={lang}
                aiSettings={aiSettings}
                onSelectArchetype={handleSelectArchetype}
                onApplyArchetype={handleApplyArchetype}
              />
            )}
            {activeTab === 'archetypeViewer' && selectedArchetypeId && (
              <ArchetypeViewer
                lang={lang}
                archetypeId={selectedArchetypeId}
                onBack={() => { setActiveTab('archetypes'); setSelectedArchetypeId(null); }}
                onApply={() => handleApplyArchetype(selectedArchetypeId)}
              />
            )}
            {activeTab === 'scouting' && (
              <ScoutingPage
                lang={lang}
                messages={chatMessages}
                project={project}
                isLoading={isChatLoading}
                hasApiKey={!!aiSettings.apiKey}
                onDesignTrigger={triggerAutoDesign}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
            {/* Phase 2: Ontology Modeling */}
            {(activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner') && (
              <ModelingPage
                lang={lang}
                project={project}
                setProject={setProject}
                chatMessages={chatHistoryRef}
                onNavigateToScouting={() => setActiveTab('scouting')}
                onNavigateToArchetypes={() => setActiveTab('archetypes')}
              />
            )}
            {/* Phase 3: System Integration */}
            {(activeTab === 'systemMap' || activeTab === 'overview') && (
              <IntegrationPage lang={lang} project={project} />
            )}
            {/* Phase 4: AI Enhancement */}
            {(activeTab === 'aiEnhancement' || activeTab === 'aip') && (
              <AIEnhancementPage
                lang={lang}
                project={project}
                setProject={setProject}
                aiSettings={aiSettings}
                analysisResult={aiAnalysisResult}
                onAnalysisResult={setAiAnalysisResult}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Quality Check Floating Button - Always visible for guidance */}
      {!showQualityPanel && (
        <button
          onClick={() => setShowQualityPanel(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-40 group"
          style={{
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
          title={lang === 'cn' ? '质量检查' : 'Quality Check'}
        >
          <ShieldCheck size={24} style={{ color: 'var(--color-bg-base)' }} />
          <div
            className="absolute -top-8 right-0 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            {lang === 'cn' ? '质量检查' : 'Quality Check'}
          </div>
        </button>
      )}

      {/* Quality Panel Slide-out */}
      {showQualityPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[var(--color-bg-base)]/60 backdrop-blur-sm"
            onClick={() => setShowQualityPanel(false)}
          />
          <div className="relative w-full max-w-lg h-full glass-surface animate-slide-in-right">
            <QualityPanel
              lang={lang}
              project={project}
              onClose={() => setShowQualityPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Unified Settings Modal */}
      {showSettings && (
        <UnifiedSettings
          lang={lang}
          aiSettings={aiSettings}
          currentTheme={currentTheme}
          onAISettingsChange={handleSettingsChange}
          onThemeChange={setCurrentTheme}
          onLanguageChange={setLang}
          onReset={handleNewSession}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Global Chat Bar - 底部固定聊天栏，所有工作流阶段显示 */}
      {(activeTab === 'scouting' || activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner' || activeTab === 'systemMap' || activeTab === 'overview' || activeTab === 'aiEnhancement' || activeTab === 'aip') && (
        <GlobalChatBar
          lang={lang}
          project={project}
          setProject={setProject}
          aiSettings={aiSettings}
          aiService={aiService.current}
          currentPhase={getCurrentPhase()}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          isExpanded={isChatExpanded}
          onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
          messagesInMainArea={activeTab === 'scouting'}
          onLoadingChange={setIsChatLoading}
          historyRef={chatHistoryRef}
          activeProjectId={activeProjectId}
          onNavigateToProjects={() => setActiveTab('projects')}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        lang={lang}
      />
    </div>
  );
};

// Wrapper component with providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <SyncProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </SyncProvider>
    </AuthProvider>
  );
};

const NavSection: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-3 pt-4 pb-2 first:pt-0">
    <span
      className="text-[10px] font-medium uppercase tracking-wider"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {label}
    </span>
  </div>
);

const NavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}> = ({ active, onClick, icon, label, sublabel, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
      disabled
        ? 'opacity-30 cursor-not-allowed'
        : active
        ? ''
        : 'text-muted hover:text-primary'
    }`}
    style={
      disabled
        ? undefined
        : active
        ? {
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-hover)',
            fontWeight: 500
          }
        : undefined
    }
  >
    {active && (
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
    )}
    {icon}
    <div className="flex flex-col items-start">
      <span>{label}</span>
      {sublabel && (
        <span className="text-[10px] text-muted font-normal">{sublabel}</span>
      )}
    </div>
  </button>
);

export default App;

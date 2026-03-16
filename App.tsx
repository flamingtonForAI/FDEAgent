
import React, { useState, useEffect, useCallback, useRef } from 'react';
import i18next from './lib/i18n';
import { useAppTranslation } from './hooks/useAppTranslation';
import { AIService, loadAISettings, loadAISettingsAsync, saveAISettings } from './services/aiService';
import { AnalysisResult } from './services/aiAnalysisService';
import { ProjectState, ChatMessage, Language, AISettings, AIProvider, AI_PROVIDERS } from './types';
// Page components — core workflow pages (eagerly loaded)
import {
  ProjectsPage,
  QuickStartPage,
  ScoutingPage,
  ModelingPage,
  IntegrationPage,
} from './pages';

// Infrequently-visited pages — lazy-loaded for smaller initial bundle
const AcademyPage = React.lazy(() => import('./pages/AcademyPage'));
const ArchetypesPage = React.lazy(() => import('./pages/ArchetypesPage'));
const AIEnhancementPage = React.lazy(() => import('./pages/AIEnhancementPage'));
const DeliveryPage = React.lazy(() => import('./pages/DeliveryPage'));
// Components (only those still used directly in App.tsx)
import ArchetypeViewer from './components/ArchetypeViewer';
import GlobalChatBar from './components/GlobalChatBar';
import ErrorBoundary from './components/ErrorBoundary';
import QualityPanel from './components/QualityPanel';
import { getMergedArchetypeById } from './content/archetypes';
import { MessageSquare, Database, Network, Settings as SettingsIcon, Sparkles, BrainCircuit, GraduationCap, ShieldCheck, Package, Rocket, LogIn, FolderOpen } from 'lucide-react';
import { Theme, loadSavedTheme, applyThemeMode, getSavedThemeMode, setupSystemThemeListener } from './lib/themes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider, useSync } from './contexts/SyncContext';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { AuthModal, UserMenu } from './components/auth';
import { storage } from './lib/storage';
import { syncService } from './services/syncService';
import { normalizeLinks } from './lib/cardinality';
import ProjectDashboard from './components/ProjectDashboard';
import UnifiedSettings from './components/UnifiedSettings';

// Minimal loading fallback for lazy-loaded pages
const PageLoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div
      className="w-8 h-8 border-2 rounded-full animate-spin"
      style={{
        borderColor: 'var(--color-border)',
        borderTopColor: 'var(--color-accent)'
      }}
    />
  </div>
);


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
type WorkflowTab = 'projects' | 'quickStart' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview' | 'aiEnhancement' | 'deliver';
const validWorkflowTabs: WorkflowTab[] = ['projects', 'quickStart', 'academy', 'archetypes', 'scouting', 'workbench', 'ontology', 'actionDesigner', 'systemMap', 'aip', 'overview', 'aiEnhancement', 'deliver'];

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
  const { t, lang, i18nLang } = useAppTranslation('nav');
  const setLang = useCallback((newLang: Language) => {
    i18next.changeLanguage(newLang);
  }, []);
  const [activeTab, setActiveTab] = useState<'projects' | 'quickStart' | 'academy' | 'archetypes' | 'archetypeViewer' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview' | 'aiEnhancement' | 'deliver'>(loadLastActiveTab);
  const [isDesigning, setIsDesigning] = useState(false);

  // Use ProjectContext for both chat and ontology (per-project storage)
  const { currentChat: chatMessages, setChatMessages, activeProjectId, currentOntology, setCurrentOntology } = useProject();
  const chatHistoryRef = useRef<ChatMessage[]>(chatMessages);
  const activeProjectIdRef = useRef(activeProjectId);
  activeProjectIdRef.current = activeProjectId;
  const designGenerationIdRef = useRef(0);

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

  // AI 分析状态（持久化跨标签页 + 跨刷新）
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // Load analysis result when project switches
  useEffect(() => {
    if (activeProjectId) {
      const saved = storage.getAnalysisResultById(activeProjectId);
      setAiAnalysisResult(saved as AnalysisResult | null);
    } else {
      setAiAnalysisResult(null);
    }
    // Reset transient state on project switch
    setIsAiAnalyzing(false);
    setAiAnalysisError(null);
  }, [activeProjectId]);

  // Auto-save analysis result when it changes
  useEffect(() => {
    if (!activeProjectId || isAiAnalyzing) return;
    // Save (including null to clear)
    if (aiAnalysisResult) {
      storage.saveAnalysisResultById(activeProjectId, aiAnalysisResult);
    }
  }, [aiAnalysisResult, activeProjectId, isAiAnalyzing]);

  // 全局聊天栏状态
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Auth state
  const { isAuthenticated } = useAuth();
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
  const getCurrentPhase = useCallback((): 'discover' | 'model' | 'integrate' | 'enhance' | 'deliver' => {
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
      case 'deliver':
        return 'deliver';
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
      // Check if any key is configured — apiKeys map (new) or legacy apiKey (old data)
      const hasKey = settings.apiKeys
        ? Object.values(settings.apiKeys).some(v => !!v)
        : !!settings.apiKey;
      if (hasKey) {
        setAiSettings(settings);
        aiService.current.updateSettings(settings);
        console.log('已从本地文件加载 API 配置');
      }
    });
  }, []);

  const aiService = useRef(new AIService(aiSettings));

  // 当设置变化时更新AI服务
  useEffect(() => {
    aiService.current.updateSettings(aiSettings);
  }, [aiSettings]);

  // Chat messages are now saved by ProjectContext automatically
  // No need for manual save here

  // Redirect to projects page when no active project and on workflow tab
  useEffect(() => {
    const workflowTabs = ['scouting', 'workbench', 'ontology', 'actionDesigner', 'systemMap', 'overview', 'aiEnhancement', 'aip', 'deliver'];
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

    const mappedCloudProjectId = storage.getCloudProjectIdByLocalId(activeProjectId);
    const isLocalOnlyId = activeProjectId.startsWith('proj-');
    const syncProjectId = mappedCloudProjectId || (isLocalOnlyId ? undefined : activeProjectId);

    // Queue cloud sync
    sync({
      projects: [{
        id: syncProjectId,
        localId: activeProjectId,
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

  // Persist local->cloud project ID mappings returned by sync API
  useEffect(() => {
    const unsubscribe = syncService.subscribe((result) => {
      const mappings = result?.results.projects?.mappings;
      if (!mappings || mappings.length === 0) return;

      for (const mapping of mappings) {
        storage.setCloudProjectIdByLocalId(mapping.localId, mapping.cloudId);
      }
    });

    return unsubscribe;
  }, []);

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

  const activeProviderApiKey = aiSettings.apiKeys
    ? aiSettings.apiKeys[aiSettings.provider as AIProvider]
    : aiSettings.apiKey;

  const triggerAutoDesign = useCallback(async () => {
    // 检查是否配置了模型
    if (!aiSettings.model) {
      alert(t('app.alertSelectModel'));
      setShowSettings(true);
      return;
    }

    // 检查是否有聊天记录
    if (!chatHistoryRef.current || chatHistoryRef.current.length === 0) {
      alert(t('app.alertNoChatHistory'));
      return;
    }

    // Capture the project ID before the async call so we can verify it hasn't
    // changed when the response comes back (prevents cross-project data write).
    const requestProjectId = activeProjectIdRef.current;

    // Immediately invalidate any in-flight summary from a prior generation run.
    // This must happen BEFORE the async designOntology call so that if the user
    // triggers a second generation while the first is still in flight, the first
    // run's summary callback will see a stale generation ID and discard itself.
    const thisGenerationId = ++designGenerationIdRef.current;

    setIsDesigning(true);
    try {
      const result = await aiService.current.designOntology(chatHistoryRef.current, { lang: i18nLang });

      const parsed = typeof result === 'string' ? JSON.parse(result) : result;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('AI返回的数据格式无效');
      }

      const objects = Array.isArray(parsed.objects) ? parsed.objects : [];
      const links = Array.isArray(parsed.links) ? parsed.links : [];
      const integrations = Array.isArray(parsed.integrations) ? parsed.integrations : [];

      if (objects.length === 0) {
        console.warn('AI未能识别出业务对象，可能需要更多对话信息');
        alert(t('app.alertNoObjects'));
        return;
      }

      const validObjects = objects.filter((obj: any) =>
        obj && typeof obj === 'object' && obj.id && obj.name
      );

      if (validObjects.length === 0) {
        throw new Error('AI返回的对象结构无效');
      }

      const normalizedObjects = validObjects.map((obj: any) => ({
        ...obj,
        properties: Array.isArray(obj.properties) ? obj.properties : [],
        actions: Array.isArray(obj.actions) ? obj.actions : [],
        aiFeatures: Array.isArray(obj.aiFeatures) ? obj.aiFeatures : [],
      }));

      // Guard: if the user switched projects while the AI request was in-flight,
      // discard the result to prevent cross-project data pollution.
      // Read from ref to get the *current* value, not the stale closure value.
      if (activeProjectIdRef.current !== requestProjectId) {
        console.warn('Project changed during design generation, discarding result');
        alert(t('app.alertProjectChanged'));
        return;
      }

      // Use functional update to avoid stale closure over project state.
      setProject(prev => ({
        ...prev,
        objects: normalizedObjects,
        links: links,
        integrations: integrations,
        status: 'designing' as const,
      }));

      // Fire async LLM summary (non-blocking — don't await)
      // thisGenerationId was captured at the top of triggerAutoDesign, before the
      // async call, so any concurrent re-generation will have already bumped the
      // ref and this closure's ID will be stale → summary discarded correctly.
      const totalActions = normalizedObjects.reduce((sum: number, obj: any) => sum + (obj.actions?.length || 0), 0);

      // Build a compact snapshot for the LLM to summarize from
      const snapshot = normalizedObjects.map((o: any) => ({
        name: o.name,
        properties: (o.properties || []).length,
        actions: (o.actions || []).map((a: any) => a.name),
      }));
      const linksSummary = links.map((l: any) => `${l.source} → ${l.target} (${l.label || l.type || ''})`).join('; ');
      const integSummary = integrations.map((i: any) => i.name || i.type || '').filter(Boolean).join(', ');

      const summaryPrompt = `${t('app.summaryPromptIntro')}\n\n` +
        `${t('app.summaryPromptObjects', { objects: JSON.stringify(snapshot) })}\n` +
        `${t('app.summaryPromptLinks', { links: linksSummary || t('app.none') })}\n` +
        `${t('app.summaryPromptIntegrations', { integrations: integSummary || t('app.none') })}\n\n` +
        t('app.summaryPromptInstruction');

      const appendSummary = (msg: ChatMessage) => {
        // Guard: discard if project changed or a newer generation superseded this one
        if (activeProjectIdRef.current !== requestProjectId) return;
        if (designGenerationIdRef.current !== thisGenerationId) return;
        setChatMessages(prev => [...prev, msg]);
        chatHistoryRef.current = [...chatHistoryRef.current, msg];
      };

      aiService.current.chat(chatHistoryRef.current, summaryPrompt, { lang: i18nLang }).then(summary => {
        appendSummary({
          role: 'assistant',
          content: summary,
          metadata: { type: 'milestone', timestamp: new Date().toISOString() }
        });
      }).catch(() => {
        appendSummary({
          role: 'assistant',
          content: t('app.ontologyGenerated', { objects: normalizedObjects.length, actions: totalActions, links: links.length, integrations: integrations.length }),
          metadata: { type: 'milestone', timestamp: new Date().toISOString() }
        });
      });

      // Clear stale AI analysis — it was generated from the previous ontology
      // and is no longer relevant. (Same pattern as archetype apply.)
      setAiAnalysisResult(null);
      const pid = activeProjectIdRef.current;
      if (pid) {
        storage.saveAnalysisResultById(pid, null);
      }

      setActiveTab('ontology');
    } catch (error) {
      console.error('Design failed:', error);
      alert(t('app.alertDesignFailed', { error: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setIsDesigning(false);
    }
  }, [t, i18nLang, aiSettings.model, setProject]);

  const handleNewSession = () => {
    if (window.confirm(t('app.confirmNewSession'))) {
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
    if (!skipConfirm && !window.confirm(t('app.applyArchetype'))) return;

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

    const links = normalizeLinks(archetype.ontology.links || []);

    // Create integrations from connectors
    // Handles both typed format (sourceSystem, mappedObjects, sync)
    // and flat format (name, targetObjects, syncFrequency, configuration)
    const integrations = archetype.connectors.flatMap(connector => {
      const systemName = connector.sourceSystem || connector.name || connector.id || '';

      // Determine mechanism
      let mechanism: string;
      if (connector.sync?.frequency) {
        mechanism = connector.sync.frequency === 'realtime' || connector.sync.frequency === 'streaming'
          ? 'Webhook' : 'API';
      } else if (connector.configuration?.connectionType) {
        mechanism = connector.configuration.connectionType;
      } else if (connector.syncFrequency) {
        mechanism = connector.syncFrequency === 'real-time' || connector.syncFrequency === 'realtime'
          ? 'Webhook' : 'API';
      } else {
        mechanism = 'API';
      }

      // Determine data points
      const dataPoints = connector.mappedObjects
        ? connector.mappedObjects.map((m: any) => m.sourceEntity).filter(Boolean)
        : (connector.fieldMapping || []).map((fm: any) => fm.source).filter(Boolean);

      // Determine target objects — flatten one connector to multiple integrations
      const targetIds: string[] = connector.mappedObjects
        ? connector.mappedObjects.map((m: any) => m.objectId).filter(Boolean)
        : (connector.targetObjects || []);

      if (targetIds.length === 0) {
        return [{
          systemName,
          dataPoints: dataPoints.length > 0 ? dataPoints : [],
          mechanism,
          targetObjectId: '',
        }];
      }

      return targetIds.map((targetId: string) => ({
        systemName,
        dataPoints: dataPoints.length > 0 ? dataPoints : [targetId],
        mechanism,
        targetObjectId: targetId,
      }));
    });

    // Add a system message marking the context boundary (instead of clearing everything)
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `${t('app.archetypeImportTitle', { name: archetype.metadata.name })}\n\n` +
        `${t('app.archetypeImportDetails', { industry: archetype.metadata.industry, domain: archetype.metadata.domain, count: objects.length })}\n\n` +
        t('app.archetypeImportNote'),
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
    if (activeProjectId) {
      storage.saveAnalysisResultById(activeProjectId, null);
    }

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
  }, [t, project]);

  return (
    <div className="flex h-screen overflow-hidden text-secondary" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-64 glass-surface flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-base)' }}>
              <Sparkles size={14} />
            </div>
            <h1 className="font-medium tracking-tight text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('app.title')}</h1>
          </div>
          <p className="text-[11px] text-muted tracking-wider uppercase" style={{ fontWeight: 400 }}>{t('app.subtitle')}</p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Getting Started Section - For beginners */}
          <NavSection label={t('app.sectionGettingStarted')} />
          <NavItem
            active={activeTab === 'projects'}
            onClick={() => setActiveTab('projects')}
            icon={<FolderOpen size={16} />}
            label={t('app.projects')}
          />
          <NavItem
            active={activeTab === 'quickStart'}
            onClick={() => setActiveTab('quickStart')}
            icon={<Rocket size={16} />}
            label={t('app.quickStart')}
          />

          {/* Core Workflow - 4 Phases (requires project) */}
          <NavSection label={t('app.sectionCoreWorkflow')} />

          {/* Phase 1: Discover */}
          <NavItem
            active={activeTab === 'scouting'}
            onClick={() => setActiveTab('scouting')}
            icon={<MessageSquare size={16} />}
            label={t('app.phase1')}
            sublabel={t('app.phase1Desc')}
            disabled={!activeProjectId}
          />

          {/* Phase 2: Model */}
          <NavItem
            active={activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner'}
            onClick={() => setActiveTab('workbench')}
            icon={<Database size={16} />}
            label={t('app.phase2')}
            sublabel={t('app.phase2Desc')}
            disabled={!activeProjectId}
          />

          {/* Phase 3: Integrate */}
          <NavItem
            active={activeTab === 'systemMap' || activeTab === 'overview'}
            onClick={() => setActiveTab('systemMap')}
            icon={<Network size={16} />}
            label={t('app.phase3')}
            sublabel={t('app.phase3Desc')}
            disabled={!activeProjectId || project.objects.length === 0}
          />

          {/* Phase 4: AI Enhancement */}
          <NavItem
            active={activeTab === 'aiEnhancement' || activeTab === 'aip'}
            onClick={() => setActiveTab('aiEnhancement')}
            icon={<BrainCircuit size={16} />}
            label={t('app.phase4')}
            sublabel={t('app.phase4Desc')}
            disabled={!activeProjectId || project.objects.length === 0}
          />

          {/* Phase 5: Deliver */}
          <NavItem
            active={activeTab === 'deliver'}
            onClick={() => setActiveTab('deliver')}
            icon={<Package size={16} />}
            label={t('app.phase5')}
            sublabel={t('app.phase5Desc')}
            disabled={!activeProjectId || project.objects.length === 0}
          />

          {/* Resources Section - Reference for all users */}
          <NavSection label={t('app.sectionResources')} />
          <NavItem
            active={activeTab === 'academy'}
            onClick={() => setActiveTab('academy')}
            icon={<GraduationCap size={16} />}
            label={t('app.academy')}
          />
          <NavItem
            active={activeTab === 'archetypes' || activeTab === 'archetypeViewer'}
            onClick={() => { setActiveTab('archetypes'); setSelectedArchetypeId(null); }}
            icon={<Package size={16} />}
            label={t('app.archetypes')}
          />
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* 用户账号区域 */}
          {isAuthenticated ? (
            <UserMenu lang={lang} />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <LogIn size={15} />
                <span>{t('app.signIn')}</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--color-accent)' }}>
                {t('app.cloudSync')}
              </span>
            </button>
          )}

          {/* 统一设置入口 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={14} />
              <span>{t('app.settings')}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs truncate max-w-[80px]" style={{ color: 'var(--color-accent)' }}>
                  {getCurrentModelName()}
                </span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeProviderApiKey ? 'var(--color-success)' : 'var(--color-warning)' }}
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
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('app.synthesizing')}</h2>
            <p className="text-muted mt-2 text-sm">{t('app.mapping')}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <ErrorBoundary onReset={() => setActiveTab('projects')}>
            {activeTab === 'projects' && (
              <ProjectsPage
onOpenProject={() => setActiveTab('scouting')}
              />
            )}
            {activeTab === 'quickStart' && (
              <QuickStartPage lang={lang} project={project} onNavigate={setActiveTab} />
            )}
            {activeTab === 'academy' && (
              <React.Suspense fallback={<PageLoadingFallback />}>
                <AcademyPage lang={lang} />
              </React.Suspense>
            )}
            {activeTab === 'archetypes' && (
              <React.Suspense fallback={<PageLoadingFallback />}>
                <ArchetypesPage
    aiSettings={aiSettings}
                  onSelectArchetype={handleSelectArchetype}
                  onApplyArchetype={handleApplyArchetype}
                />
              </React.Suspense>
            )}
            {activeTab === 'archetypeViewer' && selectedArchetypeId && (
              <ArchetypeViewer
archetypeId={selectedArchetypeId}
                onBack={() => { setActiveTab('archetypes'); setSelectedArchetypeId(null); }}
                onApply={() => handleApplyArchetype(selectedArchetypeId)}
              />
            )}
            {activeTab === 'scouting' && (
              <ScoutingPage
messages={chatMessages}
                project={project}
                isLoading={isChatLoading}
                hasApiKey={!!activeProviderApiKey}
                onDesignTrigger={triggerAutoDesign}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
            {/* Phase 2: Ontology Modeling */}
            {(activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner') && (
              <ModelingPage
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
              <React.Suspense fallback={<PageLoadingFallback />}>
                <AIEnhancementPage
    project={project}
                  setProject={setProject}
                  aiSettings={aiSettings}
                  analysisResult={aiAnalysisResult}
                  onAnalysisResult={setAiAnalysisResult}
                  isAnalyzing={isAiAnalyzing}
                  onIsAnalyzingChange={setIsAiAnalyzing}
                  analysisError={aiAnalysisError}
                  onAnalysisError={setAiAnalysisError}
                />
              </React.Suspense>
            )}
            {/* Phase 5: Delivery */}
            {activeTab === 'deliver' && (
              <React.Suspense fallback={<PageLoadingFallback />}>
                <DeliveryPage
    project={project}
                  onOpenQualityPanel={() => setShowQualityPanel(true)}
                />
              </React.Suspense>
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Quality Check Floating Button */}
      {!showQualityPanel && (
        <button
          onClick={() => setShowQualityPanel(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-transform z-40"
          style={{
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          title={t('app.qualityCheck')}
          aria-label={t('app.qualityCheck')}
        >
          <ShieldCheck size={20} style={{ color: 'var(--color-bg-base)' }} />
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
      {(activeTab === 'scouting' || activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner' || activeTab === 'systemMap' || activeTab === 'overview' || activeTab === 'aiEnhancement' || activeTab === 'aip' || activeTab === 'deliver') && (
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
        ? 'opacity-50 cursor-not-allowed'
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

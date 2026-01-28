
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIService, loadAISettings, saveAISettings } from './services/aiService';
import { ProjectState, ChatMessage, OntologyObject, OntologyLink, Language, AISettings, AI_PROVIDERS } from './types';
import ChatInterface from './components/ChatInterface';
import OntologyVisualizer from './components/OntologyVisualizer';
import ActionDesigner from './components/ActionDesigner';
import AIPLogicMatrix from './components/AIPLogicMatrix';
import ProjectOverview from './components/ProjectOverview';
import SystemMap from './components/SystemMap';
import Settings from './components/Settings';
import Academy from './components/Academy';
import QualityPanel from './components/QualityPanel';
import StructuringWorkbench from './components/StructuringWorkbench';
import ArchetypeBrowser from './components/ArchetypeBrowser';
import ArchetypeViewer from './components/ArchetypeViewer';
import QuickStart from './components/QuickStart';
import { getArchetypeById } from './content/archetypes';
import { LayoutDashboard, MessageSquare, Database, Zap, Languages, Network, Settings as SettingsIcon, RotateCcw, PenTool, Sparkles, GraduationCap, ShieldCheck, X, Package, ClipboardList, Rocket } from 'lucide-react';
import { ThemeSwitcher } from './components/ui';
import { Theme, loadSavedTheme, applyTheme } from './lib/themes';

const translations = {
  en: {
    title: "Ontology Architect",
    subtitle: "Intelligent OS Studio",
    quickStart: "Quick Start",
    academy: "Learning Center",
    archetypes: "Archetypes",
    scouting: "Requirement Scouting",
    workbench: "Structuring Workbench",
    ontology: "Logical Ontology",
    actionDesigner: "Action Designer",
    systemMap: "Architecture Map",
    augmentation: "AI Augmentation",
    blueprint: "System Blueprint",
    sectionGettingStarted: "Getting Started",
    sectionResources: "Resources",
    sectionCoreWorkflow: "Core Workflow",
    sectionSystemDesign: "System Design",
    status: "Engine Status",
    ready: "Standby",
    synthesizing: "Synthesizing System Architecture...",
    mapping: "Mapping Entities, Relations & Intelligence",
    newSession: "New Session",
    confirmNewSession: "Start a new session? Current conversation and design will be cleared.",
    applyArchetype: "Apply archetype to current project? This will replace existing ontology design.",
  },
  cn: {
    title: "本体架构师",
    subtitle: "智能操作系统工作室",
    quickStart: "快速开始",
    academy: "学习中心",
    archetypes: "行业原型",
    scouting: "需求勘察",
    workbench: "结构化工作台",
    ontology: "逻辑本体",
    actionDesigner: "Action 设计",
    systemMap: "架构拓扑图",
    augmentation: "AI 能力增强",
    blueprint: "系统蓝图",
    sectionGettingStarted: "入门",
    sectionResources: "参考资源",
    sectionCoreWorkflow: "核心工作流",
    sectionSystemDesign: "系统设计",
    status: "引擎状态",
    ready: "待命",
    synthesizing: "正在合成系统架构...",
    mapping: "映射实体、关系与智能逻辑",
    newSession: "新建会话",
    confirmNewSession: "确定要开始新会话吗？当前的对话和设计将被清除。",
    applyArchetype: "应用此原型到当前项目？这将替换现有的 Ontology 设计。",
  }
};

// 从localStorage加载聊天记录
const loadChatMessages = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem('ontology-chat-messages');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载聊天记录失败:', e);
  }
  return [];
};

// 从localStorage加载项目状态
const loadProjectState = (): ProjectState => {
  try {
    const saved = localStorage.getItem('ontology-project-state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载项目状态失败:', e);
  }
  return {
    industry: '',
    useCase: '',
    objects: [],
    links: [],
    integrations: [],
    status: 'scouting'
  };
};

// 有效的工作流标签页（用于恢复上次位置）
type WorkflowTab = 'quickStart' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview';
const validWorkflowTabs: WorkflowTab[] = ['quickStart', 'academy', 'archetypes', 'scouting', 'workbench', 'ontology', 'actionDesigner', 'systemMap', 'aip', 'overview'];

// 从localStorage加载上次活跃的标签页
const loadLastActiveTab = (): WorkflowTab => {
  try {
    const saved = localStorage.getItem('ontology-last-tab');
    const project = loadProjectState();

    // 如果有保存的标签且有效，则恢复
    if (saved && validWorkflowTabs.includes(saved as WorkflowTab)) {
      // 如果是需要项目数据的标签，但没有项目数据，则回到 quickStart
      const requiresProject = ['ontology', 'actionDesigner', 'systemMap', 'aip', 'overview'];
      if (requiresProject.includes(saved) && project.objects.length === 0) {
        return 'quickStart';
      }
      return saved as WorkflowTab;
    }

    // 如果有项目数据，默认到 scouting（老手模式）
    if (project.objects.length > 0) {
      return 'scouting';
    }
  } catch (e) {
    console.error('加载上次标签失败:', e);
  }
  return 'quickStart';
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('cn');
  const [activeTab, setActiveTab] = useState<'quickStart' | 'academy' | 'archetypes' | 'archetypeViewer' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview'>(loadLastActiveTab);
  const [project, setProject] = useState<ProjectState>(loadProjectState);
  const [isDesigning, setIsDesigning] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(loadChatMessages);
  const chatHistoryRef = useRef<ChatMessage[]>(loadChatMessages());

  // AI设置状态
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<Theme>(loadSavedTheme);

  // Archetype状态
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  const t = translations[lang];
  const aiService = useRef(new AIService(aiSettings));

  // 当设置变化时更新AI服务
  useEffect(() => {
    aiService.current.updateSettings(aiSettings);
  }, [aiSettings]);

  // 保存聊天记录到localStorage（仅保存显示内容）
  // 注意：chatHistoryRef 由 ChatInterface 单独维护，包含完整的文件内容
  // 不要在这里覆盖 chatHistoryRef.current，否则会丢失文件内容
  useEffect(() => {
    if (chatMessages.length > 0) {
      try {
        localStorage.setItem('ontology-chat-messages', JSON.stringify(chatMessages));
      } catch (e) {
        console.error('保存聊天记录失败:', e);
      }
    }
  }, [chatMessages]);

  // 保存项目状态到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ontology-project-state', JSON.stringify(project));
    } catch (e) {
      console.error('保存项目状态失败:', e);
    }
  }, [project]);

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

      setProject(prev => ({
        ...prev,
        objects: normalizedObjects,
        links: links,
        integrations: integrations,
        status: 'designing'
      }));
      setActiveTab('ontology');
    } catch (e) {
      console.error("Failed to parse ontology design", e);
      alert(lang === 'cn'
        ? `解析AI结果失败: ${e instanceof Error ? e.message : '未知错误'}。请重试或检查API设置。`
        : `Failed to parse AI result: ${e instanceof Error ? e.message : 'Unknown error'}. Please retry or check API settings.`);
    }
  }, [lang]);

  const triggerAutoDesign = async () => {
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
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'cn' : 'en');
  };

  const handleNewSession = () => {
    if (window.confirm(t.confirmNewSession)) {
      // 清除本地存储
      localStorage.removeItem('ontology-chat-messages');
      localStorage.removeItem('ontology-project-state');
      localStorage.removeItem('ontology-last-tab');
      // 重置状态
      setChatMessages([]);
      setProject({
        industry: '',
        useCase: '',
        objects: [],
        links: [],
        integrations: [],
        status: 'scouting'
      });
      chatHistoryRef.current = [];
      setActiveTab('quickStart');
    }
  };

  // 更新Action的处理函数
  const handleUpdateAction = useCallback((objectId: string, actionIndex: number, updatedAction: any) => {
    setProject(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === objectId
          ? {
              ...obj,
              actions: obj.actions.map((action, idx) =>
                idx === actionIndex ? updatedAction : action
              )
            }
          : obj
      )
    }));
  }, []);

  // Archetype handlers
  const handleSelectArchetype = useCallback((archetypeId: string) => {
    setSelectedArchetypeId(archetypeId);
    setActiveTab('archetypeViewer');
  }, []);

  const handleApplyArchetype = useCallback((archetypeId: string) => {
    if (!window.confirm(t.applyArchetype)) return;

    const archetype = getArchetypeById(archetypeId);
    if (!archetype) return;

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

    setProject(prev => ({
      ...prev,
      industry: archetype.metadata.industry,
      useCase: archetype.metadata.domain,
      objects,
      links,
      integrations,
      status: 'designing'
    }));

    setActiveTab('ontology');
  }, [t.applyArchetype]);

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
            active={activeTab === 'quickStart'}
            onClick={() => setActiveTab('quickStart')}
            icon={<Rocket size={16} />}
            label={t.quickStart}
          />

          {/* Core Workflow Section - For experienced users */}
          <NavSection label={t.sectionCoreWorkflow} />
          <NavItem
            active={activeTab === 'scouting'}
            onClick={() => setActiveTab('scouting')}
            icon={<MessageSquare size={16} />}
            label={t.scouting}
          />
          <NavItem
            active={activeTab === 'workbench'}
            onClick={() => setActiveTab('workbench')}
            icon={<ClipboardList size={16} />}
            label={t.workbench}
          />
          <NavItem
            active={activeTab === 'ontology'}
            onClick={() => setActiveTab('ontology')}
            icon={<Database size={16} />}
            label={t.ontology}
            disabled={project.objects.length === 0}
          />
          <NavItem
            active={activeTab === 'actionDesigner'}
            onClick={() => setActiveTab('actionDesigner')}
            icon={<PenTool size={16} />}
            label={t.actionDesigner}
            disabled={project.objects.length === 0}
          />

          {/* System Design Section */}
          <NavSection label={t.sectionSystemDesign} />
          <NavItem
            active={activeTab === 'systemMap'}
            onClick={() => setActiveTab('systemMap')}
            icon={<Network size={16} />}
            label={t.systemMap}
            disabled={project.objects.length === 0}
          />
          <NavItem
            active={activeTab === 'aip'}
            onClick={() => setActiveTab('aip')}
            icon={<Zap size={16} />}
            label={t.augmentation}
            disabled={project.objects.length === 0}
          />
          <NavItem
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<LayoutDashboard size={16} />}
            label={t.blueprint}
            disabled={project.objects.length === 0}
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

        <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* 主题切换 */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted">{lang === 'cn' ? '主题' : 'Theme'}</span>
            <ThemeSwitcher
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          </div>

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-white/[0.04] transition-colors text-muted"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={14} />
              <span>{lang === 'cn' ? 'AI 设置' : 'AI Settings'}</span>
            </div>
            <span className="text-[10px] truncate max-w-[80px]" style={{ color: 'var(--color-accent)' }}>
              {getCurrentModelName()}
            </span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs hover:bg-white/[0.04] transition-colors text-muted"
            >
              <Languages size={12} />
              {lang === 'en' ? 'EN' : '中文'}
            </button>
            <button
              onClick={handleNewSession}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors text-muted"
            >
              <RotateCcw size={12} />
              {lang === 'cn' ? '重置' : 'Reset'}
            </button>
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: aiSettings.apiKey ? 'var(--color-success)' : 'var(--color-warning)' }}
            />
            <span className="text-[10px] text-muted">
              {aiSettings.apiKey ? t.ready : (lang === 'cn' ? '需配置 API' : 'API Required')}
            </span>
          </div>
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
          {activeTab === 'quickStart' && (
            <QuickStart lang={lang} project={project} onNavigate={setActiveTab} />
          )}
          {activeTab === 'academy' && (
            <Academy lang={lang} />
          )}
          {activeTab === 'archetypes' && (
            <ArchetypeBrowser
              lang={lang}
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
            <ChatInterface
              lang={lang}
              onDesignTrigger={triggerAutoDesign}
              project={project}
              setProject={setProject}
              historyRef={chatHistoryRef}
              aiService={aiService.current}
              hasApiKey={!!aiSettings.apiKey}
              onOpenSettings={() => setShowSettings(true)}
              messages={chatMessages}
              setMessages={setChatMessages}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'workbench' && (
            <StructuringWorkbench
              lang={lang}
              project={project}
              setProject={setProject}
              chatMessages={chatHistoryRef.current}
              onNavigateToOntology={() => setActiveTab('ontology')}
              onNavigateToScouting={() => setActiveTab('scouting')}
              onNavigateToArchetypes={() => setActiveTab('archetypes')}
            />
          )}
          {activeTab === 'ontology' && (
            <OntologyVisualizer lang={lang} objects={project.objects} links={project.links} />
          )}
          {activeTab === 'actionDesigner' && (
            <ActionDesigner lang={lang} objects={project.objects} onUpdateAction={handleUpdateAction} />
          )}
          {activeTab === 'systemMap' && (
            <SystemMap lang={lang} project={project} />
          )}
          {activeTab === 'aip' && (
            <AIPLogicMatrix lang={lang} objects={project.objects} />
          )}
          {activeTab === 'overview' && (
            <ProjectOverview lang={lang} project={project} />
          )}
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

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          lang={lang}
          settings={aiSettings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
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
  disabled?: boolean;
}> = ({ active, onClick, icon, label, disabled }) => (
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
    {label}
  </button>
);

export default App;

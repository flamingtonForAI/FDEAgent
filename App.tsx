
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
import { LayoutDashboard, MessageSquare, Database, Zap, Languages, Network, Settings as SettingsIcon, RotateCcw, PenTool, Sparkles, GraduationCap, ShieldCheck, X } from 'lucide-react';

const translations = {
  en: {
    title: "Ontology Architect",
    subtitle: "Intelligent OS Studio",
    academy: "Learning Center",
    scouting: "Requirement Scouting",
    ontology: "Logical Ontology",
    actionDesigner: "Action Designer",
    systemMap: "Architecture Map",
    augmentation: "AI Augmentation",
    blueprint: "System Blueprint",
    status: "Engine Status",
    ready: "Standby",
    synthesizing: "Synthesizing System Architecture...",
    mapping: "Mapping Entities, Relations & Intelligence",
    newSession: "New Session",
    confirmNewSession: "Start a new session? Current conversation and design will be cleared.",
  },
  cn: {
    title: "本体架构师",
    subtitle: "智能操作系统工作室",
    academy: "学习中心",
    scouting: "需求勘察",
    ontology: "逻辑本体",
    actionDesigner: "Action 设计",
    systemMap: "架构拓扑图",
    augmentation: "AI 能力增强",
    blueprint: "系统蓝图",
    status: "引擎状态",
    ready: "待命",
    synthesizing: "正在合成系统架构...",
    mapping: "映射实体、关系与智能逻辑",
    newSession: "新建会话",
    confirmNewSession: "确定要开始新会话吗？当前的对话和设计将被清除。",
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

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('cn');
  const [activeTab, setActiveTab] = useState<'academy' | 'scouting' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview'>('scouting');
  const [project, setProject] = useState<ProjectState>(loadProjectState);
  const [isDesigning, setIsDesigning] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(loadChatMessages);
  const chatHistoryRef = useRef<ChatMessage[]>(loadChatMessages());

  // AI设置状态
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);

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
      setActiveTab('scouting');
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

  return (
    <div className="flex h-screen bg-black overflow-hidden text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 glass-surface flex flex-col">
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 btn-gradient rounded-lg flex items-center justify-center font-bold text-white text-xs">
              <Sparkles size={14} />
            </div>
            <h1 className="text-white font-medium tracking-tight text-sm">{t.title}</h1>
          </div>
          <p className="text-[10px] text-gray-500 font-mono tracking-wide">{t.subtitle}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Learning Center - Always at top */}
          <NavItem
            active={activeTab === 'academy'}
            onClick={() => setActiveTab('academy')}
            icon={<GraduationCap size={16} />}
            label={t.academy}
          />

          <div className="h-px bg-white/[0.06] my-2" />

          <NavItem
            active={activeTab === 'scouting'}
            onClick={() => setActiveTab('scouting')}
            icon={<MessageSquare size={16} />}
            label={t.scouting}
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
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-white/[0.04] transition-colors text-gray-400"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon size={14} />
              <span>{lang === 'cn' ? 'AI 设置' : 'AI Settings'}</span>
            </div>
            <span className="text-[10px] text-cyan-400 truncate max-w-[80px]">
              {getCurrentModelName()}
            </span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs hover:bg-white/[0.04] transition-colors text-gray-500"
            >
              <Languages size={12} />
              {lang === 'en' ? 'EN' : '中文'}
            </button>
            <button
              onClick={handleNewSession}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors text-gray-500"
            >
              <RotateCcw size={12} />
              {lang === 'cn' ? '重置' : 'Reset'}
            </button>
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
            <div className={`w-1.5 h-1.5 rounded-full ${aiSettings.apiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[10px] text-gray-500">
              {aiSettings.apiKey ? t.ready : (lang === 'cn' ? '需配置 API' : 'API Required')}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0a]">
        {isDesigning && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <h2 className="text-lg font-medium text-white">{t.synthesizing}</h2>
            <p className="text-gray-500 mt-2 text-sm">{t.mapping}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'academy' && (
            <Academy lang={lang} />
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

      {/* Quality Check Floating Button */}
      {project.objects.length > 0 && !showQualityPanel && (
        <button
          onClick={() => setShowQualityPanel(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl btn-gradient shadow-lg shadow-cyan-500/20 flex items-center justify-center hover:scale-105 transition-transform z-40 group"
          title={lang === 'cn' ? '质量检查' : 'Quality Check'}
        >
          <ShieldCheck size={24} className="text-white" />
          <div className="absolute -top-8 right-0 px-2 py-1 bg-gray-900 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {lang === 'cn' ? '质量检查' : 'Quality Check'}
          </div>
        </button>
      )}

      {/* Quality Panel Slide-out */}
      {showQualityPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
        ? 'text-cyan-400 bg-cyan-400/[0.08]'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
    }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400" />
    )}
    {icon}
    {label}
  </button>
);

export default App;

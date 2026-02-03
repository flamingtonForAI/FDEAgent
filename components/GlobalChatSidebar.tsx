/**
 * GlobalChatSidebar - 全局聊天侧边栏
 * 贯穿 1-4 阶段，AI 根据当前阶段提供上下文辅助
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Box,
  Network,
  Zap,
  Lightbulb
} from 'lucide-react';
import { Language, ProjectState, ChatMessage, AISettings } from '../types';
import { AIService } from '../services/aiService';

type PhaseType = 'discover' | 'model' | 'integrate' | 'enhance';

interface GlobalChatSidebarProps {
  lang: Language;
  isOpen: boolean;
  onToggle: () => void;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  aiSettings: AISettings;
  aiService: AIService;
  currentPhase: PhaseType;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const phaseConfig: Record<PhaseType, {
  icon: React.ReactNode;
  color: string;
  capabilities: { en: string[]; cn: string[] };
}> = {
  discover: {
    icon: <Lightbulb size={16} />,
    color: '#3b82f6',
    capabilities: {
      en: ['Guide conversation', 'Extract requirements', 'Synthesize architecture'],
      cn: ['引导对话', '提取需求', '合成架构']
    }
  },
  model: {
    icon: <Box size={16} />,
    color: '#8b5cf6',
    capabilities: {
      en: ['Complete properties', 'Recommend Links', 'Optimize Actions'],
      cn: ['补全属性', '推荐关联', '优化动作定义']
    }
  },
  integrate: {
    icon: <Network size={16} />,
    color: '#10b981',
    capabilities: {
      en: ['Recommend data sources', 'Generate integration plan'],
      cn: ['推荐数据源', '生成集成方案']
    }
  },
  enhance: {
    icon: <Zap size={16} />,
    color: '#f59e0b',
    capabilities: {
      en: ['Explain suggestions', 'Custom analysis', 'Validate requirements'],
      cn: ['解释建议', '定制化分析', '验证需求可行性']
    }
  }
};

const translations = {
  en: {
    title: 'AI Assistant',
    placeholder: 'Ask me anything...',
    phaseHint: 'Current phase capabilities:',
    close: 'Close',
    open: 'Open Assistant',
    thinking: 'Thinking...',
    error: 'Failed to get response',
    discover: 'Discover',
    model: 'Model',
    integrate: 'Integrate',
    enhance: 'Enhance'
  },
  cn: {
    title: 'AI 助手',
    placeholder: '有什么可以帮您...',
    phaseHint: '当前阶段可用能力：',
    close: '关闭',
    open: '打开助手',
    thinking: '思考中...',
    error: '获取回复失败',
    discover: '发现',
    model: '建模',
    integrate: '集成',
    enhance: '智能化'
  }
};

// 根据阶段生成上下文提示
function getPhaseContextPrompt(
  phase: PhaseType,
  project: ProjectState,
  lang: Language
): string {
  const isEn = lang === 'en';

  const contextHeader = isEn
    ? `You are now in the "${phase}" phase of Ontology design.`
    : `你现在处于 Ontology 设计的"${phase === 'discover' ? '发现' : phase === 'model' ? '建模' : phase === 'integrate' ? '集成' : '智能化'}"阶段。`;

  const projectContext = isEn
    ? `Current project has ${project.objects.length} objects, ${project.links.length} links, ${project.objects.reduce((sum, o) => sum + o.actions.length, 0)} actions.`
    : `当前项目有 ${project.objects.length} 个对象，${project.links.length} 个关联，${project.objects.reduce((sum, o) => sum + o.actions.length, 0)} 个动作。`;

  let phaseGuidance = '';

  switch (phase) {
    case 'discover':
      phaseGuidance = isEn
        ? 'Help the user discover business requirements, extract Objects/Actions/Links from their description.'
        : '帮助用户发现业务需求，从描述中提取 Objects/Actions/Links。';
      break;
    case 'model':
      phaseGuidance = isEn
        ? 'Help the user refine the Ontology model. You can suggest properties for Objects, recommend Links between Objects, or help define Action specifications. When the user asks to add/modify something, output the specific changes in a structured way.'
        : '帮助用户完善 Ontology 模型。你可以为 Object 推荐属性、推荐 Object 之间的关联、或帮助定义 Action 规范。当用户要求添加/修改时，以结构化方式输出具体变更。';
      break;
    case 'integrate':
      phaseGuidance = isEn
        ? 'Help the user plan system integration. Recommend data sources, suggest integration mechanisms (API, Webhook, Batch, etc.).'
        : '帮助用户规划系统集成。推荐数据源、建议集成机制（API、Webhook、批处理等）。';
      break;
    case 'enhance':
      phaseGuidance = isEn
        ? 'Help the user understand AI enhancement opportunities. Explain suggestions, validate if their AI requirements can be implemented with current Ontology, identify gaps.'
        : '帮助用户理解 AI 增强机会。解释建议、验证用户的智能化需求是否可以基于当前 Ontology 实现、识别缺口。';
      break;
  }

  // 添加智能化需求上下文
  const aiReqContext = project.aiRequirements && project.aiRequirements.length > 0
    ? (isEn
      ? `\n\nUser's AI requirements from earlier conversations:\n${project.aiRequirements.map(r => `- ${r.description} (${r.status})`).join('\n')}`
      : `\n\n用户之前提出的智能化需求：\n${project.aiRequirements.map(r => `- ${r.description} (${r.status === 'identified' ? '已识别' : r.status === 'validated' ? '已验证' : r.status === 'implemented' ? '已实现' : '被阻塞'})`).join('\n')}`)
    : '';

  return `${contextHeader}\n\n${projectContext}\n\n${phaseGuidance}${aiReqContext}`;
}

const GlobalChatSidebar: React.FC<GlobalChatSidebarProps> = ({
  lang,
  isOpen,
  onToggle,
  project,
  setProject,
  aiSettings,
  aiService,
  currentPhase,
  chatMessages,
  setChatMessages
}) => {
  const t = translations[lang];
  const config = phaseConfig[currentPhase];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // 添加用户消息
    const newUserMsg: ChatMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMsg]);

    setIsLoading(true);

    try {
      // 构建带阶段上下文的历史
      const contextPrompt = getPhaseContextPrompt(currentPhase, project, lang);
      const historyWithContext: ChatMessage[] = [
        { role: 'user', content: contextPrompt },
        { role: 'assistant', content: lang === 'cn' ? '我理解了当前上下文，请问有什么可以帮您？' : 'I understand the current context. How can I help you?' },
        ...chatMessages,
        newUserMsg
      ];

      const response = await aiService.chat(
        historyWithContext.slice(0, -1), // 历史不包含最后一条
        userMessage
      );

      // 添加 AI 回复
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // 检查是否包含智能化需求（简单启发式检测）
      const aiKeywords = ['自动', '智能', 'AI', '预测', '推荐', '自动化', 'auto', 'intelligent', 'predict', 'recommend'];
      const hasAIRequirement = aiKeywords.some(kw => userMessage.toLowerCase().includes(kw.toLowerCase()));

      if (hasAIRequirement && currentPhase === 'discover') {
        // 提取并保存智能化需求
        const newRequirement = {
          id: `req-${Date.now()}`,
          description: userMessage,
          extractedFrom: userMessage,
          status: 'identified' as const
        };

        setProject(prev => ({
          ...prev,
          aiRequirements: [...(prev.aiRequirements || []), newRequirement]
        }));
      }

    } catch (err) {
      setError(t.error);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, chatMessages, currentPhase, project, lang, aiService, setChatMessages, setProject, t.error]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 折叠状态 - 只显示一个按钮
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-24 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105"
        style={{ backgroundColor: config.color }}
        title={t.open}
      >
        <MessageSquare size={20} className="text-white" />
      </button>
    );
  }

  return (
    <div
      className="fixed right-0 top-0 h-full w-96 flex flex-col z-50 shadow-2xl"
      style={{ backgroundColor: 'var(--color-bg-elevated)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Sparkles size={18} style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </h3>
            <div className="flex items-center gap-1 text-xs" style={{ color: config.color }}>
              {config.icon}
              <span>{t[currentPhase]}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Phase Capabilities */}
      <div
        className="px-4 py-2 text-xs"
        style={{ backgroundColor: `${config.color}08`, borderBottom: '1px solid var(--color-border)' }}
      >
        <div style={{ color: 'var(--color-text-muted)' }}>{t.phaseHint}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {config.capabilities[lang].map((cap, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {lang === 'cn' ? '有什么可以帮您的？' : 'How can I help you?'}
            </p>
          </div>
        )}

        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
              }`}
              style={{
                backgroundColor: msg.role === 'user' ? config.color : 'var(--color-bg-surface)',
                color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)'
              }}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-xl rounded-bl-sm text-sm flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
            >
              <Loader2 size={14} className="animate-spin" />
              {t.thinking}
            </div>
          </div>
        )}

        {error && (
          <div
            className="px-3 py-2 rounded-lg text-sm text-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-end gap-2 p-2 rounded-xl"
          style={{ backgroundColor: 'var(--color-bg-surface)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{
              color: 'var(--color-text-primary)',
              minHeight: '24px',
              maxHeight: '120px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg transition-all disabled:opacity-50"
            style={{
              backgroundColor: input.trim() ? config.color : 'transparent',
              color: input.trim() ? 'white' : 'var(--color-text-muted)'
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChatSidebar;

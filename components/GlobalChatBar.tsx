/**
 * GlobalChatBar - 全局底部聊天输入栏
 * 固定在底部，所有阶段共用，根据当前阶段显示不同提示词
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  Paperclip,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { Language, ProjectState, ChatMessage, AISettings } from '../types';
import { AIService } from '../services/aiService';

type PhaseType = 'discover' | 'model' | 'integrate' | 'enhance';

interface GlobalChatBarProps {
  lang: Language;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  aiSettings: AISettings;
  aiService: AIService;
  currentPhase: PhaseType;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  // 是否展开消息面板
  isExpanded: boolean;
  onToggleExpand: () => void;
  // 是否在主内容区域显示消息（Phase 1）
  messagesInMainArea?: boolean;
  // 加载状态回调
  onLoadingChange?: (loading: boolean) => void;
  // 历史记录引用（用于 AI 设计）
  historyRef?: React.MutableRefObject<ChatMessage[]>;
}

// 根据阶段的占位符
const phasePlaceholders: Record<PhaseType, { en: string; cn: string }> = {
  discover: {
    en: 'Describe your business challenges, existing systems or requirements...',
    cn: '描述您的业务挑战、现有系统或需求...'
  },
  model: {
    en: 'Ask me to add properties, recommend links, or optimize actions...',
    cn: '让我帮您补全属性、推荐关联、或优化动作定义...'
  },
  integrate: {
    en: 'Ask about data sources, integration mechanisms, or export options...',
    cn: '询问数据源、集成机制、或导出选项...'
  },
  enhance: {
    en: 'Ask me to explain suggestions, analyze AI opportunities, or validate requirements...',
    cn: '让我解释建议、分析 AI 机会、或验证需求可行性...'
  }
};

// 阶段颜色
const phaseColors: Record<PhaseType, string> = {
  discover: '#3b82f6',
  model: '#8b5cf6',
  integrate: '#10b981',
  enhance: '#f59e0b'
};

// 根据阶段生成上下文提示
function getPhaseContextPrompt(
  phase: PhaseType,
  project: ProjectState,
  lang: Language
): string {
  const isEn = lang === 'en';

  const phaseNames = {
    discover: isEn ? 'Discover' : '发现',
    model: isEn ? 'Model' : '建模',
    integrate: isEn ? 'Integrate' : '集成',
    enhance: isEn ? 'AI Enhancement' : '智能化'
  };

  // 完整的项目状态
  const objectsSummary = project.objects.map(o =>
    `- ${o.name}: ${o.properties.length} properties, ${o.actions.length} actions`
  ).join('\n');

  const linksSummary = project.links.map(l =>
    `- ${l.source} --[${l.label}]--> ${l.target}`
  ).join('\n');

  const systemPrompt = isEn ? `
You are an Ontology Architect assistant. You help users design intelligent operational systems using the Ontology-First methodology.

## Current Context
- **Current Phase**: ${phaseNames[phase]}
- **Project Status**: ${project.objects.length} objects, ${project.links.length} links, ${project.objects.reduce((sum, o) => sum + o.actions.length, 0)} actions

### Objects in Project:
${objectsSummary || '(none yet)'}

### Links in Project:
${linksSummary || '(none yet)'}

## Your Capabilities Across All Phases

You can help users with ANY task regardless of current phase. When the user's request is better handled in a different phase, suggest navigation:

1. **Discover Phase** - For: gathering requirements, understanding business needs, extracting entities
   - Suggest: "This is a discovery task. You might want to switch to the **Discover** tab to explore this further."

2. **Model Phase** - For: adding/editing Objects, Properties, Links, Actions
   - Suggest: "To add this property, go to the **Model** tab → click on the Object → Edit"
   - Or provide specific changes: "I suggest adding property 'status' (type: string) to the Order object"

3. **Integrate Phase** - For: data sources, API connections, system integrations
   - Suggest: "To configure this integration, check the **Integrate** tab"

4. **Enhance Phase** - For: AI capabilities, automation, smart properties
   - Suggest: "This sounds like an AI enhancement. Check the **AI Enhancement** tab to analyze opportunities"

## Response Guidelines
1. Always understand the user's intent first
2. If the task can be done in current phase, provide actionable suggestions
3. If the task belongs to another phase, clearly guide the user with navigation hints
4. When suggesting Ontology changes, be specific (object name, property name, type, etc.)
5. Reference the project context when making suggestions
` : `
你是一位 Ontology 架构师助手。你帮助用户使用 Ontology-First 方法论设计智能运营系统。

## 当前上下文
- **当前阶段**: ${phaseNames[phase]}
- **项目状态**: ${project.objects.length} 个对象, ${project.links.length} 个关联, ${project.objects.reduce((sum, o) => sum + o.actions.length, 0)} 个动作

### 项目中的对象:
${objectsSummary || '(暂无)'}

### 项目中的关联:
${linksSummary || '(暂无)'}

## 跨阶段能力

无论当前在哪个阶段，你都可以帮助用户处理任何任务。当用户的请求更适合在其他阶段处理时，建议导航：

1. **发现阶段** - 适用于：收集需求、理解业务、提取实体
   - 建议："这是一个发现类任务。您可以切换到**发现**标签页进一步探索。"

2. **建模阶段** - 适用于：添加/编辑对象、属性、关联、动作
   - 建议："要添加这个属性，请到**建模**标签页 → 点击对象 → 编辑"
   - 或提供具体变更："我建议给订单对象添加属性'status'（类型: string）"

3. **集成阶段** - 适用于：数据源、API 连接、系统集成
   - 建议："要配置这个集成，请查看**集成**标签页"

4. **智能化阶段** - 适用于：AI 能力、自动化、智能属性
   - 建议："这听起来是 AI 增强需求。请查看**智能化**标签页分析机会"

## 回复准则
1. 首先理解用户的意图
2. 如果任务可以在当前阶段完成，提供可操作的建议
3. 如果任务属于其他阶段，清晰地用导航提示引导用户
4. 建议 Ontology 变更时要具体（对象名、属性名、类型等）
5. 在建议时引用项目上下文
`;

  // 添加智能化需求上下文
  const aiReqContext = project.aiRequirements && project.aiRequirements.length > 0
    ? (isEn
      ? `\n\n## User's AI Requirements (from earlier conversations):\n${project.aiRequirements.map(r => `- ${r.description} (${r.status})`).join('\n')}`
      : `\n\n## 用户的智能化需求（来自之前的对话）:\n${project.aiRequirements.map(r => `- ${r.description} (${r.status === 'identified' ? '已识别' : r.status === 'validated' ? '已验证' : r.status === 'implemented' ? '已实现' : '被阻塞'})`).join('\n')}`)
    : '';

  return systemPrompt + aiReqContext;
}

const GlobalChatBar: React.FC<GlobalChatBarProps> = ({
  lang,
  project,
  setProject,
  aiSettings,
  aiService,
  currentPhase,
  chatMessages,
  setChatMessages,
  isExpanded,
  onToggleExpand,
  messagesInMainArea = false,
  onLoadingChange,
  historyRef
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const placeholder = phasePlaceholders[currentPhase][lang];
  const phaseColor = phaseColors[currentPhase];

  // 滚动到底部
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isExpanded]);

  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // 添加用户消息
    const newUserMsg: ChatMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMsg]);

    // 同步到 historyRef（用于 AI 设计）
    if (historyRef) {
      historyRef.current = [...historyRef.current, newUserMsg];
    }

    // 自动展开面板 (仅当消息不在主内容区域时)
    if (!isExpanded && !messagesInMainArea) {
      onToggleExpand();
    }

    setIsLoading(true);
    onLoadingChange?.(true);

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
        historyWithContext.slice(0, -1),
        userMessage
      );

      // 添加 AI 回复
      const aiMsg: ChatMessage = { role: 'assistant', content: response };
      setChatMessages(prev => [...prev, aiMsg]);

      // 同步到 historyRef（用于 AI 设计）
      if (historyRef) {
        historyRef.current = [...historyRef.current, aiMsg];
      }

      // 检查是否包含智能化需求
      const aiKeywords = ['自动', '智能', 'AI', '预测', '推荐', '自动化', 'auto', 'intelligent', 'predict', 'recommend'];
      const hasAIRequirement = aiKeywords.some(kw => userMessage.toLowerCase().includes(kw.toLowerCase()));

      if (hasAIRequirement) {
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
      setError(lang === 'cn' ? '获取回复失败' : 'Failed to get response');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }, [input, isLoading, chatMessages, currentPhase, project, lang, aiService, setChatMessages, setProject, isExpanded, onToggleExpand, messagesInMainArea, onLoadingChange, historyRef]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 是否显示展开的消息面板
  const showExpandedPanel = isExpanded && !messagesInMainArea;

  return (
    <>
      {/* 展开的消息面板 (当消息不在主内容区域时显示) */}
      {showExpandedPanel && (
        <div
          className="fixed bottom-20 left-64 right-0 z-40 flex flex-col"
          style={{
            height: '50vh',
            backgroundColor: 'var(--color-bg-elevated)',
            borderTop: '1px solid var(--color-border)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {/* 面板头部 */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: phaseColor }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {lang === 'cn' ? '对话历史' : 'Chat History'}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                ({chatMessages.length})
              </span>
            </div>
            <button
              onClick={onToggleExpand}
              className="p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {lang === 'cn' ? '开始对话吧' : 'Start a conversation'}
                </p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={{
                      backgroundColor: msg.role === 'user' ? phaseColor : 'var(--color-bg-surface)',
                      color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)'
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  {lang === 'cn' ? '思考中...' : 'Thinking...'}
                </div>
              </div>
            )}

            {error && (
              <div
                className="px-4 py-2 rounded-lg text-sm text-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* 底部输入栏 - 固定位置 */}
      <div
        className="fixed bottom-0 left-64 right-0 z-50 px-6 py-3"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)'
        }}
      >
        <div
          className="flex items-end gap-3 max-w-4xl mx-auto px-4 py-2 rounded-2xl"
          style={{ backgroundColor: 'var(--color-bg-surface)' }}
        >
          {/* 附件按钮 */}
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Paperclip size={18} />
          </button>

          {/* 输入框 */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-2"
            style={{
              color: 'var(--color-text-primary)',
              minHeight: '24px',
              maxHeight: '120px'
            }}
          />

          {/* 展开/收起按钮 (仅当消息不在主内容区域时显示) */}
          {chatMessages.length > 0 && !messagesInMainArea && (
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              title={isExpanded ? (lang === 'cn' ? '收起' : 'Collapse') : (lang === 'cn' ? '展开历史' : 'Expand')}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          )}

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl transition-all disabled:opacity-50"
            style={{
              backgroundColor: input.trim() ? phaseColor : 'var(--color-bg-hover)',
              color: input.trim() ? 'white' : 'var(--color-text-muted)'
            }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {/* 阶段提示 */}
        <div className="max-w-4xl mx-auto mt-1 px-4">
          <div
            className="flex items-center gap-1 text-[10px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: phaseColor }}
            />
            <span>
              {currentPhase === 'discover' && (lang === 'cn' ? '发现阶段：引导对话、提取需求' : 'Discover: Guide conversation, extract requirements')}
              {currentPhase === 'model' && (lang === 'cn' ? '建模阶段：补全属性、推荐关联' : 'Model: Complete properties, recommend links')}
              {currentPhase === 'integrate' && (lang === 'cn' ? '集成阶段：推荐数据源、生成方案' : 'Integrate: Recommend sources, generate plans')}
              {currentPhase === 'enhance' && (lang === 'cn' ? '智能化阶段：分析机会、验证需求' : 'Enhance: Analyze opportunities, validate requirements')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalChatBar;

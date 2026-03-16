/**
 * GlobalChatBar - 全局底部聊天输入栏
 * 固定在底部，所有阶段共用，根据当前阶段显示不同提示词
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  FolderPlus,
  AlertTriangle
} from 'lucide-react';
import { Language, ProjectState, ChatMessage, AISettings, AIProvider } from '../types';
import { FileUploadButton, UploadedFile, getProviderCompatibility } from './FileUpload';
import { AIService } from '../services/aiService';
import MarkdownRenderer from './MarkdownRenderer';
import { useAppTranslation } from '../hooks/useAppTranslation';

type PhaseType = 'discover' | 'model' | 'integrate' | 'enhance' | 'deliver';

interface GlobalChatBarProps {
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
  // 当前活跃项目 ID - 用于检查是否有项目
  activeProjectId?: string | null;
  // 导航到项目页面的回调
  onNavigateToProjects?: () => void;
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
  },
  deliver: {
    en: 'Ask about deliverables, export options, or quality checks...',
    cn: '询问交付物、导出选项、或质量检查...'
  }
};

// 阶段颜色
const phaseColors: Record<PhaseType, string> = {
  discover: '#3b82f6',
  model: '#8b5cf6',
  integrate: '#10b981',
  enhance: '#f59e0b',
  deliver: '#ef4444'
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
    enhance: isEn ? 'AI Enhancement' : '智能化',
    deliver: isEn ? 'Deliver' : '交付'
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
  historyRef,
  activeProjectId,
  onNavigateToProjects
}) => {
  const { t, lt, lang, i18nLang } = useAppTranslation('discovery');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if API key is configured
  const hasApiKey = !!(aiSettings.apiKeys ? aiSettings.apiKeys[aiSettings.provider] : aiSettings.apiKey);

  // Check if there's an active project
  const hasProject = !!activeProjectId;

  const placeholder = lt(phasePlaceholders[currentPhase]);
  const phaseColor = phaseColors[currentPhase];
  const blockedFiles = uploadedFiles.filter((file) =>
    getProviderCompatibility(
      file.mimeType,
      aiSettings.provider as AIProvider,
      aiSettings.model,
      undefined,
      file.name,
      lang
    ).blockSend
  );
  const hasBlockedFiles = blockedFiles.length > 0;
  const sendBlockedReason = hasBlockedFiles
    ? t('globalChatBar.errorUnsupportedFiles', { files: blockedFiles.map((f) => f.name).join(', ') })
    : null;

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
    // Allow send if there's input OR files
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    // Prepare message text
    let userMessage = input.trim();

    if (uploadedFiles.length > 0) {
      const blockedFiles = uploadedFiles.filter(file => {
        const compat = getProviderCompatibility(
          file.mimeType,
          aiSettings.provider as AIProvider,
          aiSettings.model,
          undefined,
          file.name,
          lang
        );
        return compat.blockSend;
      });

      if (blockedFiles.length > 0) {
        const fileNames = blockedFiles.map(f => f.name).join(', ');
        setError(t('globalChatBar.errorUnsupportedFileType', { files: fileNames }));
        return;
      }
    }

    // If no text input but has files, add a default instruction
    if (!userMessage && uploadedFiles.length > 0) {
      userMessage = t('globalChatBar.defaultAnalyzePrompt');
    }

    // Store display content (without full file content for UI)
    const currentFiles = [...uploadedFiles];
    const displayContent = currentFiles.length > 0
      ? `${input.trim() || t('globalChatBar.analyzeDocument')}\n\n📎 ${currentFiles.map(f => f.name).join(', ')}`
      : input.trim();

    // Store full content for AI context (include text file contents)
    let aiContent = userMessage;
    if (currentFiles.length > 0) {
      const textFileContents = currentFiles
        .filter(f => !f.isBase64)
        .map(f => `\n--- ${f.name} ---\n${f.content}\n--- End ---`)
        .join('');
      if (textFileContents) {
        aiContent += textFileContents;
      }
    }

    setInput('');
    setUploadedFiles([]); // Clear files after sending
    setError(null);

    // 添加用户消息（UI 显示版本）
    const newUserMsg: ChatMessage = { role: 'user', content: displayContent };
    setChatMessages(prev => [...prev, newUserMsg]);

    // 同步到 historyRef（用于 AI 设计）- 使用完整内容
    if (historyRef) {
      historyRef.current = [...historyRef.current, { role: 'user', content: aiContent }];
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
        { role: 'assistant', content: t('globalChatBar.contextAck') },
        ...chatMessages,
        { role: 'user', content: aiContent }
      ];

      // Convert uploaded files to FileAttachment format for AI service
      const fileAttachments = currentFiles.map(f => ({
        name: f.name,
        content: f.content,
        mimeType: f.mimeType,
        isBase64: f.isBase64,
        extractedText: f.extractedText,
      }));

      // Use multimodal chat if there are files
      const response = currentFiles.length > 0
        ? await aiService.chatWithFiles(historyWithContext.slice(0, -1), userMessage, fileAttachments, { lang: i18nLang })
        : await aiService.chat(historyWithContext.slice(0, -1), userMessage, { lang: i18nLang });

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
      const details = err instanceof Error ? err.message : String(err);
      setError(t('globalChatBar.errorGetResponse', { details }));
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }, [input, uploadedFiles, isLoading, chatMessages, currentPhase, project, lang, aiService, setChatMessages, setProject, isExpanded, onToggleExpand, messagesInMainArea, onLoadingChange, historyRef]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理粘贴事件（支持截图、图片、文件）
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || !hasApiKey) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if it's a file (image or other)
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (!file) continue;

        const mimeType = file.type || 'application/octet-stream';
        const compat = getProviderCompatibility(
          mimeType,
          aiSettings.provider as AIProvider,
          aiSettings.model,
          undefined,
          file.name,
          lang
        );
        if (compat.blockSend) {
          setError(t('globalChatBar.errorPasteUnsupported', { file: file.name }));
          continue;
        }

        // Check size (max 10MB)
        if (file.size > 10 * 1024 * 1024) continue;

        // Check if we have room (max 3 files)
        if (uploadedFiles.length + newFiles.length >= 3) break;

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isImage = file.type.startsWith('image/');
        const isText = file.type.startsWith('text/') || ['json', 'md', 'txt', 'csv'].includes(ext);

        // Read file
        const fileData = await new Promise<UploadedFile | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (isText) {
              const content = ev.target?.result as string;
              resolve({
                id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: file.name || `pasted_${Date.now()}.txt`,
                type: file.type || 'text/plain',
                size: file.size,
                content,
                preview: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
                isBase64: false,
                mimeType: file.type || 'text/plain',
              });
            } else {
              const base64 = (ev.target?.result as string).split(',')[1];
              resolve({
                id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: file.name || `pasted_image_${Date.now()}.${isImage ? 'png' : ext}`,
                type: file.type,
                size: file.size,
                content: base64,
                preview: `[${isImage ? t('globalChatBar.image') : file.type}]`,
                isBase64: true,
                mimeType,
              });
            }
          };
          reader.onerror = () => resolve(null);

          if (isText) {
            reader.readAsText(file);
          } else {
            reader.readAsDataURL(file);
          }
        });

        if (fileData) {
          newFiles.push(fileData);
        }
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 3));
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
                {t('globalChatBar.chatHistory')}
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
                  {t('globalChatBar.startConversation')}
                </p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                msg.role === 'system' ? (
                  // System message - context boundary
                  <div key={index} className="flex justify-center my-4">
                    <div
                      className="max-w-[85%] px-4 py-3 rounded-lg text-xs border"
                      style={{
                        backgroundColor: 'var(--color-bg-hover)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      <p className="whitespace-pre-wrap text-center">{msg.content}</p>
                    </div>
                  </div>
                ) : (
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
                      {msg.role === 'assistant'
                        ? <MarkdownRenderer content={msg.content} />
                        : <p className="whitespace-pre-wrap">{msg.content}</p>
                      }
                    </div>
                  </div>
                )
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  {t('globalChatBar.thinking')}
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
        {/* 没有项目时显示提示 */}
        {!hasProject ? (
          <div
            className="flex items-center justify-center gap-3 max-w-4xl mx-auto px-4 py-3 rounded-2xl"
            style={{ backgroundColor: 'var(--color-bg-surface)' }}
          >
            <FolderPlus size={20} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('globalChatBar.noProjectHint')}
            </span>
            {onNavigateToProjects && (
              <button
                onClick={onNavigateToProjects}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white'
                }}
              >
                {t('globalChatBar.createProject')}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="max-w-4xl mx-auto mb-2 space-y-1">
                {uploadedFiles.map(file => (
                  <div key={file.id}>
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <span className="text-muted">📎</span>
                      <span className="flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{file.name}</span>
                      <span className="text-muted">
                        {file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                      </span>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="p-0.5 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {(() => {
                      const compat = getProviderCompatibility(
                        file.mimeType,
                        aiSettings.provider as AIProvider,
                        aiSettings.model,
                        undefined,
                        file.name,
                        lang
                      );
                      if (!compat.warning) return null;
                      return (
                        <div className="mt-1 px-3 py-1 rounded text-xs flex items-center gap-1.5" style={{ color: 'var(--color-warning)' }}>
                          <AlertTriangle size={12} />
                          <span>{compat.warning}</span>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}

            <div
              className="flex items-end gap-3 max-w-4xl mx-auto px-4 py-2 rounded-2xl"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}
            >
              {/* 附件按钮 */}
              <FileUploadButton
                lang={lang}
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                disabled={!hasApiKey || isLoading}
                aiProvider={aiSettings.provider as AIProvider}
                aiModel={aiSettings.model}
              />

              {/* 输入框 */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
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
                  title={isExpanded ? t('globalChatBar.collapse') : t('globalChatBar.expandHistory')}
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              )}

              {/* 发送按钮 */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading || !hasApiKey || hasBlockedFiles}
                className="p-2 rounded-xl transition-all disabled:opacity-50"
                title={sendBlockedReason || undefined}
                style={{
                  backgroundColor: (input.trim() || uploadedFiles.length > 0) ? phaseColor : 'var(--color-bg-hover)',
                  color: (input.trim() || uploadedFiles.length > 0) ? 'white' : 'var(--color-text-muted)'
                }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>

            {(error || sendBlockedReason) && (
              <div className="max-w-4xl mx-auto mt-2 px-4 py-2 rounded-lg text-xs flex items-center gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <AlertTriangle size={12} />
                <span>{sendBlockedReason || error}</span>
              </div>
            )}

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
                  {currentPhase === 'discover' && t('globalChatBar.phaseDiscover')}
                  {currentPhase === 'model' && t('globalChatBar.phaseModel')}
                  {currentPhase === 'integrate' && t('globalChatBar.phaseIntegrate')}
                  {currentPhase === 'enhance' && t('globalChatBar.phaseEnhance')}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GlobalChatBar;


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AIService } from '../services/aiService';
import { ChatMessage, ProjectState, Language } from '../types';
import { OntologyCase } from '../types/case';
import { Send, Terminal, Sparkles, Settings, AlertCircle, CheckCircle, X, Loader2, Scan, PanelRightClose, PanelRightOpen, Lightbulb, FileText, FileSpreadsheet, FileImage, Image, Presentation, File } from 'lucide-react';
import QuickInputPanel from './QuickInputPanel';
import NounVerbPanel from './NounVerbPanel';
import CaseRecommendPanel from './CaseRecommendPanel';
import CaseBrowser from './CaseBrowser';
import SmartTips from './SmartTips';
import { FileUploadButton, UploadedFile } from './FileUpload';
import ReadinessPanel from './ReadinessPanel';
import { checkReadiness } from '../lib/readinessChecker';

interface ExtractedNoun {
  name: string;
  description: string;
  confidence: number;
}

interface ExtractedVerb {
  name: string;
  targetObject?: string;
  description: string;
  confidence: number;
}

interface ChatInterfaceProps {
  lang: Language;
  onDesignTrigger: () => void;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  historyRef: React.MutableRefObject<ChatMessage[]>;
  aiService: AIService;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const translations = {
  en: {
    welcome: "Welcome. I'm your Systems Architect. To design your Intelligent OS, I'll need to understand your core business entities, current data systems (ERPs, CRMs), and where your biggest manual bottlenecks lie. Shall we start with the main process you want to optimize?",
    terminal: "Design_Session_v1.2",
    generate: "Synthesize Architecture",
    placeholder: "Describe your operational challenges...",
    error: "Architect connection failed. Please check the network environment.",
    validating: "Analyzing conversation...",
    validationFailed: "More Information Needed",
    identifiedObjects: "Identified Objects",
    identifiedActions: "Identified Actions",
    missingInfo: "Missing Information",
    continueChat: "Continue Conversation",
    proceedAnyway: "Generate Anyway",
    readyToGenerate: "Ready to Generate",
    none: "None identified yet",
    extractPanel: "Extract Elements",
    hidePanel: "Hide Panel",
    extracting: "Extracting...",
    addedObject: "Object added",
    addedAction: "Action added",
    caseRecommend: "Case Hints",
    analyzingCases: "Analyzing...",
    fileAttached: "File attached",
    filesAttached: "files attached",
    analyzeDocument: "Analyzing document"
  },
  cn: {
    welcome: "您好。我是您的系统架构师。为了设计您的智能操作系统，我需要了解您的核心业务实体、现有的数据系统（如 ERP、CRM）以及目前最大的业务瓶颈。我们先从您最想优化的核心流程开始，好吗？",
    terminal: "设计会话_v1.2",
    generate: "合成架构方案",
    placeholder: "描述您的业务挑战、现有系统或需求...",
    error: "架构师连接失败。请检查网络环境或 API 配置。",
    validating: "正在分析对话内容...",
    validationFailed: "信息不足",
    identifiedObjects: "已识别的对象",
    identifiedActions: "已识别的动作",
    missingInfo: "缺失的信息",
    continueChat: "继续对话",
    proceedAnyway: "仍然生成",
    readyToGenerate: "可以生成",
    none: "暂未识别",
    extractPanel: "提取元素",
    hidePanel: "隐藏面板",
    extracting: "正在提取...",
    addedObject: "已添加对象",
    addedAction: "已添加动作",
    caseRecommend: "案例提示",
    analyzingCases: "分析中...",
    fileAttached: "已附加文件",
    filesAttached: "个文件已附加",
    analyzeDocument: "分析文档中"
  }
};

interface ValidationResult {
  ready: boolean;
  missing: string[];
  identified: { objects: string[]; actions: string[] };
  suggestion: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  lang,
  onDesignTrigger,
  project,
  setProject,
  historyRef,
  aiService,
  hasApiKey,
  onOpenSettings,
  messages,
  setMessages
}) => {
  const t = translations[lang];
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Noun/Verb Extraction states
  const [showExtractPanel, setShowExtractPanel] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedNouns, setExtractedNouns] = useState<ExtractedNoun[]>([]);
  const [extractedVerbs, setExtractedVerbs] = useState<ExtractedVerb[]>([]);

  // Case recommendation states
  const [showCasePanel, setShowCasePanel] = useState(false);
  const [isAnalyzingCases, setIsAnalyzingCases] = useState(false);
  const [recommendedCaseIds, setRecommendedCaseIds] = useState<string[]>([]);
  const [caseKeywords, setCaseKeywords] = useState<string[]>([]);
  const [showCaseBrowser, setShowCaseBrowser] = useState(false);
  const [selectedCaseForBrowser, setSelectedCaseForBrowser] = useState<OntologyCase | null>(null);

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Handle paste event for images/files
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

        // Check size (max 10MB)
        if (file.size > 10 * 1024 * 1024) continue;

        // Check if we have room
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
                preview: `[${isImage ? (lang === 'cn' ? '图片' : 'Image') : file.type}]`,
                isBase64: true,
                mimeType: file.type || 'application/octet-stream',
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

  // 初始化欢迎消息（仅当messages为空时）
  useEffect(() => {
    if (messages.length === 0) {
      const initialMsg: ChatMessage = { role: 'assistant', content: t.welcome };
      setMessages([initialMsg]);
      historyRef.current = [initialMsg];
    }
  }, []);

  // 语言切换时更新欢迎消息
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const initialMsg: ChatMessage = { role: 'assistant', content: t.welcome };
      setMessages([initialMsg]);
      historyRef.current = [initialMsg];
    }
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // Analyze conversation and recommend cases
  // Use historyRef which contains full content (including file contents)
  const analyzeCases = async () => {
    if (!hasApiKey || historyRef.current.length < 2) return;

    setIsAnalyzingCases(true);
    try {
      const result = await aiService.recommendCases(historyRef.current);

      if (result.recommendedCaseIds.length > 0) {
        setRecommendedCaseIds(result.recommendedCaseIds);
        setCaseKeywords(result.keywords);
        // Auto-show panel if we have recommendations
        if (result.confidence > 0.5) {
          setShowCasePanel(true);
        }
      }
    } catch (error) {
      console.error('Case analysis failed:', error);
    } finally {
      setIsAnalyzingCases(false);
    }
  };

  // Extract nouns and verbs from the conversation
  // Use historyRef which contains full content (including file contents)
  const extractFromConversation = async () => {
    if (!hasApiKey || historyRef.current.length < 2) return;

    // Combine all user messages for extraction (use historyRef for full content)
    const userText = historyRef.current
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');

    if (!userText.trim()) return;

    setIsExtracting(true);
    try {
      const result = await aiService.extractNounsVerbs(userText);

      // Merge with existing, avoiding duplicates
      setExtractedNouns(prev => {
        const existingNames = new Set(prev.map(n => n.name.toLowerCase()));
        const newNouns = result.nouns.filter(n => !existingNames.has(n.name.toLowerCase()));
        return [...prev, ...newNouns];
      });

      setExtractedVerbs(prev => {
        const existingNames = new Set(prev.map(v => v.name.toLowerCase()));
        const newVerbs = result.verbs.filter(v => !existingNames.has(v.name.toLowerCase()));
        return [...prev, ...newVerbs];
      });

      // Auto-show panel if we found something
      if (result.nouns.length > 0 || result.verbs.length > 0) {
        setShowExtractPanel(true);
      }
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle adding a noun to Ontology
  const handleAddNoun = (noun: ExtractedNoun) => {
    // Add as a new Object to project
    const newObject = {
      id: `obj_${Date.now()}`,
      name: noun.name,
      description: noun.description,
      properties: [],
      actions: [],
      aiFeatures: []
    };

    setProject(prev => ({
      ...prev,
      objects: [...prev.objects, newObject]
    }));

    // Remove from extracted list
    setExtractedNouns(prev => prev.filter(n => n.name !== noun.name));
  };

  // Handle adding a verb to Ontology
  const handleAddVerb = (verb: ExtractedVerb) => {
    // Find target object or use first object
    const targetObjId = project.objects.find(o =>
      o.name.toLowerCase() === verb.targetObject?.toLowerCase()
    )?.id || project.objects[0]?.id;

    if (targetObjId) {
      const newAction = {
        name: verb.name,
        type: 'traditional' as const,
        description: verb.description,
        businessLayer: {
          description: verb.description,
          targetObject: targetObjId,
          executorRole: '',
          triggerCondition: ''
        }
      };

      setProject(prev => ({
        ...prev,
        objects: prev.objects.map(obj =>
          obj.id === targetObjId
            ? { ...obj, actions: [...obj.actions, newAction] }
            : obj
        )
      }));
    }

    // Remove from extracted list
    setExtractedVerbs(prev => prev.filter(v => v.name !== verb.name));
  };

  // Handle dismissing nouns/verbs
  const handleDismissNoun = (name: string) => {
    setExtractedNouns(prev => prev.filter(n => n.name !== name));
  };

  const handleDismissVerb = (name: string) => {
    setExtractedVerbs(prev => prev.filter(v => v.name !== name));
  };

  const handleValidateAndDesign = async () => {
    console.log('handleValidateAndDesign called');
    console.log('hasApiKey:', hasApiKey);
    console.log('historyRef.current:', historyRef.current);

    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    // 使用新的智能准备度检查器
    const readinessReport = checkReadiness(project, historyRef.current, lang);
    console.log('Readiness check result:', readinessReport);

    if (readinessReport.level === 'excellent' || readinessReport.level === 'good') {
      // 信息充足，直接生成
      console.log('Readiness good, calling onDesignTrigger...');
      onDesignTrigger();
    } else {
      // 显示准备度检查面板（允许用户决定是否继续）
      console.log('Showing readiness panel...');
      setShowValidationModal(true);
    }
  };

  const handleSend = async () => {
    // Allow send if there's input OR files
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    // Prepare message text
    let userMsg = input.trim();

    // If no text input but has files, add a default instruction
    if (!userMsg && uploadedFiles.length > 0) {
      userMsg = lang === 'cn'
        ? '请分析以下文档，提取其中的业务对象、动作和流程，帮助我设计 Ontology。'
        : 'Please analyze the following document(s), extract business objects, actions, and processes to help design the Ontology.';
    }

    // Convert uploaded files to FileAttachment format for AI service
    const fileAttachments = uploadedFiles.map(f => ({
      name: f.name,
      content: f.content,
      mimeType: f.mimeType,
      isBase64: f.isBase64,
    }));

    // Store files for clearing after send
    const currentFiles = [...uploadedFiles];

    setInput('');
    setUploadedFiles([]); // Clear files after sending

    // Store display content (without full file content for UI)
    const displayContent = currentFiles.length > 0
      ? `${input.trim() || (lang === 'cn' ? '分析文档' : 'Analyze document')}\n\n📎 ${currentFiles.map(f => f.name).join(', ')}`
      : input.trim();

    // Store full content for AI context (include text file contents, exclude binary)
    let aiContent = userMsg;
    if (currentFiles.length > 0) {
      const textFileContents = currentFiles
        .filter(f => !f.isBase64)
        .map(f => `\n--- ${f.name} ---\n${f.content}\n--- End ---`)
        .join('');
      if (textFileContents) {
        aiContent += textFileContents;
      }
    }

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: displayContent }];
    setMessages(newMessages);
    // historyRef stores full content for extraction/analysis (text files included)
    historyRef.current = [...historyRef.current, { role: 'user', content: aiContent }];
    setIsLoading(true);

    try {
      // Use multimodal chat if there are files
      // Use historyRef (without current message) for full context
      const historyForAI = historyRef.current.slice(0, -1); // Exclude the just-added user message
      const response = currentFiles.length > 0
        ? await aiService.chatWithFiles(historyForAI, userMsg, fileAttachments)
        : await aiService.chat(historyForAI, userMsg);

      const assistantMsg: ChatMessage = { role: 'assistant', content: response || 'Error generating response' };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      historyRef.current = [...historyRef.current, assistantMsg];

      // Trigger extraction and case analysis after successful message
      setTimeout(() => {
        extractFromConversation();
        analyzeCases();
      }, 500);
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : t.error;
      setMessages(prev => [...prev, { role: 'assistant', content: `${t.error}\n\n${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick input submission (structured form data)
  const handleQuickInput = async (structuredInput: string) => {
    if (!hasApiKey || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: structuredInput }];
    setMessages(newMessages);
    historyRef.current = [...historyRef.current, { role: 'user', content: structuredInput }];
    setIsLoading(true);

    try {
      // Use historyRef for full context
      const historyForAI = historyRef.current.slice(0, -1);
      const response = await aiService.chat(historyForAI, structuredInput);
      const assistantMsg: ChatMessage = { role: 'assistant', content: response || 'Error generating response' };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      historyRef.current = [...historyRef.current, assistantMsg];

      // Trigger extraction and case analysis after successful message
      setTimeout(() => {
        extractFromConversation();
        analyzeCases();
      }, 500);
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : t.error;
      setMessages(prev => [...prev, { role: 'assistant', content: `${t.error}\n\n${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing a case in the browser
  const handleViewCase = (caseData: OntologyCase) => {
    setSelectedCaseForBrowser(caseData);
    setShowCaseBrowser(true);
  };

  // Show case browser
  if (showCaseBrowser) {
    return (
      <CaseBrowser
        lang={lang}
        onClose={() => {
          setShowCaseBrowser(false);
          setSelectedCaseForBrowser(null);
        }}
      />
    );
  }

  return (
    <div className="flex h-full bg-[var(--color-bg-elevated)]">
      {/* Main Chat Area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${showExtractPanel || showCasePanel ? 'mr-80' : ''}`}>
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-amber-400" />
            <span className="text-xs text-gray-500">{t.terminal}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Case Recommendation Toggle */}
            {hasApiKey && messages.length > 2 && (
              <button
                onClick={() => {
                  if (!showCasePanel && recommendedCaseIds.length === 0) {
                    analyzeCases();
                  }
                  setShowCasePanel(!showCasePanel);
                  if (showCasePanel === false) {
                    setShowExtractPanel(false);
                  }
                }}
                disabled={isAnalyzingCases}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showCasePanel
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'glass-surface text-gray-400 hover:text-white'
                } ${recommendedCaseIds.length > 0 ? 'ring-1 ring-amber-500/30' : ''}`}
                title={t.caseRecommend}
              >
                {isAnalyzingCases ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t.analyzingCases}
                  </>
                ) : (
                  <>
                    <Lightbulb size={14} />
                    {recommendedCaseIds.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-micro font-bold flex items-center justify-center">
                        {recommendedCaseIds.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Extract Panel Toggle */}
            {hasApiKey && messages.length > 1 && (
              <button
                onClick={() => {
                  if (!showExtractPanel && extractedNouns.length === 0 && extractedVerbs.length === 0) {
                    extractFromConversation();
                  }
                  setShowExtractPanel(!showExtractPanel);
                  if (showExtractPanel === false) {
                    setShowCasePanel(false);
                  }
                }}
                disabled={isExtracting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showExtractPanel
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'glass-surface text-gray-400 hover:text-white'
                }`}
                title={showExtractPanel ? t.hidePanel : t.extractPanel}
              >
                {isExtracting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t.extracting}
                  </>
                ) : (
                  <>
                    <Scan size={14} />
                    {showExtractPanel ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                  </>
                )}
              </button>
            )}

            {/* Synthesize Button */}
            {messages.length > 2 && (
              <button
                onClick={handleValidateAndDesign}
                disabled={isValidating}
                className="flex items-center gap-2 btn-gradient px-5 py-2 rounded-lg text-xs font-medium disabled:opacity-70 transition-all"
              >
                {isValidating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t.validating}
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    {t.generate}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`message-bubble max-w-[75%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-gray-100 rounded-br-md'
                : 'glass-card text-gray-300 rounded-bl-md'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="glass-card px-4 py-4 rounded-2xl rounded-bl-md w-64">
              <div className="space-y-2">
                <div className="skeleton skeleton-text w-full"></div>
                <div className="skeleton skeleton-text w-3/4"></div>
                <div className="skeleton skeleton-text-sm w-1/2"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/[0.06]">
        {/* API Key 未配置提示 */}
        {!hasApiKey && (
          <div className="max-w-3xl mx-auto mb-4">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 transition-colors"
            >
              <AlertCircle size={16} />
              <span className="text-sm">
                {lang === 'cn' ? '请先配置 AI 设置' : 'Please configure AI settings first'}
              </span>
            </button>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {/* Smart Tips */}
          <SmartTips
            lang={lang}
            messages={messages}
            project={project}
            hasApiKey={hasApiKey}
          />

          {/* Quick Input Panel */}
          <QuickInputPanel
            lang={lang}
            onSubmit={handleQuickInput}
            disabled={!hasApiKey || isLoading}
          />

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {uploadedFiles.map(file => {
                // Determine icon and color based on file type
                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                let icon = <FileText size={16} />;
                let colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';

                if (file.mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
                  icon = <Image size={16} />;
                  colorClass = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                } else if (file.mimeType === 'application/pdf' || ext === 'pdf') {
                  icon = <FileImage size={16} />;
                  colorClass = 'text-red-400 bg-red-500/10 border-red-500/20';
                } else if (['xlsx', 'xls', 'xlsm'].includes(ext)) {
                  icon = <FileSpreadsheet size={16} />;
                  colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                } else if (['pptx', 'ppt'].includes(ext)) {
                  icon = <Presentation size={16} />;
                  colorClass = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
                } else if (['docx', 'doc'].includes(ext)) {
                  icon = <FileText size={16} />;
                  colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                }

                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${colorClass}`}
                  >
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{file.name}</div>
                      <div className="text-micro text-gray-500">
                        {file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                        {file.isBase64
                          ? ` • ${lang === 'cn' ? 'AI 视觉分析' : 'AI Vision'}`
                          : ` • ${file.content.length.toLocaleString()} ${lang === 'cn' ? '字符' : 'chars'}`}
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="p-1 rounded hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            {/* File Upload Button */}
            <FileUploadButton
              lang={lang}
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              disabled={!hasApiKey || isLoading}
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onPaste={handlePaste}
              placeholder={hasApiKey ? t.placeholder : (lang === 'cn' ? '请先配置 API Key...' : 'Please configure API Key first...')}
              disabled={!hasApiKey}
              className={`flex-1 glass-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/30 transition-colors placeholder:text-gray-500 ${!hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !hasApiKey || (!input.trim() && uploadedFiles.length === 0)}
              className="btn-gradient p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
      </div>
      </div>
      </div>

      {/* Case Recommend Panel - Fixed Right Side */}
      {showCasePanel && (
        <div className="fixed right-0 top-0 bottom-0 z-40">
          <CaseRecommendPanel
            lang={lang}
            recommendedCaseIds={recommendedCaseIds}
            keywords={caseKeywords}
            onClose={() => setShowCasePanel(false)}
            onViewCase={handleViewCase}
          />
        </div>
      )}

      {/* Extract Panel - Fixed Right Side */}
      {showExtractPanel && !showCasePanel && (
        <div className="fixed right-0 top-0 bottom-0 w-72 p-4 z-40">
          <NounVerbPanel
            lang={lang}
            nouns={extractedNouns}
            verbs={extractedVerbs}
            isExtracting={isExtracting}
            onAddNoun={handleAddNoun}
            onAddVerb={handleAddVerb}
            onDismissNoun={handleDismissNoun}
            onDismissVerb={handleDismissVerb}
            onClose={() => setShowExtractPanel(false)}
          />
        </div>
      )}

      {/* 准备度检查弹窗 - 使用新的 ReadinessPanel */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-[var(--color-bg-base)]/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg animate-slideUp">
            <ReadinessPanel
              lang={lang}
              project={project}
              chatMessages={historyRef.current}
              onProceed={() => {
                setShowValidationModal(false);
                onDesignTrigger();
              }}
              onCancel={() => setShowValidationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;

/**
 * ChatMessagesPanel - 聊天消息面板
 * 用于 Phase 1 (发现) 的主内容区域，显示聊天消息
 */
import React, { useRef, useEffect } from 'react';
import { Language, ChatMessage, ProjectState } from '../types';
import { Sparkles, Lightbulb, Wand2, Settings } from 'lucide-react';

interface ChatMessagesPanelProps {
  lang: Language;
  messages: ChatMessage[];
  project: ProjectState;
  isLoading?: boolean;
  hasApiKey?: boolean;
  onDesignTrigger?: () => void;
  onOpenSettings?: () => void;
}

const translations = {
  en: {
    title: "Requirement Discovery",
    subtitle: "Describe your business challenges and needs",
    welcome: "Welcome. I'm your Systems Architect. To design your Intelligent OS, I'll need to understand your core business entities, current data systems (ERPs, CRMs), and where your biggest manual bottlenecks lie. Shall we start with the main process you want to optimize?",
    thinking: "Thinking...",
    generateOntology: "Generate Ontology",
    generateOntologyDesc: "Create from chat",
    configureApi: "Configure API",
    configureApiDesc: "Required",
    needMoreChat: "Chat more to generate",
    tips: [
      "Describe your business process",
      "Mention existing systems (ERP, CRM, etc.)",
      "Share pain points and bottlenecks"
    ]
  },
  cn: {
    title: "需求发现",
    subtitle: "描述您的业务挑战与需求",
    welcome: "您好，我是您的系统架构师。为了设计您的智能操作系统，我需要了解您的核心业务实体、现有的数据系统（如 ERP、CRM）以及目前最大的业务瓶颈。我们先从您最想优化的核心流程开始，好吗？",
    thinking: "思考中...",
    generateOntology: "生成 Ontology",
    generateOntologyDesc: "从对话生成",
    configureApi: "配置 API",
    configureApiDesc: "必需",
    needMoreChat: "请先进行更多对话",
    tips: [
      "描述您的业务流程",
      "提及现有系统（ERP、CRM等）",
      "分享痛点和瓶颈"
    ]
  }
};

const ChatMessagesPanel: React.FC<ChatMessagesPanelProps> = ({
  lang,
  messages,
  project,
  isLoading,
  hasApiKey = false,
  onDesignTrigger,
  onOpenSettings
}) => {
  const t = translations[lang];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col" style={{ paddingBottom: '80px' }}>
      {/* Header - 与 Phase 2-4 风格一致 */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {t.title}
          </h1>
          <p className="text-xs text-muted">{t.subtitle}</p>
        </div>

        {/* Action buttons - 与 Phase 2-4 tab 按钮风格一致 */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
          {!hasApiKey ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all hover:bg-[var(--color-bg-hover)]"
              style={{ color: 'var(--color-warning)' }}
            >
              <Settings size={16} />
              <div className="flex flex-col items-start">
                <span>{t.configureApi}</span>
                <span className="text-[10px] opacity-70">{t.configureApiDesc}</span>
              </div>
            </button>
          ) : messages.length >= 2 && onDesignTrigger ? (
            <button
              onClick={onDesignTrigger}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-accent)',
                fontWeight: 500
              }}
            >
              <Wand2 size={16} />
              <div className="flex flex-col items-start">
                <span>{t.generateOntology}</span>
                <span className="text-[10px] opacity-70">{t.generateOntologyDesc}</span>
              </div>
            </button>
          ) : messages.length > 0 ? (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Wand2 size={16} className="opacity-50" />
              <div className="flex flex-col items-start">
                <span className="opacity-70">{t.generateOntology}</span>
                <span className="text-[10px] opacity-50">{t.needMoreChat}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto">
            {/* Welcome Card */}
            <div
              className="p-6 rounded-2xl mb-6"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)', opacity: 0.9 }}
                >
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {t.welcome}
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {lang === 'cn' ? '开始提示' : 'Getting Started'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.tips.map((tip, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            msg.role === 'system' ? (
              // System message - context boundary
              <div key={index} className="flex justify-center my-6">
                <div
                  className="max-w-[90%] px-5 py-4 rounded-xl text-sm border"
                  style={{
                    backgroundColor: 'var(--color-bg-hover)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-center">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={{
                    backgroundColor: msg.role === 'user'
                      ? 'var(--color-accent)'
                      : 'var(--color-bg-surface)',
                    color: msg.role === 'user'
                      ? 'white'
                      : 'var(--color-text-primary)'
                  }}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-md text-sm"
                style={{ backgroundColor: 'var(--color-bg-surface)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }}>{t.thinking}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatMessagesPanel;

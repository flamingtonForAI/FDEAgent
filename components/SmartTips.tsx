
import React, { useState, useEffect, useMemo } from 'react';
import { Language, ChatMessage, ProjectState } from '../types';
import {
  BookOpen, Lightbulb, AlertTriangle, X, ChevronRight,
  Sparkles, Target, Layers, Zap, CheckCircle2
} from 'lucide-react';

interface SmartTipsProps {
  lang: Language;
  messages: ChatMessage[];
  project: ProjectState;
  hasApiKey: boolean;
  onDismiss?: (tipId: string) => void;
}

interface Tip {
  id: string;
  type: 'methodology' | 'case' | 'check';
  title: { en: string; cn: string };
  content: { en: string; cn: string };
  icon: React.ReactNode;
  priority: number; // Higher = more important
  action?: {
    label: { en: string; cn: string };
    onClick?: () => void;
  };
}

// Methodology tips based on Ontology principles
const methodologyTips: Omit<Tip, 'id' | 'priority'>[] = [
  {
    type: 'methodology',
    title: {
      en: 'Focus on Actions, not just Objects',
      cn: '关注 Action，不仅仅是 Object'
    },
    content: {
      en: 'Ontology differs from Knowledge Graph by emphasizing what can be done. Define Actions for each Object.',
      cn: 'Ontology 与知识图谱的核心区别在于强调「能做什么」。为每个对象定义 Action。'
    },
    icon: <Target size={14} />
  },
  {
    type: 'methodology',
    title: {
      en: 'Think in Three Layers',
      cn: '三层思考'
    },
    content: {
      en: 'Each Action has 3 identities: Business (who/why), Logic (pre/post conditions), Implementation (API/Tool).',
      cn: '每个 Action 有三重身份：业务层（谁/为什么）、逻辑层（前置/后置条件）、实现层（API/Tool）。'
    },
    icon: <Layers size={14} />
  },
  {
    type: 'methodology',
    title: {
      en: 'Decision-First Principle',
      cn: 'Decision-First 原则'
    },
    content: {
      en: 'Start from the decision you want to make, then trace back to required data and actions.',
      cn: '从你想做的决策出发，反推所需的数据和动作。'
    },
    icon: <Sparkles size={14} />
  },
  {
    type: 'methodology',
    title: {
      en: 'Extract Noun-Verb Pairs',
      cn: '提取 Noun-Verb 对'
    },
    content: {
      en: 'Nouns become Objects, Verbs become Actions. Listen for business terms in conversation.',
      cn: '名词变为对象，动词变为动作。从对话中识别业务术语。'
    },
    icon: <BookOpen size={14} />
  },
  {
    type: 'methodology',
    title: {
      en: 'AI Injection Points',
      cn: 'AI 注入点'
    },
    content: {
      en: 'Identify where AI can enhance: predictions, optimizations, anomaly detection, recommendations.',
      cn: '识别 AI 可增强之处：预测、优化、异常检测、推荐。'
    },
    icon: <Zap size={14} />
  }
];

const translations = {
  en: {
    smartTips: 'Smart Tips',
    methodology: 'Methodology',
    caseHint: 'Case Reference',
    checkReminder: 'Reminder',
    dismiss: 'Dismiss',
    learnMore: 'Learn More',
    collapse: 'Collapse',
    expand: 'Expand',
    noTips: 'No tips at the moment',
    keepDescribing: 'Continue describing your scenario',
    // Check tips
    noObjects: 'No objects defined yet',
    noActions: 'Consider adding actions to your objects',
    noIntegrations: 'Have you mentioned data sources?',
    noAI: 'Think about AI enhancement opportunities',
    describeMore: 'Describe your business challenges',
    addDetails: 'Add more details about',
    // Case tips
    similarCase: 'Similar case available',
    referenceDesign: 'Reference this design pattern'
  },
  cn: {
    smartTips: '智能提示',
    methodology: '方法论',
    caseHint: '案例参考',
    checkReminder: '提醒',
    dismiss: '关闭',
    learnMore: '了解更多',
    collapse: '收起',
    expand: '展开',
    noTips: '暂无提示',
    keepDescribing: '继续描述你的业务场景',
    // Check tips
    noObjects: '尚未定义任何对象',
    noActions: '考虑为对象添加动作',
    noIntegrations: '是否提到了数据源？',
    noAI: '思考 AI 增强的机会',
    describeMore: '描述你的业务挑战',
    addDetails: '补充更多关于',
    // Case tips
    similarCase: '有相似案例可参考',
    referenceDesign: '参考这个设计模式'
  }
};

const SmartTips: React.FC<SmartTipsProps> = ({
  lang,
  messages,
  project,
  hasApiKey,
  onDismiss
}) => {
  const t = translations[lang];
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  // Analyze conversation to determine relevant tips
  const conversationAnalysis = useMemo(() => {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allText = userMessages.join(' ');

    const hasObjects = project.objects.length > 0;
    const hasActions = project.objects.some(o => o.actions && o.actions.length > 0);
    const hasIntegrations = project.integrations && project.integrations.length > 0;
    const hasAIFeatures = project.objects.some(o => o.aiFeatures && o.aiFeatures.length > 0);

    // Keyword detection
    const mentionsProcess = /流程|process|workflow|步骤|step/i.test(allText);
    const mentionsData = /数据|data|系统|system|erp|crm|数据库|database/i.test(allText);
    const mentionsDecision = /决策|decision|判断|decide|自动|automatic|智能|intelligent/i.test(allText);
    const mentionsPrediction = /预测|predict|forecast|趋势|trend/i.test(allText);

    const messageCount = userMessages.length;

    return {
      hasObjects,
      hasActions,
      hasIntegrations,
      hasAIFeatures,
      mentionsProcess,
      mentionsData,
      mentionsDecision,
      mentionsPrediction,
      messageCount,
      conversationDepth: messageCount > 5 ? 'deep' : messageCount > 2 ? 'moderate' : 'shallow'
    };
  }, [messages, project]);

  // Generate relevant tips based on context
  const activeTips = useMemo(() => {
    const tips: Tip[] = [];
    const analysis = conversationAnalysis;

    // Check tips - based on missing elements
    if (!hasApiKey) {
      tips.push({
        id: 'check_api',
        type: 'check',
        title: { en: 'Configure AI', cn: '配置 AI' },
        content: { en: 'Set up your AI provider to get started', cn: '配置 AI 提供商以开始使用' },
        icon: <AlertTriangle size={14} />,
        priority: 100
      });
    } else if (analysis.messageCount === 0) {
      tips.push({
        id: 'check_start',
        type: 'check',
        title: { en: 'Start Describing', cn: '开始描述' },
        content: { en: 'Describe your business scenario to begin designing', cn: '描述你的业务场景以开始设计' },
        icon: <AlertTriangle size={14} />,
        priority: 90
      });
    } else {
      // Methodology tips - rotate based on context
      if (!analysis.hasObjects && analysis.messageCount > 1) {
        tips.push({
          id: 'method_noun_verb',
          ...methodologyTips[3], // Noun-Verb extraction
          priority: 80
        });
      }

      if (analysis.hasObjects && !analysis.hasActions) {
        tips.push({
          id: 'method_actions',
          ...methodologyTips[0], // Focus on Actions
          priority: 75
        });
      }

      if (analysis.hasActions && analysis.conversationDepth === 'moderate') {
        tips.push({
          id: 'method_three_layers',
          ...methodologyTips[1], // Three Layers
          priority: 70
        });
      }

      if (analysis.mentionsDecision && !analysis.hasAIFeatures) {
        tips.push({
          id: 'method_decision_first',
          ...methodologyTips[2], // Decision-First
          priority: 65
        });
      }

      if (analysis.mentionsPrediction || analysis.mentionsData) {
        tips.push({
          id: 'method_ai_injection',
          ...methodologyTips[4], // AI Injection
          priority: 60
        });
      }

      // Check tips - reminders for missing elements
      if (analysis.hasObjects && !analysis.hasIntegrations && analysis.mentionsData) {
        tips.push({
          id: 'check_integrations',
          type: 'check',
          title: { en: 'Data Sources', cn: '数据源' },
          content: { en: t.noIntegrations, cn: t.noIntegrations },
          icon: <AlertTriangle size={14} />,
          priority: 55
        });
      }

      // Progression tips
      if (analysis.conversationDepth === 'deep' && analysis.hasObjects && analysis.hasActions) {
        tips.push({
          id: 'check_ready',
          type: 'check',
          title: { en: 'Ready to Synthesize', cn: '可以合成' },
          content: { en: 'You have enough context. Consider synthesizing the architecture.', cn: '你已有足够的上下文。可以考虑合成架构了。' },
          icon: <CheckCircle2 size={14} />,
          priority: 50
        });
      }
    }

    // Filter dismissed tips and sort by priority
    return tips
      .filter(tip => !dismissedTips.has(tip.id))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3); // Show max 3 tips
  }, [conversationAnalysis, hasApiKey, dismissedTips, t]);

  const handleDismiss = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]));
    onDismiss?.(tipId);
  };

  // Type-specific styling
  const getTypeStyles = (type: Tip['type']) => {
    switch (type) {
      case 'methodology':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          text: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300'
        };
      case 'case':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300'
        };
      case 'check':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300'
        };
    }
  };

  const getTypeLabel = (type: Tip['type']) => {
    switch (type) {
      case 'methodology': return t.methodology;
      case 'case': return t.caseHint;
      case 'check': return t.checkReminder;
    }
  };

  // Don't show if no tips
  if (activeTips.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mb-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400 transition-colors mb-2"
      >
        <Lightbulb size={12} className="text-amber-400" />
        <span>{t.smartTips}</span>
        <span className="text-micro text-gray-500">({activeTips.length})</span>
        <ChevronRight
          size={12}
          className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Tips Container */}
      {isExpanded && (
        <div className="space-y-2 animate-fadeIn">
          {activeTips.map(tip => {
            const styles = getTypeStyles(tip.type);
            return (
              <div
                key={tip.id}
                className={`group relative flex items-start gap-3 p-3 rounded-xl ${styles.bg} border ${styles.border} transition-all hover:border-opacity-40`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${styles.badge} flex items-center justify-center`}>
                  {tip.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-micro px-1.5 py-0.5 rounded ${styles.badge}`}>
                      {getTypeLabel(tip.type)}
                    </span>
                    <h4 className={`text-xs font-medium ${styles.text}`}>
                      {tip.title[lang]}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                    {tip.content[lang]}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismiss(tip.id)}
                  className="flex-shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] text-gray-500 hover:text-gray-300 transition-all"
                  title={t.dismiss}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartTips;

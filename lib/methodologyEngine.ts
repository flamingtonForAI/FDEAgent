/**
 * Methodology Engine - Ontology Design Methodology Guard Rails
 *
 * This engine enforces the ontology design methodology:
 * 1. Discovery - Understand business context, pain points, existing systems
 * 2. Structure - Define objects, properties, and initial relationships
 * 3. Refine - Add actions, AI features, and optimize the model
 * 4. Deliver - Generate blueprints, validate, and export
 *
 * The engine detects when users skip critical steps and provides guidance.
 */

import { ProjectState, ChatMessage, Language } from '../types';

// Design methodology stages
export type MethodologyStage = 'discovery' | 'structure' | 'refine' | 'deliver';

// Stage definition with requirements and checks
export interface StageDefinition {
  id: MethodologyStage;
  name: { en: string; cn: string };
  description: { en: string; cn: string };
  requiredBefore: MethodologyStage[];
  minimumRequirements: StageRequirement[];
  warningThresholds: StageWarning[];
}

export interface StageRequirement {
  id: string;
  check: (project: ProjectState, messages: ChatMessage[]) => boolean;
  label: { en: string; cn: string };
  importance: 'critical' | 'recommended' | 'nice-to-have';
}

export interface StageWarning {
  id: string;
  condition: (project: ProjectState, messages: ChatMessage[]) => boolean;
  message: { en: string; cn: string };
  suggestion: { en: string; cn: string };
  severity: 'error' | 'warning' | 'info';
}

// Methodology check result
export interface MethodologyCheckResult {
  currentStage: MethodologyStage;
  stageProgress: number; // 0-100
  completedRequirements: string[];
  missingRequirements: Array<{
    id: string;
    label: string;
    importance: 'critical' | 'recommended' | 'nice-to-have';
  }>;
  activeWarnings: Array<{
    id: string;
    message: string;
    suggestion: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  canProceedToNext: boolean;
  nextStage: MethodologyStage | null;
  copilotSuggestions: CopilotSuggestion[];
}

export interface CopilotSuggestion {
  id: string;
  type: 'question' | 'tip' | 'warning' | 'action';
  message: string;
  action?: {
    label: string;
    tab?: string;
    prompt?: string;
  };
  priority: number; // Higher = more important
}

// Helper functions to analyze conversation
const countUserMessages = (messages: ChatMessage[]): number => {
  return messages.filter(m => m.role === 'user').length;
};

const hasDiscussedTopic = (messages: ChatMessage[], keywords: string[]): boolean => {
  const allText = messages.map(m => m.content.toLowerCase()).join(' ');
  return keywords.some(kw => allText.includes(kw.toLowerCase()));
};

const getConversationDepth = (messages: ChatMessage[]): number => {
  const userMsgs = messages.filter(m => m.role === 'user');
  const totalChars = userMsgs.reduce((sum, m) => sum + m.content.length, 0);
  return Math.min(100, Math.floor(totalChars / 50)); // Rough depth score
};

// Check if objects have sufficient detail
const objectsHaveSufficientDetail = (project: ProjectState): boolean => {
  if (project.objects.length === 0) return false;

  const detailedObjects = project.objects.filter(obj =>
    obj.description && obj.description.length >= 20 &&
    obj.properties && obj.properties.length >= 2
  );

  return detailedObjects.length >= project.objects.length * 0.7; // 70% threshold
};

// Check if actions are properly defined (compatible with both old and new three-layer structure)
const actionsAreProperyDefined = (project: ProjectState): boolean => {
  const allActions = project.objects.flatMap(obj => obj.actions || []);
  if (allActions.length === 0) return false;

  const definedActions = allActions.filter(action => {
    // Check description (top-level or in businessLayer)
    const hasDescription = (action.description && action.description.length >= 10) ||
      (action.businessLayer?.description && action.businessLayer.description.length >= 10);

    // Check target object (new structure or old field)
    const hasTargetObject = action.businessLayer?.targetObject ||
      (action as any).targetObject;

    return hasDescription && hasTargetObject;
  });

  return definedActions.length >= allActions.length * 0.5;
};

// Stage definitions
export const METHODOLOGY_STAGES: StageDefinition[] = [
  {
    id: 'discovery',
    name: { en: 'Discovery', cn: '发现' },
    description: {
      en: 'Understand the business context, pain points, and existing systems',
      cn: '理解业务背景、痛点和现有系统'
    },
    requiredBefore: [],
    minimumRequirements: [
      {
        id: 'has_conversation',
        check: (_, msgs) => countUserMessages(msgs) >= 2,
        label: { en: 'Initial conversation started', cn: '已开始初步对话' },
        importance: 'critical'
      },
      {
        id: 'discussed_business',
        check: (_, msgs) => hasDiscussedTopic(msgs, ['业务', '流程', 'business', 'process', 'workflow', '工作流']),
        label: { en: 'Discussed business processes', cn: '已讨论业务流程' },
        importance: 'critical'
      },
      {
        id: 'discussed_pain_points',
        check: (_, msgs) => hasDiscussedTopic(msgs, ['问题', '痛点', 'problem', 'pain', 'challenge', '挑战', '困难', 'difficult']),
        label: { en: 'Identified pain points', cn: '已识别痛点' },
        importance: 'recommended'
      },
      {
        id: 'discussed_systems',
        check: (_, msgs) => hasDiscussedTopic(msgs, ['系统', 'system', 'ERP', 'CRM', 'SAP', 'Oracle', '数据库', 'database']),
        label: { en: 'Discussed existing systems', cn: '已讨论现有系统' },
        importance: 'recommended'
      }
    ],
    warningThresholds: [
      {
        id: 'shallow_conversation',
        condition: (_, msgs) => countUserMessages(msgs) < 3 && getConversationDepth(msgs) < 30,
        message: { en: 'Conversation seems brief', cn: '对话内容较简短' },
        suggestion: { en: 'Consider exploring more about the business context before designing', cn: '建议在设计前更深入地了解业务背景' },
        severity: 'warning'
      }
    ]
  },
  {
    id: 'structure',
    name: { en: 'Structure', cn: '结构化' },
    description: {
      en: 'Define core objects, their properties, and relationships',
      cn: '定义核心对象、属性和关系'
    },
    requiredBefore: ['discovery'],
    minimumRequirements: [
      {
        id: 'has_objects',
        check: (project) => project.objects.length >= 2,
        label: { en: 'At least 2 objects defined', cn: '至少定义2个对象' },
        importance: 'critical'
      },
      {
        id: 'objects_have_properties',
        check: (project) => project.objects.some(obj => obj.properties && obj.properties.length > 0),
        label: { en: 'Objects have properties', cn: '对象有属性定义' },
        importance: 'critical'
      },
      {
        id: 'objects_have_descriptions',
        check: (project) => project.objects.every(obj => obj.description && obj.description.length >= 10),
        label: { en: 'Objects have descriptions', cn: '对象有描述' },
        importance: 'recommended'
      },
      {
        id: 'has_relationships',
        check: (project) => project.links.length >= 1,
        label: { en: 'At least 1 relationship defined', cn: '至少定义1个关系' },
        importance: 'recommended'
      }
    ],
    warningThresholds: [
      {
        id: 'objects_lack_detail',
        condition: (project) => project.objects.length > 0 && !objectsHaveSufficientDetail(project),
        message: { en: 'Some objects lack sufficient detail', cn: '部分对象缺少足够的细节' },
        suggestion: { en: 'Add descriptions and properties to better define each object', cn: '添加描述和属性以更好地定义每个对象' },
        severity: 'warning'
      },
      {
        id: 'no_relationships',
        condition: (project) => project.objects.length >= 2 && project.links.length === 0,
        message: { en: 'No relationships defined between objects', cn: '对象之间没有定义关系' },
        suggestion: { en: 'Consider how your objects relate to each other', cn: '考虑对象之间的关联关系' },
        severity: 'info'
      }
    ]
  },
  {
    id: 'refine',
    name: { en: 'Refine', cn: '细化' },
    description: {
      en: 'Add actions, AI features, and optimize the data model',
      cn: '添加动作、AI特性，优化数据模型'
    },
    requiredBefore: ['discovery', 'structure'],
    minimumRequirements: [
      {
        id: 'has_actions',
        check: (project) => project.objects.some(obj => obj.actions && obj.actions.length > 0),
        label: { en: 'At least 1 action defined', cn: '至少定义1个动作' },
        importance: 'critical'
      },
      {
        id: 'actions_are_detailed',
        check: (project) => actionsAreProperyDefined(project),
        label: { en: 'Actions have proper definitions', cn: '动作有完整定义' },
        importance: 'recommended'
      },
      {
        id: 'considered_ai',
        check: (project) => project.objects.some(obj => obj.aiFeatures && obj.aiFeatures.length > 0),
        label: { en: 'AI features considered', cn: '已考虑AI特性' },
        importance: 'nice-to-have'
      }
    ],
    warningThresholds: [
      {
        id: 'actions_lack_detail',
        condition: (project) => {
          const allActions = project.objects.flatMap(obj => obj.actions || []);
          return allActions.length > 0 && !actionsAreProperyDefined(project);
        },
        message: { en: 'Some actions lack complete definitions', cn: '部分动作缺少完整定义' },
        suggestion: { en: 'Review action definitions in the Action Designer', cn: '在动作设计器中完善动作定义' },
        severity: 'warning'
      }
    ]
  },
  {
    id: 'deliver',
    name: { en: 'Deliver', cn: '交付' },
    description: {
      en: 'Generate blueprints, validate the model, and prepare for deployment',
      cn: '生成蓝图、验证模型、准备部署'
    },
    requiredBefore: ['discovery', 'structure', 'refine'],
    minimumRequirements: [
      {
        id: 'model_complete',
        check: (project) =>
          project.objects.length >= 2 &&
          project.objects.some(obj => obj.actions && obj.actions.length > 0) &&
          objectsHaveSufficientDetail(project),
        label: { en: 'Model is complete', cn: '模型已完成' },
        importance: 'critical'
      }
    ],
    warningThresholds: []
  }
];

// Determine current stage based on project state
export const determineCurrentStage = (
  project: ProjectState,
  messages: ChatMessage[]
): MethodologyStage => {
  const hasObjects = project.objects.length > 0;
  const hasDetailedObjects = objectsHaveSufficientDetail(project);
  const hasActions = project.objects.some(obj => obj.actions && obj.actions.length > 0);
  const hasConversation = countUserMessages(messages) >= 2;

  if (!hasConversation) return 'discovery';
  if (!hasObjects) return 'discovery';
  if (!hasDetailedObjects) return 'structure';
  if (!hasActions) return 'refine';
  return 'deliver';
};

// Generate copilot suggestions based on current state
const generateCopilotSuggestions = (
  project: ProjectState,
  messages: ChatMessage[],
  stage: MethodologyStage,
  lang: Language
): CopilotSuggestion[] => {
  const suggestions: CopilotSuggestion[] = [];
  const isEn = lang === 'en';

  // Discovery stage suggestions
  if (stage === 'discovery') {
    if (!hasDiscussedTopic(messages, ['痛点', 'problem', 'pain', 'challenge'])) {
      suggestions.push({
        id: 'ask_pain_points',
        type: 'question',
        message: isEn
          ? 'What are the main pain points in your current workflow?'
          : '您当前工作流程中的主要痛点是什么？',
        action: {
          label: isEn ? 'Ask this question' : '提问此问题',
          prompt: isEn
            ? 'What are the main pain points or challenges in your current business process?'
            : '您当前业务流程中的主要痛点或挑战是什么？'
        },
        priority: 90
      });
    }

    if (!hasDiscussedTopic(messages, ['系统', 'system', 'ERP', 'CRM', 'SAP'])) {
      suggestions.push({
        id: 'ask_existing_systems',
        type: 'question',
        message: isEn
          ? 'What existing systems do you need to integrate with?'
          : '您需要与哪些现有系统集成？',
        action: {
          label: isEn ? 'Ask about systems' : '询问系统',
          prompt: isEn
            ? 'What existing systems (ERP, CRM, databases) do you currently use?'
            : '您目前使用哪些现有系统（ERP、CRM、数据库）？'
        },
        priority: 80
      });
    }

    if (countUserMessages(messages) >= 3 && project.objects.length === 0) {
      suggestions.push({
        id: 'suggest_extract',
        type: 'tip',
        message: isEn
          ? 'Ready to extract objects from the conversation'
          : '可以从对话中提取对象了',
        action: {
          label: isEn ? 'Extract elements' : '提取元素',
          tab: 'extract'
        },
        priority: 85
      });
    }
  }

  // Structure stage suggestions
  if (stage === 'structure') {
    if (project.objects.length > 0 && project.objects.length < 3) {
      suggestions.push({
        id: 'more_objects',
        type: 'tip',
        message: isEn
          ? 'Consider if there are more core business entities to model'
          : '考虑是否还有更多核心业务实体需要建模',
        priority: 70
      });
    }

    if (project.objects.length >= 2 && project.links.length === 0) {
      suggestions.push({
        id: 'add_relationships',
        type: 'action',
        message: isEn
          ? 'Define relationships between your objects'
          : '定义对象之间的关系',
        action: {
          label: isEn ? 'Go to Ontology' : '前往本体图',
          tab: 'ontology'
        },
        priority: 85
      });
    }

    const incompleteObjects = project.objects.filter(obj =>
      !obj.description || obj.description.length < 10 ||
      !obj.properties || obj.properties.length === 0
    );
    if (incompleteObjects.length > 0) {
      suggestions.push({
        id: 'complete_objects',
        type: 'warning',
        message: isEn
          ? `${incompleteObjects.length} object(s) need more detail`
          : `${incompleteObjects.length} 个对象需要补充细节`,
        action: {
          label: isEn ? 'Go to Workbench' : '前往工作台',
          tab: 'workbench'
        },
        priority: 90
      });
    }
  }

  // Refine stage suggestions
  if (stage === 'refine') {
    const objectsWithoutActions = project.objects.filter(obj =>
      !obj.actions || obj.actions.length === 0
    );
    if (objectsWithoutActions.length > 0) {
      suggestions.push({
        id: 'add_actions',
        type: 'action',
        message: isEn
          ? `${objectsWithoutActions.length} object(s) have no actions defined`
          : `${objectsWithoutActions.length} 个对象没有定义动作`,
        action: {
          label: isEn ? 'Go to Action Designer' : '前往动作设计器',
          tab: 'actionDesigner'
        },
        priority: 85
      });
    }

    const objectsWithoutAI = project.objects.filter(obj =>
      !obj.aiFeatures || obj.aiFeatures.length === 0
    );
    if (objectsWithoutAI.length > 0 && project.objects.some(obj => obj.actions && obj.actions.length > 0)) {
      suggestions.push({
        id: 'consider_ai',
        type: 'tip',
        message: isEn
          ? 'Consider adding AI features to enhance automation'
          : '考虑添加AI特性以增强自动化',
        action: {
          label: isEn ? 'Go to AI Augmentation' : '前往AI增强',
          tab: 'aip'
        },
        priority: 60
      });
    }
  }

  // Deliver stage suggestions
  if (stage === 'deliver') {
    suggestions.push({
      id: 'review_blueprint',
      type: 'action',
      message: isEn
        ? 'Review your system blueprint before deployment'
        : '部署前检查系统蓝图',
      action: {
        label: isEn ? 'View Blueprint' : '查看蓝图',
        tab: 'overview'
      },
      priority: 90
    });
  }

  // Sort by priority (higher first)
  return suggestions.sort((a, b) => b.priority - a.priority);
};

// Main methodology check function
export const checkMethodology = (
  project: ProjectState,
  messages: ChatMessage[],
  lang: Language
): MethodologyCheckResult => {
  const currentStage = determineCurrentStage(project, messages);
  const stageIndex = METHODOLOGY_STAGES.findIndex(s => s.id === currentStage);

  // Defensive check: fall back to discovery stage if stage not found
  const stageDef = stageIndex >= 0
    ? METHODOLOGY_STAGES[stageIndex]
    : METHODOLOGY_STAGES[0]; // Default to discovery stage
  const safeStageIndex = stageIndex >= 0 ? stageIndex : 0;

  // Check requirements
  const completedReqs: string[] = [];
  const missingReqs: MethodologyCheckResult['missingRequirements'] = [];

  stageDef.minimumRequirements.forEach(req => {
    if (req.check(project, messages)) {
      completedReqs.push(req.id);
    } else {
      missingReqs.push({
        id: req.id,
        label: lang === 'cn' ? req.label.cn : req.label.en,
        importance: req.importance
      });
    }
  });

  // Calculate progress
  const totalReqs = stageDef.minimumRequirements.length;
  const stageProgress = totalReqs > 0
    ? Math.round((completedReqs.length / totalReqs) * 100)
    : 100;

  // Check warnings
  const activeWarnings: MethodologyCheckResult['activeWarnings'] = [];
  stageDef.warningThresholds.forEach(warning => {
    if (warning.condition(project, messages)) {
      activeWarnings.push({
        id: warning.id,
        message: lang === 'cn' ? warning.message.cn : warning.message.en,
        suggestion: lang === 'cn' ? warning.suggestion.cn : warning.suggestion.en,
        severity: warning.severity
      });
    }
  });

  // Determine if can proceed
  const criticalMissing = missingReqs.filter(r => r.importance === 'critical');
  const canProceedToNext = criticalMissing.length === 0;
  const nextStage = safeStageIndex < METHODOLOGY_STAGES.length - 1
    ? METHODOLOGY_STAGES[safeStageIndex + 1].id
    : null;

  // Generate copilot suggestions
  const copilotSuggestions = generateCopilotSuggestions(project, messages, currentStage, lang);

  return {
    currentStage,
    stageProgress,
    completedRequirements: completedReqs,
    missingRequirements: missingReqs,
    activeWarnings,
    canProceedToNext,
    nextStage,
    copilotSuggestions
  };
};

// Get stage info
export const getStageInfo = (stage: MethodologyStage, lang: Language): { name: string; description: string } => {
  const stageDef = METHODOLOGY_STAGES.find(s => s.id === stage);
  if (!stageDef) return { name: stage, description: '' };

  return {
    name: lang === 'cn' ? stageDef.name.cn : stageDef.name.en,
    description: lang === 'cn' ? stageDef.description.cn : stageDef.description.en
  };
};

// Get all stages for progress display
export const getAllStages = (lang: Language): Array<{ id: MethodologyStage; name: string }> => {
  return METHODOLOGY_STAGES.map(stage => ({
    id: stage.id,
    name: lang === 'cn' ? stage.name.cn : stage.name.en
  }));
};

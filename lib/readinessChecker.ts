// 智能准备度检查器
// 核心原则：允许迭代式交付，仅在完全无法进行时阻塞

import { ProjectState, OntologyObject, ChatMessage } from '../types';

export type ReadinessLevel = 'blocked' | 'risky' | 'acceptable' | 'good' | 'excellent';

export interface ReadinessIssue {
  id: string;
  type: 'blocker' | 'risk' | 'warning' | 'suggestion';
  category: 'content' | 'object' | 'action' | 'integration' | 'governance';
  message: string;
  detail?: string;
  impact: string;  // 不解决会怎样
  suggestion?: string;  // 建议如何解决
}

export interface ReadinessReport {
  level: ReadinessLevel;
  score: number;  // 0-100
  canProceed: boolean;  // 是否可以继续（只有 blocked 时为 false）
  issues: ReadinessIssue[];
  summary: {
    blockers: number;
    risks: number;
    warnings: number;
    suggestions: number;
  };
  byCategory: {
    content: { score: number; issues: ReadinessIssue[] };
    object: { score: number; issues: ReadinessIssue[] };
    action: { score: number; issues: ReadinessIssue[] };
    integration: { score: number; issues: ReadinessIssue[] };
    governance: { score: number; issues: ReadinessIssue[] };
  };
}

// 智能检查聊天内容是否有实质信息
function analyzeConversationContent(messages: ChatMessage[]): {
  hasSubstance: boolean;
  businessContext: boolean;
  dataContext: boolean;
  userContext: boolean;
  workflowContext: boolean;
} {
  if (!messages || messages.length === 0) {
    return {
      hasSubstance: false,
      businessContext: false,
      dataContext: false,
      userContext: false,
      workflowContext: false
    };
  }

  // 获取用户消息内容
  const userContent = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  // 检查是否有实质内容（不仅仅是打招呼）
  const greetings = ['你好', 'hello', 'hi', '开始', 'start', '嗨'];
  const isOnlyGreeting = greetings.some(g => userContent.trim() === g);
  const hasSubstance = userContent.length > 20 && !isOnlyGreeting;

  // 检查业务背景关键词
  const businessKeywords = ['问题', '目标', '痛点', '需求', '业务', 'problem', 'goal', 'requirement', 'business', '流程', 'process'];
  const businessContext = businessKeywords.some(k => userContent.includes(k));

  // 检查数据源关键词
  const dataKeywords = ['数据', '系统', 'erp', 'crm', 'sap', 'database', '数据库', 'excel', '接口', 'api'];
  const dataContext = dataKeywords.some(k => userContent.includes(k));

  // 检查用户角色关键词
  const userKeywords = ['用户', '角色', '员工', '操作员', '经理', 'user', 'role', 'manager', '谁', 'who'];
  const userContext = userKeywords.some(k => userContent.includes(k));

  // 检查操作流程关键词
  const workflowKeywords = ['操作', '流程', '步骤', '自动', 'workflow', 'action', 'step', 'automate', '审批', 'approve'];
  const workflowContext = workflowKeywords.some(k => userContent.includes(k));

  return {
    hasSubstance,
    businessContext,
    dataContext,
    userContext,
    workflowContext
  };
}

// 检查对象定义完整度
function analyzeObjects(objects: OntologyObject[]): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];

  if (!objects || objects.length === 0) {
    // 没有对象不是 blocker，只是 risk
    issues.push({
      id: 'no-objects',
      type: 'risk',
      category: 'object',
      message: '尚未定义业务对象',
      impact: '无法生成数据模型和 API 设计',
      suggestion: '继续对话描述业务实体，或手动添加对象'
    });
    return issues;
  }

  objects.forEach((obj, idx) => {
    // 检查描述
    if (!obj.description || obj.description.length < 10) {
      issues.push({
        id: `obj-${idx}-no-desc`,
        type: 'warning',
        category: 'object',
        message: `对象 "${obj.name}" 缺少详细描述`,
        impact: '可能导致开发理解偏差',
        suggestion: '添加业务含义和使用场景说明'
      });
    }

    // 检查属性
    if (!obj.properties || obj.properties.length === 0) {
      issues.push({
        id: `obj-${idx}-no-props`,
        type: 'warning',
        category: 'object',
        message: `对象 "${obj.name}" 没有定义属性`,
        impact: '无法生成完整的数据模型',
        suggestion: '添加关键业务属性'
      });
    }

    // 检查 Actions
    if (!obj.actions || obj.actions.length === 0) {
      issues.push({
        id: `obj-${idx}-no-actions`,
        type: 'suggestion',
        category: 'action',
        message: `对象 "${obj.name}" 没有定义操作`,
        impact: '对象可能只是数据存储，无业务逻辑',
        suggestion: '考虑添加关键业务操作'
      });
    } else {
      // 检查 Action 三层定义（使用新的 businessLayer/logicLayer/implementationLayer 结构）
      obj.actions.forEach((action, aidx) => {
        // 业务层检查：description + businessLayer（或旧的 targetObject 兼容）
        const hasBusinessLayer = action.description && (
          action.businessLayer?.targetObject ||
          action.businessLayer?.description ||
          (action as any).targetObject  // 兼容旧字段
        );

        // 逻辑层检查：logicLayer.preconditions/postconditions（或旧字段兼容）
        const hasLogicLayer = (
          action.logicLayer?.preconditions?.length ||
          action.logicLayer?.postconditions?.length ||
          action.logicLayer?.parameters?.length ||
          (action as any).preconditions?.length ||  // 兼容旧字段
          (action as any).postconditions?.length    // 兼容旧字段
        );

        // 实现层检查：implementationLayer.apiEndpoint/agentToolSpec（或旧字段兼容）
        const hasImplLayer = (
          action.implementationLayer?.apiEndpoint ||
          action.implementationLayer?.agentToolSpec ||
          (action as any).apiEndpoint ||  // 兼容旧字段
          (action as any).agentToolSpec   // 兼容旧字段
        );

        if (!hasBusinessLayer) {
          issues.push({
            id: `action-${idx}-${aidx}-no-biz`,
            type: 'warning',
            category: 'action',
            message: `操作 "${action.name}" 缺少业务层定义`,
            impact: '业务方可能不理解操作含义',
            suggestion: '添加业务描述（businessLayer）和目标对象'
          });
        }

        if (!hasLogicLayer) {
          issues.push({
            id: `action-${idx}-${aidx}-no-logic`,
            type: 'suggestion',
            category: 'action',
            message: `操作 "${action.name}" 缺少逻辑层定义`,
            impact: '执行条件和结果不明确',
            suggestion: '添加前置条件和后置条件（logicLayer）'
          });
        }

        // 实现层是可选的，在早期阶段不需要
      });
    }
  });

  return issues;
}

// 检查 Links 定义
function analyzeLinks(project: ProjectState): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];

  // 如果有对象但没有 Links
  if (project.objects && project.objects.length >= 2 && (!project.links || project.links.length === 0)) {
    issues.push({
      id: 'no-links',
      type: 'suggestion',
      category: 'object',  // Links 属于对象关系范畴
      message: '尚未定义对象间关系',
      impact: '对象之间的关联关系不明确，可能导致数据模型不完整',
      suggestion: '考虑添加对象之间的关系，如"订单包含产品"、"客户关联订单"等'
    });
    return issues;
  }

  // 检查孤立对象（没有任何 Link 连接的对象）
  if (project.objects && project.objects.length > 1 && project.links && project.links.length > 0) {
    const linkedObjects = new Set<string>();
    project.links.forEach(link => {
      linkedObjects.add(link.source);
      linkedObjects.add(link.target);
    });

    project.objects.forEach(obj => {
      if (!linkedObjects.has(obj.name) && !linkedObjects.has(obj.id)) {
        issues.push({
          id: `orphan-obj-${obj.id}`,
          type: 'warning',
          category: 'object',
          message: `对象 "${obj.name}" 没有与其他对象建立关系`,
          impact: '孤立对象可能在业务流程中缺少上下文',
          suggestion: '考虑添加该对象与其他对象的关联关系'
        });
      }
    });
  }

  // 检查 Link 标签是否有意义
  if (project.links) {
    project.links.forEach((link, idx) => {
      if (!link.label || link.label.length < 2) {
        issues.push({
          id: `link-${idx}-no-label`,
          type: 'warning',
          category: 'object',
          message: `关系 "${link.source} → ${link.target}" 缺少有意义的标签`,
          impact: '关系语义不清晰',
          suggestion: '添加描述性标签，如"包含"、"关联"、"生成"等'
        });
      }
    });
  }

  return issues;
}

// 检查集成定义
function analyzeIntegrations(project: ProjectState): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];

  if (!project.integrations || project.integrations.length === 0) {
    // 没有集成只是建议，不是风险
    issues.push({
      id: 'no-integrations',
      type: 'suggestion',
      category: 'integration',
      message: '尚未定义数据源集成',
      impact: '后期可能需要重新梳理数据来源',
      suggestion: '考虑添加核心数据源系统'
    });
    return issues;
  }

  project.integrations.forEach((integration, idx) => {
    if (!integration.dataPoints || integration.dataPoints.length === 0) {
      issues.push({
        id: `int-${idx}-no-data`,
        type: 'warning',
        category: 'integration',
        message: `集成 "${integration.systemName}" 没有定义数据点`,
        impact: '无法确定需要同步的数据',
        suggestion: '明确需要从该系统获取的数据字段'
      });
    }
  });

  return issues;
}

// 主检查函数
export function checkReadiness(
  project: ProjectState,
  chatMessages: ChatMessage[],
  lang: 'cn' | 'en' = 'cn'
): ReadinessReport {
  const allIssues: ReadinessIssue[] = [];

  // 1. 检查对话内容
  const contentAnalysis = analyzeConversationContent(chatMessages);

  if (!contentAnalysis.hasSubstance && (!project.objects || project.objects.length === 0)) {
    // 唯一的硬阻塞：完全没有任何输入
    allIssues.push({
      id: 'no-input',
      type: 'blocker',
      category: 'content',
      message: lang === 'cn' ? '需要先提供业务信息' : 'Business information required',
      detail: lang === 'cn'
        ? '请在对话中描述您的业务场景，或手动添加业务对象'
        : 'Please describe your business scenario in the chat, or manually add objects',
      impact: lang === 'cn' ? '无法生成任何设计' : 'Cannot generate any design',
      suggestion: lang === 'cn'
        ? '开始描述您要解决的业务问题、涉及的数据和操作流程'
        : 'Start by describing the business problem, data involved, and workflows'
    });
  } else {
    // 内容分析 - 只生成建议
    if (!contentAnalysis.businessContext) {
      allIssues.push({
        id: 'missing-business-context',
        type: 'suggestion',
        category: 'content',
        message: lang === 'cn' ? '建议补充业务背景信息' : 'Consider adding business context',
        impact: lang === 'cn' ? '设计可能缺少业务目标导向' : 'Design may lack business goal orientation',
        suggestion: lang === 'cn' ? '描述要解决的核心问题和期望目标' : 'Describe the core problem and expected goals'
      });
    }

    if (!contentAnalysis.dataContext && project.integrations?.length === 0) {
      allIssues.push({
        id: 'missing-data-context',
        type: 'warning',
        category: 'content',
        message: lang === 'cn' ? '缺少数据源信息' : 'Missing data source information',
        impact: lang === 'cn' ? '集成设计可能需要后续补充' : 'Integration design may need later additions',
        suggestion: lang === 'cn' ? '说明数据存储在哪些系统中' : 'Explain which systems store the data'
      });
    }
  }

  // 2. 检查对象
  allIssues.push(...analyzeObjects(project.objects));

  // 3. 检查 Links（对象间关系）
  allIssues.push(...analyzeLinks(project));

  // 4. 检查集成
  allIssues.push(...analyzeIntegrations(project));

  // 计算分数和级别
  const summary = {
    blockers: allIssues.filter(i => i.type === 'blocker').length,
    risks: allIssues.filter(i => i.type === 'risk').length,
    warnings: allIssues.filter(i => i.type === 'warning').length,
    suggestions: allIssues.filter(i => i.type === 'suggestion').length
  };

  // 计算分数：blocker=-100, risk=-20, warning=-5, suggestion=-1
  let score = 100;
  score -= summary.blockers * 100;
  score -= summary.risks * 20;
  score -= summary.warnings * 5;
  score -= summary.suggestions * 1;
  score = Math.max(0, Math.min(100, score));

  // 确定级别
  let level: ReadinessLevel;
  if (summary.blockers > 0) {
    level = 'blocked';
  } else if (summary.risks > 0 || summary.warnings > 3) {
    level = 'risky';
  } else if (summary.warnings > 0) {
    level = 'acceptable';
  } else if (summary.suggestions > 0) {
    level = 'good';
  } else {
    level = 'excellent';
  }

  // 按类别分组
  const categories = ['content', 'object', 'action', 'integration', 'governance'] as const;
  const byCategory = {} as ReadinessReport['byCategory'];

  categories.forEach(cat => {
    const catIssues = allIssues.filter(i => i.category === cat);
    let catScore = 100;
    catIssues.forEach(i => {
      if (i.type === 'blocker') catScore -= 100;
      else if (i.type === 'risk') catScore -= 30;
      else if (i.type === 'warning') catScore -= 10;
      else catScore -= 2;
    });
    byCategory[cat] = {
      score: Math.max(0, catScore),
      issues: catIssues
    };
  });

  return {
    level,
    score,
    canProceed: summary.blockers === 0,  // 只有 blocker 阻止继续
    issues: allIssues,
    summary,
    byCategory
  };
}

// 获取友好的级别显示
export function getReadinessDisplay(level: ReadinessLevel, lang: 'cn' | 'en' = 'cn') {
  const displays = {
    blocked: {
      cn: { label: '无法继续', color: '#f85149', bgColor: 'rgba(248, 81, 73, 0.15)' },
      en: { label: 'Blocked', color: '#f85149', bgColor: 'rgba(248, 81, 73, 0.15)' }
    },
    risky: {
      cn: { label: '有风险', color: '#d29922', bgColor: 'rgba(210, 153, 34, 0.15)' },
      en: { label: 'Risky', color: '#d29922', bgColor: 'rgba(210, 153, 34, 0.15)' }
    },
    acceptable: {
      cn: { label: '可接受', color: '#58a6ff', bgColor: 'rgba(88, 166, 255, 0.15)' },
      en: { label: 'Acceptable', color: '#58a6ff', bgColor: 'rgba(88, 166, 255, 0.15)' }
    },
    good: {
      cn: { label: '良好', color: '#3fb950', bgColor: 'rgba(63, 185, 80, 0.15)' },
      en: { label: 'Good', color: '#3fb950', bgColor: 'rgba(63, 185, 80, 0.15)' }
    },
    excellent: {
      cn: { label: '优秀', color: '#a371f7', bgColor: 'rgba(163, 113, 247, 0.15)' },
      en: { label: 'Excellent', color: '#a371f7', bgColor: 'rgba(163, 113, 247, 0.15)' }
    }
  };

  return displays[level][lang];
}

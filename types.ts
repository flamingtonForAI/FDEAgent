
export type Language = 'en' | 'cn';

export enum AIPComponentType {
  OBJECT = 'OBJECT',
  LINK = 'LINK',
  ACTION = 'ACTION',
  AI_LOGIC = 'AI_LOGIC'
}

export enum AIIntegrationType {
  PARSING = 'Parsing Pipeline (Unstructured to Structured)',
  SMART_PROPERTY = 'Smart Property (LLM Derived)',
  SEMANTIC_SEARCH = 'Semantic Search (Vector Linking)',
  GENERATIVE_ACTION = 'Generative Action (AI Output)'
}

export interface Property {
  name: string;
  type: string;
  isAIDerived?: boolean;
  logicDescription?: string;
}

// Action参数定义
export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description: string;
}

// Action三层定义
export interface AIPAction {
  name: string;
  type: 'traditional' | 'generative';
  description: string;
  aiLogic?: string;

  // === 三层定义 ===

  // 业务层 Business Layer
  businessLayer?: {
    description: string;      // 业务描述（自然语言）
    targetObject: string;     // 目标对象
    executorRole: string;     // 执行角色（谁有权限）
    triggerCondition?: string; // 触发条件（什么时候需要执行）
  };

  // 逻辑层 Logic Layer
  logicLayer?: {
    preconditions: string[];  // 前置条件
    parameters: ActionParameter[];  // 输入参数
    postconditions: string[]; // 后置状态变更
    sideEffects?: string[];   // 副作用（通知、日志等）
  };

  // 实现层 Implementation Layer
  implementationLayer?: {
    apiEndpoint?: string;     // API端点 (e.g., /api/orders/{id}/approve)
    apiMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requestPayload?: Record<string, any>;  // 请求体结构示例
    agentToolSpec?: {         // Agent Tool规范
      name: string;
      description: string;
      parameters: Record<string, any>;  // JSON Schema格式
    };
  };

  // === 治理属性 (Human-in-the-Loop Governance) ===
  // Permission Tiers for controlled automation:
  //   Tier 1: Full Auto - Read operations, low-risk status changes (no human review)
  //   Tier 2: Auto + Audit - Standard operations with audit trail (async review possible)
  //   Tier 3: Human Confirm - Business-critical ops require human confirmation before execution
  //   Tier 4: Multi-Approve - High-risk/irreversible operations need multiple approvals
  // Higher tier = more human oversight, aligned with increasing business risk
  governance?: {
    permissionTier: 1 | 2 | 3 | 4;  // 权限等级 (1=最自动化, 4=最严格控制)
    requiresHumanApproval: boolean; // 是否需要人工审批
    auditLog: boolean;              // 是否记录审计日志
    riskLevel?: 'low' | 'medium' | 'high';  // 风险等级
  };
}

export interface ExternalIntegration {
  systemName: string;
  dataPoints: string[];
  mechanism: string;
  targetObjectId: string;
}

export interface OntologyObject {
  id: string;
  name: string;
  description: string;
  properties: Property[];
  actions: AIPAction[];
  aiFeatures: {
    type: AIIntegrationType;
    description: string;
  }[];
}

export interface OntologyLink {
  id: string;
  source: string;
  target: string;
  label: string;
  isSemantic?: boolean;
}

export interface ProjectState {
  industry: string;
  useCase: string;
  objects: OntologyObject[];
  links: OntologyLink[];
  integrations: ExternalIntegration[];
  status: 'scouting' | 'designing' | 'completed';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ============= AI Provider Settings =============

export type AIProvider = 'gemini' | 'openrouter' | 'zhipu' | 'moonshot' | 'openai' | 'custom';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  baseUrl: string;
  models: AIModelConfig[];
  requiresApiKey: boolean;
}

export interface AIModelConfig {
  id: string;
  name: string;
  description?: string;
}

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customBaseUrl?: string;
}

// 预定义的Provider配置
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: '统一API访问多种模型（推荐）',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    models: [
      // 2025最新旗舰模型
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', description: '最新推荐' },
      { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', description: '最强推理' },
      { id: 'openai/gpt-4.1', name: 'GPT-4.1', description: 'OpenAI 最新' },
      { id: 'openai/o3-mini', name: 'o3 Mini', description: '推理模型' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Google 最新' },
      { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '快速' },
      // 经济模型
      { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3', description: '性价比之王' },
      { id: 'qwen/qwen-3-235b', name: 'Qwen 3 235B', description: '中文优化' },
      { id: 'meta-llama/llama-4-405b', name: 'Llama 4 405B', description: '开源最强' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: '经济实惠' },
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI Studio（支持刷新）',
    baseUrl: 'https://generativelanguage.googleapis.com',
    requiresApiKey: true,
    models: [
      { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro', description: '最新旗舰' },
      { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', description: '最新快速' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '稳定版' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '长上下文' },
    ]
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    description: '智谱AI大模型（支持刷新）',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    requiresApiKey: true,
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', description: '旗舰' },
      { id: 'glm-4-air', name: 'GLM-4 Air', description: '高性价比' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', description: '快速免费' },
      { id: 'glm-4v-plus', name: 'GLM-4V Plus', description: '多模态' },
    ]
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    description: '月之暗面 Kimi（支持刷新）',
    baseUrl: 'https://api.moonshot.cn/v1',
    requiresApiKey: true,
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2 Preview', description: '最新 K2 模型（推荐）' },
      { id: 'moonshot-v1-auto', name: 'Moonshot v1 Auto', description: '自动选择上下文' },
      { id: 'moonshot-v1-128k', name: 'Moonshot v1 128K', description: '超长上下文 128K' },
      { id: 'moonshot-v1-32k', name: 'Moonshot v1 32K', description: '长上下文 32K' },
      { id: 'moonshot-v1-8k', name: 'Moonshot v1 8K', description: '标准 8K' },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI官方API（支持刷新）',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', description: '最新旗舰' },
      { id: 'gpt-4o', name: 'GPT-4o', description: '多模态' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '经济' },
      { id: 'o3-mini', name: 'o3 Mini', description: '推理模型' },
      { id: 'o1', name: 'o1', description: '深度推理' },
    ]
  },
  {
    id: 'custom',
    name: '自定义',
    description: '自定义OpenAI兼容API',
    baseUrl: '',
    requiresApiKey: true,
    models: [
      { id: 'custom', name: '自定义模型', description: '手动输入模型ID' },
    ]
  }
];

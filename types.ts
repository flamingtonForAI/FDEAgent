
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

  // === 治理属性 ===
  governance?: {
    permissionTier: 1 | 2 | 3 | 4;  // 权限等级
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

export type AIProvider = 'gemini' | 'openrouter' | 'zhipu' | 'openai' | 'custom';

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
      // 旗舰模型
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: '推荐' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: '最强推理' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'OpenAI 旗舰' },
      { id: 'openai/o1-preview', name: 'o1 Preview', description: '推理模型' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', description: 'Google' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash', description: '快速' },
      // 经济模型
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: '便宜好用' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', description: '中文优化' },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: '开源最强' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: '经济实惠' },
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI Studio',
    baseUrl: 'https://generativelanguage.googleapis.com',
    requiresApiKey: true,
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '最新' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '高质量' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '快速' },
    ]
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    description: '智谱AI大模型',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    requiresApiKey: true,
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', description: '旗舰' },
      { id: 'glm-4', name: 'GLM-4', description: '高质量' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', description: '快速经济' },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI官方API',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: '旗舰' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '经济' },
      { id: 'o1-preview', name: 'o1 Preview', description: '推理' },
      { id: 'o1-mini', name: 'o1 Mini', description: '轻量推理' },
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

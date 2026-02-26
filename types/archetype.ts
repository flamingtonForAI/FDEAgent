/**
 * Archetype Type Definitions
 * 原型类型定义
 *
 * Archetype 是将行业经验产品化的核心载体
 * 它不是模板，而是 Ontology 的预配置视图
 *
 * ═══════════════════════════════════════════════════════════════════
 * Ontology Architecture (3-Layer + AI Capability Overlay)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Core 3 Layers:
 * - Semantic Layer: Business concept definitions (Objects, Properties, Links)
 * - Kinetic Layer: Data connectivity (Connectors, Sync, Mappings)
 * - Dynamic Layer: Business operations (Actions, Workflows, Rules)
 *
 * AI Capability Overlay (Not a 4th layer, but enablement across layers):
 * - AI augments Semantic (smart properties, embeddings)
 * - AI augments Dynamic (AI-assisted actions, generative ops)
 * - AI provides Agent capabilities on top of Ontology
 *
 * Key principles:
 * - Ontology = unified data model with executable actions
 * - AI capabilities leverage Ontology as substrate
 * ═══════════════════════════════════════════════════════════════════
 */

import { OntologyObject, OntologyLink } from '../types';

// ============= Kinetic Layer - 数据连接层 =============

/**
 * 数据源类型
 */
export type DataSourceType =
  | 'erp'           // ERP系统 (SAP, Oracle, etc.)
  | 'crm'           // CRM系统 (Salesforce, HubSpot, etc.)
  | 'mes'           // 制造执行系统
  | 'wms'           // 仓库管理系统
  | 'iot'           // IoT平台
  | 'database'      // 关系数据库
  | 'api'           // REST/GraphQL API
  | 'file'          // 文件系统 (CSV, Excel, etc.)
  | 'streaming'     // 流数据 (Kafka, etc.)
  | 'ehr'
  | 'lis'
  | 'ris'
  | 'pharmacy'
  | 'scheduling'
  | 'pos'
  | 'ecommerce'
  | 'loyalty';

/**
 * 同步频率
 */
export type SyncFrequency =
  | 'realtime'      // 实时
  | 'streaming'     // 流式
  | 'hourly'        // 每小时
  | 'daily'         // 每天
  | 'on-demand';    // 按需

/**
 * 数据连接器配置
 * Kinetic Layer 的核心 - 连接概念模型到真实数据
 */
export interface DataConnector {
  id?: string;
  name?: string;
  description?: {
    en: string;
    cn: string;
  } | string;

  // 源系统信息
  sourceType?: DataSourceType;
  sourceSystem?: string;        // e.g., "SAP S/4HANA", "Salesforce"
  sourceVersion?: string;

  // 连接配置模板
  connectionTemplate?: {
    // 必需的配置项
    requiredFields: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'secret';
      description: string;
      example?: string;
    }[];
    // 可选配置项
    optionalFields?: {
      name: string;
      type: 'string' | 'number' | 'boolean';
      description: string;
      default?: any;
    }[];
  };

  // 同步配置
  sync?: {
    direction: 'inbound' | 'outbound' | 'bidirectional';
    frequency: SyncFrequency;
    // 增量同步支持
    incrementalSync?: boolean;
    // 冲突解决策略
    conflictResolution?: 'source-wins' | 'target-wins' | 'manual';
  };

  // 映射的对象
  mappedObjects?: {
    objectId: string;
    // 源表/实体
    sourceEntity: string;
    // 字段映射
    fieldMappings: {
      sourceField: string;
      targetProperty: string;
      transformation?: string;  // 转换表达式
    }[];
  }[];
  targetObjects?: string[];
  [key: string]: any;
}

// ============= Dynamic Layer - 业务逻辑层 =============

/**
 * 工作流步骤
 */
export interface WorkflowStep {
  id?: string;
  name?: string;
  nameCn?: string;
  description?: {
    en: string;
    cn: string;
  } | string;

  // 步骤类型
  type?: 'action' | 'condition' | 'parallel' | 'wait' | 'notification';

  // 关联的 Action（如果是 action 类型）
  actionRef?: string;

  // 条件（如果是 condition 类型）
  condition?: {
    expression: string;
    trueBranch: string;   // 下一步骤 ID
    falseBranch: string;
  } | string;

  // 下一步骤
  nextSteps?: string[];
  order?: number;

  // 超时配置
  timeout?: {
    duration: string;     // e.g., "1h", "24h"
    action: 'fail' | 'skip' | 'escalate';
  };
  [key: string]: any;
}

/**
 * 业务工作流
 * 端到端的业务流程定义
 */
export interface BusinessWorkflow {
  id: string;
  name: string;
  nameCn?: string;
  descriptionCn?: string;
  description: {
    en: string;
    cn: string;
  } | string;

  // 触发条件
  trigger?: {
    type: 'manual' | 'scheduled' | 'event' | 'condition';
    config: Record<string, any>;
  };
  triggerType?: string;
  triggerCondition?: string;

  // 工作流步骤
  steps: WorkflowStep[];

  // 入口步骤
  entryStep?: string;

  // 涉及的角色
  roles?: string[];

  // SLA 配置
  sla?: {
    maxDuration?: string;
    escalationPath?: string[];
    targetTime?: string;
    escalationTime?: string;
  };
}

/**
 * 业务规则
 */
export interface BusinessRule {
  id: string;
  name: string;
  nameCn?: string;
  category?: string;
  description?: {
    en: string;
    cn: string;
  } | string;

  // 规则类型
  type?: 'validation' | 'calculation' | 'trigger' | 'constraint';

  // 应用的对象
  appliesTo?: string[];  // Object IDs

  // 规则表达式
  expression?: string;

  // 违反时的处理
  onViolation?: {
    action: 'block' | 'warn' | 'notify';
    message: {
      en: string;
      cn: string;
    };
  };
  [key: string]: any;
}

// ============= UI Layer - 界面模板层 =============

/**
 * 仪表盘 Widget 类型
 */
export type WidgetType =
  | 'kpi'           // KPI 指标卡
  | 'chart'         // 图表
  | 'table'         // 数据表格
  | 'map'           // 地图
  | 'timeline'      // 时间线
  | 'list'          // 列表
  | 'form'          // 表单
  | 'action-panel'; // 操作面板

/**
 * Widget 配置
 */
export interface DashboardWidget {
  id?: string;
  type: WidgetType;
  title: {
    en: string;
    cn: string;
  } | string;

  // 数据源配置
  dataSource: {
    objectId: string;
    query?: string;
    filters?: Record<string, any>;
    aggregation?: string;
  } | string;

  // 布局配置
  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // 样式配置
  style?: Record<string, any>;

  // 交互配置
  interactions?: {
    onClick?: string;      // Action ID
    onDrilldown?: string;  // 下钻目标
  };
  [key: string]: any;
}

/**
 * 仪表盘模板
 */
export interface DashboardTemplate {
  id: string;
  name: string;
  nameCn?: string;
  description: {
    en: string;
    cn: string;
  } | string;

  // 目标角色
  targetRole?: string;
  targetAudience?: string[];

  // 布局网格
  gridColumns?: number;
  gridRows?: number;
  layout?: string;

  // Widgets
  widgets: DashboardWidget[];

  // 全局筛选器
  globalFilters?: {
    property: string;
    label: string;
    type: 'select' | 'date-range' | 'search';
  }[];
  refreshInterval?: number;
  [key: string]: any;
}

/**
 * 视图模板（列表视图、详情视图等）
 */
export interface ViewTemplate {
  id: string;
  name: string;
  type: 'list' | 'detail' | 'kanban' | 'calendar' | 'graph';

  // 关联对象
  objectId: string;

  // 列/字段配置
  fields: {
    property: string;
    label: {
      en: string;
      cn: string;
    } | string;
    visible: boolean;
    sortable?: boolean;
    filterable?: boolean;
  }[];

  // 默认排序
  defaultSort?: {
    property: string;
    direction: 'asc' | 'desc';
  };

  // 可用的 Actions
  availableActions?: string[];
}

// ============= Archetype 完整定义 =============

/**
 * 部署环境配置
 */
export interface DeploymentConfig {
  // 最低要求
  requirements?: {
    platform: string[];     // e.g., ["DataPlatform", "AgentFramework"]
    minVersion?: string;
    resources?: {
      cpu?: string;
      memory?: string;
      storage?: string;
    };
  };

  // 环境变量
  environmentVariables?: {
    name: string;
    description: string;
    required: boolean;
    default?: string;
  }[];

  // 依赖的其他 Archetype
  dependencies?: {
    archetypeId: string;
    version: string;
  }[];
  prerequisites?: string[];
  phases?: unknown[];
  [key: string]: any;
}

/**
 * Archetype 元数据
 */
export interface ArchetypeMetadata {
  id: string;
  name: string;
  nameCn?: string;
  description: {
    en: string;
    cn: string;
  } | string;

  // 行业
  industry: string;
  // 业务领域
  domain: string;

  // 版本信息
  version: string;
  changelog?: {
    version: string;
    date: string;
    changes: string[];
  }[];

  // 来源信息（FDE 经验沉淀）
  origin?: {
    sourceEngagement?: string;  // 原始客户项目
    fdeContributors?: string[]; // 贡献的 FDE
    abstractionDate: string;    // 抽象时间
  };

  // 使用统计
  usage?: {
    deployments: number;
    industries: string[];
    avgDeploymentTime: string;
  };
}

/**
 * Archetype - 完整的行业解决方案原型
 *
 * Archetype 是将行业咨询经验产品化的核心：
 * 1. 从现场实施经验中提炼
 * 2. 包含完整的 Ontology（语义+动力+动态 三层）+ AI 能力叠加
 * 3. 可在几天内部署，而非几个月
 * 4. 持续演进，吸收新的行业最佳实践
 *
 * 架构说明：
 * - Ontology 三层是核心数据模型
 * - AI 能力是叠加层(overlay)，不是第四层
 * - AI 通过增强 Semantic(智能属性) 和 Dynamic(AI辅助动作) 发挥作用
 */
export interface Archetype {
  metadata: ArchetypeMetadata;

  // ═══════════════════════════════════════════════════════════════════
  // ONTOLOGY - 3 CORE LAYERS
  // ═══════════════════════════════════════════════════════════════════

  // ===== Semantic Layer =====
  // 业务概念模型 - What things ARE
  ontology: {
    objects: OntologyObject[];
    links: OntologyLink[];
  };

  // ===== Kinetic Layer =====
  // 数据连接层 - WHERE data comes from
  connectors: DataConnector[];

  // ===== Dynamic Layer =====
  // 业务逻辑层 - WHAT can be done (Actions, Workflows, Rules)
  workflows?: BusinessWorkflow[];
  rules?: BusinessRule[];
  businessRules?: BusinessRule[];

  // ═══════════════════════════════════════════════════════════════════
  // AI CAPABILITY OVERLAY (Not a 4th layer)
  // AI capabilities that ENHANCE the 3 Ontology layers
  // ═══════════════════════════════════════════════════════════════════

  // AI 能力叠加层 - HOW AI augments Ontology
  // These capabilities work THROUGH Semantic (smart properties) and Dynamic (AI actions)
  aiCapabilities: {
    id: string;
    name: string;
    nameCn?: string;
    type: 'parsing' | 'prediction' | 'optimization' | 'generation' | 'predictive' | 'classification' | 'clustering' | 'recommendation' | string;
    description: {
      en: string;
      cn: string;
    } | string;
    descriptionCn?: string;
    // 关联的 Actions
    enabledActions?: string[];
    // 模型配置
    modelConfig?: {
      modelType: string;
      trainingDataRequirements?: string;
    };
    inputObjects?: string[];
    outputObjects?: string[];
    [key: string]: any;
  }[];

  // ===== UI Templates =====
  // 预配置的界面
  dashboards?: DashboardTemplate[];
  views?: ViewTemplate[];

  // ===== Deployment =====
  // 部署配置
  deployment?: DeploymentConfig;

  // ===== Documentation =====
  // 文档和学习资源
  documentation?: {
    quickStart: {
      en: string;
      cn: string;
    } | string;
    tutorials?: {
      title: string;
      content: string;
    }[];
    bestPractices?: string[];
  };
}

// ============= Archetype Origin - 原型来源追踪 =============

/**
 * 原型来源类型
 * - static: 内置静态原型（随代码发布）
 * - reference: 从网络参考资料解析生成
 * - ai-generated: 由 AI 完全生成
 */
export type ArchetypeOriginType = 'static' | 'reference' | 'ai-generated';

/**
 * 原型来源信息
 * 用于追踪原型的产生方式和可信度
 */
export interface ArchetypeOrigin {
  type: ArchetypeOriginType;

  // === reference 类型专用字段 ===
  sourceUrl?: string;        // 参考资料 URL
  sourceName?: string;       // 参考资料名称
  fetchDate?: string;        // 获取日期 (ISO 8601)

  // === ai-generated 类型专用字段 ===
  generationDate?: string;   // 生成日期 (ISO 8601)
  modelUsed?: string;        // 使用的 AI 模型
  confidence?: number;       // AI 置信度 (0-1)
  promptVersion?: string;    // 使用的 prompt 版本

  // === 导入类型字段 ===
  importedAt?: string;       // 导入日期 (ISO 8601)
  fileName?: string;         // 导入的文件名

  // === 通用字段 ===
  userInput?: {              // 用户输入的原始信息
    industryName: string;
    description?: string;
  };
}

/**
 * Archetype 目录索引
 */
export interface ArchetypeIndex {
  id: string;
  name: string;
  description: {
    en: string;
    cn: string;
  } | string;
  industry: string;
  domain: string;
  version: string;

  // 快速统计
  stats: {
    objectCount: number;
    actionCount: number;
    connectorCount: number;
    workflowCount: number;
    dashboardCount: number;
  };

  // 标签
  tags: string[];

  // 预计部署时间
  estimatedDeploymentTime: string;

  // 缩略图
  thumbnail?: string;

  // 来源信息（用于区分内置 vs 导入的原型）
  origin?: ArchetypeOrigin;
}

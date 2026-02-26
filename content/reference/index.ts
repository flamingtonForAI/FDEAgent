// 参考资料 - Quick Reference Cards, Checklists, Glossary

import { Language } from '../../types';

export interface ReferenceCard {
  id: string;
  title: { en: string; cn: string };
  category: 'quick-ref' | 'checklist' | 'template' | 'glossary';
  icon: string;
  content: {
    en: string[];
    cn: string[];
  };
}

export interface GlossaryTerm {
  term: { en: string; cn: string };
  definition: { en: string; cn: string };
  category: 'core' | 'ai' | 'methodology' | 'technical';
}

// Quick Reference Cards
export const quickReferenceCards: ReferenceCard[] = [
  {
    id: 'qr_layers',
    title: { en: '4-Layer Architecture', cn: '四层架构速查' },
    category: 'quick-ref',
    icon: '📊',
    content: {
      en: [
        '**AI Layer** - Agent Framework, Tools, Governance',
        '**Dynamic Layer** - Actions, Workflows, Rules',
        '**Kinetic Layer** - Data Integration, ETL/ELT',
        '**Semantic Layer** - Objects, Links, Properties'
      ],
      cn: [
        '**AI 层** - Agent 框架、工具、治理',
        '**动态层** - Actions、工作流、规则',
        '**动力层** - 数据集成、ETL/ELT',
        '**语义层** - 对象、链接、属性'
      ]
    }
  },
  {
    id: 'qr_noun_verb',
    title: { en: 'Noun-Verb Quick Guide', cn: 'Noun-Verb 速查' },
    category: 'quick-ref',
    icon: '📝',
    content: {
      en: [
        '**Nouns → Objects**: Things you manage',
        '**Verbs → Actions**: Operations you perform',
        '**Adjectives → Properties**: Attributes of objects',
        '**Prepositions → Links**: Relationships between objects'
      ],
      cn: [
        '**名词 → 对象**: 你管理的事物',
        '**动词 → 动作**: 你执行的操作',
        '**形容词 → 属性**: 对象的特征',
        '**介词 → 链接**: 对象间的关系'
      ]
    }
  },
  {
    id: 'qr_agent_tiers',
    title: { en: 'Agent Tiers', cn: 'Agent 层级速查' },
    category: 'quick-ref',
    icon: '🤖',
    content: {
      en: [
        '**Tier 1**: Read-only Q&A, no writes',
        '**Tier 2**: Task assistant, writes need approval',
        '**Tier 3**: Embedded agent, high-risk needs approval',
        '**Tier 4**: Autonomous, audit-only'
      ],
      cn: [
        '**第一层**: 只读问答，无写操作',
        '**第二层**: 任务助手，写操作需审批',
        '**第三层**: 嵌入式，高风险需审批',
        '**第四层**: 自主，仅审计'
      ]
    }
  },
  {
    id: 'qr_tool_naming',
    title: { en: 'Tool Naming Convention', cn: '工具命名规范' },
    category: 'quick-ref',
    icon: '🔧',
    content: {
      en: [
        '**Search/Get**: search_{object}, get_{object}',
        '**Navigation**: get_{related}_{objects}',
        '**Execution**: {verb}_{object}',
        '**Analytics**: aggregate_{object}_{metric}'
      ],
      cn: [
        '**搜索/获取**: search_{对象}, get_{对象}',
        '**导航**: get_{相关}_{对象}',
        '**执行**: {动词}_{对象}',
        '**分析**: aggregate_{对象}_{指标}'
      ]
    }
  },
  {
    id: 'qr_object_types',
    title: { en: 'Object Classification', cn: '对象分类速查' },
    category: 'quick-ref',
    icon: '📦',
    content: {
      en: [
        '**Core Objects**: From system of record (immutable)',
        '**Derived Objects**: Combined/aggregated (ETL)',
        '**Use Case Objects**: User-created (editable)'
      ],
      cn: [
        '**核心对象**: 来自记录系统（不可变）',
        '**派生对象**: 组合/聚合（ETL）',
        '**用例对象**: 用户创建（可编辑）'
      ]
    }
  }
];

// Checklists
export const checklists: ReferenceCard[] = [
  {
    id: 'cl_discovery',
    title: { en: 'Discovery Phase Checklist', cn: '发现阶段检查清单' },
    category: 'checklist',
    icon: '✅',
    content: {
      en: [
        '☐ Identified all key stakeholders',
        '☐ Scheduled discovery interviews',
        '☐ Used functional requirement template',
        '☐ Shadowed actual user processes',
        '☐ Documented pain points',
        '☐ Identified 2-3 high-value use cases',
        '☐ Created stakeholder map',
        '☐ Validated findings with stakeholders'
      ],
      cn: [
        '☐ 识别所有关键利益相关者',
        '☐ 安排发现访谈',
        '☐ 使用功能需求模板',
        '☐ 跟踪实际用户流程',
        '☐ 记录痛点',
        '☐ 识别 2-3 个高价值用例',
        '☐ 创建利益相关者地图',
        '☐ 与利益相关者验证发现'
      ]
    }
  },
  {
    id: 'cl_modeling',
    title: { en: 'Modeling Phase Checklist', cn: '建模阶段检查清单' },
    category: 'checklist',
    icon: '✅',
    content: {
      en: [
        '☐ Extracted all Nouns (Objects)',
        '☐ Extracted all Verbs (Actions)',
        '☐ Classified objects (Core/Derived/Use Case)',
        '☐ Defined primary keys (string, unique)',
        '☐ Mapped relationships (cardinality)',
        '☐ Created state machine for Use Case objects',
        '☐ Documented Action preconditions',
        '☐ Reviewed with domain expert'
      ],
      cn: [
        '☐ 提取所有名词（对象）',
        '☐ 提取所有动词（动作）',
        '☐ 分类对象（核心/派生/用例）',
        '☐ 定义主键（字符串、唯一）',
        '☐ 映射关系（基数）',
        '☐ 为用例对象创建状态机',
        '☐ 记录 Action 前置条件',
        '☐ 与领域专家审查'
      ]
    }
  },
  {
    id: 'cl_action',
    title: { en: 'Action Design Checklist', cn: 'Action 设计检查清单' },
    category: 'checklist',
    icon: '✅',
    content: {
      en: [
        '☐ Action has clear business purpose',
        '☐ Defined target Object Type',
        '☐ Listed all input parameters',
        '☐ Specified preconditions (guards)',
        '☐ Documented state transition',
        '☐ Defined executor roles/permissions',
        '☐ Considered AI tier (1-4)',
        '☐ Designed rollback mechanism (if needed)'
      ],
      cn: [
        '☐ Action 有明确的业务目的',
        '☐ 定义目标对象类型',
        '☐ 列出所有输入参数',
        '☐ 指定前置条件（守卫）',
        '☐ 记录状态转换',
        '☐ 定义执行者角色/权限',
        '☐ 考虑 AI 层级（1-4）',
        '☐ 设计回滚机制（如需要）'
      ]
    }
  },
  {
    id: 'cl_ai_readiness',
    title: { en: 'AI Readiness Checklist', cn: 'AI 就绪检查清单' },
    category: 'checklist',
    icon: '✅',
    content: {
      en: [
        '☐ All Actions mapped to tools',
        '☐ Tool specifications complete',
        '☐ Permission tiers defined',
        '☐ Human-in-the-loop patterns selected',
        '☐ Citation mechanism implemented',
        '☐ Audit logging configured',
        '☐ Rate limits set',
        '☐ Rollback tested'
      ],
      cn: [
        '☐ 所有 Action 映射到工具',
        '☐ 工具规范完整',
        '☐ 权限层级定义',
        '☐ Human-in-the-loop 模式选择',
        '☐ 引用机制实现',
        '☐ 审计日志配置',
        '☐ 速率限制设置',
        '☐ 回滚测试'
      ]
    }
  },
  {
    id: 'cl_quality',
    title: { en: 'Ontology Quality Checklist', cn: 'Ontology 质量检查清单' },
    category: 'checklist',
    icon: '✅',
    content: {
      en: [
        '☐ Every property supports an Action',
        '☐ No orphan data (unused properties)',
        '☐ Natural language naming',
        '☐ Core Objects are read-only',
        '☐ Primary keys are strings',
        '☐ State machines are complete',
        '☐ Actions have clear executors',
        '☐ Governance rules defined'
      ],
      cn: [
        '☐ 每个属性支持某个 Action',
        '☐ 无孤儿数据（未使用的属性）',
        '☐ 自然语言命名',
        '☐ 核心对象只读',
        '☐ 主键是字符串',
        '☐ 状态机完整',
        '☐ Action 有明确执行者',
        '☐ 治理规则定义'
      ]
    }
  }
];

// Interview Templates
export const interviewTemplates: ReferenceCard[] = [
  {
    id: 'tmpl_interview',
    title: { en: 'Discovery Interview Questions', cn: '发现访谈问题模板' },
    category: 'template',
    icon: '💬',
    content: {
      en: [
        '**Opening:**',
        '"Walk me through your typical day"',
        '"What\'s the most time-consuming part?"',
        '',
        '**Decision-Focused:**',
        '"What\'s the hardest decision you make?"',
        '"What information do you need for that decision?"',
        '"What happens after you decide?"',
        '',
        '**Pain Points:**',
        '"What could go wrong?"',
        '"What workarounds do you use?"',
        '"What would make your job easier?"'
      ],
      cn: [
        '**开场：**',
        '"带我走一遍你典型的一天"',
        '"最耗时的部分是什么？"',
        '',
        '**聚焦决策：**',
        '"你做的最难的决策是什么？"',
        '"做这个决策需要什么信息？"',
        '"决策之后会发生什么？"',
        '',
        '**痛点：**',
        '"可能出什么问题？"',
        '"你使用什么变通方法？"',
        '"什么能让你的工作更轻松？"'
      ]
    }
  },
  {
    id: 'tmpl_requirement',
    title: { en: 'Functional Requirement Template', cn: '功能需求模板' },
    category: 'template',
    icon: '📋',
    content: {
      en: [
        '**Format:**',
        '[User Type] [Interface] [Decision] [Decision Inputs] [Action]',
        '',
        '**Example:**',
        '[Route Analyst] [Alert Inbox] [Triages alerts]',
        '[Priority, Flight Details] [Re-assign, Resolve, Escalate]',
        '',
        '**Mapping:**',
        'User Type → Permissions',
        'Interface → Application',
        'Decision → Logic/Workflow',
        'Decision Inputs → Properties/Links',
        'Action → Actions'
      ],
      cn: [
        '**格式：**',
        '[用户类型] [界面] [决策] [决策输入] [动作]',
        '',
        '**示例：**',
        '[路线分析师] [告警收件箱] [分类告警]',
        '[优先级、航班详情] [重新分配、解决、升级]',
        '',
        '**映射：**',
        '用户类型 → 权限',
        '界面 → 应用',
        '决策 → 逻辑/工作流',
        '决策输入 → 属性/链接',
        '动作 → Actions'
      ]
    }
  }
];

// Glossary
export const glossaryTerms: GlossaryTerm[] = [
  // Core Concepts
  {
    term: { en: 'Ontology', cn: 'Ontology（本体）' },
    definition: {
      en: 'A unified data model that defines Objects (nouns), Actions (verbs), and their relationships. Unlike Knowledge Graph, Ontology enables operations, not just queries.',
      cn: '定义对象（名词）、动作（动词）及其关系的统一数据模型。与知识图谱不同，Ontology 支持操作，而不仅仅是查询。'
    },
    category: 'core'
  },
  {
    term: { en: 'Object Type', cn: '对象类型' },
    definition: {
      en: 'A category of business entities with shared properties. Objects are the "nouns" of the Ontology (e.g., Order, Customer, Product).',
      cn: '具有共享属性的业务实体类别。对象是 Ontology 的「名词」（如订单、客户、产品）。'
    },
    category: 'core'
  },
  {
    term: { en: 'Action', cn: 'Action（动作）' },
    definition: {
      en: 'An executable operation that changes the state of Objects. Actions are the "verbs" of the Ontology with preconditions, postconditions, and governance rules.',
      cn: '改变对象状态的可执行操作。Action 是 Ontology 的「动词」，具有前置条件、后置条件和治理规则。'
    },
    category: 'core'
  },
  {
    term: { en: 'Link Type', cn: '链接类型' },
    definition: {
      en: 'A relationship between two Object Types with defined cardinality (1:1, 1:N, N:N). Links enable navigation between related objects.',
      cn: '两个对象类型之间具有定义基数（1:1、1:N、N:N）的关系。链接支持在相关对象之间导航。'
    },
    category: 'core'
  },
  // AI Concepts
  {
    term: { en: 'Agent', cn: 'Agent（代理）' },
    definition: {
      en: 'An AI-powered assistant that can understand natural language and execute Ontology operations through tools.',
      cn: '一个 AI 驱动的助手，能够理解自然语言并通过工具执行 Ontology 操作。'
    },
    category: 'ai'
  },
  {
    term: { en: 'Tool', cn: 'Tool（工具）' },
    definition: {
      en: 'A callable function that maps to an Ontology Action or query. Tools are the interface between LLMs and business operations.',
      cn: '映射到 Ontology Action 或查询的可调用函数。工具是 LLM 和业务操作之间的接口。'
    },
    category: 'ai'
  },
  {
    term: { en: 'Human-in-the-Loop', cn: 'Human-in-the-Loop' },
    definition: {
      en: 'A design pattern requiring human approval for certain AI actions. Ensures accountability for high-stakes decisions.',
      cn: '要求人工审批某些 AI 操作的设计模式。确保高风险决策的问责制。'
    },
    category: 'ai'
  },
  {
    term: { en: 'Citation', cn: 'Citation（引用）' },
    definition: {
      en: 'A reference to the source data that supports an AI output. Required for traceability and hallucination prevention.',
      cn: '支持 AI 输出的源数据引用。用于可追溯性和防止幻觉。'
    },
    category: 'ai'
  },
  // Methodology
  {
    term: { en: 'FDE', cn: 'FDE（前线部署工程师）' },
    definition: {
      en: 'Forward Deployed Engineer. A consultant who implements Ontology solutions at client sites using the 5-phase methodology.',
      cn: 'Forward Deployed Engineer（前线部署工程师）。使用五阶段方法论在客户现场实施 Ontology 解决方案的顾问。'
    },
    category: 'methodology'
  },
  {
    term: { en: 'Decision-First', cn: 'Decision-First' },
    definition: {
      en: 'A design principle that starts with "what decisions need to be made?" rather than "what data do we have?"',
      cn: '一种设计原则，从「需要做出什么决策？」开始，而不是「我们有什么数据？」'
    },
    category: 'methodology'
  },
  {
    term: { en: 'Noun-Verb Framework', cn: 'Noun-Verb 框架' },
    definition: {
      en: 'A method for extracting Ontology from business descriptions by identifying nouns (Objects) and verbs (Actions).',
      cn: '通过识别名词（对象）和动词（动作）从业务描述中提取 Ontology 的方法。'
    },
    category: 'methodology'
  },
  // Technical
  {
    term: { en: 'Semantic Layer', cn: '语义层' },
    definition: {
      en: 'The layer that defines business concepts - Object Types, properties, and relationships. Answers "what things are".',
      cn: '定义业务概念的层 - 对象类型、属性和关系。回答「事物是什么」。'
    },
    category: 'technical'
  },
  {
    term: { en: 'Kinetic Layer', cn: '动力层' },
    definition: {
      en: 'The layer that connects the semantic model to real data sources through ETL/ELT pipelines. Answers "where data comes from".',
      cn: '通过 ETL/ELT 管道将语义模型连接到真实数据源的层。回答「数据从哪里来」。'
    },
    category: 'technical'
  },
  {
    term: { en: 'Dynamic Layer', cn: '动态层' },
    definition: {
      en: 'The layer that defines behavior - Actions, workflows, rules, and permissions. Answers "what can be done".',
      cn: '定义行为的层 - Actions、工作流、规则和权限。回答「能做什么」。'
    },
    category: 'technical'
  },
  {
    term: { en: 'Mock Ontology', cn: 'Mock Ontology' },
    definition: {
      en: 'Placeholder data conforming to the final schema. Enables frontend and backend teams to work in parallel.',
      cn: '符合最终 schema 的占位数据。使前端和后端团队能够并行工作。'
    },
    category: 'technical'
  }
];

// Learning Paths by Role
export interface LearningPath {
  id: string;
  role: { en: string; cn: string };
  description: { en: string; cn: string };
  icon: string;
  color: string;
  modules: {
    id: string;
    title: { en: string; cn: string };
    lessons: string[];
  }[];
  estimatedHours: number;
}

export const learningPaths: LearningPath[] = [
  {
    id: 'path_fde',
    role: { en: 'FDE Consultant', cn: 'FDE 顾问' },
    description: {
      en: 'Complete training for Forward Deployed Engineers implementing Ontology at client sites',
      cn: '面向在客户现场实施 Ontology 的前线部署工程师的完整培训'
    },
    icon: '🎯',
    color: 'blue',
    modules: [
      {
        id: 'fde_foundation',
        title: { en: 'Foundation', cn: '基础' },
        lessons: ['l1_1', 'l1_2', 'l1_3', 'l1_4']
      },
      {
        id: 'fde_methodology',
        title: { en: 'FDE Methodology', cn: 'FDE 方法论' },
        lessons: ['m1_1', 'm1_2', 'm1_3', 'm1_4']
      },
      {
        id: 'fde_action',
        title: { en: 'Action Mastery', cn: 'Action 精通' },
        lessons: ['l2_1', 'l2_2', 'l2_3', 'l2_4']
      },
      {
        id: 'fde_ai',
        title: { en: 'AI Layer', cn: 'AI 层' },
        lessons: ['ai_1', 'ai_2', 'ai_3', 'ai_4']
      }
    ],
    estimatedHours: 12
  },
  {
    id: 'path_analyst',
    role: { en: 'Business Analyst', cn: '业务分析师' },
    description: {
      en: 'Focused training on requirements gathering and Ontology modeling',
      cn: '聚焦于需求收集和 Ontology 建模的培训'
    },
    icon: '📊',
    color: 'emerald',
    modules: [
      {
        id: 'analyst_foundation',
        title: { en: 'Core Concepts', cn: '核心概念' },
        lessons: ['l1_1', 'l1_3', 'l1_4']
      },
      {
        id: 'analyst_discovery',
        title: { en: 'Discovery Skills', cn: '发现技能' },
        lessons: ['m1_1', 'm1_2']
      },
      {
        id: 'analyst_action',
        title: { en: 'Action Design', cn: 'Action 设计' },
        lessons: ['l2_1', 'l2_2']
      }
    ],
    estimatedHours: 6
  },
  {
    id: 'path_architect',
    role: { en: 'Solution Architect', cn: '解决方案架构师' },
    description: {
      en: 'Technical deep-dive on architecture, implementation, and AI integration',
      cn: '架构、实施和 AI 集成的技术深入'
    },
    icon: '🏗️',
    color: 'purple',
    modules: [
      {
        id: 'arch_foundation',
        title: { en: 'Architecture', cn: '架构' },
        lessons: ['l1_2', 'm1_3', 'm1_4']
      },
      {
        id: 'arch_implementation',
        title: { en: 'Implementation', cn: '实施' },
        lessons: ['l2_3', 'l2_4']
      },
      {
        id: 'arch_ai',
        title: { en: 'AI Integration', cn: 'AI 集成' },
        lessons: ['ai_1', 'ai_2', 'ai_3', 'ai_4']
      }
    ],
    estimatedHours: 8
  }
];

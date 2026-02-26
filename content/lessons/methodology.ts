// 方法论体系课程内容 - FDE Implementation Methodology

import { LessonContent } from './level1';

export const methodologyLessons: LessonContent[] = [
  // M1: 五阶段实施法概览
  {
    id: 'm1_1',
    title: {
      en: 'Five-Phase Implementation Overview',
      cn: 'FDE 五阶段实施法概览'
    },
    sections: [
      {
        title: { en: 'The FDE Approach', cn: 'FDE 方法' },
        content: {
          en: 'The Forward Deployed Engineer (FDE) methodology is a battle-tested approach for implementing enterprise Ontology. It consists of five distinct phases, each with clear objectives and deliverables.',
          cn: 'Forward Deployed Engineer (FDE) 方法论是一套经过实战检验的企业 Ontology 实施方法。它包含五个明确的阶段，每个阶段都有清晰的目标和交付物。'
        },
        type: 'text'
      },
      {
        title: { en: 'The Five Phases', cn: '五个阶段' },
        content: { en: '', cn: '' },
        type: 'diagram',
        data: {
          phases: [
            {
              number: 1,
              name: { en: 'Discovery', cn: '发现' },
              subtitle: { en: 'The "Listen" Phase', cn: '「倾听」阶段' },
              color: 'blue',
              activities: {
                en: ['Stakeholder Identification', 'Decision-Centric Interviews', 'Process Shadowing'],
                cn: ['利益相关者识别', '以决策为中心的访谈', '流程跟踪']
              },
              deliverables: {
                en: ['Stakeholder Map', 'Use Case Overview'],
                cn: ['利益相关者地图', '用例概览']
              }
            },
            {
              number: 2,
              name: { en: 'Modeling', cn: '建模' },
              subtitle: { en: 'The "Define" Phase', cn: '「定义」阶段' },
              color: 'emerald',
              activities: {
                en: ['Noun-Verb Extraction', 'Object Type Definition', 'Relationship Mapping'],
                cn: ['名词-动词提取', '对象类型定义', '关系映射']
              },
              deliverables: {
                en: ['Object/Action Inventory', 'Logical Ontology Design'],
                cn: ['对象/动作清单', '逻辑 Ontology 设计']
              }
            },
            {
              number: 3,
              name: { en: 'Architecture', cn: '架构' },
              subtitle: { en: 'The "Design" Phase', cn: '「设计」阶段' },
              color: 'purple',
              activities: {
                en: ['Kinetic Mapping', 'Enrichment Strategy', 'Dynamic Layer Design'],
                cn: ['动力层映射', '增强策略', '动态层设计']
              },
              deliverables: {
                en: ['Source-to-Object Matrix', 'Technical Architecture'],
                cn: ['源到对象映射矩阵', '技术架构图']
              }
            },
            {
              number: 4,
              name: { en: 'Implementation', cn: '实施' },
              subtitle: { en: 'The "Build" Phase', cn: '「构建」阶段' },
              color: 'orange',
              activities: {
                en: ['Mock Ontology Creation', 'Decoupled Development', 'Integration'],
                cn: ['Mock Ontology 创建', '解耦开发', '集成']
              },
              deliverables: {
                en: ['Mock Data Set', 'MVP'],
                cn: ['Mock 数据集', '最小可行产品']
              }
            },
            {
              number: 5,
              name: { en: 'Deployment', cn: '部署' },
              subtitle: { en: 'The "Scale" Phase', cn: '「扩展」阶段' },
              color: 'cyan',
              activities: {
                en: ['UAT', 'Value Measurement', 'Knowledge Transfer'],
                cn: ['用户验收测试', '价值衡量', '知识转移']
              },
              deliverables: {
                en: ['UAT Sign-off', 'Final Documentation'],
                cn: ['UAT 签收', '最终文档']
              }
            }
          ]
        }
      },
      {
        title: { en: 'Key Principle', cn: '核心原则' },
        content: {
          en: 'Each phase has a clear handoff. You cannot skip phases, but you can iterate within them. The key is to validate with stakeholders at each checkpoint.',
          cn: '每个阶段都有明确的交接点。不能跳过任何阶段，但可以在阶段内迭代。关键是在每个检查点与利益相关者验证。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What is the first deliverable in Phase 1 (Discovery)?',
          cn: '第一阶段（发现）的首个交付物是什么？'
        },
        options: [
          { en: 'Technical Architecture', cn: '技术架构' },
          { en: 'Stakeholder Map', cn: '利益相关者地图' },
          { en: 'MVP', cn: '最小可行产品' },
          { en: 'Object Schema', cn: '对象 Schema' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Phase 1 (Discovery) focuses on understanding who the stakeholders are and what decisions they need to make. The Stakeholder Map is the foundation for all subsequent work.',
          cn: '第一阶段（发现）专注于了解利益相关者是谁以及他们需要做出什么决策。利益相关者地图是所有后续工作的基础。'
        }
      }
    ]
  },

  // M2: Phase 1 - Discovery
  {
    id: 'm1_2',
    title: {
      en: 'Phase 1: Discovery Deep Dive',
      cn: '第一阶段：发现深入'
    },
    sections: [
      {
        title: { en: 'Objective', cn: '目标' },
        content: {
          en: 'Understand the current operational pain points and distill high-value use cases into actionable functional requirements.',
          cn: '理解当前的运营痛点，将高价值用例提炼为可执行的功能需求。'
        },
        type: 'text'
      },
      {
        title: { en: 'The Functional Requirement Template', cn: '功能需求模板' },
        content: {
          en: 'Every requirement should be captured in this format:\n\n**[User Type] [Interface] [Decision] [Decision Inputs] [Action]**\n\nThis structure directly maps to Ontology components.',
          cn: '每个需求都应该用这个格式捕获：\n\n**[用户类型] [界面] [决策] [决策输入] [动作]**\n\n这个结构直接映射到 Ontology 组件。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Template Mapping', cn: '模板映射' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Template Component', 'Example', 'Maps to Ontology'],
            cn: ['模板组件', '示例', '映射到 Ontology']
          },
          rows: [
            {
              en: ['User Type', 'Route Operations Analyst', 'Permissions/Roles (Dynamic)'],
              cn: ['用户类型', '路线运营分析师', '权限/角色（动态层）']
            },
            {
              en: ['Interface', 'Alert Inbox', 'Application (Dynamic)'],
              cn: ['界面', '告警收件箱', '应用（动态层）']
            },
            {
              en: ['Decision', 'Triages Alerts', 'Logic/Workflow (Dynamic)'],
              cn: ['决策', '分类告警', '逻辑/工作流（动态层）']
            },
            {
              en: ['Decision Inputs', 'Priority, Flight Details', 'Properties/Links (Semantic)'],
              cn: ['决策输入', '优先级、航班详情', '属性/链接（语义层）']
            },
            {
              en: ['Action', 'Re-assign, Resolve, Escalate', 'Actions (Dynamic)'],
              cn: ['动作', '重新分配、解决、升级', 'Actions（动态层）']
            }
          ]
        }
      },
      {
        title: { en: 'Interview Best Practices', cn: '访谈最佳实践' },
        content: {
          en: '**Magic Questions to Ask:**\n\n1. "Walk me through your typical day"\n2. "What\'s the hardest decision you make?"\n3. "What information do you need to make that decision?"\n4. "What do you do after you decide?"\n5. "What could go wrong?"',
          cn: '**必问的黄金问题：**\n\n1. "带我走一遍你典型的一天"\n2. "你做的最难的决策是什么？"\n3. "做这个决策需要什么信息？"\n4. "决策之后你做什么？"\n5. "可能出什么问题？"'
        },
        type: 'text'
      },
      {
        title: { en: 'Common Pitfall', cn: '常见陷阱' },
        content: {
          en: 'Don\'t ask "What data do you need?" This leads to data hoarding. Instead, ask "What decision do you need to make?" This reveals only the essential data.',
          cn: '不要问「你需要什么数据？」这会导致数据囤积。相反，问「你需要做什么决策？」这只会揭示必要的数据。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What is the correct format for capturing functional requirements?',
          cn: '捕获功能需求的正确格式是什么？'
        },
        options: [
          { en: '[Data] [Table] [Column] [Type]', cn: '[数据] [表] [列] [类型]' },
          { en: '[User Type] [Interface] [Decision] [Decision Inputs] [Action]', cn: '[用户类型] [界面] [决策] [决策输入] [动作]' },
          { en: '[API] [Endpoint] [Method] [Response]', cn: '[API] [端点] [方法] [响应]' },
          { en: '[Screen] [Button] [Flow] [Result]', cn: '[界面] [按钮] [流程] [结果]' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'The FDE methodology uses [User Type] [Interface] [Decision] [Decision Inputs] [Action] because this format directly maps to Ontology components and focuses on business decisions.',
          cn: 'FDE 方法论使用 [用户类型] [界面] [决策] [决策输入] [动作] 因为这个格式直接映射到 Ontology 组件并专注于业务决策。'
        }
      }
    ]
  },

  // M3: Phase 2 - Modeling
  {
    id: 'm1_3',
    title: {
      en: 'Phase 2: Ontology Modeling',
      cn: '第二阶段：Ontology 建模'
    },
    sections: [
      {
        title: { en: 'Objective', cn: '目标' },
        content: {
          en: 'Translate the functional requirements into a logical, platform-agnostic Semantic Model.',
          cn: '将功能需求转化为逻辑的、平台无关的语义模型。'
        },
        type: 'text'
      },
      {
        title: { en: 'Object Classification', cn: '对象分类' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Classification', 'Description', 'Examples', 'Update Pattern'],
            cn: ['分类', '描述', '示例', '更新模式']
          },
          rows: [
            {
              en: ['Core Objects', 'From system of record', 'Customer, ERP Order', 'Kinetic Layer only'],
              cn: ['核心对象', '来自记录系统', '客户、ERP 订单', '仅通过动力层']
            },
            {
              en: ['Derived Objects', 'Combined/aggregated', 'Route, Customer 360', 'ETL/ELT'],
              cn: ['派生对象', '组合/聚合', '路线、客户 360', 'ETL/ELT']
            },
            {
              en: ['Use Case Objects', 'User-created/edited', 'Alert Ticket, Case', 'Dynamic Layer'],
              cn: ['用例对象', '用户创建/编辑', '告警工单、案例', '动态层']
            }
          ]
        }
      },
      {
        title: { en: 'Critical Rule', cn: '关键规则' },
        content: {
          en: 'Core Objects should be **immutable** via the Ontology. If data comes from an ERP, users cannot edit it directly - only view it and take Actions that may trigger updates in the source system.',
          cn: '核心对象在 Ontology 中应该是**不可变的**。如果数据来自 ERP，用户不能直接编辑它 - 只能查看并执行可能触发源系统更新的 Action。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Action State Machine', cn: 'Action 状态机' },
        content: {
          en: 'For Use Case Objects, design a state machine that shows:\n\n1. **States**: Valid statuses the object can be in\n2. **Transitions**: Actions that move between states\n3. **Guards**: Preconditions for each transition\n4. **Executors**: Who can perform each Action',
          cn: '对于用例对象，设计一个状态机来展示：\n\n1. **状态**：对象可能处于的有效状态\n2. **转换**：在状态之间移动的 Action\n3. **守卫**：每个转换的前置条件\n4. **执行者**：谁可以执行每个 Action'
        },
        type: 'text'
      },
      {
        title: { en: 'Example: Order State Machine', cn: '示例：订单状态机' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          stateMachine: {
            states: {
              en: ['Created', 'Pending Approval', 'Approved', 'Shipped', 'Delivered', 'Cancelled'],
              cn: ['已创建', '待审批', '已审批', '已发货', '已送达', '已取消']
            },
            transitions: [
              { from: 'Created', to: 'Pending Approval', action: 'Submit', executor: 'Customer' },
              { from: 'Pending Approval', to: 'Approved', action: 'Approve', executor: 'Manager' },
              { from: 'Pending Approval', to: 'Cancelled', action: 'Reject', executor: 'Manager' },
              { from: 'Approved', to: 'Shipped', action: 'Ship', executor: 'Warehouse' },
              { from: 'Shipped', to: 'Delivered', action: 'Confirm Delivery', executor: 'System' },
              { from: 'Created', to: 'Cancelled', action: 'Cancel', executor: 'Customer' }
            ]
          }
        }
      }
    ],
    quiz: [
      {
        question: {
          en: 'Which type of object should be immutable in the Ontology?',
          cn: '哪种类型的对象在 Ontology 中应该是不可变的？'
        },
        options: [
          { en: 'Use Case Objects', cn: '用例对象' },
          { en: 'Derived Objects', cn: '派生对象' },
          { en: 'Core Objects', cn: '核心对象' },
          { en: 'All objects should be editable', cn: '所有对象都应该可编辑' }
        ],
        correctIndex: 2,
        explanation: {
          en: 'Core Objects come from systems of record (like ERP). They should be read-only in the Ontology to maintain data integrity. Updates should flow back through the source system.',
          cn: '核心对象来自记录系统（如 ERP）。它们在 Ontology 中应该是只读的，以维护数据完整性。更新应该通过源系统回流。'
        }
      }
    ]
  },

  // M4: Phase 3-5 Overview
  {
    id: 'm1_4',
    title: {
      en: 'Phases 3-5: Architecture to Deployment',
      cn: '第三至五阶段：从架构到部署'
    },
    sections: [
      {
        title: { en: 'Phase 3: Architecture', cn: '第三阶段：架构' },
        content: {
          en: '**Key Activities:**\n\n1. **Kinetic Mapping**: Map Object properties to source tables/fields\n2. **Enrichment Strategy**: Define transformations for derived properties\n3. **Action Service Design**: Design APIs for write-back operations\n4. **Interface Intent Mapping**: Match UIs to user intents',
          cn: '**关键活动：**\n\n1. **动力层映射**：将对象属性映射到源表/字段\n2. **增强策略**：定义派生属性的转换逻辑\n3. **Action 服务设计**：设计回写操作的 API\n4. **界面意图映射**：将 UI 匹配到用户意图'
        },
        type: 'text'
      },
      {
        title: { en: 'The Mock Ontology Strategy', cn: 'Mock Ontology 策略' },
        content: {
          en: 'Create placeholder data that conforms to the final schema. This allows:\n\n- **Frontend**: Build UIs against mock data\n- **Backend**: Build pipelines to replace mock data\n- **No blocking**: Both teams work in parallel',
          cn: '创建符合最终 schema 的占位数据。这允许：\n\n- **前端**：基于 mock 数据构建 UI\n- **后端**：构建管道替换 mock 数据\n- **不阻塞**：两个团队并行工作'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Phase 4: Implementation', cn: '第四阶段：实施' },
        content: {
          en: '**The Decoupled Development Model:**\n\n```\n┌─────────────────┐    ┌─────────────────┐\n│   Frontend      │    │   Backend       │\n│   Team          │    │   Team          │\n├─────────────────┤    ├─────────────────┤\n│ Build against   │    │ Build Kinetic   │\n│ Mock Ontology   │    │ Layer pipelines │\n└────────┬────────┘    └────────┬────────┘\n         │                      │\n         └──────────┬───────────┘\n                    │\n           Integration & Validation\n```',
          cn: '**解耦开发模型：**\n\n```\n┌─────────────────┐    ┌─────────────────┐\n│   前端          │    │   后端          │\n│   团队          │    │   团队          │\n├─────────────────┤    ├─────────────────┤\n│ 基于 Mock       │    │ 构建动力层      │\n│ Ontology 开发   │    │ 数据管道        │\n└────────┬────────┘    └────────┬────────┘\n         │                      │\n         └──────────┬───────────┘\n                    │\n             集成与验证\n```'
        },
        type: 'diagram'
      },
      {
        title: { en: 'Phase 5: Deployment', cn: '第五阶段：部署' },
        content: {
          en: '**Success Criteria:**\n\n1. UAT with actual User Types from Phase 1\n2. Track the KPIs defined in Use Case Overview\n3. Complete documentation and knowledge transfer\n4. Identify next use case for expansion',
          cn: '**成功标准：**\n\n1. 与第一阶段确定的用户类型进行 UAT\n2. 跟踪用例概览中定义的 KPI\n3. 完成文档和知识转移\n4. 识别下一个扩展用例'
        },
        type: 'text'
      },
      {
        title: { en: 'The Iteration Loop', cn: '迭代循环' },
        content: {
          en: 'After Phase 5, the cycle continues: Deploy → Measure → Learn → Identify New Use Case → Back to Phase 1. Each iteration expands the Ontology.',
          cn: '第五阶段后，循环继续：部署 → 衡量 → 学习 → 识别新用例 → 回到第一阶段。每次迭代都扩展 Ontology。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What is the purpose of a Mock Ontology?',
          cn: 'Mock Ontology 的目的是什么？'
        },
        options: [
          { en: 'To test production data', cn: '测试生产数据' },
          { en: 'To allow frontend and backend teams to work in parallel', cn: '让前端和后端团队并行工作' },
          { en: 'To replace the real Ontology', cn: '替换真实的 Ontology' },
          { en: 'For documentation only', cn: '仅用于文档' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Mock Ontology provides placeholder data conforming to the final schema, allowing frontend teams to build UIs while backend teams develop data pipelines. This eliminates blocking dependencies.',
          cn: 'Mock Ontology 提供符合最终 schema 的占位数据，让前端团队可以在后端团队开发数据管道的同时构建 UI。这消除了阻塞依赖。'
        }
      }
    ]
  }
];

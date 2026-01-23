// Level 1: 基础认知 - 课程内容

export interface LessonContent {
  id: string;
  title: {
    en: string;
    cn: string;
  };
  sections: {
    title: { en: string; cn: string };
    content: { en: string; cn: string };
    type: 'text' | 'comparison' | 'diagram' | 'keypoint' | 'example';
    data?: any;
  }[];
  quiz?: {
    question: { en: string; cn: string };
    options: { en: string; cn: string }[];
    correctIndex: number;
    explanation: { en: string; cn: string };
  }[];
}

export const level1Lessons: LessonContent[] = [
  // 1.1 什么是 Ontology
  {
    id: 'l1_1',
    title: {
      en: 'What is Ontology (vs Knowledge Graph)',
      cn: '什么是 Ontology（vs 知识图谱）'
    },
    sections: [
      {
        title: { en: 'The Common Misconception', cn: '常见误区' },
        content: {
          en: 'Many people confuse Ontology with Knowledge Graph. While they share some similarities in representing entities and relationships, they serve fundamentally different purposes.',
          cn: '很多人把 Ontology 和知识图谱混为一谈。虽然它们都能表示实体和关系，但本质用途完全不同。'
        },
        type: 'text'
      },
      {
        title: { en: 'Key Difference', cn: '核心区别' },
        content: {
          en: 'Knowledge Graph answers "What exists?" while Ontology answers "What can be done?"',
          cn: '知识图谱回答「存在什么？」，Ontology 回答「能做什么？」'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Comparison', cn: '对比' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Aspect', 'Knowledge Graph', 'Ontology'],
            cn: ['维度', '知识图谱', 'Ontology']
          },
          rows: [
            {
              en: ['Core Element', 'Entity + Relationship', 'Object + Action'],
              cn: ['核心要素', '实体 + 关系', '对象 + 动作']
            },
            {
              en: ['Purpose', 'Knowledge Storage & Query', 'Decision & Execution'],
              cn: ['用途', '知识存储与查询', '决策与执行']
            },
            {
              en: ['Nature', 'Static Description', 'Dynamic Behavior'],
              cn: ['性质', '静态描述', '动态行为']
            },
            {
              en: ['Output', 'Answer Questions', 'Drive Actions'],
              cn: ['产出', '回答问题', '驱动行动']
            },
            {
              en: ['AI Role', 'Information Retrieval', 'Intelligent Agent'],
              cn: ['AI 角色', '信息检索', '智能代理']
            }
          ]
        }
      },
      {
        title: { en: 'The Action Difference', cn: 'Action 的本质区别' },
        content: {
          en: 'The fundamental distinction lies in **Action**. Knowledge Graph stores facts like "Order A belongs to Customer B". Ontology defines operations like "Customer can [Cancel Order] when status is Pending".',
          cn: '根本区别在于 **Action**。知识图谱存储事实如「订单 A 属于客户 B」，Ontology 定义操作如「客户可以在状态为待处理时 [取消订单]」。'
        },
        type: 'text'
      },
      {
        title: { en: 'Example: E-commerce Scenario', cn: '示例：电商场景' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          knowledgeGraph: {
            title: { en: 'Knowledge Graph', cn: '知识图谱' },
            items: {
              en: [
                'Order #12345 → belongs_to → Customer John',
                'Order #12345 → contains → Product iPhone',
                'Order #12345 → has_status → Delivered'
              ],
              cn: [
                '订单 #12345 → 属于 → 客户张三',
                '订单 #12345 → 包含 → 商品 iPhone',
                '订单 #12345 → 状态为 → 已发货'
              ]
            }
          },
          ontology: {
            title: { en: 'Ontology', cn: 'Ontology' },
            items: {
              en: [
                'Order.cancel() → requires: status=Pending, executor=Customer',
                'Order.ship() → requires: status=Paid, executor=Warehouse',
                'Order.refund() → requires: status=Delivered, approval=Manager'
              ],
              cn: [
                'Order.cancel() → 前置: 状态=待处理, 执行者=客户',
                'Order.ship() → 前置: 状态=已付款, 执行者=仓库',
                'Order.refund() → 前置: 状态=已发货, 审批=经理'
              ]
            }
          }
        }
      },
      {
        title: { en: 'Why This Matters', cn: '为什么这很重要' },
        content: {
          en: 'In the AI era, we need systems that can not only answer questions but also take actions. Ontology provides the foundation for AI Agents to understand what actions are possible, under what conditions, and with what consequences.',
          cn: '在 AI 时代，我们需要的系统不仅能回答问题，还能采取行动。Ontology 为 AI Agent 提供了理解「什么操作可行、在什么条件下、会产生什么后果」的基础。'
        },
        type: 'text'
      },
      {
        title: { en: 'Core Insight', cn: '核心洞见' },
        content: {
          en: 'Ontology is the "Operating System" of enterprise intelligence. Objects are nouns, Actions are verbs. Together they form the complete vocabulary for AI to operate your business.',
          cn: 'Ontology 是企业智能的「操作系统」。Object 是名词，Action 是动词。它们共同构成 AI 操作你业务的完整词汇表。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What is the core difference between Knowledge Graph and Ontology?',
          cn: '知识图谱和 Ontology 的核心区别是什么？'
        },
        options: [
          { en: 'Knowledge Graph is newer technology', cn: '知识图谱是更新的技术' },
          { en: 'Ontology includes Actions that define what can be done', cn: 'Ontology 包含定义「能做什么」的 Action' },
          { en: 'Knowledge Graph is for big companies only', cn: '知识图谱只适用于大公司' },
          { en: 'They are essentially the same thing', cn: '它们本质上是一样的' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'The fundamental difference is that Ontology includes Actions - executable operations with preconditions, postconditions, and governance rules. Knowledge Graph only stores static facts and relationships.',
          cn: '根本区别在于 Ontology 包含 Action —— 具有前置条件、后置状态和治理规则的可执行操作。知识图谱只存储静态的事实和关系。'
        }
      }
    ]
  },

  // 1.2 四层架构详解
  {
    id: 'l1_2',
    title: {
      en: 'Four-Layer Architecture',
      cn: '四层架构详解'
    },
    sections: [
      {
        title: { en: 'Architecture Overview', cn: '架构概览' },
        content: {
          en: 'The Ontology methodology is built on a four-layer architecture. Each layer has a specific purpose and builds upon the previous one.',
          cn: 'Ontology 方法论建立在四层架构之上。每一层都有特定用途，并构建在前一层之上。'
        },
        type: 'text'
      },
      {
        title: { en: 'The Four Layers', cn: '四个层级' },
        content: { en: '', cn: '' },
        type: 'diagram',
        data: {
          layers: [
            {
              name: { en: 'AI Layer', cn: 'AI 层' },
              color: 'cyan',
              description: {
                en: 'AI capabilities injected into Objects and Actions',
                cn: 'AI 能力注入对象和动作'
              },
              examples: {
                en: ['Predictive Analytics', 'Intelligent Recommendations', 'Anomaly Detection'],
                cn: ['预测分析', '智能推荐', '异常检测']
              }
            },
            {
              name: { en: 'Dynamic Layer', cn: '动态层' },
              color: 'purple',
              description: {
                en: 'Workflows, state machines, business rules',
                cn: '工作流、状态机、业务规则'
              },
              examples: {
                en: ['Order State Machine', 'Approval Workflow', 'Escalation Rules'],
                cn: ['订单状态机', '审批工作流', '升级规则']
              }
            },
            {
              name: { en: 'Kinetic Layer', cn: '动能层' },
              color: 'emerald',
              description: {
                en: 'Actions - what can be done to Objects',
                cn: 'Action —— 可以对对象执行的操作'
              },
              examples: {
                en: ['Create Order', 'Approve Request', 'Ship Product'],
                cn: ['创建订单', '审批请求', '发货']
              }
            },
            {
              name: { en: 'Semantic Layer', cn: '语义层' },
              color: 'blue',
              description: {
                en: 'Objects, Properties, and Relationships',
                cn: '对象、属性和关系'
              },
              examples: {
                en: ['Order', 'Customer', 'Product', 'Order contains Product'],
                cn: ['订单', '客户', '产品', '订单包含产品']
              }
            }
          ]
        }
      },
      {
        title: { en: 'Layer Interaction', cn: '层级交互' },
        content: {
          en: 'Each layer depends on and enhances the layer below it. The Semantic Layer provides the vocabulary, Kinetic Layer adds behaviors, Dynamic Layer orchestrates flows, and AI Layer injects intelligence.',
          cn: '每一层都依赖并增强其下层。语义层提供词汇，动能层添加行为，动态层编排流程，AI 层注入智能。'
        },
        type: 'text'
      },
      {
        title: { en: 'Why Four Layers?', cn: '为什么是四层？' },
        content: {
          en: 'This separation ensures:\n\n1. **Clarity**: Each concern is addressed at the right level\n2. **Reusability**: Lower layers can be reused across different workflows\n3. **Flexibility**: AI capabilities can be added without changing core logic\n4. **Governance**: Clear boundaries for permissions and audit',
          cn: '这种分离确保了：\n\n1. **清晰性**：每个关注点在正确的层级处理\n2. **复用性**：底层可在不同工作流中复用\n3. **灵活性**：可以在不改变核心逻辑的情况下添加 AI 能力\n4. **治理性**：权限和审计有清晰的边界'
        },
        type: 'text'
      },
      {
        title: { en: 'The Kinetic Layer is Key', cn: '动能层是关键' },
        content: {
          en: 'The Kinetic Layer (Actions) is what transforms a static data model into an operational system. Without Actions, you only have a database schema. With Actions, you have a complete operating system.',
          cn: '动能层（Action）是将静态数据模型转化为可运营系统的关键。没有 Action，你只有数据库表结构；有了 Action，你才有完整的操作系统。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'Which layer is responsible for defining "what can be done" to objects?',
          cn: '哪一层负责定义「能对对象做什么」？'
        },
        options: [
          { en: 'Semantic Layer', cn: '语义层' },
          { en: 'Kinetic Layer', cn: '动能层' },
          { en: 'Dynamic Layer', cn: '动态层' },
          { en: 'AI Layer', cn: 'AI 层' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'The Kinetic Layer contains Actions - the operations that can be performed on Objects. It transforms static data models into operational systems.',
          cn: '动能层包含 Action —— 可以对对象执行的操作。它将静态数据模型转化为可运营的系统。'
        }
      }
    ]
  },

  // 1.3 Noun-Verb 框架
  {
    id: 'l1_3',
    title: {
      en: 'Noun-Verb Framework',
      cn: 'Noun-Verb 提取框架'
    },
    sections: [
      {
        title: { en: 'The Simplest Mental Model', cn: '最简单的心智模型' },
        content: {
          en: 'The Noun-Verb framework is the fastest way to extract Ontology from business requirements. **Nouns become Objects, Verbs become Actions.**',
          cn: 'Noun-Verb 框架是从业务需求中提取 Ontology 的最快方法。**名词变成对象，动词变成动作。**'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'How It Works', cn: '如何运作' },
        content: {
          en: 'When stakeholders describe their business, listen for:\n\n- **Nouns**: Things they manage, track, or care about → Objects\n- **Verbs**: Actions they perform, decisions they make → Actions\n- **Adjectives**: Properties or states of things → Attributes\n- **Relationships**: How things connect → Links',
          cn: '当利益相关者描述业务时，注意听：\n\n- **名词**：他们管理、跟踪或关心的事物 → 对象\n- **动词**：他们执行的操作、做出的决定 → 动作\n- **形容词**：事物的属性或状态 → 属性\n- **关系**：事物如何关联 → 链接'
        },
        type: 'text'
      },
      {
        title: { en: 'Example Extraction', cn: '提取示例' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          input: {
            title: { en: 'Business Description', cn: '业务描述' },
            text: {
              en: '"When a **customer** places an **order**, we need to **verify** the **inventory**. If stock is available, we **reserve** the items and **notify** the **warehouse** to **ship**. The **manager** can **approve** special **discounts**."',
              cn: '"当**客户**下**订单**时，我们需要**验证****库存**。如果有货，我们**预留**商品并**通知****仓库****发货**。**经理**可以**审批**特殊的**折扣**。"'
            }
          },
          output: {
            title: { en: 'Extracted Ontology', cn: '提取的 Ontology' },
            objects: {
              en: ['Customer', 'Order', 'Inventory', 'Warehouse', 'Manager', 'Discount'],
              cn: ['客户', '订单', '库存', '仓库', '经理', '折扣']
            },
            actions: {
              en: ['Place Order', 'Verify Inventory', 'Reserve Items', 'Notify', 'Ship', 'Approve Discount'],
              cn: ['下订单', '验证库存', '预留商品', '通知', '发货', '审批折扣']
            }
          }
        }
      },
      {
        title: { en: 'Tips for Better Extraction', cn: '更好提取的技巧' },
        content: {
          en: '1. **Ask "What do you do with X?"** - This reveals Actions\n2. **Ask "Who can do this?"** - This reveals executor roles\n3. **Ask "What happens next?"** - This reveals workflows\n4. **Ask "What could go wrong?"** - This reveals validation rules',
          cn: '1. **问「你对 X 做什么？」** —— 这揭示动作\n2. **问「谁能做这件事？」** —— 这揭示执行角色\n3. **问「接下来会发生什么？」** —— 这揭示工作流\n4. **问「可能出什么问题？」** —— 这揭示验证规则'
        },
        type: 'text'
      },
      {
        title: { en: 'Common Pitfalls', cn: '常见陷阱' },
        content: {
          en: '- **Over-extraction**: Not every noun is an Object. Focus on things that have lifecycle and actions.\n- **Missing Actions**: Technical systems often hide Actions. "The system updates the status" should be "Order.updateStatus()"\n- **Ignoring Relationships**: "Customer places Order" reveals a relationship worth capturing.',
          cn: '- **过度提取**：不是每个名词都是对象。关注有生命周期和动作的事物。\n- **遗漏动作**：技术系统常隐藏动作。「系统更新状态」应该是「Order.updateStatus()」\n- **忽略关系**：「客户下订单」揭示了值得捕获的关系。'
        },
        type: 'text'
      }
    ],
    quiz: [
      {
        question: {
          en: 'In the sentence "Manager approves the purchase request", what is the Object and what is the Action?',
          cn: '在「经理审批采购请求」这句话中，什么是对象，什么是动作？'
        },
        options: [
          { en: 'Object: Manager, Action: approves', cn: '对象：经理，动作：审批' },
          { en: 'Object: Purchase Request, Action: approve', cn: '对象：采购请求，动作：审批' },
          { en: 'Object: approve, Action: Purchase Request', cn: '对象：审批，动作：采购请求' },
          { en: 'Both Manager and Purchase Request are Objects', cn: '经理和采购请求都是对象' }
        ],
        correctIndex: 3,
        explanation: {
          en: 'Both "Manager" and "Purchase Request" are Objects (nouns that are managed). "approve" is the Action. Manager is the executor of the Action on Purchase Request.',
          cn: '「经理」和「采购请求」都是对象（被管理的名词）。「审批」是动作。经理是对采购请求执行动作的执行者。'
        }
      }
    ]
  },

  // 1.4 Decision-First 原则
  {
    id: 'l1_4',
    title: {
      en: 'Decision-First Principle',
      cn: 'Decision-First 原则'
    },
    sections: [
      {
        title: { en: 'The Traditional Approach', cn: '传统方法' },
        content: {
          en: 'Traditional system design starts with data: "What data do we need to store?" This leads to database-centric thinking that often misses the real business value.',
          cn: '传统系统设计从数据开始：「我们需要存储什么数据？」这导致以数据库为中心的思维，常常错过真正的业务价值。'
        },
        type: 'text'
      },
      {
        title: { en: 'Decision-First Thinking', cn: 'Decision-First 思维' },
        content: {
          en: 'Start with decisions, not data. Ask: "What decisions does the business need to make?" Then work backwards to determine what Actions support those decisions and what Objects those Actions operate on.',
          cn: '从决策开始，而不是数据。问：「业务需要做出什么决策？」然后倒推确定哪些 Action 支持这些决策，以及这些 Action 操作哪些 Object。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'The Process', cn: '流程' },
        content: {
          en: '1. **Identify Key Decisions** - What choices drive business value?\n2. **Map to Actions** - What operations enable those decisions?\n3. **Define Prerequisites** - What conditions must be met?\n4. **Discover Objects** - What entities do Actions operate on?\n5. **Add Properties** - What data do Actions need?',
          cn: '1. **识别关键决策** —— 什么选择驱动业务价值？\n2. **映射到动作** —— 什么操作使这些决策成为可能？\n3. **定义前提条件** —— 必须满足什么条件？\n4. **发现对象** —— 动作操作哪些实体？\n5. **添加属性** —— 动作需要什么数据？'
        },
        type: 'text'
      },
      {
        title: { en: 'Example: Inventory Management', cn: '示例：库存管理' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          traditional: {
            title: { en: 'Data-First (Traditional)', cn: '数据优先（传统）' },
            items: {
              en: [
                '1. Design Product table with SKU, name, price...',
                '2. Design Inventory table with quantity, location...',
                '3. Design Transaction table...',
                '4. Build CRUD operations',
                '5. Hope business logic emerges'
              ],
              cn: [
                '1. 设计产品表（SKU、名称、价格...）',
                '2. 设计库存表（数量、位置...）',
                '3. 设计交易表...',
                '4. 构建 CRUD 操作',
                '5. 期望业务逻辑自然浮现'
              ]
            }
          },
          decisionFirst: {
            title: { en: 'Decision-First', cn: 'Decision-First' },
            items: {
              en: [
                '1. Key Decision: "Should we reorder this product?"',
                '2. Action: ReorderProduct(sku, quantity)',
                '3. Prerequisites: quantity < reorderPoint, supplier.isActive',
                '4. Objects: Product, Inventory, Supplier, PurchaseOrder',
                '5. Properties emerge from Action requirements'
              ],
              cn: [
                '1. 关键决策：「我们应该补货吗？」',
                '2. 动作：ReorderProduct(sku, quantity)',
                '3. 前提条件：数量 < 补货点，供应商.活跃',
                '4. 对象：产品、库存、供应商、采购订单',
                '5. 属性从动作需求中自然浮现'
              ]
            }
          }
        }
      },
      {
        title: { en: 'Benefits', cn: '好处' },
        content: {
          en: '- **Business Alignment**: System directly supports business decisions\n- **No Orphan Data**: Every property serves an Action\n- **Clear Value**: Each Action delivers measurable business value\n- **AI-Ready**: Decisions become natural Agent tasks',
          cn: '- **业务对齐**：系统直接支持业务决策\n- **无孤儿数据**：每个属性都服务于某个动作\n- **价值清晰**：每个动作都提供可衡量的业务价值\n- **AI 就绪**：决策自然成为 Agent 任务'
        },
        type: 'text'
      },
      {
        title: { en: 'The Ultimate Test', cn: '终极检验' },
        content: {
          en: 'For every property in your Ontology, you should be able to answer: "Which Action uses this?" If no Action uses it, question whether you need it.',
          cn: '对于 Ontology 中的每个属性，你都应该能回答：「哪个 Action 使用它？」如果没有 Action 使用它，就要质疑是否真的需要它。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What is the starting point in Decision-First design?',
          cn: 'Decision-First 设计的起点是什么？'
        },
        options: [
          { en: 'Database tables', cn: '数据库表' },
          { en: 'User interface mockups', cn: '用户界面原型' },
          { en: 'Business decisions that need to be made', cn: '需要做出的业务决策' },
          { en: 'API endpoints', cn: 'API 端点' }
        ],
        correctIndex: 2,
        explanation: {
          en: 'Decision-First design starts by identifying the key decisions the business needs to make, then works backwards to determine what Actions, Objects, and Properties are needed to support those decisions.',
          cn: 'Decision-First 设计从识别业务需要做出的关键决策开始，然后倒推确定支持这些决策所需的动作、对象和属性。'
        }
      }
    ]
  }
];

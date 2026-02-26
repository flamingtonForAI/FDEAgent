// AI Layer 专项课程内容 - AI Layer Specialization

import { LessonContent } from './level1';

export const aiLayerLessons: LessonContent[] = [
  // AI-1: Agent 四层能力模型
  {
    id: 'ai_1',
    title: {
      en: 'Agent Tier Model',
      cn: 'Agent 四层能力模型'
    },
    sections: [
      {
        title: { en: 'AI as Operating System', cn: 'AI 作为操作系统' },
        content: {
          en: 'In the AI era, Ontology becomes the **Operating System API for AI Agents**. Every Object is a queryable resource, every Action is a callable tool, and every Link is a navigation path.',
          cn: '在 AI 时代，Ontology 成为**AI Agent 的操作系统 API**。每个 Object 是可查询资源，每个 Action 是可调用工具，每个 Link 是导航路径。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'The Four Tier Model', cn: '四层模型' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Tier', 'Name', 'Autonomy', 'Human Oversight', 'Risk Level'],
            cn: ['层级', '名称', '自主度', '人工监督', '风险等级']
          },
          rows: [
            {
              en: ['Tier 1', 'Ad-hoc Analysis', 'Low', 'None (read-only)', 'Low'],
              cn: ['第一层', '临时分析', '低', '无（只读）', '低']
            },
            {
              en: ['Tier 2', 'Task Assistant', 'Medium', 'Review recommended', 'Medium'],
              cn: ['第二层', '任务助手', '中', '建议审查', '中']
            },
            {
              en: ['Tier 3', 'Embedded Agent', 'High', 'Approval for writes', 'High'],
              cn: ['第三层', '嵌入式 Agent', '高', '写操作需审批', '高']
            },
            {
              en: ['Tier 4', 'Autonomous Agent', 'Full', 'Audit-only', 'Bounded'],
              cn: ['第四层', '自主 Agent', '完全', '仅审计', '受限']
            }
          ]
        }
      },
      {
        title: { en: 'Capability Matrix', cn: '能力矩阵' },
        content: {
          en: '```\n                    ┌─────────────────────────────────┐\n                    │       AGENT CAPABILITIES        │\n                    ├────────┬────────┬───────┬───────┤\n                    │  Read  │ Write  │Approve│Create │\n    ┌───────────────┼────────┼────────┼───────┼───────┤\n    │ Tier 1        │   ✓    │   ✗    │   ✗   │   ✗   │\n    │ Tier 2        │   ✓    │   △    │   ✗   │   ✗   │\n    │ Tier 3        │   ✓    │   ✓    │   △   │   △   │\n    │ Tier 4        │   ✓    │   ✓    │   ✓   │   ✓   │\n    └───────────────┴────────┴────────┴───────┴───────┘\n\n    ✓ = Allowed    △ = With approval    ✗ = Not allowed\n```',
          cn: '```\n                    ┌─────────────────────────────────┐\n                    │        AGENT 能力矩阵           │\n                    ├────────┬────────┬───────┬───────┤\n                    │  读取  │  写入  │ 审批  │ 创建  │\n    ┌───────────────┼────────┼────────┼───────┼───────┤\n    │ 第一层        │   ✓    │   ✗    │   ✗   │   ✗   │\n    │ 第二层        │   ✓    │   △    │   ✗   │   ✗   │\n    │ 第三层        │   ✓    │   ✓    │   △   │   △   │\n    │ 第四层        │   ✓    │   ✓    │   ✓   │   ✓   │\n    └───────────────┴────────┴────────┴───────┴───────┘\n\n    ✓ = 允许    △ = 需审批    ✗ = 不允许\n```'
        },
        type: 'diagram'
      },
      {
        title: { en: 'Progressive Deployment', cn: '渐进式部署' },
        content: {
          en: 'Start with Tier 1 (read-only Q&A), validate accuracy, then graduate to Tier 2. Don\'t jump to Tier 4 automation without proving success at lower tiers.',
          cn: '从第一层（只读问答）开始，验证准确性，然后升级到第二层。在低层级证明成功之前，不要直接跳到第四层自动化。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Deployment Modes', cn: '部署模式' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Mode', 'Description', 'Entry Point', 'Example'],
            cn: ['模式', '描述', '入口', '示例']
          },
          rows: [
            {
              en: ['Interactive', 'Conversational', 'User message', 'Chat widget, Slack bot'],
              cn: ['交互式', '对话式', '用户消息', '聊天组件、Slack 机器人']
            },
            {
              en: ['Embedded', 'In-application', 'UI trigger', 'Dashboard button'],
              cn: ['嵌入式', '应用内', 'UI 触发', '仪表板按钮']
            },
            {
              en: ['Scheduled', 'Time-based', 'Cron job', 'Daily report'],
              cn: ['定时', '基于时间', '定时任务', '每日报告']
            },
            {
              en: ['Event-driven', 'Data triggers', 'Event hook', 'New alert triggers'],
              cn: ['事件驱动', '数据触发', '事件钩子', '新告警触发']
            }
          ]
        }
      }
    ],
    quiz: [
      {
        question: {
          en: 'Which tier should you start with when deploying AI capabilities?',
          cn: '部署 AI 能力时应该从哪一层开始？'
        },
        options: [
          { en: 'Tier 4 - Autonomous Agent', cn: '第四层 - 自主 Agent' },
          { en: 'Tier 3 - Embedded Agent', cn: '第三层 - 嵌入式 Agent' },
          { en: 'Tier 1 - Ad-hoc Analysis', cn: '第一层 - 临时分析' },
          { en: 'It depends on the budget', cn: '取决于预算' }
        ],
        correctIndex: 2,
        explanation: {
          en: 'Always start with Tier 1 (read-only) to validate AI accuracy and build trust. Only after proving success at lower tiers should you graduate to higher autonomy levels.',
          cn: '始终从第一层（只读）开始，验证 AI 准确性并建立信任。只有在低层级证明成功后，才应该升级到更高的自主级别。'
        }
      }
    ]
  },

  // AI-2: Ontology-to-Tool Mapping
  {
    id: 'ai_2',
    title: {
      en: 'Ontology-to-Tool Mapping',
      cn: 'Ontology 到 Tool 的映射'
    },
    sections: [
      {
        title: { en: 'The Core Principle', cn: '核心原则' },
        content: {
          en: 'Every Ontology component should be exposed as an Agent tool. This creates a governed interface between AI and business operations.',
          cn: '每个 Ontology 组件都应该暴露为 Agent 工具。这在 AI 和业务操作之间创建了一个受治理的接口。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Mapping Rules', cn: '映射规则' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Ontology Component', 'Tool Type', 'Naming Pattern', 'Example'],
            cn: ['Ontology 组件', '工具类型', '命名模式', '示例']
          },
          rows: [
            {
              en: ['Object Type', 'Search/Get', 'search_{object}, get_{object}', 'search_orders, get_customer'],
              cn: ['对象类型', '搜索/获取', 'search_{对象}, get_{对象}', 'search_orders, get_customer']
            },
            {
              en: ['Link Type', 'Navigation', 'get_{related}_{object}', 'get_order_shipments'],
              cn: ['链接类型', '导航', 'get_{相关}_{对象}', 'get_order_shipments']
            },
            {
              en: ['Action', 'Execution', '{verb}_{object}', 'approve_order, escalate_alert'],
              cn: ['Action', '执行', '{动词}_{对象}', 'approve_order, escalate_alert']
            },
            {
              en: ['Derived Property', 'Computation', 'calculate_{metric}', 'calculate_priority_score'],
              cn: ['派生属性', '计算', 'calculate_{指标}', 'calculate_priority_score']
            },
            {
              en: ['Aggregation', 'Analytics', 'aggregate_{object}_{metric}', 'aggregate_orders_by_region'],
              cn: ['聚合', '分析', 'aggregate_{对象}_{指标}', 'aggregate_orders_by_region']
            }
          ]
        }
      },
      {
        title: { en: 'Tool Specification Standard', cn: '工具规范标准' },
        content: {
          en: 'Every tool must include:\n\n1. **Name & Version** - Unique identifier\n2. **Description** - What it does (for LLM understanding)\n3. **Parameters** - Inputs with types and validation\n4. **Returns** - Output schema\n5. **Governance** - Permission tier, approval requirements\n6. **Errors** - Possible error codes',
          cn: '每个工具必须包含：\n\n1. **名称和版本** - 唯一标识符\n2. **描述** - 做什么（供 LLM 理解）\n3. **参数** - 带类型和验证的输入\n4. **返回值** - 输出 schema\n5. **治理** - 权限层级、审批要求\n6. **错误** - 可能的错误码'
        },
        type: 'text'
      },
      {
        title: { en: 'Example Tool Specification', cn: '工具规范示例' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          yaml: `tool:
  name: "approve_order"
  version: "1.0"
  description: |
    Approve a pending order for fulfillment.
    Changes status from 'pending_approval' to 'approved'.

  parameters:
    - name: order_id
      type: string
      required: true
      description: "The unique identifier of the order"

    - name: approval_notes
      type: string
      required: true
      description: "Notes explaining the approval decision"

  returns:
    success: boolean
    new_status: string

  governance:
    permission_tier: 3
    requires_human_approval: true
    audit_required: true`
        }
      },
      {
        title: { en: 'Tool Categories', cn: '工具分类' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Category', 'Purpose', 'Examples', 'Typical Tier'],
            cn: ['分类', '用途', '示例', '典型层级']
          },
          rows: [
            {
              en: ['Discovery', 'Find and explore', 'search, list, filter', 'Tier 1'],
              cn: ['发现', '查找和探索', 'search, list, filter', '第一层']
            },
            {
              en: ['Retrieval', 'Get specific records', 'get, fetch, load', 'Tier 1'],
              cn: ['检索', '获取特定记录', 'get, fetch, load', '第一层']
            },
            {
              en: ['Analytics', 'Compute insights', 'aggregate, summarize', 'Tier 1-2'],
              cn: ['分析', '计算洞察', 'aggregate, summarize', '第一至二层']
            },
            {
              en: ['Mutation', 'Modify data', 'update, create, delete', 'Tier 2-3'],
              cn: ['变更', '修改数据', 'update, create, delete', '第二至三层']
            },
            {
              en: ['Workflow', 'Execute processes', 'approve, escalate', 'Tier 3-4'],
              cn: ['工作流', '执行流程', 'approve, escalate', '第三至四层']
            }
          ]
        }
      }
    ],
    quiz: [
      {
        question: {
          en: 'How should an Ontology Action be named as a tool?',
          cn: 'Ontology Action 应该如何命名为工具？'
        },
        options: [
          { en: 'action_{object}_{verb}', cn: 'action_{对象}_{动词}' },
          { en: '{verb}_{object}', cn: '{动词}_{对象}' },
          { en: 'tool_{action_id}', cn: 'tool_{action_id}' },
          { en: 'Any name is fine', cn: '任何名称都可以' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Tools should follow the {verb}_{object} pattern (e.g., approve_order, cancel_shipment). This makes tools intuitive for LLMs to understand and select.',
          cn: '工具应该遵循 {动词}_{对象} 模式（如 approve_order, cancel_shipment）。这使工具对 LLM 来说直观易懂。'
        }
      }
    ]
  },

  // AI-3: Human-in-the-Loop Patterns
  {
    id: 'ai_3',
    title: {
      en: 'Human-in-the-Loop Patterns',
      cn: 'Human-in-the-Loop 模式'
    },
    sections: [
      {
        title: { en: 'Why Human-in-the-Loop?', cn: '为什么需要 Human-in-the-Loop？' },
        content: {
          en: 'High-stakes decisions require human judgment. AI can recommend, but humans must approve. This is not a limitation—it\'s a feature that builds trust and ensures accountability.',
          cn: '高风险决策需要人的判断。AI 可以推荐，但人必须审批。这不是限制——这是建立信任和确保问责的功能。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'The Five Patterns', cn: '五种模式' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Pattern', 'Description', 'When to Use', 'Flow'],
            cn: ['模式', '描述', '何时使用', '流程']
          },
          rows: [
            {
              en: ['Suggest-Confirm', 'AI suggests, human confirms', 'Tier 2 writes', 'Suggest → Await → Execute'],
              cn: ['建议-确认', 'AI 建议，人确认', '第二层写操作', '建议 → 等待 → 执行']
            },
            {
              en: ['Execute-Review', 'AI executes, human reviews', 'Low-risk Tier 3', 'Execute → Notify → Override?'],
              cn: ['执行-审查', 'AI 执行，人审查', '低风险第三层', '执行 → 通知 → 撤销？']
            },
            {
              en: ['Batch-Approve', 'AI queues, human batch approves', 'High-volume Tier 3', 'Queue → Batch UI → Approve All'],
              cn: ['批量审批', 'AI 排队，人批量审批', '高量第三层', '排队 → 批量 UI → 全部审批']
            },
            {
              en: ['Escalate-Uncertain', 'AI escalates when unsure', 'All tiers', 'Threshold → Escalate → Human'],
              cn: ['不确定升级', 'AI 不确定时升级', '所有层级', '阈值 → 升级 → 人工']
            },
            {
              en: ['Audit-Only', 'AI executes, logged for audit', 'Bounded Tier 4', 'Execute → Log → Audit'],
              cn: ['仅审计', 'AI 执行，记录审计', '受限第四层', '执行 → 记录 → 审计']
            }
          ]
        }
      },
      {
        title: { en: 'Pattern Selection Guide', cn: '模式选择指南' },
        content: {
          en: '**Decision Tree:**\n\n1. Is it reversible? → Yes: Consider Execute-Review\n2. Is it high-risk? → Yes: Use Suggest-Confirm\n3. Is it high-volume? → Yes: Consider Batch-Approve\n4. Is AI confidence low? → Yes: Use Escalate-Uncertain\n5. Is it within defined boundaries? → Yes: Audit-Only',
          cn: '**决策树：**\n\n1. 可逆吗？→ 是：考虑执行-审查\n2. 高风险吗？→ 是：使用建议-确认\n3. 高频吗？→ 是：考虑批量审批\n4. AI 置信度低吗？→ 是：使用不确定升级\n5. 在定义的边界内吗？→ 是：仅审计'
        },
        type: 'text'
      },
      {
        title: { en: 'Example: Order Approval Flow', cn: '示例：订单审批流程' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          flow: {
            title: { en: 'Suggest-Confirm Pattern', cn: '建议-确认模式' },
            steps: {
              en: [
                '1. User asks: "Should I approve order #12345?"',
                '2. AI analyzes: order value, customer credit, risk score',
                '3. AI suggests: "Recommend approval. Customer has good credit history."',
                '4. AI presents: [Approve] [Reject] [Need More Info]',
                '5. Human clicks: [Approve] with reason',
                '6. AI executes: approve_order(#12345, reason)',
                '7. Audit logged: who, when, why, AI recommendation'
              ],
              cn: [
                '1. 用户问："我应该批准订单 #12345 吗？"',
                '2. AI 分析：订单金额、客户信用、风险评分',
                '3. AI 建议："建议批准。客户信用记录良好。"',
                '4. AI 展示：[批准] [拒绝] [需要更多信息]',
                '5. 人点击：[批准] 并填写原因',
                '6. AI 执行：approve_order(#12345, reason)',
                '7. 审计记录：谁、何时、为什么、AI 建议'
              ]
            }
          }
        }
      },
      {
        title: { en: 'Confidence Thresholds', cn: '置信度阈值' },
        content: {
          en: 'Define thresholds for when AI should escalate:\n\n- **>90%**: Execute autonomously (if Tier allows)\n- **70-90%**: Execute with notification\n- **50-70%**: Suggest, await confirmation\n- **<50%**: Escalate to human expert',
          cn: '定义 AI 应该升级的阈值：\n\n- **>90%**：自主执行（如果层级允许）\n- **70-90%**：执行并通知\n- **50-70%**：建议，等待确认\n- **<50%**：升级到人类专家'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'Which pattern should be used for high-volume, low-risk operations?',
          cn: '对于高频、低风险的操作应该使用哪种模式？'
        },
        options: [
          { en: 'Suggest-Confirm', cn: '建议-确认' },
          { en: 'Batch-Approve', cn: '批量审批' },
          { en: 'Audit-Only', cn: '仅审计' },
          { en: 'Escalate-Uncertain', cn: '不确定升级' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Batch-Approve is ideal for high-volume operations. It queues AI recommendations and allows humans to review and approve in batches, balancing oversight with efficiency.',
          cn: '批量审批适合高频操作。它将 AI 建议排队，让人可以批量审查和审批，在监督和效率之间取得平衡。'
        }
      }
    ]
  },

  // AI-4: AI Governance Framework
  {
    id: 'ai_4',
    title: {
      en: 'AI Governance Framework',
      cn: 'AI 治理框架'
    },
    sections: [
      {
        title: { en: 'The Three Pillars', cn: '三大支柱' },
        content: {
          en: 'AI Governance rests on three pillars:\n\n1. **Access Control**: Who can do what\n2. **Audit Trail**: What was done and why\n3. **Safety Guards**: Preventing bad outcomes',
          cn: 'AI 治理建立在三大支柱之上：\n\n1. **访问控制**：谁可以做什么\n2. **审计追踪**：做了什么以及为什么\n3. **安全护栏**：防止不良结果'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Governance Architecture', cn: '治理架构' },
        content: {
          en: '```\n                         AI GOVERNANCE\n                              │\n        ┌─────────────────────┼─────────────────────┐\n        │                     │                     │\n   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐\n   │ ACCESS  │          │ AUDIT   │          │ SAFETY  │\n   │ CONTROL │          │ TRAIL   │          │ GUARDS  │\n   └────┬────┘          └────┬────┘          └────┬────┘\n        │                     │                     │\n   • Tiers                • Logging           • Rate limits\n   • Whitelists           • Citations         • Human-in-loop\n   • Data scope           • Replay            • Validation\n   • Role-based           • Trail             • Rollback\n```',
          cn: '```\n                         AI 治理\n                              │\n        ┌─────────────────────┼─────────────────────┐\n        │                     │                     │\n   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐\n   │ 访问    │          │ 审计    │          │ 安全    │\n   │ 控制    │          │ 追踪    │          │ 护栏    │\n   └────┬────┘          └────┬────┘          └────┬────┘\n        │                     │                     │\n   • 层级                • 日志记录          • 速率限制\n   • 白名单              • 引用              • 人在环中\n   • 数据范围            • 重放              • 验证\n   • 基于角色            • 追踪              • 回滚\n```'
        },
        type: 'diagram'
      },
      {
        title: { en: 'Citation Requirements', cn: '引用要求' },
        content: {
          en: 'All AI outputs that reference Ontology data MUST include citations. This ensures traceability and prevents hallucination.\n\n**Example:**\n"Order #12345 [1] has a total value of $15,420 [1]"\n\n**Citations:**\n[1] Order object: ORD-12345 (retrieved 2026-01-19 10:23:45 UTC)',
          cn: '所有引用 Ontology 数据的 AI 输出必须包含引用。这确保可追溯性并防止幻觉。\n\n**示例：**\n"订单 #12345 [1] 总价值为 $15,420 [1]"\n\n**引用：**\n[1] 订单对象：ORD-12345（获取于 2026-01-19 10:23:45 UTC）'
        },
        type: 'text'
      },
      {
        title: { en: 'Permission Model', cn: '权限模型' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Permission', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
            cn: ['权限', '第一层', '第二层', '第三层', '第四层']
          },
          rows: [
            {
              en: ['ontology.read', '✓', '✓', '✓', '✓'],
              cn: ['ontology.read', '✓', '✓', '✓', '✓']
            },
            {
              en: ['ontology.search', '✓', '✓', '✓', '✓'],
              cn: ['ontology.search', '✓', '✓', '✓', '✓']
            },
            {
              en: ['ontology.write', '✗', '△', '✓', '✓'],
              cn: ['ontology.write', '✗', '△', '✓', '✓']
            },
            {
              en: ['ontology.create', '✗', '✗', '△', '✓'],
              cn: ['ontology.create', '✗', '✗', '△', '✓']
            },
            {
              en: ['workflow.execute', '✗', '△', '✓', '✓'],
              cn: ['workflow.execute', '✗', '△', '✓', '✓']
            },
            {
              en: ['workflow.approve', '✗', '✗', '△', '✓'],
              cn: ['workflow.approve', '✗', '✗', '△', '✓']
            }
          ]
        }
      },
      {
        title: { en: 'Anti-Patterns to Avoid', cn: '要避免的反模式' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Anti-Pattern', 'Problem', 'Correct Approach'],
            cn: ['反模式', '问题', '正确做法']
          },
          rows: [
            {
              en: ['Direct Data Access', 'Bypasses governance', 'Use Ontology tools only'],
              cn: ['直接数据访问', '绕过治理', '仅使用 Ontology 工具']
            },
            {
              en: ['Missing Citations', 'Unverifiable outputs', 'Require citations always'],
              cn: ['缺少引用', '输出无法验证', '始终要求引用']
            },
            {
              en: ['Over-automation', 'High-risk without oversight', 'Start Tier 2, graduate to 4'],
              cn: ['过度自动化', '高风险无监督', '从第二层开始，升级到第四层']
            },
            {
              en: ['No Rollback', 'Irreversible mistakes', 'Design rollback for writes'],
              cn: ['无回滚', '不可逆错误', '为写操作设计回滚']
            }
          ]
        }
      },
      {
        title: { en: 'Golden Rule', cn: '黄金法则' },
        content: {
          en: 'LLMs don\'t directly access data—they call Ontology tools. This ensures every operation goes through governance layers and leaves an audit trail.',
          cn: 'LLM 不直接访问数据——它们调用 Ontology 工具。这确保每个操作都经过治理层并留下审计追踪。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What is the most important rule for AI data access?',
          cn: 'AI 数据访问最重要的规则是什么？'
        },
        options: [
          { en: 'AI can query any database directly', cn: 'AI 可以直接查询任何数据库' },
          { en: 'AI must use Ontology tools, not direct data access', cn: 'AI 必须使用 Ontology 工具，而非直接数据访问' },
          { en: 'AI should cache all data locally', cn: 'AI 应该在本地缓存所有数据' },
          { en: 'No rules are needed for read operations', cn: '读操作不需要规则' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'LLMs should never directly access data. They must use Ontology tools which enforce permissions, log actions, and provide citations. This is the foundation of AI governance.',
          cn: 'LLM 永远不应该直接访问数据。它们必须使用 Ontology 工具，这些工具强制执行权限、记录操作并提供引用。这是 AI 治理的基础。'
        }
      }
    ]
  }
];

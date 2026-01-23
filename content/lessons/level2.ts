// Level 2: Action Mastery - 课程内容

import { LessonContent } from './level1';

export const level2Lessons: LessonContent[] = [
  // 2.1 Action 的三重身份
  {
    id: 'l2_1',
    title: {
      en: "Action's Triple Identity",
      cn: 'Action 的三重身份'
    },
    sections: [
      {
        title: { en: 'One Action, Three Perspectives', cn: '一个 Action，三种视角' },
        content: {
          en: 'Every Action in Ontology simultaneously serves three purposes. Understanding this triple identity is key to designing robust, reusable Actions.',
          cn: 'Ontology 中的每个 Action 同时具备三重用途。理解这种三重身份是设计健壮、可复用 Action 的关键。'
        },
        type: 'text'
      },
      {
        title: { en: 'The Triple Identity', cn: '三重身份' },
        content: { en: '', cn: '' },
        type: 'diagram',
        data: {
          layers: [
            {
              name: { en: 'Business Operation', cn: '业务操作' },
              color: 'cyan',
              description: {
                en: 'A meaningful business activity with clear value',
                cn: '具有明确价值的有意义业务活动'
              },
              examples: {
                en: ['Approve Purchase Request', 'Ship Order', 'Escalate Incident'],
                cn: ['审批采购请求', '发货', '升级事件']
              }
            },
            {
              name: { en: 'API Endpoint', cn: 'API 端点' },
              color: 'emerald',
              description: {
                en: 'A callable interface for systems and applications',
                cn: '系统和应用程序可调用的接口'
              },
              examples: {
                en: ['POST /orders/{id}/ship', 'PUT /requests/{id}/approve', 'POST /incidents/{id}/escalate'],
                cn: ['POST /orders/{id}/ship', 'PUT /requests/{id}/approve', 'POST /incidents/{id}/escalate']
              }
            },
            {
              name: { en: 'Agent Tool', cn: 'Agent 工具' },
              color: 'purple',
              description: {
                en: 'A capability AI agents can invoke autonomously',
                cn: 'AI Agent 可以自主调用的能力'
              },
              examples: {
                en: ['ship_order(order_id, carrier)', 'approve_request(request_id, notes)', 'escalate_incident(incident_id, priority)'],
                cn: ['ship_order(order_id, carrier)', 'approve_request(request_id, notes)', 'escalate_incident(incident_id, priority)']
              }
            }
          ]
        }
      },
      {
        title: { en: 'Why This Matters', cn: '为什么这很重要' },
        content: {
          en: 'The triple identity means:\n\n- **Define Once**: Write the Action definition once\n- **Use Everywhere**: Automatically generate APIs, UIs, and Agent Tools\n- **Consistent Governance**: Same rules apply regardless of how Action is invoked\n- **Single Source of Truth**: Business logic is never duplicated',
          cn: '三重身份意味着：\n\n- **一次定义**：只需编写一次 Action 定义\n- **处处可用**：自动生成 API、UI 和 Agent Tool\n- **一致治理**：无论如何调用 Action，规则都相同\n- **单一事实源**：业务逻辑永不重复'
        },
        type: 'text'
      },
      {
        title: { en: 'The Key Insight', cn: '关键洞见' },
        content: {
          en: 'An Action is not just code—it is a **contract** between business intent, technical implementation, and AI capability. Design it once, and it works across all three dimensions.',
          cn: 'Action 不仅仅是代码——它是业务意图、技术实现和 AI 能力之间的**契约**。一次设计，三个维度通用。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Example: ApproveOrder Action', cn: '示例：ApproveOrder Action' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          title: { en: 'ApproveOrder - Three Perspectives', cn: 'ApproveOrder - 三个视角' },
          perspectives: [
            {
              name: { en: 'As Business Operation', cn: '作为业务操作' },
              items: {
                en: [
                  'Purpose: Manager confirms order is ready for fulfillment',
                  'Precondition: Order status is "Pending Approval"',
                  'Postcondition: Order status becomes "Approved"',
                  'Side Effect: Notification sent to warehouse'
                ],
                cn: [
                  '目的：经理确认订单可以履行',
                  '前置条件：订单状态为「待审批」',
                  '后置条件：订单状态变为「已审批」',
                  '副作用：通知发送到仓库'
                ]
              }
            },
            {
              name: { en: 'As API Endpoint', cn: '作为 API 端点' },
              items: {
                en: [
                  'Endpoint: PUT /api/orders/{orderId}/approve',
                  'Auth: Requires "order:approve" permission',
                  'Request Body: { notes?: string, priority?: string }',
                  'Response: 200 OK with updated order'
                ],
                cn: [
                  '端点：PUT /api/orders/{orderId}/approve',
                  '认证：需要「order:approve」权限',
                  '请求体：{ notes?: string, priority?: string }',
                  '响应：200 OK 返回更新后的订单'
                ]
              }
            },
            {
              name: { en: 'As Agent Tool', cn: '作为 Agent 工具' },
              items: {
                en: [
                  'Tool Name: approve_order',
                  'Description: "Approve a pending order for fulfillment"',
                  'Parameters: order_id (required), notes (optional)',
                  'When to Use: "When user asks to approve order" or "When order meets auto-approval criteria"'
                ],
                cn: [
                  '工具名称：approve_order',
                  '描述：「审批待处理订单以进行履行」',
                  '参数：order_id（必填）、notes（可选）',
                  '使用时机：「当用户要求审批订单」或「当订单符合自动审批条件」'
                ]
              }
            }
          ]
        }
      },
      {
        title: { en: 'Design Principle', cn: '设计原则' },
        content: {
          en: 'When designing an Action, always consider all three identities:\n\n1. **Business**: What value does this create? Who can perform it?\n2. **Technical**: How will systems call it? What data flows in/out?\n3. **AI**: How would an agent describe this? When should it be used?',
          cn: '设计 Action 时，始终考虑所有三重身份：\n\n1. **业务**：这创造什么价值？谁能执行？\n2. **技术**：系统如何调用？数据如何流入/流出？\n3. **AI**：Agent 如何描述这个？什么时候应该使用？'
        },
        type: 'text'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What are the three identities of an Action in Ontology?',
          cn: 'Ontology 中 Action 的三重身份是什么？'
        },
        options: [
          { en: 'Create, Read, Update', cn: '创建、读取、更新' },
          { en: 'Business Operation, API Endpoint, Agent Tool', cn: '业务操作、API 端点、Agent 工具' },
          { en: 'Input, Process, Output', cn: '输入、处理、输出' },
          { en: 'User, System, Database', cn: '用户、系统、数据库' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Every Action serves three purposes simultaneously: as a Business Operation (meaningful activity), an API Endpoint (callable interface), and an Agent Tool (AI capability). This triple identity enables "define once, use everywhere".',
          cn: '每个 Action 同时具备三重用途：作为业务操作（有意义的活动）、API 端点（可调用的接口）和 Agent 工具（AI 能力）。这种三重身份实现了「一次定义，处处可用」。'
        }
      }
    ]
  },

  // 2.2 状态机设计
  {
    id: 'l2_2',
    title: {
      en: 'State Machine Design',
      cn: '状态机设计'
    },
    sections: [
      {
        title: { en: 'Actions Drive State Transitions', cn: 'Action 驱动状态转换' },
        content: {
          en: 'In Ontology, Objects have states, and Actions are the **only** way to transition between states. This creates a clear, auditable, and governable system.',
          cn: '在 Ontology 中，对象有状态，Action 是状态转换的**唯一**方式。这创建了一个清晰、可审计、可治理的系统。'
        },
        type: 'text'
      },
      {
        title: { en: 'State Machine Components', cn: '状态机组件' },
        content: {
          en: 'A state machine consists of:\n\n- **States**: Named conditions an Object can be in\n- **Transitions**: Movements from one state to another\n- **Actions**: Operations that trigger transitions\n- **Guards**: Conditions that must be true for transition',
          cn: '状态机由以下部分组成：\n\n- **状态**：对象可能处于的命名条件\n- **转换**：从一个状态到另一个状态的移动\n- **动作**：触发转换的操作\n- **守卫**：转换必须满足的条件'
        },
        type: 'text'
      },
      {
        title: { en: 'The Golden Rule', cn: '黄金法则' },
        content: {
          en: 'No state change happens without an Action. Direct database updates are forbidden. This ensures every change is intentional, validated, and recorded.',
          cn: '没有 Action 就没有状态变化。禁止直接数据库更新。这确保每个变化都是有意的、经过验证的、有记录的。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Example: Order State Machine', cn: '示例：订单状态机' },
        content: { en: '', cn: '' },
        type: 'diagram',
        data: {
          type: 'stateMachine',
          states: [
            { name: { en: 'Draft', cn: '草稿' }, color: 'gray' },
            { name: { en: 'Pending', cn: '待审批' }, color: 'yellow' },
            { name: { en: 'Approved', cn: '已审批' }, color: 'blue' },
            { name: { en: 'Shipped', cn: '已发货' }, color: 'purple' },
            { name: { en: 'Delivered', cn: '已送达' }, color: 'emerald' },
            { name: { en: 'Cancelled', cn: '已取消' }, color: 'red' }
          ],
          transitions: [
            { from: 'Draft', to: 'Pending', action: 'Submit', cn_action: '提交' },
            { from: 'Pending', to: 'Approved', action: 'Approve', cn_action: '审批' },
            { from: 'Pending', to: 'Cancelled', action: 'Reject', cn_action: '拒绝' },
            { from: 'Approved', to: 'Shipped', action: 'Ship', cn_action: '发货' },
            { from: 'Shipped', to: 'Delivered', action: 'Confirm Delivery', cn_action: '确认送达' },
            { from: 'Draft', to: 'Cancelled', action: 'Cancel', cn_action: '取消' },
            { from: 'Pending', to: 'Draft', action: 'Revise', cn_action: '修订' }
          ]
        }
      },
      {
        title: { en: 'Designing Good State Machines', cn: '设计好的状态机' },
        content: {
          en: '1. **Meaningful States**: Each state should represent a real business condition\n2. **Clear Transitions**: Users should understand what Action gets them to next state\n3. **No Dead Ends**: Every state should have at least one outgoing transition (except terminal states)\n4. **Reversibility**: Consider if Actions should be reversible\n5. **Minimal States**: Don\'t create states that don\'t change available Actions',
          cn: '1. **有意义的状态**：每个状态都应代表真实的业务条件\n2. **清晰的转换**：用户应该理解什么 Action 能让他们到达下一个状态\n3. **无死路**：每个状态至少有一个出口转换（终态除外）\n4. **可逆性**：考虑 Action 是否应该可逆\n5. **最小状态**：不要创建不改变可用 Action 的状态'
        },
        type: 'text'
      },
      {
        title: { en: 'Guards: Conditional Transitions', cn: '守卫：条件转换' },
        content: {
          en: 'Guards add conditions to transitions:\n\n```\nApprove: Pending → Approved\n  Guard: order.total < 10000 OR user.hasRole("SeniorManager")\n```\n\nThis means: Orders under $10,000 can be approved by any manager, but larger orders need a Senior Manager.',
          cn: '守卫为转换添加条件：\n\n```\nApprove: Pending → Approved\n  Guard: order.total < 10000 OR user.hasRole("SeniorManager")\n```\n\n这意味着：10,000 美元以下的订单任何经理都可以审批，但更大的订单需要高级经理。'
        },
        type: 'text'
      },
      {
        title: { en: 'State + Action = Complete Behavior', cn: '状态 + 动作 = 完整行为' },
        content: {
          en: 'Together, states and Actions define the complete behavior of your system. An Object\'s current state determines which Actions are available. Each Action may transition to a new state, making different Actions available.',
          cn: '状态和 Action 共同定义系统的完整行为。对象的当前状态决定哪些 Action 可用。每个 Action 可能转换到新状态，使不同的 Action 变得可用。'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'Why should state changes only happen through Actions?',
          cn: '为什么状态变化只能通过 Action 发生？'
        },
        options: [
          { en: 'To make the code more complex', cn: '为了让代码更复杂' },
          { en: 'To ensure changes are intentional, validated, and recorded', cn: '确保变化是有意的、经过验证的、有记录的' },
          { en: 'To slow down the system', cn: '为了让系统变慢' },
          { en: 'There is no specific reason', cn: '没有特定原因' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Requiring Actions for state changes ensures: 1) Every change is intentional (someone triggered an Action), 2) Validation rules are enforced, 3) Changes are recorded for audit, 4) Governance rules can be applied consistently.',
          cn: '要求通过 Action 进行状态变化确保：1）每个变化都是有意的（有人触发了 Action），2）验证规则得到执行，3）变化被记录以供审计，4）治理规则可以一致地应用。'
        }
      }
    ]
  },

  // 2.3 Action 到 API 的映射
  {
    id: 'l2_3',
    title: {
      en: 'Action to API Mapping',
      cn: 'Action 到 API 的映射'
    },
    sections: [
      {
        title: { en: 'From Action to REST API', cn: '从 Action 到 REST API' },
        content: {
          en: 'Every Action can be automatically mapped to a REST API endpoint. This mapping follows consistent conventions that make APIs predictable and easy to use.',
          cn: '每个 Action 都可以自动映射到 REST API 端点。这种映射遵循一致的约定，使 API 可预测且易于使用。'
        },
        type: 'text'
      },
      {
        title: { en: 'Mapping Convention', cn: '映射约定' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Action Pattern', 'HTTP Method', 'URL Pattern'],
            cn: ['Action 模式', 'HTTP 方法', 'URL 模式']
          },
          rows: [
            {
              en: ['Create{Object}', 'POST', '/{objects}'],
              cn: ['Create{Object}', 'POST', '/{objects}']
            },
            {
              en: ['{Verb}{Object}', 'POST', '/{objects}/{id}/{verb}'],
              cn: ['{Verb}{Object}', 'POST', '/{objects}/{id}/{verb}']
            },
            {
              en: ['Update{Property}', 'PATCH', '/{objects}/{id}'],
              cn: ['Update{Property}', 'PATCH', '/{objects}/{id}']
            },
            {
              en: ['Delete{Object}', 'DELETE', '/{objects}/{id}'],
              cn: ['Delete{Object}', 'DELETE', '/{objects}/{id}']
            },
            {
              en: ['Batch{Verb}', 'POST', '/{objects}/batch/{verb}'],
              cn: ['Batch{Verb}', 'POST', '/{objects}/batch/{verb}']
            }
          ]
        }
      },
      {
        title: { en: 'Example Mappings', cn: '映射示例' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          title: { en: 'Action → API Endpoint', cn: 'Action → API 端点' },
          mappings: [
            {
              action: 'CreateOrder',
              method: 'POST',
              url: '/orders',
              body: { en: '{ customer_id, items: [...] }', cn: '{ customer_id, items: [...] }' }
            },
            {
              action: 'ApproveOrder',
              method: 'POST',
              url: '/orders/{id}/approve',
              body: { en: '{ notes?: string }', cn: '{ notes?: string }' }
            },
            {
              action: 'ShipOrder',
              method: 'POST',
              url: '/orders/{id}/ship',
              body: { en: '{ carrier, tracking_number }', cn: '{ carrier, tracking_number }' }
            },
            {
              action: 'CancelOrder',
              method: 'POST',
              url: '/orders/{id}/cancel',
              body: { en: '{ reason }', cn: '{ reason }' }
            },
            {
              action: 'BatchApproveOrders',
              method: 'POST',
              url: '/orders/batch/approve',
              body: { en: '{ order_ids: [...], notes }', cn: '{ order_ids: [...], notes }' }
            }
          ]
        }
      },
      {
        title: { en: 'Why POST for Actions?', cn: '为什么 Action 用 POST？' },
        content: {
          en: 'Even though "ApproveOrder" might seem like an update (PUT/PATCH), we use POST because:\n\n- Actions represent **operations**, not data changes\n- Actions may have side effects (notifications, workflows)\n- Actions are not idempotent by default\n- POST clearly signals "this does something"',
          cn: '尽管「ApproveOrder」看起来像更新（PUT/PATCH），我们使用 POST 因为：\n\n- Action 代表**操作**，而不是数据变化\n- Action 可能有副作用（通知、工作流）\n- Action 默认不是幂等的\n- POST 清晰地表示「这会做些什么」'
        },
        type: 'text'
      },
      {
        title: { en: 'Action Parameters → Request Body', cn: 'Action 参数 → 请求体' },
        content: {
          en: 'Action parameters map directly to the request body. The type system ensures validation:\n\n```typescript\n// Action Definition\nShipOrder(orderId: string, carrier: string, trackingNumber?: string)\n\n// Generated API\nPOST /orders/{orderId}/ship\n{\n  "carrier": "FedEx",          // required\n  "trackingNumber": "123456"   // optional\n}\n```',
          cn: 'Action 参数直接映射到请求体。类型系统确保验证：\n\n```typescript\n// Action 定义\nShipOrder(orderId: string, carrier: string, trackingNumber?: string)\n\n// 生成的 API\nPOST /orders/{orderId}/ship\n{\n  "carrier": "FedEx",          // 必填\n  "trackingNumber": "123456"   // 可选\n}\n```'
        },
        type: 'text'
      },
      {
        title: { en: 'Automatic API Documentation', cn: '自动 API 文档' },
        content: {
          en: 'Because Actions are well-defined, we can automatically generate OpenAPI/Swagger documentation including:\n\n- Endpoint descriptions from Action descriptions\n- Parameter schemas from Action parameters\n- Response schemas from Action return types\n- Authentication requirements from governance rules',
          cn: '因为 Action 定义明确，我们可以自动生成 OpenAPI/Swagger 文档，包括：\n\n- 从 Action 描述生成端点描述\n- 从 Action 参数生成参数模式\n- 从 Action 返回类型生成响应模式\n- 从治理规则生成认证要求'
        },
        type: 'keypoint'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What HTTP method is typically used for Actions like "ApproveOrder" or "ShipOrder"?',
          cn: '「ApproveOrder」或「ShipOrder」这样的 Action 通常使用什么 HTTP 方法？'
        },
        options: [
          { en: 'GET', cn: 'GET' },
          { en: 'PUT', cn: 'PUT' },
          { en: 'POST', cn: 'POST' },
          { en: 'DELETE', cn: 'DELETE' }
        ],
        correctIndex: 2,
        explanation: {
          en: 'POST is used for Actions because they represent operations (not just data changes), may have side effects, and are typically not idempotent. POST clearly signals "this does something" rather than "this updates data".',
          cn: 'POST 用于 Action，因为它们代表操作（不仅仅是数据变化），可能有副作用，通常不是幂等的。POST 清晰地表示「这会做些什么」而不是「这更新数据」。'
        }
      }
    ]
  },

  // 2.4 Action 到 Agent Tool 的映射
  {
    id: 'l2_4',
    title: {
      en: 'Action to Agent Tool Mapping',
      cn: 'Action 到 Agent Tool 的映射'
    },
    sections: [
      {
        title: { en: 'Actions as AI Capabilities', cn: 'Action 作为 AI 能力' },
        content: {
          en: 'The same Actions that power your APIs can become tools for AI Agents. This transforms your Ontology into a vocabulary that AI can use to operate your business.',
          cn: '驱动 API 的同一组 Action 可以成为 AI Agent 的工具。这将你的 Ontology 转化为 AI 可以用来操作业务的词汇表。'
        },
        type: 'text'
      },
      {
        title: { en: 'What Makes a Good Agent Tool?', cn: '什么是好的 Agent 工具？' },
        content: {
          en: 'For AI to use an Action effectively, it needs:\n\n- **Clear Name**: Describes what the tool does\n- **Detailed Description**: When and why to use it\n- **Well-typed Parameters**: What inputs are needed\n- **Predictable Behavior**: What will happen when called',
          cn: '为了让 AI 有效使用 Action，它需要：\n\n- **清晰的名称**：描述工具做什么\n- **详细的描述**：何时以及为什么使用它\n- **明确的参数类型**：需要什么输入\n- **可预测的行为**：调用时会发生什么'
        },
        type: 'text'
      },
      {
        title: { en: 'The Magic of Ontology', cn: 'Ontology 的魔力' },
        content: {
          en: 'Because Ontology already defines Actions with business context, preconditions, and governance—all the information an AI Agent needs is already there. No separate tool definitions required.',
          cn: '因为 Ontology 已经定义了具有业务上下文、前置条件和治理的 Action——AI Agent 需要的所有信息都已经存在。不需要单独的工具定义。'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'Mapping Structure', cn: '映射结构' },
        content: { en: '', cn: '' },
        type: 'comparison',
        data: {
          headers: {
            en: ['Action Property', 'Agent Tool Property'],
            cn: ['Action 属性', 'Agent Tool 属性']
          },
          rows: [
            {
              en: ['Action Name', 'Tool Name (snake_case)'],
              cn: ['Action 名称', '工具名称（snake_case）']
            },
            {
              en: ['Action Description', 'Tool Description'],
              cn: ['Action 描述', '工具描述']
            },
            {
              en: ['Business Layer', 'When to Use guidance'],
              cn: ['业务层', '何时使用指导']
            },
            {
              en: ['Parameters', 'Input Schema'],
              cn: ['参数', '输入模式']
            },
            {
              en: ['Preconditions', 'Validation Rules'],
              cn: ['前置条件', '验证规则']
            },
            {
              en: ['Governance', 'Permission Check'],
              cn: ['治理', '权限检查']
            }
          ]
        }
      },
      {
        title: { en: 'Example: ApproveOrder as Agent Tool', cn: '示例：ApproveOrder 作为 Agent 工具' },
        content: { en: '', cn: '' },
        type: 'example',
        data: {
          title: { en: 'Generated Tool Definition', cn: '生成的工具定义' },
          code: {
            en: `{
  "name": "approve_order",
  "description": "Approve a pending order for fulfillment. Use when a customer order has been reviewed and is ready to proceed to shipping.",
  "parameters": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "The unique identifier of the order to approve"
      },
      "notes": {
        "type": "string",
        "description": "Optional approval notes or comments"
      }
    },
    "required": ["order_id"]
  },
  "preconditions": [
    "Order must be in 'Pending' status",
    "User must have 'order:approve' permission"
  ]
}`,
            cn: `{
  "name": "approve_order",
  "description": "审批待处理订单以进行履行。当客户订单已审核并准备好发货时使用。",
  "parameters": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "要审批的订单唯一标识符"
      },
      "notes": {
        "type": "string",
        "description": "可选的审批备注或评论"
      }
    },
    "required": ["order_id"]
  },
  "preconditions": [
    "订单必须处于「待审批」状态",
    "用户必须拥有「order:approve」权限"
  ]
}`
          }
        }
      },
      {
        title: { en: 'AI-Friendly Descriptions', cn: 'AI 友好的描述' },
        content: {
          en: 'Write Action descriptions with AI in mind:\n\n- **Be specific**: "Approve a pending order" > "Process order"\n- **Include context**: "Use when order review is complete"\n- **State constraints**: "Only works for orders in Pending status"\n- **Describe outcomes**: "Changes status to Approved and notifies warehouse"',
          cn: '编写 Action 描述时考虑 AI：\n\n- **具体化**：「审批待处理订单」> 「处理订单」\n- **包含上下文**：「当订单审核完成时使用」\n- **说明约束**：「仅适用于待审批状态的订单」\n- **描述结果**：「将状态更改为已审批并通知仓库」'
        },
        type: 'text'
      },
      {
        title: { en: 'Governance in AI Context', cn: 'AI 上下文中的治理' },
        content: {
          en: 'The same governance rules that apply to human users apply to AI:\n\n- Permission checks before Action execution\n- Audit logging of AI-initiated Actions\n- Rate limiting and quota enforcement\n- Human-in-the-loop for sensitive Actions',
          cn: '适用于人类用户的治理规则同样适用于 AI：\n\n- Action 执行前的权限检查\n- AI 发起的 Action 的审计日志\n- 速率限制和配额执行\n- 敏感 Action 的人机协同'
        },
        type: 'keypoint'
      },
      {
        title: { en: 'The AI-First Enterprise', cn: 'AI 优先的企业' },
        content: {
          en: 'With Actions mapped to Agent Tools, your entire Ontology becomes accessible to AI. An AI Agent can:\n\n- Discover available Actions dynamically\n- Understand when each Action is appropriate\n- Execute Actions with proper validation\n- Respect governance rules automatically',
          cn: '将 Action 映射到 Agent 工具后，你的整个 Ontology 对 AI 可用。AI Agent 可以：\n\n- 动态发现可用 Action\n- 理解每个 Action 何时适用\n- 执行带有适当验证的 Action\n- 自动遵守治理规则'
        },
        type: 'text'
      }
    ],
    quiz: [
      {
        question: {
          en: 'What property from the Action definition becomes the "When to Use" guidance for AI?',
          cn: 'Action 定义中的什么属性成为 AI 的「何时使用」指导？'
        },
        options: [
          { en: 'Technical implementation details', cn: '技术实现细节' },
          { en: 'Business Layer description', cn: '业务层描述' },
          { en: 'Database schema', cn: '数据库模式' },
          { en: 'API response format', cn: 'API 响应格式' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'The Business Layer of an Action contains the purpose, context, and business value—exactly what an AI Agent needs to understand when to use the tool. This is why well-written Business Layer descriptions are crucial for AI-enabled systems.',
          cn: 'Action 的业务层包含目的、上下文和业务价值——正是 AI Agent 需要理解何时使用工具的信息。这就是为什么写好业务层描述对 AI 赋能系统至关重要。'
        }
      }
    ]
  }
];

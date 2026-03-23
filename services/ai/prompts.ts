/** Language display names for AI prompt hints. */
const LANGUAGE_NAMES: Record<string, string> = {
  cn: 'Chinese (中文)',
  en: 'English',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  ar: 'Arabic (العربية)',
};

/**
 * Build a language preference hint to append to the system prompt.
 * @param preserveTerms — when true (e.g. designOntology), instructs the model
 * to keep technical identifiers (object name, property name, id, API paths)
 * in their original language while writing descriptions in the user's language.
 */
export function buildLanguageHint(lang?: string, preserveTerms = false): string {
  if (!lang) return '';
  const name = LANGUAGE_NAMES[lang] || lang;
  if (preserveTerms) {
    return `\n\nIMPORTANT — Language requirement: The user's preferred language is ${name}. Write all human-readable text (descriptions, explanations, business logic, comments, side effects, trigger conditions) in ${name}. However, keep technical identifiers unchanged — object name/id, property name, API endpoints, parameter names, link labels, and tool names should stay in their original language as they map to code and data schemas.`;
  }
  return `\n\nIMPORTANT — Language requirement: The user's preferred language is ${name}. You MUST respond entirely in ${name}, including all titles, descriptions, analysis, and suggestions. Even if the input data (object names, property names, etc.) is in another language, your response text must be in ${name}.`;
}

// ═══════════════════════════════════════════════════════════════════
//                     方法论核心 System Prompt
// ═══════════════════════════════════════════════════════════════════

export const SYSTEM_INSTRUCTION = `
你是一位资深的Ontology架构师，专注于"Ontology-First"的企业智能系统设计。
你精通中英双语，引导用户完成从需求发现到系统设计的完整流程。

═══════════════════════════════════════════════════════════════════
                        核心方法论原则
═══════════════════════════════════════════════════════════════════

【核心哲学】Ontology ≠ 知识图谱
- 知识图谱是静态的（只能查询）
- Ontology是动态的（可以执行）
- 核心差异：ACTION（动作）连接自然语义到可执行函数

【Ontology 三层架构 + AI 能力叠加】
核心三层：
1. Semantic Layer（语义层）：定义业务世界的概念模型 - Objects（对象）和 Links（关系）
2. Kinetic Layer（动力层）：连接概念模型到真实数据源 - 数据映射和ETL
3. Dynamic Layer（动态层）：引入行为 - Actions（动作）、业务规则、状态管理

AI 能力叠加（非独立第四层，而是增强层）：
- 增强 Semantic：智能属性（Smart Properties）、嵌入向量
- 增强 Dynamic：AI 辅助动作、生成式操作
- 提供 Agent 能力：基于 Ontology 的智能代理

【Decision-First原则】
如果一个Object或Action不直接支持用户的操作决策，就不应该在核心Ontology中。
设计时问自己：用户拿到这个信息后，会做什么决策？会执行什么动作？

═══════════════════════════════════════════════════════════════════
                     ACTION的三重身份（核心！）
═══════════════════════════════════════════════════════════════════

每个Action必须同时具备三层定义，这是Ontology区别于知识图谱的灵魂：

【业务层 Business Layer】
- 业务描述：用自然语言描述这个动作（如"审批采购订单"）
- 目标对象：这个动作作用于哪个Object
- 执行角色：谁有权限执行这个动作
- 触发条件：什么情况下需要执行这个动作

【逻辑层 Logic Layer】
- 前置条件（Preconditions）：执行前必须满足的条件
- 输入参数（Parameters）：执行时需要的输入
- 后置状态（Postconditions）：执行后Object的状态变化
- 副作用（Side Effects）：触发的通知、日志等

【实现层 Implementation Layer】
- API端点：REST API的URL和方法
- 请求载荷：API的输入参数结构
- Agent工具规范：供AI Agent调用的工具定义

示例 - "审批订单"的三层定义：
┌─────────────────────────────────────────────────────────┐
│ 业务层：经理审批超过10万元的采购订单                      │
│ 逻辑层：前置[status=待审批 AND amount>100000]            │
│        参数[order_id, decision, notes]                  │
│        后置[status→已审批/已拒绝]                        │
│ 实现层：POST /api/orders/{id}/approve                   │
│        Tool: approve_purchase_order(order_id, decision) │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                        需求勘察协议（SOP）
═══════════════════════════════════════════════════════════════════

你的目标是高效地发现以下五个关键要素。每次最多问2个问题，保持简洁专业。

1. 【业务场景】用户要解决什么业务问题？核心痛点是什么？
2. 【核心对象 Objects】业务中的主要"名词"是什么？（如：工单、客户、资产）
3. 【核心动作 Actions】对这些对象执行什么操作？（如：创建、审批、分配、关闭）
   - 特别关注：每个动作的触发条件、执行者、状态变化
4. 【数据来源 Integrations】数据目前存在哪里？（如：ERP、CRM、Excel、数据库）
5. 【AI增强点 Augmentation】哪里有人工瓶颈？AI可以帮助什么？

【引导技巧】
- 当用户提到一个动作时，追问三层定义：
  "这个[动作]是谁执行的？需要满足什么条件？执行后状态会变成什么？"
- 当用户描述流程时，帮助提取Noun-Verb：
  "我理解到：[对象A]通过[动作X]变成[状态Y]，对吗？"
- 主动引导用户思考Decision-First：
  "用户看到这个信息后，通常会做什么决定？"

═══════════════════════════════════════════════════════════════════
                          平台无关原则
═══════════════════════════════════════════════════════════════════

你的设计是逻辑蓝图，可以在任何现代技术栈上实现：
- Semantic Layer → 数据模型/知识图谱（dbt、Neo4j、自建元数据）
- Kinetic Layer → 数据集成（Spark、Airflow、Flink）
- Dynamic Layer → 业务API（FastAPI、gRPC、微服务）
- AI Layer → Agent框架（LangChain、AutoGen、自研）

专注于逻辑设计，不绑定任何特定平台或产品。

═══════════════════════════════════════════════════════════════════
                            输出规范
═══════════════════════════════════════════════════════════════════

【语言匹配】
始终匹配用户的语言。如果用户说中文，用中文回答和输出JSON描述。

【对话输出】
- 先提供专业的架构洞见
- 用结构化方式确认理解（如用表格列出识别的Objects和Actions）
- 【重要】主动推导完整的Action链：
  当用户提到一个业务对象（如订单、工单），主动列出该对象生命周期中可能涉及的所有动作，
  不仅限于用户明确提到的。例如：
  "基于您描述的采购订单场景，我识别到以下动作链：
   创建 → 提交审批 → 审批/拒绝 → 发货 → 收货 → 付款 → 关闭
   另外还有：退换货、取消、查询等辅助动作"
  然后询问用户确认或补充
- 当信息足够时，建议用户点击"合成架构"按钮

【思维展示】
适时向用户展示你的思考过程，帮助他们学习方法论：
"根据Decision-First原则，我认为这里需要一个[X]对象，因为..."
"这个Action的三层定义我理解为：[业务层]...[逻辑层]...[实现层]..."
`;

// ═══════════════════════════════════════════════════════════════════
//                     Ontology 设计生成 Prompt
// ═══════════════════════════════════════════════════════════════════

export const DESIGN_PROMPT_TEMPLATE = (historyText: string) => `
基于以下咨询历史，设计完整的智能Ontology和系统集成架构。

咨询历史：
${historyText}

═══════════════════════════════════════════════════════════════════
                          设计要求
═══════════════════════════════════════════════════════════════════

1. 【核心对象 Objects】
   - 根据讨论识别所有业务实体
   - 每个Object包含完整的属性定义

2. 【业务动作 Actions - Decision-First 原则】
   遵循 Decision-First 方法论，优先建模能形成"决策闭环"的关键动作，
   而非机械地推导完整CRUD。

   ▶ 核心原则：
   - 优先：用户明确提到的关键决策点（审批、分配、调度等）
   - 其次：支撑这些决策的必要操作（状态更新、数据录入）
   - 延后：可以后续扩展的通用CRUD（纯编辑、批量导入等）

   ▶ 典型决策闭环模式：
   - 审批闭环：提交 → 审批/拒绝 → [可选]重新提交
   - 执行闭环：分配 → 执行 → 确认完成
   - 异常闭环：标记异常 → 处理 → 关闭

   ▶ 动作类型参考（按决策重要性排序）：
   - 决策类(高优先)：审批、拒绝、分配、调度、升级、取消
   - 执行类：发货、收货、付款、完成
   - 状态类：提交、关闭、重开
   - 辅助类(按需)：创建、编辑、导入、导出

   示例 - 采购订单(PO)的决策闭环：
   [必须] 提交审批 → 审批/拒绝 → 确认收货 → 付款确认
   [可选] 创建、编辑、取消、退换货、关闭

3. 【三层定义】每个Action必须包含：
   - businessLayer: 业务描述、目标对象、执行角色、触发条件
   - logicLayer: 前置条件、参数、后置状态、副作用
   - implementationLayer: API端点、方法、请求载荷、Agent工具规范
   - governance: 权限等级、是否需要人工审批、风险等级

4. 【关系 Links】定义Objects之间的关联关系

5. 【外部集成 Integrations】显示与ERP、CRM、数据库等的连接

6. 【AI增强】包含Smart Properties、Parsing Pipelines、Generative Actions

7. 【语言】确保所有标签和描述与对话中使用的语言匹配

严格按以下JSON格式输出：
{
  "objects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "properties": [{"name": "string", "type": "string", "isAIDerived": boolean, "logicDescription": "string"}],
      "actions": [
        {
          "name": "string",
          "type": "generative" | "traditional",
          "description": "string",
          "aiLogic": "string (如果是generative类型)",
          "businessLayer": {
            "description": "业务描述",
            "targetObject": "目标对象ID",
            "executorRole": "执行角色",
            "triggerCondition": "触发条件"
          },
          "logicLayer": {
            "preconditions": ["前置条件1", "前置条件2"],
            "parameters": [
              {"name": "参数名", "type": "string|number|boolean|date|object|array", "required": true, "description": "参数说明"}
            ],
            "postconditions": ["状态变更1", "状态变更2"],
            "sideEffects": ["发送通知", "记录日志"]
          },
          "implementationLayer": {
            "apiEndpoint": "/api/resource/{id}/action",
            "apiMethod": "POST",
            "requestPayload": {"key": "value示例"},
            "agentToolSpec": {
              "name": "tool_name",
              "description": "工具描述",
              "parameters": {"type": "object", "properties": {}, "required": []}
            }
          },
          "governance": {
            "permissionTier": 1-4,
            "requiresHumanApproval": boolean,
            "auditLog": boolean,
            "riskLevel": "low" | "medium" | "high"
          }
        }
      ],
      "aiFeatures": [{"type": "Parsing Pipeline" | "Smart Property" | "Semantic Search" | "Generative Action", "description": "string"}]
    }
  ],
  "links": [
    {"id": "string", "source": "objId", "target": "objId", "label": "string", "isSemantic": boolean}
  ],
  "integrations": [
    {
      "systemName": "string",
      "dataPoints": ["string"],
      "mechanism": "API" | "Webhook" | "Batch" | "AI Parsing",
      "targetObjectId": "objId"
    }
  ]
}`;

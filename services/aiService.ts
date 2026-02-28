import { AISettings, AIProvider, ChatMessage, AI_PROVIDERS } from '../types';

// File attachment interface for multimodal chat
export interface FileAttachment {
  name: string;
  content: string;      // Text content or base64 for binary
  mimeType: string;
  isBase64: boolean;
  extractedText?: string; // Client-side extracted text for Office docs (fallback)
}

export type ModelSource = 'hardcoded' | 'api';

export interface EnrichedModelInfo {
  id: string;
  name: string;
  description?: string;
  source?: ModelSource;
  inputModalities?: string[];
  contextLength?: number;
  supportsTools?: boolean;
  supportsStructuredOutput?: boolean;
  promptPrice?: number;
  completionPrice?: number;
}

// System Prompt - 方法论核心
const SYSTEM_INSTRUCTION = `
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

// Ontology设计生成的Prompt
const DESIGN_PROMPT_TEMPLATE = (historyText: string) => `
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

// Cached Gemini SDK module and instance for performance
let cachedGoogleGenAI: typeof import('@google/genai').GoogleGenAI | null = null;
let cachedGeminiInstance: InstanceType<typeof import('@google/genai').GoogleGenAI> | null = null;
let cachedGeminiApiKey: string | null = null;

export class AIService {
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
  }

  /** Extract JSON from a response that may be wrapped in markdown code fences. */
  private extractJSON(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) return trimmed;
    // Extract from ```json ... ``` or ``` ... ```
    const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) return fenceMatch[1].trim();
    // Fallback: extract first { ... } block
    const braceMatch = trimmed.match(/\{[\s\S]*\}/);
    if (braceMatch) return braceMatch[0];
    return trimmed;
  }

  updateSettings(settings: AISettings) {
    const previousKey = this.getApiKey();
    this.settings = settings;
    // Clear cached Gemini instance if API key changed
    if (this.settings.provider === 'gemini' && cachedGeminiApiKey !== this.getApiKey()) {
      cachedGeminiInstance = null;
      cachedGeminiApiKey = null;
    }
    // Keep cache coherent even if provider changed away from Gemini.
    if (settings.provider !== 'gemini' && previousKey !== this.getApiKey()) {
      cachedGeminiInstance = null;
      cachedGeminiApiKey = null;
    }
  }

  private getApiKey(): string {
    const settingsWithMap = this.settings as AISettings & {
      apiKeys?: Partial<Record<AIProvider, string>>;
    };
    // When apiKeys map exists, only use the key for the current provider.
    // Fall back to legacy apiKey field only when apiKeys map is absent (old data).
    if (settingsWithMap.apiKeys) {
      return (settingsWithMap.apiKeys[this.settings.provider] || '').trim();
    }
    return (this.settings.apiKey || '').trim();
  }

  private requireApiKey(): string {
    const key = this.getApiKey();
    if (!key) {
      throw new Error(`Missing API key for provider: ${this.settings.provider}`);
    }
    return key;
  }

  private getBaseUrl(): string {
    if (this.settings.provider === 'custom' && this.settings.customBaseUrl) {
      const url = this.settings.customBaseUrl.trim();
      // Validate URL format - throw error to prevent sending API key to wrong endpoint
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Invalid customBaseUrl: must start with http:// or https://');
      }
      // Validate URL is actually parseable
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid customBaseUrl: not a valid URL');
      }
      // Remove trailing slash for consistency
      return url.replace(/\/+$/, '');
    }
    const provider = AI_PROVIDERS.find(p => p.id === this.settings.provider);
    const baseUrl = provider?.baseUrl;
    if (!baseUrl) {
      throw new Error(`No base URL configured for provider: ${this.settings.provider}`);
    }
    return baseUrl;
  }

  private async callGemini(messages: { role: string; content: string }[]): Promise<string> {
    // Use cached SDK module
    if (!cachedGoogleGenAI) {
      const module = await import('@google/genai');
      cachedGoogleGenAI = module.GoogleGenAI;
    }

    // Reuse cached instance if API key matches
    if (!cachedGeminiInstance || cachedGeminiApiKey !== this.getApiKey()) {
      const apiKey = this.requireApiKey();
      cachedGeminiInstance = new cachedGoogleGenAI({ apiKey });
      cachedGeminiApiKey = apiKey;
    }

    const ai = cachedGeminiInstance;

    // Build contents array with full history (both user and assistant messages)
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Use generateContent with full history for proper context
    const response = await ai.models.generateContent({
      model: this.settings.model,
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: 'model', parts: [{ text: '我理解了，我将作为 Ontology 架构师，遵循方法论原则来帮助你设计系统。' }] },
        ...contents,
      ],
    });

    return response.text || '';
  }

  private async callOpenAICompatible(messages: { role: string; content: string }[]): Promise<string> {
    const baseUrl = this.getBaseUrl();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.requireApiKey()}`,
    };

    // OpenRouter需要额外的header
    if (this.settings.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'Ontology Architect';
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });
    } catch (fetchError) {
      // Network-level failure (DNS, CORS, proxy, timeout)
      throw new Error(
        `无法连接到 ${baseUrl}（网络错误）。请检查：1) 网络连接是否正常；2) 是否需要代理/VPN 访问该服务；3) 浏览器控制台是否有 CORS 错误。`
      );
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API调用失败: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callZhipu(messages: { role: string; content: string }[]): Promise<string> {
    const baseUrl = this.getBaseUrl();
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.requireApiKey()}`,
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });
    } catch (fetchError) {
      throw new Error(
        `无法连接到 ${baseUrl}（网络错误）。请检查网络连接或代理设置。`
      );
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`智谱API调用失败: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async chat(history: ChatMessage[], nextMessage: string): Promise<string> {
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: nextMessage },
    ];

    try {
      switch (this.settings.provider) {
        case 'gemini':
          return await this.callGemini(messages);
        case 'zhipu':
          return await this.callZhipu(messages);
        case 'moonshot':
        case 'openrouter':
        case 'openai':
        case 'custom':
        default:
          return await this.callOpenAICompatible(messages);
      }
    } catch (error) {
      console.error('AI调用失败:', error);
      throw error;
    }
  }

  // Multimodal chat - supports files (images, PDFs, etc.)
  async chatWithFiles(
    history: ChatMessage[],
    nextMessage: string,
    files: FileAttachment[]
  ): Promise<string> {
    // If no binary files, use regular chat with text files appended
    const hasMultimodalFiles = files.some(f => f.isBase64);

    if (!hasMultimodalFiles) {
      // Append text file contents to the message
      let enhancedMessage = nextMessage;
      for (const file of files) {
        enhancedMessage += `\n\n--- 附件: ${file.name} ---\n${file.content}\n--- 附件结束 ---`;
      }
      return this.chat(history, enhancedMessage);
    }

    // Handle multimodal content
    try {
      switch (this.settings.provider) {
        case 'gemini':
          return await this.callGeminiMultimodal(history, nextMessage, files);
        case 'moonshot':
        case 'openrouter':
        case 'openai':
          return await this.callOpenAIMultimodal(history, nextMessage, files);
        case 'zhipu':
          return await this.callZhipuMultimodal(history, nextMessage, files);
        case 'custom':
        default:
          // For custom providers, try OpenAI format first
          return await this.callOpenAIMultimodal(history, nextMessage, files);
      }
    } catch (error) {
      console.error('多模态AI调用失败:', error);
      throw error;
    }
  }

  private isOfficeMimeType(mimeType: string): boolean {
    return mimeType.includes('wordprocessingml') ||
      mimeType.includes('spreadsheetml') ||
      mimeType.includes('presentationml') ||
      mimeType.includes('msword') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint');
  }

  private async callGeminiMultimodal(
    history: ChatMessage[],
    nextMessage: string,
    files: FileAttachment[]
  ): Promise<string> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });

    // Build parts for the message
    const parts: any[] = [];

    // Add text message
    if (nextMessage) {
      parts.push({ text: nextMessage });
    }

    // Add files
    for (const file of files) {
      if (file.isBase64) {
        if (this.isOfficeMimeType(file.mimeType)) {
          // Office files: use File API (more reliable than inlineData for docx/xlsx/pptx)
          try {
            const binaryStr = atob(file.content);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: file.mimeType });
            const uploaded = await ai.files.upload({
              file: blob,
              config: { mimeType: file.mimeType },
            });
            if (uploaded.uri) {
              parts.push({
                fileData: { fileUri: uploaded.uri, mimeType: file.mimeType },
              });
            } else {
              throw new Error('File API returned no URI');
            }
          } catch (err) {
            // Fallback to extractedText if File API fails
            console.warn('Gemini File API upload failed, falling back to extractedText:', err);
            if (file.extractedText) {
              parts.push({
                text: `\n--- 附件: ${file.name} (文本提取) ---\n${file.extractedText}\n--- 附件结束 ---`,
              });
            } else {
              parts.push({
                text: `[附件: ${file.name}] - 文件上传失败，且无法提取文本内容。`,
              });
            }
          }
        } else {
          // Image/PDF - use inlineData (reliable for these types)
          parts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.content,
            },
          });
        }
      } else {
        // Text file - add as text
        parts.push({ text: `\n--- 附件: ${file.name} ---\n${file.content}\n--- 附件结束 ---` });
      }
    }

    // Use generateContent with full history for proper context
    const response = await ai.models.generateContent({
      model: this.settings.model,
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: 'model', parts: [{ text: '我理解了，我将作为 Ontology 架构师，遵循方法论原则来帮助你设计系统。' }] },
        ...history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts },
      ],
    });

    return response.text || '';
  }

  private async callOpenAIMultimodal(
    history: ChatMessage[],
    nextMessage: string,
    files: FileAttachment[]
  ): Promise<string> {
    const baseUrl = this.getBaseUrl();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.requireApiKey()}`,
    };

    if (this.settings.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'Ontology Architect';
    }

    const isOpenRouter = this.settings.provider === 'openrouter';
    const isOpenAI = this.settings.provider === 'openai';
    // Only direct OpenAI has reliable native Office file support.
    // OpenRouter proxies to various models — Gemini rejects docx MIME, others may too.
    const supportsNativeFile = isOpenRouter || isOpenAI;

    // Build content array for the user message
    const content: any[] = [];

    // Add text message
    if (nextMessage) {
      content.push({ type: 'text', text: nextMessage });
    }

    // Add files
    for (const file of files) {
      if (file.isBase64) {
        const isOffice = this.isOfficeMimeType(file.mimeType);
        const isPdf = file.mimeType === 'application/pdf';

        if (file.mimeType.startsWith('image/')) {
          // Image - all providers support image_url
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${file.mimeType};base64,${file.content}`,
            },
          });
        } else if (isOffice && file.extractedText) {
          // Office files: always prefer client-side extracted text.
          // OpenRouter model support varies (Gemini rejects docx MIME),
          // and even for OpenAI the text content is functionally equivalent.
          content.push({
            type: 'text',
            text: `\n--- 附件: ${file.name} (文本提取) ---\n${file.extractedText}\n--- 附件结束 ---`,
          });
        } else if (isOffice && isOpenAI) {
          // Direct OpenAI without extractedText: try native file upload
          content.push({
            type: 'file',
            file: {
              filename: file.name,
              file_data: `data:${file.mimeType};base64,${file.content}`,
            },
          });
        } else if (isPdf && supportsNativeFile) {
          // PDF: well-supported across OpenRouter and OpenAI via type:'file'
          content.push({
            type: 'file',
            file: {
              filename: file.name,
              file_data: `data:${file.mimeType};base64,${file.content}`,
            },
          });
        } else if (file.extractedText) {
          // Fallback: use extracted text for any file with extraction available
          content.push({
            type: 'text',
            text: `\n--- 附件: ${file.name} (文本提取) ---\n${file.extractedText}\n--- 附件结束 ---`,
          });
        } else {
          // No native support and no extracted text available
          content.push({
            type: 'text',
            text: `[附件: ${file.name}] - 当前模型无法直接读取此文件格式，且文本提取不可用。`,
          });
        }
      } else {
        // Text file - add as text
        content.push({
          type: 'text',
          text: `\n--- 附件: ${file.name} ---\n${file.content}\n--- 附件结束 ---`,
        });
      }
    }

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content },
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.settings.model,
        messages,
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`多模态API调用失败: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callZhipuMultimodal(
    history: ChatMessage[],
    nextMessage: string,
    files: FileAttachment[]
  ): Promise<string> {
    // Zhipu GLM-4V supports images
    const content: any[] = [];

    if (nextMessage) {
      content.push({ type: 'text', text: nextMessage });
    }

    for (const file of files) {
      if (file.isBase64 && file.mimeType.startsWith('image/')) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:${file.mimeType};base64,${file.content}`,
          },
        });
      } else if (file.isBase64 && file.extractedText) {
        // Office/PDF files with extracted text - use text fallback
        content.push({
          type: 'text',
          text: `\n--- 附件: ${file.name} (文本提取) ---\n${file.extractedText}\n--- 附件结束 ---`,
        });
      } else if (file.isBase64) {
        // Binary file without extracted text
        content.push({
          type: 'text',
          text: `[附件: ${file.name}] - 当前模型无法直接读取此文件格式。`,
        });
      } else {
        content.push({
          type: 'text',
          text: `\n--- 附件: ${file.name} ---\n${file.content}\n--- 附件结束 ---`,
        });
      }
    }

    const response = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.requireApiKey()}`,
      },
      body: JSON.stringify({
        model: this.settings.model,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          ...history.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`智谱多模态API调用失败: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async designOntology(chatHistory: ChatMessage[]): Promise<string> {
    const historyText = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = DESIGN_PROMPT_TEMPLATE(historyText);

    try {
      switch (this.settings.provider) {
        case 'gemini': {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });
          const response = await ai.models.generateContent({
            model: this.settings.model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });
          return this.extractJSON(response.text || '{}');
        }
        case 'zhipu':
        case 'openrouter':
        case 'openai':
        case 'custom':
        default: {
          const baseUrl = this.getBaseUrl();
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.requireApiKey()}`,
          };
          if (this.settings.provider === 'openrouter') {
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'Ontology Architect';
          }

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: this.settings.model,
              messages: [
                { role: 'system', content: '你是一个JSON生成器，只输出有效的JSON，不要输出其他内容。' },
                { role: 'user', content: prompt },
              ],
              temperature: 0.3,
              max_tokens: 8192,
              response_format: { type: 'json_object' },
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`API调用失败: ${response.status} - ${error}`);
          }

          const data = await response.json();
          return this.extractJSON(data.choices[0]?.message?.content || '{}');
        }
      }
    } catch (error) {
      console.error('Ontology设计生成失败:', error);
      throw error;
    }
  }

  // 测试连接
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.chat([], '你好，请用一句话介绍自己。');
      return { success: true, message: result.slice(0, 100) + '...' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      };
    }
  }

  // 获取可用模型列表
  async fetchAvailableModels(signal?: AbortSignal): Promise<EnrichedModelInfo[]> {
    try {
      switch (this.settings.provider) {
        case 'gemini':
          return await this.fetchGeminiModels();
        case 'openrouter':
          return await this.fetchOpenRouterModels(signal);
        case 'openai':
          return await this.fetchOpenAIModels(signal);
        case 'zhipu':
          return await this.fetchZhipuModels(signal);
        case 'moonshot':
          return await this.fetchMoonshotModels(signal);
        case 'custom':
          return await this.fetchCustomModels(signal);
        default:
          return [];
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  }

  private async fetchGeminiModels(): Promise<EnrichedModelInfo[]> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });

    // Use the pager to get all models
    const models: EnrichedModelInfo[] = [];
    const pager = await ai.models.list({ config: { pageSize: 100 } });

    for await (const model of pager) {
      // Filter to only include generative models that support generateContent
      if (model.name && model.supportedActions?.includes('generateContent')) {
        const modelId = model.name.replace('models/', '');
        const idLower = modelId.toLowerCase();
        const supportsFile = idLower.includes('gemini-1.5') || idLower.includes('gemini-2');
        models.push({
          id: modelId,
          name: model.displayName || modelId,
          description: model.description?.slice(0, 50) || undefined,
          source: 'api',
          inputModalities: supportsFile ? ['text', 'image', 'file'] : ['text', 'image'],
          contextLength: Number((model as any).inputTokenLimit) || undefined,
          supportsTools: true,
          supportsStructuredOutput: true,
        });
      }
    }

    // Sort by name, prioritize gemini-2.0 and gemini-1.5
    return models.sort((a, b) => {
      const aScore = a.id.includes('gemini-2') ? 0 : a.id.includes('gemini-1.5') ? 1 : 2;
      const bScore = b.id.includes('gemini-2') ? 0 : b.id.includes('gemini-1.5') ? 1 : 2;
      if (aScore !== bScore) return aScore - bScore;
      return a.name.localeCompare(b.name);
    });
  }

  private async fetchOpenRouterModels(signal?: AbortSignal): Promise<EnrichedModelInfo[]> {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${this.requireApiKey()}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Ontology Architect',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];

    // Filter and format models, prioritize popular ones
    return models
      .filter((m: any) => m.id && !m.id.includes(':free'))
      .map((m: any) => {
        const inputModalities = Array.isArray(m.architecture?.input_modalities)
          ? m.architecture.input_modalities
          : undefined;
        const supported = Array.isArray(m.supported_parameters) ? m.supported_parameters : [];
        const promptPrice = Number(m.pricing?.prompt);
        const completionPrice = Number(m.pricing?.completion);

        return {
          id: m.id,
          name: m.name || m.id,
          description: Number.isFinite(promptPrice) ? `$${(promptPrice * 1000000).toFixed(2)}/M tokens` : undefined,
          source: 'api' as const,
          inputModalities,
          contextLength: Number(m.context_length) || undefined,
          supportsTools: supported.includes('tools'),
          supportsStructuredOutput: supported.includes('response_format'),
          promptPrice: Number.isFinite(promptPrice) ? promptPrice : undefined,
          completionPrice: Number.isFinite(completionPrice) ? completionPrice : undefined,
        };
      })
      .sort((a: any, b: any) => {
        // Prioritize well-known providers
        const providers = ['anthropic', 'openai', 'google', 'meta-llama', 'deepseek', 'qwen'];
        const aProvider = a.id.split('/')[0];
        const bProvider = b.id.split('/')[0];
        const aIndex = providers.indexOf(aProvider);
        const bIndex = providers.indexOf(bProvider);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  private async fetchOpenAIModels(signal?: AbortSignal): Promise<EnrichedModelInfo[]> {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${this.requireApiKey()}`,
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];

    // Filter to chat models and format
    const chatModels = models
      .filter((m: any) => {
        const id = m.id.toLowerCase();
        return (id.includes('gpt') || id.includes('o1') || id.includes('o3')) &&
               !id.includes('instruct') && !id.includes('realtime') && !id.includes('audio');
      })
      .map((m: any) => {
        const id = String(m.id || '').toLowerCase();
        const isVision = id.includes('4o') || id.includes('vision');
        const isLongContext = id.includes('gpt-4.1') || id.includes('128k');
        const isReasoningOnly = id.startsWith('o1');

        return {
          id: m.id,
          name: m.id,
          description: m.owned_by || undefined,
          source: 'api' as const,
          inputModalities: isVision ? ['text', 'image'] : ['text'],
          contextLength: isLongContext ? 1000000 : (id.includes('o3') ? 200000 : undefined),
          supportsTools: !isReasoningOnly,
          supportsStructuredOutput: !isReasoningOnly,
        };
      })
      .sort((a: any, b: any) => {
        // Prioritize newer models
        const priority = ['o3', 'o1', 'gpt-4o', 'gpt-4', 'gpt-3.5'];
        for (const p of priority) {
          const aHas = a.id.includes(p);
          const bHas = b.id.includes(p);
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
        }
        return a.id.localeCompare(b.id);
      });

    return chatModels;
  }

  private async fetchZhipuModels(signal?: AbortSignal): Promise<EnrichedModelInfo[]> {
    // 尝试从 API 获取模型列表（智谱 API 兼容 OpenAI 格式）
    try {
      const response = await fetch(`${this.getBaseUrl()}/models`, {
        headers: {
          'Authorization': `Bearer ${this.requireApiKey()}`,
        },
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.data || [];

        if (models.length > 0) {
          return models
            .filter((m: any) => m.id && (m.id.includes('glm') || m.id.includes('cogview') || m.id.includes('cog')))
            .map((m: any) => {
              const id = String(m.id || '').toLowerCase();
              const hasVision = id.includes('4v') || id.includes('4.6v') || id.includes('cog');
              const longContext = id.includes('long') ? 1000000 : undefined;

              return {
                id: m.id,
                name: m.id,
                description: m.owned_by || undefined,
                source: 'api' as const,
                inputModalities: hasVision ? ['text', 'image'] : ['text'],
                contextLength: longContext,
                supportsTools: true,
                supportsStructuredOutput: true,
              };
            })
            .sort((a: any, b: any) => {
              // 优先显示 glm-4 系列
              const priority = ['glm-4-plus', 'glm-4.', 'glm-4-', 'glm-4v', 'glm-4', 'glm-3'];
              for (const p of priority) {
                const aHas = a.id.includes(p);
                const bHas = b.id.includes(p);
                if (aHas && !bHas) return -1;
                if (!aHas && bHas) return 1;
              }
              return a.id.localeCompare(b.id);
            });
        }
      }
    } catch (error) {
      console.log('智谱 API 获取模型列表失败，使用默认列表:', error);
    }

    // 如果 API 调用失败，返回已知的模型列表（2025年1月最新）
    return [
      // GLM-4.7 系列 - 最新
      { id: 'glm-4.7', name: 'GLM-4.7', description: '最新旗舰，支持思考模式', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash', description: '最新快速版', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      // GLM-4.6 系列
      { id: 'glm-4.6', name: 'GLM-4.6', description: '高性能对话', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4.6-flash', name: 'GLM-4.6 Flash', description: '快速版', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4.6v', name: 'GLM-4.6V', description: '多模态', source: 'hardcoded', inputModalities: ['text', 'image'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4.6v-flash', name: 'GLM-4.6V Flash', description: '多模态快速', source: 'hardcoded', inputModalities: ['text', 'image'], supportsTools: true, supportsStructuredOutput: true },
      // GLM-4.5 系列
      { id: 'glm-4.5', name: 'GLM-4.5', description: '高性能', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4.5v', name: 'GLM-4.5V', description: '多模态', source: 'hardcoded', inputModalities: ['text', 'image'], supportsTools: true, supportsStructuredOutput: true },
      // GLM-4 系列
      { id: 'glm-4-plus', name: 'GLM-4 Plus', description: '高性能', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4-air', name: 'GLM-4 Air', description: '高性价比', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4-airx', name: 'GLM-4 AirX', description: '极速推理', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4-long', name: 'GLM-4 Long', description: '长文本', source: 'hardcoded', inputModalities: ['text'], contextLength: 1000000, supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', description: '免费快速', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4-flashx', name: 'GLM-4 FlashX', description: '超快免费', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4', name: 'GLM-4', description: '通用对话', source: 'hardcoded', inputModalities: ['text'], supportsTools: true, supportsStructuredOutput: true },
      // 多模态旧版
      { id: 'glm-4v-plus', name: 'GLM-4V Plus', description: '多模态', source: 'hardcoded', inputModalities: ['text', 'image'], supportsTools: true, supportsStructuredOutput: true },
      { id: 'glm-4v', name: 'GLM-4V', description: '多模态基础', source: 'hardcoded', inputModalities: ['text', 'image'], supportsTools: true, supportsStructuredOutput: true },
      // 图像生成
      { id: 'cogview-3-plus', name: 'CogView-3 Plus', description: '图像生成', source: 'hardcoded', inputModalities: ['text', 'image'] },
      { id: 'cogview-3', name: 'CogView-3', description: '图像生成', source: 'hardcoded', inputModalities: ['text', 'image'] },
    ];
  }

  private async fetchMoonshotModels(signal?: AbortSignal): Promise<EnrichedModelInfo[]> {
    // Moonshot API 兼容 OpenAI 格式，从 API 获取完整模型列表
    try {
      const response = await fetch(`${this.getBaseUrl()}/models`, {
        headers: {
          'Authorization': `Bearer ${this.requireApiKey()}`,
        },
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.data || [];

        if (models.length > 0) {
          // 直接返回所有模型，添加友好名称映射
          const nameMap: Record<string, { name: string; description: string; priority: number }> = {
            'kimi-k2-0711-preview': { name: 'Kimi K2 Preview (0711)', description: '最新 K2 模型', priority: 0 },
            'kimi-k2-0905-preview': { name: 'Kimi K2 Preview (0905)', description: 'K2 稳定版', priority: 1 },
            'kimi-k2-0905': { name: 'Kimi K2 (0905)', description: 'K2 正式版', priority: 2 },
            'moonshot-v1-auto': { name: 'Moonshot v1 Auto', description: '自动选择上下文', priority: 10 },
            'moonshot-v1-128k': { name: 'Moonshot v1 128K', description: '超长上下文 128K', priority: 11 },
            'moonshot-v1-32k': { name: 'Moonshot v1 32K', description: '长上下文 32K', priority: 12 },
            'moonshot-v1-8k': { name: 'Moonshot v1 8K', description: '标准 8K', priority: 13 },
          };

          const formatted = models.map((m: any) => {
            const id = m.id;
            const mapped = nameMap[id];
            if (mapped) {
              return { id, name: mapped.name, description: mapped.description, priority: mapped.priority, source: 'api' as const, inputModalities: ['text'], supportsTools: true };
            }
            // 未知模型，生成友好名称
            const friendlyName = id
              .replace(/^moonshot-/, 'Moonshot ')
              .replace(/^kimi-/, 'Kimi ')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
            return { id, name: friendlyName, description: m.owned_by || '新模型', priority: 50, source: 'api' as const, inputModalities: ['text'], supportsTools: true };
          });

          // 按优先级排序（新模型优先）
          return formatted.sort((a: any, b: any) => (a.priority || 50) - (b.priority || 50));
        }
      }
    } catch {
      // Fallback to built-in list.
    }

    // 如果 API 调用失败，返回已知的模型列表（2026年最新）
    return [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2 Preview', description: '最新 K2 模型（推荐）', source: 'hardcoded', inputModalities: ['text'], supportsTools: true },
      { id: 'moonshot-v1-auto', name: 'Moonshot v1 Auto', description: '自动选择上下文', source: 'hardcoded', inputModalities: ['text'], contextLength: 128000, supportsTools: true },
      { id: 'moonshot-v1-128k', name: 'Moonshot v1 128K', description: '超长上下文 128K', source: 'hardcoded', inputModalities: ['text'], contextLength: 128000, supportsTools: true },
      { id: 'moonshot-v1-32k', name: 'Moonshot v1 32K', description: '长上下文 32K', source: 'hardcoded', inputModalities: ['text'], contextLength: 32000, supportsTools: true },
      { id: 'moonshot-v1-8k', name: 'Moonshot v1 8K', description: '标准 8K', source: 'hardcoded', inputModalities: ['text'], contextLength: 8000, supportsTools: true },
    ];
  }

  private async fetchCustomModels(signal?: AbortSignal): Promise<EnrichedModelInfo[]> {
    if (!this.settings.customBaseUrl) {
      return [{ id: 'custom', name: '自定义模型', description: '请输入模型ID', source: 'hardcoded' }];
    }

    try {
      const response = await fetch(`${this.settings.customBaseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.requireApiKey()}`,
        },
        signal,
      });

      if (!response.ok) {
        // 如果获取失败，返回手动输入选项
        return [{ id: 'custom', name: '自定义模型', description: '请手动输入模型ID', source: 'hardcoded' }];
      }

      const data = await response.json();
      const models = data.data || data.models || [];

      return models.map((m: any) => ({
        id: m.id || m.name,
        name: m.name || m.id,
        description: m.description || undefined,
        source: 'api',
      }));
    } catch {
      return [{ id: 'custom', name: '自定义模型', description: '请手动输入模型ID', source: 'hardcoded' }];
    }
  }

  // 验证是否有足够信息生成Ontology
  async validateReadiness(chatHistory: ChatMessage[]): Promise<{
    ready: boolean;
    missing: string[];
    identified: { objects: string[]; actions: string[] };
    suggestion: string;
  }> {
    const historyText = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const validationPrompt = `分析以下对话，判断是否有足够信息设计Ontology。

对话历史：
${historyText}

最低要求（必须同时满足）：
1. 至少识别出1个明确的业务对象（Object/名词），如：订单、客户、工单
2. 至少识别出1个明确的业务动作（Action/动词），如：创建、审批、分配
3. 有基本的业务场景描述

请严格按以下JSON格式回复，不要输出其他内容：
{
  "ready": true或false,
  "identified": {
    "objects": ["已识别的对象列表"],
    "actions": ["已识别的动作列表"]
  },
  "missing": ["缺失的信息项，如果ready=true则为空数组"],
  "suggestion": "一句话建议，如果信息不足告诉用户需要补充什么"
}`;

    try {
      let content: string;

      if (this.settings.provider === 'gemini') {
        // Gemini 使用 SDK
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });
        const response = await ai.models.generateContent({
          model: this.settings.model,
          contents: validationPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        content = response.text || '{}';
      } else {
        // OpenAI 兼容 API
        const baseUrl = this.getBaseUrl();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.requireApiKey()}`,
        };
        if (this.settings.provider === 'openrouter') {
          headers['HTTP-Referer'] = window.location.origin;
          headers['X-Title'] = 'Ontology Architect';
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.settings.model,
            messages: [
              { role: 'user', content: validationPrompt },
            ],
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          throw new Error('验证请求失败');
        }

        const data = await response.json();
        content = data.choices[0]?.message?.content || '{}';
      }

      const parsed = JSON.parse(content);
      // 确保返回结构完整
      return {
        ready: parsed.ready ?? false,
        identified: {
          objects: parsed.identified?.objects || [],
          actions: parsed.identified?.actions || [],
        },
        missing: parsed.missing || [],
        suggestion: parsed.suggestion || '',
      };
    } catch (error) {
      console.error('验证失败:', error);
      // Conservative fallback when AI validation fails
      // Don't silently return ready: true - be explicit about fallback
      const userMessages = chatHistory.filter(m => m.role === 'user');
      const totalLength = userMessages.reduce((sum, m) => sum + m.content.length, 0);

      // More conservative thresholds: at least 3 messages with 200+ chars total
      // This ensures meaningful content before allowing generation
      if (userMessages.length >= 3 && totalLength > 200) {
        return {
          ready: true,
          identified: { objects: [], actions: [] },
          missing: ['AI 验证服务暂时不可用'],
          suggestion: '验证服务暂时不可用，根据对话长度判断可以尝试生成，但结果质量可能受影响。建议稍后重试以获得更准确的验证。'
        };
      }
      return {
        ready: false,
        identified: { objects: [], actions: [] },
        missing: ['AI 验证服务暂时不可用', '需要更多对话内容'],
        suggestion: '请描述更多业务细节，包括涉及的业务对象、流程和操作。至少需要3轮对话和200字以上的内容。'
      };
    }
  }

  // 分析对话并推荐相关案例
  async recommendCases(chatHistory: ChatMessage[]): Promise<{
    industry: string | null;
    keywords: string[];
    recommendedCaseIds: string[];
    confidence: number;
  }> {
    if (chatHistory.length === 0) {
      return { industry: null, keywords: [], recommendedCaseIds: [], confidence: 0 };
    }

    const historyText = chatHistory.map(m => `${m.role}: ${m.content}`).join('\n');

    const analysisPrompt = `分析以下对话，识别用户的业务场景，用于推荐相关案例。

对话历史：
${historyText}

请分析并返回JSON：
{
  "industry": "识别的行业（manufacturing/retail/logistics/healthcare/finance/energy/agriculture 或 null）",
  "keywords": ["关键业务词汇，如：生产计划、库存管理、配送调度、订单、工单等"],
  "scenarioType": "场景类型（production/inventory/delivery/quality/maintenance/supply-chain/customer/workforce/analytics）",
  "confidence": 0.0-1.0
}

行业判断依据：
- manufacturing: 生产、制造、工厂、产线、设备、工单、BOM、MES
- retail: 零售、门店、库存、补货、商品、SKU、POS、促销
- logistics: 物流、配送、路线、车辆、司机、运输、仓储、快递
- healthcare: 医疗、医院、患者、诊断、处方、病历
- finance: 金融、银行、贷款、风控、交易、支付
- energy: 能源、电力、电网、发电、新能源
- agriculture: 农业、种植、养殖、农产品

如果无法确定行业，industry设为null。`;

    try {
      let content: string;

      if (this.settings.provider === 'gemini') {
        // Gemini 使用 SDK
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });
        const response = await ai.models.generateContent({
          model: this.settings.model,
          contents: analysisPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        content = response.text || '{}';
      } else {
        // OpenAI 兼容 API
        const baseUrl = this.getBaseUrl();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.requireApiKey()}`,
        };
        if (this.settings.provider === 'openrouter') {
          headers['HTTP-Referer'] = window.location.origin;
          headers['X-Title'] = 'Ontology Architect';
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.settings.model,
            messages: [
              { role: 'user', content: analysisPrompt },
            ],
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          throw new Error('案例推荐分析失败');
        }

        const data = await response.json();
        content = data.choices[0]?.message?.content || '{}';
      }

      const analysis = JSON.parse(content);

      // 基于分析结果推荐案例
      const recommendedCaseIds: string[] = [];

      // 按行业推荐
      if (analysis.industry === 'manufacturing') {
        recommendedCaseIds.push('manufacturing-production');
      } else if (analysis.industry === 'retail') {
        recommendedCaseIds.push('retail-inventory');
      } else if (analysis.industry === 'logistics') {
        recommendedCaseIds.push('logistics-delivery');
      }

      // 按关键词补充推荐
      const keywords = analysis.keywords || [];
      const keywordLower = keywords.map((k: string) => k.toLowerCase());

      if (keywordLower.some((k: string) => k.includes('生产') || k.includes('制造') || k.includes('production') || k.includes('工单'))) {
        if (!recommendedCaseIds.includes('manufacturing-production')) {
          recommendedCaseIds.push('manufacturing-production');
        }
      }
      if (keywordLower.some((k: string) => k.includes('库存') || k.includes('补货') || k.includes('inventory') || k.includes('商品'))) {
        if (!recommendedCaseIds.includes('retail-inventory')) {
          recommendedCaseIds.push('retail-inventory');
        }
      }
      if (keywordLower.some((k: string) => k.includes('配送') || k.includes('物流') || k.includes('delivery') || k.includes('路线'))) {
        if (!recommendedCaseIds.includes('logistics-delivery')) {
          recommendedCaseIds.push('logistics-delivery');
        }
      }

      return {
        industry: analysis.industry,
        keywords: analysis.keywords || [],
        recommendedCaseIds,
        confidence: analysis.confidence || 0
      };
    } catch (error) {
      console.error('案例推荐失败:', error);
      return { industry: null, keywords: [], recommendedCaseIds: [], confidence: 0 };
    }
  }

  // 从文本中提取 Noun（对象）和 Verb（动作）
  async extractNounsVerbs(text: string): Promise<{
    nouns: Array<{ name: string; description: string; confidence: number }>;
    verbs: Array<{ name: string; targetObject?: string; description: string; confidence: number }>;
  }> {
    const extractionPrompt = `从以下业务描述中提取核心的业务对象（名词/Nouns）和业务动作（动词/Verbs）。

业务描述：
${text}

提取规则：
1. 名词（Objects）：业务实体，如订单、客户、产品、工单、库存等
   - 忽略泛指词汇（如"系统"、"数据"、"信息"等）
   - 保留具体业务实体
2. 动词（Actions）：对对象执行的操作，如创建、审批、发货、分配等
   - 如果能判断动作的目标对象，请标注
   - 忽略描述性动词（如"是"、"有"、"包含"等）
3. confidence: 0-1，表示识别的置信度

请严格按以下JSON格式回复：
{
  "nouns": [
    {"name": "对象名称", "description": "简短描述", "confidence": 0.9}
  ],
  "verbs": [
    {"name": "动作名称", "targetObject": "目标对象（可选）", "description": "简短描述", "confidence": 0.85}
  ]
}`;

    try {
      let content: string;

      if (this.settings.provider === 'gemini') {
        // Gemini 使用 SDK
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });
        const response = await ai.models.generateContent({
          model: this.settings.model,
          contents: extractionPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        content = response.text || '{}';
      } else {
        // OpenAI 兼容 API
        const baseUrl = this.getBaseUrl();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.requireApiKey()}`,
        };
        if (this.settings.provider === 'openrouter') {
          headers['HTTP-Referer'] = window.location.origin;
          headers['X-Title'] = 'Ontology Architect';
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.settings.model,
            messages: [
              { role: 'user', content: extractionPrompt },
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          throw new Error('提取请求失败');
        }

        const data = await response.json();
        content = data.choices[0]?.message?.content || '{}';
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Noun/Verb提取失败:', error);
      return { nouns: [], verbs: [] };
    }
  }

  // 从文本中提取完整的 Ontology 三要素（Objects, Links, Actions）
  async extractOntologyElements(text: string): Promise<{
    objects: Array<{ name: string; description: string; confidence: number }>;
    links: Array<{ source: string; target: string; label: string; confidence: number }>;
    actions: Array<{ name: string; targetObject?: string; description: string; confidence: number }>;
  }> {
    const extractionPrompt = `从以下业务描述中提取 Ontology 的三个核心要素：Objects（对象）、Links（关系）、Actions（动作）。

业务描述：
${text}

提取规则：

1. Objects（业务对象/名词）：
   - 识别具体的业务实体，如：订单、客户、产品、工单、库存、设备等
   - 忽略泛指词汇（如"系统"、"数据"、"信息"、"流程"等）
   - 每个对象需要简短描述

2. Links（对象间关系）：
   - 识别对象之间的关联关系
   - 常见关系类型：包含(contains)、关联(references)、生成(generates)、属于(belongs_to)、依赖(depends_on)
   - 格式：source对象 → target对象，并标注关系类型
   - 示例："订单包含产品" → { source: "订单", target: "产品", label: "包含" }

3. Actions（业务动作/动词）：
   - 识别对对象执行的操作，如：创建、审批、发货、分配、取消等
   - 标注动作的目标对象（如果能判断）
   - 忽略描述性动词（如"是"、"有"、"进行"等）

4. confidence: 0-1，表示识别的置信度

请严格按以下JSON格式回复：
{
  "objects": [
    {"name": "对象名称", "description": "简短描述", "confidence": 0.9}
  ],
  "links": [
    {"source": "源对象名", "target": "目标对象名", "label": "关系标签", "confidence": 0.8}
  ],
  "actions": [
    {"name": "动作名称", "targetObject": "目标对象（可选）", "description": "简短描述", "confidence": 0.85}
  ]
}`;

    try {
      let content: string;

      if (this.settings.provider === 'gemini') {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.requireApiKey() });
        const response = await ai.models.generateContent({
          model: this.settings.model,
          contents: extractionPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        content = response.text || '{}';
      } else {
        const baseUrl = this.getBaseUrl();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.requireApiKey()}`,
        };
        if (this.settings.provider === 'openrouter') {
          headers['HTTP-Referer'] = window.location.origin;
          headers['X-Title'] = 'Ontology Architect';
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.settings.model,
            messages: [
              { role: 'user', content: extractionPrompt },
            ],
            temperature: 0.1,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          throw new Error('Ontology 要素提取失败');
        }

        const data = await response.json();
        content = data.choices[0]?.message?.content || '{}';
      }

      const result = JSON.parse(content);
      return {
        objects: result.objects || [],
        links: result.links || [],
        actions: result.actions || result.verbs || []
      };
    } catch (error) {
      console.error('Ontology要素提取失败:', error);
      return { objects: [], links: [], actions: [] };
    }
  }
}

// 默认设置
export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openrouter',
  apiKey: '',
  model: 'anthropic/claude-3.5-sonnet',
};

// 从本地文件加载配置（异步）
export async function loadLocalConfig(): Promise<AISettings | null> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      if (!config) return null;
      // Check apiKeys map first (new multi-provider format), then legacy apiKey
      const hasApiKeys = config.apiKeys && Object.values(config.apiKeys).some((v: unknown) => typeof v === 'string' && v.length > 0);
      const hasLegacyKey = !!config.apiKey;
      if (hasApiKeys || hasLegacyKey) {
        console.log('已从本地文件加载 API 配置');
        return config;
      }
    }
  } catch (e) {
    // 开发服务器可能未启用配置 API，忽略错误
    console.log('本地配置文件不可用，使用内存/sessionStorage');
  }
  return null;
}

// 保存配置到本地文件（异步）
export async function saveLocalConfig(settings: AISettings): Promise<boolean> {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      console.log('API 配置已保存到本地文件 api-config.local.json');
      return true;
    }
  } catch (e) {
    console.log('无法保存到本地文件:', e);
  }
  return false;
}

// 从sessionStorage加载设置（同步版本，用于初始化）
export function loadAISettings(): AISettings {
  try {
    // 优先从sessionStorage读取（包含API密钥）
    const sessionSaved = sessionStorage.getItem('ontology-ai-settings');
    if (sessionSaved) {
      return JSON.parse(sessionSaved);
    }

    // 向后兼容：如果sessionStorage没有，尝试从localStorage迁移（一次性）
    const localSaved = localStorage.getItem('ontology-ai-settings');
    if (localSaved) {
      const settings = JSON.parse(localSaved);
      // 迁移到sessionStorage
      sessionStorage.setItem('ontology-ai-settings', localSaved);
      // 从localStorage删除敏感数据（保留provider和model配置）
      const safeSettings = { ...settings, apiKey: '' };
      localStorage.setItem('ontology-ai-settings', JSON.stringify(safeSettings));
      console.log('API设置已迁移到sessionStorage');
      return settings;
    }
  } catch (e) {
    console.error('加载设置失败:', e);
  }
  return DEFAULT_AI_SETTINGS;
}

// 异步加载设置（优先从本地文件，然后 sessionStorage）
export async function loadAISettingsAsync(): Promise<AISettings> {
  // 1. 尝试从本地文件加载
  const localConfig = await loadLocalConfig();
  if (localConfig) {
    // 同步到 sessionStorage
    sessionStorage.setItem('ontology-ai-settings', JSON.stringify(localConfig));
    return localConfig;
  }

  // 2. 降级到 sessionStorage
  return loadAISettings();
}

// 保存设置（同时保存到本地文件和 sessionStorage）
export async function saveAISettings(settings: AISettings): Promise<void> {
  try {
    // 完整设置（包含API密钥）保存到sessionStorage
    sessionStorage.setItem('ontology-ai-settings', JSON.stringify(settings));

    // 非敏感设置保存到localStorage（便于下次打开时恢复provider/model选择）
    const safeSettings = {
      provider: settings.provider,
      model: settings.model,
      customBaseUrl: settings.customBaseUrl,
      apiKey: '', // 不保存API密钥到localStorage
    };
    localStorage.setItem('ontology-ai-settings', JSON.stringify(safeSettings));

    // 尝试保存到本地文件（API 密钥会持久化）
    await saveLocalConfig(settings);
  } catch (e) {
    console.error('保存设置失败:', e);
  }
}

// 清除所有敏感设置（用于退出/注销）
export function clearAISettings(): void {
  try {
    sessionStorage.removeItem('ontology-ai-settings');
    // localStorage保留非敏感配置
  } catch (e) {
    console.error('清除设置失败:', e);
  }
}

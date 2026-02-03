/**
 * Archetype Generator Service
 * 原型生成服务
 *
 * 提供智能行业原型生成能力：
 * 1. 搜索网络参考资料
 * 2. 使用 AI 生成完整原型
 * 3. 验证生成的原型结构
 */

import { Archetype, ArchetypeOrigin } from '../types/archetype';
import { AIService } from './aiService';
import { AISettings } from '../types';

/**
 * 生成进度步骤
 */
export type GenerationStep =
  | 'searching'    // 搜索网络参考
  | 'fetching'     // 获取参考内容
  | 'generating'   // AI 生成原型
  | 'validating'   // 验证结构
  | 'completed'    // 完成
  | 'error';       // 出错

/**
 * 生成进度回调参数
 */
export interface GenerationProgress {
  step: GenerationStep;
  progress: number;  // 0-100
  message: string;
  details?: string;
}

/**
 * 生成结果
 */
export interface GenerationResult {
  success: boolean;
  archetype?: Archetype;
  origin?: ArchetypeOrigin;
  error?: string;
  warnings?: string[];
}

/**
 * 网络搜索结果
 */
interface WebSearchResult {
  found: boolean;
  sources: {
    url: string;
    title: string;
    snippet: string;
  }[];
  searchContext?: string;  // LLM 搜索返回的完整上下文，用于增强生成
}

/**
 * Archetype 生成 Prompt 模板
 */
const ARCHETYPE_GENERATION_PROMPT = (
  industry: string,
  description: string,
  language: 'en' | 'cn',
  searchContext?: string
) => `
你是行业本体架构专家。为"${industry}"行业生成完整的 Archetype（行业解决方案原型）。

${description ? `用户补充描述：${description}` : ''}
${searchContext ? `
═══════════════════════════════════════════════════════════════════
                    参考资料（来自网络搜索）
═══════════════════════════════════════════════════════════════════
${searchContext}
═══════════════════════════════════════════════════════════════════
请基于上述参考资料，结合行业最佳实践生成原型。
` : ''}

═══════════════════════════════════════════════════════════════════
                    生成要求
═══════════════════════════════════════════════════════════════════

1. 【Decision-First 原则】
   - 每个对象和动作都必须支持具体的业务决策
   - 问自己：用户看到这个信息后会做什么决策？

2. 【核心业务对象 Objects】(5-8个)
   - 识别该行业的核心业务实体
   - 每个对象包含完整的属性定义
   - 包含 AI 派生属性（如预测值、评分等）

3. 【业务动作 Actions】(每个对象 3-5 个)
   - 每个动作必须包含三层定义：
     * businessLayer: 业务描述、执行角色、触发条件
     * logicLayer: 前置条件、参数、后置状态、副作用
     * implementationLayer: API 端点、Agent 工具规范
   - 包含 governance 治理属性

4. 【数据连接器 Connectors】(2-4个)
   - 定义与典型外部系统的集成
   - 包括 ERP、IoT、数据库等

5. 【业务工作流 Workflows】(2-3个)
   - 定义端到端的业务流程
   - 包含触发条件和步骤定义

6. 【AI 能力】
   - 识别 AI 增强点
   - 包括解析、预测、优化、生成等能力

7. 【双语支持】
   - 所有用户可见字段提供中英文描述

═══════════════════════════════════════════════════════════════════

请严格按以下 JSON 格式输出完整的 Archetype 结构：

{
  "metadata": {
    "id": "industry-specific-id",
    "name": "Archetype Name",
    "description": {
      "en": "English description",
      "cn": "中文描述"
    },
    "industry": "${industry.toLowerCase().replace(/\s+/g, '-')}",
    "domain": "specific-domain",
    "version": "1.0.0"
  },
  "ontology": {
    "objects": [
      {
        "id": "object-id",
        "name": "Object Name",
        "description": "Description",
        "properties": [
          {"name": "propertyName", "type": "string", "description": "Description", "isAIDerived": false}
        ],
        "actions": [
          {
            "name": "Action Name",
            "type": "traditional|generative",
            "description": "Description",
            "businessLayer": {
              "description": "业务描述",
              "targetObject": "object-id",
              "executorRole": "执行角色",
              "triggerCondition": "触发条件"
            },
            "logicLayer": {
              "preconditions": ["前置条件"],
              "parameters": [
                {"name": "param", "type": "string", "required": true, "description": "参数说明"}
              ],
              "postconditions": ["后置状态"],
              "sideEffects": ["副作用"]
            },
            "implementationLayer": {
              "apiEndpoint": "/api/v1/resource/{id}/action",
              "apiMethod": "POST",
              "agentToolSpec": {
                "name": "tool_name",
                "description": "工具描述",
                "parameters": {"type": "object", "properties": {}, "required": []}
              }
            },
            "governance": {
              "permissionTier": 1,
              "requiresHumanApproval": false,
              "auditLog": true,
              "riskLevel": "low"
            }
          }
        ],
        "aiFeatures": [
          {"type": "Smart Property", "description": "AI feature description"}
        ]
      }
    ],
    "links": [
      {"id": "link-id", "source": "object-id-1", "target": "object-id-2", "label": "关系标签"}
    ]
  },
  "connectors": [
    {
      "id": "connector-id",
      "name": "Connector Name",
      "description": {"en": "Description", "cn": "描述"},
      "sourceType": "erp|iot|database|api",
      "sourceSystem": "System Name",
      "connectionTemplate": {
        "requiredFields": [{"name": "field", "type": "string", "description": "desc"}]
      },
      "sync": {
        "direction": "inbound|outbound|bidirectional",
        "frequency": "realtime|hourly|daily"
      },
      "mappedObjects": [{"objectId": "object-id", "sourceEntity": "source_table", "fieldMappings": []}]
    }
  ],
  "workflows": [
    {
      "id": "workflow-id",
      "name": "Workflow Name",
      "description": {"en": "Description", "cn": "描述"},
      "trigger": {"type": "manual|event|scheduled", "config": {}},
      "steps": [
        {
          "id": "step-1",
          "name": "Step Name",
          "description": {"en": "Desc", "cn": "描述"},
          "type": "action|condition|notification",
          "actionRef": "action-name",
          "nextSteps": ["step-2"]
        }
      ],
      "entryStep": "step-1",
      "roles": ["Role1", "Role2"]
    }
  ],
  "rules": [],
  "aiCapabilities": [
    {
      "id": "ai-cap-id",
      "name": "AI Capability Name",
      "type": "parsing|prediction|optimization|generation",
      "description": {"en": "Desc", "cn": "描述"},
      "enabledActions": ["action-name"]
    }
  ],
  "dashboards": [],
  "views": [],
  "deployment": {
    "requirements": {
      "platform": ["DataPlatform"],
      "resources": {"cpu": "2 cores", "memory": "4GB"}
    },
    "environmentVariables": []
  },
  "documentation": {
    "quickStart": {
      "en": "Quick start guide...",
      "cn": "快速开始指南..."
    }
  }
}
`;

/**
 * 验证 Archetype 结构的完整性
 */
function validateArchetypeStructure(archetype: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必需字段
  if (!archetype.metadata?.id) errors.push('Missing metadata.id');
  if (!archetype.metadata?.name) errors.push('Missing metadata.name');
  if (!archetype.metadata?.industry) errors.push('Missing metadata.industry');

  if (!archetype.ontology?.objects || !Array.isArray(archetype.ontology.objects)) {
    errors.push('Missing or invalid ontology.objects');
  } else if (archetype.ontology.objects.length === 0) {
    errors.push('ontology.objects is empty');
  } else {
    // 验证每个对象
    archetype.ontology.objects.forEach((obj: any, index: number) => {
      if (!obj.id) errors.push(`Object[${index}] missing id`);
      if (!obj.name) errors.push(`Object[${index}] missing name`);
      if (!obj.properties || obj.properties.length === 0) {
        warnings.push(`Object[${index}] (${obj.name || obj.id}) has no properties`);
      }
      if (!obj.actions || obj.actions.length === 0) {
        warnings.push(`Object[${index}] (${obj.name || obj.id}) has no actions`);
      }
    });
  }

  if (!archetype.connectors || !Array.isArray(archetype.connectors)) {
    warnings.push('Missing connectors array');
    archetype.connectors = [];
  }

  if (!archetype.workflows || !Array.isArray(archetype.workflows)) {
    warnings.push('Missing workflows array');
    archetype.workflows = [];
  }

  if (!archetype.rules || !Array.isArray(archetype.rules)) {
    archetype.rules = [];
  }

  if (!archetype.aiCapabilities || !Array.isArray(archetype.aiCapabilities)) {
    warnings.push('Missing aiCapabilities array');
    archetype.aiCapabilities = [];
  }

  if (!archetype.dashboards || !Array.isArray(archetype.dashboards)) {
    archetype.dashboards = [];
  }

  if (!archetype.views || !Array.isArray(archetype.views)) {
    archetype.views = [];
  }

  if (!archetype.deployment) {
    archetype.deployment = {
      requirements: { platform: ['DataPlatform'], resources: {} },
      environmentVariables: []
    };
  }

  if (!archetype.documentation) {
    archetype.documentation = {
      quickStart: { en: 'See documentation', cn: '请参阅文档' }
    };
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Archetype 生成服务类
 */
export class ArchetypeGeneratorService {
  private aiService: AIService;
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
    this.aiService = new AIService(settings);
  }

  /**
   * 更新 AI 设置
   */
  updateSettings(settings: AISettings): void {
    this.settings = settings;
    this.aiService.updateSettings(settings);
  }

  /**
   * 搜索网络参考资料
   * 利用 LLM 自带的搜索能力（Perplexity、Kimi 联网等）
   */
  async searchWebForReferences(
    industry: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<WebSearchResult> {
    onProgress?.({
      step: 'searching',
      progress: 10,
      message: '正在搜索网络参考资料...',
      details: `搜索关键词: ${industry} 行业数据模型、业务流程`
    });

    // 检查是否支持搜索功能
    const searchCapable = this.hasSearchCapability();

    if (!searchCapable) {
      // 不支持搜索的 LLM，跳过搜索步骤
      onProgress?.({
        step: 'searching',
        progress: 30,
        message: '跳过搜索',
        details: `当前模型 (${this.settings.model}) 不支持联网搜索，将直接使用 AI 生成`
      });

      return { found: false, sources: [] };
    }

    try {
      onProgress?.({
        step: 'searching',
        progress: 20,
        message: '使用 AI 联网搜索行业资料...',
        details: `模型: ${this.settings.model}`
      });

      const searchResult = await this.performAISearch(industry);

      onProgress?.({
        step: 'fetching',
        progress: 35,
        message: searchResult.found ? '找到参考资料' : '未找到直接参考',
        details: searchResult.found
          ? `找到 ${searchResult.sources.length} 个相关来源`
          : '将基于 AI 知识生成原型'
      });

      return searchResult;
    } catch (error) {
      console.error('搜索失败:', error);
      onProgress?.({
        step: 'searching',
        progress: 30,
        message: '搜索失败，继续生成',
        details: error instanceof Error ? error.message : '网络搜索出错'
      });

      return { found: false, sources: [] };
    }
  }

  /**
   * 检查当前 LLM 是否支持搜索能力
   */
  private hasSearchCapability(): boolean {
    const provider = this.settings.provider;
    const model = this.settings.model.toLowerCase();

    // Perplexity 模型（通过 OpenRouter）
    if (provider === 'openrouter' && model.includes('perplexity')) {
      return true;
    }

    // Kimi 支持联网搜索
    if (provider === 'moonshot') {
      return true;
    }

    // 其他模型暂不支持
    return false;
  }

  /**
   * 使用 LLM 的搜索能力获取行业参考资料
   */
  private async performAISearch(industry: string): Promise<WebSearchResult> {
    const provider = this.settings.provider;

    if (provider === 'moonshot') {
      return await this.searchWithKimi(industry);
    }

    if (provider === 'openrouter' && this.settings.model.toLowerCase().includes('perplexity')) {
      return await this.searchWithPerplexity(industry);
    }

    return { found: false, sources: [] };
  }

  /**
   * 使用 Kimi 的联网搜索能力
   */
  private async searchWithKimi(industry: string): Promise<WebSearchResult> {
    const searchPrompt = `请搜索"${industry}"行业的相关信息，包括：
1. 该行业的主要业务对象（如订单、库存、设备等核心实体）
2. 典型的业务流程和工作流
3. 常见的数据系统集成（ERP、MES、IoT等）
4. 行业最佳实践

请简洁列出搜索到的关键信息，格式如下：
【业务对象】...
【业务流程】...
【系统集成】...
【最佳实践】...`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`,
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            { role: 'system', content: '你是一个行业研究助手，请利用联网搜索能力查找相关信息。' },
            { role: 'user', content: searchPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          // Kimi 联网搜索工具
          tools: [{
            type: 'web_search',
            function: {
              description: '搜索互联网获取实时信息'
            }
          }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Kimi 搜索失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // 如果有内容，说明搜索成功
      if (content && content.length > 100) {
        return {
          found: true,
          sources: [{
            url: 'kimi-web-search',
            title: `${industry} 行业研究`,
            snippet: content.substring(0, 500),
          }],
          searchContext: content,  // 存储完整搜索结果用于生成
        };
      }

      return { found: false, sources: [] };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 使用 Perplexity 的搜索能力（通过 OpenRouter）
   */
  private async searchWithPerplexity(industry: string): Promise<WebSearchResult> {
    const searchPrompt = `Search for information about the "${industry}" industry, including:
1. Core business objects (entities like orders, inventory, equipment)
2. Typical business processes and workflows
3. Common system integrations (ERP, MES, IoT)
4. Industry best practices

Please provide a structured summary in Chinese.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://ontology-assistant.app',
          'X-Title': 'Ontology Architect',
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            { role: 'user', content: searchPrompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Perplexity 搜索失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      if (content && content.length > 100) {
        return {
          found: true,
          sources: [{
            url: 'perplexity-search',
            title: `${industry} Industry Research`,
            snippet: content.substring(0, 500),
          }],
          searchContext: content,
        };
      }

      return { found: false, sources: [] };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 使用 AI 生成完整原型
   */
  async generateArchetype(
    industryName: string,
    description: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    try {
      // Step 1: 搜索网络参考
      const searchResult = await this.searchWebForReferences(industryName, onProgress);

      // Step 2: AI 生成
      onProgress?.({
        step: 'generating',
        progress: 40,
        message: '正在使用 AI 生成原型...',
        details: searchResult.found
          ? `使用模型: ${this.settings.model}（含搜索参考）`
          : `使用模型: ${this.settings.model}`
      });

      // 构建 prompt，如果有搜索结果则包含参考资料
      const prompt = ARCHETYPE_GENERATION_PROMPT(
        industryName,
        description,
        'cn',
        searchResult.searchContext
      );

      // 调用 AI 服务生成 JSON
      let jsonContent: string;
      try {
        jsonContent = await this.callAIForJSON(prompt);
      } catch (aiError) {
        throw new Error(`AI 生成失败: ${aiError instanceof Error ? aiError.message : String(aiError)}`);
      }

      onProgress?.({
        step: 'generating',
        progress: 70,
        message: 'AI 生成完成，正在解析...'
      });

      // Step 3: 解析 JSON
      let archetype: Archetype;
      try {
        archetype = JSON.parse(jsonContent);
      } catch (parseError) {
        // 记录原始内容用于调试
        console.error('JSON 解析失败，原始内容:', jsonContent.substring(0, 500));
        throw new Error(`JSON 解析失败: ${parseError instanceof Error ? parseError.message : '格式错误'}。请重试或使用支持 JSON 模式的模型（如 OpenRouter）。`);
      }

      // Step 4: 验证结构
      onProgress?.({
        step: 'validating',
        progress: 85,
        message: '正在验证原型结构...'
      });

      const validation = validateArchetypeStructure(archetype);

      if (!validation.valid) {
        throw new Error(`原型结构验证失败: ${validation.errors.join('; ')}`);
      }

      // 补充缺失的可选字段
      this.fillMissingFields(archetype, industryName);

      // 构建来源信息
      const origin: ArchetypeOrigin = {
        type: searchResult.found ? 'reference' : 'ai-generated',
        generationDate: new Date().toISOString(),
        modelUsed: this.settings.model,
        confidence: 0.85,
        promptVersion: '1.0',
        userInput: {
          industryName,
          description: description || undefined
        }
      };

      if (searchResult.found && searchResult.sources.length > 0) {
        origin.sourceUrl = searchResult.sources[0].url;
        origin.sourceName = searchResult.sources[0].title;
        origin.fetchDate = new Date().toISOString();
      }

      onProgress?.({
        step: 'completed',
        progress: 100,
        message: '原型生成完成',
        details: `生成了 ${archetype.ontology.objects.length} 个对象，${archetype.workflows.length} 个工作流`
      });

      return {
        success: true,
        archetype,
        origin,
        warnings: validation.warnings.length > 0 ? validation.warnings : undefined
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      onProgress?.({
        step: 'error',
        progress: 0,
        message: '生成失败',
        details: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 调用 AI 服务生成 JSON
   */
  private async callAIForJSON(prompt: string): Promise<string> {
    // 使用 AIService 的底层能力
    // 由于 AIService 没有直接暴露单次调用接口，我们通过 chat 方法实现
    const systemPrompt = '你是一个 JSON 生成器。只输出有效的 JSON，不要输出任何其他内容，不要使用 markdown 代码块包裹。';

    // 构建一个特殊的请求
    const messages = [
      { role: 'user' as const, content: systemPrompt + '\n\n' + prompt }
    ];

    // 直接调用 chat 方法（会使用系统 prompt）
    // 我们需要一个更直接的方式
    return await this.directAICall(prompt);
  }

  /**
   * 直接调用 AI API（绕过 AIService 的系统 prompt）
   */
  private async directAICall(prompt: string): Promise<string> {
    const provider = this.settings.provider;

    if (provider === 'gemini') {
      return await this.callGeminiDirect(prompt);
    } else {
      return await this.callOpenAICompatibleDirect(prompt);
    }
  }

  private async callGeminiDirect(prompt: string): Promise<string> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.settings.apiKey });

    // 添加超时控制
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API 请求超时（120秒），请检查网络连接或稍后重试')), 120000);
    });

    try {
      const responsePromise = ai.models.generateContent({
        model: this.settings.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);
      const content = response.text || '{}';

      // 使用提取方法处理可能的格式问题
      return this.extractJSON(content);
    } catch (error) {
      if (error instanceof Error && error.message.includes('超时')) {
        throw error;
      }
      throw new Error(`Gemini API 调用失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async callOpenAICompatibleDirect(prompt: string): Promise<string> {
    const baseUrl = this.getBaseUrl();
    const provider = this.settings.provider;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.settings.apiKey}`,
    };

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://ontology-assistant.app';
      headers['X-Title'] = 'Ontology Architect';
    }

    // 构建请求体
    const requestBody: Record<string, any> = {
      model: this.settings.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的 JSON 生成器。请严格按照用户要求的格式输出有效的 JSON。不要输出任何其他内容，不要使用 markdown 代码块包裹，直接输出 JSON 对象。'
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 16384,
    };

    // 只有 OpenAI 和 OpenRouter 支持 response_format
    // Moonshot (Kimi) 和 智谱 不支持这个参数
    if (provider === 'openai' || provider === 'openrouter') {
      requestBody.response_format = { type: 'json_object' };
    }

    // 添加超时控制 (120 秒)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API调用失败: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';

      // 对于不支持 JSON mode 的 provider，尝试提取 JSON
      return this.extractJSON(content);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('API 请求超时（120秒），请检查网络连接或稍后重试');
      }
      throw error;
    }
  }

  /**
   * 从 AI 响应中提取 JSON（处理可能的 markdown 代码块等）
   */
  private extractJSON(content: string): string {
    // 如果已经是有效 JSON，直接返回
    try {
      JSON.parse(content);
      return content;
    } catch {
      // 继续尝试提取
    }

    // 尝试提取 markdown 代码块中的 JSON
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      const extracted = codeBlockMatch[1].trim();
      try {
        JSON.parse(extracted);
        return extracted;
      } catch {
        // 继续尝试其他方式
      }
    }

    // 尝试找到第一个 { 和最后一个 } 之间的内容
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const extracted = content.substring(firstBrace, lastBrace + 1);
      try {
        JSON.parse(extracted);
        return extracted;
      } catch {
        // 返回原始内容，让上层处理错误
      }
    }

    return content;
  }

  private getBaseUrl(): string {
    if (this.settings.provider === 'custom' && this.settings.customBaseUrl) {
      return this.settings.customBaseUrl;
    }

    const providerUrls: Record<string, string> = {
      'openrouter': 'https://openrouter.ai/api/v1',
      'openai': 'https://api.openai.com/v1',
      'zhipu': 'https://open.bigmodel.cn/api/paas/v4',
      'moonshot': 'https://api.moonshot.cn/v1',
    };

    return providerUrls[this.settings.provider] || '';
  }

  /**
   * 填充缺失的可选字段
   */
  private fillMissingFields(archetype: Archetype, industryName: string): void {
    // 确保 ID 唯一（追加时间戳避免冲突）
    // 格式: {original-id}-{timestamp} 或 {industry-slug}-{timestamp}
    const timestamp = Date.now();
    if (archetype.metadata.id) {
      // 已有 ID，追加时间戳确保唯一
      archetype.metadata.id = `${archetype.metadata.id}-${timestamp}`;
    } else {
      // 无 ID，根据行业名称生成
      const slug = industryName
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '');
      archetype.metadata.id = `${slug}-${timestamp}`;
    }

    // 确保 metadata 完整
    if (!archetype.metadata.version) {
      archetype.metadata.version = '1.0.0';
    }

    if (!archetype.metadata.changelog) {
      archetype.metadata.changelog = [{
        version: '1.0.0',
        date: new Date().toISOString().split('T')[0],
        changes: ['AI generated initial version']
      }];
    }

    if (!archetype.metadata.origin) {
      archetype.metadata.origin = {
        sourceEngagement: 'AI Generated',
        fdeContributors: ['AI Assistant'],
        abstractionDate: new Date().toISOString().split('T')[0]
      };
    }

    if (!archetype.metadata.usage) {
      archetype.metadata.usage = {
        deployments: 0,
        industries: [industryName],
        avgDeploymentTime: '1-2 weeks'
      };
    }

    // 确保 ontology.links 存在
    if (!archetype.ontology.links) {
      archetype.ontology.links = [];
    }

    // 确保每个对象有 aiFeatures
    archetype.ontology.objects.forEach(obj => {
      if (!obj.aiFeatures) {
        obj.aiFeatures = [];
      }
    });
  }

  /**
   * 验证已有原型的结构
   */
  validateArchetype(archetype: Archetype): { valid: boolean; errors: string[]; warnings: string[] } {
    return validateArchetypeStructure(archetype);
  }
}

// 导出工厂函数
export function createArchetypeGeneratorService(settings: AISettings): ArchetypeGeneratorService {
  return new ArchetypeGeneratorService(settings);
}

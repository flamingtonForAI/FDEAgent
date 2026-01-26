# Ontology智能助手 - 渐进式迭代路线图

## 现有代码基线分析

### 技术栈
- React 19 + TypeScript
- Vite 构建工具
- Google Gemini AI (`@google/genai`)
- lucide-react 图标库

### 现有功能模块

| 模块 | 文件 | 当前功能 | 状态 |
|-----|-----|---------|-----|
| 主应用 | `App.tsx` | 5个Tab导航 + 中英双语 | ✓ 完成 |
| 需求勘察 | `ChatInterface.tsx` | 对话式需求收集 | ✓ 基础完成 |
| 逻辑本体 | `OntologyVisualizer.tsx` | Objects/Links可视化 | ✓ 基础完成 |
| 架构拓扑 | `SystemMap.tsx` | 外部系统集成展示 | ✓ 基础完成 |
| AI增强 | `AIPLogicMatrix.tsx` | AI能力矩阵展示 | ✓ 基础完成 |
| 系统蓝图 | `ProjectOverview.tsx` | JSON导出 | ✓ 基础完成 |
| AI服务 | `geminiService.ts` | 对话 + Ontology生成 | ✓ 基础完成 |

### 当前System Prompt分析

```
现有提示词聚焦于：
1. 收集4个支柱：实体、操作流、数据源、AI注入点
2. 输出JSON格式的Ontology设计
3. 中英双语支持

缺失：
- 方法论深度（三层架构 + AI 能力叠加、Action三重身份）
- Action到API/Tool的转换
- 培训引导功能
- 质量检查逻辑
```

---

## 迭代路线图

### 版本命名规则
- `v0.x` - 基础增强（不改变核心架构）
- `v1.x` - 培训模块
- `v2.x` - 执行增强
- `v3.x` - 联动机制

---

## Phase 0: 基础增强 (v0.1 - v0.5)

### v0.1 - 升级System Prompt（方法论注入） ✅ 已完成
**目标**: 让AI回答更符合方法论

**改动范围**: `services/geminiService.ts`

**实际变更**:
- 注入三层架构概念（Semantic/Kinetic/Dynamic）+ AI 能力叠加
- 强调Ontology vs 知识图谱的核心区别（Action）
- 定义Action三重身份（业务层/逻辑层/实现层）
- 升级需求勘察协议（5个关键要素）
- 添加引导技巧（追问三层定义、提取Noun-Verb）
- 强调Decision-First原则
- 添加思维展示要求（帮助用户学习）

**验收标准**:
- [x] AI能主动引导用户思考Action的三层定义
- [x] AI回答中引用方法论原则

---

### v0.1.1 - 添加AI设置功能（多模型支持） ✅ 已完成
**目标**: 支持用户配置自己的API Key和选择不同的AI模型

**改动范围**:
- `types.ts` - 添加AISettings、AIProvider等类型定义
- `services/aiService.ts` - 新建统一的AI服务抽象层
- `components/Settings.tsx` - 新建设置弹窗组件
- `components/ChatInterface.tsx` - 集成新的AI服务
- `App.tsx` - 集成设置功能

**支持的AI提供商**:
| 提供商 | 支持的模型 |
|-------|-----------|
| **Google Gemini** | Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash |
| **OpenRouter** | Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B, DeepSeek 等 |
| **智谱 GLM** | GLM-4 Plus, GLM-4, GLM-4 Flash, GLM-4 Long |
| **OpenAI** | GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo |
| **自定义** | 任意OpenAI兼容API |

**新增功能**:
- 设置弹窗（可选择提供商、输入API Key、选择模型）
- API Key本地存储（localStorage）
- 连接测试功能
- 未配置时的友好提示

**验收标准**:
- [x] 可选择不同的AI提供商
- [x] 可配置API Key
- [x] 可选择模型
- [x] 设置可持久化
- [x] 有连接测试功能

---

### v0.1.2 - 合成前AI验证 ✅ 已完成
**目标**: 点击"合成架构"前验证信息是否充足

**改动范围**:
- `services/aiService.ts` - 新增 `validateReadiness` 方法
- `components/ChatInterface.tsx` - 添加验证逻辑和结果弹窗

**实际变更**:
- AI分析对话内容，识别已提及的Objects和Actions
- 最小信息要求：至少1个对象 + 至少1个动作 + 业务场景
- 信息不足时显示弹窗：
  - 已识别的对象（蓝色标签）
  - 已识别的动作（绿色标签）
  - 缺失的信息（黄色列表）
  - 建议说明
- 用户可选择"继续对话"或"仍然生成"

**验收标准**:
- [x] 点击按钮先验证信息充足性
- [x] 信息不足时显示友好提示
- [x] 用户可强制生成

---

### v0.2 - Action数据结构增强 ✅ 已完成
**目标**: 让Action具备三层结构

**改动范围**:
- `types.ts` - 升级AIPAction接口
- `services/aiService.ts` - 升级Ontology生成Prompt

**实际变更**:
```typescript
// 新增 ActionParameter 接口
export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description: string;
}

// 升级 AIPAction 接口，添加三层定义
export interface AIPAction {
  // 原有字段保留...

  // 业务层 Business Layer
  businessLayer?: {
    description: string;      // 业务描述
    targetObject: string;     // 目标对象
    executorRole: string;     // 执行角色
    triggerCondition?: string; // 触发条件
  };

  // 逻辑层 Logic Layer
  logicLayer?: {
    preconditions: string[];
    parameters: ActionParameter[];
    postconditions: string[];
    sideEffects?: string[];
  };

  // 实现层 Implementation Layer
  implementationLayer?: {
    apiEndpoint?: string;
    apiMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requestPayload?: Record<string, any>;
    agentToolSpec?: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  };

  // 治理属性
  governance?: {
    permissionTier: 1 | 2 | 3 | 4;
    requiresHumanApproval: boolean;
    auditLog: boolean;
    riskLevel?: 'low' | 'medium' | 'high';
  };
}
```

**验收标准**:
- [x] types.ts中Action结构已升级
- [x] 兼容现有数据（旧字段保留，新字段可选）
- [x] Ontology生成Prompt已更新，会生成三层定义

---

### v0.3 - Action可视化增强 ✅ 已完成
**目标**: 在UI中展示Action的三层定义

**改动范围**: `components/OntologyVisualizer.tsx`

**实际变更**:
- 为每个Action添加展开/折叠功能
- 展开后显示三层定义详情
- 使用不同颜色区分各层：
  - 🔵 业务层 (Business Layer) - 蓝色
  - 🟢 逻辑层 (Logic Layer) - 绿色
  - 🟣 实现层 (Implementation Layer) - 紫色
  - 🟠 治理 (Governance) - 橙色
- AI生成的Action显示"AI"标签
- 支持中英双语

**验收标准**:
- [x] Action可展开查看详情
- [x] 三层定义清晰展示
- [x] 颜色区分直观

---

### v0.4 - 新增Action设计器Tab ✅ 已完成
**目标**: 独立的Action设计界面

**改动范围**:
- 新建 `components/ActionDesigner.tsx`
- 修改 `App.tsx` 添加新Tab

**实际变更**:
- 新Tab「Action 设计」位于「逻辑本体」和「架构拓扑」之间
- 左侧面板：对象选择器 + Action列表
- 右侧面板：三层定义表单编辑器
  - 🔵 业务层：描述、目标对象、执行角色、触发条件
  - 🟢 逻辑层：前置条件、参数、后置状态、副作用（支持动态增删）
  - 🟣 实现层：API端点、HTTP方法、Agent工具名称和描述
  - 🟠 治理：权限等级(Tier 1-4)、人工审批、审计日志、风险等级
- 保存按钮实时更新项目状态
- 中英双语支持

**验收标准**:
- [x] 新Tab可正常切换
- [x] 可编辑Action三层定义
- [x] 编辑后自动保存到项目状态

---

## Phase 1: 培训模块 (v1.0 - v1.4)

### v1.0 - 添加Academy Tab骨架 ✅ 已完成
**目标**: 建立培训模块入口

**改动范围**:
- 新建 `components/Academy.tsx`
- 修改 `App.tsx` 添加Tab

**实际变更**:
- 新Tab "学习中心" 放在侧边栏最上方（与分隔线区分）
- 4个Level学习路径：
  - Level 1: 基础认知（Ontology概念、三层架构 + AI 叠加、Noun-Verb、Decision-First）
  - Level 2: Action深度（三重身份、状态机、API映射、Tool映射）
  - Level 3: 落地实现（REST API、OpenAPI、Agent Tool、治理）
  - Level 4: 最佳实践（制造业/零售业/物流业案例、设计模式）
- 总进度显示（百分比 + 进度条）
- Level可展开/折叠查看课时列表
- 每个课时显示时长
- "开始学习"/"继续学习"按钮
- 中英双语支持
- 使用新设计系统（glass-card、btn-gradient等）

**验收标准**:
- [x] Academy Tab可访问
- [x] 显示学习路径结构
- [x] 进度显示（0%）
- [x] Level可展开查看课时

---

### v1.1 - Level 1课程内容 ✅ 已完成
**目标**: 基础认知课程

**改动范围**:
- 新建 `content/lessons/` 目录
- 新建 `content/lessons/level1.ts` - Level 1 四个课时
- 新建 `components/LessonViewer.tsx` - 课程查看组件
- 修改 `components/Academy.tsx` - 集成课程查看

**课程内容**:
```
Level 1: 基础认知
├── 1.1 什么是Ontology (vs 知识图谱)
├── 1.2 三层架构 + AI 能力叠加
├── 1.3 Noun-Verb框架
└── 1.4 Decision-First原则
```

**实际变更**:
- LessonContent 接口定义（支持 text/keypoint/comparison/example/diagram 类型）
- 每个课时包含多个 sections 和课后测验 (quiz)
- LessonViewer 支持分段浏览、答题、即时反馈
- 进度持久化到 localStorage
- 完成课时后显示绿色勾选

**验收标准**:
- [x] 4个课时内容可浏览
- [x] 支持多种内容类型渲染
- [x] 课后测验有即时反馈
- [x] 进度可持久化

---

### v1.2 - Level 2课程内容（Action专题）✅ 已完成
**目标**: Action深度课程

**改动范围**:
- 新建 `content/lessons/level2.ts` - Level 2 四个课时
- 修改 `components/LessonViewer.tsx` - 支持新的内容类型
- 修改 `components/Academy.tsx` - 集成 Level 2 解锁逻辑

**课程内容**:
```
Level 2: Action深度
├── 2.1 Action的三重身份
├── 2.2 状态机设计
├── 2.3 Action到API的映射
└── 2.4 Action到Agent Tool的映射
```

**实际变更**:
- 新增内容类型支持：perspectives（三重身份视角）、mappings（API映射表）、code（代码示例）、stateMachine（状态机图）
- Level 2 在 Level 1 完成后自动解锁
- 每个课时包含详细的示例和测验

**验收标准**:
- [x] Action专题课程完整
- [x] 包含示例代码
- [x] Level 2 解锁机制工作正常

---

### v1.3 - 交互式练习组件 ✅ 已完成
**目标**: 添加练习功能

**改动范围**:
- 新建 `components/Exercise.tsx` - 练习组件
- 修改 `components/Academy.tsx` - 集成练习功能

**练习类型**:
1. **Noun/Verb提取练习**: 给定业务描述，选择正确的对象和动作（含干扰项）
2. **Action设计练习**: 给定业务动作，填写三层定义（目标对象、执行角色、前置条件、后置状态等）

**实际变更**:
- Exercise 组件支持两种练习类型
- 每种类型包含 2 道练习题
- 选择题有正确/错误即时反馈
- 填空题支持提示功能
- 练习完成后显示正确率
- 练习分数持久化到 localStorage
- Practice Lab 区域展示在 Academy 页面底部
- 练习根据 Level 完成情况解锁

**验收标准**:
- [x] 至少2种练习类型
- [x] 有即时反馈
- [x] 进度可持久化

---

### v1.4 - 学习进度追踪 ✅ 已完成
**目标**: 记录学习进度

**改动范围**:
- 新建 `hooks/useProgress.ts` - 集中管理所有进度逻辑
- 新建 `components/AchievementPopup.tsx` - 成就解锁弹窗
- 修改 `components/Academy.tsx` - 集成新 hook 和成就展示

**功能**:
- 记录已完成课时
- 显示总体进度百分比
- Level完成徽章
- 成就系统（8 种成就类型）
- 连续学习天数追踪（Streak）
- 成就解锁弹窗通知

**实际变更**:
- `useProgress` hook 集中管理：课时完成、练习分数、成就、连续学习
- 8 种成就：初学入门、基础奠基者、Action大师、熟能生巧、完美主义者、练习冠军、持续学习者、周学习战士
- 成就自动检测和解锁
- 成就弹窗自动消失（3秒）
- 连续学习天数显示在进度旁
- 成就展示区域显示已解锁和待解锁成就

**验收标准**:
- [x] 进度可持久化
- [x] 刷新后进度保留
- [x] 成就系统工作正常
- [x] 连续学习追踪

---

## Phase 2: 执行增强 (v2.0 - v2.4)

### v2.0 - 结构化需求模板 ✅ 已完成
**目标**: 引导式需求收集

**改动范围**:
- 新建 `components/QuickInputPanel.tsx` - 快捷输入面板组件
- 修改 `components/ChatInterface.tsx` - 集成快捷输入功能

**实际变更**:
- 新增 QuickInputPanel 组件，包含三个快捷按钮：
  - [+ 对象] → 弹出 Object 定义表单（名称、描述、属性）
  - [+ 动作] → 弹出 Action 定义表单（名称、目标对象、执行角色、触发条件、前置条件、后置状态）
  - [+ 数据源] → 弹出 Integration 定义表单（名称、类型、连接参数、同步对象）
- 表单验证（必填项检查）
- 自动将表单数据转为结构化消息发送给 AI
- 支持中英双语
- 弹窗动画和 glass 设计风格

**验收标准**:
- [x] 快捷按钮可用
- [x] 表单数据正确传递

---

### v2.1 - 智能提取Noun/Verb ✅ 已完成
**目标**: 从对话中自动提取

**改动范围**:
- `services/aiService.ts` - 新增 `extractNounsVerbs` 方法
- `components/NounVerbPanel.tsx` - 新建提取结果侧边栏组件
- `components/ChatInterface.tsx` - 集成提取功能和面板

**实际变更**:
- 新增 `extractNounsVerbs` 方法，使用 AI 从文本中提取：
  - Nouns（对象）：名称、描述、置信度
  - Verbs（动作）：名称、目标对象、描述、置信度
- 新建 NounVerbPanel 组件：
  - 可折叠展示提取的对象和动作
  - 置信度颜色编码（绿色 ≥80%，黄色 ≥50%，灰色 <50%）
  - 一键添加到 Ontology（+ 按钮）
  - 一键忽略（× 按钮）
- 集成到 ChatInterface：
  - 发送消息后自动提取
  - 头部切换按钮显示/隐藏面板
  - 提取到内容时自动弹出面板
  - 添加对象：创建新 Object
  - 添加动作：添加到匹配的目标对象或第一个对象

**验收标准**:
- [x] 实时提取功能可用
- [x] 提取结果可添加

---

### v2.2 - API规范生成器 ✅ 已完成
**目标**: 从Action生成REST API规范

**改动范围**:
- 新建 `utils/apiGenerator.ts` - OpenAPI 3.0 规范生成工具
- 新建 `components/APISpecViewer.tsx` - 规范查看器组件
- 修改 `components/ActionDesigner.tsx` - 集成 API Spec 标签页

**实际变更**:
- `apiGenerator.ts` 提供以下功能：
  - `generateActionAPISpec()` - 单个 Action 生成 API 规范
  - `generateObjectAPISpec()` - 单个对象所有 Action 的 API 规范
  - `generateFullAPISpec()` - 完整项目 API 规范
  - `specToJSON()` / `specToYAML()` - 格式转换
- `APISpecViewer.tsx` 组件：
  - 三种视图模式：完整规范 / 单对象 / 单动作
  - JSON/YAML 格式切换
  - 一键复制 / 下载
  - 可折叠的路径和模型预览
  - HTTP 方法颜色编码
- ActionDesigner 新增「API 规范」标签页

**输出格式**: OpenAPI 3.0 JSON/YAML

**验收标准**:
- [x] 可生成有效的OpenAPI规范
- [x] 可复制/导出

---

### v2.3 - Agent Tool规范生成器 ✅ 已完成
**目标**: 从Action生成Agent Tool定义

**改动范围**:
- 新建 `utils/toolGenerator.ts` - 多格式 Agent Tool 生成工具
- 新建 `components/ToolSpecViewer.tsx` - Tool 规范查看器组件
- 修改 `components/ActionDesigner.tsx` - 集成 Agent Tool 标签页

**实际变更**:
- `toolGenerator.ts` 支持多种格式：
  - **OpenAI Function Calling** - OpenAI API 标准格式
  - **LangChain** - 带 args_schema 和 metadata 的格式
  - **Claude** - Anthropic input_schema 格式
  - **MCP** - Model Context Protocol 格式
  - **Universal** - 内部统一表示
- 代码生成功能：
  - `generateLangChainPython()` - Python + Pydantic 代码
  - `generateOpenAITypeScript()` - TypeScript 代码（含类型和调度器）
- `ToolSpecViewer.tsx` 组件：
  - 三种视图模式：所有工具 / 对象工具 / 单个工具
  - 格式选择器（OpenAI/LangChain/Claude/MCP/Universal）
  - 输出模式：JSON / Python / TypeScript
  - 治理信息展示（Tier、审批、风险等级）
  - 复制 / 下载功能
- ActionDesigner 新增「Agent Tool」标签页

**验收标准**:
- [x] 可生成Tool JSON
- [x] 包含权限和治理属性

---

### v2.4 - 质量检查器 ✅ 已完成
**目标**: 检查Ontology设计完整性

**改动范围**:
- 新建 `utils/qualityChecker.ts` - 质量检查规则引擎
- 新建 `components/QualityPanel.tsx` - 质量检查结果面板
- 修改 `App.tsx` - 集成浮动按钮和滑出面板
- 修改 `index.css` - 添加滑入动画

**实际变更**:
- `qualityChecker.ts` 包含 16 条检查规则，分 5 个类别：
  - **Object 类别**：主键缺失、描述缺失、属性过少、孤立对象
  - **Action 类别**：前置条件缺失、后置状态缺失、参数缺失、描述缺失
  - **Link 类别**：基数缺失、描述缺失
  - **Integration 类别**：端点缺失、映射缺失
  - **Architecture 类别**：AI 能力未启用、权限未定义、审计未启用、治理信息缺失
- 评分系统：基于规则权重计算分数（0-100）和等级（A-F）
- `QualityPanel.tsx` 组件：
  - 分数和等级展示
  - 按类别分组的问题列表（可展开/折叠）
  - 严重程度筛选（error/warning/info）
  - 每个问题显示建议修复方案
- 集成方式：
  - 右下角浮动按钮（仅在有对象时显示）
  - 点击弹出全屏滑出面板
  - 点击遮罩层关闭

**验收标准**:
- [x] 至少10条检查规则（实际16条）
- [x] 检查结果可视化展示

---

## Phase 3: 联动机制 (v3.0 - v3.3)

### v3.0 - 案例库数据结构 ✅ 已完成
**目标**: 建立案例存储

**改动范围**:
- 新建 `types/case.ts` - 完整的案例类型定义
- 新建 `content/cases/` 目录 - 案例文件存储
- 新建 `content/cases/index.ts` - 案例索引和查询函数

**案例类型定义** (`types/case.ts`):
- `OntologyCase` - 完整案例结构（元数据、场景、Ontology、亮点、学习要点）
- `CaseMetadata` - 元数据（ID、标题、描述、行业、标签、难度）
- `BusinessScenario` - 业务场景（背景、挑战、目标、干系人）
- `DesignHighlight` - 设计亮点
- `LearningPoint` - 学习要点
- `CaseIndex` - 案例索引（用于列表展示）
- 行业/难度/标签配置

**初始案例**:
```
content/cases/
├── manufacturing-production.ts  # 制造业-智能生产计划
│   ├── 4个对象: Production Order, Production Line, Equipment, Material
│   ├── 10+个动作: Schedule Order, Reschedule, Predict Failure等
│   └── 3个集成: ERP, MES, IoT Platform
├── retail-inventory.ts          # 零售业-智能库存管理
│   ├── 4个对象: Product, Store, Inventory, Replenishment Order
│   ├── 10+个动作: Forecast Demand, Trigger Replenishment等
│   └── 3个集成: POS, WMS, E-commerce
├── logistics-delivery.ts        # 物流业-智能配送调度
│   ├── 4个对象: Delivery Order, Route, Driver, Vehicle
│   ├── 12+个动作: Optimize Route, Insert Stop, Estimate ETA等
│   └── 4个集成: TMS, GPS, Traffic API, Customer Notifications
└── index.ts                     # 索引和查询函数
```

**索引功能**:
- `getCaseIndexList()` - 获取所有案例索引
- `getCasesByIndustry()` - 按行业筛选
- `getCasesByTag()` - 按标签筛选
- `getCasesByDifficulty()` - 按难度筛选
- `getCaseById()` - 获取完整案例
- `getRelatedCases()` - 获取相关案例
- `searchCases()` - 搜索案例

**验收标准**:
- [x] 案例数据结构定义完成
- [x] 至少3个案例（实际3个完整案例，共12个对象、30+个动作）

---

### v3.1 - 案例浏览器 ✅ 已完成
**目标**: 在培训模块中浏览案例

**改动范围**:
- 新建 `components/CaseBrowser.tsx` - 案例浏览器组件
- 修改 `components/Academy.tsx` - 集成案例库入口

**实际变更**:
- `CaseBrowser.tsx` 组件功能：
  - 案例列表网格视图
  - 搜索功能（支持中英文）
  - 按行业筛选（制造业/零售业/物流业/医疗/金融/能源/农业）
  - 按难度筛选（入门/中级/高级）
  - 案例详情视图：
    - 业务场景（背景、挑战、目标、干系人）
    - Ontology设计（对象、动作、关系、集成）
    - 设计亮点
    - 学习要点
    - 相关案例推荐
- Academy 页面集成：
  - 案例库区域展示3个预览卡片
  - "查看所有案例"按钮打开完整浏览器
  - 点击任意案例卡片进入浏览器

**验收标准**:
- [x] 案例可浏览
- [x] 可查看详情

---

### v3.2 - 执行时案例推荐 ✅ 已完成
**目标**: 设计时推荐相似案例

**改动范围**:
- `services/aiService.ts` - 添加 `recommendCases()` 方法
- `components/CaseRecommendPanel.tsx` - 新建案例推荐侧边面板
- `components/ChatInterface.tsx` - 集成案例推荐功能

**实际变更**:
- `aiService.ts` 新增 `recommendCases()` 方法：
  - AI 分析对话，识别行业（7种）和业务关键词
  - 基于行业和关键词匹配相关案例
  - 返回推荐案例 ID 列表和置信度
- `CaseRecommendPanel.tsx` 组件：
  - 显示识别到的关键词标签
  - 推荐案例列表（可展开/折叠）
  - 案例预览（描述、对象/动作数、设计亮点）
  - 点击"查看详情"进入完整案例浏览器
- `ChatInterface.tsx` 集成：
  - 消息发送后自动触发案例分析
  - 头部"灯泡"按钮显示/隐藏推荐面板
  - 有推荐时显示数量徽章
  - 高置信度(>0.5)时自动弹出面板

**验收标准**:
- [x] 自动推荐案例
- [x] 推荐相关性高

---

### v3.3 - 智能提示系统 ✅ 已完成
**目标**: 执行时的上下文提示

**改动范围**:
- 新建 `components/SmartTips.tsx` - 智能提示组件
- 修改 `components/ChatInterface.tsx` - 集成提示系统

**实际变更**:
- `SmartTips.tsx` 组件功能：
  - 基于对话内容和项目状态动态生成提示
  - 三种提示类型，不同颜色区分：
    - 🟣 **方法论提示** (紫色) - Ontology 设计原则
      - Focus on Actions（关注动作）
      - Three Layers（三层思考）
      - Decision-First（决策优先）
      - Noun-Verb Extraction（名词动词提取）
      - AI Injection Points（AI 注入点）
    - 🟡 **案例提示** (琥珀色) - 相似案例参考
    - 🔵 **检查提示** (青色) - 遗漏项提醒
  - 智能优先级排序，最多显示 3 条提示
  - 可折叠/展开
  - 单条提示可关闭
  - 上下文感知：
    - 分析用户消息关键词（流程、数据、决策、预测等）
    - 根据项目状态（是否有对象、动作、集成、AI特性）
    - 根据对话深度调整提示内容
- ChatInterface 集成：
  - 提示区域位于输入框上方
  - 与 QuickInputPanel 协同工作

**验收标准**:
- [x] 提示系统可用
- [x] 提示内容相关

---

## 迭代总览

```
v0.1  ─────  升级System Prompt
  │
v0.2  ─────  Action数据结构增强
  │
v0.3  ─────  Ontology生成Prompt升级
  │
v0.4  ─────  Action可视化增强
  │
v0.5  ─────  新增Action设计器Tab
  │
  ├────────── Phase 0 完成 ──────────
  │
v1.0  ─────  添加Academy Tab骨架
  │
v1.1  ─────  Level 1课程内容
  │
v1.2  ─────  Level 2课程内容
  │
v1.3  ─────  交互式练习组件
  │
v1.4  ─────  学习进度追踪
  │
  ├────────── Phase 1 完成 ──────────
  │
v2.0  ─────  结构化需求模板
  │
v2.1  ─────  智能提取Noun/Verb
  │
v2.2  ─────  API规范生成器
  │
v2.3  ─────  Agent Tool规范生成器
  │
v2.4  ─────  质量检查器
  │
  ├────────── Phase 2 完成 ──────────
  │
v3.0  ─────  案例库数据结构
  │
v3.1  ─────  案例浏览器
  │
v3.2  ─────  执行时案例推荐 ✅
  │
v3.3  ─────  智能提示系统 ✅
  │
  └────────── Phase 3 完成 ✅ ──────────

              🎉 v3.3 = 完整产品 🎉

              ✅ 全部迭代完成！
```

---

## 快速启动

### 从v0.1开始

```bash
# 1. 进入项目目录
cd ontology-assistant

# 2. 安装依赖
npm install

# 3. 配置API Key
echo "API_KEY=your_gemini_api_key" > .env.local

# 4. 启动开发服务器
npm run dev
```

### 当前版本
**v0.3.3** - 完整产品版本 (2026-01-20)

所有计划功能已完成，包括：
- 核心架构设计功能
- 培训学习中心
- 工具生成器
- 质量保障系统
- 案例库和智能推荐
- 多模态文件上传分析

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|-----|-----|---------|
| v0.0 | 2026-01-19 | 基线版本，现有代码 |
| v0.1 | 2026-01-19 | ✅ 升级System Prompt，注入方法论核心 |
| v0.1.1 | 2026-01-19 | ✅ 添加AI设置功能，支持多模型提供商 |
| v0.1.2 | 2026-01-19 | ✅ 添加合成前AI验证，检查信息充足性 |
| v0.2 | 2026-01-19 | ✅ Action数据结构增强，添加三层定义 |
| v0.3 | 2026-01-19 | ✅ Action可视化增强，展开/折叠三层定义 |
| v0.3.1 | 2026-01-19 | ✅ 添加图例说明 |
| v0.3.2 | 2026-01-19 | ✅ 聊天记录和项目状态持久化存储 |
| v0.4 | 2026-01-19 | ✅ 新增Action设计器Tab |
| v0.5 | 2026-01-19 | ✅ UI重设计（设计系统、glass效果、瀑布流布局、标签页式ActionDesigner） |
| v1.0 | 2026-01-19 | ✅ 添加Academy培训模块骨架（4级学习路径、进度追踪） |
| v1.1 | 2026-01-19 | ✅ Level 1课程内容（4课时 + LessonViewer + 进度持久化） |
| v1.2 | 2026-01-19 | ✅ Level 2课程内容（Action专题4课时 + 解锁机制） |
| v1.3 | 2026-01-19 | ✅ 交互式练习组件（Noun-Verb提取 + Action设计 + 即时反馈） |
| v1.4 | 2026-01-19 | ✅ 学习进度追踪（useProgress hook + 成就系统 + 连续学习追踪） |
| v2.0 | 2026-01-19 | ✅ 结构化需求模板（QuickInputPanel + Object/Action/Integration 表单） |
| v2.1 | 2026-01-19 | ✅ 智能提取 Noun/Verb（extractNounsVerbs + NounVerbPanel + 一键添加） |
| v2.2 | 2026-01-19 | ✅ API 规范生成器（apiGenerator + APISpecViewer + OpenAPI 3.0） |
| v2.3 | 2026-01-19 | ✅ Agent Tool 生成器（toolGenerator + ToolSpecViewer + 多格式 + 代码生成） |
| v2.4 | 2026-01-19 | ✅ 质量检查器（qualityChecker + QualityPanel + 16条规则 + 评分系统 + 浮动按钮） |
| v3.0 | 2026-01-19 | ✅ 案例库数据结构（types/case.ts + 3个完整案例 + 索引查询函数） |
| v3.1 | 2026-01-19 | ✅ 案例浏览器（CaseBrowser + 搜索筛选 + 详情视图 + Academy集成） |
| v3.2 | 2026-01-19 | ✅ 执行时案例推荐（recommendCases + CaseRecommendPanel + ChatInterface集成） |
| v3.3 | 2026-01-19 | ✅ 智能提示系统（SmartTips + 三种提示类型 + 上下文感知 + 优先级排序） |
| v0.3.3 | 2026-01-20 | ✅ **正式发布版本** - 多模态文件上传（PDF/Excel/PPT/图片 + LLM视觉分析 + 粘贴支持） |

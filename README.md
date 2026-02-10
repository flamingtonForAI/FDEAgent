# Ontology Architect

![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> 智能 Ontology 设计助手 - 从对话到架构的一站式解决方案

Ontology Architect 是一个基于 AI 的企业智能系统设计工具，帮助用户通过自然语言对话完成从需求发现到系统架构设计的完整流程。遵循 Palantir 的 "Ontology-First" 方法论。

## 核心理念

**Ontology ≠ 知识图谱**

- 知识图谱是静态的（只能查询）
- Ontology 是动态的（可以执行）
- 核心差异：**Action（动作）** 连接自然语义到可执行函数

## 新功能 (v0.4.0)

### 多项目管理
- **项目隔离** - 每个项目独立的本体设计、聊天记录和设置
- **项目仪表盘** - 项目列表、搜索、进度跟踪
- **新建项目向导** - 空白项目或从行业模板快速开始
- **数据迁移** - 自动从旧版单项目格式迁移

### 统一设置面板
- **AI 配置** - 服务商、模型、API Key 集中管理
- **主题切换** - 10 款精选主题（5 暗色 + 5 浅色）
- **语言切换** - 中文 / English
- **数据重置** - 一键清除所有本地数据

### 新用户引导
- **快速开始** - 引导新用户创建第一个项目
- **路径选择** - 先学习、从模板开始、对话探索
- **进度追踪** - 4 阶段工作流可视化

## 功能特性

### 4 阶段设计工作流

```
发现 → 建模 → 集成 → 智能化
```

1. **发现阶段** - 对话式需求收集，提取 Objects & Actions
2. **建模阶段** - 定义 Ontology，三层 Action 设计
3. **集成阶段** - 映射数据源到 Ontology 属性
4. **智能化阶段** - 设计 AI 增强点和 Agent Tools

### 需求勘察
- **对话式需求收集** - AI 引导用户发现业务实体、操作流程和数据源
- **智能 Noun-Verb 提取** - 自动从对话中识别对象（名词）和动作（动词）
- **多模态输入** - 支持上传 PDF、Excel、PPT、图片等文档，AI 直接分析

### 架构设计
- **Ontology 三层架构 + AI 能力叠加**
  - Semantic Layer（语义层）- 定义业务概念模型
  - Kinetic Layer（动力层）- 连接概念到数据源
  - Dynamic Layer（动态层）- 引入行为和状态管理
  - AI Capability Overlay（AI 能力叠加）

- **Action 三重身份**
  - 业务层 - 自然语言描述、执行角色、触发条件
  - 逻辑层 - 前置条件、参数、后置状态、副作用
  - 实现层 - REST API 端点、Agent Tool 规范

### 行业模板库
- **11 个预置行业模板** - 金融风控、智能制造、能源电力、国防情报等
- **JSON 导入/导出** - 分享和复用模板
- **模板应用** - 一键应用到当前项目

### 可视化
- **Ontology 可视化** - Objects、Actions、Links 关系图
- **系统架构图** - 外部系统集成拓扑
- **AI 能力矩阵** - AI 增强点全景视图

### 工具生成
- **OpenAPI 规范生成** - 从 Action 自动生成 REST API 规范
- **Agent Tool 生成** - 支持 OpenAI、LangChain、Claude、MCP 多种格式
- **代码生成** - Python (Pydantic) 和 TypeScript 代码

### 学习中心
- **结构化课程** - 4 个 Level 的渐进式学习路径
- **交互式练习** - Noun-Verb 提取和 Action 设计练习
- **案例库** - 制造业、零售业、物流业真实案例
- **成就系统** - 学习进度追踪和成就解锁

### 质量保障
- **智能提示系统** - 方法论提示、案例参考、遗漏提醒
- **质量检查器** - 16 条规则检查 Ontology 设计完整性
- **案例推荐** - 基于对话内容推荐相似案例

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI**: Tailwind CSS + Lucide Icons + CSS Variables 主题系统
- **状态管理**: React Context (Auth, Sync, Project)
- **存储**: localStorage (离线优先) + 云同步就绪
- **AI 服务**: 多提供商支持
  - Moonshot (Kimi)
  - Google Gemini
  - OpenAI / OpenRouter (GPT-4, Claude)
  - 智谱 GLM
  - 自定义 OpenAI 兼容 API

## 快速开始

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd ontology-assistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 http://localhost:3000 启动。

### 配置 AI

1. 启动应用后，点击左下角 **设置** 图标
2. 在 **AI 模型** 标签页：
   - 选择服务商（Moonshot、Gemini、OpenRouter 等）
   - 选择模型
   - 输入 API Key
3. 查看连接状态确认配置成功

### 创建第一个项目

1. 新用户首次访问会看到 **快速开始** 引导
2. 点击 **创建项目** 按钮
3. 选择：
   - **空白项目** - 从零开始，适合自定义需求
   - **从模板开始** - 选择行业模板快速启动
4. 填写项目名称，开始设计

## 项目结构

```
ontology-assistant/
├── App.tsx                    # 主应用入口
├── components/
│   ├── QuickStart.tsx         # 快速开始引导
│   ├── ProjectDashboard.tsx   # 项目管理仪表盘
│   ├── NewProjectDialog.tsx   # 新建项目对话框
│   ├── UnifiedSettings.tsx    # 统一设置面板
│   ├── ChatInterface.tsx      # 对话式需求收集
│   ├── OntologyVisualizer.tsx # Ontology 可视化
│   ├── ActionDesigner.tsx     # Action 设计器
│   ├── ArchetypeBrowser.tsx   # 行业模板浏览器
│   ├── Academy.tsx            # 学习中心
│   ├── QualityPanel.tsx       # 质量检查面板
│   └── auth/                  # 认证组件
├── contexts/
│   ├── ProjectContext.tsx     # 多项目状态管理
│   ├── AuthContext.tsx        # 认证状态
│   └── SyncContext.tsx        # 云同步状态
├── services/
│   ├── aiService.ts           # AI 服务抽象层
│   ├── syncService.ts         # 云同步服务
│   └── authService.ts         # 认证服务
├── lib/
│   ├── storage.ts             # 混合存储（本地 + 云）
│   └── themes.ts              # 主题配置
├── content/
│   ├── archetypes/            # 行业模板
│   ├── cases/                 # 案例库
│   └── lessons/               # 课程内容
├── utils/
│   ├── apiGenerator.ts        # OpenAPI 生成器
│   ├── toolGenerator.ts       # Agent Tool 生成器
│   └── qualityChecker.ts      # 质量检查器
├── types.ts                   # 类型定义
└── types/
    └── archetype.ts           # 模板类型定义
```

## 主题

内置 10 款主题：

**暗色主题**
- GitHub Dark - GitHub 官方暗色
- One Dark - Atom 经典
- Dracula - 吸血鬼配色
- Nord - 北极冰雪
- Tokyo Night - 东京霓虹

**浅色主题**
- GitHub Light - GitHub 官方浅色
- Nord Light - Nord 浅色版
- Alucard - Dracula 浅色版
- Solarized Light - 经典护眼
- One Light - Atom 浅色

## 支持的文件格式

| 格式 | 扩展名 | 处理方式 |
|-----|-------|---------|
| 文本文件 | .txt, .md, .json, .csv | 直接读取文本 |
| PDF 文档 | .pdf | AI 视觉分析 |
| Excel 表格 | .xlsx, .xls | AI 视觉分析 |
| PPT 演示 | .pptx, .ppt | AI 视觉分析 |
| Word 文档 | .docx, .doc | AI 视觉分析 |
| 图片 | .png, .jpg, .gif, .webp | AI 视觉分析 |

支持直接粘贴图片（Ctrl+V / Cmd+V）

## 方法论核心

### Decision-First 原则

> 如果一个 Object 或 Action 不直接支持用户的操作决策，就不应该在核心 Ontology 中。

设计时问自己：
- 用户拿到这个信息后，会做什么决策？
- 会执行什么动作？

### Action 三层定义示例

```
┌─────────────────────────────────────────────────────────┐
│ 业务层：经理审批超过10万元的采购订单                      │
│ 逻辑层：前置[status=待审批 AND amount>100000]            │
│        参数[order_id, decision, notes]                  │
│        后置[status→已审批/已拒绝]                        │
│ 实现层：POST /api/orders/{id}/approve                   │
│        Tool: approve_purchase_order(order_id, decision) │
└─────────────────────────────────────────────────────────┘
```

## 开发

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**Built with AI-First Design Philosophy**

# Ontology Architect

![Version](https://img.shields.io/badge/version-0.3.3-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> 智能 Ontology 设计助手 - 从对话到架构的一站式解决方案

Ontology Architect 是一个基于 AI 的企业智能系统设计工具，帮助用户通过自然语言对话完成从需求发现到系统架构设计的完整流程。

## 核心理念

**Ontology ≠ 知识图谱**

- 知识图谱是静态的（只能查询）
- Ontology 是动态的（可以执行）
- 核心差异：**Action（动作）** 连接自然语义到可执行函数

## 功能特性

### 🎯 需求勘察
- **对话式需求收集** - AI 引导用户发现业务实体、操作流程和数据源
- **智能 Noun-Verb 提取** - 自动从对话中识别对象（名词）和动作（动词）
- **多模态输入** - 支持上传 PDF、Excel、PPT、图片等文档，AI 直接分析

### 🏗️ 架构设计
- **Ontology 三层架构 + AI 能力叠加**
  - Semantic Layer（语义层）- 定义业务概念模型
  - Kinetic Layer（动力层）- 连接概念到数据源
  - Dynamic Layer（动态层）- 引入行为和状态管理
  - AI Capability Overlay（AI 能力叠加）- 增强语义层和动态层，非独立第四层

- **Action 三重身份**
  - 业务层 - 自然语言描述、执行角色、触发条件
  - 逻辑层 - 前置条件、参数、后置状态、副作用
  - 实现层 - REST API 端点、Agent Tool 规范

### 📊 可视化
- **Ontology 可视化** - Objects、Actions、Links 关系图
- **系统架构图** - 外部系统集成拓扑
- **AI 能力矩阵** - AI 增强点全景视图

### 🛠️ 工具生成
- **OpenAPI 规范生成** - 从 Action 自动生成 REST API 规范
- **Agent Tool 生成** - 支持 OpenAI、LangChain、Claude、MCP 多种格式
- **代码生成** - Python (Pydantic) 和 TypeScript 代码

### 📚 学习中心
- **结构化课程** - 4 个 Level 的渐进式学习路径
- **交互式练习** - Noun-Verb 提取和 Action 设计练习
- **案例库** - 制造业、零售业、物流业真实案例
- **成就系统** - 学习进度追踪和成就解锁

### ✅ 质量保障
- **智能提示系统** - 方法论提示、案例参考、遗漏提醒
- **质量检查器** - 16 条规则检查 Ontology 设计完整性
- **案例推荐** - 基于对话内容推荐相似案例

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI**: Tailwind CSS + Lucide Icons
- **AI 服务**: 多提供商支持
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

### 配置 AI

1. 启动应用后，点击右上角设置图标
2. 选择 AI 提供商（Gemini、OpenRouter、OpenAI 等）
3. 输入 API Key
4. 选择模型
5. 点击"测试连接"验证配置

## 项目结构

```
ontology-assistant/
├── App.tsx                 # 主应用入口
├── components/
│   ├── ChatInterface.tsx   # 对话式需求收集
│   ├── OntologyVisualizer.tsx  # Ontology 可视化
│   ├── ActionDesigner.tsx  # Action 设计器
│   ├── Academy.tsx         # 学习中心
│   ├── CaseBrowser.tsx     # 案例浏览器
│   ├── QualityPanel.tsx    # 质量检查面板
│   ├── SmartTips.tsx       # 智能提示
│   ├── FileUpload.tsx      # 文件上传（支持多模态）
│   ├── APISpecViewer.tsx   # OpenAPI 规范查看器
│   ├── ToolSpecViewer.tsx  # Agent Tool 查看器
│   └── ...
├── services/
│   └── aiService.ts        # AI 服务抽象层（多提供商）
├── content/
│   ├── cases/              # 案例库
│   │   ├── manufacturing-production.ts
│   │   ├── retail-inventory.ts
│   │   └── logistics-delivery.ts
│   └── lessons/            # 课程内容
│       ├── level1.ts
│       └── level2.ts
├── utils/
│   ├── apiGenerator.ts     # OpenAPI 生成器
│   ├── toolGenerator.ts    # Agent Tool 生成器
│   └── qualityChecker.ts   # 质量检查器
├── hooks/
│   └── useProgress.ts      # 学习进度管理
├── types.ts                # 类型定义
└── types/
    └── case.ts             # 案例类型定义
```

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

## 开发路线图

查看 [ITERATION_ROADMAP.md](./ITERATION_ROADMAP.md) 了解完整的开发历程：

- ✅ Phase 0: 基础增强 (v0.1 - v0.5)
- ✅ Phase 1: 培训模块 (v1.0 - v1.4)
- ✅ Phase 2: 执行增强 (v2.0 - v2.4)
- ✅ Phase 3: 联动机制 (v3.0 - v3.3)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**Built with AI-First Design Philosophy**

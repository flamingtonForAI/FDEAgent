# Ontology Architect

[English](#english) | [中文](#中文) | [Français](#français) | [日本語](#日本語)

---

## English

> AI-powered enterprise system design tool — from conversation to architecture in one workflow.

Ontology Architect helps users build intelligent operating systems through natural language conversation, following Palantir's "Ontology-First" methodology. It covers the full lifecycle from requirement discovery to deliverable export.

## Core Philosophy

**Ontology ≠ Knowledge Graph**

- Knowledge graphs are static (query only)
- Ontology is dynamic (executable)
- The key differentiator: **Actions** bridge natural language semantics to executable functions

**Decision-First Principle**

> If an Object or Action doesn't directly support a user's operational decision, it doesn't belong in the core Ontology.

## 5-Phase Design Workflow

```
Discover → Model → Integrate → AI Design → Deliver
```

| Phase | Purpose | Key Activities |
|-------|---------|---------------|
| 1. Discover | Requirement scouting | Conversational entity extraction, multi-modal document upload |
| 2. Model | Ontology modeling | Object/Action/Link definition, three-layer Action design |
| 3. Integrate | Data source mapping | External system connections, sync mechanism planning |
| 4. AI Design | AI enhancement | AI opportunity analysis, Agent Tool specification |
| 5. Deliver | Export & packaging | Quality gate, document generation, ZIP export |

## Key Capabilities

### Review Panel (Quality + Readiness)
- **Quality Check** — 16 rule-based validations covering objects, actions, links, integrations, architecture
- **Readiness Check** — Phase progress tracking, blocking issue detection, prioritized next actions
- Accessible from the chat bar; slides out as a side panel with tab switching

### Delivery Center (Phase 5)
- Design completeness overview (4-dimension stats: objects, actions, links, integrations)
- Dual export mode: internal draft vs. client delivery (with hard quality gates)
- One-click ZIP packaging: cover page, 5 technical documents, delivery metadata

### Industry Templates
- 11 pre-built archetypes: financial AML, smart manufacturing, healthcare FHIR, defense intelligence, etc.
- JSON import/export for sharing; one-click apply to current project
- Lazy-loaded data chunks (~600 KB total, loaded per-template on demand)

### Internationalization (i18n)
- 5 languages: English, Chinese, French, Spanish, Arabic
- 10 namespaces × 5 locales, 1,374 keys per language
- `useAppTranslation(ns)` hook with `t()` for UI text, `lt()` for data-layer `{en,cn}` objects

### Authentication & Cloud Sync
- Browse tutorials/templates without login; create/edit projects after sign-in
- JWT auth (access 15min + refresh 7 days) with Argon2id password hashing
- Offline-first localStorage with debounced cloud sync (Serializable isolation)

### Multi-Provider AI
- Supported providers: Google Gemini, OpenAI, OpenRouter, Zhipu GLM, Moonshot (Kimi), custom OpenAI-compatible
- Multi-modal: PDF, Office documents, images (provider-dependent capabilities)
- Methodology-driven system prompts (1000+ lines of Ontology-First guidance)

### Action Three-Layer Definition

```
┌─────────────────────────────────────────────────────────┐
│ Business:  Manager approves purchase orders over ¥100k  │
│ Logic:     Pre[status=pending AND amount>100000]        │
│            Params[order_id, decision, notes]            │
│            Post[status→approved/rejected]               │
│ Implement: POST /api/orders/{id}/approve                │
│            Tool: approve_purchase_order(order_id, ...)   │
└─────────────────────────────────────────────────────────┘
```

### Learning Center
- 4-level progressive curriculum with interactive exercises
- Real-world case library (manufacturing, retail, logistics)
- Achievement system with progress tracking

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19 + TypeScript + Vite (port 3000) |
| Styling | Tailwind CSS + Lucide Icons + CSS Variables theme system |
| State | React Context (Auth → Sync → Project provider hierarchy) |
| i18n | react-i18next (5 languages, 10 namespaces) |
| Storage | localStorage (offline-first) + cloud sync |
| Backend | Fastify 5 + Prisma + PostgreSQL |
| AI | Multi-provider abstraction (Gemini, OpenAI, OpenRouter, Zhipu, Moonshot, custom) |
| Testing | Playwright (E2E) + Vitest (unit) |
| Design | Plus Jakarta Sans + JetBrains Mono, Perfect Fourth (1.333) type scale |

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd ontology-assistant
npm install

# Start dev server
npm run dev
```

App runs at http://localhost:3000.

### Configure AI

1. Click **Settings** (gear icon) in the sidebar
2. Select provider → choose model → enter API key
3. Verify connection status

### Create First Project

1. New users see the **Quick Start** guide
2. Click **Create Project** → choose blank or from industry template
3. Start chatting to describe your business scenario

### Demo Account

```
Email: demo@example.com
Password: (enter in the app — not published in source)
```

## Project Structure

```
ontology-assistant/
├── App.tsx                        # Main app orchestration, Review panel, routing
├── pages/
│   ├── ScoutingPage.tsx           # Phase 1: Requirement discovery
│   ├── ModelingPage.tsx           # Phase 2: Ontology modeling
│   ├── IntegrationPage.tsx        # Phase 3: Data source integration
│   ├── AIEnhancementPage.tsx      # Phase 4: AI enhancement analysis
│   ├── DeliveryPage.tsx           # Phase 5: Export & packaging
│   ├── ProjectsPage.tsx           # Project management dashboard
│   └── QuickStartPage.tsx         # New user onboarding
├── components/
│   ├── GlobalChatBar.tsx          # Chat input with file upload & review button
│   ├── QualityPanel.tsx           # Quality check (rules + three-layer)
│   ├── ReadinessPanel.tsx         # Readiness check (progress + blockers + actions)
│   ├── StructuringWorkbench.tsx   # Object/Action/Link editing workspace
│   ├── OntologyVisualizer.tsx     # Ontology relationship graph
│   ├── ActionDesigner.tsx         # Three-layer Action editor
│   ├── DeliverableGenerator.tsx   # Document generation & ZIP export
│   ├── UnifiedSettings.tsx        # AI config, theme, language, data management
│   ├── ArchetypeBrowser.tsx       # Industry template browser
│   ├── Academy.tsx                # Learning center
│   ├── ChangeHistoryPanel.tsx     # Design change tracking
│   └── auth/                      # Login, register, user menu
├── contexts/
│   ├── AuthContext.tsx             # JWT auth state
│   ├── SyncContext.tsx             # Cloud sync state
│   └── ProjectContext.tsx          # Multi-project state, auto-save
├── services/
│   ├── aiService.ts               # Multi-provider AI abstraction (~1800 lines)
│   ├── aiAnalysisService.ts       # Phase 4 AI enhancement analysis
│   ├── archetypeGeneratorService.ts # Industry archetype generation with web search
│   ├── syncService.ts             # Cloud sync client
│   └── authService.ts             # Auth API client
├── lib/
│   ├── storage.ts                 # User-scoped localStorage + quota management
│   ├── i18n.ts                    # react-i18next configuration (5 languages)
│   ├── documentParser.ts          # Office document parsing (dynamic imports)
│   ├── jsonUtils.ts               # AI response JSON extraction (shared)
│   ├── apiKeyUtils.ts             # Provider API key resolution (shared)
│   ├── llmCapabilities.ts         # Model capability scoring & recommendations
│   ├── modelRegistry.ts           # Model discovery with caching
│   └── themes.ts                  # 10 themes (5 dark + 5 light)
├── hooks/
│   ├── useAppTranslation.ts       # i18n hook: t() for UI, lt() for data
│   ├── useModelRegistry.ts        # Model list with debounced refresh
│   └── useProjects.ts             # Project CRUD operations
├── utils/
│   ├── qualityChecker.ts          # 16-rule quality validation engine
│   ├── readinessChecker.ts        # Phase progress & blocker detection
│   ├── apiGenerator.ts            # OpenAPI spec generation from Actions
│   └── toolGenerator.ts           # Agent Tool spec (OpenAI/LangChain/Claude/MCP)
├── locales/
│   ├── en/                        # English (10 namespace JSON files)
│   ├── cn/                        # Chinese
│   ├── fr/                        # French
│   ├── es/                        # Spanish
│   └── ar/                        # Arabic
├── content/
│   ├── archetypes/                # 11 industry templates (lazy-loaded)
│   ├── cases/                     # Real-world case library
│   └── lessons/                   # Learning center curriculum
├── tests/
│   ├── e2e/                       # Playwright E2E tests
│   └── cardinality.test.ts        # Link normalization unit tests
├── backend/                       # Fastify + Prisma + PostgreSQL
│   ├── src/
│   │   ├── modules/               # Auth, projects, sync, preferences, archetypes
│   │   └── middleware/             # Helmet, CORS, CSRF, rate limiting
│   ├── prisma/                    # Database schema & migrations
│   └── tests/                     # Backend unit tests (Vitest)
├── types.ts                       # Core type definitions
├── types/archetype.ts             # Template type definitions
├── vite.config.ts                 # Build config with code-splitting
├── playwright.config.ts           # E2E test configuration
└── CHANGELOG.md                   # Version history & release notes
```

## Development

```bash
npm run dev              # Vite dev server (localhost:3000)
npm run build            # Production build
npm run check            # Full quality gate: tests + tsc + build + i18n check
npm run test:e2e         # Playwright E2E tests

# Backend (from backend/ directory)
cd backend
npm run dev              # Watch mode
npm run db:migrate       # Prisma migrations
npm run db:studio        # Prisma Studio GUI
```

## Versions & Changes

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and release notes.

---

## 中文

> AI 驱动的企业系统设计工具 — 从对话到架构，一站式完成。

Ontology Architect（本体架构师）帮助用户通过自然语言对话构建智能运营系统，遵循 Palantir 的"Ontology-First"方法论，覆盖从需求发现到交付物导出的完整生命周期。

### 核心理念

**本体 ≠ 知识图谱** — 知识图谱是静态的（只查询），本体是动态的（可执行）。关键差异在于：**Action（动作）** 将自然语言语义桥接到可执行函数。

**决策优先原则** — 如果一个对象或动作不直接支持用户的业务决策，就不属于核心本体。

### 五阶段设计流程

| 阶段 | 目标 | 核心活动 |
|------|------|---------|
| 1. 发现 | 需求探索 | 对话式实体提取，多模态文档上传 |
| 2. 建模 | 本体建模 | 对象/动作/关系定义，三层 Action 设计 |
| 3. 集成 | 数据源映射 | 外部系统连接，同步机制规划 |
| 4. AI 设计 | AI 增强 | AI 机会分析，Agent Tool 规范 |
| 5. 交付 | 导出打包 | 质量门禁，文档生成，ZIP 导出 |

### 主要能力

- **审阅面板** — 16 条规则质量检查 + 阶段就绪度检查（进度追踪、阻塞检测、优先行动建议）
- **交付中心** — 设计完整度概览，双模式导出（内部草稿 / 客户交付），一键 ZIP 打包
- **行业模板** — 11 个预置原型（金融 AML、智能制造、医疗 FHIR、国防情报等），JSON 导入导出
- **国际化** — 5 种语言（英文、中文、法语、西班牙语、阿拉伯语），10 命名空间 × 1,374 键/语言
- **多供应商 AI** — Google Gemini、OpenAI、OpenRouter、智谱 GLM、Moonshot、自定义兼容接口
- **认证与云同步** — JWT 认证 + Argon2id 密码哈希，离线优先 localStorage + 去抖云同步

### 快速开始

```bash
git clone <repository-url>
cd ontology-assistant
npm install
npm run dev
```

应用运行在 http://localhost:3000。进入 **设置**（齿轮图标）配置 AI 供应商和 API Key。

---

## Français

> Outil de conception de systèmes d'entreprise propulsé par l'IA — de la conversation à l'architecture en un seul workflow.

Ontology Architect aide les utilisateurs à construire des systèmes opérationnels intelligents par la conversation en langage naturel, en suivant la méthodologie « Ontology-First » de Palantir. Il couvre le cycle de vie complet, de la découverte des besoins à l'export des livrables.

### Philosophie

**Ontologie ≠ Graphe de connaissances** — Un graphe de connaissances est statique (lecture seule). Une ontologie est dynamique (exécutable). La différence clé : les **Actions** font le pont entre la sémantique du langage naturel et les fonctions exécutables.

**Principe Decision-First** — Si un objet ou une action ne soutient pas directement une décision opérationnelle, il n'a pas sa place dans l'ontologie.

### Workflow en 5 phases

| Phase | Objectif | Activités clés |
|-------|----------|---------------|
| 1. Découverte | Exploration des besoins | Extraction d'entités par conversation, import de documents multi-modaux |
| 2. Modélisation | Modélisation ontologique | Définition objets/actions/liens, conception Action en 3 couches |
| 3. Intégration | Mapping des sources de données | Connexions aux systèmes externes, planification de la synchronisation |
| 4. Conception IA | Enrichissement IA | Analyse des opportunités IA, spécification Agent Tool |
| 5. Livraison | Export et packaging | Contrôle qualité, génération de documents, export ZIP |

### Capacités principales

- **Panneau de revue** — 16 règles de validation qualité + vérification de maturité par phase
- **Centre de livraison** — Vue de complétude, double mode d'export (brouillon interne / livraison client), packaging ZIP en un clic
- **Templates industriels** — 11 archétypes pré-construits (AML financier, manufacturing, santé FHIR, défense, etc.)
- **Internationalisation** — 5 langues (anglais, chinois, français, espagnol, arabe), 1 374 clés par langue
- **IA multi-fournisseurs** — Google Gemini, OpenAI, OpenRouter, Zhipu GLM, Moonshot, interface compatible personnalisée
- **Authentification & sync cloud** — JWT + Argon2id, localStorage offline-first avec synchronisation cloud

### Démarrage rapide

```bash
git clone <repository-url>
cd ontology-assistant
npm install
npm run dev
```

L'application est accessible sur http://localhost:3000. Allez dans **Paramètres** (icône engrenage) pour configurer le fournisseur IA et la clé API.

---

## 日本語

> AI駆動のエンタープライズシステム設計ツール — 会話からアーキテクチャまで、ワンストップで完結。

Ontology Architectは、Palantirの「Ontology-First」方法論に基づき、自然言語での対話を通じてインテリジェントな業務システムの構築を支援します。要件の発見から成果物のエクスポートまで、ライフサイクル全体をカバーします。

### 基本思想

**オントロジー ≠ ナレッジグラフ** — ナレッジグラフは静的（クエリのみ）、オントロジーは動的（実行可能）。決定的な違いは、**Action（アクション）** が自然言語のセマンティクスと実行可能な関数を橋渡しする点です。

**Decision-First原則** — オブジェクトやアクションがユーザーの業務上の意思決定を直接支援しないなら、コアオントロジーに含めるべきではありません。

### 5フェーズ設計ワークフロー

| フェーズ | 目的 | 主な活動 |
|---------|------|---------|
| 1. ディスカバリー | 要件探索 | 対話によるエンティティ抽出、マルチモーダルドキュメントアップロード |
| 2. モデリング | オントロジー設計 | オブジェクト/アクション/リンク定義、3層アクション設計 |
| 3. インテグレーション | データソースマッピング | 外部システム接続、同期メカニズム設計 |
| 4. AI設計 | AI強化 | AI活用機会分析、Agent Toolスペック |
| 5. デリバリー | エクスポート＆パッケージ | 品質ゲート、ドキュメント生成、ZIPエクスポート |

### 主な機能

- **レビューパネル** — 16ルールの品質チェック + フェーズ準備状況チェック（進捗追跡、ブロッカー検出、優先アクション提案）
- **デリバリーセンター** — 設計完全性の概要、デュアルモードエクスポート（内部ドラフト/顧客納品）、ワンクリックZIPパッケージ
- **業界テンプレート** — 11種のプリセット（金融AML、スマート製造、医療FHIR、防衛インテリジェンスなど）
- **国際化（i18n）** — 5言語対応（英語、中国語、フランス語、スペイン語、アラビア語）、言語あたり1,374キー
- **マルチプロバイダーAI** — Google Gemini、OpenAI、OpenRouter、Zhipu GLM、Moonshot、カスタム互換インターフェース
- **認証＆クラウド同期** — JWT + Argon2idパスワードハッシュ、オフラインファーストlocalStorage + デバウンスクラウド同期

### クイックスタート

```bash
git clone <repository-url>
cd ontology-assistant
npm install
npm run dev
```

http://localhost:3000 でアプリが起動します。**設定**（歯車アイコン）からAIプロバイダーとAPIキーを設定してください。

---

## License

MIT License

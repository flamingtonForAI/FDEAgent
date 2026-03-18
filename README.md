# Ontology Architect

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
Password: Demo123!
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
├── GIT_CONVENTION.md              # Git commit & push standards
├── CHANGELOG.md                   # Version history & release notes
└── CLAUDE.md                      # Developer guide for Claude Code
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

## License

MIT License

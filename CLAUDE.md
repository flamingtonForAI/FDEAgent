# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ontology Architect** (本体架构师) is an AI-powered enterprise system design tool that helps users build intelligent operating systems through a 4-phase workflow: Discovery → Modeling → Integration → AI Enhancement. It follows Palantir's "Ontology-First" methodology.

## Development Commands

### Frontend (root directory)
```bash
npm run dev          # Vite dev server on localhost:3000
npm run build        # Production build (also serves as type-error-free check)
npm run check        # Full quality gate: cardinality tests + tsc --noEmit + build
npm run test:cardinality  # Unit tests for link normalization
```

### Backend (backend/ directory)
```bash
cd backend
npm run dev              # Watch mode with tsx
npm run build            # TypeScript compilation
npm run db:generate      # Prisma generate
npm run db:migrate       # Prisma migrate dev
npm run db:migrate:prod  # Prisma migrate deploy
npm run db:studio        # Prisma Studio GUI
npm run test             # Vitest
npm run lint             # ESLint
```

## Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite (port 3000, localhost-only)
- **Backend:** Fastify 5 + Prisma + PostgreSQL
- **AI:** Multi-provider abstraction (Gemini, OpenRouter, OpenAI, Zhipu, Moonshot, custom)
- **Testing:** Playwright (E2E), Vitest (backend unit)

### Provider Hierarchy (App.tsx)
```
AuthProvider → SyncProvider → ProjectProvider → AppContent
```

### 4-Phase Workflow
1. **DISCOVER (Phase 1):** Conversational requirement collection via GlobalChatBar
2. **MODEL (Phase 2):** Define Ontology via StructuringWorkbench, ObjectEditor, ActionDesigner
3. **INTEGRATE (Phase 3):** Map data sources to Ontology properties
4. **AI DESIGN (Phase 4):** AI analysis and enhancement points via AIAnalyzer/AIEnhancement

### Three-Layer Action Definition
Every Action must be defined across three layers:
- **Business Layer:** Natural language description, executor role, trigger condition
- **Logic Layer:** Preconditions, parameters, postconditions, side effects
- **Implementation Layer:** REST API endpoint or Agent Tool specification

## Critical Async Patterns (App.tsx)

### Ref-Based Project Switch Guard
`activeProjectIdRef` syncs every render. Async operations (like `triggerAutoDesign`) must capture the ref before `await` and compare after to prevent cross-project data pollution:
```typescript
const requestProjectId = activeProjectIdRef.current;  // capture before await
const result = await aiService.current.designOntology(...);
if (activeProjectIdRef.current !== requestProjectId) return;  // guard after await
```

### Functional Update for State Writes
Always use `setProject(prev => ({ ...prev, ... }))` instead of `setProject({ ...project, ... })` in callbacks. `setCurrentOntology` rebuilds when `isAuthenticated` changes, which causes stale closures if captured in `useCallback` without proper deps.

### Clear Stale Analysis on Ontology Regeneration
When ontology is regenerated or an archetype is applied, the AI analysis result must be explicitly cleared from both state and storage:
```typescript
setAiAnalysisResult(null);
if (pid) storage.saveAnalysisResultById(pid, null);
```

### Project Switching Lock (ProjectContext.tsx)
`switchProject()` uses `switchingLockRef` + `isSwitchingRef` to prevent concurrent switches and skip debounced auto-saves during the switch.

## State Management & Persistence

### Storage Architecture (lib/storage.ts)
- **User-scoped keys:** `u:{userId}:project:{projectId}:state` — prevents cross-user data leakage
- **Anonymous scope:** `{sessionId}:key` for unauthenticated browsing
- **Offline-first:** localStorage writes are immediate; cloud sync is debounced 2s
- **Auto-save:** ProjectContext debounces ontology and chat saves by 500ms, skipped during project switching
- **Quota management:** Max 200 messages/project, 4000 chars/message; auto-clears old data on `QuotaExceededError`

### Auth Guards
`setCurrentOntology` and `setChatMessages` in ProjectContext silently discard writes when `isAuthenticated === false`. This is intentional — but means any callback capturing these setters before login will hold a no-op version. Use `setProject` (which wraps `setCurrentOntology`) and ensure it's in useCallback deps.

## AI Service (services/aiService.ts)

Multi-provider abstraction with 1000+ lines of methodology-driven system prompts.

### Key Methods
- **`chat(history, message)`** — Stateless conversational AI
- **`chatWithFiles(history, message, files)`** — Multimodal with attachments (text extraction fallback for non-Gemini)
- **`designOntology(chatHistory)`** — Returns JSON with objects/links/integrations; uses `extractJSON()` to strip markdown fences
- **`fetchAvailableModels(signal?)`** — Provider-specific model discovery with prioritization
- **`testConnection()`** — API key validation

### Shared Utilities (extracted from services)
- **`lib/jsonUtils.ts`** — `extractJSON(text)`: strips markdown fences / extracts first `{...}` block from AI responses. Used by aiService, aiAnalysisService, archetypeGeneratorService.
- **`lib/apiKeyUtils.ts`** — `getProviderApiKey(settings)` / `requireProviderApiKey(settings)`: resolves the API key for `settings.provider` from the per-provider `apiKeys` map, falling back to legacy `apiKey`. Used by all 3 AI services. **All services must use these helpers** — never access `settings.apiKey` directly.

### Provider Differences
| Provider | Office Files | JSON Mode |
|----------|-------------|-----------|
| Gemini | Native File API | `responseMimeType: 'application/json'` |
| OpenAI/OpenRouter/Zhipu/Moonshot/Custom | Client-side `extractedText` | `response_format: { type: 'json_object' }` (may not work on all models → `extractJSON()` as fallback) |

### Document Parsing (lib/documentParser.ts)
Office document libraries (mammoth, xlsx, jszip) are **dynamically imported** inside parse functions to keep the main bundle lean. Vite automatically code-splits each into its own chunk loaded on demand.

## File Compatibility Feedback (Two-Layer Design)
- **`lib/llmCapabilities.ts`** — Model capability declarations. Used for recommendation scores and UI labels. **Do not modify for upload warnings.**
- **`components/FileUpload.tsx` → `getProviderCompatibility()`** — Actual processing method per file type. Upload warnings derive solely from this function.

## Key Patterns

### Bilingual Support
All UI text requires both `cn` and `en` translations in component translation objects. The `lang` state in App.tsx drives language selection.

### Archetype System
Industry archetypes in `content/archetypes/` follow the `Archetype` type from `types/archetype.ts`. Can be exported as JSON, imported via UI (stored in IndexedDB), and pre-exported in `public/archetypes/`.

### Quality Checker
`utils/qualityChecker.ts` implements 16 validation rules. Client delivery mode enforces hard gates: `error`-level issues and incomplete Action three-layer definitions block export.

## Type System

Core types in `types.ts` and `types/archetype.ts`:
- `OntologyObject` — Business entity with properties and actions
- `OntologyLink` — Relationship between objects
- `Action` — Three-layer action definition
- `ProjectState` — Full ontology state (objects, links, integrations, status)
- `Archetype` — Complete industry solution template

## Backend

Independent Node.js app in `backend/`:
- **Auth:** JWT (access 15min + refresh 7 days) + Argon2id password hashing
- **Security:** Helmet headers, CORS, CSRF (Origin validation), rate limiting
- **Sync:** `POST /api/sync` uses Serializable isolation level transactions; returns local→cloud ID mappings
- **Ownership:** All project operations verify `userId` match before read/write
- **Validation:** Zod schemas on all inputs

### API Routes
- `POST /api/auth/{register,login,refresh,logout}`, `GET /api/auth/me`
- `GET/POST /api/projects/*` — CRUD with ownership verification
- `POST /api/sync` — Batch sync, `GET /api/sync/full` — Full state pull
- `POST /api/preferences/*`, `GET/POST /api/archetypes/*`

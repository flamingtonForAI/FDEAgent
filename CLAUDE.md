# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ontology Architect** (本体架构师) is an AI-powered enterprise system design tool that helps users build intelligent operating systems through a 4-phase workflow: Discovery → Modeling → Integration → AI Enhancement. It follows Palantir's "Ontology-First" methodology.

## Development Commands

### Frontend (root directory)
```bash
npm run dev      # Start Vite dev server on localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend (backend/ directory)
```bash
cd backend
npm run dev           # Watch mode with tsx
npm run build         # TypeScript compilation
npm run db:generate   # Prisma schema generation
npm run db:migrate    # Run Prisma migrations
npm run test          # Run Vitest tests
npm run lint          # ESLint
```

## Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Fastify + Prisma + PostgreSQL
- **AI:** Multi-provider abstraction (Gemini, OpenRouter, OpenAI, Zhipu, Moonshot)
- **Testing:** Playwright (E2E), Vitest (unit)

### 4-Phase Workflow (Core Design Pattern)
1. **DISCOVER (Phase 1):** Conversational requirement collection, extract Objects & Actions
2. **MODEL (Phase 2):** Define Ontology with three-layer Action definitions
3. **INTEGRATE (Phase 3):** Map data sources to Ontology properties
4. **AI DESIGN (Phase 4):** Design AI enhancement points and Agent Tools

### Three-Layer Action Definition (Critical Pattern)
Every Action must be defined across three layers:
- **Business Layer:** Natural language description, executor role, trigger condition
- **Logic Layer:** Preconditions, parameters, postconditions, side effects
- **Implementation Layer:** REST API endpoint or Agent Tool specification

### Key Directories
- `components/` - React UI components (50+)
- `services/` - Business logic & AI integration (aiService.ts is central)
- `lib/` - Utilities (storage.ts for hybrid localStorage + cloud sync)
- `utils/` - Code generators (apiGenerator.ts, toolGenerator.ts, qualityChecker.ts)
- `content/archetypes/` - 11 industry solution templates (can export/import as JSON)
- `content/cases/` - Reference case studies
- `content/lessons/` - 4-level training curriculum
- `contexts/` - React Context (AuthContext, SyncContext)
- `backend/src/modules/` - API route handlers

### State Management
- **Local state:** React hooks
- **Global state:** React Context (Auth, Sync)
- **Persistence:** Hybrid storage - localStorage (immediate) + cloud sync (debounced 2s)
- **Offline-first:** Works offline, syncs when authenticated

### AI Service Architecture
`services/aiService.ts` provides multi-provider abstraction:
- Contains 1000+ lines of methodology-driven system prompts
- Supports file attachments (PDF, Excel, PPT, images)
- All AI requests go through this abstraction layer

## Key Patterns

### Decision-First Principle
Every Object/Action must directly support user operational decisions. Always ask: "What decision will the user make with this information?"

### Bilingual Support
All UI text requires both `cn` (Chinese) and `en` (English) translations in component translation objects.

### Archetype System
Industry archetypes in `content/archetypes/` follow the `Archetype` type from `types/archetype.ts`. They can be:
- Exported as JSON via UI button
- Imported via "导入 JSON" button (stored in IndexedDB)
- Pre-exported files available in `public/archetypes/`

### Quality Checker
`utils/qualityChecker.ts` implements 16 validation rules for design completeness (min Objects, three-layer definitions, proper Links, etc.)

## Type System

Core types are in `types.ts` and `types/archetype.ts`. Key interfaces:
- `OntologyObject` - Business entity with properties and actions
- `OntologyLink` - Relationship between objects
- `Action` - Three-layer action definition
- `Archetype` - Complete industry solution template

## Backend

Independent Node.js application in `backend/` with:
- Fastify 5 framework
- JWT + Argon2id authentication
- Prisma ORM with PostgreSQL
- Zod validation for all inputs

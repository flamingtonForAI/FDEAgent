# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Phase 3 Integration Workbench** — upgraded from read-only display to full editing workbench
  - `IntegrationEditor` modal — create/edit/delete integrations with system name, target object, mechanism, direction, sync policy (mode/frequency/conflict strategy/retry), and data points
  - `FieldMappingTable` — manual field-level mapping editor with source→target property dropdown, transform type, required toggle; unresolved property detection with warning highlight
  - `SystemMap` rewrite — clickable integration cards with edit-on-hover, direction/frequency badges, mapping completeness badge (`N/M mapped`); replaced hardcoded TechCard decorations with live stats bar (total/realtime/batch/unconfigured)
  - `lib/integrationNormalizer.ts` — normalize/denormalize layer bridging legacy field names (`systemName` vs `sourceSystem` vs `name`, `type` vs `mechanism`, top-level `frequency` vs `syncPolicy.frequency`); `computeIntegrationStats()` helper; `WeakMap`-based stable ID generation for legacy integrations without `id`
  - `setProject` pipeline — threaded through `App.tsx` → `IntegrationPage` → `SystemIntegration` → `SystemMap`, enabling Phase 3 to write back to project state
- **Integration locale keys** — ~40 new keys (editor, fieldMapping, stats sections) added to all 5 languages (en/cn/fr/es/ar)

### Changed
- **`ExternalIntegration` type expanded** — added optional `direction`, `syncPolicy` (mode/frequency/retryPolicy/conflictStrategy), `fieldMappings` fields; backward-compatible with existing data
- **`FieldMapping` type added** — sourceField, targetPropertyName, targetPropertyId (reserved), transform, transformNote, required
- **Backend `integrationSchema` relaxed** — `mechanism` and `targetObjectId` changed from required to `.optional()` in `projects.schema.ts` (already optional in `sync.schema.ts`); allows saving incomplete integrations during incremental design
- **Legacy frequency inference** — `inferModeFromFrequency()` maps old `frequency` values to `syncPolicy.mode`: `realtime`/`streaming`/`live` → `realtime`, `event`/`cdc`/`webhook` → `event-driven`, `on-demand`/`manual`/`ad-hoc` → `manual`, `hourly`/`daily`/`weekly` → `batch`; prevents legacy data from being uniformly misclassified as batch
- **Arabic language visibility** — changed from `hidden` to `beta` in `lib/i18n.ts`; Arabic now appears in UI language selector
- **AI language enforcement strengthened** — `buildLanguageHint()` in `aiService.ts` now uses explicit `MUST respond entirely in ${language}` instruction instead of soft `Please respond in that language`; new `preserveTerms` mode for `designOntology()` keeps technical identifiers (object/property names, API paths) in original language while writing descriptions in user's language
- **AI analysis Chinese output** — `aiAnalysisService.ts` ANALYSIS_PROMPT Chinese branch now includes explicit instruction requiring all output fields (title, description, rationale, implementation, insights) in Chinese, even when input ontology data is in English

### Fixed
- **Phase 3 had no write capability** — `IntegrationPage` did not receive `setProject`, making the entire phase read-only
- **Legacy integrations with `frequency: 'realtime'` misclassified as batch** — stats bar and card display showed incorrect sync mode for archetype-imported data
- **Legacy `on-demand`/`manual` frequency misclassified as batch** — now correctly inferred as `manual` mode
- **Unstable React keys for legacy integrations** — integrations without `id` generated new keys on every render via `Date.now()`, causing card remount flicker; fixed with `WeakMap`-cached stable IDs
- **Incomplete integration breaks cloud sync** — frontend allowed saving without `targetObjectId`/`mechanism` but backend `projects.schema.ts` required them; schema relaxed to `.optional()` + editor shows warning for unconfigured integrations
- **AI analysis outputs English when UI is set to Chinese** — AI models followed the language of English ontology input data instead of respecting user's language preference; fixed with stronger prompt instructions

### Added
- **Multi-language (i18n) support** — react-i18next integration with 5 languages (cn/en available, fr/es/ar beta). 10 namespaces across 50 locale JSON files, lazy-loaded via Vite `import.meta.glob` as separate chunks
- **Translation completeness check** — `scripts/check-translations.mjs` reports per-language key coverage; integrated into `npm run check` pipeline (`npm run check:i18n`)
- **AI language preference** — `chat()`, `chatWithFiles()`, `designOntology()` accept optional `{ lang }` to append a language preference hint to AI prompts
- **Language visibility controls** — `lib/i18n.ts` exports `availableLanguages` (visible in UI selector) and `allLanguages` (includes hidden languages); status-based gating (available/beta/hidden)
- **`useAppTranslation` hook** — bridge hook wrapping `useTranslation()` with loose key typing and `lang` accessor for data-access patterns

### Changed
- **Language type expanded** — `Language` type in `types.ts` is now `'en' | 'cn' | 'fr' | 'ar' | 'es'`
- **Inline translations removed** — all 48 component `translations` objects extracted to `locales/{lang}/{namespace}.json`; `t.xxx` property access replaced with `t('key')` function calls throughout; 40+ components migrated from inline ternaries to `t()` calls
- **`lang` prop drilling eliminated** — UI components no longer accept `lang` as a prop; language is derived internally via `useAppTranslation()` hook. Service boundaries (aiService, readinessChecker, document generators) retain explicit `lang` parameter
- **Real French & Spanish translations** — all 10 namespaces (1,246 keys each) translated into proper French and Spanish; Arabic uses English fallback pending RTL (Phase 4)
- **Multimodal chat language preference** — `chatWithFiles()` now passes language hint through all multimodal paths (Gemini, OpenAI, Zhipu) via `buildLanguageHint()`
- **Multilingual archetype search** — `searchArchetypes()` accepts `lang` parameter and matches current-language resolved text via `lt()`
- **Arabic font fallback** — `--font-sans` CSS variable updated with `'Noto Sans Arabic'` in the fallback stack
- **Main bundle reduced** — 852 KB → 822 KB (inline translation objects removed, locale JSON lazy-loaded)

### Added
- **Production bundle code-splitting** — React.lazy + Suspense for 4 infrequently-visited pages (Academy, Archetypes, AI Enhancement, Delivery); main chunk reduced from ~1530 KB to ~799 KB (48% reduction)
- **Lazy archetype loading** — 11 archetype data files (~600 KB) converted from static imports to dynamic `import()` with per-archetype chunks; index metadata derived at runtime from real data (single-source-of-truth, eliminates hand-maintained index drift)
- **Vendor chunk splitting** — `manualChunks` in `vite.config.ts` separates `react`/`react-dom` and `lucide-react` into dedicated cacheable chunks
- **E2E regression tests** — Playwright test suite (`tests/e2e/archetype-lazy-load.spec.ts`) covering: template list stats verification, archetype detail lazy-loading, and create-from-template dialog flow

### Fixed
- **Archetype incomplete index cached permanently (P1)** — if any archetype chunk failed to load (e.g. network flicker), the filtered-out index was permanently cached for the session; now failed IDs are tracked and retried on next access, self-healing without page reload
- **Stale ontology summary injected into chat (P2)** — `designGenerationIdRef` was incremented after generation success, leaving a window where a prior run's async summary could still be appended; now incremented at `triggerAutoDesign()` entry so concurrent re-generations immediately invalidate prior summaries

### Added
- **Markdown rendering in chat**: AI assistant messages now render Markdown (headings, bold, italic, code blocks, inline code, lists, links) instead of plain text; user messages remain plain text
- **`MarkdownRenderer` component**: Lightweight built-in Markdown-to-React parser (`components/MarkdownRenderer.tsx`) — no external library dependency

### Fixed
- **Project card alignment**: Cards on the Project Dashboard now have equal height with footers aligned at the bottom, regardless of description length (`flex flex-col` + `mt-auto`)
- **Code block styling**: Chat code blocks use design-system tokens (`--color-bg-elevated`, `--color-border`) instead of hard-coded `rgba(0,0,0,0.3)`, improving visual consistency and theme support

### Changed
- **Typography**: Switched from Inter to Plus Jakarta Sans; applied Perfect Fourth (1.333) modular type scale with `clamp()` fluid sizing
- **Theme system**: Added `data-theme-mode` attribute on root element for clean light/dark CSS selectors; reduced all theme `shadowGlow` values
- **Button styles**: Replaced gradient glow hover effects with subtle `accent-light` background + natural shadow
- **Easing**: All transitions now use `ease-out-quart` (`cubic-bezier(0.25, 1, 0.5, 1)`) instead of generic `ease`
- **Color palette**: Warm-tinted neutrals replace pure grays for text and borders; hardcoded `rgba()` values replaced with CSS variable tokens
- **Phase 4 icon**: Changed from `Sparkles` to `BrainCircuit` (lucide-react)
- **Sidebar**: Enhanced login button styling, increased NavItem disabled opacity to 50%, refined settings status dot and model name display
- **Quality FAB**: Reduced size from `w-14 h-14` to `w-12 h-12`, removed redundant tooltip div, added `aria-label`

### Added
- CSS utility classes: `prose-width`, `content-width`, `section-gap`, `group-gap`
- `data-theme-mode` attribute for theme-aware CSS targeting
- Fluid typography with `clamp()` for responsive text sizing
- `font-kerning: normal` and `font-variant-numeric: tabular-nums` on body

### Fixed
- **LessonViewer crashes**: Added handlers for all unhandled diagram/example variants:
  - `phases` diagram type (FDE methodology lesson)
  - ASCII art diagrams (capability matrices, governance architecture)
  - `yaml` example type (YAML spec code blocks)
  - `flow` example type (step-by-step lists)
  - `stateMachine` example type (states + transitions)
- Light theme CSS overrides refactored from fragile `html[style*="color-scheme: light"]` to `[data-theme-mode="light"]`

### Added
- `lib/jsonUtils.ts` — shared `extractJSON()` utility extracted from 3 services (aiService, aiAnalysisService, archetypeGeneratorService); single source of truth for stripping markdown fences from AI JSON responses
- `lib/apiKeyUtils.ts` — shared `getProviderApiKey()` / `requireProviderApiKey()` utility extracted from aiService + aiAnalysisService; provides consistent per-provider API key resolution with legacy `apiKey` fallback

### Changed
- `lib/documentParser.ts` — mammoth, xlsx, jszip converted from static `import` to dynamic `await import()` inside parse functions; Vite now code-splits each library into its own chunk, removing ~2 MB from the main bundle
- `services/aiService.ts` — private `extractJSON()`, `getApiKey()`, `requireApiKey()` replaced with shared `lib/jsonUtils` and `lib/apiKeyUtils` imports
- `services/aiAnalysisService.ts` — same: private `extractJSON()`, `getApiKey()`, `requireApiKey()` replaced with shared utilities
- `services/archetypeGeneratorService.ts` — private `extractJSON()` replaced with shared utility; 4 occurrences of raw `this.settings.apiKey` replaced with `requireProviderApiKey(this.settings)`, fixing missing provider key isolation in this service

### Removed
- `components/Settings.tsx` — deprecated, zero references; fully replaced by `UnifiedSettings.tsx`
- `components/ChatInterface.tsx` — deprecated, zero references; fully replaced by `GlobalChatBar.tsx`

### Fixed
- Ontology generation stats showing all zeros after clicking "生成 Ontology":
  - Root cause: `handleDesignComplete` captured a stale `setCurrentOntology` reference (created before authentication) due to missing `useCallback` dependencies — the auth guard inside the setter silently discarded the update while `setActiveTab('ontology')` succeeded, making the page switch but stats stay at 0
  - Merged `handleDesignComplete` into `triggerAutoDesign`; replaced `setCurrentOntology({...project, ...})` with `setProject(prev => ({...prev, ...}))` functional update to avoid stale closure over both the setter and project state
  - Added `activeProjectIdRef` (synced every render) with pre/post-await comparison to prevent cross-project data pollution when the user switches projects during an in-flight AI design request
  - Removed debug `console.log` statements from `triggerAutoDesign`
- AI Enhancement tab showing stale results from a previous ontology after regeneration:
  - `triggerAutoDesign` now clears both in-memory `aiAnalysisResult` and persisted storage on new ontology generation, matching the existing pattern used by archetype apply
- AI responses wrapped in markdown code fences failing to parse as JSON:
  - JSON fence stripping now handled by shared `lib/jsonUtils.ts` (`extractJSON()`), applied to Gemini and OpenAI-compatible return paths across aiService, aiAnalysisService, and archetypeGeneratorService

### Added
- Office document support across all AI providers (docx, xlsx, pptx):
  - New `lib/documentParser.ts` module for client-side text extraction
  - `parseDocx` via mammoth, `parseXlsx` via SheetJS, `parsePptx` via JSZip XML extraction
  - Dual-channel design: native API for supported providers + extractedText fallback for others
- Provider-specific Office file handling:
  - Gemini: File API upload (`ai.files.upload()` → `fileData` URI), with extractedText fallback on failure
  - OpenRouter / OpenAI: client-side `extractedText` preferred for Office files (OpenRouter model support varies; Gemini rejects docx MIME); direct OpenAI falls back to `type:'file'` only when `extractedText` is unavailable; PDF uses `type:'file'` natively on both
  - Zhipu / Moonshot / Custom: client-side extracted text as text attachment
- `UploadedFile` and `FileAttachment` interfaces extended with `extractedText` field
- Word document branch in `getFileTypeConfig` (previously fell through to Default)
- New dependencies: `mammoth` (docx), `xlsx` (spreadsheets), `jszip` (pptx ZIP extraction)

### Changed
- Office file upload no longer hard-blocks (`blockSend: false`); all providers now have some level of support
- Office compatibility warnings updated to reflect actual provider capability (native API vs text extraction)
- `callGeminiMultimodal`: Office files use File API instead of unreliable `inlineData`
- `callOpenAIMultimodal`: simplified provider branching — Office files always prefer client-side `extractedText`; PDF uses `type:'file'` on OpenRouter and OpenAI; direct OpenAI falls back to `type:'file'` for Office only when `extractedText` is unavailable
- `callZhipuMultimodal`: Office files use `extractedText` instead of placeholder message

### Previously Added
- Delivery export mode switch in `DeliverableGenerator`:
  - `Internal Draft`
  - `Client Delivery`
- Hard delivery gate in client mode:
  - blocks export when `runQualityCheck(project)` has any `error` issue
  - blocks export when any action three-layer status is `minimal`
- Delivery package metadata form:
  - client name
  - designer name
  - delivery version
  - release notes
- Required metadata check in `Client Delivery` mode:
  - client name required
  - designer name required
- One-click ZIP package export (frontend-only, zero-dependency ZIP implementation):
  - `00-cover.md` (client mode only)
  - `01-api-spec.yaml`
  - `02-data-model.md`
  - `03-agent-tools.json`
  - `04-brd.md`
  - `05-integration-guide.md`
  - `delivery-metadata.json`
- New centralized model capability map in `lib/llmCapabilities.ts` for consistent UI and file-compatibility behavior.
- Dynamic model registry system:
  - `lib/modelRegistry.ts` with memory + sessionStorage cache
  - cache key uses SHA-256 hash of API key prefix (no plain key stored)
  - provider-level TTL (OpenRouter 30m, others 10m)
- `hooks/useModelRegistry.ts`:
  - auto-refresh on provider/API key change (800ms debounce)
  - request cancellation via `AbortController`
  - fallback state exposed for no-key mode
- Test connection button in `UnifiedSettings`:
  - reuses `AIService.testConnection()` with a temporary service instance carrying the latest key
  - disabled when no API key or test in progress
  - shows success (green) with model response preview, or failure (red) with error message
- Confirm / Cancel footer buttons in `UnifiedSettings`:
  - Confirm flushes pending API key changes then closes the panel
  - Cancel closes without persisting un-blurred key edits

### Changed
- README updated to include:
  - delivery gate behavior
  - delivery packaging capability
- ZIP packaging behavior updated:
  - draft mode includes no cover page
  - draft mode still has ZIP download entry
- Object URL cleanup in downloads now uses delayed revoke (`setTimeout`) to avoid browser async download race issues.
- YAML export serialization switched from custom formatter to `yaml` package (`YAML.stringify`) for better compatibility with special characters.
- Chat send UX after file upload improved in `GlobalChatBar`:
  - send button now disabled when uploaded files are provider-blocked
  - blocking reason is shown inline near the input area
  - per-file compatibility warning is shown in uploaded file list
- Model configuration warning added:
  - `UnifiedSettings` now shows Office compatibility warning when selected provider/model may block `.docx/.xlsx/.pptx`.
- Model selection UX upgrades in `UnifiedSettings`:
  - searchable model list (name/ID keyword)
  - recommended Office-capable latest models highlighted with `★` + bold + `Recommended`
  - per-model capability tags (`Office`, `PDF`) and selected-model capability summary (`Office/PDF/Image`)
- `UnifiedSettings` model panel upgraded:
  - real-time model list fetch + manual refresh
  - quick filters (`Recommended` / `Vision` / `Office` / `Long Context`)
  - OpenRouter default collapsed view (recommended + search matches)
- `AIService.fetchAvailableModels()` now returns enriched model metadata when available:
  - modalities, context length, tools support, structured-output support, pricing

### Fixed
- API key not persisted when user closes settings without blurring input field:
  - added `flushApiKey()` that syncs `localApiKey` → `aiSettings` on close/confirm
  - X close button and confirm button both call `flushApiKey()` before closing
- `loadAISettingsAsync` in `App.tsx` now checks `apiKeys[provider]` (not just `apiKey`) to decide whether to apply loaded config, fixing cases where multi-provider keys were silently discarded on startup.
- Provider key isolation: `aiService.getApiKey()`, `App.tsx` `activeProviderApiKey`, and `UnifiedSettings` `currentProviderKey` no longer fall back to the generic `apiKey` field when `apiKeys` map exists — prevents cross-provider key leakage on provider switch.
- File compatibility rules aligned with current multimodal implementation:
  - Gemini provider now treated as Office/PDF supported for uploads
  - Office blocking warnings now explicitly guide users to Gemini models
- Unified capability source:
  - `FileUpload` compatibility checks now reuse `llmCapabilities` logic
  - fixed prior over-permissive assumption where image support was effectively treated as universal
- Multi-provider API key isolation closed-loop (code review P1/P2):
  - `flushApiKey` and `handleProviderChange` now explicitly clear legacy `apiKey` field (`apiKey: ''`) on every write — eliminates the stale global key that caused cross-provider 401 errors
  - `loadAISettingsAsync` (App.tsx) replaced `apiKeys?.[provider] || apiKey` with `apiKeys`-existence check (`Object.values(apiKeys).some(...)`) — prevents legacy `apiKey` from leaking as fallback for a different provider
  - `handleProviderChange` flushes current provider key before switching, preventing loss of un-blurred input
  - `loadLocalConfig` checks `apiKeys` map (not just legacy `apiKey`) when deciding whether to apply saved config
- Template import connector mapping in `NewProjectDialog`:
  - connector-to-integration mapping now supports both Pattern A (`sourceSystem`, `mappedObjects`, `sync`) and Pattern B (`name`, `targetObjects`, `syncFrequency`, `configuration`) — previously only Pattern A was handled, causing empty integration names and "Unknown Object" for templates like healthcare-fhir
  - uses `flatMap` to correctly flatten one-to-many connector→target relationships
  - same dual-pattern logic also applied in `handleApplyArchetype` (App.tsx) for ArchetypeBrowser imports
- Template import object normalization in `NewProjectDialog`:
  - objects loaded from archetypes are now normalized with default empty arrays (`actions`, `properties`, `aiFeatures`) — previously raw archetype objects with missing optional fields caused `TypeError: Cannot read properties of undefined (reading 'length')` across multiple pages
- Defensive null guards on `obj.actions`, `obj.properties`, `obj.aiFeatures` across 7 files:
  - `OntologyVisualizer`, `AIPLogicMatrix`, `ProjectOverview`, `ToolSpecViewer`, `StructuringWorkbench`, `DeliverableGenerator`, `aiAnalysisService` — prevents crashes when objects have undefined optional array fields
- AI Analysis state lost on tab switch:
  - `isAnalyzing` and `error` states lifted from local `AIAnalyzer` state to App.tsx level — previously, switching tabs during analysis unmounted the component, losing the loading spinner and error state; the user would see "Ready to Analyze" with no indication that analysis was still running in the background
  - `hasApiKey` check in `AIAnalyzer` now also checks `apiKeys[provider]` map (not just legacy `apiKey` field), consistent with multi-provider key isolation
- AI analysis result persistence across page refresh and project switch:
  - new `storage.getAnalysisResultById()` / `storage.saveAnalysisResultById()` in `lib/storage.ts` with per-project key (`u:{userId}:project:{projectId}:analysis`)
  - auto-save on analysis completion, auto-load on project switch, auto-clear on archetype import
  - analysis data cleaned up on project deletion

## [0.4.1] - 2026-02-26

### Added
- Project rename capability in project cards.
- Login/session isolation hardening:
  - register flow now persists `ontology-auth-session`
  - auth change listener clears stale session when unauthenticated

### Changed
- Authentication behavior aligned to product decision:
  - unauthenticated users can browse tutorials/templates/cases
  - project creation remains login-required
- Project write operations guarded in context layer:
  - create/switch/delete/update blocked without authentication

### Fixed
- Resolved "project not saved after creation" caused by missing auth session persistence in register flow.
- README version badge and release notes synchronized to `0.4.1`.

### Commits
- `99f5728` fix: enforce auth on project writes and add project rename
- `dedc036` docs: update README version to 0.4.1

## [0.4.0]

See `CHANGE_NOTES.md` for earlier architecture/security details. See `RELEASE_NOTES_v0.4.1.md` for cumulative release notes covering 0.4.0+.
